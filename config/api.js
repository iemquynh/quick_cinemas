// API Configuration
export const API_BASE_URL = '';
export const API_ENDPOINTS = {
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
  },
  MOVIES: {
    BASE: '/movies',
    BY_ID: (id) => `/movies/${id}`,
  },
  THEATERS: {
    BASE: '/theaters',
    BY_ID: (id) => `/theaters/${id}`,
  },
  SHOWTIMES: {
    BASE: '/showtimes',
    BY_ID: (id) => `/showtimes/${id}`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id) => `/bookings/${id}`,
  },
}; 