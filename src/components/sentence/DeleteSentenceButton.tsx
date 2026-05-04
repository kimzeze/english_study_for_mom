"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DeleteSentenceButton({
  sentenceId,
  preview,
}: {
  sentenceId: number;
  preview: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sentences/${sentenceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[16px] font-medium text-ink-muted hover:bg-cream-soft hover:text-ink transition-colors"
        aria-label="이 문장 삭제하기"
      >
        <Trash2 className="h-4 w-4" />
        <span>삭제</span>
      </button>

      <Dialog open={open} onOpenChange={(o) => !deleting && setOpen(o)}>
        <DialogContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <DialogTitle>이 문장을 삭제할까요?</DialogTitle>
              <DialogDescription>
                삭제하면 다시 되돌릴 수 없어요.
              </DialogDescription>
            </div>

            <div className="rounded-2xl bg-cream-soft p-4">
              <p className="text-[20px] text-ink line-clamp-3">
                &ldquo;{preview}&rdquo;
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setOpen(false)}
                disabled={deleting}
                block
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirm}
                disabled={deleting}
                block
                className="bg-[#a83838] hover:bg-[#8e2e2e]"
              >
                {deleting ? "삭제 중..." : "네, 삭제할게요"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
