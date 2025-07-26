import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name,
      country,
      numbers,
      message,
      language,
      fromNumber,
    }: {
      name: string;
      country: string;
      numbers: string[];
      message: string;
      language: string;
      fromNumber: string;
    } = await req.json();

    if (
      !name ||
      !country ||
      !numbers?.length ||
      !message ||
      !language ||
      !fromNumber
    ) {
      console.error("Missing required fields for SMS campaign:", {
        name,
        country,
        numbers,
        message,
        language,
        fromNumber,
      });
      return NextResponse.json(
        { error: "Missing required campaign fields." },
        { status: 400 }
      );
    }

    const sendPromises = numbers.map(async (to) => {
      try {
        const res = await client.messages.create({
          body: message,
          from: fromNumber,
          to,
        });

        return buildLog(to, message, "sent", undefined, res.sid);
      } catch (err: any) {
        return buildLog(to, message, "failed", err.message || "Twilio error");
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
      provider: "twilio",
      senderId: fromNumber,
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
