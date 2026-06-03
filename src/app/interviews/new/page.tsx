"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";

const THEME_OPTIONS = [
  "安く済ませたい相談",
  "家族葬にしたいが親戚が心配",
  "まだ亡くなっていない事前相談",
  "何から決めればよいか分からない相談",
  "お寺宗教者との付き合いが分からない相談",
  "直葬火葬式を希望する相談",
  "兄弟姉妹で意見が割れている相談",
  "故人らしさを出したい相談",
  "生活保護低予算の相談",
  "葬儀後の後悔トラブル相談",
];

type CreateRoleplayResponse = {
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

  const createRoleplay = async () => {
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
      const payload = (await response.json()) as CreateRoleplayResponse;

      if (!response.ok || !payload.session?.id) {
        throw new Error(payload.error ?? "ロールプレイを開始できませんでした。");
      }

      router.push(`/interviews/${payload.session.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ロールプレイ開始に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-zinc-500">ロールプレイ開始</p>
          <h1 className="text-2xl font-semibold">相談テーマを選択</h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-700">
            AI相談者が選択テーマに沿って最初の相談を投げかけます。実名、故人名、住所、電話番号などの個人情報は入力しないでください。
          </p>
        </div>

        {error ? (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium">
            相談テーマ
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
            カスタム相談テーマ
            <textarea
              className="min-h-28 rounded border border-zinc-300 px-3 py-2 text-base leading-7"
              placeholder="例: 親戚への説明が不安で、費用も抑えたい相談"
              value={customTheme}
              onChange={(event) => setCustomTheme(event.target.value)}
            />
          </label>

          <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            開始するロールプレイテーマ: {selectedTheme}
          </div>

          <button
            className="w-fit rounded bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            type="button"
            onClick={createRoleplay}
            disabled={isSubmitting || !selectedTheme}
          >
            {isSubmitting ? "AI相談者を準備中..." : "ロールプレイを開始"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
