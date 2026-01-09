
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <h2>User Management</h2>
        <p>Create, edit, and manage users and their roles.</p>
        <Link to="/admin/users">Manage Users</Link>
      </div>
      <div>
        <h2>Team Management</h2>
        <p>Create and manage maintenance teams.</p>
        <Link to="/admin/teams">Manage Teams</Link>
      </div>
      <div>
        <h2>Equipment Configuration</h2>
        <p>Configure and manage equipment.</p>
        <Link to="/equipment">Manage Equipment</Link>
      </div>
      <div>
        <h2>Reports Access</h2>
        <p>View and generate system reports.</p>
        <Link to="/reporting">View Reports</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
