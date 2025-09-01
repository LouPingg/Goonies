export default function Sidebar({ children }) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <nav className="menu">{children}</nav>
    </aside>
  );
}