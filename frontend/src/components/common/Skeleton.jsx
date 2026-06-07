import './Skeleton.css';

export const ProductCardSkeleton = () => (
  <div className="sk-card">
    <div className="skeleton sk-img" />
    <div className="sk-body">
      <div className="skeleton sk-line short" />
      <div className="skeleton sk-line" />
      <div className="skeleton sk-line medium" />
      <div className="sk-foot">
        <div className="skeleton" style={{width:80,height:20}} />
        <div className="skeleton" style={{width:90,height:32,borderRadius:8}} />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid-products">
    {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

export const CartSkeleton = ({ count = 3 }) => (
  <div style={{display:'flex',flexDirection:'column',gap:16}}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="sk-cart-row">
        <div className="skeleton" style={{width:80,height:80,borderRadius:8,flexShrink:0}} />
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line short" />
          <div className="skeleton sk-line medium" />
        </div>
      </div>
    ))}
  </div>
);

export const OrdersSkeleton = ({ count = 3 }) => (
  <div style={{display:'flex',flexDirection:'column',gap:16}}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="sk-order">
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
          <div className="skeleton" style={{width:160,height:16}} />
          <div className="skeleton" style={{width:80,height:22,borderRadius:100}} />
        </div>
        <div className="skeleton sk-line short" />
        <div className="skeleton sk-line medium" style={{marginTop:8}} />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="sk-table-row">
        {Array.from({ length: 5 }).map((_, j) => (
          <div key={j} className="skeleton" style={{height:14,flex:1,borderRadius:4}} />
        ))}
      </div>
    ))}
  </div>
);
