# 🔐 RBAC Updates - Request Creation & Team Visibility

## Summary of Changes

This update restricts maintenance request creation to managers and technicians only, and limits technician visibility to only their team members.

---

## 📋 Updated Rules

### **1. Maintenance Request Creation**

**Who Can Create Requests?**
- ✅ **Manager** - Can create requests
- ✅ **Technician** - Can create requests  
- ❌ **Admin** - CANNOT create requests

**Why?**
- Admins focus on system administration only
- Managers and technicians are involved in the maintenance workflow
- Request creation is an operational task, not administrative

### **2. Team & User Visibility for Technicians**

**What Technicians Can See?**

| Resource | Technician | Manager | Admin |
|----------|-----------|---------|-------|
| All Users | ❌ No - Only team members | ✅ Yes | ✅ Yes |
| All Teams | ❌ No - Only their teams | ✅ Yes | ✅ Yes |
| Team Members | ✅ Yes - See their partners | ✅ Yes | ✅ Yes |
| Maintenance Requests | ❌ No - Only assigned/created | ✅ Yes | ✅ Yes |

**Implementation Details:**

- **GET /api/users** (All Users)
  - Technician: Returns only their team members
  - Manager/Admin: Returns all users

- **GET /api/teams** (All Teams)
  - Technician: Returns only teams they are members of
  - Manager/Admin: Returns all teams

- **GET /api/teams/:id** (Specific Team)
  - Technician: Can view only if they are a member; returns 403 if not
  - Manager/Admin: Can view any team

---

## 🔧 Implementation Details

### **Backend Changes**

#### **1. Authorization Service** (`server/services/authorization.service.js`)

Updated `canCreateRequest()`:
```javascript
const canCreateRequest = (user) => {
  if (!user || !user.role) return false;
  // Only managers and technicians can create requests
  return ['manager', 'technician'].includes(user.role);
};
```

#### **2. Request Controller** (`server/controllers/request.controller.js`)

Already enforces the check:
```javascript
if (!canCreateRequest(req.user)) {
  return res.status(403).json({
    message: 'Access denied: You do not have permission to create maintenance requests'
  });
}
```

#### **3. User Controller** (`server/controllers/user.controller.js`)

Updated `getAllUsers()` to filter technician results:
```javascript
if (req.user.role === 'technician') {
  // Find teams where this technician is a member
  const teams = await MaintenanceTeam.find({
    members: req.user._id
  }).populate('members', '-password');

  // Extract unique team members
  const memberIds = new Set();
  teams.forEach(team => {
    team.members.forEach(member => {
      memberIds.add(member._id.toString());
    });
  });

  // Get all team members
  const users = await User.find({
    _id: { $in: Array.from(memberIds) }
  }).select('-password');

  return res.json(users);
}

// Admins and managers see all users
const users = await User.find().select('-password');
res.json(users);
```

#### **4. Team Controller** (`server/controllers/team.controller.js`)

**Updated `getAllTeams()`:**
```javascript
if (req.user.role === 'technician') {
  query = { members: req.user._id };
}

const teams = await MaintenanceTeam.find(query)
  .populate('members', 'firstName lastName email')
  .populate('leader', 'firstName lastName email')
  .sort({ createdAt: -1 });
```

**Updated `getTeamById()`:**
```javascript
// Technicians can only view teams they are members of
if (req.user.role === 'technician') {
  const isMember = team.members.some(member => 
    member._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json({ 
      message: 'You can only view teams you are a member of' 
    });
  }
}
```

### **Frontend Changes**

#### **Permissions Utility** (`client/src/utils/permissions.js`)

Updated `canCreateRequest()`:
```javascript
export const canCreateRequest = (user) => {
  if (!user || !user.role) return false;
  // Only managers and technicians can create requests
  return ['manager', 'technician'].includes(user.role);
};
```

Updated `getRoleBasedUIConfig()`:
```javascript
technician: {
  canViewAllRequests: false,
  canCreateRequest: true, // ✅ Technicians CAN create
  canAssign: false,
  canWorkOnRequests: true,
  canViewAllTeams: false, // ❌ Only their teams
  canViewAllUsers: false, // ❌ Only team members
  // ... other settings
}
```

---

## 🔄 User Workflows

### **Technician Creating a Request**

```
1. Technician logs in
2. Dashboard shows "Create Request" button (new!)
3. Technician fills form:
   - Subject: "Printer not working"
   - Equipment: Select from list
   - Team: Auto-filled or selectable from their teams only
4. Manager sees the new request
5. Manager can assign the technician or another technician
```

### **Technician Viewing Team**

```
1. Technician logs in
2. Clicks "Teams" or "My Team"
3. Sees only teams they are members of
4. Can see team members (their partners)
5. Cannot access teams they're not in (403 error)
```

### **Technician Viewing Users**

```
1. API GET /api/users is called
2. Backend queries: "Who are my team members?"
3. Returns only users in the technician's teams
4. Technician cannot see users from other teams
5. Manager/Admin see all users normally
```

---

## 📊 Updated Permission Matrix

| Action | Admin | Manager | Technician |
|--------|-------|---------|------------|
| Create Request | ❌ **NEW** | ✅ Yes | ✅ Yes |
| View All Users | ✅ Yes | ✅ Yes | ❌ **RESTRICTED** - Team members only |
| View All Teams | ✅ Yes | ✅ Yes | ❌ **RESTRICTED** - Their teams only |
| View Specific Team | ✅ Yes | ✅ Yes | ⚠️ **CONDITIONAL** - If member |
| Assign Technician | ❌ No | ✅ Yes | ✅ Self-assign only |
| Delete Request | ✅ Yes | ✅ Yes | ❌ No |
| View Team Members | ✅ Yes | ✅ Yes | ✅ Their partners |

---

## 🚨 Error Responses

### **Technician tries to create request (Admin)**
```
Status: 403 Forbidden
Response: {
  "message": "Access denied: You do not have permission to create maintenance requests"
}
```

### **Technician tries to view team they're not in**
```
Status: 403 Forbidden
Response: {
  "message": "You can only view teams you are a member of"
}
```

### **Technician tries to view all teams**
```
Status: 200 OK
Response: [
  // Only teams where technician is a member
]
```

---

## 🧪 Testing the Changes

### **Test Case 1: Technician Creates Request**
```javascript
// Login as technician
POST /api/requests
{
  "subject": "Laptop broken",
  "equipment": "...",
  "team": "...",
  "priority": "High"
}

// Expected: 201 Created
// Response: New request with status "New"
```

### **Test Case 2: Admin Tries to Create Request**
```javascript
// Login as admin
POST /api/requests
{...}

// Expected: 403 Forbidden
// Message: "Access denied: You do not have permission to create maintenance requests"
```

### **Test Case 3: Technician Views Users**
```javascript
// Login as technician
GET /api/users

// Expected: 200 OK
// Response: [
//   { id: "...", name: "Team Member 1" },
//   { id: "...", name: "Team Member 2" },
//   // Only team members, not all users
// ]
```

### **Test Case 4: Technician Views All Teams**
```javascript
// Login as technician
GET /api/teams

// Expected: 200 OK
// Response: [
//   { teamName: "My Team", members: [...] }
//   // Only their teams
// ]
```

### **Test Case 5: Technician Accesses Team Not a Member Of**
```javascript
// Login as technician (not member of this team)
GET /api/teams/team-id-not-member

// Expected: 403 Forbidden
// Message: "You can only view teams you are a member of"
```

---

## 📝 Updated Documentation Files

- ✅ `RBAC_IMPLEMENTATION_COMPLETE.md` - Updated with new rules
- ✅ `RBAC_QUICK_REFERENCE.md` - Updated matrix
- ✅ `server/services/authorization.service.js` - Function docs updated
- ✅ `client/src/utils/permissions.js` - Function docs updated

---

## 🎯 Key Benefits

1. **Clearer Separation of Concerns**
   - Admins don't interfere with maintenance workflow
   - Technicians focus on their team and tasks

2. **Better Data Privacy**
   - Technicians don't see users from other teams
   - Information isolation by team

3. **Operational Efficiency**
   - Technicians can create requests directly
   - No need for manager involvement in creation

4. **Role-Appropriate Access**
   - Each role has exactly what they need
   - Reduces confusion and unauthorized access

---

## ✅ Migration Checklist

- [x] Update authorization service
- [x] Update request controller
- [x] Update user controller
- [x] Update team controller
- [x] Update client-side permissions
- [x] Update UI config
- [x] Document changes
- [ ] Test all workflows
- [ ] Update frontend components to hide "Create Request" for admin
- [ ] Test API endpoints with different roles

---

**Version**: 1.1 - Restricted Request Creation & Team Visibility
**Date**: January 10, 2026
**Status**: ✅ Ready for Testing
