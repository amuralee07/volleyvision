"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-full border-white/20 hover:bg-white/5"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy Share Link"}
    </Button>
  );
}
