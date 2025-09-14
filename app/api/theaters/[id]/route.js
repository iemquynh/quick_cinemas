import { connectToDatabase } from '../../../../lib/mongodb';
import Theater from '../../../../models/Theater';

export async function GET(req, { params }) {
  await connectToDatabase();
  const theater = await Theater.findById(params.id);
  if (!theater) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(theater), { status: 200 });
}

export async function PUT(req, { params }) {
  await connectToDatabase();
  const data = await req.json(); // data: { name, address, rooms, screenTypes }
  const theater = await Theater.findByIdAndUpdate(params.id, data, { new: true });
  if (!theater) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(theater), { status: 200 });
}

// export async function DELETE(req, { params }) {
//   await connectToDatabase();
//   const theater = await Theater.findByIdAndDelete(params.id);
//   if (!theater) return new Response('Not found', { status: 404 });
//   return new Response(JSON.stringify({ success: true }), { status: 200 });
// } 

export async function DELETE(req, { params }) {
  await connectToDatabase();
  const theater = await Theater.findById(params.id);
  if (!theater) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  // Đảo trạng thái: active → inactive, inactive → active
  theater.status = theater.status === 'active' ? 'inactive' : 'active';
  await theater.save();

  return new Response(JSON.stringify(theater), { status: 200 });
}

