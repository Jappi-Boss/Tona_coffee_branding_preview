import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { TonaLogo } from "./TonaLogo";
import { waLink } from "@/lib/tona";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/for-business", label: "For Business" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-teal-deep/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
        <Link
          to="/"
          aria-label="Tona Coffee home"
          onClick={() => setOpen(false)}
        >
          <TonaLogo tone="light" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3.5 py-2 text-sm font-semibold uppercase tracking-[.04em] text-white/65 transition-colors hover:bg-white/10 hover:text-white [&.active]:bg-primary [&.active]:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink("Hi Tona, I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-button hidden items-center gap-2 bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-teal-deep px-5 pb-5 pt-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-3 text-base font-semibold uppercase tracking-wide text-white/75 [&.active]:bg-primary [&.active]:text-white"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={waLink("Hi Tona, I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-button mt-2 flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
