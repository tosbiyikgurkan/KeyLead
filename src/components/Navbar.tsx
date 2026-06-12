"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Search, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Keşfet", icon: Search },
  { href: "/portfolio", label: "Portföyüm", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">KeyLead</p>
            <p className="text-xs text-slate-500">Lead keşif platformu</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
