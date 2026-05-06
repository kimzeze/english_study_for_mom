import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await ctx.params;
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(sentences)
    .where(eq(sentences.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Blob 음성 파일도 같이 삭제 (있으면)
  if (existing.audioUrl) {
    try {
      await del(existing.audioUrl);
    } catch (e) {
      console.warn("Failed to delete blob:", e);
    }
  }

  await db.delete(sentences).where(eq(sentences.id, id));

  // 삭제한 문장이 있던 날짜 페이지와 홈을 무효화
  revalidatePath("/");
  revalidatePath(`/${existing.date}`);

  return NextResponse.json({ ok: true });
}
