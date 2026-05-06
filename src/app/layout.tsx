import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

export const metadata: Metadata = {
  title: "영어 공부하기",
  description: "오늘의 영어, 또박또박. 원어민 발음으로 듣는 영어 학습.",
  openGraph: {
    title: "영어 공부하기",
    description: "오늘의 영어, 또박또박.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF6EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
