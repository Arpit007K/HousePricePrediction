"use client";

import { DragEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { predictFile } from "@/lib/api";
import { toTable, validateCsvText } from "@/lib/csv";
import { EXAMPLE, FEATURE_KEYS } from "@/lib/features";
import { downloadText, fmtUsd } from "@/lib/format";
import { Alert, SectionHeading, Spinner } from "./ui";

const MAX_BYTES = 10 * 1024 * 1024; // client-side guard only
const PRED_COL = "predicted_price_usd";
const PREVIEW_ROWS = 10;

type Phase = "idle" | "ready" | "uploading" | "done";
interface Output { csv: string; headers: string[]; rows: string[][] }

export default function BatchUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [problems, setProblems] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);

  function clear() {
    setPhase("idle"); setFile(null); setRowCount(0); setProblems([]); setApiError(null); setOutput(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function accept(f: File | undefined) {
    if (!f) return;
    clear();
    setFile(f);
    if (!f.name.toLowerCase().endsWith(".csv")) return setProblems(["Please upload a .csv file."]);
    if (f.size === 0) return setProblems(["The file is empty."]);
    if (f.size > MAX_BYTES) return setProblems(["The file is larger than 10 MB. Split it into smaller files."]);
    try {
      const v = validateCsvText(await f.text());
      setRowCount(v.rowCount);
      setProblems(v.errors);
      if (v.ok) setPhase("ready");
    } catch {
      setProblems(["Could not read the file."]);
    }
  }

  async function run() {
    if (!file) return;
    setPhase("uploading");
    setApiError(null);
    try {
      const csv = await predictFile(file);
      const t = toTable(csv);
      if (!t.headers.includes(PRED_COL)) throw new Error(`The response did not include a ${PRED_COL} column.`);
      setOutput({ csv, ...t });
      setPhase("done");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("ready");
    }
  }

  const stats = useMemo(() => {
    if (!output) return null;
    const i = output.headers.indexOf(PRED_COL);
    const v = output.rows.map((r) => Number(r[i])).filter(Number.isFinite);
    if (!v.length) return null;
    return { count: v.length, avg: v.reduce((a, b) => a + b, 0) / v.length, min: Math.min(...v), max: Math.max(...v) };
  }, [output]);

  const columns = useMemo(() => {
    if (!output) return [];
    return [...FEATURE_KEYS, PRED_COL]
      .map((name) => ({ name, idx: output.headers.indexOf(name) }))
      .filter((c) => c.idx >= 0);
  }, [output]);

  const busy = phase === "uploading";
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); if (!busy) accept(e.dataTransfer.files[0]); };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } };
  const template = () =>
    downloadText("house_template.csv", `${FEATURE_KEYS.join(",")}\n${FEATURE_KEYS.map((k) => EXAMPLE[k]).join(",")}\n`);

  return (
    <section id="batch" className="border-y border-white/10 bg-navy-900/40 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="Score a whole CSV">
          Upload a file with one row per neighborhood. You get the same file back with a predicted price in dollars on
          every row.
        </SectionHeading>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div
              role="button"
              tabIndex={0}
              aria-disabled={busy}
              aria-label="Choose or drop a CSV file"
              onClick={() => !busy && inputRef.current?.click()}
              onKeyDown={onKey}
              onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
                dragging ? "border-teal-300 bg-teal-400/10" : "border-white/15 bg-navy-950/40 hover:border-teal-400/60"
              } ${busy ? "pointer-events-none opacity-60" : ""}`}
            >
              <svg className="h-9 w-9 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
              {file ? (
                <>
                  <p className="mt-3 break-all font-medium text-white">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB{rowCount ? `, ${rowCount.toLocaleString()} rows` : ""}. Click to choose a different file.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-medium text-white">Drop your CSV here, or click to browse</p>
                  <p className="mt-1 text-sm text-slate-500">Needs these columns: {FEATURE_KEYS.join(", ")}</p>
                </>
              )}
              <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} onChange={(e) => accept(e.target.files?.[0])} />
            </div>

            <div className="mt-5 space-y-4">
              {problems.length > 0 && (
                <Alert tone="error" title="Fix these before uploading">
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
                </Alert>
              )}
              {apiError && <Alert tone="error" title="Batch prediction failed">{apiError}</Alert>}
              {phase === "ready" && !apiError && (
                <Alert tone="success" title="File looks good">{rowCount.toLocaleString()} rows passed validation and are ready to score.</Alert>
              )}
              {phase === "done" && stats && (
                <Alert tone="success" title="Predictions ready">Scored {stats.count.toLocaleString()} rows. Download the full file below.</Alert>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary min-w-40" onClick={run} disabled={phase !== "ready"}>
                {busy ? (<><Spinner /> Scoring</>) : "Run predictions"}
              </button>
              <button type="button" className="btn-ghost" onClick={() => output && downloadText("predictions.csv", output.csv)} disabled={!output}>
                Download predictions.csv
              </button>
              <button type="button" className="btn-ghost" onClick={clear} disabled={!file || busy}>Clear</button>
            </div>
          </div>

          <aside className="panel p-6 sm:p-8 lg:col-span-2">
            <h3 className="font-serif text-xl text-white">Before you upload</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
              <li>First row must be a header with the eight column names, spelled exactly.</li>
              <li>Every value must be a number. Income, age, rooms, bedrooms and population cannot be negative.</li>
              <li>AveOccup must be above 0, latitude within 32 to 42, longitude within -125 to -114.</li>
              <li>Extra columns are kept in the output file.</li>
            </ul>
            <button type="button" className="btn-ghost mt-5" onClick={template}>Download template CSV</button>
          </aside>
        </div>

        {output && stats && (
          <div className="pop-in mt-10">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Rows scored", stats.count.toLocaleString()],
                ["Average", fmtUsd(stats.avg)],
                ["Lowest", fmtUsd(stats.min)],
                ["Highest", fmtUsd(stats.max)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-navy-950/50 p-4">
                  <dt className="text-sm text-slate-500">{k}</dt>
                  <dd className="mt-1 font-serif text-2xl text-white">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-navy-800/70 text-slate-300">
                  <tr>
                    {columns.map((c) => (
                      <th key={c.name} scope="col" className={`px-4 py-3 font-medium ${c.name === PRED_COL ? "text-teal-300" : ""}`}>{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {output.rows.slice(0, PREVIEW_ROWS).map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      {columns.map((c) => (
                        <td key={c.name} className={`px-4 py-2.5 tabular-nums ${c.name === PRED_COL ? "font-semibold text-teal-200" : "text-slate-400"}`}>
                          {c.name === PRED_COL ? fmtUsd(Number(r[c.idx])) : r[c.idx]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Showing {Math.min(PREVIEW_ROWS, output.rows.length)} of {output.rows.length.toLocaleString()} rows. The download has all of them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
