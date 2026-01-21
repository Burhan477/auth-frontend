import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/dashboard.css";

// Simple icons as components for cleaner code
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const SaveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const navigate = useNavigate();

  // 1. Fetch Items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/items");
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 2. Create Item
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const res = await api.post("/items", { title: newItem, description: description });
      // Update local state directly (faster UI)
      setItems([...items, res.data]);
      setNewItem("");
      setDescription("");
      fetchItems();
    } catch (err) {
      console.error("Error adding item");
    }
  };

  // 3. Delete Item
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item");
    }
  };

  // 4. Start Edit Mode
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  // 5. Cancel Edit
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // 6. Save Edit (Update)
  const saveEdit = async (id) => {
    try {
      await api.put(`/items/${id}`, { title: editTitle, description: editDescription });

      setItems(items.map((item) =>
        item.id === id ? { ...item, title: editTitle, description: editDescription } : item
      ));

      setEditingId(null);
      fetchItems();
    } catch (err) {
      console.error("Error updating item");
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
            <h2>My Tasks</h2>
            <p className="subtitle">Manage your daily items</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* Add Item Form */}
        <form className="add-form" onSubmit={addItem}>
          <input
            placeholder="What needs to be done?"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={!newItem}>Add</button>
        </form>

        {/* Loading State */}
        {loading && <div className="loading-text">Loading tasks...</div>}

        {/* Item List */}
        <ul className="item-list">
          {items.length === 0 && !loading && (
            <li className="empty-state">No items yet. Add one above!</li>
          )}

          {items.map((item) => (
            <li className="item-row" key={item.id}>
              {editingId === item.id ? (
                // EDIT MODE
                <div className="edit-mode">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                  <div className="action-buttons">
                    <button onClick={() => saveEdit(item.id)} className="btn-icon save" title="Save">
                      <SaveIcon />
                    </button>
                    <button onClick={cancelEditing} className="btn-icon cancel" title="Cancel">
                      <XIcon />
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div className="view-mode">
                  <span className="item-text">{item.title}</span>
                  <span className="item-description">{item.description}</span>
                  <div className="action-buttons">
                    <button onClick={() => startEditing(item)} className="btn-icon edit" title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="btn-icon delete" title="Delete">
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
  );
}