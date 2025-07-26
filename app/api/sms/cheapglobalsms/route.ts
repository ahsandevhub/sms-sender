import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

const SUB_ACCOUNT = process.env.CHEAPGLOBALSMS_SUB_ACCOUNT!;
const SUB_ACCOUNT_PASS = process.env.CHEAPGLOBALSMS_PASSWORD!;
const SENDER_ID = process.env.CHEAPGLOBALSMS_SENDER_ID!;

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name,
      country,
      numbers,
      message,
      language,
    }: {
      name: string;
      country: string;
      numbers: string[];
      message: string;
      language: string;
    } = await req.json();

    // Validate input
    if (
      !name ||
      !country ||
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      !message ||
      !language
    ) {
      return NextResponse.json(
        { error: "Missing required campaign fields." },
        { status: 400 }
      );
    }

    // Sequential sending with delay to avoid rate-limiting
    const results: any[] = [];

    for (let i = 0; i < numbers.length; i++) {
      const toRaw = numbers[i];
      const to = toRaw.replace(/^\+/, ""); // remove + if present

      const params = new URLSearchParams({
        sub_account: SUB_ACCOUNT,
        sub_account_pass: SUB_ACCOUNT_PASS,
        action: "send_sms",
        sender_id: SENDER_ID,
        message,
        recipients: to,
      });

      try {
        const response = await fetch(
          `http://cheapglobalsms.com/api_v1/?${params.toString()}`
        );
        const text = await response.text();
        let data: any;

        try {
          data = JSON.parse(text);
        } catch {
          results.push(
            buildLog(toRaw, message, "failed", "Invalid JSON response")
          );
          continue;
        }

        if (data.batch_id) {
          results.push(buildLog(toRaw, message, "sent"));
        } else {
          results.push(
            buildLog(toRaw, message, "failed", data.error || "Unknown error")
          );
        }
      } catch (err: any) {
        results.push(
          buildLog(toRaw, message, "failed", err.message || "Network error")
        );
      }

      // ⏳ 300ms delay between messages to prevent rate limit
      await delay(300);
    }

    // Estimate and save campaign
    const { characters, segments, estimatedCost } = estimateCost(
      message,
      numbers.length
    );

    const campaign = await createCampaign({
      name,
      type: "sms",
      provider: "cheapglobalsms",
      senderId: SENDER_ID,
      country,
      language,
      message,
      characters,
      segments,
      estimatedCost,
      numbers,
      results,
    });

    return NextResponse.json(
      { results, campaignId: campaign._id },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error", results: [] },
      { status: 500 }
    );
  }
}
