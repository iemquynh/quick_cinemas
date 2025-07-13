import { API_BASE_URL } from '@/config/api';

// Hàm xử lý lỗi chung
const handleResponse = async (response) => {
  try {
    // Kiểm tra content-type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Server returned non-JSON response');
    }

    // Parse JSON response
    const data = await response.json();
    
    // Kiểm tra response status
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('Response handling error:', error);
    throw error;
  }
};

// Hàm tạo headers chung
const getHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Các phương thức HTTP cơ bản
export const api = {
  get: async (endpoint) => {
    try {
      console.log('Making GET request to:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      console.log('Making POST request to:', `${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      console.log('Making PUT request to:', `${API_BASE_URL}${endpoint}`, data);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      console.log('Making DELETE request to:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },
}; 