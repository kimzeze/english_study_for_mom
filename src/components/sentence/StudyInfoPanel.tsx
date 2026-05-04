"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { StudyInfo } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function StudyInfoToggle({
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
        if (!res.ok) throw new Error("Study info failed");
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
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 text-[20px] font-medium text-ink-muted hover:text-ink transition-colors"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <span>{open ? "접기" : "더 알아보기"}</span>
      </button>

      {open && (
        <div className="animate-fade-up space-y-5 pt-2">
          {loading && !info && <StudyInfoSkeleton />}
          {info && <StudyInfoView info={info} />}
        </div>
      )}
    </div>
  );
}

function StudyInfoView({ info }: { info: StudyInfo }) {
  return (
    <>
      <Section emoji="📖" label="우리말">
        <p className="text-[22px] text-ink leading-relaxed">
          {info.translation}
        </p>
      </Section>

      {info.wordNotes.length > 0 && (
        <Section emoji="✏️" label="단어">
          <ul className="space-y-2">
            {info.wordNotes.map((w, i) => (
              <li key={i} className="text-[20px] text-ink">
                <span className="font-semibold">{w.word}</span>
                {w.pronunciation && (
                  <span className="ml-2 text-ink-muted">
                    [{w.pronunciation}]
                  </span>
                )}
                <span className="ml-2">{w.meaning}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {info.similarSentences.length > 0 && (
        <Section emoji="💬" label="비슷한 표현">
          <ul className="space-y-2">
            {info.similarSentences.map((s, i) => (
              <li key={i} className="text-[20px] text-ink">
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {info.usageContext && (
        <Section emoji="🌿" label="어떻게 쓰나요?">
          <p className="text-[20px] text-ink leading-relaxed">
            {info.usageContext}
          </p>
        </Section>
      )}
    </>
  );
}

function Section({
  emoji,
  label,
  children,
}: {
  emoji: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[18px] font-medium text-ink-muted">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function StudyInfoSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-1/2 rounded-md bg-divider/50 animate-pulse" />
      <div className="h-6 w-3/4 rounded-md bg-divider/50 animate-pulse" />
      <div className="h-6 w-2/3 rounded-md bg-divider/50 animate-pulse" />
    </div>
  );
}
