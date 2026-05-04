import { PageShell } from "@/components/layout/PageShell";
import { SentenceForm } from "@/components/upload/SentenceForm";

export const dynamic = "force-dynamic";

export default function NewPage() {
  return (
    <PageShell>
      <SentenceForm />
    </PageShell>
  );
}
