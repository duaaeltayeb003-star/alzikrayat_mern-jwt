import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Alzikrayat</span>
          <span className="brand-ar" lang="ar">
            الذكريات
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/gallery" onClick={closeMenu}>
            Gallery
          </NavLink>
          {user && (
            <NavLink to="/upload" onClick={closeMenu}>
              Add photo
            </NavLink>
          )}

          <div className="nav-user">
            {user ? (
              <>
                <span className="greeting">Hi {user.firstName}</span>
                <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-small" onClick={closeMenu}>
                Please Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
