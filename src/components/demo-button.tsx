"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demodemo123";

function getDemoErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Couldn't start the demo. Please try again.";
  }

  const err = error as { message?: string; code?: string };
  const code = err.code ?? "";
  const message = err.message ?? "";

  if (code === "email_provider_disabled" || message.includes("Email logins are disabled")) {
    return "Email login is disabled in Supabase. Enable it under Authentication → Providers → Email.";
  }
  if (message.includes("signups are disabled")) {
    return "Email signups are disabled in Supabase. Enable sign-ups under Authentication → Providers → Email.";
  }
  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Supabase email rate limit hit. Save SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server.";
  }
  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "Save SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the dev server.";
  }
  if (
    message.includes("Can't reach Supabase") ||
    message.includes("doesn't resolve") ||
    message.includes("ENOTFOUND") ||
    message === "fetch failed"
  ) {
    return message === "fetch failed"
      ? "Can't reach your Supabase project. Update NEXT_PUBLIC_SUPABASE_URL and keys in .env.local, then restart the dev server."
      : message;
  }

  return message || "Couldn't start the demo. Please try again.";
}

async function signInDemoClient() {
  const supabase = createClient();
  const credentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

  let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(credentials);

  if (signInError?.message?.includes("Invalid login credentials")) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      ...credentials,
      options: { data: { name: "Demo Player", role: "player" } },
    });

    if (signUpError) throw signUpError;

    if (signUpData.session) return;

    const retry = await supabase.auth.signInWithPassword(credentials);
    if (retry.error) {
      if (signUpData.user) {
        throw new Error(
          "Demo account created. Confirm the email in Supabase, or disable email confirmation for development."
        );
      }
      throw retry.error;
    }
    signInData = retry.data;
  } else if (signInError) {
    throw signInError;
  }

  if (!signInData?.session) {
    throw new Error("Demo login failed. No active session.");
  }
}

export function DemoButton({ variant = "default", className = "" }: { variant?: "default" | "outline" | "ghost"; className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDemo() {
    setLoading(true);
    try {
      const res = await fetch("/api/demo", { method: "POST", credentials: "same-origin" });
      const contentType = res.headers.get("content-type") ?? "";
      const body = contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : {};

      if (res.status === 503) {
        await signInDemoClient();
      } else if (!res.ok || !body.ok) {
        throw new Error(body.error ?? "Demo login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(getDemoErrorMessage(err));
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
