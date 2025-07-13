import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all contacts
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const country = searchParams.get("country");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: any = {};
    if (country) filter.country = country;
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ contacts, total, page, limit }, { status: 200 });
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
        // More explicit validation
        if (!c.phone) {
          skipped.push({ ...c, reason: "Missing phone number" });
          continue;
        }
        if (!c.country) {
          skipped.push({ ...c, reason: "Missing country" });
          continue;
        }

        // Check if contact already exists
        const exists = await Contact.findOne({ phone: c.phone });
        if (exists) {
          skipped.push({ ...c, reason: "Contact already exists" });
          continue;
        }

        const newContact = new Contact({
          phone: c.phone,
          country: c.country,
        });

        await newContact.validate();
        const savedContact = await newContact.save();
        created.push(savedContact);
      } catch (err: any) {
        skipped.push({
          ...c,
          reason: err.message || "Validation failed",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        created: created.length,
        skipped: skipped.length,
        details: {
          created,
          skipped,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save contacts" },
      { status: 500 }
    );
  }
}
