"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import type { ExtractedPattern } from "@/lib/patterns";

type PatternListItem = ExtractedPattern & {
  interview_sessions?: {
    theme: string | null;
  } | null;
};

type PatternsPayload = {
  patterns?: PatternListItem[];
  error?: string;
};

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternListItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatterns = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/patterns");
        const payload = (await response.json()) as PatternsPayload;

        if (!response.ok || !payload.patterns) {
          throw new Error(payload.error ?? "パターン一覧を取得できませんでした。");
        }

        setPatterns(payload.patterns);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "パターン取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPatterns();
  }, []);

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-zinc-500">保存済み</p>
            <h1 className="text-2xl font-semibold">パターン一覧</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-700">
              extracted_patterns に保存された判断軸、質問、言い回しを確認します。
            </p>
          </div>
          <Link
            className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
            href="/interviews/new"
          >
            新規インタビュー
          </Link>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-zinc-600">読み込み中...</p>
        ) : patterns.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
            保存済みパターンはまだありません。
          </div>
        ) : (
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <article key={pattern.id} className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-500">
                      {pattern.interview_sessions?.theme ?? "テーマ未取得"}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {pattern.customer_phrase ?? pattern.hidden_anxiety ?? pattern.category}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-zinc-100 px-2 py-1 text-zinc-700">{pattern.category}</span>
                    <span className="rounded bg-zinc-100 px-2 py-1 text-zinc-700">
                      信頼度 {pattern.confidence_score ?? "未設定"}
                    </span>
                  </div>
                </div>

                <dl className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-zinc-500">隠れた不安</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">{pattern.hidden_anxiety ?? "未入力"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">最初の質問</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">{pattern.first_question ?? "未入力"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">深掘り質問</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">
                      {pattern.followup_questions.length ? pattern.followup_questions.join("\n") : "未入力"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">判断ポイント</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">
                      {pattern.decision_points.length ? pattern.decision_points.join("\n") : "未入力"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">言い回し例</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">{pattern.talk_example ?? "未入力"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">NG表現</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">
                      {pattern.ng_phrases.length ? pattern.ng_phrases.join("\n") : "未入力"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">次の行動</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6">{pattern.next_action ?? "未入力"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-500">保存日時</dt>
                    <dd className="mt-1">{new Date(pattern.created_at).toLocaleString("ja-JP")}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
