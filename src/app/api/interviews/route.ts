import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createOpenAIChatCompletion } from "@/lib/openai/chat";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createInitialCustomerPrompt,
  ROLEPLAY_CUSTOMER_SYSTEM_PROMPT,
} from "@/prompts/roleplayCustomer";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as { theme?: unknown };
    const theme = typeof body.theme === "string" ? body.theme.trim() : "";

    if (!theme) {
      return jsonError("テーマを入力してください。", 400);
    }

    const firstCustomerUtterance = await createOpenAIChatCompletion({
      messages: [
        {
          role: "system",
          content: ROLEPLAY_CUSTOMER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: createInitialCustomerPrompt(theme),
        },
      ],
      maxTokens: 420,
      temperature: 0.7,
    });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("interview_sessions")
      .insert({
        theme,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const createdAt = Date.now();
    const { data: messages, error: messagesError } = await supabase
      .from("interview_messages")
      .insert([
        {
          session_id: data.id,
          role: "system",
          content: `シナリオ設定: ロールプレイテーマ「${theme}」`,
          created_at: new Date(createdAt).toISOString(),
        },
        {
          session_id: data.id,
          role: "ai",
          content: firstCustomerUtterance,
          created_at: new Date(createdAt + 1).toISOString(),
        },
      ])
      .select("*");

    if (messagesError) {
      throw messagesError;
    }

    return NextResponse.json({ session: data, messages: messages ?? [] }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
