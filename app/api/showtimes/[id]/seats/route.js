import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
let redisReady = false;
async function ensureRedis() {
  if (!redisReady) {
    await redis.connect();
    redisReady = true;
  }
}

export async function GET(req, { params }) {
  // await ensureRedis();
  // const showtimeId = params.id;
  // // Lấy tất cả key giữ ghế của showtime này
  // const pattern = `hold:showtime:${showtimeId}:seat:*`;
  // const keys = await redis.keys(pattern);
  // // Lấy danh sách seatId đang bị giữ
  // const heldSeats = keys.map(k => k.split(':').pop());
  // return NextResponse.json({ heldSeats });
} 