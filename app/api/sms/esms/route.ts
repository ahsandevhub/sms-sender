import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

const ESMS_API_TOKEN = process.env.ESMS_API_TOKEN!;
const ESMS_SENDER_ID = process.env.ESMS_SENDER_ID!;
const ESMS_API_BASE = process.env.ESMS_API_BASE!; // e.g. https://xend.positiveapi.com/api/v3

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name,
      country,
      numbers,
      message,
      language,
      scheduleTime,
    }: {
      name: string;
      country: string;
      numbers: string[]; // frontend sends this as array
      message: string;
      language: string;
      scheduleTime?: string;
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

    if (!ESMS_API_TOKEN || !ESMS_SENDER_ID || !ESMS_API_BASE) {
      return NextResponse.json(
        { error: "ESMS environment variables are not configured." },
        { status: 500 }
      );
    }

    if (ESMS_SENDER_ID.length > 11) {
      return NextResponse.json(
        { error: "ESMS_SENDER_ID must be <= 11 alphanumeric characters." },
        { status: 400 }
      );
    }

    // Convert array → comma-separated string for ESMS API
    const recipientList = numbers
      .map((num) => num.replace(/\s+/g, "").replace(/^\+/, ""))
      .join(",");

    const formParams = new URLSearchParams();
    formParams.set("recipient", recipientList);
    formParams.set("sender_id", ESMS_SENDER_ID);
    formParams.set("type", "plain");
    formParams.set("message", message);
    if (scheduleTime) {
      formParams.set("schedule_time", scheduleTime);
    }

    const endpoint = `${ESMS_API_BASE}/sms/send`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ESMS_API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams.toString(),
    });

    console.log("Body: ", formParams.toString());

    console.log("Response: ", response);

    const text = await response.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from ESMS" },
        { status: 500 }
      );
    }

    const results: any[] = [];
    if (response.ok && json?.status === "success") {
      numbers.forEach((num) => results.push(buildLog(num, message, "sent")));
    } else {
      const errorMessage =
        json?.message || json?.error || `HTTP ${response.status}`;
      numbers.forEach((num) =>
        results.push(buildLog(num, message, "failed", errorMessage))
      );
    }

    // Estimate & save campaign
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error", results: [] },
      { status: 500 }
    );
  }
}
