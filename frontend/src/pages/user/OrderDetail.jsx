import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../utils/api';
import { useAuthStore } from '../../utils/store';
import { formatPrice, formatDate, getStatusColor, getStatusLabel, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './OrderDetail.css';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(({ data }) => setOrder(data.data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id, 'Cancelled by customer');
      setOrder(data.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cannot cancel');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
      </div>
    </div>
  );
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <Link to="/orders" style={{ fontSize: 14, color: 'var(--sea-blue)', marginBottom: 8, display: 'block' }}>← Back to Orders</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
            Order #{order.trackingNumber}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge badge-${getStatusColor(order.orderStatus)}`} style={{ fontSize: 13, padding: '6px 14px' }}>
            {getStatusLabel(order.orderStatus)}
          </span>
          {!['delivered', 'cancelled', 'returned'].includes(order.orderStatus) && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="od-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tracking Timeline */}
          {!isCancelled && (
            <div className="od-card">
              <h3 className="od-card-title">Order Tracking</h3>
              <div className="tracking-steps">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className={`track-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'current' : ''}`}>
                    <div className="track-dot" />
                    {i < STATUS_STEPS.length - 1 && <div className="track-line" />}
                    <span className="track-label">{getStatusLabel(step)}</span>
                  </div>
                ))}
              </div>
              {order.estimatedDelivery && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
                  📅 Estimated delivery: {formatDate(order.estimatedDelivery)}
                </p>
              )}
            </div>
          )}

          {/* Tracking History */}
          {order.trackingHistory?.length > 0 && (
            <div className="od-card">
              <h3 className="od-card-title">Tracking History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...order.trackingHistory].reverse().map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sea-blue)', marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{getStatusLabel(h.status)}</p>
                      {h.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{h.description}</p>}
                      {h.location && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {h.location}</p>}
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(h.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="od-card">
            <h3 className="od-card-title">Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <img src={item.image || 'https://placehold.co/60x60?text=?'} alt={item.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--sea-blue)' }}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Price Summary */}
          <div className="od-card">
            <h3 className="od-card-title">Price Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Items', formatPrice(order.itemsPrice)],
                ['Tax (GST 18%)', formatPrice(order.taxPrice)],
                ['Shipping', order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span>{label}</span>
                  <span style={{ color: val === 'FREE' ? 'var(--success)' : 'inherit', fontWeight: val === 'FREE' ? 700 : 400 }}>{val}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span style={{ color: 'var(--sea-blue)' }}>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="od-card">
            <h3 className="od-card-title">Payment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Razorpay'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment ID</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="od-card">
            <h3 className="od-card-title">Delivery Address</h3>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
