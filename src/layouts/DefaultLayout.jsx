// src/layouts/DefaultLayout.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DefaultLayout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const base = import.meta.env.BASE_URL || "/";

  return (
    <div
      className="layout"
      style={{
        /* 1) URLs dynamiques compatibles GH Pages */
        "--logo-url": `url('${base}logo.png')`,
        "--banner-url": `url('${base}image.png')`,
      }}
    >
      <aside className="sidebar">
        <nav className="menu">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/members">Members</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/events">Events</NavLink>
          {user && <NavLink to="/profile">My profile</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}

          {!user ? (
            <>
              <NavLink to="/login">Sign in</NavLink>
              <NavLink to="/register">Create account</NavLink>
            </>
          ) : (
            <button className="menu__logout" onClick={logout}>Sign out</button>
          )}
        </nav>

        {/* chat “run” pivoté */}
        <img
          className="sidebar__cat-run"
          src={`${base}assets/cats/run.png`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      </aside>

      <main className="content">
        {/* Bannière FIXE en haut, full-bleed */}
        <div className="banner">
          <div className="banner__overlay" />
          <div className="banner__inner">
            <div>
              <h1>GOONIES</h1>
              <p>
                HeY yOu GuYs !!!
                Whether you're here to relax, have fun, or create memories with friends,
                you're now part of GOONIES.
              </p>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}