import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
