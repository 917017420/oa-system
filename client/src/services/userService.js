import apiClient from '@/apiClient';

const userService = {
  // 获取所有用户 (通常需要管理员权限，具体取决于后端实现)
  getAllUsers() {
    return apiClient.get('/users');
  },

  // 获取用于选择器的用户列表 (ID 和 用户名)
  async getSelectableUsers() { // Made async
    const response = await apiClient.get('/users/list/selectable'); // Await and get response
    return response.data; // Return the data array
  },

  // 获取特定用户的详细信息
  getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  // 更新当前登录用户的个人资料
  updateUserProfile(profileData) {
    // 假设有一个 /profile 或 /users/me 路由用于更新当前用户信息
    // 或者，如果知道用户ID，可以使用 /users/:id
    // 此处使用 /users/profile 作为示例，具体需根据后端API调整
    return apiClient.put('/users/profile', profileData);
  },

  // 更新指定用户的信息 (通常需要管理员权限)
  updateUser(userId, userData) {
    return apiClient.put(`/users/${userId}`, userData);
  },

  // 删除用户 (通常需要管理员权限)
  deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },

  // 更新用户状态 (通常需要管理员权限)
  updateUserStatus(userId, status) {
    return apiClient.patch(`/users/${userId}/status`, { status });
  }
};

export default userService;