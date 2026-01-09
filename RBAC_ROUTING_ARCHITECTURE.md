# GearGuard Role-Based Routing Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GearGuard Application                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
          ┌─────────▼─────────┐      ┌──────────▼────────────┐
          │  Public Routes    │      │  Authenticated Routes │
          │  (No Login)       │      │  (ProtectedRoute)     │
          └─────────┬─────────┘      └──────────┬────────────┘
                    │                            │
        ┌───────────┼───────────┐       ┌───────┼───────┬──────────────┐
        │           │           │       │       │       │              │
       /│        /signin     /forgot  /admin  /manager /technician    /profile
      / │       /verify-otp  -password  │      │       │              │
        │       /auth/callback           │      │       │              │
        │                                │      │       │              │
    [Landing]                   ┌────────▼──┐  │       │              │
                               │ Protected  │  │       │              │
                               │ by Role    │  │       │              │
                               └────┬───────┘  │       │              │
                                    │          │       │              │
                        ┌───────────┼──────────┼───────┼──────────────┤
                        │           │          │       │              │
                     [Login]        │          │       │              │
                        │           │          │       │              │
         ┌──────────────┼──────────┐│          │       │              │
         │              │          ││          │       │              │
      [Admin]      [Manager]  [Technician]     │       │              │
         │              │          │           │       │              │
         │              │          │     ┌─────┘       │              │
         │              │          │     │   ┌─────────┘              │
         │              │          │     │   │    ┌───────────────────┘
         │              │          │     │   │    │
    /admin/*      /manager/*   /technician/*  [Shared]
         │              │          │           │
    ┌────┴────┐    ┌────┴────┐ ┌──┴───┐    ┌──┴──┐
    │          │    │         │ │      │    │     │
 /users    /teams  /calendar  /kanban /tasks /activity
 /equipment    /equipment  /reports  /profile
 /reports         (shared)  (shared)
```

---

## Detailed Route Structure

### Public Routes (No Authentication)
```
GET /                    → Landing Page
GET /signin              → Login Page
GET /verify-otp          → OTP Verification
GET /forgot-password     → Password Reset
GET /auth/callback       → OAuth Callback
```

### Admin Routes
```
/admin/*                 → Allowed ONLY for role: 'admin'

├─ /admin/dashboard      → Admin Dashboard (home after login)
├─ /admin/users          → User Management
│                          - Create users
│                          - Assign roles
│                          - Manage permissions
├─ /admin/teams          → Team Management
│                          - Create teams
│                          - Assign members
├─ /admin/equipment      → Equipment Configuration
│                          - Register equipment
│                          - Manage asset database
└─ /admin/reports        → System Reports
                           - Admin analytics
                           - System audit logs
```

### Manager Routes
```
/manager/*               → Allowed ONLY for role: 'manager'

├─ /manager/dashboard    → Manager Dashboard (home after login)
│                          - KPI cards
│                          - Maintenance trends
│                          - Equipment health
│                          - Top problematic equipment
├─ /manager/calendar     → Maintenance Calendar
│                          - Schedule view
│                          - Plan maintenance
├─ /manager/equipment    → Equipment Status
│                          - View equipment health
│                          - Track maintenance history
└─ /manager/reports      → Manager Reports
                           - Maintenance analytics
                           - Team performance metrics
```

### Technician Routes
```
/technician/*            → Allowed ONLY for role: 'technician'

├─ /technician/dashboard → Technician Dashboard (home after login)
│                          - My assigned tasks
│                          - Upcoming maintenance
│                          - Open Kanban button
├─ /technician/kanban    → Kanban Board (PRIMARY workspace)
│                          - Todo → In Progress → Done
│                          - Drag-and-drop tasks
│                          - Real-time updates
└─ /technician/tasks     → My Tasks
                           - All assigned requests
                           - Completion status
```

### Shared Routes
```
/profile                 → User Profile (authenticated users only)
/activity                → Activity Log (authenticated users only)
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Access Flow                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  User visits   │
                    │  /signin       │
                    └───────┬────────┘
                            │
                    ┌───────▼────────────┐
                    │ Enter credentials  │
                    │ email + password   │
                    └───────┬────────────┘
                            │
                    ┌───────▼──────────────────────┐
                    │ AuthContext.login()          │
                    │ - Query mock user database   │
                    │ - Validate email + password  │
                    │ - Extract user data          │
                    │ - Store in localStorage      │
                    │ - Set state in AuthContext   │
                    └───────┬──────────────────────┘
                            │
                    ┌───────▼──────────────────┐
                    │ getDashboardUrl()        │
                    │ switches on user.role:   │
                    │ - 'admin' → /admin/...   │
                    │ - 'manager' → /manager/..│
                    │ - 'technician' → /tech..│
                    └───────┬──────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐        ┌────▼──────┐      ┌────▼──────────┐
   │ Admin     │        │ Manager   │      │ Technician    │
   │ Dashboard │        │ Dashboard │      │ Dashboard     │
   └────┬─────┘        └────┬──────┘      └────┬──────────┘
        │                   │                   │
   ┌────▼──────────────┐    │                   │
   │ RoleBasedNavigation│   │                   │
   │ renders:          │    │                   │
   │ - Users           │    │                   │
   │ - Teams           │    │                   │
   │ - Equipment       │    │                   │
   │ - Reports         │    │                   │
   └───────────────────┘    │                   │
                       ┌────▼──────────────┐   │
                       │ RoleBasedNavigation│   │
                       │ renders:          │   │
                       │ - Calendar        │   │
                       │ - Equipment       │   │
                       │ - Reports         │   │
                       └───────────────────┘   │
                               ┌───────────────▼─────────────┐
                               │ RoleBasedNavigation        │
                               │ renders:                   │
                               │ - Kanban                   │
                               │ - My Tasks                 │
                               └────────────────────────────┘
```

---

## Role-Based Access Control Matrix

```
┌─────────────────────┬────────┬─────────┬──────────────┐
│ Route               │ Admin  │Manager  │ Technician   │
├─────────────────────┼────────┼─────────┼──────────────┤
│ /admin/*            │   ✅   │   ❌    │      ❌      │
│ /admin/users        │   ✅   │   ❌    │      ❌      │
│ /admin/teams        │   ✅   │   ❌    │      ❌      │
│ /admin/equipment    │   ✅   │   ❌    │      ❌      │
│ /admin/reports      │   ✅   │   ❌    │      ❌      │
├─────────────────────┼────────┼─────────┼──────────────┤
│ /manager/*          │   ❌   │   ✅    │      ❌      │
│ /manager/dashboard  │   ❌   │   ✅    │      ❌      │
│ /manager/calendar   │   ❌   │   ✅    │      ❌      │
│ /manager/equipment  │   ❌   │   ✅    │      ❌      │
│ /manager/reports    │   ❌   │   ✅    │      ❌      │
├─────────────────────┼────────┼─────────┼──────────────┤
│ /technician/*       │   ❌   │   ❌    │      ✅      │
│ /technician/dashbrd │   ❌   │   ❌    │      ✅      │
│ /technician/kanban  │   ❌   │   ❌    │      ✅      │
│ /technician/tasks   │   ❌   │   ❌    │      ✅      │
├─────────────────────┼────────┼─────────┼──────────────┤
│ /profile            │   ✅   │   ✅    │      ✅      │
│ /activity           │   ✅   │   ✅    │      ✅      │
└─────────────────────┴────────┴─────────┴──────────────┘

✅ = Access Allowed
❌ = Access Denied (Redirect to user's dashboard)
```

---

## Component Hierarchy

```
main.jsx
  └─ BrowserRouter
      └─ AuthProvider (AuthContext)
          └─ App.jsx
              └─ Routes
                  ├─ /signin
                  │   └─ Login (public)
                  │
                  ├─ /admin/*
                  │   └─ AuthenticatedLayout
                  │       └─ ProtectedRoute (allowedRoles={['admin']})
                  │           └─ Page Component
                  │               ├─ RoleBasedNavigation
                  │               └─ Content
                  │
                  ├─ /manager/*
                  │   └─ AuthenticatedLayout
                  │       └─ ProtectedRoute (allowedRoles={['manager']})
                  │           └─ Page Component
                  │               ├─ RoleBasedNavigation
                  │               └─ Content
                  │
                  └─ /technician/*
                      └─ AuthenticatedLayout
                          └─ ProtectedRoute (allowedRoles={['technician']})
                              └─ Page Component
                                  ├─ RoleBasedNavigation
                                  └─ Content
```

---

## Data Flow: Login to Dashboard

```
User Input
   │
   ▼
┌──────────────────┐
│  Login Component │
│  (email, pwd)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ AuthContext.login()      │
│ - Verify credentials     │
│ - Validate against DB    │
└────────┬─────────────────┘
         │
    ┌────┴─────────────────┐
    │   Success            │
    │                      │
    ▼                      ▼
┌──────────────────┐  ┌──────────────┐
│ Store user in:   │  │ Throw error  │
│ - localStorage   │  │ Display msg  │
│ - AuthContext    │  └──────────────┘
│ - state          │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ getDashboardUrl()        │
│ Check user.role          │
└────────┬─────────────────┘
         │
    ┌────┴────┬────────┬─────────┐
    │          │        │         │
    ▼          ▼        ▼         ▼
┌───────┐  ┌────────┐ ┌────────────┐
│admin? │  │manager?│ │technician? │
│  YES  │  │  YES   │ │    YES     │
└───┬───┘  └───┬────┘ └─────┬──────┘
    │          │             │
    ▼          ▼             ▼
/admin/   /manager/    /technician/
dashboard dashboard    dashboard
    │          │             │
    ▼          ▼             ▼
┌─────────────────────────────────────┐
│  AuthenticatedLayout renders:        │
│  - RoleBasedNavigation (sidebar)     │
│  - Route Component (main content)    │
└─────────────────────────────────────┘
```

---

## State Management

### AuthContext State
```javascript
{
  user: {
    id: '1',
    name: 'Mahavir Virdha',
    email: 'mahavir@company.com',
    role: 'admin'  // 'admin' | 'manager' | 'technician'
  },
  loading: false,
  error: null,
  isAuthenticated: true
}
```

### localStorage
```javascript
localStorage = {
  authUser: JSON.stringify(user),
  token: 'token_1_1234567890'
}
```

---

## Redirect Behavior

### Unauthorized Access
```
User Role: technician
Tries to access: /admin/users
             │
             ▼
    ProtectedRoute checks:
    - isAuthenticated? ✅ YES
    - allowedRoles includes 'technician'? ❌ NO
             │
             ▼
    Call: getDashboardUrl()
    Returns: '/technician/dashboard'
             │
             ▼
    Navigate to: /technician/dashboard
    (NOT /dashboard, NOT /admin/dashboard)
```

---

## Security Features

✅ **What's Protected:**
- Routes are checked on every navigation
- User role determined server-side (in production)
- Tokens stored in localStorage
- Unauthorized access caught and redirected

✅ **What's Public:**
- Login page
- Password reset
- Landing page
- OAuth callback

✅ **Best Practices:**
- No role selection by user
- No hardcoded routes in components
- Centralized route definitions
- Consistent redirect logic

---

## Performance Considerations

```
Initial Load:
1. Browser loads main.jsx
2. AuthProvider checks localStorage
3. If token found, loads user from storage
4. Renders App with user context ready
5. No additional API call needed

On Route Change:
1. ProtectedRoute checks user state (instant)
2. No network delay for access control
3. Instant redirect if unauthorized

On Logout:
1. Clear localStorage
2. Clear AuthContext state
3. Redirect to /signin
4. All routes become inaccessible
```

---

This architecture follows enterprise patterns used by Odoo, ServiceNow, and other large-scale applications.
