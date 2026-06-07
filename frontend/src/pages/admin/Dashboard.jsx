import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import './Admin.css';

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Orders',   value: stats.totalOrders,               icon: '📦', color: '#0e76bc' },
    { label: 'Total Products', value: stats.totalProducts,             icon: '🛍️', color: '#8b5cf6' },
    { label: 'Total Users',    value: stats.totalUsers,                icon: '👥', color: '#10b981' },
    { label: 'Revenue',        value: formatPrice(stats.totalRevenue), icon: '💰', color: '#f59e0b' },
  ] : [];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav-links">
          <Link to="/admin/products" className="btn btn-primary btn-sm">Manage Products</Link>
          <Link to="/admin/orders"   className="btn btn-secondary btn-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders table */}
      <div className="admin-section">
        <h2 className="admin-section-title">Recent Orders</h2>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:52, borderRadius:8 }} />)}
          </div>
        ) : !stats?.recentOrders?.length ? (
          <p style={{ color:'var(--text-secondary)', padding:'20px 0' }}>No orders yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><span style={{ fontFamily:'monospace', fontSize:12 }}>{o.trackingNumber}</span></td>
                    <td>{o.user?.name || 'N/A'}</td>
                    <td style={{ fontWeight:700, color:'var(--sea-blue)' }}>{formatPrice(o.totalPrice)}</td>
                    <td><span className={`badge badge-${getStatusColor(o.orderStatus)}`}>{getStatusLabel(o.orderStatus)}</span></td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{formatDate(o.createdAt)}</td>
                    <td><Link to={`/orders/${o._id}`} className="btn btn-secondary btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
