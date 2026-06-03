"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import type { InterviewMessage, InterviewSession } from "@/lib/interviews";

type InterviewPayload = {
  session?: InterviewSession;
  messages?: InterviewMessage[];
  error?: string;
};

type MessagePayload = {
  message?: InterviewMessage;
  messages?: InterviewMessage[];
  error?: string;
};

type CompletePayload = {
  session?: InterviewSession;
  message?: InterviewMessage;
  error?: string;
};

const roleLabel = (role: InterviewMessage["role"]) => {
  if (role === "ai") {
    return "AI相談者";
  }

  if (role === "expert") {
    return "私の回答";
  }

  return "メモ";
};

const messageToneClass = (role: InterviewMessage["role"]) => {
  if (role === "ai") {
    return "border-blue-200 bg-blue-50";
  }

  if (role === "expert") {
    return "border-emerald-200 bg-emerald-50";
  }

  return "border-amber-200 bg-amber-50";
};

const getParamId = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default function InterviewPage() {
  const params = useParams();
  const sessionId = getParamId(params.id);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [isSelfLike, setIsSelfLike] = useState(false);
  const [saveForLater, setSaveForLater] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<
    "save-answer" | "next-customer" | "complete" | null
  >(null);

  const isCompleted = session?.status === "completed";

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
          throw new Error(payload.error ?? "ロールプレイを取得できませんでした。");
        }

        if (isActive) {
          setSession(payload.session);
          setMessages(payload.messages ?? []);
          setError("");
        }
      } catch (requestError) {
        if (isActive && !abortController.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : "ロールプレイ取得に失敗しました。",
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
    setNotice("");

    try {
      const response = await fetch(`/api/interviews/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          isSelfLike,
          saveForLater,
        }),
      });
      const payload = (await response.json()) as MessagePayload;

      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "回答を保存できませんでした。");
      }

      setMessages((current) => [...current, ...(payload.messages ?? [payload.message as InterviewMessage])]);
      setAnswer("");
      setIsSelfLike(false);
      setSaveForLater(false);
      setNotice("回答を保存しました。必要なら「相談者の次の発言」で会話を続けてください。");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "回答保存に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  const createNextCustomerUtterance = async () => {
    setPendingAction("next-customer");
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/interviews/${sessionId}/next-question`, {
        method: "POST",
      });
      const payload = (await response.json()) as MessagePayload;

      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "相談者の次の発言を生成できませんでした。");
      }

      setMessages((current) => [...current, payload.message as InterviewMessage]);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "相談者の発言生成に失敗しました。",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const completeRoleplay = async () => {
    setPendingAction("complete");
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/interviews/${sessionId}/complete`, {
        method: "POST",
      });
      const payload = (await response.json()) as CompletePayload;

      if (!response.ok || !payload.session) {
        throw new Error(payload.error ?? "ロールプレイを終了できませんでした。");
      }

      setSession(payload.session);
      if (payload.message) {
        setMessages((current) => [...current, payload.message as InterviewMessage]);
      }
      setNotice("このロールプレイを終了しました。");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ロールプレイ終了に失敗しました。");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-zinc-500">ロールプレイ</p>
            <h1 className="text-2xl font-semibold">{session?.theme ?? "読み込み中..."}</h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-700">
              AI相談者の発言に、葬儀社の担当者として返答してください。あなたの言い回し、深掘り質問、確認順序、配慮表現をそのまま保存します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isCompleted ? (
              <span className="rounded bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700">
                終了済み
              </span>
            ) : null}
            <button
              className="rounded border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-white disabled:cursor-not-allowed disabled:text-zinc-400"
              type="button"
              onClick={completeRoleplay}
              disabled={isLoading || isCompleted || pendingAction !== null}
            >
              {pendingAction === "complete" ? "終了中..." : "この会話を終了"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="grid gap-4 rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">会話ログ</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  AI相談者の発言と、あなたの担当者としての回答を時系列で保存します。
                </p>
              </div>
              <button
                className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                onClick={createNextCustomerUtterance}
                disabled={isLoading || isCompleted || pendingAction !== null}
              >
                {pendingAction === "next-customer" ? "生成中..." : "相談者の次の発言"}
              </button>
            </div>

            {isLoading ? (
              <p className="text-sm text-zinc-600">読み込み中...</p>
            ) : messages.length === 0 ? (
              <div className="rounded border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600">
                まだ発言がありません。「相談者の次の発言」で最初の相談を生成できます。
              </div>
            ) : (
              <div className="grid gap-3">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded border p-4 ${messageToneClass(message.role)}`}
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
              <h2 className="text-lg font-semibold">私の回答</h2>
              <p className="text-sm leading-6 text-zinc-600">
                葬儀社の担当者として、実際の接客に近い言葉で返答してください。個人情報や具体名は入力しないでください。
              </p>
              <textarea
                className="min-h-48 rounded border border-zinc-300 px-3 py-2 text-sm leading-7"
                placeholder="例: ご心配な点は費用だけでなく、ご親族からどう見られるかも含まれていそうですね..."
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={isCompleted}
              />

              <div className="grid gap-2 rounded border border-zinc-200 bg-zinc-50 p-3">
                <button
                  className={`rounded border px-3 py-2 text-left text-sm font-semibold ${
                    isSelfLike
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-zinc-300 bg-white text-zinc-800"
                  }`}
                  type="button"
                  onClick={() => setIsSelfLike((current) => !current)}
                  disabled={isCompleted}
                >
                  この回答は自分らしい
                </button>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                  <input
                    className="h-4 w-4"
                    type="checkbox"
                    checked={saveForLater}
                    onChange={(event) => setSaveForLater(event.target.checked)}
                    disabled={isCompleted}
                  />
                  この回答は後で使いたい
                </label>
              </div>

              <button
                className="rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                type="button"
                onClick={saveAnswer}
                disabled={isCompleted || pendingAction !== null || !answer.trim()}
              >
                {pendingAction === "save-answer" ? "保存中..." : "回答を保存"}
              </button>
            </section>

            <section className="grid gap-2 rounded border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-950">第一段階の目的</h2>
              <p>
                今は構造化抽出よりも、AI相談者との会話を続けて実際の回答データを大量に蓄積することを優先します。
              </p>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
