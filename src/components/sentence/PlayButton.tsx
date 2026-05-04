"use client";

import * as React from "react";
import { Play } from "lucide-react";
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

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  }, []);

  const play = async () => {
    if (state === "playing") {
      stop();
      return;
    }

    let url = cachedUrlRef.current;

    if (!url) {
      setState("loading");
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentenceId, text }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const data = await res.json();
        url = data.audioUrl as string;
        cachedUrlRef.current = url;
      } catch (e) {
        console.error(e);
        setState("idle");
        return;
      }
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setState("idle");
    audio.onerror = () => setState("idle");
    setState("playing");
    try {
      await audio.play();
    } catch {
      setState("idle");
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={play}
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
          <Equalizer />
        ) : (
          <Play className="h-5 w-5 fill-current" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={play}
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
          <Equalizer />
          <span>듣는 중</span>
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

function Equalizer() {
  return (
    <span className="inline-flex items-end gap-[3px] h-4">
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-1" />
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-2" />
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-3" />
    </span>
  );
}

export { PlayButton as default };
