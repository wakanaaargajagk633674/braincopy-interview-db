import type { Database } from "@/types/database";

export type InterviewSession = Database["public"]["Tables"]["interview_sessions"]["Row"];
export type InterviewMessage = Database["public"]["Tables"]["interview_messages"]["Row"];

export const formatConversationLog = (messages: InterviewMessage[]): string =>
  messages
    .map((message) => {
      const speaker =
        message.role === "ai" ? "AI質問" : message.role === "expert" ? "熟練者回答" : "システム";
      return `${speaker}: ${message.content}`;
    })
    .join("\n\n");

export const createFollowupQuestionPrompt = (
  theme: string,
  messages: InterviewMessage[],
): string => {
  const conversationLog = formatConversationLog(messages);

  return `
今回のインタビューテーマ:
${theme}

これまでの会話ログ:
${conversationLog || "まだ会話ログはありません。"}

上記を踏まえて、葬儀相談の熟練者に次に聞くべき1問だけを作ってください。
すでに聞いた内容を繰り返さず、判断軸、深掘り質問、言葉選び、NG表現、経験則のいずれかが具体化する質問にしてください。
`.trim();
};
