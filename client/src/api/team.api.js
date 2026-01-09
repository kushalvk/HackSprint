import axios from 'axios';

const API_URL = '/api/teams';

// Function to get the JWT token from local storage
const getToken = () => {
  return localStorage.getItem('token');
};

// Create an axios instance with default headers
const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllTeams = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const getTeamById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await axiosInstance.post('/', teamData);
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (id, teamData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, teamData);
    return response.data;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const deleteTeam = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

