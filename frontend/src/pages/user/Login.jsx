import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../utils/store';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');        // visible inline error
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  const handleChange = (e) => {
    setError('');  // clear error on every keystroke
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim())    { setError('Please enter your email');    return; }
    if (!form.password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    try {
      const { data } = await authAPI.login({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Save token + user in Zustand (persisted to localStorage)
      setAuth(data.data, data.data.token);
      toast.success(`Welcome back, ${data.data.name}! 👋`);

      // Redirect based on role
      if (data.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Check credentials.';
      setError(msg);   // show inline — always visible
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-scaleIn">

        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🌊 ShopWave</div>
          <h1>Welcome back</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Inline error box — always visible, not a disappearing toast */}
        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="admin@shopwave.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spin" />  Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials box */}
        <div className="demo-creds">
          <p className="demo-title">Demo Credentials</p>
          <div className="demo-row">
            <span>Admin</span>
            <code>admin@shopwave.com / admin123</code>
            <button className="demo-fill" onClick={() => { setError(''); setForm({ email: 'admin@shopwave.com', password: 'admin123' }); }}>Fill</button>
          </div>
          <div className="demo-row">
            <span>User</span>
            <code>user@shopwave.com / user123</code>
            <button className="demo-fill" onClick={() => { setError(''); setForm({ email: 'user@shopwave.com', password: 'user123' }); }}>Fill</button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;