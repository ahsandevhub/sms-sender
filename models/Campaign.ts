// models/Campaign.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  numbers: string[];
  message: string;
  results: {
    to: string;
    status: "sent" | "failed";
    error?: string;
  }[];
  totalSent: number;
  successful: number;
  failed: number;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  numbers: { type: [String], required: true },
  message: { type: String, required: true },
  results: [
    {
      to: String,
      status: { type: String, enum: ["sent", "failed"] },
      error: String,
    },
  ],
  totalSent: { type: Number, required: true },
  successful: { type: Number, required: true },
  failed: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);
