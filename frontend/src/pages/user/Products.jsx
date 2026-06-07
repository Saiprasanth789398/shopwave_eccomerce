import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeleton';
import './Products.css';

const CATS = ['All','Electronics','Clothing','Books','Home & Garden','Sports','Beauty','Toys','Automotive','Food','Other'];
const SORTS = [{ value:'newest', label:'Newest' },{ value:'price_asc', label:'Price ↑' },{ value:'price_desc', label:'Price ↓' },{ value:'rating', label:'Top Rated' }];

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword:  params.get('keyword')  || '',
    category: params.get('category') || 'All',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    sort:     params.get('sort')     || 'newest',
    page:     1,
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = { ...filters, category: filters.category === 'All' ? '' : filters.category };
        const { data } = await productAPI.getAll(q);
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filters]);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));

  return (
    <div className="products-page">
      <div className="container" style={{ padding:'32px 24px' }}>
        <div className="prod-layout">
          {/* Sidebar Filters */}
          <aside className="filter-sidebar">
            <h3 className="filter-title">Filters</h3>

            <div className="filter-section">
              <label className="filter-label">Search</label>
              <input className="form-input" placeholder="Search…" value={filters.keyword}
                onChange={(e) => setFilter('keyword', e.target.value)} />
            </div>

            <div className="filter-section">
              <label className="filter-label">Category</label>
              {CATS.map((c) => (
                <button key={c} className={`cat-filter-btn ${filters.category === c ? 'active' : ''}`}
                  onClick={() => setFilter('category', c)}>{c}</button>
              ))}
            </div>

            <div className="filter-section">
              <label className="filter-label">Price Range</label>
              <div style={{ display:'flex', gap:8 }}>
                <input className="form-input" placeholder="Min ₹" value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)} style={{ width:'50%' }} />
                <input className="form-input" placeholder="Max ₹" value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)} style={{ width:'50%' }} />
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Sort By</label>
              <select className="form-input" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <button className="btn btn-secondary btn-full" onClick={() => setFilters({ keyword:'', category:'All', minPrice:'', maxPrice:'', sort:'newest', page:1 })}>
              Clear Filters
            </button>
          </aside>

          {/* Grid */}
          <div className="prod-main">
            <div className="prod-header">
              <span className="prod-count">{pagination.total || 0} products</span>
            </div>

            {loading ? <ProductGridSkeleton count={8} /> : (
              products.length > 0 ? (
                <div className="grid-products">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-title">No products found</p>
                  <p className="empty-text">Try different keywords or filters</p>
                </div>
              )
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={filters.page === 1} onClick={() => setFilter('page', filters.page - 1)}>‹</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => setFilter('page', p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={filters.page === pagination.pages} onClick={() => setFilter('page', filters.page + 1)}>›</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
