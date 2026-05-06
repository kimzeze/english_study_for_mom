"use client";

import * as React from "react";
import { todayKey } from "@/lib/utils";

// "오늘" 배지를 client에서 비교 — 서버 prerender / ISR 시점의 today와
// 사용자 방문 시점의 today가 달라서 자정 직후 stale로 보이는 문제 해소.
export function TodayBadge({ date }: { date: string }) {
  const [isToday, setIsToday] = React.useState(false);

  React.useEffect(() => {
    setIsToday(todayKey() === date);
  }, [date]);

  if (!isToday) return null;
  return (
    <span className="text-[16px] font-medium text-accent">오늘</span>
  );
}
