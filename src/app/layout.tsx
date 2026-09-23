import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Птицелов — лови птиц, собирай коллекцию",
  description: "Браузерная аркада: лови птиц сачком, продавай их, покупай клетки и корм, выполняй квесты и открывай новые локации.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="overscroll-none bg-[#0c1710] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
