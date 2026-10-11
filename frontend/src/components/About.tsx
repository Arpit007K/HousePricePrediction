import { FEATURE_SPECS } from "@/lib/features";
import { SectionHeading } from "./ui";

const STEPS = [
  { title: "You enter eight measurements", body: "Income, housing, population and location for one neighborhood, or a CSV of many." },
  { title: "The API runs the model", body: "FastAPI validates the input, keeps the training column order, and calls the Random Forest." },
  { title: "You get dollars back", body: "The model predicts in units of $100,000. The API multiplies it out and adds a likely range." },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading title="How the estimate is made">
        This project turns a classic machine-learning dataset into a working price tool, from training script to API to
        this interface.
      </SectionHeading>

      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-white/10 bg-navy-900/60 p-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400 text-sm font-bold text-navy-950">{i + 1}</span>
            <h3 className="mt-4 font-serif text-xl text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="panel p-6 sm:p-8">
          <h3 className="font-serif text-2xl text-white">The dataset</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            The California Housing dataset describes 20,640 census block groups from the 1990 U.S. census. Each row is a
            small neighborhood, not a single house. The target is the median house value there, recorded in units of
            $100,000 and capped at $500,000, so the model cannot predict above that ceiling.
          </p>
          <dl className="mt-5 divide-y divide-white/5 text-sm">
            {FEATURE_SPECS.map((s) => (
              <div key={s.key} className="flex justify-between gap-4 py-2">
                <dt className="text-slate-200">{s.key}</dt>
                <dd className="text-right text-slate-500">{s.hint}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="panel p-6 sm:p-8">
          <h3 className="font-serif text-2xl text-white">The model</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            A Random Forest regressor builds many decision trees on different samples of the data and averages their
            predictions. That averaging smooths out the quirks of any single tree and handles non-linear patterns like
            the way prices change sharply near the coast.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-400">
            <li>100 trees, trained with scikit-learn&apos;s RandomForestRegressor and a fixed random seed.</li>
            <li>80% of rows for training, 20% held out to measure mean absolute error.</li>
            <li>The likely range shown with each estimate is a fixed band of $39,000 either side, set in the backend.</li>
          </ul>
          <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
            The data is from 1990, so use results to explore how the model behaves rather than to price a real home.
          </p>
        </article>
      </div>
    </section>
  );
}
