import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DefaultLayout({ children }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <nav className="menu">
          <NavLink to="/">Accueil</NavLink>
          <NavLink to="/members">Membres</NavLink>
          <NavLink to="/gallery">Galerie</NavLink>
          <NavLink to="/events">Événements</NavLink>
          {user && <NavLink to="/profile">Mon profil</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {!user ? (
            <NavLink to="/login">Connexion</NavLink>
          ) : (
            <button className="menu__logout" onClick={logout}>Se déconnecter</button>
          )}
        </nav>
      </aside>

      <main className="content">
        {/* Bannière commune */}
        <div className="banner">
          <div className="banner__overlay" />
          <div className="banner__inner">
            <div>
              <img src="./logo.png" className="banner__logo" alt="Goonies logo" />
              <h1>GOONIES</h1>
              <p>Le clan des aventuriers — bienvenue.</p>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}