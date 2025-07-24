import jwt from 'jsonwebtoken';

// Utility để lấy token từ localStorage
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  // Thêm key 'auth-token' vào đây
  const token = localStorage.getItem('auth-token') ||
                localStorage.getItem('authToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('accessToken');
  return token;
}

// Utility để lưu token vào localStorage
export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('authToken', token);
}

// Utility để xóa token khỏi localStorage
export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
}

// Utility để kiểm tra token có hợp lệ không
export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    // Decode JWT token để kiểm tra expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
} 

export async function getAuth(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Chứa userId, role, v.v.
  } catch (error) {
    console.error("Authentication error:", error.message);
    return null;
  }
} 