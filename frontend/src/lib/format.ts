export const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** "$245,000" -> 245000 */
export function parseUsd(s: string): number | null {
  const n = Number(s.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && s.trim() !== "" ? n : null;
}

/** "$206,000 to $284,000" -> { low, high } */
export function parseRange(s: string): { low: number; high: number } | null {
  const m = s.match(/(\$[\d,.]+)\s+to\s+(\$[\d,.]+)/);
  if (!m) return null;
  const low = parseUsd(m[1]);
  const high = parseUsd(m[2]);
  return low === null || high === null ? null : { low, high };
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
