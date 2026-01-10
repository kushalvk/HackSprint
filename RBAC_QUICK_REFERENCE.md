# ⚡ RBAC Quick Reference

## 🎯 Who Can Do What

### **Admin**
- ❌ Create requests
- ❌ Assign technicians  
- ❌ Work on tasks
- ✅ Manage users/teams/equipment
- ✅ View reports

### **Manager**
- ✅ Create requests
- ✅ **Assign technicians** ← PRIMARY JOB
- ✅ Update request details
- ✅ Move requests through workflow
- ✅ View all requests
- ✅ Delete requests

### **Technician**
- ✅ Create requests
- ✅ **Self-assign** (when status = "New")
- ✅ Add notes/instructions
- ✅ Move assigned requests (New → In Progress → Repaired)
- ✅ View only assigned/created requests
- ❌ Assign other technicians
- ❌ Delete requests

---

## 📍 Key Business Rules

| Rule | Implementation |
|------|---|
| **Managers assign, not admins** | `if (user.role === 'manager') canAssign = true` |
| **Technicians self-assign only** | `if (user.role === 'technician' && request.status === 'New') canSelfAssign = true` |
| **Technicians can't assign others** | `if (user.role === 'technician' && technicianId !== user._id) return false` |
| **Only their assigned requests** | Filter by `request.technician === user._id` |
| **Status workflow for techs** | `New → In Progress → Repaired` |

---

## 🔗 Code Files

```
Backend:
  server/services/authorization.service.js    ← Business logic
  server/controllers/request.controller.js    ← Validation + handlers
  server/routes/request.routes.js             ← Route protection

Frontend:
  client/src/utils/permissions.js             ← UI permission checks
  client/src/api/request.api.js               ← API layer
```

---

## 💻 Usage Quick Examples

### **Check if manager can assign**
```javascript
// Backend
const perm = canAssignTechnician(user, request, techId);
if (!perm.allowed) return res.status(403).json({ message: perm.reason });

// Frontend
if (canAssignTechnician(user, request)) {
  // Show assign button
}
```

### **Check if technician can self-assign**
```javascript
// Backend
const perm = canSelfAssign(user, request);
if (!perm.allowed) return res.status(403).json({ message: perm.reason });

// Frontend
if (canSelfAssign(user, request)) {
  // Show self-assign button
}
```

### **Get all permissions for UI**
```javascript
// Frontend
const perms = getRequestPermissions(currentUser, request);
// Returns: { canView, canAssign, canSelfAssign, canMoveStatus, ... }

if (perms.canAssignTechnician) showAssignButton();
if (perms.canSelfAssign) showSelfAssignButton();
if (perms.canMoveStatus) showStatusDropdown();
```

---

## 🚨 Error Codes

```
403 FORBIDDEN
  "Only managers can assign technicians"
  "Technicians cannot assign other technicians"
  "You can only view requests assigned to you"

404 NOT FOUND
  "Request not found"

400 BAD REQUEST
  "Cannot move request from 'New' to 'Repaired'"
  "Cannot self-assign request already assigned"
```

---

## ✅ Testing Quick Checklist

```
Manager:
  ☐ Can assign any technician
  ☐ Can update all fields
  ☐ Can view all requests

Technician:
  ☐ Can self-assign only when status="New"
  ☐ Cannot see other's requests
  ☐ Cannot assign others
  ☐ Can only update notes/instructions

Admin:
  ☐ Cannot assign
  ☐ Cannot create requests
  ☐ Can view all (read-only)
```

---

## 📊 Workflow

```
User creates request (status: New)
    ↓
Manager assigns technician
    ↓
Technician sees in "New" pool
    ↓
Technician can self-assign OR manager keeps assignment
    ↓
Technician starts work (status: In Progress)
    ↓
Technician completes (status: Repaired)
    ↓
Request closed
```

---

**All RBAC logic is enforced BOTH client-side (UX) and server-side (security)**
