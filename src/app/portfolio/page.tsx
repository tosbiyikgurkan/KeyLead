"use client";

import { CustomerCard } from "@/components/CustomerCard";
import { Navbar } from "@/components/Navbar";
import type { Customer } from "@/lib/db";
import { SECTORS } from "@/lib/sectors";
import { CITIES } from "@/lib/locations";
import { STATUS_LABELS } from "@/lib/constants";
import { Briefcase, Filter, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Stats {
  total: number;
  byStatus: { status: string; count: number }[];
  bySector: { sector: string; count: number }[];
}

export default function PortfolioPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sector: "",
    city: "",
    status: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.sector) params.set("sector", filters.sector);
    if (filters.city) params.set("city", filters.city);
    if (filters.status) params.set("status", filters.status);

    const [customersRes, statsRes] = await Promise.all([
      fetch(`/api/portfolio?${params}`),
      fetch("/api/portfolio?stats=true"),
    ]);

    setCustomers(await customersRes.json());
    setStats(await statsRes.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdate(id: number, data: Partial<Customer>) {
    await fetch("/api/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    loadData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            KeyLead Portföyüm
          </h1>
          <p className="mt-2 text-slate-500">
            Kaydettiğiniz müşterileri yönetin, proje bilgilerini güncelleyin
          </p>
        </div>

        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2.5">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-slate-500">Toplam müşteri</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.byStatus.find((s) => s.status === "active")?.count ??
                      0}
                  </p>
                  <p className="text-sm text-slate-500">Aktif müşteri</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Sektör dağılımı
              </p>
              <div className="space-y-1">
                {stats.bySector.slice(0, 3).map((s) => (
                  <div
                    key={s.sector}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-slate-600">{s.sector}</span>
                    <span className="font-medium text-slate-900">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filters.sector}
            onChange={(e) =>
              setFilters({ ...filters, sector: e.target.value })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tüm sektörler</option>
            {SECTORS.map((s) => (
              <option key={s.id} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tüm şehirler</option>
            {CITIES.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tüm durumlar</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Yükleniyor...</p>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <Users className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Portföyünüz boş</p>
            <p className="mt-1 text-sm">
              Keşfet sayfasından müşteri arayıp portföyünüze ekleyin
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
