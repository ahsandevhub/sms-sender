import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contacts/[id] → fetch single contact
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID" },
        { status: 400 }
      );
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ contact }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/contacts/[id] → update contact
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID" },
        { status: 400 }
      );
    }

    const { name, contact, country } = await req.json();

    const updated = await Contact.findById(id);
    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (name !== undefined) updated.name = name;
    if (contact !== undefined) updated.contact = contact;
    if (country !== undefined) updated.country = country;

    await updated.validate();
    await updated.save();

    return NextResponse.json(
      { success: true, contact: updated },
      { status: 200 }
    );
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate contact number." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] → delete contact
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid contact ID" },
        { status: 400 }
      );
    }

    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
