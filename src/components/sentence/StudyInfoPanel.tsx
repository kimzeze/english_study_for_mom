"use client";

import * as React from "react";
import {
  ChevronDown,
  BookOpen,
  Volume2,
  Type,
  Lightbulb,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type {
  StudyInfo,
  SimilarSentence,
  WordNote,
} from "@/lib/db/schema";
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
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border-2 border-divider bg-paper px-5 py-2.5",
          "text-[20px] font-semibold text-ink hover:border-ink-muted hover:bg-paper-soft transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        )}
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <span>{open ? "접기" : "자세히 보기"}</span>
      </button>

      {open && (
        <div className="animate-fade-up space-y-4">
          {loading && !info && <StudyInfoSkeleton />}
          {info && <StudyInfoView info={info} />}
        </div>
      )}
    </div>
  );
}

function StudyInfoView({ info }: { info: StudyInfo }) {
  return (
    <div className="space-y-4">
      <Section icon={<BookOpen className="h-5 w-5" />} label="우리말 뜻">
        <p className="text-[24px] font-medium text-ink leading-relaxed">
          {info.translation}
        </p>
      </Section>

      {info.pronunciation && (
        <Section
          icon={<Volume2 className="h-5 w-5" />}
          label="한글로 읽는 발음"
        >
          <p className="text-[22px] text-ink leading-relaxed">
            {info.pronunciation}
          </p>
        </Section>
      )}

      {info.wordNotes && info.wordNotes.length > 0 && (
        <Section icon={<Type className="h-5 w-5" />} label="핵심 단어">
          <ul className="space-y-3">
            {info.wordNotes.map((w, i) => (
              <WordRow key={i} word={w} />
            ))}
          </ul>
        </Section>
      )}

      {info.grammarTip && info.grammarTip.trim() !== "" && (
        <Section
          icon={<Lightbulb className="h-5 w-5" />}
          label="알아두면 좋아요"
        >
          <p className="text-[20px] text-ink leading-relaxed">
            {info.grammarTip}
          </p>
        </Section>
      )}

      {info.similarSentences && info.similarSentences.length > 0 && (
        <Section
          icon={<MessageCircle className="h-5 w-5" />}
          label="비슷한 표현"
        >
          <ul className="space-y-3">
            {info.similarSentences.map((s, i) => (
              <SimilarRow key={i} item={s} />
            ))}
          </ul>
        </Section>
      )}

      {info.usageContext && (
        <Section
          icon={<Sparkles className="h-5 w-5" />}
          label="이런 때 써요"
        >
          <p className="text-[20px] text-ink leading-relaxed">
            {info.usageContext}
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-divider bg-paper-soft p-5 space-y-3 shadow-soft">
      <div className="flex items-center gap-2 text-[18px] font-bold text-accent">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function WordRow({ word }: { word: WordNote }) {
  return (
    <li className="rounded-xl bg-paper px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[22px] font-semibold text-ink">{word.word}</span>
        {word.pronunciation && (
          <span className="text-[18px] text-ink-muted">
            [{word.pronunciation}]
          </span>
        )}
      </div>
      <p className="mt-1 text-[20px] text-ink">{word.meaning}</p>
      {word.example && (
        <p className="mt-2 text-[18px] italic text-ink-muted">{word.example}</p>
      )}
    </li>
  );
}

function SimilarRow({ item }: { item: SimilarSentence | string }) {
  // 구버전 호환: string도 처리
  if (typeof item === "string") {
    return (
      <li className="rounded-xl bg-paper px-4 py-3">
        <p className="text-[22px] font-medium text-ink">{item}</p>
      </li>
    );
  }
  return (
    <li className="rounded-xl bg-paper px-4 py-3 space-y-1">
      <p className="text-[22px] font-medium text-ink">{item.english}</p>
      <p className="text-[18px] text-ink-muted">{item.korean}</p>
    </li>
  );
}

function StudyInfoSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-20 rounded-2xl bg-paper-soft animate-pulse" />
      <div className="h-16 rounded-2xl bg-paper-soft animate-pulse" />
      <div className="h-32 rounded-2xl bg-paper-soft animate-pulse" />
    </div>
  );
}
