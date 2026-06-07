import { Link } from 'react-router-dom';
import { useAuthStore, useWishlistStore, useCartStore } from '../../utils/store';
import { wishlistAPI, cartAPI } from '../../utils/api';
import { formatPrice, getImageUrl, calcDiscount } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const { wishlistIds, toggleItem } = useWishlistStore();
  const { setCart } = useCartStore();
  const isWishlisted = wishlistIds.has(product._id);
  const discount = calcDiscount(product.originalPrice, product.price);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      await wishlistAPI.toggle(product._id);
      toggleItem(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch { toast.error('Failed'); }
  };

  const handleCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (product.stock === 0) return;
    try {
      const { data } = await cartAPI.add(product._id, 1);
      setCart(data.data);
      toast.success('Added to cart 🛒');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="pcard">
      <Link to={`/products/${product._id}`} className="pcard-img-wrap">
        <img src={getImageUrl(product.images)} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="pcard-discount">-{discount}%</span>}
        {product.stock === 0 && <div className="pcard-oos">Out of Stock</div>}
      </Link>
      <div className="pcard-body">
        <span className="pcard-cat">{product.category}</span>
        <Link to={`/products/${product._id}`} className="pcard-name">{product.name}</Link>
        {product.ratings?.count > 0 && (
          <div className="pcard-stars">
            {'★'.repeat(Math.round(product.ratings.average))}{'☆'.repeat(5 - Math.round(product.ratings.average))}
            <span>({product.ratings.count})</span>
          </div>
        )}
        <div className="pcard-footer">
          <div>
            <span className="price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div className="pcard-actions">
            <button className={`wish-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist}>
              {isWishlisted ? '❤️' : '♡'}
            </button>
            <button className="btn btn-primary btn-sm add-btn" onClick={handleCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
