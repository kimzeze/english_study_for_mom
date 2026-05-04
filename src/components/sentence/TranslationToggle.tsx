"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { StudyInfo } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function TranslationToggle({
  sentenceId,
  text,
  initialInfo,
}: {
  sentenceId: number;
  text: string;
  initialInfo: StudyInfo | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [info, setInfo] = React.useState<StudyInfo | null>(initialInfo);
  const [loading, setLoading] = React.useState(false);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !info && !loading) {
      setLoading(true);
      try {
        const res = await fetch("/api/study-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentenceId, text }),
        });
        if (!res.ok) throw new Error("study-info failed");
        const data = (await res.json()) as StudyInfo;
        setInfo(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 text-[18px] font-medium text-ink-muted hover:text-ink transition-colors"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <span>{open ? "해석 숨기기" : "해석 보기"}</span>
      </button>

      {open && (
        <div className="animate-fade-up rounded-xl bg-cream-soft px-4 py-3">
          {loading && !info ? (
            <div className="h-5 w-3/4 rounded-md bg-divider/60 animate-pulse" />
          ) : info ? (
            <p className="text-[20px] text-ink leading-relaxed">
              {info.translation}
            </p>
          ) : (
            <p className="text-[18px] text-ink-muted">
              해석을 불러오지 못했어요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
