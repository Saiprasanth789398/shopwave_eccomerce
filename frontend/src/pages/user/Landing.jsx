import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeleton';
import './Landing.css';

const CATS = [
  { name:'Electronics', icon:'💻' }, { name:'Clothing', icon:'👕' },
  { name:'Books', icon:'📚' },       { name:'Home & Garden', icon:'🏡' },
  { name:'Sports', icon:'⚽' },      { name:'Beauty', icon:'💄' },
];

const Landing = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [q, setQ]               = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.getFeatured()
      .then(({ data }) => setFeatured(data.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/products?keyword=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-blobs"><div className="blob b1"/><div className="blob b2"/></div>
        <div className="container">
          <div className="hero-content animate-fadeUp">
            <span className="hero-badge">🌊 New Season — Up to 60% Off</span>
            <h1 className="hero-h1">Discover Products<br /><span className="hero-accent">You'll Love</span></h1>
            <p className="hero-sub">Curated collections of premium products delivered to your doorstep.</p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input placeholder="Search for products…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div className="hero-btns">
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now →</Link>
              <Link to="/products?featured=true" className="btn btn-secondary btn-lg">Featured</Link>
            </div>
          </div>
          <div className="hero-stats animate-fadeUp">
            {[['50K+','Customers'],['10K+','Products'],['99%','Satisfaction'],['24/7','Support']].map(([v,l])=>(
              <div key={l} className="stat"><strong>{v}</strong><span>{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="section-link">View all →</Link>
          </div>
          <div className="cat-grid">
            {CATS.map((c) => (
              <Link key={c.name} to={`/products?category=${c.name}`} className="cat-card">
                <span className="cat-icon">{c.icon}</span>
                <span className="cat-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section" style={{ background:'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked selections just for you</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline">View All</Link>
          </div>
          {loading ? <ProductGridSkeleton count={8} /> : (
            featured.length > 0 ? (
              <div className="grid-products">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p className="empty-title">No featured products yet</p>
                <Link to="/products" className="btn btn-primary" style={{marginTop:16}}>Browse All</Link>
              </div>
            )
          )}
        </div>
      </section>

      {/* Promo */}
      <section className="promo">
        <div className="container">
          <div className="promo-inner">
            <div>
              <h2>Get 20% Off Your First Order</h2>
              <p>Sign up today and unlock exclusive member deals</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">Create Account →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="feat-grid">
            {[['🚚','Free Delivery','On orders above ₹500'],['🔒','Secure Payment','100% safe'],['↩️','Easy Returns','30-day policy'],['💬','24/7 Support','Always here']].map(([icon,t,d])=>(
              <div key={t} className="feat-card">
                <span>{icon}</span>
                <div><strong>{t}</strong><p>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
