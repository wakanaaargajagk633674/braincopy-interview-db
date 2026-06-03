import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return jsonError("セッションIDがありません。", 400);
    }

    const supabase = createSupabaseAdminClient();
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    const { data: messages, error: messagesError } = await supabase
      .from("interview_messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return NextResponse.json({
      session,
      messages: messages ?? [],
    });
  } catch (error) {
    return jsonError(error);
  }
};
