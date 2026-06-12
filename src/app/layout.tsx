import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeyLead",
  description:
    "KeyLead — sektör, lokasyon ve anahtar kelime ile müşteri lead keşfi ve portföy yönetimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
