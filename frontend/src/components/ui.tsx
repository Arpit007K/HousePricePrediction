import type { ReactNode } from "react";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const tones = {
  error: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  success: "border-teal-400/40 bg-teal-400/10 text-teal-50",
  warn: "border-amber-400/40 bg-amber-400/10 text-amber-50",
} as const;

export function Alert({
  tone,
  title,
  children,
}: {
  tone: keyof typeof tones;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`pop-in rounded-xl border p-4 text-sm ${tones[tone]}`}>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 leading-relaxed opacity-90">{children}</div>}
    </div>
  );
}

export function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-base leading-relaxed text-slate-400">{children}</p>}
    </div>
  );
}

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2dd4bf" />
      <path d="M7 16.5 16 8l9 8.5" stroke="#050d1c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 15v8h12v-8" stroke="#050d1c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
