import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import { OrdersSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    orderAPI.getMy({ page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="container" style={{ padding: '40px 24px' }}><OrdersSkeleton count={4} /></div>;

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-title">No orders yet</p>
          <p className="empty-text">Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Shop Now</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Order #{order.trackingNumber}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge badge-${getStatusColor(order.orderStatus)}`}>
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {item.name} × {item.quantity}{i < Math.min(order.orderItems.length, 3) - 1 ? ', ' : ''}
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>+{order.orderItems.length - 3} more</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 14 }}>
                      <strong style={{ color: 'var(--sea-blue)' }}>{formatPrice(order.totalPrice)}</strong>
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'} ·{' '}
                      <span style={{ color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </span>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details →</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
