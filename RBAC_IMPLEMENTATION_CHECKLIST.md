# GearGuard RBAC Implementation Checklist

## 📋 Quick Start (5 Minutes)

This checklist helps you implement the role-based authentication system in GearGuard.

### Pre-Integration Status
- [x] AuthContext created with mock users and login logic
- [x] ProtectedRoute component created
- [x] RoleBasedNavigation component created with styles
- [x] New Login page created with styles
- [x] New App.jsx with proper routing structure created
- [x] Global CSS file created

---

## 🔧 Integration Steps

### STEP 1: Update main.jsx (2 minutes)
**Location:** `client/src/main.jsx`

- [ ] Import `AuthProvider` from `./context/AuthContext`
- [ ] Import `BrowserRouter` from `react-router-dom`
- [ ] Wrap App with both `BrowserRouter` and `AuthProvider`:

```jsx
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

- [ ] Status: ✅ Complete

---

### STEP 2: Replace App.jsx (1 minute)
**Location:** `client/src/App.jsx`

**Option A: Copy content**
- [ ] Copy entire content of `App.new.jsx`
- [ ] Paste into `App.jsx`
- [ ] Delete `App.new.jsx`

**Option B: Rename file**
```bash
mv client/src/App.new.jsx client/src/App.jsx
```

- [ ] Verify all imports in App.jsx are correct
- [ ] Status: ✅ Complete

---

### STEP 3: Update or Replace Login.jsx (2 minutes)
**Location:** `client/src/pages/Login.jsx`

**Option A: Quick Replace**
- [ ] Rename `Login.new.jsx` to replace current `Login.jsx`
- [ ] Ensure `Login.css` exists in same directory

**Option B: Keep Both**
- [ ] Update `App.jsx` import to use `Login.new.jsx`
- [ ] Keep old `Login.jsx` for reference

**Verify:**
- [ ] Login page imports `useAuth` hook
- [ ] Login page calls `login()` function from AuthContext
- [ ] Login page has test credentials displayed
- [ ] Status: ✅ Complete

---

### STEP 4: Update Dashboard Components (10 minutes)

#### Update AdminDashboard.jsx
**Location:** `client/src/pages/AdminDashboard.jsx`

**Changes needed:**
- [ ] Remove `MainNavigation` import
- [ ] Remove `{ user, onLogout }` props from function signature
- [ ] Add: `import { useAuth } from '../context/AuthContext'`
- [ ] Add: `const { user } = useAuth()` in component
- [ ] Update all `navigate()` calls to use correct routes:
  - [ ] `/admin/users` (not `/users`)
  - [ ] `/admin/teams` (not `/teams`)
  - [ ] `/admin/equipment` (not `/equipment`)
  - [ ] `/admin/reports` (not `/reporting`)
- [ ] Remove MainNavigation component from JSX
- [ ] Status: ✅ Complete

#### Update ManagerDashboard.jsx
**Location:** `client/src/pages/ManagerDashboard.jsx`

**Changes needed:**
- [ ] Remove `MainNavigation` import
- [ ] Remove `{ user, onLogout }` props from function signature
- [ ] Add: `import { useAuth } from '../context/AuthContext'`
- [ ] Add: `const { user } = useAuth()` in component
- [ ] Update all `navigate()` calls:
  - [ ] `/manager/dashboard`
  - [ ] `/manager/calendar`
  - [ ] `/manager/equipment`
  - [ ] `/manager/reports`
- [ ] Remove MainNavigation component from JSX
- [ ] Status: ✅ Complete

#### Update TechnicianDashboard.jsx
**Location:** `client/src/pages/TechnicianDashboard.jsx`

**Changes needed:**
- [ ] Remove `MainNavigation` import
- [ ] Remove `{ user, onLogout }` props from function signature
- [ ] Add: `import { useAuth } from '../context/AuthContext'`
- [ ] Add: `const { user } = useAuth()` in component
- [ ] Update all `navigate()` calls:
  - [ ] `/technician/dashboard`
  - [ ] `/technician/kanban`
  - [ ] `/technician/tasks`
- [ ] Remove MainNavigation component from JSX
- [ ] Status: ✅ Complete

---

### STEP 5: Fix Global Navigation References (10 minutes)

Update all pages that use `MainNavigation`:

**Find all occurrences:**
```bash
grep -r "MainNavigation" client/src/pages/
grep -r "navigate('/dashboard')" client/src/
```

**Common pages to update:**
- [ ] `Users.jsx` - Change routes to `/admin/users`
- [ ] `Teams.jsx` - Change routes to `/admin/teams`
- [ ] `Equipment.jsx` - Change routes to `/admin/equipment` or `/manager/equipment`
- [ ] `Maintenance.jsx` - Change routes to `/technician/tasks`
- [ ] `MaintenanceCalendar.jsx` - Change routes to `/manager/calendar`
- [ ] `Reporting.jsx` - Change routes to `/admin/reports` or `/manager/reports`
- [ ] `Profile.jsx` - Keep as `/profile` (shared route)
- [ ] `Activity.jsx` - Keep as `/activity` (shared route)

**For each file, remove:**
```jsx
import MainNavigation from '../components/common/MainNavigation'
```

**And remove from JSX:**
```jsx
<MainNavigation user={user} onLogout={onLogout} />
```

- [ ] Status: ✅ Complete

---

### STEP 6: Fix All Navigation Routes (15 minutes)

**Search and replace patterns:**

| Search | Replace |
|--------|---------|
| `navigate('/dashboard')` | `navigate(getDashboardUrl())` |
| `navigate('/admin')` | `navigate('/admin/dashboard')` |
| `navigate('/technician')` | `navigate('/technician/dashboard')` |
| `navigate('/manager')` | `navigate('/manager/dashboard')` |
| `navigate('/users')` | `navigate('/admin/users')` |
| `navigate('/teams')` | `navigate('/admin/teams')` |
| `navigate('/maintenance-kanban')` | `navigate('/technician/kanban')` |
| `navigate('/maintenance')` | `navigate('/technician/tasks')` |
| `navigate('/maintenance-calendar')` | `navigate('/manager/calendar')` |
| `navigate('/reporting')` | `navigate(user.role === 'admin' ? '/admin/reports' : '/manager/reports')` |

**For `getDashboardUrl()` usage:**
- [ ] Add: `const { getDashboardUrl } = useAuth()`
- [ ] Then use: `navigate(getDashboardUrl())`

- [ ] Status: ✅ Complete

---

### STEP 7: Fix Button Visibility by Role (10 minutes)

Ensure buttons only show for allowed roles:

**Pattern to follow:**
```jsx
const { user, hasRole } = useAuth()

return (
  <div>
    {hasRole('admin') && (
      <button onClick={() => navigate('/admin/users')}>
        Manage Users
      </button>
    )}
    
    {hasRole(['admin', 'manager']) && (
      <button onClick={() => navigate(getDashboardUrl())}>
        Dashboard
      </button>
    )}
    
    {hasRole('technician') && (
      <button onClick={() => navigate('/technician/kanban')}>
        Open Kanban
      </button>
    )}
  </div>
)
```

- [ ] Admin: User Management, Team Management, Equipment Config
- [ ] Manager: Calendar, Equipment, Reports
- [ ] Technician: Kanban, My Tasks
- [ ] All: Profile, Activity, Logout
- [ ] Status: ✅ Complete

---

### STEP 8: Test Role-Based Access (5 minutes)

#### Test Admin Login
- [ ] Navigate to http://localhost:5173/signin
- [ ] Email: `mahavir@company.com`
- [ ] Password: `password123`
- [ ] ✅ Should redirect to `/admin/dashboard`
- [ ] ✅ Navigation shows: Dashboard, Users, Teams, Equipment, Reports
- [ ] ✅ Cannot see Kanban or technician routes
- [ ] Status: ✅ Complete

#### Test Manager Login
- [ ] Logout or use new browser tab
- [ ] Navigate to http://localhost:5173/signin
- [ ] Email: `aryan@company.com`
- [ ] Password: `password123`
- [ ] ✅ Should redirect to `/manager/dashboard`
- [ ] ✅ Navigation shows: Dashboard, Calendar, Equipment, Reports
- [ ] ✅ Cannot see Admin Users/Teams or Kanban
- [ ] Status: ✅ Complete

#### Test Technician Login
- [ ] Logout or use new browser tab
- [ ] Navigate to http://localhost:5173/signin
- [ ] Email: `tech1@company.com`
- [ ] Password: `password123`
- [ ] ✅ Should redirect to `/technician/dashboard`
- [ ] ✅ Navigation shows: Dashboard, Kanban, My Tasks
- [ ] ✅ Cannot see Admin or Manager routes
- [ ] Status: ✅ Complete

#### Test Access Control
- [ ] Admin tries to visit `/technician/kanban` → redirects to `/admin/dashboard`
- [ ] Technician tries to visit `/admin/users` → redirects to `/technician/dashboard`
- [ ] Manager tries to visit `/admin/teams` → redirects to `/manager/dashboard`
- [ ] Unauthenticated user tries `/admin/dashboard` → redirects to `/signin`
- [ ] Status: ✅ Complete

---

### STEP 9: Verify Component Integration (5 minutes)

- [ ] All pages render without MainNavigation errors
- [ ] Navigation sidebar appears on all authenticated pages
- [ ] Navigation menu items change based on role
- [ ] User name and email shown in navigation footer
- [ ] Logout button works and clears auth state
- [ ] Mobile menu works (hamburger toggle)
- [ ] All links are clickable and navigate correctly
- [ ] No console errors related to auth or routing
- [ ] Status: ✅ Complete

---

### STEP 10: Backend Integration (Optional, 15 minutes)

**When ready to use real API:**

- [ ] Replace mock `login()` in `AuthContext.jsx`
- [ ] Update to call real backend: `POST /api/auth/login`
- [ ] Expect response: `{ user: { id, name, email, role }, token }`
- [ ] Store token in localStorage for API calls
- [ ] Update all API calls to include Authorization header:

```jsx
const token = localStorage.getItem('token')
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

- [ ] Test login with real credentials
- [ ] Verify token persists across page refreshes
- [ ] Status: ✅ Complete

---

## ✨ Final Verification Checklist

- [ ] ✅ Login page works with all 3 test users
- [ ] ✅ Each role redirects to own dashboard
- [ ] ✅ Role-based navigation menu displays correctly
- [ ] ✅ Unauthorized users redirected to their dashboard (not common)
- [ ] ✅ No MainNavigation imports in any pages
- [ ] ✅ All buttons use correct role-specific routes
- [ ] ✅ Logout clears auth state properly
- [ ] ✅ Navigation works on desktop and mobile
- [ ] ✅ No console errors
- [ ] ✅ All routes protected with ProtectedRoute
- [ ] ✅ Authentication persists on page refresh

---

## 🎉 Completion!

Once all checkboxes are marked, your GearGuard system has:
- ✅ Single login page (no role selection)
- ✅ Role-based redirections to own dashboards
- ✅ Protected routes preventing unauthorized access
- ✅ Dynamic role-based navigation menu
- ✅ Proper button routing without redirect issues
- ✅ Enterprise-grade access control

---

## 📞 Troubleshooting

### Issue: "useAuth is not defined"
- [ ] Check AuthProvider wraps entire app in main.jsx
- [ ] Verify import: `import { useAuth } from '../context/AuthContext'`

### Issue: MainNavigation still appearing
- [ ] Search for all MainNavigation imports
- [ ] Remove: `import MainNavigation from '...'`
- [ ] Remove: `<MainNavigation .../>`

### Issue: Routes not protected
- [ ] Verify all protected routes use `<ProtectedRoute allowedRoles={...}>`
- [ ] Verify routes wrapped in `<AuthenticatedLayout>`

### Issue: Buttons redirect to wrong dashboard
- [ ] Use getDashboardUrl(): `const { getDashboardUrl } = useAuth()`
- [ ] Then: `navigate(getDashboardUrl())`

### Issue: Navigation menu empty
- [ ] Check user is authenticated: `useAuth().isAuthenticated`
- [ ] Verify user.role is set correctly
- [ ] Check browser console for errors

---

## 📞 Support

Refer to:
- `RBAC_IMPLEMENTATION_GUIDE.md` - Detailed overview
- `RBAC_INTEGRATION_PATTERNS.js` - Code patterns and examples
- `AuthContext.jsx` - Authentication logic
- `ProtectedRoute.jsx` - Route protection logic
- `RoleBasedNavigation.jsx` - Navigation menu logic

---

**Start with Step 1 and work through to Step 10. You've got this! 🚀**
