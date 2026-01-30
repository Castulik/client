import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Settings, ArrowLeft } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Kde chceme vidět SPODNÍ MENU?
  const showBottomNav = ['/', '/favorite', '/optimum'].includes(location.pathname);

  // Kde chceme vidět ŠIPKU ZPĚT? (Všude KROMĚ těchto stránek)
  const showBackArrow = !['/', '/favorite'].includes(location.pathname);

  // Kde chceme vidět TLAČÍTKO NASTAVENÍ? (Na obou hlavních stránkách)
  const showSettings = ['/', '/favorite'].includes(location.pathname);

  const getPageTitle = (): string => {
    switch (location.pathname) {
      case '/': return 'Nákupní seznam';
      case '/favorite': return 'Oblíbená jídla';
      case '/settings': return 'Nastavení';
      case '/optimum': return 'Výsledky hledání'; // Nová stránka
      default: return 'Aplikace';
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="top-bar">
        <div className="header-left">
          {showBackArrow && (
            <button onClick={() => navigate(-1)} className="icon-btn">
              <ArrowLeft size={24} />
            </button>
          )}
        </div>
        <h1 className="page-title">{getPageTitle()}</h1>
        <div className="header-right">
          {showSettings && (
            <button onClick={() => navigate('/settings')} className="icon-btn">
              <Settings size={24} />
            </button>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      {/* BOTTOM NAV */}
      {showBottomNav && (
        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingCart size={24} />
            <span>Nákup</span>
          </NavLink>
          <NavLink to="/favorite" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Heart size={24} />
            <span>Oblíbené</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};

export default Layout;