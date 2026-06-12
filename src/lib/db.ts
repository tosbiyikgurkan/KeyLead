import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "portfolio.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sector TEXT NOT NULL,
      city TEXT,
      district TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      latitude REAL,
      longitude REAL,
      project_name TEXT,
      project_location TEXT,
      project_notes TEXT,
      source TEXT,
      external_id TEXT UNIQUE,
      status TEXT DEFAULT 'potential',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_customers_sector ON customers(sector);
    CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
  `);
}

export interface Customer {
  id: number;
  name: string;
  sector: string;
  city: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  project_name: string | null;
  project_location: string | null;
  project_notes: string | null;
  source: string | null;
  external_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  sector: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  project_name?: string;
  project_location?: string;
  project_notes?: string;
  source?: string;
  external_id?: string;
  status?: string;
}

export function getAllCustomers(filters?: {
  sector?: string;
  city?: string;
  status?: string;
}): Customer[] {
  const database = getDb();
  let query = "SELECT * FROM customers WHERE 1=1";
  const params: string[] = [];

  if (filters?.sector) {
    query += " AND sector = ?";
    params.push(filters.sector);
  }
  if (filters?.city) {
    query += " AND city = ?";
    params.push(filters.city);
  }
  if (filters?.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  query += " ORDER BY updated_at DESC";
  return database.prepare(query).all(...params) as Customer[];
}

export function getCustomerById(id: number): Customer | undefined {
  const database = getDb();
  return database.prepare("SELECT * FROM customers WHERE id = ?").get(id) as
    | Customer
    | undefined;
}

export function createCustomer(input: CustomerInput): Customer {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO customers (
      name, sector, city, district, address, phone, email, website,
      latitude, longitude, project_name, project_location, project_notes,
      source, external_id, status
    ) VALUES (
      @name, @sector, @city, @district, @address, @phone, @email, @website,
      @latitude, @longitude, @project_name, @project_location, @project_notes,
      @source, @external_id, @status
    )
  `);

  const result = stmt.run({
    name: input.name,
    sector: input.sector,
    city: input.city ?? null,
    district: input.district ?? null,
    address: input.address ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    website: input.website ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    project_name: input.project_name ?? null,
    project_location: input.project_location ?? null,
    project_notes: input.project_notes ?? null,
    source: input.source ?? null,
    external_id: input.external_id ?? null,
    status: input.status ?? "potential",
  });

  return getCustomerById(result.lastInsertRowid as number)!;
}

export function upsertCustomer(input: CustomerInput): Customer {
  const database = getDb();
  if (input.external_id) {
    const existing = database
      .prepare("SELECT id FROM customers WHERE external_id = ?")
      .get(input.external_id) as { id: number } | undefined;

    if (existing) {
      updateCustomer(existing.id, input);
      return getCustomerById(existing.id)!;
    }
  }
  return createCustomer(input);
}

export function updateCustomer(
  id: number,
  input: Partial<CustomerInput>
): Customer | undefined {
  const database = getDb();
  const existing = getCustomerById(id);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  const allowed = [
    "name", "sector", "city", "district", "address", "phone", "email",
    "website", "latitude", "longitude", "project_name", "project_location",
    "project_notes", "source", "status",
  ] as const;

  for (const key of allowed) {
    if (input[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = input[key];
    }
  }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  database
    .prepare(`UPDATE customers SET ${fields.join(", ")} WHERE id = @id`)
    .run(params);

  return getCustomerById(id);
}

export function deleteCustomer(id: number): boolean {
  const database = getDb();
  const result = database.prepare("DELETE FROM customers WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getStats() {
  const database = getDb();
  const total = (
    database.prepare("SELECT COUNT(*) as count FROM customers").get() as {
      count: number;
    }
  ).count;

  const byStatus = database
    .prepare(
      "SELECT status, COUNT(*) as count FROM customers GROUP BY status"
    )
    .all() as { status: string; count: number }[];

  const bySector = database
    .prepare(
      "SELECT sector, COUNT(*) as count FROM customers GROUP BY sector ORDER BY count DESC LIMIT 5"
    )
    .all() as { sector: string; count: number }[];

  return { total, byStatus, bySector };
}
