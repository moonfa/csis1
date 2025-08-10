import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Items() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await api.get("/items", { params: q ? { q } : {} });
    setItems(data);
  }

  useEffect(() => { load(); }, []); // initial
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [q]);

  useEffect(() => {
    const sse = new EventSource(`${API_URL}/stream`);
    sse.addEventListener("bid", () => load());
    sse.addEventListener("closed", () => load());
    return () => sse.close();
  }, []);

  const list = useMemo(() => items, [items]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={q} placeholder="Search title..." onChange={(e)=>setQ(e.target.value)} />
        <button onClick={load}>Refresh</button>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
        {list.map(it => (
          <Link key={it._id} to={`/items/${it._id}`} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
            <img src={it.image || "https://placehold.co/400x240"} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
            <div style={{ marginTop: 8, fontWeight: 600 }}>{it.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{it.isClosed ? "Closed" : "Open"}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
