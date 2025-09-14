// scripts/updateTheaterStatus.mjs
import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb.js";
import Theater from "../models/Theater.js";

async function updateTheaters() {
  await connectToDatabase();

  // updateMany để set status = "active" cho tất cả theater chưa có field này
  const result = await Theater.updateMany(
    { status: { $exists: false } },
    { $set: { status: "active" } }
  );

  console.log(`Updated ${result.modifiedCount} theaters`);
  mongoose.connection.close();
}

updateTheaters().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
