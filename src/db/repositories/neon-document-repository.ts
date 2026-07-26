import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { documentChecks, users } from "@/db/schema";
import type { DocumentStatus } from "@/features/documents/document-readiness";

export interface DocumentRepository {
  listStatuses(clerkUserId: string): Promise<Map<string, DocumentStatus>>;
  setStatus(input: {
    clerkUserId: string;
    documentKey: string;
    status: DocumentStatus;
  }): Promise<void>;
}

export class NeonDocumentRepository implements DocumentRepository {
  async listStatuses(clerkUserId: string): Promise<Map<string, DocumentStatus>> {
    const db = getDb();
    const rows = await db
      .select({
        documentKey: documentChecks.documentKey,
        status: documentChecks.status,
      })
      .from(documentChecks)
      .innerJoin(users, eq(documentChecks.userId, users.id))
      .where(eq(users.clerkUserId, clerkUserId));
    return new Map(rows.map((row) => [row.documentKey, row.status]));
  }

  async setStatus(input: {
    clerkUserId: string;
    documentKey: string;
    status: DocumentStatus;
  }): Promise<void> {
    const db = getDb();
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, input.clerkUserId))
      .limit(1);
    if (!user) throw new Error("User not found");

    await db
      .insert(documentChecks)
      .values({
        userId: user.id,
        documentKey: input.documentKey,
        status: input.status,
      })
      .onConflictDoUpdate({
        target: [documentChecks.userId, documentChecks.documentKey],
        set: { status: input.status, updatedAt: new Date() },
      });
  }
}
