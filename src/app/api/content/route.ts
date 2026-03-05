export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyToken } from "@/lib/jwt";

const dataDir = path.join(process.cwd(), "src", "data");
const filePath = path.join(dataDir, "siteContent.json");

const DEFAULT_CONTENT = {
  whyChooseUs: [],
  services: [],
  training: [],
  contactus: {},
};

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_CONTENT, null, 2));
  }
}

function checkAuth(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const payload = verifyToken(token);
  return payload && (payload as any).role === "admin";
}

// GET
export async function GET() {
  try {
    ensureFile();
    const content = fs.readFileSync(filePath, "utf-8").trim();
    const data = content ? JSON.parse(content) : DEFAULT_CONTENT;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

// POST
export async function POST(req: Request) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    ensureFile();
    const body = await req.json();

    const content = fs.readFileSync(filePath, "utf-8").trim();
    const existingData = content ? JSON.parse(content) : DEFAULT_CONTENT;

    const updatedData = { ...existingData, ...body };

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

    return NextResponse.json({ success: true, data: updatedData });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}