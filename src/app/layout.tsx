import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { Activity, CircleDot } from "lucide-react";
import ConnectionMonitor from "./components/ConnectionMonitor";
import DashboardNavigation from "./components/DashboardNavigation";
import ThemeToggle from "./components/ThemeToggle";
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

const restoreTheme = `try {
  const saved = localStorage.getItem("command-center-theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
} catch {}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="restore-theme" strategy="beforeInteractive">
          {restoreTheme}
        </Script>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-[1200] border-b border-border bg-card">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-[60px] items-center justify-between gap-4">
                <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Command Center overview">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Activity className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold tracking-tight text-foreground">Command Center</span>
                    <span className="hidden text-[10px] tracking-[0.12em] text-muted-foreground sm:block">OPERATIONS CONSOLE</span>
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-2 text-[11px] text-muted-foreground sm:gap-2 sm:px-2.5 sm:text-xs">
                    <CircleDot className="size-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Connection</span>
                    <span className="text-[10px] uppercase tracking-wide sm:border-l sm:border-border sm:pl-2">Provisional</span>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <DashboardNavigation />
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-5 sm:px-6 sm:pt-7 lg:px-8">
            {children}
          </div>
        </div>
        <ConnectionMonitor />
      </body>
    </html>
  );
}
