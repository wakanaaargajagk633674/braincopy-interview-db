import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createOpenAIChatCompletion } from "@/lib/openai/chat";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createInitialCustomerPrompt,
  createNextCustomerPrompt,
  ROLEPLAY_CUSTOMER_SYSTEM_PROMPT,
} from "@/prompts/roleplayCustomer";

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
        ? createNextCustomerPrompt(session.theme, messages)
        : createInitialCustomerPrompt(session.theme);

    const customerUtterance = await createOpenAIChatCompletion({
      messages: [
        {
          role: "system",
          content: ROLEPLAY_CUSTOMER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      maxTokens: 420,
      temperature: 0.7,
    });

    const { data: message, error: insertError } = await supabase
      .from("interview_messages")
      .insert({
        session_id: id,
        role: "ai",
        content: customerUtterance,
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
