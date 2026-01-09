import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'manager' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return navigate('/signin');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'manager' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">User Management</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full p-2 border" />
        <div className="flex gap-2">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" className="flex-1 p-2 border" />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" className="flex-1 p-2 border" />
        </div>
        <select name="role" value={form.role} onChange={handleChange} className="p-2 border">
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="technician">Technician</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
      </form>

      <h3 className="text-xl mb-2">Existing Users</h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u._id} className="p-2 border rounded flex justify-between">
            <div>
              <div className="font-semibold">{u.email}</div>
              <div className="text-sm text-gray-600">{u.firstName || ''} {u.lastName || ''}</div>
            </div>
            <div className="text-sm px-2 py-1 bg-gray-100 rounded">{u.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
