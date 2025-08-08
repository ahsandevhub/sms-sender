export type SmsLogEntry = {
  to: string;
  status: "sent" | "failed";
  error?: string;
  timestamp?: Date;
  channelMessageId?: string;
  originalMessage?: string;
};
