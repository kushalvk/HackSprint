# GearGuard RBAC - Visual Guide

## 1. Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GearGuard Login Flow                             │
└─────────────────────────────────────────────────────────────────────┘

User navigates to /signin
        │
        ▼
    ┌─────────────────────────────────────┐
    │   Login Page                        │
    │  ┌───────────────────────────────┐  │
    │  │ Email:    [____________]      │  │
    │  │ Password: [____________]  👁️  │  │
    │  │                               │  │
    │  │        [Sign In Button]       │  │
    │  │                               │  │
    │  │ Test Accounts:                │  │
    │  │ • admin@company.com           │  │
    │  │ • manager@company.com         │  │
    │  │ • tech@company.com            │  │
    │  └───────────────────────────────┘  │
    └─────────────────────────────────────┘
        │
        ▼ (Submit)
    ┌─────────────────────────────────────┐
    │  AuthContext.login(email, pwd)      │
    │  • Check mock database              │
    │  • Validate credentials             │
    │  • Extract user data                │
    │  • Store in localStorage            │
    │  • Update AuthContext state         │
    └─────────────────────────────────────┘
        │
        ├─── ✅ Success ────┬─── ❌ Error
        │                   │
        ▼                   ▼
    getDashboardUrl()  Show Error Message
        │
        ├─ user.role = 'admin'
        │  → /admin/dashboard
        │
        ├─ user.role = 'manager'
        │  → /manager/dashboard
        │
        └─ user.role = 'technician'
           → /technician/dashboard
        │
        ▼
    ┌─────────────────────────────────────┐
    │  AuthenticatedLayout renders:       │
    │  ┌─────────────────────────────────┐│
    │  │ RoleBasedNavigation             ││
    │  │ ┌─────────────────────────────┐ ││
    │  │ │ Dashboard  Kanban  My Tasks │ ││
    │  │ │ (For Technician)            │ ││
    │  │ └─────────────────────────────┘ ││
    │  └─────────────────────────────────┘│
    │  ┌─────────────────────────────────┐│
    │  │ Main Content                    ││
    │  │ ┌─────────────────────────────┐ ││
    │  │ │ Technician Dashboard        │ ││
    │  │ │ - My Tasks                  │ ││
    │  │ │ - Upcoming Work             │ ││
    │  │ │ [Open Kanban]               │ ││
    │  │ └─────────────────────────────┘ ││
    │  └─────────────────────────────────┘│
    └─────────────────────────────────────┘
```

---

## 2. Role-Based Dashboard Routing

```
After Login
    │
    ├─ ADMIN (mahavir@company.com)
    │   │
    │   └─ /admin/dashboard
    │       │
    │       ├─── [Users]      ──→ /admin/users
    │       ├─── [Teams]      ──→ /admin/teams
    │       ├─── [Equipment]  ──→ /admin/equipment
    │       └─── [Reports]    ──→ /admin/reports
    │
    ├─ MANAGER (aryan@company.com)
    │   │
    │   └─ /manager/dashboard
    │       │
    │       ├─── [Calendar]   ──→ /manager/calendar
    │       ├─── [Equipment]  ──→ /manager/equipment
    │       └─── [Reports]    ──→ /manager/reports
    │
    └─ TECHNICIAN (tech1@company.com)
        │
        └─ /technician/dashboard
            │
            ├─── [Kanban]   ──→ /technician/kanban
            └─── [My Tasks] ──→ /technician/tasks
```

---

## 3. Protected Route Flow

```
User tries to access /admin/users
        │
        ▼
┌─────────────────────────────────────┐
│ <ProtectedRoute                     │
│   allowedRoles={['admin']}          │
│ >                                   │
└────────────────┬────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    isAuthenticated?  allowedRoles
         │             match?
    ┌────┴────┐      ┌───┴────┐
    │ YES  NO │      │ YES NO │
    ▼         ▼      ▼        ▼
    ✅      ❌     ✅       ❌
   Render Goto   Render Redirect
  Component Login Component to
             (protectedRoute) getDashboardUrl()
                            │
                            └─ /admin/dashboard
                              OR
                            └─ /technician/dashboard
                              OR
                            └─ /manager/dashboard
```

---

## 4. Navigation Menu Per Role

```
ADMIN Navigation
┌────────────────────────────┐
│ GearGuard          [ADMIN]  │
├────────────────────────────┤
│ 📊 Admin Dashboard         │
│ 👥 Users                   │
│ 👨‍💼 Teams                   │
│ 🔧 Equipment               │
│ 📈 Reports                 │
├────────────────────────────┤
│ [User Avatar]              │
│ mahavir@company.com        │
│ [Logout]                   │
└────────────────────────────┘

MANAGER Navigation
┌────────────────────────────┐
│ GearGuard       [MANAGER]   │
├────────────────────────────┤
│ 📊 Manager Dashboard       │
│ 📅 Calendar                │
│ 🔧 Equipment               │
│ 📈 Reports                 │
├────────────────────────────┤
│ [User Avatar]              │
│ aryan@company.com          │
│ [Logout]                   │
└────────────────────────────┘

TECHNICIAN Navigation
┌────────────────────────────┐
│ GearGuard      [TECHNICIAN] │
├────────────────────────────┤
│ 📊 My Dashboard            │
│ 📋 Kanban Board            │
│ ✓ My Tasks                 │
├────────────────────────────┤
│ [User Avatar]              │
│ tech1@company.com          │
│ [Logout]                   │
└────────────────────────────┘
```

---

## 5. Access Control Matrix

```
                    ✅ Can Access      ❌ Cannot Access
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│ ADMIN                                                        │
│ ┌──────────────────┐              ┌──────────────────┐     │
│ │ /admin/*         │              │ /technician/*    │     │
│ │ /admin/users     │              │ /technician/kban │     │
│ │ /admin/teams     │              │ /technician/tasks│     │
│ │ /admin/equipment │              │                  │     │
│ │ /admin/reports   │              │                  │     │
│ │ /profile         │              │                  │     │
│ │ /activity        │              │                  │     │
│ └──────────────────┘              └──────────────────┘     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ MANAGER                                                      │
│ ┌──────────────────┐              ┌──────────────────┐     │
│ │ /manager/*       │              │ /admin/*         │     │
│ │ /manager/dashboard               │ /admin/users     │     │
│ │ /manager/calendar│              │ /admin/teams     │     │
│ │ /manager/equipment               │ /technician/kban │     │
│ │ /manager/reports │              │                  │     │
│ │ /profile         │              │                  │     │
│ │ /activity        │              │                  │     │
│ └──────────────────┘              └──────────────────┘     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ TECHNICIAN                                                   │
│ ┌──────────────────┐              ┌──────────────────┐     │
│ │ /technician/*    │              │ /admin/*         │     │
│ │ /technician/dashboard            │ /admin/users     │     │
│ │ /technician/kanban               │ /manager/*       │     │
│ │ /technician/tasks│              │ /manager/calendar│     │
│ │ /profile         │              │ /manager/reports │     │
│ │ /activity        │              │                  │     │
│ └──────────────────┘              └──────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Component Architecture

```
main.jsx
  │
  ├─ BrowserRouter
  │   │
  │   └─ AuthProvider
  │       │
  │       └─ App.jsx
  │           │
  │           └─ Routes
  │               │
  │               ├─ /signin ─────────────────────────┐
  │               │                                    │
  │               ├─ / ────────────────────────────────┤
  │               │                                    │
  │               ├─ Protected Routes                 │
  │               │  │                                 │
  │               │  └─ /admin/*                      │
  │               │     ├─ AuthenticatedLayout        │
  │               │     ├─ ProtectedRoute             │
  │               │     │  allowedRoles={['admin']}   │
  │               │     ├─ RoleBasedNavigation        │
  │               │     └─ <AdminDashboard />         │
  │               │                                    │
  │               │  └─ /manager/*                    │
  │               │     ├─ AuthenticatedLayout        │
  │               │     ├─ ProtectedRoute             │
  │               │     │  allowedRoles={['manager']} │
  │               │     ├─ RoleBasedNavigation        │
  │               │     └─ <ManagerDashboard />       │
  │               │                                    │
  │               │  └─ /technician/*                 │
  │               │     ├─ AuthenticatedLayout        │
  │               │     ├─ ProtectedRoute             │
  │               │     │allowedRoles={['technician']}│
  │               │     ├─ RoleBasedNavigation        │
  │               │     └─ <TechnicianDashboard />    │
  │               │                                    │
  │               └─ /shared/*                        │
  │                   ├─ AuthenticatedLayout          │
  │                   ├─ ProtectedRoute               │
  │                   │  (no role restriction)        │
  │                   ├─ RoleBasedNavigation          │
  │                   └─ <SharedComponent />          │
  │                                                    │
  └────────────────────────────────────────────────────┘
         All public routes don't show nav
```

---

## 7. Login vs Unauthorized Access

```
SCENARIO 1: User Not Logged In
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tries to access: /admin/users
       │
       ▼
ProtectedRoute checks:
  isAuthenticated? ❌ NO
       │
       ▼
  Redirect to: /signin
       │
       ▼
  Show Login Page


SCENARIO 2: User Logged In but Wrong Role
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Technician tries: /admin/users
       │
       ▼
ProtectedRoute checks:
  isAuthenticated? ✅ YES
  role in ['admin']? ❌ NO
       │
       ▼
  getDashboardUrl() returns:
  /technician/dashboard
       │
       ▼
  Redirect to: /technician/dashboard
       │
       ▼
  Render Technician Dashboard


SCENARIO 3: User Logged In with Correct Role
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Admin accesses: /admin/users
       │
       ▼
ProtectedRoute checks:
  isAuthenticated? ✅ YES
  role in ['admin']? ✅ YES
       │
       ▼
  Render: /admin/users component
       │
       ▼
  Show: User Management Page
```

---

## 8. Sidebar Navigation (Desktop)

```
┌──────────────────────────────────────────┐
│                                          │
│  GearGuard              [ADMIN BADGE]   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  📊 Admin Dashboard                      │
│     └─ /admin/dashboard (ACTIVE)         │
│                                          │
│  👥 Users                                │
│     └─ /admin/users                      │
│                                          │
│  👨‍💼 Teams                                │
│     └─ /admin/teams                      │
│                                          │
│  🔧 Equipment                            │
│     └─ /admin/equipment                  │
│                                          │
│  📈 Reports                              │
│     └─ /admin/reports                    │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [User Avatar: M]                        │
│  Mahavir Virdha                          │
│  mahavir@company.com                     │
│                                          │
│  [🚪 Logout]                             │
│                                          │
└──────────────────────────────────────────┘

Main Content Area (remains same for all)
┌──────────────────────────────────────────┐
│ Page Title                               │
│ Page Subtitle                            │
├──────────────────────────────────────────┤
│                                          │
│ [Page Content Here]                      │
│                                          │
└──────────────────────────────────────────┘
```

---

## 9. File Structure

```
client/src/
│
├─── context/
│    └─ AuthContext.jsx          ← Authentication Logic
│
├─── components/
│    └─ routes/
│        ├─ ProtectedRoute.jsx    ← Route Protection
│        ├─ RoleBasedNavigation.jsx ← Dynamic Menu
│        └─ RoleBasedNavigation.css ← Menu Styles
│
├─── pages/
│    ├─ Login.new.jsx            ← New Login Page
│    ├─ Login.css                ← Login Styles
│    ├─ AdminDashboard.jsx       ← (Update needed)
│    ├─ ManagerDashboard.jsx     ← (Update needed)
│    └─ TechnicianDashboard.jsx  ← (Update needed)
│
├─── App.new.jsx                 ← New Routing
├─── App.css                     ← Global Styles
├─── main.jsx                    ← (Update needed)
│
└─── [Other files unchanged]

Documentation:
├─ RBAC_README.md                    ← Start here!
├─ RBAC_SUMMARY.md                   ← Quick overview
├─ RBAC_IMPLEMENTATION_CHECKLIST.md  ← Step-by-step
├─ RBAC_ROUTING_ARCHITECTURE.md      ← System design
├─ RBAC_INTEGRATION_PATTERNS.js      ← Code examples
└─ RBAC_IMPLEMENTATION_GUIDE.md      ← Full details
```

---

## 10. Implementation Timeline

```
Time    Step                              Status
────────────────────────────────────────────────────
0 min   📖 Read RBAC_README.md           START
        📋 Read RBAC_SUMMARY.md
        
5 min   🔧 Update main.jsx              STEP 1
        └─ Add AuthProvider wrapper
        
10 min  📄 Replace App.jsx               STEP 2
        └─ Copy App.new.jsx content
        
12 min  🔐 Update Login page             STEP 3
        └─ Use Login.new.jsx
        
15 min  🏠 Update AdminDashboard         STEP 4
        └─ Remove MainNavigation
        └─ Use useAuth hook
        
18 min  🏠 Update ManagerDashboard       STEP 5
        └─ Remove MainNavigation
        └─ Use useAuth hook
        
21 min  🏠 Update TechnicianDashboard    STEP 6
        └─ Remove MainNavigation
        └─ Use useAuth hook
        
25 min  🔗 Fix all navigate calls        STEP 7
        └─ Use getDashboardUrl()
        
27 min  ✅ Test with all 3 users        STEP 8
        └─ Verify role-based access
        
30 min  🎉 Complete!                     DONE!

Total: ~30 minutes for full integration
```

---

This visual guide helps understand how all components work together! 🚀
