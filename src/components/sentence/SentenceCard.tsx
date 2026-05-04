import type { Sentence } from "@/lib/db/schema";
import { PlayButton } from "./PlayButton";
import { StudyInfoToggle } from "./StudyInfoPanel";

export function SentenceCard({
  sentence,
  index,
}: {
  sentence: Sentence;
  index: number;
}) {
  const labels = [
    "첫 번째",
    "두 번째",
    "세 번째",
    "네 번째",
    "다섯 번째",
    "여섯 번째",
    "일곱 번째",
    "여덟 번째",
    "아홉 번째",
    "열 번째",
  ];
  return (
    <article className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-divider" />
        <span className="text-[18px] font-medium text-ink-muted">
          {labels[index] ?? `${index + 1}번째`}
        </span>
        <span className="h-px flex-1 bg-divider" />
      </div>

      <p className="text-study-sentence text-ink">{sentence.text}</p>

      <PlayButton
        sentenceId={sentence.id}
        text={sentence.text}
        audioUrl={sentence.audioUrl}
      />

      <StudyInfoToggle
        sentenceId={sentence.id}
        text={sentence.text}
        initialInfo={sentence.studyInfo ?? null}
      />
    </article>
  );
}
