import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Members from "./pages/Members.jsx";
import Admin from "./pages/Admin.jsx";
import Events from "./pages/Events.jsx";
import Gallery from "./pages/Gallery.jsx";
import Profile from "./pages/Profile.jsx";

function Protected({ children, admin = false }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <p className="page">Chargement…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/members" element={<Protected><Members /></Protected>} />
        <Route path="/gallery" element={<Protected><Gallery /></Protected>} />
        <Route path="/events" element={<Protected><Events /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
}
