import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, clipIds } = await request.json();

    if (!title || !clipIds || !Array.isArray(clipIds) || clipIds.length === 0) {
      return NextResponse.json(
        { error: "title and clipIds (non-empty array) are required" },
        { status: 400 }
      );
    }

    const { data: reel, error } = await supabase
      .from("highlight_reels")
      .insert({
        user_id: user.id,
        title,
        clip_ids: clipIds,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, reel });
  } catch (err) {
    console.error("Highlight reel error:", err);
    return NextResponse.json(
      { error: "Failed to create highlight reel." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: reels, error } = await supabase
      .from("highlight_reels")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reels });
  } catch (err) {
    console.error("Fetch reels error:", err);
    return NextResponse.json({ error: "Failed to fetch reels." }, { status: 500 });
  }
}
