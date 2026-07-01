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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            VV
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">VolleyVision</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className={`rounded-full px-4 ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            );
          })}
          <div className="ml-2 pl-2 border-l">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
