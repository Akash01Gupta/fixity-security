import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const filePath = path.join(process.cwd(), "data", "content.json");
const uploadPath = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

function getData() {
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
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

/* ---------- GET ---------- */
export async function GET() {
  const data = getData();

  // Deduplicate whyChooseUs by ID
  if (data.whyChooseUs) {
    const unique = new Map<string, any>();
    data.whyChooseUs.forEach((f: any) => unique.set(f.id, f));
    data.whyChooseUs = Array.from(unique.values());
  }

  return NextResponse.json(data);
}

/* ---------- POST ---------- */
export async function POST(req: Request) {
  const payload = verifyToken(req);
  if (!payload || (payload as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  const data = getData();
  let item: any = null;
  let whyChooseUs: any = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    if (formData.has("title")) { // Service creation
      const file = formData.get("image") as File | null;
      let imageUrl = "";
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        fs.writeFileSync(path.join(uploadPath, fileName), buffer);
        imageUrl = `/uploads/${fileName}`;
      }
      item = {
        id: (formData.get("id") as string) || crypto.randomUUID(),
        title: formData.get("title") as string,
        subtitle: (formData.get("subtitle") as string) || "",
        image: imageUrl || "",
        subServices: []
      };
    } else if (formData.has("whyChooseUs")) {
      whyChooseUs = JSON.parse(formData.get("whyChooseUs") as string);
    }
  } else {
    const body = await req.json();
    item = body.item;
    whyChooseUs = body.whyChooseUs;
  }

  if (item) {
    if (!Array.isArray(data.services)) data.services = [];
    data.services.push({ ...item, subServices: item.subServices ?? [] });
  } else if (whyChooseUs) {
    // Ensure every feature has a unique ID
    const newFeatures = whyChooseUs.map((f: any) => ({
      ...f,
      id: f.id || crypto.randomUUID(),
    }));

    // Merge and deduplicate by ID
    const allFeatures = [...(data.whyChooseUs ?? []), ...newFeatures];
    const unique = new Map<string, any>();
    allFeatures.forEach((f) => unique.set(f.id, f));
    data.whyChooseUs = Array.from(unique.values());
  }

  saveData(data);
  return NextResponse.json({ success: true });
}

/* ---------- PUT ---------- */
export async function PUT(req: Request) {
  const payload = verifyToken(req);
  if (!payload || (payload as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  const data = getData();

  try {
    let serviceId: string;
    let subService: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      // Handle Blog Upload
      if (formData.has("blog[title]")) {
        const file = formData.get("blog[image]") as File | null;
        let imageUrl = "";
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${crypto.randomUUID()}-${file.name}`;
          fs.writeFileSync(path.join(uploadPath, fileName), buffer);
          imageUrl = `/uploads/${fileName}`;
        }
        
        const blog = {
          id: crypto.randomUUID(),
          title: formData.get("blog[title]") as string,
          excerpt: (formData.get("blog[excerpt]") as string) || "",
          date: (formData.get("blog[date]") as string) || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
          author: (formData.get("blog[author]") as string) || "Admin",
          category: (formData.get("blog[category]") as string) || "General",
          image: imageUrl,
        };
        
        if (!Array.isArray(data.blogs)) data.blogs = [];
        data.blogs.push(blog);
        saveData(data);
        return NextResponse.json({ success: true, blog });
      }

      // Handle SubService Upload
      serviceId = formData.get("serviceId") as string;
      const subServiceId = formData.get("subServiceId") as string | undefined;

      // Image handling
      const file = formData.get("subService[image]") as File | null;
      let imageUrl = "";
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${crypto.randomUUID()}-${file.name}`;
        fs.writeFileSync(path.join(uploadPath, fileName), buffer);
        imageUrl = `/uploads/${fileName}`;
      }

      subService = {
        id: subServiceId || crypto.randomUUID(),
        title: formData.get("subService[title]") as string,
        subtitle: (formData.get("subService[subtitle]") as string) || "",
        desc: (formData.get("subService[desc]") as string) || "",
        features:
          (formData.get("subService[features]") as string)?.split(",").map(f => f.trim()) || [],
        benefits:
          (formData.get("subService[benefits]") as string)?.split(",").map(b => b.trim()) || [],
        image: imageUrl,
        details: (formData.get("subService[details]") as string) || "",
        sections: formData.get("subService[sections]")
          ? JSON.parse(formData.get("subService[sections]") as string)
          : [],
      };
    } else {
      const body = await req.json();
      serviceId = body.serviceId;
      subService = body.subService;
      if (!subService.id) subService.id = crypto.randomUUID(); // generate ID if missing
    }

    const service = data.services.find((s: any) => s.id === serviceId);
    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // Update existing or add new sub-service
    const index = service.subServices.findIndex((sub: any) => sub.id === subService.id);
    if (index === -1) {
      // ADD new
      service.subServices.push(subService);
    } else {
      // UPDATE existing
      service.subServices[index] = { ...service.subServices[index], ...subService };
    }

    saveData(data);
    return NextResponse.json({ success: true, subService });
  } catch (err: any) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------- PATCH ---------- */
export async function PATCH(req: Request) {
  const payload = verifyToken(req);
  if (!payload || (payload as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, title, description, icon } = body;
    if (!id)
      return NextResponse.json({ error: "Feature ID required" }, { status: 400 });

    const data = getData();
    if (!data.whyChooseUs)
      return NextResponse.json({ error: "No features found" }, { status: 404 });

    const index = data.whyChooseUs.findIndex((f: any) => f.id === id);
    if (index === -1)
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });

    data.whyChooseUs[index] = {
      ...data.whyChooseUs[index],
      title: title ?? data.whyChooseUs[index].title,
      description: description ?? data.whyChooseUs[index].description,
      icon: icon ?? data.whyChooseUs[index].icon,
    };

    saveData(data);
    return NextResponse.json({ success: true, feature: data.whyChooseUs[index] });
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------- DELETE ---------- */
export async function DELETE(req: Request) {
  const payload = verifyToken(req);

  if (!payload || (payload as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);

  const serviceId = url.searchParams.get("serviceId");
  const subId = url.searchParams.get("subId");
  const featureId = url.searchParams.get("featureId");
  const blogId = url.searchParams.get("blogId");

  const title = url.searchParams.get("title"); // ✅ NEW

  const data = getData();

  // ❌ If title not provided
  if (!title) {
    return NextResponse.json({ error: "Title is required for delete confirmation" }, { status: 400 });
  }

  // ───────── BLOG DELETE ─────────
  if (blogId) {
    const blog = data.blogs?.find((b: any) => String(b.id) === String(blogId));

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.title !== title) {
      return NextResponse.json({ error: "Title does not match. Delete aborted." }, { status: 400 });
    }

    data.blogs = data.blogs.filter((b: any) => String(b.id) !== String(blogId));
  }

  // ───────── WHY CHOOSE US DELETE ─────────
  else if (featureId) {
    const feature = data.whyChooseUs?.find((f: any) => String(f.id) === String(featureId));

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    if (feature.title !== title) {
      return NextResponse.json({ error: "Title does not match. Delete aborted." }, { status: 400 });
    }

    data.whyChooseUs = data.whyChooseUs.filter(
      (f: any) => String(f.id) !== String(featureId)
    );
  }

  // ───────── SERVICE / SUBSERVICE DELETE ─────────
  else if (serviceId) {
    const service = data.services.find((s: any) => String(s.id) === String(serviceId));

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ─── SUB SERVICE DELETE ───
    if (subId) {
      const sub = service.subServices?.find(
        (s: any) => String(s.id) === String(subId)
      );

      if (!sub) {
        return NextResponse.json({ error: "SubService not found" }, { status: 404 });
      }

      if (sub.title !== title) {
        return NextResponse.json({ error: "Title does not match. Delete aborted." }, { status: 400 });
      }

      service.subServices = service.subServices.filter(
        (s: any) => String(s.id) !== String(subId)
      );
    }

    // ─── SERVICE DELETE ───
    else {
      if (service.title !== title) {
        return NextResponse.json({ error: "Title does not match. Delete aborted." }, { status: 400 });
      }

      data.services = data.services.filter(
        (s: any) => String(s.id) !== String(serviceId)
      );
    }
  }

  else {
    return NextResponse.json({ error: "Invalid delete parameters" }, { status: 400 });
  }

  saveData(data);

  return NextResponse.json({ success: true });
}