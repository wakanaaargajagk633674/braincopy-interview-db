import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-6">
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-zinc-500">非公開MVP</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            AI相談者とのロールプレイで、接客回答ログを蓄積する
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-700">
            AIが葬儀相談者役を演じ、あなたが葬儀社の担当者として返答します。第一段階では、実際の言い回し、深掘り質問、確認順序をDBに録りためます。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/interviews/new"
            className="rounded border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400"
          >
            <p className="text-sm font-semibold text-zinc-500">Step 1</p>
            <h2 className="mt-2 text-xl font-semibold">ロールプレイ開始</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              相談テーマを選び、AI相談者の最初の発言を生成します。
            </p>
          </Link>
          <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Step 2</p>
            <h2 className="mt-2 text-xl font-semibold">担当者回答を保存</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              実際の接客に近い返答を、時系列の会話ログとして保存します。
            </p>
          </div>
          <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">Step 3</p>
            <h2 className="mt-2 text-xl font-semibold">相談者発言を継続</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              迷い、反論、追加不安を含む相談者の次の発言で会話を続けます。
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
