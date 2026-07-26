import "server-only";

import OpenAI from "openai";

import { getServerEnvironment } from "@/lib/env";

let cached: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  cached ??= new OpenAI({
    apiKey: getServerEnvironment().OPENAI_API_KEY,
  });
  return cached;
}
