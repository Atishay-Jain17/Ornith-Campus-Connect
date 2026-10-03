import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ORNITH | Hyperlocal Community Network",
  description: "Intent + Proximity + AI Matching + Trust Community Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-700">ORNITH Community Network MVP</span> — Graphic Era University & Hyperlocal Area
            </div>
            <div>
              Intent • Proximity • AI Matching • Trust Engine
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
