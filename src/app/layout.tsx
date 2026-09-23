import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Command Center Dashboard",
  description: "Team 5c Command Center Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-slate-900 text-white">
        <nav className="border-b border-slate-700 bg-slate-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-xl font-bold">
              Command Center
            </a>

            <div className="flex gap-6 text-sm">
              <a
                href="/"
                className="text-slate-300 hover:text-white"
              >
                Dashboard
              </a>

              <a
                href="/devices"
                className="text-slate-300 hover:text-white"
              >
                Devices
              </a>

              <a
                href="/alerts"
                className="text-slate-300 hover:text-white"
              >
                Alerts
              </a>

              <a
                href="/settings"
                className="text-slate-300 hover:text-white"
              >
                Settings
              </a>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
