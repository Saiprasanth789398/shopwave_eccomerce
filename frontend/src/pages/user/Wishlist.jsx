import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../../utils/api';
import { useWishlistStore } from '../../utils/store';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { ProductGridSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, setWishlist, toggleItem } = useWishlistStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistAPI.get()
      .then(({ data }) => { setWishlist(data.data); })
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.toggle(productId);
      toggleItem(productId);
      setWishlist(wishlist.filter((p) => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="container" style={{ padding: '40px 24px' }}><ProductGridSkeleton count={4} /></div>;

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
        My Wishlist ({wishlist.length})
      </h1>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <p className="empty-title">Your wishlist is empty</p>
          <p className="empty-text">Save items you love for later</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      ) : (
        <div className="grid-products">
          {wishlist.map((product) => (
            <div key={product._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Link to={`/products/${product._id}`}>
                <img src={getImageUrl(product.images)} alt={product.name}
                  style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
              </Link>
              <div style={{ padding: '14px 16px' }}>
                <Link to={`/products/${product._id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                  {product.name}
                </Link>
                <p className="price" style={{ fontSize: 16, marginBottom: 12 }}>{formatPrice(product.price)}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/products/${product._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>View</Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRemove(product._id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
