import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "content.json");

function getData() {
  if (!fs.existsSync(filePath)) {
    return { newsletters: [] };
  }
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

function saveData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const data = getData();
    if (!data.newsletters) data.newsletters = [];

    // Deduplication
    const exists = data.newsletters.some((n: any) => n.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ message: "Already subscribed", status: "exists" }, { status: 200 });
    }

    const newSubscriber = {
      email: email.toLowerCase(),
      source: source || "unknown",
      subscribedAt: new Date().toISOString()
    };

    data.newsletters.push(newSubscriber);
    saveData(data);

    return NextResponse.json({ success: true, message: "Subscription successful" }, { status: 201 });
  } catch (err: any) {
    console.error("Newsletter API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  // Optional: Allow admin to see subscribers if token verified
  // For now, just return a generic restricted message
  return NextResponse.json({ error: "Access Restricted" }, { status: 403 });
}
