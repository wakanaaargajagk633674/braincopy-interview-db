import type { Database, ExtractedPatternCategory } from "@/types/database";

export type ExtractedPattern = Database["public"]["Tables"]["extracted_patterns"]["Row"];
export type ExtractedPatternInsert = Database["public"]["Tables"]["extracted_patterns"]["Insert"];

const EXTRACTED_PATTERN_CATEGORIES: ExtractedPatternCategory[] = [
  "hidden_anxiety",
  "first_question",
  "followup_question",
  "decision_point",
  "talk_example",
  "ng_expression",
  "next_action",
  "experience_rule",
  "other",
];

const isPatternCategory = (value: unknown): value is ExtractedPatternCategory =>
  typeof value === "string" &&
  EXTRACTED_PATTERN_CATEGORIES.includes(value as ExtractedPatternCategory);

const asStringOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const asConfidenceScore = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.min(1, Math.max(0, Number(value.toFixed(2))));
};

const removeJsonFence = (rawJson: string): string =>
  rawJson
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

export const normalizeExtractedPattern = (
  value: unknown,
  sessionId: string,
): ExtractedPatternInsert => {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return {
    session_id: sessionId,
    category: isPatternCategory(source.category) ? source.category : "other",
    customer_phrase: asStringOrNull(source.customer_phrase),
    hidden_anxiety: asStringOrNull(source.hidden_anxiety),
    first_question: asStringOrNull(source.first_question),
    followup_questions: asStringArray(source.followup_questions),
    decision_points: asStringArray(source.decision_points),
    talk_example: asStringOrNull(source.talk_example),
    ng_phrases: asStringArray(source.ng_phrases),
    next_action: asStringOrNull(source.next_action),
    confidence_score: asConfidenceScore(source.confidence_score),
  };
};

export const parseExtractedPatternsJson = (
  rawJson: string,
  sessionId: string,
): ExtractedPatternInsert[] => {
  const parsed = JSON.parse(removeJsonFence(rawJson)) as unknown;
  const items =
    Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" &&
          parsed !== null &&
          Array.isArray((parsed as { patterns?: unknown }).patterns)
        ? (parsed as { patterns: unknown[] }).patterns
        : [];

  return items.map((item) => normalizeExtractedPattern(item, sessionId));
};
