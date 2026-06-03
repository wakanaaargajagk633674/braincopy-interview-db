import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const POST = async (_request: Request, context: RouteContext) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return jsonError("セッションIDがありません。", 400);
    }

    const supabase = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .update({ status: "completed" })
      .eq("id", id)
      .select("*")
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const { data: message, error: messageError } = await supabase
      .from("interview_messages")
      .insert({
        session_id: id,
        role: "system",
        content: "ロールプレイ終了",
      })
      .select("*")
      .single();

    if (messageError) {
      throw messageError;
    }

    return NextResponse.json({ session, message });
  } catch (error) {
    return jsonError(error);
  }
};
