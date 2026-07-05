"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/clips", label: "Clips" },
  { href: "/highlights/new", label: "Highlights" },
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
            VV
          </div>
          <span className="hidden text-sm font-bold tracking-[0.2em] uppercase sm:block">VolleyVision</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isDashboard = link.href === "/dashboard";
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/") ||
              (isDashboard && pathname.startsWith("/video/"));
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className={`rounded-full px-4 text-white/50 hover:bg-white/5 hover:text-white ${
                  isActive ? "bg-white/10 font-semibold text-white" : ""
                }`}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            );
          })}
          <div className="ml-2 border-l border-white/10 pl-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-white/50 hover:bg-white/5 hover:text-white"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
