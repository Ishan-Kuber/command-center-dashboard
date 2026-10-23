"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  History,
  LayoutDashboard,
  Settings2,
  Video,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Video },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export default function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="-mx-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-1">
        {navigation.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
              {badge && (
                <span
                  className="cc-warning cc-warning-soft cc-warning-border grid min-w-5 place-items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                  aria-label="Alert count is provisional"
                  title="Alert count is provisional"
                >
                  —
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
