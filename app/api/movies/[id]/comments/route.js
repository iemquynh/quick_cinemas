import { connectToDB } from '../../../../../lib/mongodb';
import Comment from '../../../../../models/Comment';

export async function POST(req, { params }) {
  await connectToDB();
  const movie = params.id;
  const { user, content, rating } = await req.json();
  const comment = await Comment.create({ movie, user, content, rating });
  return new Response(JSON.stringify(comment), { status: 201 });
}

export async function GET(req, { params }) {
  await connectToDB();
  const movie = params.id;
  const comments = await Comment.find({ movie }).populate('user', 'name');
  return new Response(JSON.stringify(comments), { status: 200 });
} 