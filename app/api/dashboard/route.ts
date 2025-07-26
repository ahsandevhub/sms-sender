import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // ─── DATA & STATS ──────────────────────────────────────────────────────────
    const campaigns = await Campaign.find();
    const contacts = await Contact.find();

    const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
    const successful = campaigns.reduce((sum, c) => sum + c.successful, 0);
    const failed = campaigns.reduce((sum, c) => sum + c.failed, 0);
    const pending = totalSent - successful - failed;

    const contactsByCountry: Record<string, number> = {};
    contacts.forEach((c) => {
      contactsByCountry[c.country] = (contactsByCountry[c.country] || 0) + 1;
    });

    // ─── FETCH BALANCES ─────────────────────────────────────────────────────────
    const [twilioRes, bulksmsbdRes, cheapglobalRes, hablameRes] =
      await Promise.all([
        // Twilio
        fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Balance.json`,
          {
            headers: {
              Authorization:
                "Basic " +
                Buffer.from(
                  `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
                ).toString("base64"),
            },
          }
        )
          .then(async (r) => {
            if (!r.ok) throw new Error(`Twilio ${r.status}`);
            return r.json();
          })
          .catch(() => ({ balance: 0 })),

        // BulkSMSBD
        fetch(
          `http://bulksmsbd.net/api/getBalanceApi?api_key=${process.env.BULKSMSBD_API_KEY}`
        )
          .then(async (r) => {
            if (!r.ok) throw new Error(`BulkSMSBD ${r.status}`);
            const txt = await r.text();
            return { balance: parseFloat(txt) || 0 };
          })
          .catch(() => ({ balance: 0 })),

        // CheapGlobalSMS
        fetch(`http://portal.cheapglobalsms.com/gateway-api.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subaccount: process.env.CHEAPGLOBALSMS_SUB_ACCOUNT,
            password: process.env.CHEAPGLOBALSMS_PASSWORD,
            action: "balance",
          }),
        })
          .then(async (r) => {
            if (!r.ok) throw new Error(`CheapGlobalSMS ${r.status}`);
            const txt = await r.text();
            try {
              const j = JSON.parse(txt);
              return { balance: parseFloat(j.balance) || 0 };
            } catch {
              return { balance: parseFloat(txt) || 0 };
            }
          })
          .catch(() => ({ balance: 0 })),

        // Hablame
        fetch(`https://www.hablame.co/api/sms/v5/credit`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            account: process.env.HABLAME_ACCOUNT!,
            apikey: process.env.HABLAME_API_KEY!,
            token: process.env.HABLAME_TOKEN!,
          },
        })
          .then(async (r) => {
            if (!r.ok) throw new Error(`Hablame ${r.status}`);
            return r.json();
          })
          .then((j) => ({
            balance: parseFloat(j.balance ?? j.data?.balance) || 0,
          }))
          .catch(() => ({ balance: 0 })),
      ]);

    // ─── FINAL RESPONSE ─────────────────────────────────────────────────────────
    return NextResponse.json({
      totalSent,
      successful,
      failed,
      pending,
      balances: {
        twilio: parseFloat(twilioRes.balance as any) || 0,
        bulksmsbd: bulksmsbdRes.balance,
        cheapglobalsms: cheapglobalRes.balance,
        hablame: hablameRes.balance,
      },
      channels: [
        { name: "SMS", value: 6842, color: "bg-yellow-500" },
        { name: "WhatsApp", value: 3210, color: "bg-green-500" },
        { name: "Email", value: 1987, color: "bg-blue-500" },
        { name: "Telegram", value: 414, color: "bg-purple-500" },
      ],
      recentCampaigns: campaigns
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map((c) => ({
          id: c._id,
          name: c.name,
          date: c.createdAt.toISOString().split("T")[0],
          status: "completed",
          channel: "SMS/WhatsApp",
        })),
      userActivity: [
        { name: "Active", value: 42, color: "bg-yellow-500" },
        { name: "Inactive", value: 8, color: "bg-gray-300" },
      ],
      contactsByCountry,
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
