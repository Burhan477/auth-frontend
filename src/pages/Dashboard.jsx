// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/dashboard.css";

const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const SaveIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState(""); // Added Name state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState(""); // Added Edit Name state
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;

    try {
      // Included name in payload
      const res = await api.post("/users", { name: newName, email: newEmail, password: newPassword });
      setUsers([...users, res.data]);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err) {
      console.error("Error adding user", err);
      alert(err.response?.data?.error || "Error adding user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Error deleting user");
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditName(user.name || ""); // Set initial edit name
    setEditEmail(user.email);
    setEditPassword("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
  };

  const saveEdit = async (id) => {
    try {
      // Include name in update payload
      const payload = { name: editName, email: editEmail };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      const res = await api.put(`/users/${id}`, payload);

      setUsers(users.map((user) =>
        user.id === id ? { ...user, name: res.data.name, email: res.data.email } : user
      ));

      setEditingId(null);
    } catch (err) {
      console.error("Error updating user");
      alert(err.response?.data?.error || "Error updating user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <div className="dashboard-header">
          <div>
            <h2>User Management</h2>
            <p className="subtitle">Add, edit, or remove system users</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>

        {/* Add User Section */}
        <div className="add-user-section">
          <h3>Create New User</h3>
          <form className="add-form" onSubmit={addUser}>
            <input
              type="text"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Secure Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={!newName || !newEmail || !newPassword}>Create User</button>
          </form>
        </div>

        {loading && <div className="loading-text">Loading user records...</div>}

        {/* Data Grid / Table */}
        <div className="user-table-container">
          <div className="table-header">
            <span>Name</span>
            <span>Email Address</span>
            <span>User ID</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          <ul className="user-list">
            {users.length === 0 && !loading && (
              <li className="empty-state">No users found. Create one above to get started.</li>
            )}

            {users.map((user) => (
              <li className="user-row" key={user.id}>
                {editingId === user.id ? (
                  // IMPROVED EDIT MODE: Wrapped in a form for "Enter" key support
                  <form
                    className="edit-mode active-edit-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit(user.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  >
                    <input
                      type="text"
                      className="edit-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Full Name"
                      autoFocus
                      required
                    />
                    <input
                      type="email"
                      className="edit-input"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email Address"
                      required
                    />
                    <input
                      type="password"
                      className="edit-input"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="New Password (Optional)"
                    />
                    <div className="action-buttons">
                      <button type="submit" className="btn-icon save" title="Save Changes (Enter)">
                        <SaveIcon />
                      </button>
                      <button type="button" onClick={cancelEditing} className="btn-icon cancel" title="Cancel (Esc)">
                        <XIcon />
                      </button>
                    </div>
                  </form>
                ) : (
                  // VIEW MODE
                  <div className="view-mode">
                    <span className="user-text" style={{ fontWeight: 600 }}>{user.name || "N/A"}</span>
                    <span className="user-text">{user.email}</span>
                    <span className="user-id">#{user.id}</span>
                    <div className="action-buttons">
                      <button onClick={() => startEditing(user)} className="btn-icon edit" title="Edit User">
                        <EditIcon />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="btn-icon delete" title="Delete User">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}