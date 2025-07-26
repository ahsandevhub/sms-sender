import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";

import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM!;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name = "sir",
      numbers,
      templateSid,
      campaignName,
      country,
      language = "english",
    }: {
      name?: string;
      numbers: string[];
      templateSid: string;
      campaignName: string;
      country: string;
      language: string;
    } = await req.json();

    if (
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      !templateSid ||
      !campaignName ||
      !country
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      numbers.map(async (num) => {
        try {
          const msg = await client.messages.create({
            to: `whatsapp:${num}`,
            from: fromWhatsApp,
            contentSid: templateSid,
            contentVariables: JSON.stringify({ "1": name }),
          });

          return buildLog(
            num,
            `[Template SID: ${templateSid}]`,
            "sent",
            undefined,
            msg.sid
          );
        } catch (err: any) {
          return buildLog(
            num,
            `[Template SID: ${templateSid}]`,
            "failed",
            err.message
          );
        }
      })
    );

    const placeholderMessage = `[Template SID: ${templateSid}]`;
    const { characters, segments, estimatedCost } = estimateCost(
      placeholderMessage,
      numbers.length
    );

    const campaign = await createCampaign({
      name: campaignName,
      type: "whatsapp",
      provider: "twilio",
      senderId: fromWhatsApp,
      country,
      language,
      message: placeholderMessage,
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
