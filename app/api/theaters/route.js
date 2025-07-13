import { connectToDatabase } from '../../../lib/mongodb.js';
import Theater from '../../../models/Theater';

export async function POST(req) {
  await connectToDatabase();
  const data = await req.json();
  // data: { name, address, rooms, screenTypes }
  const theater = await Theater.create(data);
  return new Response(JSON.stringify(theater), { status: 201 });
}

export async function GET() {
  await connectToDatabase();
  const theaters = await Theater.find();
  return new Response(JSON.stringify(theaters), { status: 200 });
}
