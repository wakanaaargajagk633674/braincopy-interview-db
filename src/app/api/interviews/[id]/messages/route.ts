import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type InterviewMessageInsert = Database["public"]["Tables"]["interview_messages"]["Insert"];

export const POST = async (request: Request, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      content?: unknown;
      isSelfLike?: unknown;
      saveForLater?: unknown;
    };
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const isSelfLike = body.isSelfLike === true;
    const saveForLater = body.saveForLater === true;

    if (!id) {
      return jsonError("セッションIDがありません。", 400);
    }

    if (!content) {
      return jsonError("回答を入力してください。", 400);
    }

    const supabase = createSupabaseAdminClient();
    const createdAt = Date.now();
    const rows: InterviewMessageInsert[] = [
      {
        session_id: id,
        role: "expert",
        content,
        created_at: new Date(createdAt).toISOString(),
      },
    ];

    if (isSelfLike) {
      rows.push({
        session_id: id,
        role: "system",
        content: "評価: 直前の担当者回答は自分らしい",
        created_at: new Date(createdAt + rows.length).toISOString(),
      });
    }

    if (saveForLater) {
      rows.push({
        session_id: id,
        role: "system",
        content: "メモ: 直前の担当者回答は後で使いたい",
        created_at: new Date(createdAt + rows.length).toISOString(),
      });
    }

    const { data, error } = await supabase
      .from("interview_messages")
      .insert(rows)
      .select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: data?.[0], messages: data ?? [] }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
