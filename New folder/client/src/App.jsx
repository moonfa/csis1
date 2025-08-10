import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Items from "./pages/Items";
import ItemDetail from "./pages/ItemDetail";
import Admin from "./pages/Admin";
import { isAuthed, getRole, logout } from "./auth";

function Guard({ children, role }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  if (role && getRole() !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const nav = useNavigate();
  const authed = isAuthed();
  const role = getRole();

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 12 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/">Items</Link>
        {role === "admin" && <Link to="/admin">Admin</Link>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!authed ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={() => { logout(); nav("/"); }}>Logout</button>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
      </Routes>
    </div>
  );
}
