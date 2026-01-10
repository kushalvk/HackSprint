# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document outlines the complete RBAC system implemented for the maintenance request workflow. The system enforces strict role-based permissions to ensure proper responsibility separation and secure access control following enterprise best practices.

---

## 📋 User Roles

### 1. **Admin** 👨‍💼
**Responsibilities**: System Administration Only

❌ **Cannot**:
- Create maintenance requests
- Assign technicians
- Work on maintenance tasks
- Modify request status

✅ **Can**:
- Create and manage users
- Assign user roles
- Configure teams
- Manage equipment catalog
- View system reports
- Delete requests (administrative cleanup)

### 2. **Manager** 👨‍🔧
**Responsibilities**: Request Assignment & Workflow Management

✅ **Can**:
- Create maintenance requests
- Assign technicians to requests (PRIMARY RESPONSIBILITY)
- Update request priority and scheduling
- Move requests through workflow (New → In Progress → Repaired → Scrap)
- Mark equipment as scrapped
- Delete requests
- View all requests
- View system reports

❌ **Cannot**:
- Perform hands-on maintenance work (that's technicians' job)

### 3. **Technician** 🔨
**Responsibilities**: Task Execution & Self-Assignment

✅ **Can**:
- Create maintenance requests (report issues)
- View requests assigned to them
- View requests they created
- Self-assign tasks from the Kanban board (when status is "New")
- Move assigned requests through workflow
- Add notes and instructions
- Complete assigned tasks (mark as "Repaired")

❌ **Cannot**:
- Assign other technicians
- Delete requests
- Modify core request details (subject, equipment, category, priority)
- Access requests not assigned to them or created by them

---

## 🔄 Maintenance Request Workflow

### **🔧 Corrective Maintenance (Breakdown)**

```
┌─────────────────────────────────────────────────┐
│ Step 1: User Creates Request                    │
│ ├─ Status: NEW                                  │
│ ├─ Technician: NULL                             │
│ └─ Created by: User (any role)                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Step 2: Manager Assigns Technician              │
│ ├─ Status: NEW                                  │
│ ├─ Technician: [Jane Tech]                      │
│ └─ Updated by: Manager                          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Step 3: Technician Starts Work                  │
│ ├─ Status: IN PROGRESS                          │
│ ├─ Technician: [Jane Tech]                      │
│ └─ Updated by: Technician                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Step 4: Technician Completes Work               │
│ ├─ Status: REPAIRED                             │
│ ├─ Notes: "Fixed the printer..."                │
│ └─ Updated by: Technician                       │
└─────────────────────────────────────────────────┘
```

### **🛠 Preventive Maintenance (Scheduled)**

```
Manager creates scheduled request
        ↓
Appears on Calendar view
        ↓
Technician completes work on scheduled date
```

---

## 🎯 Request Assignment Rules (CRITICAL)

### **Manager Assignment** (Primary Flow)

```javascript
if (user.role === "manager") {
  // Managers can assign any technician
  canAssign = true;
}
```

**Permission Check**:
```javascript
const assignPermission = canAssignTechnician(user, request, technician);
// Response: { allowed: true/false, reason?: string }
```

### **Technician Self-Assignment** (Agile Teams)

```javascript
if (user.role === "technician") {
  canSelfAssign = request.status === "New" && 
                  technicianId === user.id;
}
```

**Constraints**:
- ✅ Can only self-assign when status is **"New"**
- ✅ Can only assign **themselves** (not other technicians)
- ❌ Cannot self-assign requests already assigned to others

**Permission Check**:
```javascript
const selfAssignPermission = canSelfAssign(user, request);
// Response: { allowed: true/false, reason?: string }
```

### **Admin Assignment**

```javascript
if (user.role === "admin") {
  canAssign = false; // STRICT: Admins do NOT assign
}
```

---

## 📊 Role-Based Permission Matrix

| Action | Admin | Manager | Technician |
|--------|-------|---------|------------|
| Create Request | ❌ No | ✅ Yes | ✅ Yes |
| Assign Technician | ❌ No | ✅ Yes (any) | ✅ Self-assign only |
| Update Details | ❌ No | ✅ Yes (all fields) | ⚠️ Notes/Instructions only |
| Change Priority | ❌ No | ✅ Yes | ❌ No |
| Move Status | ❌ No | ✅ Any transition | ⚠️ Their requests only |
| Mark Repaired | ❌ No | ✅ Yes | ✅ If assigned |
| Scrap Equipment | ✅ Yes | ✅ Yes | ❌ No |
| Delete Request | ✅ Yes | ✅ Yes | ❌ No |
| View All Requests | ✅ Yes | ✅ Yes | ❌ Only theirs |

---

## 🔐 Access Control Implementation

### **Backend (Server-Side)**

#### **Authorization Service** (`services/authorization.service.js`)

Core authorization logic with functions:

```javascript
// Check user can create request
canCreateRequest(user) → boolean

// Check user can assign technician
canAssignTechnician(user, request, technicianId) 
  → { allowed: boolean, reason?: string }

// Check user can self-assign
canSelfAssign(user, request) 
  → { allowed: boolean, reason?: string }

// Check user can move request status
canMoveRequestStatus(user, request, newStatus) 
  → { allowed: boolean, reason?: string }

// Check user can view request
canViewRequest(user, request) 
  → { allowed: boolean, reason?: string }

// Get all permissions for a request
getRequestPermissions(user, request) 
  → { canView, canAssign, canSelfAssign, ... }
```

#### **Controller Logic** (`controllers/request.controller.js`)

All endpoints enforce RBAC:

```javascript
// CREATE REQUEST
POST /api/requests
├─ Check: canCreateRequest()
├─ Rule: Any authenticated user
└─ Constraint: Only managers can pre-assign

// GET ALL REQUESTS
GET /api/requests
├─ Filter: Admin/Manager see all; Technician sees only theirs
└─ Response: Includes permissions object

// GET REQUEST BY ID
GET /api/requests/:id
├─ Check: canViewRequest()
└─ Response: Includes permissions object

// UPDATE REQUEST
PUT /api/requests/:id
├─ Technician Assignment:
│  ├─ Check: canAssignTechnician() [manager]
│  ├─ Check: canSelfAssign() [technician]
│  └─ Rule: Only managers assign others; technicians self-assign
├─ Status Changes:
│  ├─ Check: canMoveRequestStatus()
│  ├─ Manager: Can move to any status
│  └─ Technician: Limited transitions on their requests
├─ Field Updates:
│  ├─ Manager: Can update all fields
│  └─ Technician: Only notes/instructions on their requests
└─ Response: Includes permissions object

// DELETE REQUEST
DELETE /api/requests/:id
├─ Check: canDeleteRequest()
├─ Middleware: requireRole(['admin', 'manager'])
└─ Rule: Only managers/admins
```

#### **Routes Protection** (`routes/request.routes.js`)

```javascript
// Role-based middleware on delete (additional layer)
router.delete('/:id', 
  protect,                              // Authentication
  requireRole(['admin', 'manager']),    // Authorization
  requestController.deleteRequest
);

// Other routes use controller-level RBAC
router.put('/:id', protect, requestController.updateRequest);
```

### **Frontend (Client-Side)**

#### **Permission Utilities** (`utils/permissions.js`)

Helper functions for UI control:

```javascript
// Check individual permissions
canCreateRequest(user) → boolean
canAssignTechnician(user, request) → boolean
canSelfAssign(user, request) → boolean
canMoveRequestStatus(user, request) → boolean
canUpdateField(user, request, field) → boolean

// Get all permissions at once
getRequestPermissions(user, request) → {
  canView,
  canCreate,
  canAssignTechnician,
  canSelfAssign,
  canMoveStatus,
  canUpdateNotes,
  canUpdateInstructions,
  canScrapEquipment,
  canDelete,
  userRole
}

// Get UI configuration by role
getRoleBasedUIConfig(user) → {
  canViewAllRequests: boolean,
  canCreateRequest: boolean,
  canAssign: boolean,
  canWorkOnRequests: boolean,
  mainFocus: string
}

// Get available status transitions
getAvailableStatusTransitions(user, currentStatus) 
  → ['In Progress', 'Repaired', ...]
```

#### **API Layer** (`api/request.api.js`)

Permission-aware API functions:

```javascript
// Create request
createRequest(data) → Request with permissions

// Get all requests (role-filtered by backend)
getAllRequests() → [Request]

// Get specific request
getRequestById(id) → Request with permissions

// Update request (role-validated by backend)
updateRequest(id, updates) → Request with permissions

// Assign technician (manager or self-assign only)
assignTechnician(id, technicianId) → Request
selfAssignRequest(id, technicianId) → Request

// Move status (role-validated)
moveRequestStatus(id, newStatus) → Request
startRequest(id) → Request (sets to "In Progress")
completeRequest(id) → Request (sets to "Repaired")

// Error handling
handleRequestError(error) → { code, message, details }
```

---

## 🚀 Usage Examples

### **Manager Assigning a Technician**

```javascript
// ✅ Manager can assign any technician
const updatedRequest = await updateRequest(requestId, {
  technician: technicianId
});
// Response: { ...request, permissions: {...} }
```

### **Technician Self-Assigning**

```javascript
// ✅ Technician can self-assign if status is "New"
const updatedRequest = await assignTechnician(requestId, currentUser._id);
// Success if status is "New"
// Error if status is not "New" or technician is already assigned
```

### **Technician Starting Work**

```javascript
// ✅ Move assigned request from "New" to "In Progress"
const updatedRequest = await startRequest(requestId);
// Success if assigned to current technician
```

### **Technician Adding Notes**

```javascript
// ✅ Technician can add notes to their assigned requests
const updatedRequest = await addNotes(requestId, 'Printer fixed, tested successfully');
// Frontend check:
const perms = getRequestPermissions(user, request);
if (perms.canUpdateNotes) {
  // Show notes input
}
```

### **Checking What User Can Do**

```javascript
// Frontend pre-checks before showing UI
import { getRequestPermissions } from '@/utils/permissions';

const request = await getRequestById(requestId);
const permissions = getRequestPermissions(currentUser, request);

// Or use backend-returned permissions
const request2 = await getRequestById(requestId);
const permissions2 = request2.permissions;

if (permissions.canAssignTechnician) {
  // Show assign technician button (Manager only)
}

if (permissions.canSelfAssign) {
  // Show "Self-Assign" button (Technician only, if "New")
}

if (permissions.canMoveStatus) {
  // Show status transition buttons
}
```

---

## 🛡️ Security Measures

### **Dual-Layer Validation**

1. **Frontend**: User-friendly prevention
   - Hide buttons user can't use
   - Show appropriate UI for their role
   - Pre-validate before API calls

2. **Backend**: Security enforcement
   - Always validate user role and request state
   - Return 403 Forbidden for unauthorized actions
   - Include detailed error messages for debugging

### **Token-Based Authentication**

- JWT tokens include `user.role`
- Every protected endpoint verifies token
- Authorization service checks role + state

### **Data Filtering**

- **Technicians**: Only see requests assigned/created by them
- **Managers/Admins**: See all requests
- Queries filtered at database level

---

## 📝 Status Transition Rules

### **Manager Transitions** (Any to Any)
```
New ↔ In Progress ↔ Repaired
   ↘    Scrap     ↙
```

### **Technician Transitions** (For Assigned Requests)
```
New → In Progress → Repaired
   ↙ (can revert)
```

**Valid Transitions**:
- New → In Progress ✅
- In Progress → Repaired ✅
- In Progress → New ✅ (cancel/restart)
- Repaired → (locked) ❌
- Scrap → (locked) ❌

---

## 🔔 Notification Triggers

| Event | Trigger | Notification | Recipient |
|-------|---------|--------------|-----------|
| Request Assigned | Technician field updated | "New request assigned to you" | Assigned Technician |
| Request Repaired | Status changed to "Repaired" | "Your request is complete" | Request Creator |
| Request Overdue | Scheduled date passed | "Request is overdue" | Assigned Technician |

---

## 📚 Implementation Files

| File | Purpose |
|------|---------|
| `server/services/authorization.service.js` | Core RBAC logic |
| `server/controllers/request.controller.js` | Endpoint implementations with RBAC |
| `server/routes/request.routes.js` | Route definitions with middleware |
| `server/middleware/auth.middleware.js` | Authentication & role checking |
| `client/src/utils/permissions.js` | Frontend permission helpers |
| `client/src/api/request.api.js` | API layer with RBAC-aware functions |

---

## ✅ Testing Checklist

### **Manager Tests**
- [ ] Can create requests
- [ ] Can assign any technician
- [ ] Can view all requests
- [ ] Can update any field
- [ ] Can move requests through any status
- [ ] Can delete requests
- [ ] Cannot see "Self-Assign" button

### **Technician Tests**
- [ ] Can create requests
- [ ] Can self-assign only when status is "New"
- [ ] Cannot assign other technicians
- [ ] Can only see assigned/created requests
- [ ] Can update notes/instructions on assigned requests
- [ ] Cannot update other fields
- [ ] Cannot delete requests
- [ ] Can only move their assigned requests through workflow

### **Admin Tests**
- [ ] Cannot create requests
- [ ] Cannot assign technicians
- [ ] Cannot see maintenance request details
- [ ] Can manage users and equipment
- [ ] Can view all requests (read-only)

---

## 🚨 Error Messages

| Scenario | Error Code | Message |
|----------|-----------|---------|
| Non-manager tries to assign | FORBIDDEN | "Only managers can assign technicians" |
| Technician tries to self-assign non-New | FORBIDDEN | "Cannot self-assign a request with status 'In Progress'" |
| Technician tries to assign other | FORBIDDEN | "Technicians cannot assign other technicians" |
| Admin tries to assign | FORBIDDEN | "Admins cannot assign or work on requests" |
| User views other's request | FORBIDDEN | "You can only view requests assigned to you" |
| Invalid status transition | INVALID_TRANSITION | "Cannot move request from 'New' to 'Repaired'" |

---

## 🎓 Best Practices

1. **Always check backend responses** - Frontend permissions are helpful but backend is authoritative
2. **Use permission utilities** - Don't hardcode role checks in components
3. **Handle 403 errors gracefully** - Show user-friendly messages
4. **Log authorization failures** - Help debugging RBAC issues
5. **Test all role combinations** - Ensure no unintended access
6. **Keep authorization logic centralized** - Single source of truth

---

## 📞 Support

For questions about RBAC implementation or issues:
1. Check authorization.service.js for business logic
2. Review controller implementations for validation
3. Test with different user roles
4. Check console logs for detailed error messages

---

**Last Updated**: January 2026
**System Version**: 1.0 - Enterprise RBAC
**Status**: ✅ Production Ready
