import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all contacts
export async function GET() {
  try {
    await dbConnect();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json({ contacts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST: Create multiple contacts
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { contacts } = await req.json();

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: "Contact list is empty." },
        { status: 400 }
      );
    }

    const created: any[] = [];
    const skipped: any[] = [];

    for (const c of contacts) {
      try {
        if (!c.phone || !c.country) {
          skipped.push({ ...c, reason: "Missing phone or country" });
          continue;
        }

        const newContact = new Contact({
          phone: c.phone,
          country: c.country,
        });

        await newContact.validate(); // validates format
        await newContact.save();
        created.push(newContact);
      } catch (err: any) {
        skipped.push({
          ...c,
          reason: err.message || "Validation failed",
        });
      }
    }

    return NextResponse.json(
      { success: true, created, skipped },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save contacts" },
      { status: 500 }
    );
  }
}
