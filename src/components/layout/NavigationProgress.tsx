"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPathRef = useRef(pathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      if (e.defaultPrevented) return;

      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    };
    // bubble phase: 다른 onClick이 preventDefault했을 때 정확히 e.defaultPrevented가 잡힘
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    finish();
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  function start() {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    setVisible(true);
    setProgress(12);
    trickleRef.current = setInterval(() => {
      setProgress((p) => (p >= 85 ? p : p + (85 - p) * 0.1));
    }, 200);
    safetyRef.current = setTimeout(() => finish(), 8000);
  }

  function finish() {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
    setProgress(100);
    if (fadeRef.current) clearTimeout(fadeRef.current);
    fadeRef.current = setTimeout(() => {
      setVisible(false);
      fadeRef.current = setTimeout(() => setProgress(0), 220);
    }, 200);
  }

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
