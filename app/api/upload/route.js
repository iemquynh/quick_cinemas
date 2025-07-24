import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const uploadPath = path.join(uploadDir, filename);

  // Đảm bảo thư mục uploads tồn tại
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(uploadPath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
} 