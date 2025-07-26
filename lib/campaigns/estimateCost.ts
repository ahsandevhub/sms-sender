export function estimateCost(message: string, recipientCount: number) {
  const characters = message.trim().length;
  const segments = characters === 0 ? 0 : Math.ceil(characters / 160);
  const estimatedCost = segments * recipientCount;

  return { characters, segments, estimatedCost };
}
