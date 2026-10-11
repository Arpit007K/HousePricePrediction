import ApiStatus from "./ApiStatus";

const FACTS = [
  { value: "20,640", label: "census block groups in the training data" },
  { value: "8", label: "inputs per estimate" },
  { value: "100", label: "trees in the Random Forest" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-teal-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="hero-in">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            What is a California home worth?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Describe a neighborhood by income, housing, and location, and a Random Forest trained on the California
            Housing dataset returns a price estimate in dollars. Try one home, or score a whole spreadsheet at once.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#predict" className="btn-primary px-6 py-3">Estimate a home</a>
            <a href="#batch" className="btn-ghost px-6 py-3">Upload a CSV</a>
          </div>

          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="font-serif text-3xl text-white">{f.value}</dt>
                <dd className="mt-1 text-sm leading-snug text-slate-500">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-in [animation-delay:150ms]">
          <ApiStatus />
        </div>
      </div>
    </section>
  );
}
