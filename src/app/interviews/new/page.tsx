"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";

const THEME_OPTIONS = [
  "初回相談で、相談者の隠れた不安を見極める",
  "費用への不安が強い相談者への確認順序",
  "家族間で意見が割れている相談の聞き方",
  "宗教・菩提寺・お墓まわりの確認ポイント",
  "急ぎの搬送や安置で混乱している相談者への質問",
  "葬儀後の手続きや次の行動の案内",
];

type CreateInterviewResponse = {
  session?: {
    id: string;
  };
  error?: string;
};

export default function NewInterviewPage() {
  const router = useRouter();
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [customTheme, setCustomTheme] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedTheme = customTheme.trim() || theme;

  const createInterview = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });
      const payload = (await response.json()) as CreateInterviewResponse;

      if (!response.ok || !payload.session?.id) {
        throw new Error(payload.error ?? "セッションを作成できませんでした。");
      }

      router.push(`/interviews/${payload.session.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "セッション作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-zinc-500">新規インタビュー</p>
          <h1 className="text-2xl font-semibold">テーマを選択</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-700">
            実名、故人名、住所、電話番号などの個人情報は入力しないでください。テーマは抽象化した業務状況として残します。
          </p>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium">
            テーマ候補
            <select
              className="rounded border border-zinc-300 bg-white px-3 py-2 text-base"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            カスタムテーマ
            <textarea
              className="min-h-28 rounded border border-zinc-300 px-3 py-2 text-base leading-7"
              placeholder="例: 見積もりへの不信感が強い相談者に、最初に何を確認するか"
              value={customTheme}
              onChange={(event) => setCustomTheme(event.target.value)}
            />
          </label>

          <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            作成されるセッションテーマ: {selectedTheme}
          </div>

          <button
            className="w-fit rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            type="button"
            onClick={createInterview}
            disabled={isSubmitting || !selectedTheme}
          >
            {isSubmitting ? "作成中..." : "インタビューを作成"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
