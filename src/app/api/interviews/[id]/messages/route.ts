import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const POST = async (request: Request, context: RouteContext) => {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { content?: unknown };
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!id) {
      return jsonError("セッションIDがありません。", 400);
    }

    if (!content) {
      return jsonError("回答を入力してください。", 400);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("interview_messages")
      .insert({
        session_id: id,
        role: "expert",
        content,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
