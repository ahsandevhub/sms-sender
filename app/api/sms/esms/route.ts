import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";

const ESMS_API_TOKEN = process.env.ESMS_API_TOKEN!; // e.g. from DianaSMS dashboard
const ESMS_SENDER_ID = process.env.ESMS_SENDER_ID!; // <= 11 chars
const ESMS_API_BASE = process.env.ESMS_API_BASE!; // e.g. https://xend.postliveapi.com/api/v3
const ESMS_SEND_URL = `${ESMS_API_BASE.replace(/\/+$/, "")}/sms/send`;

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

    // Input guard
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
    if (!ESMS_API_TOKEN || !ESMS_SENDER_ID || !ESMS_API_BASE) {
      return NextResponse.json(
        { error: "ESMS environment variables are not configured." },
        { status: 500 }
      );
    }
    if (ESMS_SENDER_ID.length > 11) {
      return NextResponse.json(
        { error: "ESMS_SENDER_ID must be <= 11 characters." },
        { status: 400 }
      );
    }

    // Send per-number (to match your existing pattern)
    const sendPromises = numbers.map(async (rawNumber) => {
      const number = String(rawNumber).trim().replace(/[^\d]/g, ""); // digits only, no '+'

      const payload = {
        recipient: number, // single number per request
        sender_id: ESMS_SENDER_ID,
        type: "plain",
        message,
      };

      try {
        const { data, status } = await axios.post(ESMS_SEND_URL, payload, {
          headers: {
            Authorization: `Bearer ${ESMS_API_TOKEN}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 15000,
          validateStatus: () => true, // handle non-2xx in code
        });

        const isSuccess =
          status >= 200 && status < 300 && data?.status === "success";
        const errMsg = data?.message || data?.error || `HTTP ${status}`;

        return buildLog(
          number,
          message,
          isSuccess ? "sent" : "failed",
          isSuccess ? undefined : errMsg
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

    // Estimate & save campaign like your other providers
    const { characters, segments, estimatedCost } = estimateCost(
      message,
      numbers.length
    );

    const campaign = await createCampaign({
      name,
      type: "sms",
      provider: "esms",
      senderId: ESMS_SENDER_ID,
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
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
