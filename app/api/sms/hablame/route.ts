import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import { NextResponse } from "next/server";

const API_KEY = process.env.HABLAME_API_KEY!;
const HABLAME_API_URL = "https://www.hablame.co/api/sms/v5/send";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, country, numbers, message, segments, estimatedCost } =
      await req.json();

    if (
      !name ||
      !country ||
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      !message ||
      !segments ||
      !estimatedCost
    ) {
      return NextResponse.json(
        { error: "Missing required campaign fields." },
        { status: 400 }
      );
    }

    const sendDate = new Date().toISOString().slice(0, 16).replace("T", " "); // e.g. "2025-07-17 20:30"

    const results: { to: string; status: string; error?: string }[] = [];

    for (const to of numbers) {
      const payload = {
        payLoad: {
          priority: true,
          certificate: false,
          sendDate,
          campaignName: name,
          from: "WeMasterTrade", // Optional, must be approved
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
        },
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

        if (response.ok && data.statusCode === 200) {
          results.push({ to, status: "sent" });
        } else {
          results.push({
            to,
            status: "failed",
            error: data.statusMessage || "Unknown error",
          });
        }
      } catch (error: any) {
        results.push({
          to,
          status: "failed",
          error: error.message || "Network error",
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
      { results: [], error: err.message },
      { status: 500 }
    );
  }
}
