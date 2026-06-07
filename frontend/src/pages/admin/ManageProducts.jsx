import { useState, useEffect } from 'react';
import { productAPI } from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Admin.css';

const BLANK = { name: '', description: '', price: '', originalPrice: '', category: 'Electronics', stock: '', brand: '', isFeatured: false, images: [{ url: '', alt: '' }] };
const CATS  = ['Electronics','Clothing','Books','Home & Garden','Sports','Beauty','Toys','Automotive','Food','Other'];

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    productAPI.getAll({ keyword: search, limit: 50 })
      .then(({ data }) => setProducts(data.data.products))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || '', category: p.category, stock: p.stock, brand: p.brand || '', isFeatured: p.isFeatured, images: p.images?.length ? p.images : [{ url: '', alt: '' }] });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) { toast.error('Name, price, stock required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || 0, stock: Number(form.stock), images: form.images.filter(i => i.url) };
      if (editId) { await productAPI.update(editId, payload); toast.success('Updated!'); }
      else        { await productAPI.create(payload);         toast.success('Created!'); }
      setShowForm(false); setForm(BLANK); setEditId(null); load();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={() => { setForm(BLANK); setEditId(null); setShowForm(true); }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input className="form-input" style={{ maxWidth: 340, marginBottom: 20 }} placeholder="Search products…"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {[['name','Name'],['brand','Brand'],['price','Price (₹)'],['originalPrice','Original Price (₹)'],['stock','Stock']].map(([k,l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={form[k]} onChange={(e) => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" placeholder="https://…" value={form.images[0]?.url}
                  onChange={(e) => setForm(p => ({ ...p, images: [{ url: e.target.value, alt: p.name }] }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <input type="checkbox" id="feat" checked={form.isFeatured} onChange={(e) => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                <label htmlFor="feat" style={{ fontSize: 14, fontWeight: 600 }}>Mark as Featured</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><img src={p.images?.[0]?.url || 'https://placehold.co/48'} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /></td>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.name}</td>
                  <td><span className="badge badge-primary">{p.category}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--sea-blue)' }}>{formatPrice(p.price)}</td>
                  <td><span style={{ color: p.stock < 5 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{p.stock}</span></td>
                  <td>{p.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
