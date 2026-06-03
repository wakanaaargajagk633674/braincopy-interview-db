import type { Database } from "@/types/database";

export type InterviewSession = Database["public"]["Tables"]["interview_sessions"]["Row"];
export type InterviewMessage = Database["public"]["Tables"]["interview_messages"]["Row"];

export const formatConversationLog = (messages: InterviewMessage[]): string =>
  messages
    .map((message) => {
      const speaker =
        message.role === "ai"
          ? "AI相談者"
          : message.role === "expert"
            ? "葬儀社担当者"
            : "システム";
      return `${speaker}: ${message.content}`;
    })
    .join("\n\n");
