import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Movie from '../../../models/Movie';

// GET /api/movies - Lấy tất cả phim
export async function GET() {
  try {
    await connectToDatabase();
    const movies = await Movie.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

// POST /api/movies - Tạo phim mới
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'directors', 'cast', 'synopsis', 'runtime', 'releaseDate', 'genre'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new movie
    const movie = new Movie({
      title: body.title,
      directors: body.directors,
      cast: body.cast,
      synopsis: body.synopsis,
      runtime: body.runtime,
      releaseDate: body.releaseDate,
      genre: body.genre,
      tags: body.tags || '',
      poster: body.poster || '',
      background: body.background || '',
      trailerUrl: body.trailerUrl || '',
      isActive: body.isActive !== undefined ? body.isActive : true
    });

    const savedMovie = await movie.save();
    
    return NextResponse.json({
      success: true,
      message: 'Movie created successfully',
      data: savedMovie
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
