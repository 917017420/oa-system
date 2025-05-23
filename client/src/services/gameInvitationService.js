// API service for game invitations
import apiClient from '@/apiClient';
import { useUserStore } from '../stores/user';

const API_URL = '/game-requests'; // Adjusted to match backend routes

// Function to create a new game invitation
export const createInvitation = async (invitationData) => {
  try {
    const response = await apiClient.post(`${API_URL}/`, invitationData);
    return response.data;
  } catch (error) {
    console.error('Error creating game invitation:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get invitations sent by the current user
export const getSentInvitations = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/sent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent game invitations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get invitations received by the current user
export const getReceivedInvitations = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/received`);
    // 确保返回的数据是数组
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data) {
      console.warn('Received invitations data is not an array, converting:', response.data);
      // 如果返回的不是数组但有数据，尝试转换
      return Array.isArray(response.data) ? response.data : [response.data];
    } else {
      console.warn('No data received from invitations API');
      return [];
    }
  } catch (error) {
    console.error('Error fetching received game invitations:', error.response?.data || error.message);
    // 不抛出错误，而是返回空数组，防止前端崩溃
    return [];
  }
};

// Function to respond to a game invitation (accept/decline)
export const respondToInvitation = async (invitationId, responseData) => { // responseData can include { status, proposedTime }
  try {
    const response = await apiClient.put(`${API_URL}/${invitationId}/respond`, responseData);
    return response.data;
  } catch (error) {
    console.error(`Error responding to game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to cancel a game invitation (if sent by current user)
export const cancelInvitation = async (invitationId) => {
  try {
    const response = await apiClient.put(`${API_URL}/${invitationId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get a specific game invitation by ID
export const getInvitationById = async (invitationId) => {
  try {
    const response = await apiClient.get(`${API_URL}/${invitationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get all game invitations (admin only)
export const getAllInvitations = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all game invitations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get simplified game invitation statistics
export const getSimplifiedStatistics = async () => {
  try {
    // 直接从其他API获取数据并计算统计信息
    const [sent, received] = await Promise.all([
      getSentInvitations(),
      getReceivedInvitations()
    ]);
    
    // 计算统计数据
    const stats = {
      sent: sent.length || 0,
      received: received.length || 0,
      pending: received.filter(inv => inv.status === 'pending').length || 0,
      accepted: received.filter(inv => inv.status === 'accepted').length || 0
    };
    
    return stats;
  } catch (error) {
    console.error('Error calculating game invitation statistics:', error.message);
    // 返回默认值而不是抛出错误，确保UI不会崩溃
    return {
      sent: 0,
      received: 0,
      pending: 0,
      accepted: 0
    };
  }
};

export default {
  createInvitation,
  getSentInvitations,
  getReceivedInvitations,
  respondToInvitation,
  cancelInvitation,
  getSimplifiedStatistics,
  getInvitationById,
  getAllInvitations
};