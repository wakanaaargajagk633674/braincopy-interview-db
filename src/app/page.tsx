import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-zinc-500">非公開MVP</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            熟練者の判断軸を、質問ログから構造化する
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-700">
            AIが葬儀相談の熟練者に1問ずつ質問し、回答を保存します。会話ログから抽出したパターンは確認後にDBへ保存できます。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/interviews/new"
            className="rounded border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
          >
            <p className="text-sm font-semibold text-zinc-500">Step 1</p>
            <h2 className="mt-2 text-xl font-semibold">インタビュー開始</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              テーマを選び、インタビューセッションを作成します。
            </p>
          </Link>
          <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Step 2</p>
            <h2 className="mt-2 text-xl font-semibold">会話ログ保存</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              AIの質問と熟練者の回答を時系列で保存します。
            </p>
          </div>
          <Link
            href="/patterns"
            className="rounded border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
          >
            <p className="text-sm font-semibold text-zinc-500">Step 3</p>
            <h2 className="mt-2 text-xl font-semibold">パターン確認</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              抽出・保存済みの判断軸、質問、言い回しを一覧で確認します。
            </p>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
