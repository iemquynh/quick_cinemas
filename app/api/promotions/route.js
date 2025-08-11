// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import Promotion from '@/models/Promotion';
// import { getAuth } from '@/utils/auth';

// export async function POST(req) {
//   await connectToDatabase();

//   const user = await getAuth(req);
//   console.log('Authenticated user:', user);

//   if (!user || user.role !== 'theater_admin') {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     // Lấy các trường hợp lệ từ body (bỏ theater_chain nếu client gửi vào)
//     const {
//       title,
//       description,
//       discount_type,
//       discount_value,
//       start_date,
//       end_date,
//       max_usage,
//       minimum_order_amount = 0,
//       maximum_discount_amount = null,
//       img_url,
//     } = body;

//     if (
//       !title ||
//       !discount_type ||
//       discount_value == null ||
//       !start_date ||
//       !end_date ||
//       max_usage == null ||
//       !img_url
//     ) {
//       return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//     }

//     // Tạo promotion mới, gán theater_chain từ user (không dùng client gửi)
//     const promotion = await Promotion.create({
//       title,
//       description,
//       discount_type,
//       discount_value,
//       start_date,
//       end_date,
//       max_usage,
//       minimum_order_amount,
//       maximum_discount_amount,
//       img_url,
//       theater_admin_id: user.userId,
//       theater_chain: user.theater_chain,
//     });

//     return NextResponse.json({ message: 'Promotion created', promotion }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating promotion:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function GET(req) {
//   await connectToDatabase();

//   let user = null;
//   try {
//     user = await getAuth(req);
//   } catch (err) {
//     // Không có token → user = null
//   }

//   try {
//     let query = {};

//     if (!user || user.role !== 'theater_admin') {
//       // User hoặc Guest → chỉ lấy promotions còn hiệu lực
//       const now = new Date();
//       query.start_date = { $lte: now };
//       query.end_date = { $gte: now };
//     }
//     // Theater Admin → query rỗng → lấy tất cả

//     const promotions = await Promotion.find(query).sort({ createdAt: -1 });

//     return NextResponse.json(promotions);
//   } catch (err) {
//     console.error('Error loading promotions:', err);
//     return NextResponse.json({ message: 'Error loading promotions' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import Showtime from '@/models/Showtime';
import { getAuth } from '@/utils/auth';

export async function POST(req) {
  await connectToDatabase();

  const user = await getAuth(req);
  console.log('Authenticated user:', user);

  if (!user || user.role !== 'theater_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      max_usage,
      minimum_order_amount = 0,
      maximum_discount_amount = null,
      img_url,
    } = body;

    if (
      !title ||
      !discount_type ||
      discount_value == null ||
      !start_date ||
      !end_date ||
      max_usage == null ||
      !img_url
    ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const promotion = await Promotion.create({
      title,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      max_usage,
      minimum_order_amount,
      maximum_discount_amount,
      img_url,
      theater_admin_id: user.userId,
      theater_chain: user.theater_chain,
    });

    return NextResponse.json({ message: 'Promotion created', promotion }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  await connectToDatabase();

  let user = null;
  try {
    user = await getAuth(req);
  } catch (err) {
    // Không có token → user = null
  }

  try {
    const now = new Date();
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page'); // 'payment' hoặc 'dashboard'
    const showtimeId = searchParams.get('showtimeId'); // FE gửi showtimeId khi payment

    console.log("page:", page);
    console.log("showtimeId:", showtimeId);


    let query = {};

    if (user?.role === 'theater_admin') {
      // Admin → lấy tất cả promotions của rạp admin
      query = { theater_chain: user.theater_chain };
    } 
    else if (page === 'payment' && showtimeId) {
      // User ở trang payment → lấy theater_chain từ showtime
      const showtime = await Showtime.findById(showtimeId)
        .populate('theater_id', 'theater_chain');

      if (!showtime || !showtime.theater_id?.theater_chain) {
        return NextResponse.json({ message: 'Showtime not found or theater_chain missing' }, { status: 404 });
      }

      query = {
        theater_chain: showtime.theater_id.theater_chain,
        start_date: { $lte: now },
        end_date: { $gte: now }
      };
    } 
    else {
      // User hoặc Guest ở dashboard → lọc theo ngày hợp lệ
      query = {
        start_date: { $lte: now },
        end_date: { $gte: now }
      };
    }

    query.$expr = { $lt: ["$used_count", "$max_usage"] };


    const promotions = await Promotion.find(query).sort({ createdAt: -1 });

    return NextResponse.json(promotions);
  } catch (err) {
    console.error('Error loading promotions:', err);
    return NextResponse.json({ message: 'Error loading promotions' }, { status: 500 });
  }
}
