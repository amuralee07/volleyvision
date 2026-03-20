import { createClient } from "@/lib/supabase/server";
import type { Clip } from "@/lib/types";
import { ReelBuilderClient } from "./client";

export default async function NewHighlightReelPage() {
  const supabase = await createClient();

  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Clip[]>();

  const clipsWithUrls = await Promise.all(
    (clips || []).map(async (clip) => {
      const { data } = await supabase.storage
        .from("clips")
        .createSignedUrl(clip.storage_path, 3600);
      return { clip, url: data?.signedUrl || "" };
    })
  );

  return <ReelBuilderClient clipsWithUrls={clipsWithUrls} />;
}
