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

function Protected({ children, admin = false }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <p className="page">Chargement…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Invités uniquement (si déjà connecté -> redirige vers /)
function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="page">Chargement…</p>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* invité uniquement */}
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* connecté */}
        <Route path="/members" element={<Protected><Members /></Protected>} />
        <Route path="/gallery" element={<Protected><Gallery /></Protected>} />
        <Route path="/events" element={<Protected><Events /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        {/* admin */}
        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
}
