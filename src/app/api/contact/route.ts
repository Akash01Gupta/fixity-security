import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const filePath = path.join(process.cwd(), "data", "content.json");

function getData() {
  try {
    const file = fs.readFileSync(filePath, "utf8");
    return JSON.parse(file);
  } catch (err) {
    return { services: [], blogs: [], whyChooseUs: [], contacts: [] };
  }
}

function saveData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function verifyToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, SECRET as string);
  } catch {
    return null;
  }
}

/* ---------- POST: Public Form Submission ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, specific } = body;
    
    if (!name || !email || !phone || !specific) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const newContact = {
      _id: crypto.randomUUID(),
      name,
      email,
      phone,
      company: company || "",
      specific,
      createdAt: new Date().toISOString()
    };
    
    const data = getData();
    if (!data.contacts) data.contacts = [];
    data.contacts.push(newContact);
    
    saveData(data);
    
    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact API POST Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ---------- DELETE: Admin Management ---------- */
export async function DELETE(req: Request) {
  const payload = verifyToken(req);
  if (!payload || (payload as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const url = new URL(req.url);
  const contactId = url.searchParams.get("contactId");
  
  if (!contactId) return NextResponse.json({ error: "Contact ID required" }, { status: 400 });

  try {
    const data = getData();
    if (data.contacts) {
      data.contacts = data.contacts.filter((c: any) => c._id !== contactId);
      saveData(data);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
