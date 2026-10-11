"use client";

import { useEffect, useState } from "react";
import type { HouseFeatures } from "@/lib/features";
import { FEATURE_SPECS } from "@/lib/features";
import { fmtUsd, parseRange, parseUsd } from "@/lib/format";
import type { PredictResponse } from "@/lib/types";

function useCountUp(target: number | null, ms = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

export default function ResultCard({ result, inputs }: { result: PredictResponse; inputs: HouseFeatures }) {
  const price = parseUsd(result.predicted_price);
  const range = parseRange(result.estimated_range);
  const animated = useCountUp(price);
  const done = price === null || animated >= price;
  const [copied, setCopied] = useState(false);

  const marker =
    price !== null && range && range.high > range.low
      ? Math.min(100, Math.max(0, ((price - range.low) / (range.high - range.low)) * 100))
      : 50;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${result.predicted_price} (${result.estimated_range})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="pop-in space-y-6">
      <div>
        <p className="text-sm text-slate-400">Estimated median house value</p>
        <p className="mt-1 font-serif text-5xl font-medium tracking-tight text-white sm:text-6xl" aria-live="polite">
          {done ? result.predicted_price : fmtUsd(animated)}
        </p>
        <p className="mt-1 text-sm text-slate-500">Model output: {result.predicted_price_short}</p>
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Likely range</span>
          <span className="text-teal-200">{result.estimated_range}</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-navy-700">
          <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-teal-400/30" />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy-950 bg-teal-300 transition-[left] duration-700"
            style={{ left: `${marker}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <details className="group rounded-xl border border-white/10 bg-navy-950/50 p-4 text-sm">
        <summary className="cursor-pointer select-none font-medium text-slate-200">Inputs used</summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {FEATURE_SPECS.map((s) => (
            <div key={s.key} className="flex justify-between gap-2">
              <dt className="text-slate-500">{s.key}</dt>
              <dd className="text-slate-200">{inputs[s.key]}</dd>
            </div>
          ))}
        </dl>
      </details>

      <button type="button" onClick={copy} className="btn-ghost w-full">
        {copied ? "Copied" : "Copy estimate"}
      </button>
    </div>
  );
}
