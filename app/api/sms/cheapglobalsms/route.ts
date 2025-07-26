import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

const SUB_ACCOUNT = process.env.CHEAPGLOBALSMS_SUB_ACCOUNT!;
const SUB_ACCOUNT_PASS = process.env.CHEAPGLOBALSMS_PASSWORD!;
const SENDER_ID = process.env.CHEAPGLOBALSMS_SENDER_ID!;

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

    // Validate required fields
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

    const sendPromises = numbers.map(async (toRaw) => {
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
          return buildLog(toRaw, message, "failed", "Invalid JSON response");
        }

        if (data.batch_id) {
          return buildLog(toRaw, message, "sent");
        } else {
          return buildLog(
            toRaw,
            message,
            "failed",
            data.error || "Unknown error"
          );
        }
      } catch (err: any) {
        return buildLog(
          toRaw,
          message,
          "failed",
          err.message || "Network error"
        );
      }
    });

    const results = await Promise.all(sendPromises);

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
      { error: err.message, results: [] },
      { status: 500 }
    );
  }
}
