import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import { NextResponse } from "next/server";

const SUB_ACCOUNT = process.env.CHEAPGLOBALSMS_SUB_ACCOUNT!;
const SUB_ACCOUNT_PASS = process.env.CHEAPGLOBALSMS_PASSWORD!;
const SENDER_ID = process.env.CHEAPGLOBALSMS_SENDER_ID!;

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { name, country, numbers, message, segments, estimatedCost } =
      await req.json();

    // Validate required fields
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

    const results: { to: string; status: string; error?: string }[] = [];

    for (const toRaw of numbers) {
      const to = toRaw.replace(/^\+/, ""); // Remove "+" if exists

      try {
        const urlParams = new URLSearchParams({
          sub_account: SUB_ACCOUNT,
          sub_account_pass: SUB_ACCOUNT_PASS,
          action: "send_sms",
          sender_id: SENDER_ID,
          message,
          recipients: to,
        });

        const response = await fetch(
          `http://cheapglobalsms.com/api_v1/?${urlParams.toString()}`,
          { method: "GET" }
        );

        const text = await response.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch (e) {
          results.push({
            to: toRaw,
            status: "failed",
            error: "Invalid JSON response",
          });
          continue;
        }

        if (data.batch_id) {
          results.push({ to: toRaw, status: "sent" });
        } else {
          results.push({
            to: toRaw,
            status: "failed",
            error: data.error || "Unknown error",
          });
        }
      } catch (err: any) {
        results.push({
          to: toRaw,
          status: "failed",
          error: err.message || "Network error",
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
