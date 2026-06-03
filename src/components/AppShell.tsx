import Link from "next/link";

import { SafetyNotice } from "@/components/SafetyNotice";

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => (
  <div className="min-h-screen bg-stone-50 text-zinc-950">
    <SafetyNotice />
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold">
          脳内コピーインタビューDB
        </Link>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded border border-zinc-300 px-3 py-2 hover:bg-zinc-50" href="/">
            ダッシュボード
          </Link>
          <Link
            className="rounded border border-zinc-300 px-3 py-2 hover:bg-zinc-50"
            href="/interviews/new"
          >
            ロールプレイ開始
          </Link>
          <Link
            className="rounded border border-zinc-300 px-3 py-2 hover:bg-zinc-50"
            href="/patterns"
          >
            保存済みパターン
          </Link>
        </nav>
      </div>
    </header>
    <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
  </div>
);
