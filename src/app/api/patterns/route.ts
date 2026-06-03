import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { normalizeExtractedPattern } from "@/lib/patterns";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const GET = async () => {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("extracted_patterns")
      .select(
        `
        *,
        interview_sessions (
          theme
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ patterns: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: unknown;
      patterns?: unknown;
      pattern?: unknown;
    };
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const rawPatterns = Array.isArray(body.patterns) ? body.patterns : body.pattern ? [body.pattern] : [];

    if (!sessionId) {
      return jsonError("セッションIDがありません。", 400);
    }

    if (rawPatterns.length === 0) {
      return jsonError("保存するパターンがありません。", 400);
    }

    const rows = rawPatterns.map((pattern) => normalizeExtractedPattern(pattern, sessionId));
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("extracted_patterns").insert(rows).select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json({ patterns: data ?? [] }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
