function TailwindTestPanel() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Slotify UI Test</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Tailwind CSS utility test screen</h1>
        <p className="mt-2 text-slate-600">
          Use this page to confirm spacing, colors, typography, borders, hover states, and responsive behavior.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Typography</h2>
          <p className="mt-2 text-sm text-slate-600">Body text style preview using muted color and relaxed line height.</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Small label style</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Buttons</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
              Primary
            </button>
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Secondary
            </button>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Confirmed</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Cancelled</span>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Responsive Grid Preview</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Card 1</div>
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Card 2</div>
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Card 3</div>
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">Card 4</div>
        </div>
      </section>
    </main>
  )
}

export default TailwindTestPanel