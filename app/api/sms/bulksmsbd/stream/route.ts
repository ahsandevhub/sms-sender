// /api/sms/bulksmsbd/stream/route.ts
import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { NextRequest } from "next/server";

const BULKSMSBD_API_KEY = process.env.BULKSMSBD_API_KEY!;
const SENDER_ID = "WeTrainEdu";
const API_URL = "http://bulksmsbd.net/api/smsapi";

export async function POST(req: NextRequest) {
  const { name, country, numbers, message, language } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await dbConnect();

        const results = [];

        for (let i = 0; i < numbers.length; i++) {
          const number = numbers[i];

          const params = new URLSearchParams({
            api_key: BULKSMSBD_API_KEY,
            type: "text",
            number,
            senderid: SENDER_ID,
            message,
          });

          try {
            const response = await axios.get(`${API_URL}?${params.toString()}`);
            const isSuccess = String(response.data?.response_code) === "202";

            const log = buildLog(
              number,
              message,
              isSuccess ? "sent" : "failed",
              isSuccess
                ? undefined
                : response.data?.error_message || "Unknown error"
            );

            results.push(log);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(log)}\n\n`)
            );
          } catch (err: any) {
            const log = buildLog(
              number,
              message,
              "failed",
              err?.message || "Axios error"
            );
            results.push(log);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(log)}\n\n`)
            );
          }
        }

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

        controller.enqueue(
          encoder.encode(`event: done\ndata: ${campaign._id}\n\n`)
        );
        controller.close();
      } catch (error: any) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify(error.message)}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
