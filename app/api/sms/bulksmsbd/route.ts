import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY!;
const SENDER_ID = "WeTrainEdu";
const API_URL = "http://bulksmsbd.net/api/smsapi";

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

    const sendPromises = numbers.map(async (number) => {
      const params = new URLSearchParams({
        api_key: BULKSMSBD_API_KEY,
        type: "text",
        number,
        senderid: SENDER_ID,
        message,
      });

      try {
        const response = await axios.get(`${API_URL}?${params.toString()}`);
        const statusCode = String(response.data?.response_code);
        const isSuccess = statusCode === "202";

        return buildLog(
          number,
          message,
          isSuccess ? "sent" : "failed",
          isSuccess
            ? undefined
            : response.data?.error_message || "Unknown error"
        );
      } catch (err: any) {
        return buildLog(
          number,
          message,
          "failed",
          err?.message || "Axios error"
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
      provider: "bulksmsbd",
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
