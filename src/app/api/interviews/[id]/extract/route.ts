import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { formatConversationLog } from "@/lib/interviews";
import { createOpenAIChatCompletion } from "@/lib/openai/chat";
import { parseExtractedPatternsJson } from "@/lib/patterns";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createExtractorPrompt, EXTRACTOR_SYSTEM_PROMPT } from "@/prompts/extractor";

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
    const { data: messages, error: messagesError } = await supabase
      .from("interview_messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return jsonError("抽出する会話ログがありません。", 400);
    }

    const expertMessageCount = messages.filter((message) => message.role === "expert").length;

    if (expertMessageCount === 0) {
      return jsonError("熟練者の回答を保存してから抽出してください。", 400);
    }

    const rawJson = await createOpenAIChatCompletion({
      messages: [
        {
          role: "system",
          content: EXTRACTOR_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: createExtractorPrompt(formatConversationLog(messages)),
        },
      ],
      maxTokens: 1600,
      temperature: 0.2,
    });

    const patterns = parseExtractedPatternsJson(rawJson, id);

    if (patterns.length === 0) {
      return jsonError("抽出結果が空でした。会話ログを増やして再実行してください。", 422);
    }

    return NextResponse.json({
      patterns,
      rawJson,
    });
  } catch (error) {
    return jsonError(error);
  }
};
