import { Link, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Music from "./pages/Music";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav style={{ padding: 12 }}>
        <Link to="/" style={{ marginRight: 8 }}>
          Home
        </Link>
        <Link to="/music" style={{ marginRight: 8 }}>
          Music
        </Link>
        <Link to="/login" style={{ marginRight: 8 }}>
          Login
        </Link>
        <Link to="/register">Register</Link>
      </nav>

      <main style={{ padding: 12 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
