import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ORNITH | Hyperlocal Community Network",
  description: "Intent + Proximity + AI Matching + Trust — Your hyperlocal community network",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1E1E24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <Navbar />
        <main
          className="flex-1 w-full mx-auto"
          style={{
            maxWidth: '1280px',
            padding: '0 0 80px 0',
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
