import axios from "axios";
import { NextResponse } from "next/server";

const SID = process.env.TWILIO_ACCOUNT_SID!;
const TOKEN = process.env.TWILIO_AUTH_TOKEN!;

export async function GET() {
  try {
    const res = await axios.get("https://content.twilio.com/v1/Content", {
      auth: { username: SID, password: TOKEN },
    });

    const allTemplates = res.data.contents || [];

    const whatsappTemplates = allTemplates.filter(
      (tpl: any) => tpl.whatsApp?.approved === true
    );

    const templates = whatsappTemplates.map((tpl: any) => {
      const bodyComp = tpl.components?.find((c: any) => c.type === "body");
      return {
        sid: tpl.sid,
        friendlyName: tpl.friendly_name,
        language: tpl.language || "en",
        content: {
          text: bodyComp?.text || "No body content found",
        },
      };
    });

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching templates from Content API v1:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
