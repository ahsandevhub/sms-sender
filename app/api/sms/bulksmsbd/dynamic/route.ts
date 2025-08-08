import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import { interpolateTemplate } from "@/lib/campaigns/interpolateTemplate";
import { parseCsv } from "@/lib/campaigns/parseCsv";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY!;
const SENDER_ID = "WeTrainEdu";
const API_URL = "http://bulksmsbd.net/api/smsapi";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { template, csv, name, country, language } = await req.json();

    if (!template || !csv || !name || !country || !language) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: template, csv, name, country, language",
        },
        { status: 400 }
      );
    }

    const rows = parseCsv(csv.trim());

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "CSV is empty or failed to parse." },
        { status: 400 }
      );
    }

    const sendPromises = rows
      .filter((row) => row.phone)
      .map(async (row) => {
        const message = interpolateTemplate(template, row);

        const params = new URLSearchParams({
          api_key: BULKSMSBD_API_KEY,
          type: "text",
          number: row.phone,
          senderid: SENDER_ID,
          message,
        });

        try {
          const response = await axios.get(`${API_URL}?${params.toString()}`);
          const isSuccess = String(response.data?.response_code) === "202";

          return buildLog(
            row.phone,
            message,
            isSuccess ? "sent" : "failed",
            isSuccess
              ? undefined
              : response.data?.error_message || "Unknown error"
          );
        } catch (err: any) {
          return buildLog(
            row.phone,
            message,
            "failed",
            err?.message || "Request failed"
          );
        }
      });

    const results = await Promise.all(sendPromises);
    const numbers = rows.map((r) => r.phone);

    const { characters, segments, estimatedCost } = estimateCost(
      template,
      numbers.length
    );

    const campaign = await createCampaign({
      name,
      type: "sms",
      provider: "bulksmsbd",
      senderId: SENDER_ID,
      country,
      language,
      message: template,
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
