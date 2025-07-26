// /app/api/sms/cheapglobalsms/stream/route.ts
import { buildLog } from "@/lib/campaigns/buildLog";
import { createCampaign } from "@/lib/campaigns/createCampaign";
import { estimateCost } from "@/lib/campaigns/estimateCost";
import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";

const SUB_ACCOUNT = process.env.CHEAPGLOBALSMS_SUB_ACCOUNT!;
const SUB_ACCOUNT_PASS = process.env.CHEAPGLOBALSMS_PASSWORD!;
const SENDER_ID = process.env.CHEAPGLOBALSMS_SENDER_ID!;
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, country, numbers, message, language } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await dbConnect();
      const results: any[] = [];

      for (let i = 0; i < numbers.length; i++) {
        const toRaw = numbers[i];
        const to = toRaw.replace(/^\+/, "");

        const params = new URLSearchParams({
          sub_account: SUB_ACCOUNT,
          sub_account_pass: SUB_ACCOUNT_PASS,
          action: "send_sms",
          sender_id: SENDER_ID,
          message,
          recipients: to,
        });

        let log;

        try {
          const res = await fetch(
            `http://cheapglobalsms.com/api_v1/?${params.toString()}`
          );
          const text = await res.text();

          try {
            const data = JSON.parse(text);
            if (data?.batch_id) {
              log = buildLog(toRaw, message, "sent");
            } else {
              log = buildLog(
                toRaw,
                message,
                "failed",
                data?.error || "Unknown error"
              );
            }
          } catch {
            log = buildLog(toRaw, message, "failed", "Invalid JSON response");
          }
        } catch (err: any) {
          log = buildLog(
            toRaw,
            message,
            "failed",
            err.message || "Network error"
          );
        }

        results.push(log);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ index: i + 1, log })}\n\n`)
        );

        await delay(300); // prevent rate-limiting
      }

      const { characters, segments, estimatedCost } = estimateCost(
        message,
        numbers.length
      );
      const campaign = await createCampaign({
        name,
        type: "sms",
        provider: "cheapglobalsms",
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
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    },
  });
}
