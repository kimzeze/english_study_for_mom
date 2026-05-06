"use client";

import * as React from "react";
import { useNavigationProgress } from "./NavigationProgressContext";

export function NavigationProgress() {
  const { pendingCount } = useNavigationProgress();
  const isNavigating = pendingCount > 0;

  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const trickleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasNavigatingRef = React.useRef(false);

  React.useEffect(() => {
    if (isNavigating) {
      // 시작
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      setVisible(true);
      setProgress((p) => (p > 0 && p < 90 ? p : 12));
      trickleRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.1));
      }, 200);
      wasNavigatingRef.current = true;
    } else if (wasNavigatingRef.current) {
      // 완료 (이전에 navigating이었다가 false로 바뀐 시점에만 finish)
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
      setProgress(100);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      fadeRef.current = setTimeout(() => {
        setVisible(false);
        fadeRef.current = setTimeout(() => setProgress(0), 220);
      }, 180);
      wasNavigatingRef.current = false;
    }
  }, [isNavigating]);

  React.useEffect(() => {
    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-hidden={!visible}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease-out",
      }}
    >
      <div
        className="h-full bg-accent shadow-[0_0_8px_rgba(30,95,188,0.55)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? "none" : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
