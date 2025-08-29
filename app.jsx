import { Routes, Route, NavLink } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Members from "./pages/Members.jsx";
import Gallery from "./pages/Gallery.jsx";
import Events from "./pages/Events.jsx";

export default function App() {
  return (
    <div className="layout">
      <Sidebar>
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/members">Membres</NavLink>
        <NavLink to="/gallery">Galerie</NavLink>
        <NavLink to="/events">Événements</NavLink>
      </Sidebar>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
    </div>
  );
}