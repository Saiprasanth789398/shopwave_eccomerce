// DetailSkeleton.jsx
export const ProductDetailSkeleton = () => (
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,paddingTop:40}}>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div className="skeleton" style={{aspectRatio:1,borderRadius:16}} />
      <div style={{display:'flex',gap:8}}>
        {[1,2,3].map(i=><div key={i} className="skeleton" style={{width:70,height:70,borderRadius:8}} />)}
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:14,paddingTop:10}}>
      {[40,200,20,60,120,120,48].map((w,i)=>(
        <div key={i} className="skeleton" style={{height: i===1?28:i===4||i===5?14:i===6?48:20,width:i===0?'30%':i===2?'40%':i===3?'50%':'100%',borderRadius:8}} />
      ))}
    </div>
  </div>
);
