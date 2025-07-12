import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

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

    return NextResponse.json({
      totalSent,
      successful,
      failed,
      pending,
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
