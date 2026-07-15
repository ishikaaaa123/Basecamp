import { useEffect, useState, type MouseEventHandler } from "react";
import { motion } from "framer-motion";
import { Menu, ServerCog, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "#capabilities" },
  { label: "Access Control", href: "#access" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (l: (typeof links)[number], onClick?: MouseEventHandler<HTMLAnchorElement>) => (
    <a
      key={l.href}
      href={l.href}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {l.label}
    </a>
  );

  const signupClass =
    "rounded-lg bg-gradient-to-r from-[var(--brand)] via-[var(--brand-2)] to-[var(--cyan)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/30";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "backdrop-blur-xl bg-background/60 border-b border-border/60" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand)] via-[var(--brand-2)] to-[var(--cyan)] shadow-lg shadow-[var(--brand)]/30">
            <ServerCog className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Project Basecamp <span className="text-gradient"></span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => navLink(l))}
          <Link
            to="/login"
            className="ml-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className={cn(signupClass, "transition-transform hover:scale-[1.03]")}
          >
            Sign up
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden rounded-md p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {links.map((l) => navLink(l, () => setOpen(false)))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className={cn(signupClass, "text-center")}
              >
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
