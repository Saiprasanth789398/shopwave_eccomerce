import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore, useAuthStore } from './utils/store';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// User Pages
import Landing      from './pages/user/Landing';
import Products     from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Cart         from './pages/user/Cart';
import Checkout     from './pages/user/Checkout';
import Wishlist     from './pages/user/Wishlist';
import Orders       from './pages/user/Orders';
import OrderDetail  from './pages/user/OrderDetail';
import Profile      from './pages/user/Profile';
import Login        from './pages/user/Login';
import Register     from './pages/user/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts  from './pages/admin/ManageProducts';
import AdminOrders    from './pages/admin/ManageOrders';

// Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const { initTheme } = useThemeStore();
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14 } }} />
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Landing />} />
          <Route path="/products"   element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />

          {/* Protected */}
          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/orders"   element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
          <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
