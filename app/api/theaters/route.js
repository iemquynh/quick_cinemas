import { connectToDatabase } from '../../../lib/mongodb.js';
import Theater from '../../../models/Theater';

// export async function POST(req) {
//   await connectToDatabase();
//   const data = await req.json();
//   // data: { name, address, rooms, screenTypes }
//   const theater = await Theater.create(data);
//   return new Response(JSON.stringify(theater), { status: 201 });
// }

// export async function GET() {
//   await connectToDatabase();
//   const theaters = await Theater.find();
//   return new Response(JSON.stringify(theaters), { status: 200 });
// }

export async function POST(req) {
  await connectToDatabase();
  const data = await req.json();
  // data: { name, address, rooms, screenTypes }
  const theater = await Theater.create({
    ...data,
    status: 'active', // mặc định active khi tạo mới
  });
  return new Response(JSON.stringify(theater), { status: 201 });
}

// export async function GET() {
//   await connectToDatabase();
//   // chỉ lấy rạp đang active
//   const theaters = await Theater.find({ status: 'active' });
//   return new Response(JSON.stringify(theaters), { status: 200 });
// }

export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get("all") === "true";

  let theaters;
  if (includeAll) {
    theaters = await Theater.find(); // lấy tất cả (cho admin)
  } else {
    theaters = await Theater.find({ status: "active" }); // chỉ active (cho user)
  }

  return new Response(JSON.stringify(theaters), { status: 200 });
}
