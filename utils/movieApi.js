const API_BASE_URL = '/api/movies';

// Lấy tất cả phim
export const getAllMovies = async () => {
  try {
    const token = localStorage.getItem('auth-token'); // hoặc sessionStorage
    const response = await fetch('/api/movies', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error fetching movies:', error);
    throw error;
  }
};

// Lấy phim theo ID
export const getMovieById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error fetching movie:', error);
    throw error;
  }
};

// Tạo phim mới
export const createMovie = async (movieData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error creating movie:', error);
    throw error;
  }
};

// Cập nhật phim
export const updateMovie = async (id, movieData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error updating movie:', error);
    throw error;
  }
};

// Xóa phim
export const deleteMovie = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error('Error deleting movie:', error);
    throw error;
  }
}; 