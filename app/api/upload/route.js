// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// export const runtime = 'nodejs';

// export async function POST(req) {
//   const formData = await req.formData();
//   const file = formData.get('file');
//   if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
//   const uploadDir = path.join(process.cwd(), 'public', 'uploads');
//   const uploadPath = path.join(uploadDir, filename);

//   // Đảm bảo thư mục uploads tồn tại
//   fs.mkdirSync(uploadDir, { recursive: true });
//   fs.writeFileSync(uploadPath, buffer);

//   const url = `/uploads/${filename}`;
//   return NextResponse.json({ url });
// } 

// /app/api/upload/route.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "payment-proofs" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    return new Response(JSON.stringify({ url: uploadRes.secure_url }), { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
