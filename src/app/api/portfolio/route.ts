import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getStats,
  updateCustomer,
  upsertCustomer,
} from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const stats = searchParams.get("stats");

  if (stats === "true") {
    return NextResponse.json(getStats());
  }

  const customers = getAllCustomers({ sector, city, status });
  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.bulk && Array.isArray(body.customers)) {
      const saved = body.customers.map(
        (c: Parameters<typeof upsertCustomer>[0]) => upsertCustomer(c)
      );
      return NextResponse.json({ saved, count: saved.length });
    }

    if (!body.name || !body.sector) {
      return NextResponse.json(
        { error: "İsim ve sektör zorunludur" },
        { status: 400 }
      );
    }

    const customer = body.external_id
      ? upsertCustomer(body)
      : createCustomer(body);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt sırasında hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const customer = updateCustomer(id, updates);
    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Güncelleme sırasında hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
  }

  const deleted = deleteCustomer(parseInt(id, 10));
  if (!deleted) {
    return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
