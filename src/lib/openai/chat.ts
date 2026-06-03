import "server-only";

type OpenAIChatRole = "system" | "user" | "assistant";

type OpenAIChatMessage = {
  role: OpenAIChatRole;
  content: string;
};

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

type CreateChatCompletionParams = {
  messages: OpenAIChatMessage[];
  maxTokens?: number;
  temperature?: number;
};

export const createOpenAIChatCompletion = async ({
  messages,
  maxTokens = 800,
  temperature = 0.4,
}: CreateChatCompletionParams): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("Missing OpenAI API key.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as OpenAIChatCompletionResponse;

  if (!response.ok) {
    throw new Error(
      `OpenAI API error (${response.status}): ${payload.error?.message ?? response.statusText}`,
    );
  }

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI API returned an empty response.");
  }

  return content;
};
