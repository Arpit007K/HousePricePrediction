"use client";

import { FormEvent, useState } from "react";
import { ApiError, predict } from "@/lib/api";
import {
  EXAMPLE,
  FEATURE_KEYS,
  FEATURE_SPECS,
  FeatureKey,
  HouseFeatures,
  validateRaw,
} from "@/lib/features";
import type { PredictResponse } from "@/lib/types";
import ResultCard from "./ResultCard";
import { Alert, SectionHeading, Spinner } from "./ui";

type Values = Record<FeatureKey, string>;
type Errors = Partial<Record<FeatureKey, string>>;

const EMPTY = Object.fromEntries(FEATURE_KEYS.map((k) => [k, ""])) as Values;

export default function PredictForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<{ response: PredictResponse; inputs: HouseFeatures } | null>(null);

  function setField(key: FeatureKey, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validateRaw(key, raw) ?? undefined }));
  }

  function loadExample() {
    setValues(EXAMPLE);
    setErrors({});
    setApiError(null);
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setApiError(null);
    setResult(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    for (const k of FEATURE_KEYS) {
      const msg = validateRaw(k, values[k]);
      if (msg) next[k] = msg;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const inputs = Object.fromEntries(FEATURE_KEYS.map((k) => [k, Number(values[k])])) as HouseFeatures;
    setLoading(true);
    setApiError(null);
    try {
      const response = await predict(inputs);
      setResult({ response, inputs });
    } catch (err) {
      setResult(null);
      setApiError(err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="predict" className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading title="Estimate one home">
        Fill in the eight neighborhood measurements the model was trained on, or load a real record from the dataset to
        see how it works.
      </SectionHeading>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} noValidate className="panel p-6 sm:p-8 lg:col-span-3">
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            {FEATURE_SPECS.map((s) => {
              const id = `f-${s.key}`;
              return (
                <div key={s.key}>
                  <label htmlFor={id} className="text-sm font-medium text-slate-200">
                    {s.label}
                  </label>
                  <input
                    id={id}
                    name={s.key}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="input mt-1.5"
                    placeholder={s.placeholder}
                    value={values[s.key]}
                    aria-invalid={errors[s.key] ? "true" : "false"}
                    aria-describedby={`${id}-help`}
                    onChange={(e) => setField(s.key, e.target.value)}
                    onBlur={(e) =>
                      e.target.value !== "" && setErrors((x) => ({ ...x, [s.key]: validateRaw(s.key, e.target.value) ?? undefined }))
                    }
                  />
                  <p id={`${id}-help`} className={`mt-1 text-xs ${errors[s.key] ? "text-rose-300" : "text-slate-500"}`}>
                    {errors[s.key] ?? s.hint}
                  </p>
                </div>
              );
            })}
          </div>

          {apiError && (
            <div className="mt-6">
              <Alert tone="error" title="Prediction failed">
                {apiError}
              </Alert>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary min-w-40" disabled={loading}>
              {loading ? (<><Spinner /> Predicting</>) : "Predict price"}
            </button>
            <button type="button" className="btn-ghost" onClick={loadExample} disabled={loading}>
              Load example
            </button>
            <button type="button" className="btn-ghost" onClick={reset} disabled={loading}>
              Clear
            </button>
          </div>
        </form>

        <aside className="panel flex flex-col justify-center p-6 sm:p-8 lg:col-span-2" aria-label="Prediction result">
          {loading && (
            <p className="flex items-center gap-3 text-slate-400">
              <Spinner className="h-5 w-5" /> Asking the model
            </p>
          )}
          {!loading && result && <ResultCard result={result.response} inputs={result.inputs} />}
          {!loading && !result && (
            <div>
              <p className="font-serif text-2xl text-white">Your estimate appears here</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter the eight values and press Predict price. The number comes straight from your FastAPI model, not
                from this page.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
