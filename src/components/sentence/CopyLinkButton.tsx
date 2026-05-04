"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ date }: { date: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    const url = `${base}/${date}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <Button
      onClick={copy}
      block
      size="xl"
      variant={copied ? "success" : "primary"}
    >
      {copied ? (
        <>
          <Check className="h-6 w-6" strokeWidth={2.5} />
          <span>복사되었어요</span>
        </>
      ) : (
        <>
          <Copy className="h-6 w-6" />
          <span>이 페이지 링크 복사</span>
        </>
      )}
    </Button>
  );
}
