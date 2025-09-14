import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Movie from '../../../../models/Movie';

// GET /api/movies/[id] - Lấy phim theo ID
export async function GET(request, { params }) {
    // console.log('API GET movie, params:', params);
  try {
    await connectToDatabase();
    const movie = await Movie.findById(params.id);
    
    if (!movie) {
      return NextResponse.json(
        { success: false, message: 'Movie not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: movie
    });
  } catch (error) {
    // console.error('Error fetching movie:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

// PUT /api/movies/[id] - Cập nhật phim
export async function PUT(request, { params }) {
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

    const updatedMovie = await Movie.findByIdAndUpdate(
      params.id,
      {
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
      },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return NextResponse.json(
        { success: false, message: 'Movie not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie
    });
    
  } catch (error) {
    // console.error('Error updating movie:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

// DELETE /api/movies/[id] - Xóa phim
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const deletedMovie = await Movie.findByIdAndDelete(params.id);
    
    if (!deletedMovie) {
      return NextResponse.json(
        { success: false, message: 'Movie not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Movie deleted successfully'
    });
    
  } catch (error) {
    // console.error('Error deleting movie:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
