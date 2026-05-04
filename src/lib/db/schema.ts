import {
  pgTable,
  date,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

export const dayPosts = pgTable("day_posts", {
  date: date("date").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WordNote = {
  word: string;
  pronunciation: string; // 한글 발음 표기 (예: "스쿨")
  meaning: string;
  example?: string; // 짧은 예문 (선택)
};

export type SimilarSentence = {
  english: string;
  korean: string;
};

export type StudyInfo = {
  translation: string;
  pronunciation?: string; // 전체 문장의 한글 발음 (새 포맷)
  wordNotes: WordNote[];
  grammarTip?: string; // 한 줄 문법/어법 포인트 (새 포맷)
  // 구버전과의 호환을 위해 string[] | SimilarSentence[] 모두 허용
  similarSentences: SimilarSentence[] | string[];
  usageContext: string;
};

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  date: date("date")
    .notNull()
    .references(() => dayPosts.date, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  text: text("text").notNull(),
  audioUrl: text("audio_url"),
  studyInfo: jsonb("study_info").$type<StudyInfo>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DayPost = typeof dayPosts.$inferSelect;
export type Sentence = typeof sentences.$inferSelect;
export type NewSentence = typeof sentences.$inferInsert;
