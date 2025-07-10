import dbConnect from "@/lib/dbConnect";
import Campaign from "@/models/Campaign";
import { NextRequest, NextResponse } from "next/server";

// Get individual campaign details
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  console.log(`Fetching campaign with ID: ${id}`);

  try {
    await dbConnect();
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
