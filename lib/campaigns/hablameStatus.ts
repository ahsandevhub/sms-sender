// lib/campaigns/hablameStatus.ts

export function getHablameStatusReason(statusId?: number): string {
  const reasons: Record<number, string> = {
    100: "Message sent successfully",
    101: "Message queued for delivery",
    102: "Message rejected — invalid number or blocked",
    103: "Message failed — unknown error",
    104: "Delivery error — carrier unreachable",
    105: "Message expired — not delivered in time",
    106: "Message rejected due to spam filters",
    107: "Encoding issue — check special characters",
    108: "Exceeded daily or campaign limit",
  };

  if (!statusId) return "Unknown delivery status";
  return reasons[statusId] || `Unhandled status code: ${statusId}`;
}
