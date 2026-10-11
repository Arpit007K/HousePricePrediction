import { Logo } from "./ui";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2.5 text-slate-300">
          <Logo className="h-6 w-6" /> Golden State Home Values
        </span>
        <p>Built on the California Housing dataset. Estimates are illustrative, not appraisals.</p>
      </div>
    </footer>
  );
}
