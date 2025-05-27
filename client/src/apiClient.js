import axios from 'axios';
import { useUserStore } from '@/stores/user';

const apiClient = axios.create({
  baseURL: '/api', // Vite proxy will handle this
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional, for handling global errors like 401)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      const userStore = useUserStore();
      userStore.logout(); // Assuming logout clears token and user info
      // Optionally, redirect to login page
      // router.push('/login'); // Make sure router is available here or handle differently
      console.error('Unauthorized, logging out.');
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default apiClient;