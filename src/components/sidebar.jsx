export default function Sidebar({ children }) {
  return (
    <aside className="sidebar" aria-label="Navigation principale">
      <nav className="menu">{children}</nav>
    </aside>
  );
}