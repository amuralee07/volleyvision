"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">Volley</span>
          <span>Vision</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/upload" />}>
            Upload
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/clips" />}>
            Clips
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/highlights/new" />}>
            Highlights
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
