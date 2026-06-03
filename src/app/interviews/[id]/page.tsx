"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import type { InterviewMessage, InterviewSession } from "@/lib/interviews";
import type { ExtractedPatternInsert } from "@/lib/patterns";

type InterviewPayload = {
  session?: InterviewSession;
  messages?: InterviewMessage[];
  error?: string;
};

type MessagePayload = {
  message?: InterviewMessage;
  error?: string;
};

type ExtractPayload = {
  patterns?: ExtractedPatternInsert[];
  error?: string;
};

type SavePatternsPayload = {
  patterns?: ExtractedPatternInsert[];
  error?: string;
};

const roleLabel = (role: InterviewMessage["role"]) => {
  if (role === "ai") {
    return "AIの質問";
  }

  if (role === "expert") {
    return "私の回答";
  }

  return "システム";
};

const getParamId = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default function InterviewPage() {
  const params = useParams();
  const sessionId = getParamId(params.id);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [patterns, setPatterns] = useState<ExtractedPatternInsert[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<
    "save-answer" | "next-question" | "extract" | "save-patterns" | null
  >(null);
  const [savedPatternCount, setSavedPatternCount] = useState(0);

  const hasExpertAnswer = useMemo(
    () => messages.some((message) => message.role === "expert"),
    [messages],
  );

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    const loadInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${sessionId}`, {
          signal: abortController.signal,
        });
        const payload = (await response.json()) as InterviewPayload;

        if (!response.ok || !payload.session) {
          throw new Error(payload.error ?? "セッションを取得できませんでした。");
        }

        if (isActive) {
          setSession(payload.session);
          setMessages(payload.messages ?? []);
          setError("");
        }
      } catch (requestError) {
        if (isActive && !abortController.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : "セッション取得に失敗しました。",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInterview();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [sessionId]);

  const saveAnswer = async () => {
    const content = answer.trim();

    if (!content) {
      setError("回答を入力してください。");
      return;
    }

    setPendingAction("save-answer");
    setError("");

    try {
      const response = await fetch(`/api/interviews/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const payload = (await response.json()) as MessagePayload;

      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "回答を保存できませんでした。");
      }

      setMessages((current) => [...current, payload.message as InterviewMessage]);
      setAnswer("");
      setPatterns([]);
      setSavedPatternCount(0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "回答保存に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  const createNextQuestion = async () => {
    setPendingAction("next-question");
    setError("");

    try {
      const response = await fetch(`/api/interviews/${sessionId}/next-question`, {
        method: "POST",
      });
      const payload = (await response.json()) as MessagePayload;

      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "次の質問を生成できませんでした。");
      }

      setMessages((current) => [...current, payload.message as InterviewMessage]);
      setPatterns([]);
      setSavedPatternCount(0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "質問生成に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  const extractPatterns = async () => {
    setPendingAction("extract");
    setError("");
    setSavedPatternCount(0);

    try {
      const response = await fetch(`/api/interviews/${sessionId}/extract`, {
        method: "POST",
      });
      const payload = (await response.json()) as ExtractPayload;

      if (!response.ok || !payload.patterns) {
        throw new Error(payload.error ?? "構造化抽出に失敗しました。");
      }

      setPatterns(payload.patterns);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "構造化抽出に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  const savePatterns = async () => {
    if (patterns.length === 0) {
      setError("保存する抽出結果がありません。");
      return;
    }

    setPendingAction("save-patterns");
    setError("");

    try {
      const response = await fetch("/api/patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          patterns,
        }),
      });
      const payload = (await response.json()) as SavePatternsPayload;

      if (!response.ok || !payload.patterns) {
        throw new Error(payload.error ?? "パターンを保存できませんでした。");
      }

      setSavedPatternCount(payload.patterns.length);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "パターン保存に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-zinc-500">インタビュー</p>
            <h1 className="text-2xl font-semibold">{session?.theme ?? "読み込み中..."}</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-700">
              AIは熟練者に質問します。相談者の個人情報や具体名は入力しないでください。
            </p>
          </div>
          <Link className="rounded border border-zinc-300 px-3 py-2 text-sm hover:bg-white" href="/patterns">
            パターン一覧へ
          </Link>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {savedPatternCount > 0 ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {savedPatternCount}件のパターンを保存しました。
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-4 rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">会話ログ</h2>
              <button
                className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                onClick={createNextQuestion}
                disabled={isLoading || pendingAction !== null}
              >
                {pendingAction === "next-question" ? "生成中..." : "次の質問"}
              </button>
            </div>

            {isLoading ? (
              <p className="text-sm text-zinc-600">読み込み中...</p>
            ) : messages.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600">
                まだ質問がありません。「次の質問」で最初の質問を生成してください。
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded border p-4 ${
                      message.role === "ai"
                        ? "border-blue-200 bg-blue-50"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                      <span>{roleLabel(message.role)}</span>
                      <time dateTime={message.created_at}>
                        {new Date(message.created_at).toLocaleString("ja-JP")}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-900">{message.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="grid content-start gap-4">
            <section className="grid gap-3 rounded border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">回答入力</h2>
              <p className="text-sm leading-6 text-zinc-600">
                実名、故人名、住所、電話番号などは入力しないでください。状況は匿名化・抽象化してください。
              </p>
              <textarea
                className="min-h-44 rounded border border-zinc-300 px-3 py-2 text-sm leading-7"
                placeholder="熟練者としての判断順序、確認したい背景、言葉選びなどを入力"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
              <button
                className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                onClick={saveAnswer}
                disabled={pendingAction !== null || !answer.trim()}
              >
                {pendingAction === "save-answer" ? "保存中..." : "回答を保存"}
              </button>
            </section>

            <section className="grid gap-3 rounded border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">構造化抽出</h2>
              <p className="text-sm leading-6 text-zinc-600">
                会話ログから extracted_patterns に保存する候補JSONを生成します。保存前に内容を確認してください。
              </p>
              <button
                className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                onClick={extractPatterns}
                disabled={pendingAction !== null || !hasExpertAnswer}
              >
                {pendingAction === "extract" ? "抽出中..." : "構造化抽出"}
              </button>
              <button
                className="rounded border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:text-zinc-400"
                type="button"
                onClick={savePatterns}
                disabled={pendingAction !== null || patterns.length === 0}
              >
                {pendingAction === "save-patterns" ? "保存中..." : "パターン保存"}
              </button>
            </section>
          </aside>
        </div>

        {patterns.length > 0 ? (
          <section className="grid gap-4 rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">抽出結果確認</h2>
              <p className="text-sm text-zinc-600">{patterns.length}件の候補</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {patterns.map((pattern, index) => (
                <article key={`${pattern.category}-${index}`} className="rounded border border-zinc-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">候補 {index + 1}</h3>
                    <span className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                      {pattern.category}
                    </span>
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold text-zinc-500">相談者の言葉</dt>
                      <dd className="mt-1 whitespace-pre-wrap">{pattern.customer_phrase ?? "未抽出"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">隠れた不安</dt>
                      <dd className="mt-1 whitespace-pre-wrap">{pattern.hidden_anxiety ?? "未抽出"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">最初の質問</dt>
                      <dd className="mt-1 whitespace-pre-wrap">{pattern.first_question ?? "未抽出"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">深掘り質問</dt>
                      <dd className="mt-1 whitespace-pre-wrap">
                        {pattern.followup_questions?.length
                          ? pattern.followup_questions.join("\n")
                          : "未抽出"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">判断ポイント</dt>
                      <dd className="mt-1 whitespace-pre-wrap">
                        {pattern.decision_points?.length ? pattern.decision_points.join("\n") : "未抽出"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">言い回し例</dt>
                      <dd className="mt-1 whitespace-pre-wrap">{pattern.talk_example ?? "未抽出"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">NG表現</dt>
                      <dd className="mt-1 whitespace-pre-wrap">
                        {pattern.ng_phrases?.length ? pattern.ng_phrases.join("\n") : "未抽出"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">次の行動</dt>
                      <dd className="mt-1 whitespace-pre-wrap">{pattern.next_action ?? "未抽出"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-zinc-500">信頼度</dt>
                      <dd className="mt-1">{pattern.confidence_score ?? "未抽出"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </AppShell>
  );
}
