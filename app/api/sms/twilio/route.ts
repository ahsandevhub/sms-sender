import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      name,
      country,
      numbers,
      message,
      segments,
      estimatedCost,
      fromNumber,
    } = body;

    if (
      !name ||
      !country ||
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      !message ||
      !segments ||
      !estimatedCost ||
      !fromNumber
    ) {
      return NextResponse.json(
        { error: "Missing required campaign fields." },
        { status: 400 }
      );
    }

    const results: { to: string; status: string; error?: string }[] = [];

    for (const to of numbers) {
      try {
        await client.messages.create({
          body: message,
          from: fromNumber,
          to,
        });
        results.push({ to, status: "sent" });
      } catch (err: any) {
        results.push({
          to,
          status: "failed",
          error: err.message || "Twilio API error",
        });
      }
    }

    const successful = results.filter((r) => r.status === "sent").length;
    const failed = results.length - successful;

    const campaign = new Campaign({
      name,
      country,
      numbers,
      message,
      segments,
      estimatedCost,
      results,
      totalSent: numbers.length,
      successful,
      failed,
    });

    await campaign.save();

    return NextResponse.json(
      { results, campaignId: campaign._id },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { results: [], error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
