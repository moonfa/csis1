import { useEffect, useState } from "react";
import api from "../api";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: "" });

  async function load() {
    const { data } = await api.get("/items");
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  const createItem = async (e) => {
    e.preventDefault();
    try {
      await api.post("/items", form);
      setForm({ title: "", description: "", image: "" });
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Create failed");
    }
  };

  const closeAuction = async (id) => {
    try {
      await api.patch(`/admin/close/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Close failed");
    }
  };

  const delItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/items/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || "Delete failed");
    }
  };

  const notify = async (id) => {
    try {
      const { data } = await api.post(`/admin/notify/${id}`);
      alert(data.sent ? "Notified" : "No winner");
    } catch (e) {
      alert(e.response?.data?.error || "Notify failed");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form onSubmit={createItem} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <h2>Create Item</h2>
        <input placeholder="Title" value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} />
        <input placeholder="Image URL (optional)" value={form.image} onChange={(e)=>setForm({ ...form, image: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} />
        <button>Create</button>
      </form>

      <h2>All Items</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(it => (
          <div key={it._id} style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}>
            <b>{it.title}</b> — {it.isClosed ? "Closed" : "Open"}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {!it.isClosed && <button onClick={() => closeAuction(it._id)}>Close</button>}
              <button onClick={() => notify(it._id)}>Notify Winner</button>
              <button onClick={() => delItem(it._id)} style={{ color: "crimson" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
