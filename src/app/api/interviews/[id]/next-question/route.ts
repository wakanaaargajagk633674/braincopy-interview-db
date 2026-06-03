import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createFollowupQuestionPrompt } from "@/lib/interviews";
import { createOpenAIChatCompletion } from "@/lib/openai/chat";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createInterviewerPrompt, INTERVIEWER_SYSTEM_PROMPT } from "@/prompts/interviewer";

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

    const userPrompt =
      messages && messages.length > 0
        ? createFollowupQuestionPrompt(session.theme, messages)
        : createInterviewerPrompt(session.theme);

    const question = await createOpenAIChatCompletion({
      messages: [
        {
          role: "system",
          content: INTERVIEWER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      maxTokens: 500,
      temperature: 0.5,
    });

    const { data: message, error: insertError } = await supabase
      .from("interview_messages")
      .insert({
        session_id: id,
        role: "ai",
        content: question,
      })
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
