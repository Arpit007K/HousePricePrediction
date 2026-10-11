"use client";

import { useEffect, useState } from "react";
import { Logo } from "./ui";

const LINKS = [
  { href: "#predict", label: "Single estimate" },
  { href: "#batch", label: "Batch CSV" },
  { href: "#about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition ${
        scrolled || open ? "border-b border-white/10 bg-navy-950/90 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5 font-serif text-lg text-white">
          <Logo />
          Golden State Home Values
        </a>

        <ul className="hidden items-center gap-8 text-sm md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-slate-400 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#predict" className="btn-primary !py-2">Get an estimate</a>
          </li>
        </ul>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 hover:text-white md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <ul className="space-y-1 border-t border-white/10 px-5 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/5">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
