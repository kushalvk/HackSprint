/**
 * Maintenance Request API
 * Handles all API calls related to maintenance requests with RBAC awareness
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create a new maintenance request
 * @param {Object} requestData - Request details
 * @returns {Promise<Object>} - Created request with permissions
 */
export const createRequest = async (requestData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requests`, requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create request' };
  }
};

/**
 * Get all maintenance requests
 * Filtered by role: Admins/Managers see all; Technicians see only assigned/created
 * @returns {Promise<Array>} - Array of maintenance requests
 */
export const getAllRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/requests`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch requests' };
  }
};

/**
 * Get a specific maintenance request by ID
 * Includes permission info for the current user
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} - Request with permissions
 */
export const getRequestById = async (requestId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch request' };
  }
};

/**
 * Update a maintenance request
 * Role-based validation in backend:
 * - Managers can update all fields and assign technicians
 * - Technicians can only update notes/instructions for their assigned requests
 * 
 * @param {string} requestId - Request ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated request with permissions
 */
export const updateRequest = async (requestId, updates) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/requests/${requestId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update request' };
  }
};

/**
 * Assign a technician to a request
 * Only managers can assign; technicians can self-assign when status is "New"
 * @param {string} requestId - Request ID
 * @param {string} technicianId - Technician user ID
 * @returns {Promise<Object>} - Updated request
 */
export const assignTechnician = async (requestId, technicianId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/requests/${requestId}`, {
      technician: technicianId
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message;
    if (errorMsg?.includes('insufficient') || errorMsg?.includes('cannot')) {
      throw {
        code: 'FORBIDDEN',
        message: errorMsg,
        details: error.response?.data
      };
    }
    throw error.response?.data || { message: 'Failed to assign technician' };
  }
};

/**
 * Self-assign a request (technician only)
 * Can only self-assign when request status is "New"
 * @param {string} requestId - Request ID
 * @param {string} technicianId - Current user's technician ID
 * @returns {Promise<Object>} - Updated request
 */
export const selfAssignRequest = async (requestId, technicianId) => {
  return assignTechnician(requestId, technicianId);
};

/**
 * Move request to next status (In Progress, Repaired, etc.)
 * Managers can move to any status; Technicians can only move their assigned requests
 * @param {string} requestId - Request ID
 * @param {string} newStatus - New status (New, In Progress, Repaired, Scrap)
 * @returns {Promise<Object>} - Updated request
 */
export const moveRequestStatus = async (requestId, newStatus) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/requests/${requestId}`, {
      status: newStatus
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message;
    if (errorMsg?.includes('cannot') || errorMsg?.includes('not allowed')) {
      throw {
        code: 'INVALID_TRANSITION',
        message: errorMsg,
        details: error.response?.data
      };
    }
    throw error.response?.data || { message: 'Failed to update request status' };
  }
};

/**
 * Mark request as In Progress
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} - Updated request
 */
export const startRequest = async (requestId) => {
  return moveRequestStatus(requestId, 'In Progress');
};

/**
 * Mark request as Repaired (completed)
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} - Updated request
 */
export const completeRequest = async (requestId) => {
  return moveRequestStatus(requestId, 'Repaired');
};

/**
 * Add notes to a request
 * Technicians can only add notes to their assigned requests
 * @param {string} requestId - Request ID
 * @param {string} notes - Notes to add
 * @returns {Promise<Object>} - Updated request
 */
export const addNotes = async (requestId, notes) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/requests/${requestId}`, {
      notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add notes' };
  }
};

/**
 * Add instructions to a request
 * @param {string} requestId - Request ID
 * @param {string} instructions - Instructions to add
 * @returns {Promise<Object>} - Updated request
 */
export const addInstructions = async (requestId, instructions) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/requests/${requestId}`, {
      instructions
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add instructions' };
  }
};

/**
 * Delete a maintenance request
 * Only managers and admins can delete
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} - Deletion response
 */
export const deleteRequest = async (requestId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete request' };
  }
};

/**
 * Check for overdue maintenance requests
 * Only managers and admins can perform this check
 * @returns {Promise<Object>} - Response with overdue request count
 */
export const checkOverdueRequests = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/requests/check-overdue`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check overdue requests' };
  }
};

/**
 * Get requests filtered by status
 * @param {string} status - Status to filter by (New, In Progress, Repaired, Scrap)
 * @returns {Promise<Array>} - Filtered requests
 */
export const getRequestsByStatus = async (status) => {
  try {
    const requests = await getAllRequests();
    return requests.filter(r => r.status === status);
  } catch (error) {
    throw error;
  }
};

/**
 * Get requests assigned to current technician
 * @returns {Promise<Array>} - Requests assigned to user
 */
export const getMyAssignedRequests = async () => {
  try {
    const requests = await getAllRequests();
    // Filter is done by backend based on user role, but can be refined on client
    return requests;
  } catch (error) {
    throw error;
  }
};

/**
 * Handle API errors with RBAC context
 * @param {Error} error - Axios error
 * @returns {Object} - Formatted error response
 */
export const handleRequestError = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 403) {
    return {
      code: 'FORBIDDEN',
      message: data?.message || 'You do not have permission to perform this action',
      details: data
    };
  }

  if (status === 404) {
    return {
      code: 'NOT_FOUND',
      message: 'Request not found',
      details: data
    };
  }

  if (status === 400) {
    return {
      code: 'BAD_REQUEST',
      message: data?.message || 'Invalid request data',
      details: data
    };
  }

  return {
    code: 'ERROR',
    message: data?.message || 'An error occurred',
    details: data
  };
};

export default {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  assignTechnician,
  selfAssignRequest,
  moveRequestStatus,
  startRequest,
  completeRequest,
  addNotes,
  addInstructions,
  deleteRequest,
  checkOverdueRequests,
  getRequestsByStatus,
  getMyAssignedRequests,
  handleRequestError
};
