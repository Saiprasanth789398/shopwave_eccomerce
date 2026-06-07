// ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI, wishlistAPI, reviewAPI } from '../../utils/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../../utils/store';
import { formatPrice, getImageUrl, formatDate } from '../../utils/helpers';
import { ProductDetailSkeleton } from './DetailSkeleton';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const { wishlistIds, toggleItem } = useWishlistStore();

  const [product, setProduct]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [qty, setQty]           = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:'' });
  const [submitting, setSubmitting] = useState(false);

  const isWishlisted = wishlistIds.has(id);

  useEffect(() => {
    Promise.all([
      productAPI.getOne(id),
      reviewAPI.getForProduct(id),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.data);
      setReviews(rRes.data.data.reviews || []);
    }).catch(() => { toast.error('Product not found'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCart = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      const { data } = await cartAPI.add(product._id, qty);
      setCart(data.data);
      toast.success('Added to cart 🛒');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await wishlistAPI.toggle(product._id);
      toggleItem(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch { toast.error('Failed'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewAPI.add(id, reviewForm);
      setReviews(p => [data.data, ...p]);
      setReviewForm({ rating:5, comment:'' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="container" style={{paddingTop:40}}><ProductDetailSkeleton /></div>;
  if (!product) return null;

  const share = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${product.name} — ${formatPrice(product.price)}\n${window.location.href}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pd-page">
      <div className="container">
        <div className="pd-grid">
          {/* Images */}
          <div className="pd-images">
            <img src={getImageUrl(product.images, activeImg)} alt={product.name} className="pd-main-img" />
            {product.images?.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="pd-cat">{product.category}</span>
            <h1 className="pd-name">{product.name}</h1>
            {product.brand && <p className="pd-brand">by <strong>{product.brand}</strong></p>}

            {product.ratings?.count > 0 && (
              <div className="pd-stars">
                {'★'.repeat(Math.round(product.ratings.average))}{'☆'.repeat(5 - Math.round(product.ratings.average))}
                <span>{product.ratings.average} ({product.ratings.count} reviews)</span>
              </div>
            )}

            <div className="pd-price-row">
              <span className="pd-price price">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="price-original">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="pd-desc">{product.description}</p>

            <div className="pd-stock">
              {product.stock > 0 ? <span className="in-stock">✅ In Stock ({product.stock} left)</span>
                : <span className="out-stock">❌ Out of Stock</span>}
            </div>

            {product.stock > 0 && (
              <div className="pd-qty">
                <label>Quantity:</label>
                <div className="qty-ctrl">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="pd-actions">
              <button className="btn btn-primary btn-lg" onClick={handleCart} disabled={product.stock === 0}>
                {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
              <button className={`wish-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist}>
                {isWishlisted ? '❤️' : '♡'}
              </button>
              <button className="btn btn-secondary" onClick={share}>📲 Share</button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="pd-reviews">
          <h2 className="section-title" style={{marginBottom:24}}>Reviews</h2>

          {isAuthenticated && (
            <form className="review-form" onSubmit={handleReview}>
              <h4>Write a Review</h4>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select className="form-input" value={reviewForm.rating}
                  onChange={(e) => setReviewForm(p => ({ ...p, rating: Number(e.target.value) }))}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows={3} placeholder="Share your thoughts…"
                  value={reviewForm.comment} onChange={(e) => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p style={{color:'var(--text-secondary)',marginTop:16}}>No reviews yet. Be the first!</p>
          ) : (
            <div className="review-list">
              {reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <div className="review-top">
                    <div className="reviewer-avatar">{r.user?.name?.charAt(0)}</div>
                    <div>
                      <strong>{r.user?.name}</strong>
                      <div style={{color:'#f59e0b',fontSize:14}}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <span className="review-date">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  {r.isVerifiedPurchase && <span className="badge badge-success" style={{fontSize:10}}>✓ Verified Purchase</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
