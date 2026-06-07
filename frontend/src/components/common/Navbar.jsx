import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useThemeStore, useCartStore } from '../../utils/store';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { itemCount } = useCartStore();
  const [search, setSearch]       = useState('');
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?keyword=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); setUserOpen(false); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">🌊 <span>ShopWave</span></Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
          <button type="submit">🔍</button>
        </form>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>

          {isAuthenticated && (
            <>
              <Link to="/wishlist" className="icon-btn" title="Wishlist">♡</Link>
              <Link to="/cart" className="icon-btn cart-icon" title="Cart">
                🛒{itemCount > 0 && <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="user-wrap" ref={dropRef}>
              <button className="avatar-btn" onClick={() => setUserOpen(!userOpen)}>
                {user?.name?.charAt(0).toUpperCase()}
              </button>
              {userOpen && (
                <div className="dropdown animate-scaleIn">
                  <div className="drop-head"><strong>{user?.name}</strong><span>{user?.email}</span></div>
                  <hr className="drop-divider" />
                  {isAdmin() && <Link to="/admin" className="drop-item" onClick={() => setUserOpen(false)}>⚙️ Admin Dashboard</Link>}
                  <Link to="/profile" className="drop-item" onClick={() => setUserOpen(false)}>👤 My Profile</Link>
                  <Link to="/orders"  className="drop-item" onClick={() => setUserOpen(false)}>📦 My Orders</Link>
                  <hr className="drop-divider" />
                  <button className="drop-item danger" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="icon-btn mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu animate-fadeIn">
          <form onSubmit={handleSearch} style={{ display:'flex', gap:8, padding:'12px 16px' }}>
            <input className="form-input" style={{ flex:1 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">Go</button>
          </form>
          <Link to="/products" className="m-item">All Products</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart"     className="m-item">🛒 Cart ({itemCount})</Link>
              <Link to="/wishlist" className="m-item">♡ Wishlist</Link>
              <Link to="/orders"   className="m-item">📦 Orders</Link>
              <Link to="/profile"  className="m-item">👤 Profile</Link>
              {isAdmin() && <Link to="/admin" className="m-item">⚙️ Admin</Link>}
              <button className="m-item" style={{ color:'var(--danger)' }} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="m-item">Login</Link>
              <Link to="/register" className="m-item">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
