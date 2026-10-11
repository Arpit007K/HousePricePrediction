"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE, getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";
import { Spinner } from "./ui";

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; message: string };

export default function ApiStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const check = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ok", data: await getHealth() });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Unknown error" });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const dot =
    state.kind === "ok" ? "bg-teal-400" : state.kind === "error" ? "bg-rose-400" : "bg-amber-300 animate-pulse";

  return (
    <section className="panel p-6" aria-label="Backend status">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Prediction API</h2>
          <p className="mt-0.5 break-all text-xs text-slate-500">{API_BASE}</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-slate-300">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          {state.kind === "loading" && "Connecting"}
          {state.kind === "ok" && "Online"}
          {state.kind === "error" && "Unreachable"}
        </span>
      </div>

      <div className="mt-5 min-h-[7.5rem]">
        {state.kind === "loading" && (
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Spinner /> Calling GET /health
          </p>
        )}

        {state.kind === "ok" && (
          <div className="pop-in">
            <p className="text-sm text-slate-400">Model</p>
            <p className="font-serif text-xl text-white">{state.data.model}</p>
            <p className="mt-4 text-sm text-slate-400">Reads {state.data.features.length} features, in this order</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {state.data.features.map((f) => (
                <li key={f} className="rounded-md bg-teal-400/10 px-2 py-1 text-xs text-teal-200">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.kind === "error" && (
          <div className="pop-in space-y-3">
            <p className="text-sm leading-relaxed text-rose-200">{state.message}</p>
            <button type="button" onClick={check} className="btn-ghost !py-1.5">
              Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
