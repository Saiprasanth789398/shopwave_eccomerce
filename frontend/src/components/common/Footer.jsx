import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="foot-grid">
        <div>
          <div className="foot-logo">🌊 <span>ShopWave</span></div>
          <p>Your premium destination for curated products.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?featured=true">Featured</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>
        <div>
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="foot-bottom">
        <p>© {new Date().getFullYear()} ShopWave. All rights reserved.</p>
        <div className="pay-icons">
          <span>Visa</span><span>Mastercard</span><span>UPI</span><span>COD</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
