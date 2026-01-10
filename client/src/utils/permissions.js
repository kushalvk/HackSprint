/**
 * Client-side Permission Utilities
 * Provides functions to check user permissions for UI rendering and access control
 * 
 * Usage: Import and use these functions to control UI visibility and state
 * Example: if (canAssignTechnician(user, request)) { showAssignButton(); }
 */

/**
 * Check if user can create a maintenance request
 * Only managers and technicians can create maintenance requests
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
export const canCreateRequest = (user) => {
  if (!user || !user.role) return false;
  // Only managers and technicians can create requests
  return ['manager', 'technician'].includes(user.role);
};

/**
 * Check if user can assign a technician to a request
 * @param {Object} user - User object with role and _id
 * @param {Object} request - Request object with status and technician
 * @returns {boolean}
 */
export const canAssignTechnician = (user, request) => {
  if (!user || !request) return false;
  // Only managers can assign technicians
  return user.role === 'manager';
};

/**
 * Check if user can self-assign a request
 * @param {Object} user - User object with role and _id
 * @param {Object} request - Request object with status and technician
 * @returns {boolean}
 */
export const canSelfAssign = (user, request) => {
  if (!user || !request) return false;
  
  // Only technicians can self-assign
  if (user.role !== 'technician') return false;
  
  // Request must be in "New" status
  if (request.status !== 'New') return false;
  
  // User cannot be already assigned
  if (request.technician && request.technician._id === user._id) return false;
  
  return true;
};

/**
 * Check if user can move a request status
 * @param {Object} user - User object with role and _id
 * @param {Object} request - Request object with status and technician
 * @returns {boolean}
 */
export const canMoveRequestStatus = (user, request) => {
  if (!user || !request) return false;
  
  // Managers can move any status
  if (user.role === 'manager') return true;
  
  // Technicians can only move their assigned requests
  if (user.role === 'technician') {
    return request.technician && request.technician._id === user._id;
  }
  
  return false;
};

/**
 * Check if user can mark equipment as scrapped
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export const canScrapeEquipment = (user) => {
  if (!user || !user.role) return false;
  return ['manager', 'admin'].includes(user.role);
};

/**
 * Check if user can delete a request
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export const canDeleteRequest = (user) => {
  if (!user || !user.role) return false;
  return ['manager', 'admin'].includes(user.role);
};

/**
 * Check if user can view a request
 * @param {Object} user - User object with role and _id
 * @param {Object} request - Request object with technician and createdBy
 * @returns {boolean}
 */
export const canViewRequest = (user, request) => {
  if (!user || !request) return false;
  
  // Admins and managers can view all
  if (['admin', 'manager'].includes(user.role)) return true;
  
  // Technicians can view their assigned or created requests
  if (user.role === 'technician') {
    const isAssignedToTechnician =
      request.technician && request.technician._id === user._id;
    const isCreatedByTechnician =
      request.createdBy && request.createdBy._id === user._id;
    
    return isAssignedToTechnician || isCreatedByTechnician;
  }
  
  return false;
};

/**
 * Check if user can update request fields
 * @param {Object} user - User object with role and _id
 * @param {Object} request - Request object with technician
 * @param {string} field - Field name being updated
 * @returns {boolean}
 */
export const canUpdateField = (user, request, field) => {
  if (!user || !request) return false;
  
  // Managers can update any field
  if (user.role === 'manager') return true;
  
  // Technicians can only update notes and instructions for their assigned requests
  if (user.role === 'technician') {
    const isAssignedToTechnician =
      request.technician && request.technician._id === user._id;
    
    if (!isAssignedToTechnician) return false;
    
    // Only allow updates to these fields
    return ['notes', 'instructions'].includes(field);
  }
  
  // Admins cannot update requests
  return false;
};

/**
 * Get all permissions for a user on a specific request
 * @param {Object} user - User object
 * @param {Object} request - Request object
 * @returns {Object} - Object with all permission flags
 */
export const getRequestPermissions = (user, request) => {
  return {
    canView: canViewRequest(user, request),
    canCreate: canCreateRequest(user),
    canAssignTechnician: canAssignTechnician(user, request),
    canSelfAssign: canSelfAssign(user, request),
    canMoveStatus: canMoveRequestStatus(user, request),
    canUpdateNotes: canUpdateField(user, request, 'notes'),
    canUpdateInstructions: canUpdateField(user, request, 'instructions'),
    canScrapEquipment: canScrapeEquipment(user),
    canDelete: canDeleteRequest(user),
    userRole: user?.role
  };
};

/**
 * Get role-based UI display settings
 * @param {Object} user - User object with role
 * @returns {Object} - UI configuration based on user role
 */
export const getRoleBasedUIConfig = (user) => {
  const role = user?.role;
  
  const configs = {
    admin: {
      canViewAllRequests: true,
      canCreateRequest: false, // Admins cannot create maintenance requests
      canAssign: false, // Admins don't assign requests
      canWorkOnRequests: false, // Admins don't work on requests
      canManageEquipment: true,
      canManageUsers: true,
      canViewReports: true,
      canViewAllTeams: true,
      canViewAllUsers: true,
      mainFocus: 'System Administration'
    },
    manager: {
      canViewAllRequests: true,
      canCreateRequest: true, // Managers CAN create requests
      canAssign: true,
      canWorkOnRequests: false, // Managers delegate to technicians
      canManageEquipment: true,
      canManageUsers: false,
      canViewReports: true,
      canViewAllTeams: true,
      canViewAllUsers: true,
      mainFocus: 'Request Assignment & Management'
    },
    technician: {
      canViewAllRequests: false, // Only their requests
      canCreateRequest: true, // Technicians CAN create requests
      canAssign: false,
      canWorkOnRequests: true, // Can complete their assigned tasks
      canManageEquipment: false,
      canManageUsers: false, // Cannot see all users
      canViewReports: false,
      canViewAllTeams: false, // Only their teams
      canViewAllUsers: false, // Only their team members
      mainFocus: 'Task Execution & Self-Assignment'
    }
  };
  
  return configs[role] || configs.technician;
};

/**
 * Get status transitions available to a user
 * @param {Object} user - User object with role
 * @param {string} currentStatus - Current request status
 * @returns {Array<string>} - Available next statuses
 */
export const getAvailableStatusTransitions = (user, currentStatus) => {
  if (!user || !user.role) return [];
  
  const transitionRules = {
    'New': {
      manager: ['In Progress', 'Scrap'],
      technician: ['In Progress']
    },
    'In Progress': {
      manager: ['Repaired', 'New', 'Scrap'],
      technician: ['Repaired', 'New']
    },
    'Repaired': {
      manager: [],
      technician: []
    },
    'Scrap': {
      manager: [],
      technician: []
    }
  };
  
  return transitionRules[currentStatus]?.[user.role] || [];
};

/**
 * Check if a request is overdue
 * @param {Object} request - Request object with scheduledDate and status
 * @returns {boolean}
 */
export const isRequestOverdue = (request) => {
  if (!request || !request.scheduledDate) return false;
  
  // Only consider New and In Progress as outstanding
  if (!['New', 'In Progress'].includes(request.status)) return false;
  
  const now = new Date();
  const scheduledDate = new Date(request.scheduledDate);
  
  return scheduledDate < now;
};

/**
 * Get role-specific dashboard statistics
 * @param {Object} user - User object with role
 * @param {Array<Object>} requests - Array of request objects
 * @returns {Object} - Statistics relevant to user's role
 */
export const getRoleBasedStats = (user, requests = []) => {
  if (!user) return {};
  
  let filteredRequests = requests;
  
  // Filter based on role
  if (user.role === 'technician') {
    filteredRequests = requests.filter(
      r =>
        (r.technician && r.technician._id === user._id) ||
        (r.createdBy && r.createdBy._id === user._id)
    );
  }
  
  return {
    total: filteredRequests.length,
    new: filteredRequests.filter(r => r.status === 'New').length,
    inProgress: filteredRequests.filter(r => r.status === 'In Progress').length,
    repaired: filteredRequests.filter(r => r.status === 'Repaired').length,
    scrap: filteredRequests.filter(r => r.status === 'Scrap').length,
    overdue: filteredRequests.filter(isRequestOverdue).length,
    urgent: filteredRequests.filter(r => r.priority === 'Critical' || r.priority === 'High').length
  };
};
