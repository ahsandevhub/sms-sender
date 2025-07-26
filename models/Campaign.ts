// models/Campaign.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  type: "sms" | "whatsapp" | "telegram" | "email";
  country: string;
  provider: string;
  senderId: string;
  language: "english" | "spanish" | "bengali" | string;
  message: string;
  characters: number;
  segments: number;
  estimatedCost: number;
  numbers: string[];
  results: {
    to: string;
    message: string; // ✅ Added field to store personalized message
    status: "sent" | "failed";
    error?: string;
    timestamp?: Date;
    channelMessageId?: string;
  }[];
  totalSent: number;
  successful: number;
  failed: number;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["sms", "whatsapp", "telegram", "email"],
    required: true,
  },
  country: { type: String, required: true },
  provider: { type: String, required: true },
  senderId: { type: String, required: true },
  language: {
    type: String,
    enum: ["english", "spanish", "bengali"],
    required: true,
  },
  message: { type: String, required: true },
  characters: { type: Number, required: true },
  segments: { type: Number, required: true },
  estimatedCost: { type: Number, required: true },
  numbers: { type: [String], required: true },
  results: [
    {
      to: { type: String, required: true },
      message: { type: String, required: true }, // ✅ correct definition
      status: { type: String, enum: ["sent", "failed"], required: true },
      error: { type: String },
      timestamp: { type: Date, default: Date.now },
      channelMessageId: { type: String },
    },
  ],
  totalSent: { type: Number, required: true },
  successful: { type: Number, required: true },
  failed: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);
