import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import { getHablameStatusReason } from "@/lib/campaigns/hablameStatus";
import dbConnect from "@/lib/dbConnect";

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.HABLAME_API_KEY!;
const HABLAME_API_URL = "https://www.hablame.co/api/sms/v5/send";

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

    if (!name || !country || !numbers?.length || !message || !language) {
      console.error("Missing required fields for Hablame campaign:", {
        name,
        country,
        numbers,
        message,
        language,
      });

      return NextResponse.json(
        { error: "Missing required campaign fields." },
        { status: 400 }
      );
    }

    const sendDate = new Date().toISOString().slice(0, 16).replace("T", " ");

    const sendPromises = numbers.map(async (to) => {
      const payload = {
        priority: true,
        certificate: false,
        sendDate,
        campaignName: name,
        from: "WeMasterTrade",
        flash: false,
        messages: [
          {
            to,
            text: message,
            costCenter: 123,
            reference01: "app",
            reference02: "dashboard",
            reference03: "campaign",
          },
        ],
      };

      try {
        const response = await fetch(HABLAME_API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Hablame-Key": API_KEY,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("Hablame raw API response:", JSON.stringify(data, null, 2));

        const messageInfo = data?.payLoad?.messages?.[0];
        const statusId = messageInfo?.statusId;
        const deliveryStatus = statusId === 100 ? "sent" : "failed";

        const reason = getHablameStatusReason(statusId);

        return buildLog(
          to,
          message,
          deliveryStatus,
          deliveryStatus === "failed" ? reason : undefined,
          messageInfo?.id
        );
      } catch (err: any) {
        return buildLog(to, message, "failed", err.message || "Network error");
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
      provider: "hablame",
      senderId: "WeMasterTrade",
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
    console.error("Hablame API Error:", err);
    return NextResponse.json(
      { results: [], error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
