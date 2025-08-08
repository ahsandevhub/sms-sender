export function buildLog(
  to: string,
  message: string,
  status: "sent" | "failed",
  error?: string,
  channelMessageId?: string
) {
  return {
    to,
    message,
    status,
    error,
    timestamp: new Date(),
    channelMessageId,
  };
}
