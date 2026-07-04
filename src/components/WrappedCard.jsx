// ─── WRAPPED CARD ─────────────────────────────────────────────────────────────

export function WrappedCard({ archetype, liked, innerRef }) {
  const top5 = liked.slice(0, 5)
  return (
    <div ref={innerRef} style={{
      width: 300, height: 520, background: 'linear-gradient(145deg,#0a0a0f 0%,#1a1428 45%,#0a0a18 100%)',
      borderRadius: 28, padding: 28, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      fontFamily: 'system-ui,sans-serif',
    }}>
      <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(253,41,123,0.07)' }} />
      <div style={{ position:'absolute', bottom:-30, left:-40, width:150, height:150, borderRadius:'50%', background:'rgba(139,92,246,0.07)' }} />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(253,41,123,0.06) 0%, transparent 60%)' }} />
      <div style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%' }}>
        <div style={{ fontSize:52, marginBottom:6 }}>{archetype.emoji}</div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:4, color:'#fd297b', textTransform:'uppercase', marginBottom:14 }}>
          Polymath · {archetype.rarityLabel}
        </div>
        <div style={{ fontSize:26, fontWeight:900, color:'white', marginBottom:8, lineHeight:1.2, letterSpacing:'-0.03em' }}>
          {archetype.name}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:28, lineHeight:1.6, padding:'0 8px' }}>
          {archetype.description}
        </div>
        {top5.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:28 }}>
            {top5.map((c, i) => <span key={i} style={{ fontSize:30 }}>{c.emoji}</span>)}
          </div>
        )}
        <div style={{ display:'inline-block', padding:'7px 18px', borderRadius:100, background:'rgba(253,41,123,0.12)', border:'1px solid rgba(253,41,123,0.35)', color:'#fd297b', fontSize:11, fontWeight:700, letterSpacing:1 }}>
          Top {archetype.rarity}% of curious minds
        </div>
        <div style={{ marginTop:24, fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:2 }}>POLYMATH.APP</div>
      </div>
    </div>
  )
}
