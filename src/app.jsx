import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Members from "./pages/Members.jsx";
import Gallery from "./pages/Gallery.jsx";
import Events from "./pages/Events.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";

/* ---------- Routes protégées ---------- */
function Protected({ children, admin = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

/* ---------- Liens de navigation ---------- */
function NavItems() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      <NavLink to="/" end>Accueil</NavLink>
      <NavLink to="/members">Membres</NavLink>
      <NavLink to="/gallery">Galerie</NavLink>
      <NavLink to="/events">Événements</NavLink>

      {!user && <NavLink to="/login">Connexion</NavLink>}
      {!user && <NavLink to="/register">Créer un compte</NavLink>}

      {user && <NavLink to="/profile">Mon profil</NavLink>}
      {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      {user && (
        <button className="menu__logout" onClick={logout}>
          Déconnexion
        </button>
      )}
    </>
  );
}

/* ---------- Application principale ---------- */
export default function App() {
  return (
    <AuthProvider>
      <div className="layout">
        <Sidebar><NavItems /></Sidebar>

        <main className="content">
          <DefaultLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
            </Routes>
          </DefaultLayout>
        </main>
      </div>
    </AuthProvider>
  );
}