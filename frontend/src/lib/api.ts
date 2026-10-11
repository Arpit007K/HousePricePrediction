import type { HouseFeatures } from "./features";
import type { HealthResponse, PredictResponse } from "./types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** FastAPI returns `detail` as a string (HTTPException) or a list (422 validation). */
async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      return d
        .map((e: { loc?: (string | number)[]; msg?: string }) => {
          const field = (e.loc ?? []).filter((p) => p !== "body").join(".");
          return field ? `${field}: ${e.msg}` : String(e.msg);
        })
        .join("; ");
    }
  } catch {
    /* fall through */
  }
  return `Request failed with status ${res.status}.`;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(
      `Cannot reach the API at ${API_BASE}. Check that the backend is running and that CORS allows this origin.`,
      0,
    );
  }
  if (!res.ok) throw new ApiError(await readError(res), res.status);
  return res;
}

export async function getHealth(): Promise<HealthResponse> {
  return (await request("/health", { cache: "no-store" })).json();
}

export async function predict(features: HouseFeatures): Promise<PredictResponse> {
  const res = await request("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  return res.json();
}

/** POST /predict-file returns the uploaded CSV plus a `predicted_price_usd` column, as CSV text. */
export async function predictFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await request("/predict-file", { method: "POST", body: form });
  return res.text();
}
