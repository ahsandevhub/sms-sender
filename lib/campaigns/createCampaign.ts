import Campaign from "@/models/Campaign";

interface CampaignInput {
  name: string;
  type: "sms" | "whatsapp" | "email" | "telegram";
  provider: string;
  senderId: string;
  country: string;
  language: string;
  message: string;
  characters: number;
  segments: number;
  estimatedCost: number;
  numbers: string[];
  results: {
    to: string;
    status: "sent" | "failed";
    message: string;
    error?: string;
    timestamp?: Date;
    channelMessageId?: string;
  }[];
}

export async function createCampaign(data: CampaignInput) {
  const { results, ...rest } = data;

  const successful = results.filter((r) => r.status === "sent").length;
  const failed = results.length - successful;

  const campaign = new Campaign({
    ...rest,
    results,
    totalSent: results.length,
    successful,
    failed,
  });

  await campaign.save();
  return campaign;
}

// lib/campaigns/interpolateTemplate.ts
export function interpolateTemplate(
  template: string,
  data: Record<string, string>
): string {
  let output = template;
  for (const key in data) {
    output = output.replaceAll(`[${key}]`, data[key] || "");
  }
  return output;
}
