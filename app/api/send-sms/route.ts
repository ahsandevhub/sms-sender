import dbConnect from "@/lib/dbConnect"; // You'll need to set this up
import Campaign from "@/models/Campaign";
import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    await dbConnect(); // Connect to MongoDB

    const { numbers, message } = await req.json();

    if (!numbers || !message) {
      return NextResponse.json(
        { error: "Missing numbers or message" },
        { status: 400 }
      );
    }

    const results = [];

    // Process all SMS sends
    for (const to of numbers) {
      try {
        const sms = await client.messages.create({
          body: message,
          from: fromNumber,
          to,
        });
        results.push({ to, status: "sent" });
      } catch (err: any) {
        results.push({ to, status: "failed", error: err.message });
      }
    }

    // Calculate statistics
    const successful = results.filter((r) => r.status === "sent").length;
    const failed = results.length - successful;

    // Create campaign record
    const campaign = new Campaign({
      numbers,
      message,
      results,
      totalSent: numbers.length,
      successful,
      failed,
    });

    await campaign.save();

    return NextResponse.json(
      {
        results,
        campaignId: campaign._id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { results: [], error: err.message },
      { status: 500 }
    );
  }
}
