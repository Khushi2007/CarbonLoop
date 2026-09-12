export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          Application running
        </p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          CarbonLoop
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
          GIS-Powered Waste-to-Carbon-Value Chain Tracker
        </p>
      </section>
    </main>
  );
}
