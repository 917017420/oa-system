// API service for game invitations
import axios from 'axios'; // Assuming axios is used for HTTP requests
import { useUserStore } from '../stores/user';

const API_URL = '/api/game-requests'; // Adjusted to match backend routes

// Function to create a new game invitation
export const createInvitation = async (invitationData) => {
  try {
    const response = await axios.post(`${API_URL}/`, invitationData);
    return response.data;
  } catch (error) {
    console.error('Error creating game invitation:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get invitations sent by the current user
export const getSentInvitations = async () => {
  try {
    const response = await axios.get(`${API_URL}/sent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent game invitations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get invitations received by the current user
export const getReceivedInvitations = async () => {
  try {
    const response = await axios.get(`${API_URL}/received`);
    return response.data;
  } catch (error) {
    console.error('Error fetching received game invitations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to respond to a game invitation (accept/decline)
export const respondToInvitation = async (invitationId, responseData) => { // responseData can include { status, proposedTime }
  try {
    const response = await axios.put(`${API_URL}/${invitationId}/respond`, responseData);
    return response.data;
  } catch (error) {
    console.error(`Error responding to game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to cancel a game invitation (if sent by current user)
export const cancelInvitation = async (invitationId) => {
  try {
    const response = await axios.put(`${API_URL}/${invitationId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get a specific game invitation by ID
export const getInvitationById = async (invitationId) => {
  try {
    const response = await axios.get(`${API_URL}/${invitationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game invitation ${invitationId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get all game invitations (admin only)
export const getAllInvitations = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all game invitations:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Function to get game invitation statistics
export const getInvitationStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game invitation statistics:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export default {
  createInvitation,
  getSentInvitations,
  getReceivedInvitations,
  respondToInvitation,
  cancelInvitation,
  getInvitationById,
  getAllInvitations,
  getInvitationStatistics
};