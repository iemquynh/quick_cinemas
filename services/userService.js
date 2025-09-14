import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

// User API calls
export const userService = {
  // Tạo user mới
  async createUser(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.USERS.BASE, userData);
      return response;
    } catch (error) {
      // console.error('Create user error:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  },

  // Lấy danh sách users
  async getAllUsers() {
    try {
      return await api.get(API_ENDPOINTS.USERS.BASE);
    } catch (error) {
      // console.error('Get users error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  // Lấy thông tin một user
  async getUserById(userId) {
    try {
      return await api.get(API_ENDPOINTS.USERS.BY_ID(userId));
    } catch (error) {
      // console.error('Get user error:', error);
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // Cập nhật user
  async updateUser(userId, updateData) {
    try {
      return await api.put(API_ENDPOINTS.USERS.BY_ID(userId), updateData);
    } catch (error) {
      // console.error('Update user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // Xóa user
  async deleteUser(userId) {
    try {
      return await api.delete(API_ENDPOINTS.USERS.BY_ID(userId));
    } catch (error) {
      // console.error('Delete user error:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  }
}; 