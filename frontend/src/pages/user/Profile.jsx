import { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../utils/store';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm]       = useState({ name: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    authAPI.getMe().then(({ data }) => {
      const u = data.data;
      setForm({ name: u.name || '', phone: u.phone || '', address: { street: u.address?.street || '', city: u.address?.city || '', state: u.address?.state || '', zipCode: u.address?.zipCode || '', country: u.address?.country || '' } });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill both fields'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSavingPw(true);
    try {
      await authAPI.updateProfile({ password: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 16, borderRadius: 8 }} />)}
    </div>
  );

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font-body)' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 32 }}>My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Profile form */}
        <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Personal Info</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input style={{ ...inputStyle, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }} value={user?.email} disabled />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} placeholder="9876543210" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Address</h4>

          {['street', 'city', 'state', 'zipCode', 'country'].map((f) => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{f === 'zipCode' ? 'PIN Code' : f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input style={inputStyle} value={form.address[f]}
                onChange={(e) => setForm(p => ({ ...p, address: { ...p.address, [f]: e.target.value } }))} />
            </div>
          ))}

          <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: 8 }} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Change password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form onSubmit={handlePwChange} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Current Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={pwForm.currentPassword}
                onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>New Password</label>
              <input style={inputStyle} type="password" placeholder="Min 6 characters" value={pwForm.newPassword}
                onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </form>

          {/* Account info */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--sea-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</p>
                <span className={`badge badge-${user?.role === 'admin' ? 'primary' : 'success'}`} style={{ marginTop: 6 }}>
                  {user?.role === 'admin' ? '⚙️ Admin' : '👤 Customer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
