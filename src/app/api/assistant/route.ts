import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { NeonJourneyRepository } from "@/db/repositories/neon-journey-repository";
import { dubaiPack } from "@/data/destinations/dubai/pack";
import { answerJourneyQuestion } from "@/features/assistant/assistant-service";
import { OpenAIAssistantModel } from "@/features/assistant/openai-assistant-model";
import { apiError } from "@/lib/http-errors";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(1_500),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "UNAUTHENTICATED", "Please sign in.");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Please send a valid request.");
  }

  const body = requestSchema.safeParse(payload);
  if (!body.success) {
    return apiError(400, "INVALID_QUESTION", "Please ask a shorter question.");
  }

  try {
    const result = await answerJourneyQuestion(
      new NeonJourneyRepository(),
      new OpenAIAssistantModel(),
      userId,
      body.data.question,
      dubaiPack,
    );
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`event: response\ndata: ${JSON.stringify(result)}\n\n`),
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream",
      },
    });
  } catch {
    return apiError(
      503,
      "ASSISTANT_UNAVAILABLE",
      "ALIF could not answer just now. Your journey has not changed.",
      true,
    );
  }
}
