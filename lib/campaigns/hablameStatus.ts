export function getHablameStatusReason(statusId?: number): string {
  const reasons: Record<number, string> = {
    1: "SMS sent successfully",
    101: "The destination number does not exist",
    102: "Destination country is not authorized",
    103: "Blocked due to spam",
    104: "Insufficient balance",
    105: "Number is on a blacklist",
    106: "Number is on national exclusion list (RNE)",
    107: "Recipient has opted out",
    108: "Account blocked (fraud prevention)",
    109: "Account blocked (policy)",
    110: "Account locked due to wallet restrictions",
    111: "No valid message content",
  };

  if (statusId === undefined || statusId === null)
    return "Unknown delivery status";
  return reasons[statusId] || `Unhandled status code: ${statusId}`;
}
