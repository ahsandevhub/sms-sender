// models/CustomerMessage.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICustomerMessage extends Document {
  campaignId: mongoose.Types.ObjectId;
  to: string;
  message: string;
  type: "sms" | "whatsapp" | "telegram" | "email";
  status: "sent" | "failed";
  provider: string;
  senderId: string;
  error?: string;
  timestamp: Date;
  channelMessageId?: string;
}

const CustomerMessageSchema = new Schema<ICustomerMessage>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["sms", "whatsapp", "telegram", "email"],
    required: true,
  },
  status: { type: String, enum: ["sent", "failed"], required: true },
  provider: { type: String, required: true },
  senderId: { type: String, required: true },
  error: { type: String },
  timestamp: { type: Date, default: Date.now },
  channelMessageId: { type: String },
});

export default mongoose.models.CustomerMessage ||
  mongoose.model<ICustomerMessage>("CustomerMessage", CustomerMessageSchema);
