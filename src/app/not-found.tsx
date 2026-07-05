import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050508] px-6 text-white">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-center text-white/50">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button className="rounded-full bg-white text-black hover:bg-white/90" render={<Link href="/" />}>
          Home
        </Button>
        <Button variant="outline" className="rounded-full border-white/20" render={<Link href="/dashboard" />}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
