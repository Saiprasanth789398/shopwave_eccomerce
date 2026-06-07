import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUSES = ['processing','confirmed','shipped','out_for_delivery','delivered','cancelled'];

const ManageOrders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updating,     setUpdating]     = useState(null); // orderId being updated
  const [updateForm,   setUpdateForm]   = useState({ status:'', description:'', location:'' });

  const load = () => {
    setLoading(true);
    adminAPI.getOrders({ search, status: filterStatus, limit: 50 })
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleUpdate = async (orderId) => {
    if (!updateForm.status) { toast.error('Select a status'); return; }
    try {
      await adminAPI.updateOrderStatus(orderId, updateForm);
      toast.success('Order status updated!');
      setUpdating(null);
      setUpdateForm({ status:'', description:'', location:'' });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Orders</h1>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input
          className="form-input"
          style={{ flex:1, maxWidth:280 }}
          placeholder="Search tracking number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ width:180 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      {/* Update Status Modal */}
      {updating && (
        <div className="modal-overlay" onClick={() => setUpdating(null)}>
          <div className="modal-box" style={{ maxWidth:420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="modal-close" onClick={() => setUpdating(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-input" value={updateForm.status}
                  onChange={(e) => setUpdateForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="">Select status…</option>
                  {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. Package dispatched from warehouse"
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="e.g. Mumbai Hub"
                  value={updateForm.location}
                  onChange={(e) => setUpdateForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-primary" onClick={() => handleUpdate(updating)}>
                  Update Status
                </button>
                <button className="btn btn-secondary" onClick={() => setUpdating(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:52, borderRadius:8 }} />)}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><span style={{ fontFamily:'monospace', fontSize:12 }}>{o.trackingNumber}</span></td>
                  <td>
                    <p style={{ fontWeight:600 }}>{o.user?.name}</p>
                    <p style={{ fontSize:12, color:'var(--text-secondary)' }}>{o.user?.email}</p>
                  </td>
                  <td style={{ fontWeight:700, color:'var(--sea-blue)' }}>{formatPrice(o.totalPrice)}</td>
                  <td>
                    <span style={{ fontSize:12 }}>{o.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}</span><br />
                    <span className={`badge badge-${o.paymentStatus === 'paid' ? 'success' : 'warning'}`}
                      style={{ fontSize:10 }}>{o.paymentStatus}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${getStatusColor(o.orderStatus)}`}>
                      {getStatusLabel(o.orderStatus)}
                    </span>
                  </td>
                  <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{formatDate(o.createdAt)}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <Link to={`/orders/${o._id}`} className="btn btn-secondary btn-sm">View</Link>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => {
                          setUpdating(o._id);
                          setUpdateForm({ status: o.orderStatus, description:'', location:'' });
                        }}>
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
