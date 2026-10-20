import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Activity,
  Bell,
  CircleDot,
  History,
  LayoutDashboard,
  Settings2,
  Video,
} from "lucide-react";
import ConnectionMonitor from "./components/ConnectionMonitor";
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

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Video },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.10),_transparent_42%)]">
          <header className="sticky top-0 z-[1200] border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-xl">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-16 items-center justify-between gap-4 py-3">
                <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Command Center overview">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
                    <Activity className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold tracking-wide text-white">Command Center</span>
                    <span className="hidden text-[11px] tracking-[0.18em] text-slate-500 sm:block">OPERATIONS CONSOLE</span>
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-xs text-slate-400 sm:px-3">
                  <CircleDot className="size-3.5 text-slate-500" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Connection status</span>
                  <span className="hidden rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:inline-flex">Provisional</span>
                </div>
              </div>

              <nav aria-label="Main navigation" className="-mx-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center gap-1">
                  {navigation.map(({ href, label, icon: Icon, badge }) => (
                    <Link
                      key={href}
                      href={href}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span>{label}</span>
                      {badge && (
                        <span
                          className="grid min-w-5 place-items-center rounded-full border border-amber-400/20 bg-amber-400/5 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-200/80"
                          aria-label="Provisional alert badge placeholder"
                          title="Alert count is provisional"
                        >
                          —
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            {children}
          </div>
        </div>
        <ConnectionMonitor />
      </body>
    </html>
  );
}
