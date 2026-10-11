import { FEATURE_KEYS, checkRange } from "./features";

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = ""; rows.push(row); row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

export function toTable(text: string): { headers: string[]; rows: string[][] } {
  const [headers = [], ...rows] = parseCsv(text);
  return { headers: headers.map((h) => h.trim()), rows };
}

export interface CsvValidation {
  ok: boolean;
  errors: string[];
  rowCount: number;
}

/** Mirrors the checks in /predict-file so users get feedback before uploading. */
export function validateCsvText(text: string): CsvValidation {
  const { headers, rows } = toTable(text);
  if (headers.length === 0) return { ok: false, errors: ["The file is empty."], rowCount: 0 };

  const missing = FEATURE_KEYS.filter((k) => !headers.includes(k));
  if (missing.length) {
    return { ok: false, errors: [`Missing columns: ${missing.join(", ")}`], rowCount: rows.length };
  }
  if (rows.length === 0) return { ok: false, errors: ["The file has a header but no data rows."], rowCount: 0 };

  const idx = FEATURE_KEYS.map((k) => headers.indexOf(k));
  const errors: string[] = [];
  let bad = 0;
  rows.forEach((row, r) => {
    FEATURE_KEYS.forEach((key, j) => {
      const raw = (row[idx[j]] ?? "").trim();
      const n = raw === "" ? NaN : Number(raw);
      const problem = !Number.isFinite(n) ? "is not a valid number" : checkRange(key, n);
      if (problem) {
        bad++;
        if (errors.length < 6) errors.push(`Line ${r + 2}: ${key} ${problem.charAt(0).toLowerCase()}${problem.slice(1)}`);
      }
    });
  });
  if (bad > errors.length) errors.push(`${bad - errors.length} more problems not shown.`);
  return { ok: bad === 0, errors, rowCount: rows.length };
}
