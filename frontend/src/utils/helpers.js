export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

export const truncate = (t = '', len = 100) => t.length > len ? t.slice(0, len) + '...' : t;

export const getImageUrl = (images, i = 0) =>
  images?.[i]?.url || images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image';

export const calcDiscount = (orig, curr) =>
  orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0;

export const getStatusColor = (s) =>
  ({ processing:'warning', confirmed:'primary', shipped:'primary', out_for_delivery:'info', delivered:'success', cancelled:'danger', returned:'gray' }[s] || 'gray');

export const getStatusLabel = (s) =>
  ({ processing:'Processing', confirmed:'Confirmed', shipped:'Shipped', out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled', returned:'Returned' }[s] || s);

export const getErrMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
