"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BigDate } from "@/components/date/BigDate";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { todayKey } from "@/lib/utils";

type SpellResult = {
  index: number;
  original: string;
  corrected: string;
  reason: string;
};

type Phase = "input" | "checking" | "review" | "saving" | "done";

const STORAGE_KEY = "mom-english:draft";
const MAX_SENTENCES = 10;
const ORDINALS = [
  "첫 번째",
  "두 번째",
  "세 번째",
  "네 번째",
  "다섯 번째",
  "여섯 번째",
  "일곱 번째",
  "여덟 번째",
  "아홉 번째",
  "열 번째",
];

export function SentenceForm() {
  const [date] = React.useState(todayKey());
  const [texts, setTexts] = React.useState<string[]>([""]);
  const [phase, setPhase] = React.useState<Phase>("input");
  const [reviews, setReviews] = React.useState<SpellResult[]>([]);
  const [savedDate, setSavedDate] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // 자동 저장 (실수로 새로고침해도 복원)
  React.useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { date: string; texts: string[] };
        if (
          parsed.date === date &&
          Array.isArray(parsed.texts) &&
          parsed.texts.length > 0
        ) {
          setTexts(parsed.texts);
        }
      } catch {}
    }
  }, [date]);

  React.useEffect(() => {
    if (phase !== "input") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, texts }));
  }, [date, texts, phase]);

  const setText = (i: number, val: string) => {
    setTexts((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const addSentence = () => {
    setTexts((prev) =>
      prev.length >= MAX_SENTENCES ? prev : [...prev, ""]
    );
  };

  const removeSentence = (i: number) => {
    setTexts((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const filledTexts = texts
    .map((t, i) => ({ i, t: t.trim() }))
    .filter((x) => x.t.length > 0);

  const canSubmit = filledTexts.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setPhase("checking");

    const results = await Promise.all(
      filledTexts.map(async ({ i, t }) => {
        try {
          const res = await fetch("/api/spell-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: t }),
          });
          if (!res.ok) throw new Error();
          const data = (await res.json()) as {
            corrected: string;
            changed: boolean;
            reason: string;
          };
          return {
            index: i,
            original: t,
            corrected: data.corrected,
            reason: data.reason,
            changed: data.changed && data.corrected !== t,
          };
        } catch {
          return {
            index: i,
            original: t,
            corrected: t,
            reason: "",
            changed: false,
          };
        }
      })
    );

    const changed = results.filter((r) => r.changed);
    if (changed.length === 0) {
      await save(filledTexts.map(({ i, t }) => ({ i, text: t })));
      return;
    }

    setReviews(changed);
    setPhase("review");
  };

  const acceptCorrection = (index: number, accept: boolean) => {
    setReviews((prev) => prev.filter((r) => r.index !== index));
    if (accept) {
      setTexts((prev) => {
        const next = [...prev];
        const review = reviews.find((r) => r.index === index);
        if (review) next[index] = review.corrected;
        return next;
      });
    }
  };

  // reviews가 모두 처리되면 저장
  React.useEffect(() => {
    if (phase !== "review" || reviews.length > 0) return;
    const finalTexts = filledTexts.map(({ i, t }) => ({ i, text: t }));
    save(finalTexts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews, phase]);

  const save = async (items: { i: number; text: string }[]) => {
    setPhase("saving");
    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          texts: items.sort((a, b) => a.i - b.i).map((x) => x.text),
        }),
      });
      if (!res.ok) throw new Error("저장 실패");
      const data = (await res.json()) as { date: string };
      localStorage.removeItem(STORAGE_KEY);
      setSavedDate(data.date);
      setPhase("done");
    } catch (e) {
      console.error(e);
      setError("저장에 실패했어요. 다시 시도해주세요.");
      setPhase("input");
    }
  };

  if (phase === "done" && savedDate) {
    return <ShareLinkResult date={savedDate} />;
  }

  return (
    <>
      <div className="space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[20px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>돌아가기</span>
        </Link>

        <BigDate date={date} />

        <h2 className="text-[32px] font-bold text-ink leading-tight">
          오늘의 영어 문장
        </h2>

        <div className="space-y-6">
          {texts.map((text, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`sentence-${i}`}
                  className="block text-[18px] font-medium text-ink-muted"
                >
                  {ORDINALS[i] ?? `${i + 1}번째`}
                </label>
                {texts.length > 1 && phase === "input" && (
                  <button
                    type="button"
                    onClick={() => removeSentence(i)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[16px] font-medium text-ink-muted hover:bg-paper-soft hover:text-ink transition-colors"
                    aria-label={`${ORDINALS[i] ?? `${i + 1}번째`} 문장 삭제`}
                  >
                    <X className="h-4 w-4" />
                    <span>삭제</span>
                  </button>
                )}
              </div>
              <Textarea
                id={`sentence-${i}`}
                value={text}
                onChange={(e) => setText(i, e.target.value)}
                placeholder="영어로 입력하세요"
                autoCapitalize="sentences"
                autoCorrect="off"
                spellCheck="false"
                disabled={phase !== "input"}
              />
            </div>
          ))}

          {texts.length < MAX_SENTENCES && phase === "input" && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              block
              onClick={addSentence}
            >
              <Plus className="h-5 w-5" />
              <span>문장 개수 추가하기</span>
            </Button>
          )}
        </div>

        {error && (
          <p className="text-[20px] text-accent" role="alert">
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          block
          size="xl"
          variant="primary"
          disabled={!canSubmit || phase !== "input"}
        >
          {phase === "checking" && "확인하는 중..."}
          {phase === "saving" && "저장하는 중..."}
          {phase === "input" && "확인"}
          {phase === "review" && "검토 중..."}
        </Button>
      </div>

      {/* 철자 검사 모달 */}
      {phase === "review" && reviews.length > 0 && (
        <SpellReviewDialog
          review={reviews[0]}
          onResolve={acceptCorrection}
        />
      )}
    </>
  );
}

function SpellReviewDialog({
  review,
  onResolve,
}: {
  review: SpellResult;
  onResolve: (index: number, accept: boolean) => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onResolve(review.index, false)}>
      <DialogContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <DialogTitle>이렇게 고쳐도 될까요?</DialogTitle>
            <DialogDescription>
              {review.reason || "문법을 다듬었어요"}
            </DialogDescription>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-[18px] font-medium text-ink-muted">
                원문
              </div>
              <div className="text-[22px] text-ink line-through decoration-2 decoration-ink-muted/40">
                {review.original}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[18px] font-medium text-ink-muted">
                제안
              </div>
              <div className="text-[26px] font-semibold text-accent leading-snug">
                {review.corrected}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onResolve(review.index, false)}
              block
            >
              그대로 두기
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onResolve(review.index, true)}
              block
            >
              수정 적용
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareLinkResult({ date }: { date: string }) {
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    setUrl(`${base}/${date}`);
  }, [date]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="space-y-10 pt-12">
      <div className="space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" strokeWidth={2.5} />
        </div>
        <h1 className="text-[40px] font-bold text-ink leading-tight">
          저장 완료!
        </h1>
        <p className="text-[22px] text-ink-muted">
          이 링크를 카톡으로 보내세요
        </p>
      </div>

      <div className="rounded-2xl bg-paper-soft p-5 shadow-soft">
        <p className="break-all text-[20px] text-ink font-mono">{url}</p>
      </div>

      <div className="space-y-3">
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
              <span>링크 복사하기</span>
            </>
          )}
        </Button>
        <Button asChild block size="xl" variant="outline">
          <Link href={`/${date}`}>
            <ExternalLink className="h-6 w-6" />
            <span>문장 목록으로 가기</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="xl"
          block
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-6 w-6" />
          <span>문장 더 올리기</span>
        </Button>
      </div>
    </div>
  );
}
