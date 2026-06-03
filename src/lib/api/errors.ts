import { NextResponse } from "next/server";

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unexpected error.";
};

export const jsonError = (error: unknown, status = 500) =>
  NextResponse.json({ error: toErrorMessage(error) }, { status });
