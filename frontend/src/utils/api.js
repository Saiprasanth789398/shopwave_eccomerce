import axios from 'axios';

// Use Vite proxy — all /api requests go through vite.config.js → localhost:5000
// This avoids CORS issues completely
const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — token expired or invalid
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  getMe:          ()     => API.get('/auth/me'),
  updateProfile:  (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

export const productAPI = {
  getAll:        (params) => API.get('/products', { params }),
  getOne:        (id)     => API.get(`/products/${id}`),
  getFeatured:   ()       => API.get('/products/featured'),
  getCategories: ()       => API.get('/products/categories'),
  create:        (data)   => API.post('/products', data),
  update:        (id, d)  => API.put(`/products/${id}`, d),
  delete:        (id)     => API.delete(`/products/${id}`),
};

export const cartAPI = {
  get:    ()                     => API.get('/cart'),
  add:    (productId, quantity)  => API.post('/cart', { productId, quantity }),
  update: (productId, quantity)  => API.put(`/cart/${productId}`, { quantity }),
  remove: (productId)            => API.delete(`/cart/${productId}`),
  clear:  ()                     => API.delete('/cart/clear'),
};

export const wishlistAPI = {
  get:    ()          => API.get('/wishlist'),
  toggle: (productId) => API.put(`/wishlist/${productId}/toggle`),
};

export const orderAPI = {
  getMy:  (params)      => API.get('/orders/my', { params }),
  getOne: (id)          => API.get(`/orders/${id}`),
  cancel: (id, reason)  => API.put(`/orders/${id}/cancel`, { reason }),
};

export const paymentAPI = {
  createOrder: ()     => API.post('/payment/create-order'),
  verify:      (data) => API.post('/payment/verify', data),
  cod:         (data) => API.post('/payment/cod', data),
};

export const reviewAPI = {
  getForProduct: (productId, params) => API.get(`/reviews/${productId}`, { params }),
  add:           (productId, data)   => API.post(`/reviews/${productId}`, data),
  update:        (id, data)          => API.put(`/reviews/${id}`, data),
  delete:        (id)                => API.delete(`/reviews/${id}`),
};

export const adminAPI = {
  getDashboard:      ()         => API.get('/admin/dashboard'),
  getOrders:         (params)   => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),
  getUsers:          (params)   => API.get('/admin/users', { params }),
};

export default API;