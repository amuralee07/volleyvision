"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Film" },
  { href: "/clips", label: "Clips" },
  { href: "/highlights/new", label: "Reels" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050508]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="logo-emerald flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-black">
            VV
          </div>
          <span className="hidden text-sm font-bold tracking-[0.2em] uppercase sm:block">
            VolleyVision
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
          {navLinks.map((link) => {
            const isFilm = link.href === "/dashboard";
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/") ||
              (isFilm && pathname.startsWith("/video/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                  isActive
                    ? "bg-emerald-500/15 font-semibold text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.12)]"
                    : "text-white/45 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="btn-emerald hidden px-4 sm:inline-flex"
            render={<Link href="/upload" />}
          >
            Upload film
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-3 text-white/45 hover:bg-white/5 hover:text-white sm:hidden"
            render={<Link href="/upload" />}
          >
            Upload
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-white/40 hover:bg-white/5 hover:text-white"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
        {navLinks.map((link) => {
          const isFilm = link.href === "/dashboard";
          const isActive =
            pathname === link.href ||
            pathname.startsWith(link.href + "/") ||
            (isFilm && pathname.startsWith("/video/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                isActive
                  ? "bg-emerald-500/15 font-semibold text-emerald-300"
                  : "text-white/45"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
