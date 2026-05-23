/* global React, ReactDOM */
const { useState, useEffect } = React;

// ============================================================
// Defaults — editable via Tweaks panel
// ============================================================
// 跟 src/lib/data/streamTags.js 對齊，這裡是 standalone HTML 不能 import
const STREAM_TAGS = [
  { id: 'game',    label: '遊戲', enLabel: 'GAME',    color: '#EF4444' },
  { id: 'code',    label: '程式', enLabel: 'CODE',    color: '#F97316' },
  { id: 'karaoke', label: '歌回', enLabel: 'KARAOKE', color: '#3B82F6' },
  { id: 'chat',    label: '雜談', enLabel: 'TALK',    color: '#22C55E' },
  { id: 'art',     label: '繪圖', enLabel: 'ART',     color: '#F472B6' },
  { id: '3d',      label: '3D',   enLabel: '3D',      color: '#2DD4BF' },
  { id: 'music',   label: '音樂', enLabel: 'MUSIC',   color: '#818CF8' }
];
const findStreamTag = (id) => STREAM_TAGS.find((t) => t.id === id);
const parseCategoryList = (s) =>
  (s || '').split(',').map((x) => x.trim()).filter(Boolean).map(findStreamTag).filter(Boolean);

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "vol": 0,
  "titleMain": "初配信",
  "titleSub": "來做點自我介紹吧！",
  "episode": null,
  "categories": "karaoke, chat",
  "artist": "",
  "streamTime": "2021.07.31 · 20:00",
  "logoSrc": "",
  "theme": "azure",
  "mode": "light",
  "heroSrc": "assets/vtuber1.0-0.png",
  "bgSrc": "assets/0.webp",
  "bgEffect": "",
  "bgTint": null,
  "vtuberLogoSrc": "assets/vtuber-logo.png"
}/*EDITMODE-END*/;

// ============================================================
// Inline atoms (matching site's atoms.jsx vocabulary)
// ============================================================
const Corners = ({ color = "var(--blue-bright)", size = 14 }) => (
  <>
    <span style={{ position:"absolute", top:-1, left:-1, width:size, height:size, borderTop:`1px solid ${color}`, borderLeft:`1px solid ${color}` }}/>
    <span style={{ position:"absolute", top:-1, right:-1, width:size, height:size, borderTop:`1px solid ${color}`, borderRight:`1px solid ${color}` }}/>
    <span style={{ position:"absolute", bottom:-1, left:-1, width:size, height:size, borderBottom:`1px solid ${color}`, borderLeft:`1px solid ${color}` }}/>
    <span style={{ position:"absolute", bottom:-1, right:-1, width:size, height:size, borderBottom:`1px solid ${color}`, borderRight:`1px solid ${color}` }}/>
  </>
);
const Dot = ({ color = "var(--blue-bright)", size = 8 }) => (
  <span style={{
    display:"inline-block", width:size, height:size, borderRadius:"50%",
    background:color, boxShadow:`0 0 8px ${color}`,
    animation:"pulse 1.4s ease-in-out infinite"
  }}/>
);
const Tele = ({ label, value, accent="var(--silver-1)" }) => (
  <div style={{ display:"flex", alignItems:"baseline", gap:10, fontFamily:"var(--font-mono)", fontSize:11, lineHeight:1.4 }}>
    <span style={{ color:"var(--silver-3)", letterSpacing:".1em" }}>{label}</span>
    <span style={{ flex:1, borderTop:"1px dashed var(--line)", marginBottom:3 }}/>
    <span style={{ color:accent, fontWeight:500 }}>{value}</span>
  </div>
);
const ScanBar = ({ progress = 75, label = "SCANNING", color = "var(--blue-electric)" }) => (
  <div style={{ width:"100%" }}>
    <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--silver-3)", marginBottom:6, letterSpacing:".1em" }}>
      <span>{label}</span><span style={{ color:"var(--blue-bright)" }}>{progress}%</span>
    </div>
    <div style={{ height:4, background:"var(--c-track)", position:"relative", overflow:"hidden" }}>
      <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg, ${color}, var(--accent-cyan))`, boxShadow:`0 0 12px ${color}` }}/>
    </div>
  </div>
);
const Tag = ({ children, color = "var(--blue-bright)", solid = false, size = "sm" }) => {
  const sizes = {
    sm: { padding:"5px 11px", fontSize:11 },
    md: { padding:"6px 13px", fontSize:13 },
    lg: { padding:"8px 16px", fontSize:15 }
  };
  const s = sizes[size] || sizes.sm;
  return (
    <span className="tech" style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:s.padding, fontSize:s.fontSize, letterSpacing:".16em", textTransform:"uppercase",
      background: color,
      color:"#FFFFFF",
      border:`1px solid ${color}`,
      fontWeight:700,
      textShadow:"0 1px 2px rgba(0,0,0,.35)"
    }}>{children}</span>
  );
};
const Panel = ({ children, style, glow = false }) => (
  <div style={{
    position:"relative", padding:18,
    background:"var(--c-panel)",
    border:"1px solid var(--line)",
    backdropFilter:"blur(6px)",
    WebkitBackdropFilter:"blur(6px)",
    boxShadow: glow ? "0 0 0 1px rgba(96,165,250,.18), 0 12px 60px rgba(0,0,0,.35)" : "none",
    ...style
  }}>
    <Corners/>
    {children}
  </div>
);

// Hexagon clip + frame for game logo
const HexFrame = ({ size = 220, children }) => (
  <div style={{ position:"relative", width:size, height:size*0.866 }}>
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }} viewBox="0 0 100 87" preserveAspectRatio="none">
      <polygon points="25,0 75,0 100,43.5 75,87 25,87 0,43.5"
        fill="var(--c-surface)" stroke="var(--blue-bright)" strokeWidth=".4"/>
      <polygon points="25,0 75,0 100,43.5 75,87 25,87 0,43.5"
        fill="none" stroke="var(--blue-bright)" strokeWidth=".15" transform="scale(.92) translate(4, 3.5)" strokeDasharray="1 1.5" opacity=".5"/>
    </svg>
    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"12% 18%" }}>
      {children}
    </div>
  </div>
);

// Faux game logo (placeholder — user replaces with real PNG)
const GameLogoPlaceholder = ({ ch, en, color = "var(--blue-glow)" }) => (
  <div style={{ textAlign:"center", lineHeight:1 }}>
    <div style={{
      fontFamily:"var(--font-display)", fontWeight:900, fontSize:28, letterSpacing:".06em",
      color, textShadow:`0 0 18px ${color}66`
    }}>{en}</div>
    <div style={{
      marginTop:6, fontFamily:"var(--font-body)", fontWeight:900, fontSize:22, letterSpacing:".06em",
      color:"var(--silver-0)"
    }}>{ch}</div>
  </div>
);

// 悠太翼 wordmark (monogram)
const YuutaMark = ({ size = 36, showEn = true }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", lineHeight:.85 }}>
    <div style={{
      fontFamily:"var(--font-display)", fontWeight:900, fontSize:size, color:"var(--silver-0)",
      letterSpacing:".06em"
    }}>YUUTA</div>
    {showEn && (
      <div style={{
        fontFamily:"var(--font-display)", fontWeight:900, fontSize:size, color:"var(--blue-bright)",
        letterSpacing:".06em"
      }}>TSUBASA</div>
    )}
    <div style={{
      alignSelf:"stretch",
      display:"flex", justifyContent:"space-between",
      fontFamily:"var(--font-mono)", fontSize:size*.22, color:"var(--silver-3)",
      marginTop:4
    }}>
      <span>悠</span><span>・</span><span>太</span><span>・</span><span>翼</span>
    </div>
  </div>
);

// Rotating radar SVG (used in cover B/D)
const RadarRing = ({ size = 480 }) => (
  <svg viewBox="0 0 600 600" style={{ width:size, height:size, animation:"spin-slow 80s linear infinite", opacity:.7 }}>
    <defs>
      <radialGradient id="radarG" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="rgba(34,211,238,.15)"/>
        <stop offset="1" stopColor="transparent"/>
      </radialGradient>
    </defs>
    <circle cx="300" cy="300" r="290" fill="url(#radarG)"/>
    <circle cx="300" cy="300" r="280" fill="none" stroke="var(--blue-bright)" strokeWidth="0.5" strokeDasharray="2 6"/>
    <circle cx="300" cy="300" r="240" fill="none" stroke="var(--blue-bright)" strokeWidth="0.5" strokeDasharray="20 4"/>
    <circle cx="300" cy="300" r="200" fill="none" stroke="var(--blue-bright)" strokeWidth="1"/>
    <circle cx="300" cy="300" r="140" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.6" strokeDasharray="3 5"/>
    <circle cx="300" cy="300" r="80" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.4"/>
    {Array.from({length:24}).map((_,i)=>(
      <line key={i} x1="300" y1="20" x2="300" y2={i%6===0?40:30} stroke="var(--blue-bright)" strokeWidth="0.8" transform={`rotate(${i*15} 300 300)`}/>
    ))}
    {/* sweep */}
    <path d="M 300 300 L 580 300 A 280 280 0 0 0 480 100 Z" fill="rgba(96,165,250,.12)"/>
  </svg>
);

// Crosshair reticle (over character)
const Reticle = ({ size = 110, color = "var(--blue-bright)", opacity = .75 }) => (
  <svg viewBox="0 0 120 120" style={{ width:size, height:size, color, opacity }}>
    <circle cx="60" cy="60" r="3" fill="currentColor"/>
    <circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" strokeWidth=".8"/>
    <line x1="60" y1="0" x2="60" y2="38" stroke="currentColor" strokeWidth=".8"/>
    <line x1="60" y1="82" x2="60" y2="120" stroke="currentColor" strokeWidth=".8"/>
    <line x1="0" y1="60" x2="38" y2="60" stroke="currentColor" strokeWidth=".8"/>
    <line x1="82" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth=".8"/>
  </svg>
);

Object.assign(window, {
  Corners, Dot, Tele, ScanBar, Tag, Panel, HexFrame,
  GameLogoPlaceholder, YuutaMark, RadarRing, Reticle, DEFAULTS,
  STREAM_TAGS, findStreamTag, parseCategoryList
});
