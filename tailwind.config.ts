import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F0",
        "cream-soft": "#F4EFE3",
        ink: "#1A1814",
        "ink-muted": "#7A7468",
        terracotta: {
          DEFAULT: "#B85C38",
          soft: "#E8C9B8",
        },
        sage: "#5C7A5A",
        divider: "#E5DFD3",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "study-sentence": ["32px", { lineHeight: "1.4", fontWeight: "600" }],
        "big-date": ["56px", { lineHeight: "1.0", fontWeight: "600" }],
      },
      borderRadius: {
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(26, 24, 20, 0.04)",
        "soft-lg": "0 4px 16px rgba(26, 24, 20, 0.06)",
      },
      keyframes: {
        "fade-up": {
          // 모달 중앙 정렬(transform: translate(-50%,-50%))과 충돌하지 않도록 opacity만 사용
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "equalizer-1": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        "equalizer-2": {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.5)" },
        },
        "equalizer-3": {
          "0%, 100%": { transform: "scaleY(0.7)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 240ms ease-out forwards",
        "fade-in": "fade-in 240ms ease-out forwards",
        "equalizer-1": "equalizer-1 800ms ease-in-out infinite",
        "equalizer-2": "equalizer-2 800ms ease-in-out infinite 100ms",
        "equalizer-3": "equalizer-3 800ms ease-in-out infinite 200ms",
      },
    },
  },
  plugins: [],
};

export default config;
