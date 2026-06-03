import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as { theme?: unknown };
    const theme = typeof body.theme === "string" ? body.theme.trim() : "";

    if (!theme) {
      return jsonError("テーマを入力してください。", 400);
    }

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

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
};
