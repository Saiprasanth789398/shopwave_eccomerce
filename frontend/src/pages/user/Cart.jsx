// Cart.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../utils/api';
import { useCartStore } from '../../utils/store';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import { CartSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, setCart, clearCartStore } = useCartStore();
  const [loading, setLoading] = useState(!cart);
  const navigate = useNavigate();

  useEffect(() => {
    cartAPI.get().then(({ data }) => { setCart(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateQty = async (productId, qty) => {
    try {
      if (qty < 1) { await cartAPI.remove(productId); }
      else { await cartAPI.update(productId, qty); }
      const { data } = await cartAPI.get();
      setCart(data.data);
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const remove = async (productId) => {
    await cartAPI.remove(productId);
    const { data } = await cartAPI.get();
    setCart(data.data);
    toast.success('Removed');
  };

  const total = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  if (loading) return <div className="container" style={{padding:'40px 24px'}}><CartSkeleton /></div>;

  return (
    <div className="container" style={{padding:'40px 24px',minHeight:'80vh'}}>
      <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:32}}>Shopping Cart</h1>
      {!cart?.items?.length ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p className="empty-title">Your cart is empty</p>
          <Link to="/products" className="btn btn-primary" style={{marginTop:16}}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:28,alignItems:'start'}}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {cart.items.map((item) => (
              <div key={item.product._id || item.product} style={{display:'flex',gap:16,padding:16,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)'}}>
                <img src={getImageUrl(item.product?.images)} alt={item.product?.name || item.name} style={{width:88,height:88,objectFit:'cover',borderRadius:8,border:'1px solid var(--border)',flexShrink:0}} />
                <div style={{flex:1}}>
                  <p style={{fontWeight:600,fontSize:15,marginBottom:6}}>{item.product?.name || item.name}</p>
                  <p style={{color:'var(--sea-blue)',fontWeight:700,fontSize:16}}>{formatPrice(item.price)}</p>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:0,border:'1.5px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
                      <button onClick={() => updateQty(item.product._id || item.product, item.quantity - 1)} style={{width:32,height:32,background:'var(--bg-secondary)',border:'none',fontSize:16,cursor:'pointer'}}>−</button>
                      <span style={{width:36,textAlign:'center',fontWeight:600}}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product._id || item.product, item.quantity + 1)} style={{width:32,height:32,background:'var(--bg-secondary)',border:'none',fontSize:16,cursor:'pointer'}}>+</button>
                    </div>
                    <button onClick={() => remove(item.product._id || item.product)} style={{color:'var(--danger)',fontSize:13,fontWeight:600,cursor:'pointer',background:'none',border:'none'}}>Remove</button>
                  </div>
                </div>
                <p style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:17,color:'var(--sea-blue)',flexShrink:0}}>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:24,position:'sticky',top:88}}>
            <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,marginBottom:20}}>Order Summary</h3>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:15}}><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:15}}><span>Shipping</span><span style={{color:'var(--success)',fontWeight:600}}>{total > 500 ? 'FREE' : formatPrice(50)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,fontSize:15}}><span>GST (18%)</span><span>{formatPrice(total * 0.18)}</span></div>
            <hr style={{border:'none',borderTop:'1px solid var(--border)',margin:'16px 0'}} />
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'var(--font-display)',fontWeight:700,fontSize:20,marginBottom:20}}>
              <span>Total</span><span style={{color:'var(--sea-blue)'}}>{formatPrice(total + total * 0.18 + (total > 500 ? 0 : 50))}</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
            <Link to="/products" className="btn btn-secondary btn-full" style={{marginTop:10,textAlign:'center',display:'block'}}>Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
