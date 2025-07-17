import { connectToDatabase } from '../../../../../lib/mongodb';
import Comment from '../../../../../models/Comment';
import User from '../../../../../models/User';

export async function POST(req, { params }) {
  await connectToDatabase();
  const movie_id = params.id;
  const { user, content} = await req.json();

  // Đảm bảo có ít nhất 1 trong 2 trường
  if (!content || content.trim() === '') {
    return new Response(JSON.stringify({ error: 'Missing content or rating' }), { status: 400 });
  }

  try {
    const comment = await Comment.create({
      movie_id,
      user_id: user,
      content: content.trim(),
    });
    return new Response(JSON.stringify(comment), { status: 201 });
  } catch (err) {
    // Ghi log lỗi ra response để debug
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500 });
  }
}

export async function GET(req, { params }) {
  await connectToDatabase();
  const movie_id = params.id;
  // Lấy comment, populate user_id để lấy username
  const comments = await Comment.find({ movie_id }).populate('user_id', 'username');
  return new Response(JSON.stringify(comments), { status: 200 });
} 