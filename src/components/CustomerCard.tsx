"use client";

import type { Customer } from "@/lib/db";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import {
  ExternalLink,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

interface CustomerCardProps {
  customer: Customer;
  onUpdate: (id: number, data: Partial<Customer>) => void;
  onDelete: (id: number) => void;
}

export function CustomerCard({ customer, onUpdate, onDelete }: CustomerCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    project_name: customer.project_name ?? "",
    project_location: customer.project_location ?? "",
    project_notes: customer.project_notes ?? "",
    phone: customer.phone ?? "",
    status: customer.status,
  });

  function handleSave() {
    onUpdate(customer.id, form);
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{customer.name}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[customer.status]}`}
            >
              {STATUS_LABELS[customer.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {customer.sector} · {customer.city}
            {customer.district ? ` / ${customer.district}` : ""}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="mt-4 space-y-2 text-sm">
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
            >
              <Phone className="h-4 w-4" />
              {customer.phone}
            </a>
          )}
          {customer.address && (
            <p className="flex items-start gap-2 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {customer.address}
            </p>
          )}
          {customer.project_name && (
            <p>
              <span className="font-medium text-slate-700">Proje:</span>{" "}
              {customer.project_name}
            </p>
          )}
          {customer.project_location && (
            <p>
              <span className="font-medium text-slate-700">Proje Lokasyonu:</span>{" "}
              {customer.project_location}
            </p>
          )}
          {customer.project_notes && (
            <p className="text-slate-500">{customer.project_notes}</p>
          )}
          {customer.website && (
            <a
              href={customer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Web sitesi
            </a>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Telefon"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.project_name}
            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
            placeholder="Proje adı"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.project_location}
            onChange={(e) =>
              setForm({ ...form, project_location: e.target.value })
            }
            placeholder="Proje lokasyonu"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={form.project_notes}
            onChange={(e) => setForm({ ...form, project_notes: e.target.value })}
            placeholder="Proje notları"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Kaydet
          </button>
        </div>
      )}
    </div>
  );
}
