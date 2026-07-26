import type { DestinationPack } from "@/features/journey/journey-types";

import { dubaiPack } from "./dubai/pack";

export const defaultDestinationCode = "AE-DXB";

const packs: Record<string, DestinationPack> = {
  [dubaiPack.destinationCode]: dubaiPack,
};

export function getDestinationPack(
  destinationCode: string = defaultDestinationCode,
): DestinationPack {
  const pack = packs[destinationCode];
  if (!pack) {
    throw new Error(`Unknown destination pack: ${destinationCode}`);
  }
  return pack;
}

export function listDestinationCodes(): string[] {
  return Object.keys(packs);
}
