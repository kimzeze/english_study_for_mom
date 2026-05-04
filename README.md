# 엄마 영어 (Mom English)

엄마가 매일 영어 문장 3개를 올리면 원어민 발음으로 들을 수 있는 학습 사이트.

## 기술 스택

- **Next.js 15** (App Router, TypeScript)
- **TailwindCSS 3** + custom design system
- **Vercel Postgres** + **Drizzle ORM**
- **Vercel Blob** (음성파일 캐시)
- **OpenAI TTS** (음성 변환)
- **Anthropic Claude** (철자검사 + 학습정보 생성)

## 빠른 시작 (Quick Start)

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 셋업

`.env.example`을 `.env.local`로 복사하고 값을 채워넣으세요.

```bash
cp .env.example .env.local
```

### 3. DB 스키마 적용

Vercel Postgres가 연결되었다면:

```bash
pnpm db:push
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000 접속.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                 홈 (입력 진입 + 지난 학습)
│   ├── new/page.tsx             엄마용 입력 페이지
│   ├── [date]/page.tsx          날짜별 공유 페이지
│   ├── not-found.tsx            404
│   ├── layout.tsx               루트 레이아웃 + Pretendard
│   ├── globals.css              디자인 시스템 base
│   └── api/
│       ├── sentences/route.ts   POST: 저장, GET: 목록
│       ├── tts/route.ts         OpenAI TTS + Blob 캐싱
│       ├── spell-check/route.ts Claude 철자/문법 검사
│       └── study-info/route.ts  Claude 학습 정보 생성
├── components/
│   ├── ui/                      Button / Textarea / Card / Dialog
│   ├── layout/PageShell.tsx
│   ├── date/BigDate.tsx
│   ├── sentence/                PlayButton, SentenceCard, StudyInfoPanel, CopyLinkButton
│   ├── upload/SentenceForm.tsx  입력 + 철자검사 모달 + 저장완료
│   └── home/RecentDayList.tsx
└── lib/
    ├── db/                      Drizzle schema + client
    ├── openai.ts                lazy 클라이언트
    ├── anthropic.ts             lazy 클라이언트
    └── utils.ts                 cn / 날짜 포맷
```

## 설계 문서

- 요구사양: `.context/requirements.md`
- 디자인 사양: `.context/design.md`

## 디자인 토큰

| 토큰 | 값 |
|------|-----|
| `cream` | `#FAF7F0` (배경) |
| `cream-soft` | `#F4EFE3` (카드/입력) |
| `ink` | `#1A1814` (본문) |
| `ink-muted` | `#7A7468` (보조) |
| `terracotta` | `#B85C38` (CTA, 강조) |
| `sage` | `#5C7A5A` (성공) |
| `divider` | `#E5DFD3` (구분선) |

폰트: Pretendard Variable (한국어/영어 통합)
