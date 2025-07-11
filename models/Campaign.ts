// models/Campaign.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  country: string;
  numbers: string[];
  message: string;
  segments: number;
  estimatedCost: number;
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
  name: { type: String, required: true },
  country: { type: String, required: true },
  numbers: { type: [String], required: true },
  message: { type: String, required: true },
  segments: { type: Number, required: true },
  estimatedCost: { type: Number, required: true },
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
