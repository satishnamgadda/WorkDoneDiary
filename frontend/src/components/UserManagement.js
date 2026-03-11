import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = ({ apiBaseUrl }) => {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = ['Teacher', 'HOD', 'College Admin', 'Principal'];
  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/users/`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${apiBaseUrl}/auth/register`, newUser);
      setSuccess('User created successfully!');
      setNewUser({ name: '', email: '', password: '', role: '', department: '' });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${apiBaseUrl}/users/${userId}`);
      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage teachers and staff accounts</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 className="card-title">All Users</h2>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
          >
            {showAddForm ? 'Cancel' : 'Add New User'}
          </button>
        </div>

        {showAddForm && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1a1d26', borderRadius: '8px' }}>
            <h3 style={{ color: '#d4a843', marginBottom: '1rem' }}>Create New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary">Create User</button>
            </form>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2d3a' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a843' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a843' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a843' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a843' }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a843' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #2a2d3a' }}>
                  <td style={{ padding: '1rem', color: '#e8e9ed' }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: '#e8e9ed' }}>{user.email}</td>
                  <td style={{ padding: '1rem', color: '#e8e9ed' }}>{user.role}</td>
                  <td style={{ padding: '1rem', color: '#e8e9ed' }}>{user.department}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;