"use client";

import * as React from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlayState = "idle" | "loading" | "playing";

export function PlayButton({
  audioUrl,
  text,
  sentenceId,
}: {
  audioUrl?: string | null;
  text: string;
  sentenceId: number;
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
      className="inline-block h-2 w-2 rounded-full bg-current opacity-60"
      style={{
        animation: `equalizer-1 800ms ease-in-out ${delay}ms infinite`,
      }}
    />
  );
}

function Equalizer() {
  return (
    <span className="inline-flex items-end gap-[3px] h-5">
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-1" />
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-2" />
      <span className="block w-[3px] h-full bg-current origin-bottom animate-equalizer-3" />
    </span>
  );
}

export { PlayButton as default };
