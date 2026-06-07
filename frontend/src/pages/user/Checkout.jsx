// pages/user/Checkout.jsx
// ─────────────────────────────────────────────────────────────
//  RAZORPAY FLOW (3 steps):
//
//  1. User fills address, picks "Pay Online" → clicks Place Order
//  2. We call POST /api/payment/create-order  → get razorpayOrderId
//  3. We open Razorpay popup with that order
//  4. User pays → Razorpay returns { paymentId, orderId, signature }
//  5. We call POST /api/payment/verify  → backend verifies + saves order
//  6. Navigate to /orders  ✅
//
//  COD FLOW:
//  1. User picks "Cash on Delivery" → clicks Place Order
//  2. We call POST /api/payment/cod  → order saved directly
//  3. Navigate to /orders  ✅
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI, cartAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

// Load Razorpay script from their CDN dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    // Don't load twice
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [method,  setMethod]  = useState('razorpay'); // 'razorpay' | 'cod'

  const [address, setAddress] = useState({
    name:    '',
    phone:   '',
    street:  '',
    city:    '',
    state:   '',
    zipCode: '',
    country: 'India',
  });

  // Load cart on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await cartAPI.get();
        if (!data.data?.items?.length) {
          toast.error('Your cart is empty');
          navigate('/cart');
          return;
        }
        setCart(data.data);
      } catch {
        toast.error('Failed to load cart');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleAddressChange = (e) =>
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Basic validation
  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    for (const field of required) {
      if (!address[field].trim()) {
        toast.error(`Please fill in: ${field}`);
        return false;
      }
    }
    if (address.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  // ─── Main handler ────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    setPaying(true);

    try {
      if (method === 'cod') {
        await handleCOD();
      } else {
        await handleRazorpay();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Order failed');
    } finally {
      setPaying(false);
    }
  };

  // ─── COD flow ────────────────────────────────────────────────
  const handleCOD = async () => {
    const { data } = await paymentAPI.cod({ shippingAddress: address });
    toast.success('Order placed! Pay cash on delivery 🎉');
    navigate(`/orders/${data.data.orderId}`);
  };

  // ─── Razorpay flow ───────────────────────────────────────────
  const handleRazorpay = async () => {
    // 1. Load Razorpay JS SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Razorpay SDK failed to load. Check your internet.');
      return;
    }

    // 2. STEP 1 — Create order on backend
    const { data: orderData } = await paymentAPI.createOrder();
    const { razorpayOrderId, amount, currency, keyId, breakdown } = orderData.data;

    // 3. STEP 2 — Open Razorpay popup
    const options = {
      key:       keyId,              // rzp_test_XXXX  (from .env via backend)
      amount,                         // in paise
      currency,
      name:      'ShopWave',
      description: 'Order Payment',
      order_id:  razorpayOrderId,    // IMPORTANT: must match what backend created

      // ── Called when payment succeeds ─────────────────────────
      handler: async (response) => {
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        setPaying(true);
        try {
          // STEP 3 — Verify on backend
          const { data: verifyData } = await paymentAPI.verify({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            shippingAddress:   address,
          });
          toast.success('Payment successful! Order placed 🎉');
          navigate(`/orders/${verifyData.data.orderId}`);
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Payment verification failed');
        } finally {
          setPaying(false);
        }
      },

      // Pre-fill user details in popup
      prefill: {
        name:    address.name,
        contact: address.phone,
      },

      // Razorpay test mode theme
      theme: { color: '#0e76bc' },

      // ── Called when user closes popup without paying ──────────
      modal: {
        ondismiss: () => {
          setPaying(false);
          toast('Payment cancelled', { icon: '⚠️' });
        },
      },
    };

    // Open the popup
    const rzp = new window.Razorpay(options);
    rzp.open();

    // Handle payment failure inside popup
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
      setPaying(false);
    });
  };

  // ─── Price summary ───────────────────────────────────────────
  const itemsPrice    = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const taxPrice      = Math.round(itemsPrice * 0.18 * 100) / 100;
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice    = itemsPrice + taxPrice + shippingPrice;
  const fmt           = (n) => `₹${n.toFixed(2)}`;

  if (loading) return <div className="checkout-loading">Loading checkout…</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* ── Left: Address + Payment method ─────────────── */}
        <div className="checkout-left">
          <h2 className="checkout-title">Delivery Address</h2>

          <div className="address-grid">
            {[
              { label: 'Full Name',   name: 'name',    placeholder: 'Ravi Kumar' },
              { label: 'Phone',       name: 'phone',   placeholder: '9876543210' },
              { label: 'Street',      name: 'street',  placeholder: '12, MG Road' },
              { label: 'City',        name: 'city',    placeholder: 'Hyderabad' },
              { label: 'State',       name: 'state',   placeholder: 'Telangana' },
              { label: 'PIN Code',    name: 'zipCode', placeholder: '500001' },
              { label: 'Country',     name: 'country', placeholder: 'India' },
            ].map(({ label, name, placeholder }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type="text"
                  name={name}
                  placeholder={placeholder}
                  value={address[name]}
                  onChange={handleAddressChange}
                />
              </div>
            ))}
          </div>

          {/* ── Payment method ──────────────────────────── */}
          <h2 className="checkout-title" style={{ marginTop: 28 }}>Payment Method</h2>

          <div className="payment-methods">
            {/* Razorpay option */}
            <label className={`method-card ${method === 'razorpay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={method === 'razorpay'}
                onChange={() => setMethod('razorpay')}
              />
              <div className="method-content">
                <span className="method-icon">💳</span>
                <div>
                  <strong>Pay Online</strong>
                  <p>Credit / Debit Card, UPI, Net Banking, Wallet</p>
                  {/* Test mode notice */}
                  <span className="test-badge">🧪 Test Mode — use card 4111 1111 1111 1111</span>
                </div>
              </div>
            </label>

            {/* COD option */}
            <label className={`method-card ${method === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={method === 'cod'}
                onChange={() => setMethod('cod')}
              />
              <div className="method-content">
                <span className="method-icon">💵</span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when your order arrives</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ── Right: Order summary ────────────────────────── */}
        <div className="checkout-right">
          <h2 className="checkout-title">Order Summary</h2>

          <div className="order-items">
            {cart?.items?.map((item) => (
              <div className="order-item" key={item.product._id || item.product}>
                <img
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                  alt={item.product?.name || item.name}
                />
                <div className="item-info">
                  <span className="item-name">{item.product?.name || item.name}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-row"><span>Items</span><span>{fmt(itemsPrice)}</span></div>
            <div className="price-row"><span>GST (18%)</span><span>{fmt(taxPrice)}</span></div>
            <div className="price-row">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? <span className="free-tag">FREE</span> : fmt(shippingPrice)}</span>
            </div>
            <div className="price-row total-row">
              <span>Total</span>
              <span>{fmt(totalPrice)}</span>
            </div>
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={paying}
          >
            {paying ? (
              <span className="btn-spinner">Processing…</span>
            ) : method === 'razorpay' ? (
              `Pay ${fmt(totalPrice)} Online`
            ) : (
              `Place COD Order — ${fmt(totalPrice)}`
            )}
          </button>

          <p className="secure-note">🔒 Payments are 100% secure via Razorpay</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
