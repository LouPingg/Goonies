export default function DefaultLayout({ children }) {
  return (
    <>
      <header className="banner">
        <div className="banner__overlay"></div>
        <div className="banner__inner">
          <img src="/logo.png" alt="Logo Goonies" className="banner__logo" />
          <h1>GOONIES</h1>
          <p>Le clan qui ne lâche rien. Rejoignez l’aventure !</p>
        </div>
      </header>

      <div className="pagewrap">{children}</div>
    </>
  );
}