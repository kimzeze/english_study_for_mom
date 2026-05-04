"use client";

import * as React from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlayState = "idle" | "loading" | "playing";

export function PlayButton({
  audioUrl,
  text,
  sentenceId,
  variant = "default",
}: {
  audioUrl?: string | null;
  text: string;
  sentenceId: number;
  variant?: "default" | "compact";
}) {
  const [state, setState] = React.useState<PlayState>("idle");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const cachedUrlRef = React.useRef<string | null>(audioUrl ?? null);
  const abortRef = React.useRef<AbortController | null>(null);
  const sessionRef = React.useRef(0);

  // 단일 Audio 엘리먼트 유지 — 재생할 때마다 새로 만들지 않음
  React.useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const stopImmediately = React.useCallback(() => {
    sessionRef.current += 1; // 진행 중인 비동기 흐름 무효화
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState("idle");
  }, []);

  const handleClick = async () => {
    // 재생 중 클릭 → 멈춤 (토글)
    if (state === "playing" || state === "loading") {
      stopImmediately();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const mySession = ++sessionRef.current;

    // URL 확보 (이미 캐시되어 있으면 즉시)
    let url = cachedUrlRef.current;
    if (!url) {
      setState("loading");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentenceId, text }),
          signal: controller.signal,
        });
        if (mySession !== sessionRef.current) return;
        if (!res.ok) throw new Error("TTS failed");
        const data = await res.json();
        url = data.audioUrl as string;
        cachedUrlRef.current = url;
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        if (mySession !== sessionRef.current) return;
        console.error(e);
        setState("idle");
        return;
      }
    }

    if (mySession !== sessionRef.current || !url) return;

    // 이전 재생을 정리하고 새 src로 교체
    audio.pause();
    audio.currentTime = 0;
    audio.src = url;

    audio.onended = () => {
      if (mySession === sessionRef.current) setState("idle");
    };
    audio.onerror = () => {
      if (mySession === sessionRef.current) setState("idle");
    };

    setState("playing");
    try {
      await audio.play();
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      if (mySession === sessionRef.current) setState("idle");
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          "bg-accent text-paper shadow-soft transition-all duration-150",
          "hover:bg-[#1a4f9f] hover:shadow-soft-lg active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        )}
        aria-label={state === "playing" ? "음성 멈추기" : "발음 듣기"}
      >
        {state === "loading" ? (
          <span className="flex items-center gap-[3px]">
            <Dot delay={0} />
            <Dot delay={120} />
            <Dot delay={240} />
          </span>
        ) : state === "playing" ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      block
      variant="primary"
      size="xl"
      aria-label={state === "playing" ? "음성 멈추기" : "발음 듣기"}
      className="relative"
    >
      {state === "loading" ? (
        <span className="flex items-center gap-1">
          <Dot delay={0} />
          <Dot delay={120} />
          <Dot delay={240} />
        </span>
      ) : state === "playing" ? (
        <>
          <Square className="h-5 w-5 fill-current" />
          <span>멈추기</span>
        </>
      ) : (
        <>
          <Play className="h-6 w-6 fill-current" />
          <span>발음 듣기</span>
        </>
      )}
    </Button>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
      style={{
        animation: `equalizer-1 800ms ease-in-out ${delay}ms infinite`,
      }}
    />
  );
}

export { PlayButton as default };
