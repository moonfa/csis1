import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { isAuthed } from "../auth";

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState("");

  async function load() {
    const [i, b] = await Promise.all([
      api.get(`/api/items/${id}`),
      api.get(`/api/bids/${id}`),
    ]);
    setItem(i.data);
    setBids(b.data);
  }

  useEffect(() => { load(); }, [id]);

  const top = bids[0]?.amount ?? 0;

  const place = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/bids", { itemId: id, amount: Number(amount) });
      setAmount("");
      await load();
    } catch (e) {
      alert(e.response?.data?.error || "Bid failed");
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
      <img src={item.image || "https://placehold.co/800x400"} alt="" style={{ width: "100%", borderRadius: 8 }} />
      <h2>{item.title} {item.isClosed && <span style={{ fontSize: 14, opacity: .7 }}>(Closed)</span>}</h2>
      <p>{item.description}</p>

      <div><b>Top bid:</b> ${top}</div>

      {!item.isClosed && isAuthed() && (
        <form onSubmit={place} style={{ display: "flex", gap: 8 }}>
          <input type="number" min={top + 1} step="1" value={amount}
            onChange={(e)=>setAmount(e.target.value)} placeholder={`>= ${top + 1}`} />
          <button>Place Bid</button>
        </form>
      )}

      <div>
        <h3>Bid History</h3>
        <ul>
          {bids.map((b) => (
            <li key={b._id}>{b.userId} — ${b.amount}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
