import mongoose from 'mongoose';
import Movie from '../models/Movie.js';

async function main() {
  const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/quick_cinema';
  await mongoose.connect(MONGODB_URL);

  const now = new Date();
  const movies = await Movie.find({});
  let updated = 0;

  for (const movie of movies) {
    const expiredDate = new Date(movie.releaseDate);
    expiredDate.setMonth(expiredDate.getMonth() + 2);

    const shouldBeActive = expiredDate > now;
    if (movie.isActive !== shouldBeActive) {
      movie.isActive = shouldBeActive;
      await movie.save();
      updated++;
      console.log(`Updated movie ${movie._id}: isActive = ${shouldBeActive}`);
    }
  }

  console.log(`✅ Done. Updated ${updated} movies.`);
  process.exit();
}

main();
