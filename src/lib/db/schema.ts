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
  meaning: string;
  pronunciation?: string;
};

export type StudyInfo = {
  translation: string;
  wordNotes: WordNote[];
  similarSentences: string[];
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
