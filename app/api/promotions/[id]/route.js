import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { getAuth } from '@/utils/auth';

export async function PATCH(req, { params }) {
  await connectToDatabase();

  const user = await getAuth(req);
  if (!user || user.role !== 'theater_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Không cho phép chỉnh sửa theater_chain từ client
  if ('theater_chain' in body) {
    delete body.theater_chain;
  }

  try {
    let updateQuery = {};

    if (body.incrementUsedCount) {
      // Nếu yêu cầu tăng used_count thêm 1
      updateQuery.$inc = { used_count: 1 };
    }

    // Các trường khác sẽ được set bình thường
    const fieldsToUpdate = { ...body };
    delete fieldsToUpdate.incrementUsedCount;

    if (Object.keys(fieldsToUpdate).length > 0) {
      updateQuery.$set = fieldsToUpdate;
    }

    const updated = await Promotion.findOneAndUpdate(
      {
        _id: params.id,
        theater_chain: user.theater_chain, // chỉ cho phép chỉnh promotion thuộc theater_chain của user
      },
      updateQuery,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: 'Promotion not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating promotion:', err);
    return NextResponse.json({ message: 'Error updating promotion' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectToDatabase();

  const user = await getAuth(req);
  if (!user || user.role !== 'theater_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await Promotion.findOneAndDelete({
      _id: params.id,
      theater_chain: user.theater_chain,
    });

    if (!deleted) {
      return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error deleting promotion:', err);
    return NextResponse.json({ message: 'Error deleting promotion' }, { status: 500 });
  }
}
