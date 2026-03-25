import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "trainings.json");

// ---------------- GET TRAININGS ----------------
export async function GET() {
  try {

    if (!fs.existsSync(dataFile)) {
      return NextResponse.json([]);
    }

    const file = fs.readFileSync(dataFile, "utf-8");

    const trainings = file ? JSON.parse(file) : [];

    return NextResponse.json(trainings);

  } catch (error) {

    console.error("GET trainings error:", error);

    return NextResponse.json(
      { error: "Failed to load trainings" },
      { status: 500 }
    );

  }
}

// ---------------- ADD TRAINING ----------------
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let item: any;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const itemStr = formData.get("item") as string;
      if (!itemStr) return NextResponse.json({ error: "Missing item" }, { status: 400 });
      item = JSON.parse(itemStr);

      const file = formData.get("image") as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const uploadPath = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadPath, fileName), buffer);
        item.image = `/uploads/${fileName}`;
      }
    } else {
      const body = await req.json();
      item = body.item;
    }

    if (!item) {
      return NextResponse.json({ error: "Training missing" }, { status: 400 });
    }

    let trainings: any[] = [];

    if (fs.existsSync(dataFile)) {
      const file = fs.readFileSync(dataFile, "utf-8");
      trainings = file ? JSON.parse(file) : [];
    }

    trainings.push(item);

    fs.writeFileSync(dataFile, JSON.stringify(trainings, null, 2));

    return NextResponse.json({ success: true, item });

  } catch (error) {
    console.error("POST training error:", error);
    return NextResponse.json(
      { error: "Failed to add training" },
      { status: 500 }
    );
  }
}

// ---------------- DELETE TRAINING ----------------
export async function DELETE(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const trainingId = searchParams.get("trainingId");
    const title = searchParams.get("title");

    if (!trainingId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required for delete confirmation" }, { status: 400 });
    }

    if (!fs.existsSync(dataFile)) {
      return NextResponse.json({ success: true });
    }

    const file = fs.readFileSync(dataFile, "utf-8");
    let trainings = file ? JSON.parse(file) : [];

    const trainingToDelete = trainings.find((t: any) => String(t.id) === String(trainingId));
    if (!trainingToDelete) {
      return NextResponse.json({ error: "Training not found" }, { status: 404 });
    }

    if (trainingToDelete.title !== title) {
      return NextResponse.json({ error: "Title does not match. Delete aborted." }, { status: 400 });
    }

    trainings = trainings.filter((t: any) => String(t.id) !== String(trainingId));

    fs.writeFileSync(dataFile, JSON.stringify(trainings, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {

    console.error("DELETE training error:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );

  }
}