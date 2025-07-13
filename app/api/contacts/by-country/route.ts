import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { country } = body;

    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    const contacts = await Contact.find({ country });
    const numbers = contacts.map((c: any) => c.phone).join("\n");

    return NextResponse.json({ numbers }, { status: 200 });
  } catch (error) {
    console.error("Error loading contacts:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
