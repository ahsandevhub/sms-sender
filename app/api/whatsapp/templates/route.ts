import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const allowedTemplateNames = ["test_promotion", "welcome_template"]; // You can expand this list

export async function GET() {
  try {
    const templates = await client.content.v1.contents.list({ limit: 50 });

    const whatsappTemplates = templates.filter((tpl: any) =>
      allowedTemplateNames.includes(tpl.friendlyName)
    );

    const slimTemplates = whatsappTemplates.map((tpl: any) => ({
      sid: tpl.sid,
      friendlyName: tpl.friendlyName,
      language: tpl.language,
      text: tpl.body?.text || tpl.content?.text || "No preview text available",
    }));

    return NextResponse.json({ templates: slimTemplates }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Failed to fetch WhatsApp templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp templates" },
      { status: 500 }
    );
  }
}
