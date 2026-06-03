import { SAFETY_NOTICE_ITEMS } from "@/constants/safety";

export const SafetyNotice = () => (
  <section className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <p className="font-semibold">入力時の注意</p>
      <ul className="grid flex-1 gap-1 sm:max-w-4xl">
        {SAFETY_NOTICE_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  </section>
);
