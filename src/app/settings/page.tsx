export default function Settings() {
  return (
    <main className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-3xl font-bold">
        Settings
      </h1>

      <p className="mt-2 text-slate-400">
        Manage dashboard settings
      </p>

      <div className="mt-6 max-w-2xl space-y-4">
        <div className="rounded-lg bg-slate-800 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">
            Dashboard Settings
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Configure how the Command Center dashboard behaves.
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">
            Alert Settings
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage hotspot and device alert preferences.
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-5 shadow-lg">
          <h2 className="text-lg font-semibold">
            System Information
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Command Center Dashboard
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Version 1.0
          </p>
        </div>
      </div>
    </main>
  );
}