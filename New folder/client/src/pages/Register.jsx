import { useState } from "react";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", role: "bidder" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/register", form);
      alert("Registered. Now login.");
    } catch (e) {
      alert(e.response?.data?.error || "Register failed");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <h2>Register</h2>
      <input placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <select value={form.role} onChange={(e)=>setForm({ ...form, role: e.target.value })}>
        <option value="bidder">bidder</option>
        <option value="admin">admin</option>
      </select>
      <button>Sign up</button>
    </form>
  );
}
