import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demodemo123";

function isExistingUserError(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("already") || lower.includes("registered") || lower.includes("exists");
}

function describeSupabaseError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const cause =
    err instanceof Error && err.cause instanceof Error
      ? err.cause.message
      : err instanceof Error && err.cause
        ? String(err.cause)
        : "";
  const combined = `${message} ${cause}`.toLowerCase();

  if (
    combined.includes("enotfound") ||
    combined.includes("nxdomain") ||
    combined.includes("getaddrinfo") ||
    combined.includes("could not resolve") ||
    message === "fetch failed"
  ) {
    const host = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing URL)";
    return `Can't reach Supabase at ${host}. That project hostname doesn't resolve — update NEXT_PUBLIC_SUPABASE_URL (and keys) in .env.local from Supabase → Project Settings → API, then restart the dev server.`;
  }

  return message || "Failed to prepare demo account";
}

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Demo login is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API).",
      },
      { status: 503 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        error:
          "Supabase URL/anon key missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      },
      { status: 503 }
    );
  }

  try {
    const admin = createAdminClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "Demo Player", role: "player" },
    });

    if (createError && !isExistingUserError(createError.message)) {
      return NextResponse.json(
        { error: describeSupabaseError(createError) },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: describeSupabaseError(err) }, { status: 500 });
  }

  let response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (signInError) {
    return NextResponse.json(
      { error: describeSupabaseError(signInError) },
      { status: 500 }
    );
  }

  return response;
}
