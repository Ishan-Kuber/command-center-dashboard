import { Activity, BellRing, Settings2 } from "lucide-react";

const sections = [
  {
    title: "Dashboard settings",
    description: "Configure how the Command Center dashboard behaves.",
    icon: Settings2,
    status: "Display preferences",
  },
  {
    title: "Alert settings",
    description: "Manage hotspot and device alert preferences.",
    icon: BellRing,
    status: "Alert preferences",
  },
  {
    title: "System information",
    description: "Command Center Dashboard",
    icon: Activity,
    status: "Version 1.0",
  },
];

export default function Settings() {
  return (
    <main className="space-y-6">
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Workspace / Preferences</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">Manage dashboard settings and system information.</p>
      </section>

      <section className="grid max-w-5xl gap-4 lg:grid-cols-2" aria-label="Settings sections">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <article key={section.title} className={`rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 ${index === 2 ? "lg:col-span-2" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950/70 text-cyan-200">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">{section.title}</h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400">{section.description}</p>
                  </div>
                </div>
                <span className="hidden rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-500 sm:inline-flex">{section.status}</span>
              </div>
              {index === 2 && (
                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-800 pt-4 text-sm">
                  <div><p className="text-xs text-slate-500">Application</p><p className="mt-1 text-slate-300">Command Center Dashboard</p></div>
                  <div><p className="text-xs text-slate-500">Version</p><p className="mt-1 font-mono text-slate-300">1.0</p></div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
