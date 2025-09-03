
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Members from "./pages/Members.jsx";
import Gallery from "./pages/Gallery.jsx";
import Events from "./pages/Events.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import Forgot from "./pages/Forgot.jsx";




function RequireAuth({ children, admin = false }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <p className="page">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}


function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="page">Loading…</p>;
  if (user) return <Navigate to="/" replace />;
  return children;
}



export default function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        {}
        <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />
        <Route path="/forgot" element={<RequireGuest><Forgot /></RequireGuest>} />

        {}
        <Route path="/members" element={<RequireAuth><Members /></RequireAuth>} />
        <Route path="/gallery" element={<RequireAuth><Gallery /></RequireAuth>} />
        <Route path="/events" element={<RequireAuth><Events /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {}
        <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
}