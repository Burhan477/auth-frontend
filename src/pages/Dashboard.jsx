import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const fetchItems = async () => {
    const res = await api.get("/items");
    setItems(res.data);
  };

  const addItem = async () => {
    await api.post("/items", { title });
    setTitle("");
    fetchItems();
  };

  const deleteItem = async (id) => {
    await api.delete(`/items/${id}`);
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <input
        placeholder="New item"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addItem}>Add</button>

      {items.map((item) => (
        <div className="item" key={item.id}>
          <span>{item.title}</span>
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
