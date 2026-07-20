import { NextResponse } from "next/server";

export function apiError(
  status: number,
  code: string,
  message: string,
  retryable = false,
) {
  return NextResponse.json(
    { error: { code, message, retryable } },
    { status },
  );
}
