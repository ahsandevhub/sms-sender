import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY!;
const SENDER_ID = "8809617627311"; // Approved Sender ID
const API_URL = "http://bulksmsbd.net/api/smsapi";

const errorMap: Record<string, string> = {
  "202": "SMS submitted successfully",
  "1001": "Invalid number format",
  "1002": "Sender ID is incorrect or disabled",
  "1003": "Missing required fields. Please check your inputs.",
  "1005": "Internal server error",
  "1006": "Balance validity not available",
  "1007": "Insufficient balance",
  "1011": "User ID not found",
  "1012": "Bengali masking required for Bangla SMS",
  "1013": "Sender ID not linked to this API key",
  "1014": "Sender type name not found for this API key",
  "1015": "No valid gateway found for sender ID",
  "1016": "Price info not found for this sender ID",
  "1017": "Active price info not found for this sender ID",
  "1018": "Account owner is disabled",
  "1019": "Sender type pricing is disabled for this account",
  "1020": "Parent account not found",
  "1021": "Parent sender pricing not found",
  "1031": "Account not verified. Contact administrator.",
  "1032": "IP address not whitelisted",
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, country, numbers, message, segments, estimatedCost } = body;

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

    for (const number of numbers) {
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

        results.push({
          to: number,
          status: isSuccess ? "sent" : "failed",
          error: isSuccess
            ? undefined
            : errorMap[statusCode] ||
              response.data?.error_message ||
              "Unknown error",
        });
      } catch (err: any) {
        results.push({
          to: number,
          status: "failed",
          error: `Axios Error: ${err?.response?.data || err.message}`,
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
