import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const ESMS_API_TOKEN = process.env.ESMS_API_TOKEN!;
const ESMS_SENDER_ID = process.env.ESMS_SENDER_ID!;
const SEND_URL = "https://xend.positiveapi.com/api/v3/sms/send";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, country, numbers, message, segments, estimatedCost } =
      await req.json();

    if (!name || !country || !numbers?.length || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = [];

    for (const number of numbers) {
      const params = new URLSearchParams({
        recipient: number,
        sender_id: ESMS_SENDER_ID,
        type: "plain",
        message,
      });

      try {
        const res = await axios.post(SEND_URL, params, {
          headers: {
            Authorization: `Bearer ${ESMS_API_TOKEN}`,
            Accept: "application/json",
          },
        });

        const ok = res.data?.status?.toLowerCase() === "success";
        results.push({
          to: number,
          status: ok ? "sent" : "failed",
          error: ok ? undefined : res.data?.message || "Unknown error",
        });
      } catch (err: any) {
        results.push({
          to: number,
          status: "failed",
          error: err?.message || "Network error",
        });
      }
    }

    const campaign = new Campaign({
      name,
      country,
      numbers,
      message,
      segments,
      estimatedCost,
      provider: "esms",
      results,
      totalSent: numbers.length,
      successful: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
    });

    await campaign.save();
    return NextResponse.json({ results, campaignId: campaign._id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
