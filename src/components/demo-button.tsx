"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const DEMO_EMAIL = "demo@volleyvision.app";
const DEMO_PASSWORD = "demodemo123";

export function DemoButton({ variant = "default", className = "" }: { variant?: "default" | "outline" | "ghost"; className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDemo() {
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          options: { data: { name: "Demo Player", role: "player" } },
        });
        if (signUpError) throw signUpError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Demo login failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} onClick={handleDemo} disabled={loading} className={className}>
      {loading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading demo...
        </>
      ) : (
        "Try Demo"
      )}
    </Button>
  );
}
