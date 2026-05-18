/* global React, Corners, Dot, Tele, ScanBar, Tag, Panel, HexFrame, GameLogoPlaceholder, YuutaMark, RadarRing, Reticle, parseCategoryList */

// ============================================================
// Hero character — crop centered on character's face/torso
// src defaults to assets/yuuta-hero.png; each cover can pass its own
// 透過 tweaks 面板的「人物立繪 → 圖檔路徑」可以指定不同去背圖
// ============================================================
const Hero = ({ src = "assets/yuuta-hero.png", style, position = "center 30%", size = "180%" }) => (
  <div style={{
    position:"absolute",
    backgroundImage:`url('${src}')`,
    backgroundSize:size,
    backgroundPosition:position,
    backgroundRepeat:"no-repeat",
    ...style
  }}/>
);

// ============================================================
// COVER A — MISSION_BRIEF
// 3-zone HUD: left dossier, center hex, right character w/ reticle
// ============================================================
function CardA({ d }) {
  const cats = parseCategoryList(d.categories);
  const bgStyle = d.bgSrc
    ? {
        backgroundImage: `url('${d.bgSrc}')`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : {};
  return (
    <div className={`cover ${d.mode === "light" ? "light" : ""}`}>
      {/* layered bg: full bg image or theme gradient */}
      <div
        className={`game-bg theme-${d.theme}${d.bgSrc ? "" : " game-bg-blur"}${d.bgSrc && d.bgEffect ? ` bg-${d.bgEffect}` : ""}`}
        style={d.bgSrc && d.bgEffect === "soft"
          ? { ...bgStyle, filter: "blur(4px) saturate(.85)", transform: "scale(1.02)" }
          : bgStyle}
      />
      {d.bgSrc && d.bgEffect === "soft" && (
        <div className="bg-soft-tint" style={typeof d.bgTint === "number" ? { background: `rgba(8,16,32,${d.bgTint})` } : undefined}/>
      )}
      <div className="fx-grid"/>
      <div className="fx-slashes"/>
      <div className="fx-scan"/>

      {/* Big watermark text behind */}
      <div style={{
        position:"absolute", right:-40, top:60,
        fontFamily:"var(--font-display)", fontSize:260, fontWeight:900,
        background:"var(--c-watermark)",
        WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
        letterSpacing:"-.04em", whiteSpace:"nowrap", lineHeight:.85,
        pointerEvents:"none"
      }}>KNIGHT</div>

      <div className="fx-noise"/>
      <div className="fx-vignette"/>

      {/* HERO character — fits within right half (640×720), bottom-aligned
          放在 fx 層之上，避免 vignette / noise / tint 壓在角色身上 */}
      <Hero src={d.heroSrc} style={{
        right:0, bottom:0, width:640, height:720,
        opacity:.98
      }} position="center bottom" size="contain"/>

      {/* TOP HEADER STRIP */}
      <div style={{
        position:"absolute", left:0, right:0, top:0, height:48,
        display:"flex", alignItems:"center", padding:"0 32px", gap:24,
        background:"var(--c-strip-top)",
        borderBottom:"1px solid var(--line)",
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".22em", color:"var(--silver-2)"
      }}>
        <span style={{ color:"var(--blue-bright)" }}>▸ TRANSMISSION ESTABLISHED</span>
        <span style={{ color:"var(--silver-3)" }}>//</span>
        <span>{d.artist ? `ARTIST / ${d.artist}` : "SYS / ONLINE"}</span>
        {!d.artist && <>
          <span style={{ color:"var(--silver-3)" }}>//</span>
          <span>CONN / 4G STABLE</span>
        </>}
        <span style={{ flex:1 }}/>
        {d.streamTime && <span>{d.streamTime}</span>}
        <span style={{ width:1, height:14, background:"var(--line-strong)" }}/>
        <Dot color="#EF4444"/>
        <span style={{ color:"var(--c-live-text)", fontFamily:"var(--font-tech)", fontWeight:600, fontSize:12, letterSpacing:".18em" }}>LIVE NOW</span>
      </div>

      {/* LEFT DOSSIER PANEL */}
      <div style={{ position:"absolute", left:32, top:78, width:520 }}>
        <Panel glow style={{ padding:"22px 26px 22px" }}>
          {/* Header — file label + categories chips */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, gap:12 }}>
            <span className="mono" style={{ fontSize:10, color:"var(--silver-3)", letterSpacing:".25em", paddingTop:6 }}>// MISSION_BRIEF.MD</span>
            {cats.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"flex-end", maxWidth:280 }}>
                {cats.map((t) => (
                  <Tag key={t.id} color={t.color}>{t.enLabel}</Tag>
                ))}
              </div>
            )}
          </div>

          {/* VOL. + giant number */}
          <div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:8 }}>
            <span className="display" style={{ fontSize:24, fontWeight:700, color:"var(--blue-bright)", letterSpacing:".18em" }}>VOL.</span>
            <span className="display" style={{
              fontSize:96, fontWeight:900, color:"var(--silver-0)", lineHeight:.9,
              textShadow:"var(--c-shadow-vol)"
            }}>{d.vol}</span>
          </div>

          <div style={{ height:1, background:"var(--line)", margin:"12px 0 16px" }}/>

          {/* Title block: main + #ep + sub */}
          <h1 style={{
            margin:0, fontFamily:"var(--font-body)", fontWeight:900,
            fontSize:46, lineHeight:1.08, color:"var(--silver-0)",
            textShadow:"var(--c-shadow-title)", letterSpacing:"-.01em",
            fontSynthesis:"none"
          }}>
            {d.titleMain}
            {d.episode != null && d.episode !== "" && (
              <span style={{
                marginLeft:10, fontSize:28, color:"var(--blue-bright)",
                fontStyle:"italic", fontWeight:700, whiteSpace:"nowrap"
              }}>#{d.episode}</span>
            )}
          </h1>
          {d.titleSub && (
            <div className="tech" style={{
              marginTop:8, fontSize:22, fontWeight:600, color:"var(--blue-bright)",
              letterSpacing:".06em"
            }}>
              {d.titleSub}
            </div>
          )}
        </Panel>
      </div>

      {/* BOTTOM-RIGHT — theme logo */}
      {d.logoSrc && (
        <div style={{
          position:"absolute", right:32, bottom:84,
          padding:"12px 16px 14px",
          background:"var(--c-surface)", border:"1px solid var(--line-strong)",
          backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
          display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6
        }}>
          <span className="mono" style={{ fontSize:9, color:"var(--blue-bright)", letterSpacing:".25em" }}>▸ THEME</span>
          <img src={d.logoSrc} alt="theme logo" style={{
            maxHeight:120, maxWidth:380, objectFit:"contain", display:"block"
          }}/>
        </div>
      )}

      {/* BOTTOM strip — YuutaMark + ScanBar + VTuber logo */}
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height:60,
        display:"flex", alignItems:"center", padding:"0 32px", gap:24,
        background:"var(--c-strip-bot)",
        borderTop:"1px solid var(--line)"
      }}>
        <YuutaMark size={22} showEn={true}/>
        <span style={{ flex:1 }}/>
        <div style={{ width:280 }}>
          <ScanBar progress={42} label="EPISODE LOAD"/>
        </div>
        {d.vtuberLogoSrc && (
          <img src={d.vtuberLogoSrc} alt="VTuber logo" style={{
            height:32, width:"auto", display:"block", objectFit:"contain"
          }}/>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COVER B — TARGET_LOCK
// 全背景圖 + 右上立繪 + 多分類 + Vol 大號 + 標題（含 #ep）+ 主題 logo + 右下 VTuber 徽章
// ============================================================
function CardB({ d }) {
  const cats = parseCategoryList(d.categories);
  const bgStyle = d.bgSrc
    ? {
        backgroundImage: `url('${d.bgSrc}')`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : {};
  return (
    <div className={`cover ${d.mode === "light" ? "light" : ""}`}>
      {/* Full background image (or theme gradient fallback) */}
      <div
        className={`game-bg theme-${d.theme}${d.bgSrc ? "" : " game-bg-blur"}${d.bgSrc && d.bgEffect ? ` bg-${d.bgEffect}` : ""}`}
        style={d.bgSrc && d.bgEffect === "soft"
          ? { ...bgStyle, filter: "blur(4px) saturate(.85)", transform: "scale(1.02)" }
          : bgStyle}
      />
      {d.bgSrc && d.bgEffect === "soft" && (
        <div className="bg-soft-tint" style={typeof d.bgTint === "number" ? { background: `rgba(8,16,32,${d.bgTint})` } : undefined}/>
      )}
      <div className="fx-grid"/>

      {/* Big VOL watermark — behind backdrop */}
      <div style={{
        position:"absolute", left:-20, bottom:-80,
        fontFamily:"var(--font-display)", fontSize:340, fontWeight:900,
        background:"var(--c-watermark-2)",
        WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
        letterSpacing:"-.05em", lineHeight:.85, pointerEvents:"none",
        fontStyle:"italic"
      }}>VOL</div>

      {/* LEFT 1/3 translucent backdrop — early in stack so foreground sits above */}
      <div style={{
        position:"absolute", left:0, top:0, bottom:0, width:432,
        background:"var(--c-panel)",
        backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
        borderRight:"1px solid var(--line-strong)"
      }}>
        <Corners color="var(--blue-bright)" size={18}/>
      </div>

      {/* HERO character — fits right half, bottom-aligned */}
      <Hero src={d.heroSrc} style={{
        right:20, bottom:0, width:600, height:700,
        opacity:.98
      }} position="center bottom" size="contain"/>

      {/* Radar decoration — keep but no inner logo */}
      <div style={{ position:"absolute", right:80, top:80, opacity:.5 }}>
        <RadarRing size={520}/>
      </div>

      <div className="fx-noise"/>

      {/* TOP-LEFT — transmission */}
      <div style={{
        position:"absolute", left:32, top:24,
        display:"flex", alignItems:"center", gap:12,
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".22em", color:"var(--silver-2)"
      }}>
        <Dot color="#EF4444"/>
        <span style={{ color:"var(--c-live-text)", fontFamily:"var(--font-tech)", fontWeight:600, fontSize:13, letterSpacing:".18em" }}>LIVE NOW</span>
        <span style={{ width:1, height:14, background:"var(--line-strong)" }}/>
        <span>2026.05.16 / 20:00 JST</span>
      </div>

      {/* LEFT CONTENT */}
      <div style={{ position:"absolute", left:24, top:96, width:384 }}>
        {/* ARCHIVE_ID label */}
        <div className="mono" style={{ fontSize:11, color:"var(--blue-bright)", letterSpacing:".25em", marginBottom:4 }}>
          ▸ ARCHIVE_ID
        </div>

        {/* VOL. + number */}
        <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
          <span className="display" style={{
            fontSize:32, fontWeight:700, color:"var(--blue-bright)", letterSpacing:".18em"
          }}>VOL.</span>
          <span className="display" style={{
            fontSize:120, fontWeight:900, color:"var(--silver-0)", lineHeight:.85,
            textShadow:"var(--c-shadow-vol)"
          }}>{d.vol}</span>
        </div>

        {/* Categories — horizontal wrap, 4+ 個自動換行 */}
        {cats.length > 0 && (
          <div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:6 }}>
            {cats.map((t) => (
              <Tag key={t.id} color={t.color}>{t.label} · {t.enLabel}</Tag>
            ))}
          </div>
        )}

        <div style={{ height:1, background:"var(--line)", margin:"16px 0" }}/>

        {/* Title */}
        <h1 style={{
          margin:0, fontFamily:"var(--font-body)", fontWeight:900,
          fontSize:54, lineHeight:1.05, color:"var(--silver-0)", letterSpacing:"-.01em",
          textShadow:"var(--c-shadow-title)",
          display:"flex", alignItems:"baseline", gap:12, flexWrap:"wrap"
        }}>
          <span>{d.titleMain}</span>
          {d.episode != null && d.episode !== "" && (
            <span style={{ fontSize:32, color:"var(--blue-bright)", fontStyle:"italic", fontWeight:700 }}>#{d.episode}</span>
          )}
        </h1>
        {d.titleSub && (
          <div className="tech" style={{
            marginTop:10, fontSize:22, fontWeight:600, color:"var(--blue-bright)",
            letterSpacing:".04em"
          }}>
            {d.titleSub}
          </div>
        )}
      </div>

      {/* Stream-theme logo — image only, hidden when not set */}
      {d.logoSrc && (
        <div style={{
          position:"absolute", left:32, bottom:84, maxWidth:420,
          padding:"14px 18px",
          background:"var(--c-surface)", border:"1px solid var(--line-strong)",
          backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", gap:12
        }}>
          <span className="mono" style={{ fontSize:10, color:"var(--blue-bright)", letterSpacing:".25em" }}>▸ THEME</span>
          <img src={d.logoSrc} alt="theme logo" style={{
            maxHeight:64, maxWidth:300, objectFit:"contain", display:"block"
          }}/>
        </div>
      )}

      <div className="fx-vignette"/>

      {/* BOTTOM STRIP */}
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height:48,
        display:"flex", alignItems:"center", padding:"0 130px 0 32px", gap:18,
        borderTop:"1px solid var(--line)",
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".22em", color:"var(--silver-3)"
      }}>
        <YuutaMark size={20} showEn={true}/>
        <span style={{ flex:1 }}/>
        <span>::TARGET / LOCKED</span>
      </div>

      {/* BOTTOM-RIGHT — VTuber logo badge with white border */}
      {d.vtuberLogoSrc && (
        <div style={{
          position:"absolute", right:24, bottom:24,
          width:88, height:88, borderRadius:"50%",
          background:"#FFFFFF",
          border:"3px solid #FFFFFF",
          boxShadow:"0 4px 18px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.08)",
          overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <img src={d.vtuberLogoSrc} alt="VTuber logo" style={{
            width:"86%", height:"86%", objectFit:"contain"
          }}/>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COVER C — CODE_CASTER (terminal)
// Left: terminal window. Right: character + game logo
// ============================================================
function CardC({ d }) {
  return (
    <div className={`cover ${d.mode === "light" ? "light" : ""}`}>
      <div style={{ position:"absolute", inset:0,
        background:"var(--c-terminal-base)" }}/>
      <div className="fx-grid"/>
      <div className="fx-slashes"/>

      {/* HERO character right */}
      <Hero src={d.heroSrc} style={{
        right:-120, top:-40, width:780, height:820,
        opacity:.95,
        maskImage:"linear-gradient(90deg, transparent 0%, black 30%, black 80%, transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg, transparent 0%, black 30%, black 80%, transparent 100%)"
      }} position="50% 28%" size="200%"/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:600,
        background:"var(--c-terminal-fade)" }}/>

      {/* TOP HEADER */}
      <div style={{
        position:"absolute", left:0, right:0, top:0, height:42,
        display:"flex", alignItems:"center", padding:"0 24px", gap:18,
        background:"var(--c-strip-solid)",
        borderBottom:"1px solid var(--line-strong)",
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".22em"
      }}>
        <span style={{ display:"flex", gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }}/>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }}/>
          <span style={{ width:10, height:10, borderRadius:"50%", background:"#22D3EE" }}/>
        </span>
        <span style={{ marginLeft:18, color:"var(--silver-2)" }}>~/yuuta/streams/vol_{d.vol} — zsh — 132×40</span>
        <span style={{ flex:1 }}/>
        <Dot color="#EF4444"/>
        <span style={{ color:"var(--c-live-text)", fontWeight:600 }}>LIVE</span>
      </div>

      {/* TERMINAL on left */}
      <div style={{
        position:"absolute", left:32, top:74, width:680, bottom:80,
        background:"var(--c-terminal-bg)",
        border:"1px solid var(--line-strong)",
        padding:"24px 28px",
        boxShadow:"0 0 0 1px rgba(96,165,250,.18), inset 0 0 60px rgba(96,165,250,.08)"
      }}>
        <Corners color="var(--blue-bright)" size={14}/>
        <pre className="mono" style={{ margin:0, fontSize:15, lineHeight:1.55, color:"var(--silver-1)", whiteSpace:"pre-wrap" }}>
<span style={{ color:"var(--silver-3)" }}>{"// boot sequence …"}</span>{"\n"}
<span style={{ color:"var(--blue-bright)" }}>knight@azure</span><span style={{ color:"var(--silver-3)" }}>:</span><span style={{ color:"var(--accent-cyan)" }}>~</span>{" $ "}
<span style={{ color:"var(--silver-0)" }}>./mission --start</span>{"\n"}
<span style={{ color:"var(--silver-3)" }}>{"▸ loading callsign...  "}</span><span style={{ color:"#22D3EE" }}>{d.callsign}</span>{"\n"}
<span style={{ color:"var(--silver-3)" }}>{"▸ archive id    ......  "}</span><span style={{ color:"var(--blue-bright)" }}>VOL.{d.vol} · EP·{String(d.episode).padStart(2,"0")}</span>{"\n"}
<span style={{ color:"var(--silver-3)" }}>{"▸ category      ......  "}</span><span style={{ color:"var(--accent-amber)" }}>{d.category} / {d.categoryZh}</span>{"\n\n"}
<span style={{ color:"var(--blue-bright)" }}>knight@azure</span><span style={{ color:"var(--silver-3)" }}>:</span><span style={{ color:"var(--accent-cyan)" }}>~</span>{" $ "}
<span style={{ color:"var(--silver-0)" }}>cat ./brief.json</span>{"\n"}
{"{\n"}
{"  "}<span style={{ color:"#A78BFA" }}>"target_zh"</span>{": "}<span style={{ color:"var(--silver-0)", fontWeight:700 }}>"{d.titleMain}"</span>{",\n"}
{"  "}<span style={{ color:"#A78BFA" }}>"target_en"</span>{": "}<span style={{ color:"var(--silver-0)", fontWeight:700 }}>"{d.titleSub}"</span>{",\n"}
{"  "}<span style={{ color:"#A78BFA" }}>"episode"</span>{":   "}<span style={{ color:"var(--accent-cyan)" }}>{d.episode}</span>{",\n"}
{"  "}<span style={{ color:"#A78BFA" }}>"objective"</span>{": "}<span style={{ color:"var(--silver-1)" }}>"{d.subtitle}"</span>{",\n"}
{"  "}<span style={{ color:"#A78BFA" }}>"status"</span>{":    "}<span style={{ color:"#EF4444", fontWeight:700 }}>"LIVE_NOW"</span>{"\n"}
{"}\n\n"}
<span style={{ color:"var(--blue-bright)" }}>knight@azure</span><span style={{ color:"var(--silver-3)" }}>:</span><span style={{ color:"var(--accent-cyan)" }}>~</span>{" $ "}
<span style={{ color:"var(--silver-0)" }}>./stream --go</span>
<span style={{ display:"inline-block", width:9, height:18, background:"var(--blue-bright)", verticalAlign:"-3px", marginLeft:4, animation:"pulse 1s steps(2) infinite" }}/>
        </pre>
      </div>

      {/* Game logo hex floating */}
      <div style={{ position:"absolute", right:50, top:100 }}>
        <HexFrame size={260}>
          <GameLogoPlaceholder ch={d.logoCh} en={d.logoEn}/>
        </HexFrame>
      </div>

      {/* Right character HUD labels */}
      <div style={{ position:"absolute", right:30, top:400, fontFamily:"var(--font-mono)", fontSize:10, color:"var(--accent-cyan)", textAlign:"right" }}>
        <div>▸ KNIGHT-ZX / 04</div>
        <div style={{ color:"var(--silver-3)", marginTop:4 }}>ARMOR LV.99</div>
      </div>

      <div className="fx-noise"/>
      <div className="fx-vignette"/>

      {/* BOTTOM */}
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height:60,
        display:"flex", alignItems:"center", padding:"0 32px", gap:24,
        borderTop:"1px solid var(--line)",
        background:"var(--c-strip-solid-2)"
      }}>
        <YuutaMark size={22} showEn={true}/>
        <span style={{ flex:1 }}/>
        <Tag color="var(--blue-bright)" solid>{d.category}</Tag>
        <span className="mono" style={{ fontSize:11, color:"var(--silver-3)", letterSpacing:".22em" }}>
          ::FPS / 60 ::ENC / RSA-4096 ::HQ / 4K
        </span>
      </div>
    </div>
  );
}

// ============================================================
// COVER D — ARCHIVE_ENTRY (cleanest / editorial)
// Game scene full-bleed, info anchored bottom — like video card
// ============================================================
function CardD({ d }) {
  return (
    <div className={`cover ${d.mode === "light" ? "light" : ""}`}>
      <div className={`game-bg theme-${d.theme}`}/>
      <div className="fx-noise"/>

      {/* HERO character right */}
      <Hero src={d.heroSrc} style={{
        right:-60, top:-40, width:780, height:780,
        opacity:1,
        maskImage:"linear-gradient(90deg, transparent 0%, rgba(0,0,0,.4) 12%, black 30%, black 90%, transparent 100%)",
        WebkitMaskImage:"linear-gradient(90deg, transparent 0%, rgba(0,0,0,.4) 12%, black 30%, black 90%, transparent 100%)"
      }} position="48% 28%" size="195%"/>

      {/* Heavy bottom-up vignette for text legibility */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"var(--c-d-vignette)"
      }}/>
      {/* Left fade for title legibility */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"var(--c-d-fade)"
      }}/>

      <div className="fx-grid"/>

      {/* TOP-LEFT — archive entry mono */}
      <div style={{
        position:"absolute", left:40, top:32,
        display:"flex", alignItems:"center", gap:14,
        fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:".22em", color:"var(--silver-2)"
      }}>
        <span style={{ color:"var(--blue-bright)" }}>▸ ARCHIVE ENTRY</span>
        <span style={{ color:"var(--silver-3)" }}>//</span>
        <span>{String(d.vol).padStart(4,"0")} · {String(d.episode).padStart(2,"0")}</span>
      </div>

      {/* TOP-RIGHT — LIVE */}
      <div style={{
        position:"absolute", right:40, top:24, display:"flex", alignItems:"center", gap:10,
        padding:"8px 14px", border:"1px solid var(--c-live-border)", background:"var(--c-live-bg)"
      }}>
        <Dot color="#EF4444"/>
        <span className="tech" style={{ color:"var(--c-live-text)", fontSize:12, letterSpacing:".18em", fontWeight:600 }}>LIVE NOW</span>
      </div>

      {/* Big game logo hex centered-right behind character */}
      <div style={{ position:"absolute", right:480, top:140, opacity:.95 }}>
        <HexFrame size={300}>
          <GameLogoPlaceholder ch={d.logoCh} en={d.logoEn}/>
        </HexFrame>
      </div>

      {/* HUD reticle over character */}
      <Reticle size={120} color="var(--blue-bright)" opacity={.7}/>
      <div style={{ position:"absolute", right:120, top:120 }}>
        <Reticle size={100} color="var(--blue-bright)"/>
      </div>

      <div className="fx-vignette"/>

      {/* BOTTOM info bar (like video card) */}
      <div style={{ position:"absolute", left:0, right:0, bottom:0, padding:"24px 40px 28px" }}>
        {/* meta row */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
          <div style={{
            display:"flex", alignItems:"baseline", gap:8,
            padding:"8px 18px",
            background:"var(--c-vol-pill)", border:"1px solid var(--line-strong)"
          }}>
            <span className="mono" style={{ fontSize:11, color:"var(--blue-bright)", letterSpacing:".25em" }}>VOL</span>
            <span className="display" style={{ fontSize:32, fontWeight:900, color:"var(--silver-0)", lineHeight:.9 }}>{d.vol}</span>
          </div>
          <Tag color="var(--blue-bright)" solid>{d.category}</Tag>
          <Tag color="var(--accent-cyan)">EP · {String(d.episode).padStart(2,"0")}</Tag>
          <span style={{ flex:1, height:1, background:"var(--line)" }}/>
          <span className="mono" style={{ fontSize:11, color:"var(--silver-3)", letterSpacing:".22em" }}>
            ::REC / 4K60   ::FPS / 60 LOCK
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          margin:0, fontFamily:"var(--font-body)", fontWeight:900,
          fontSize:72, lineHeight:1, color:"var(--silver-0)", letterSpacing:"-.01em",
          textShadow:"var(--c-shadow-text)"
        }}>
          {d.titleMain}
          <span style={{
            fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:48,
            color:"var(--blue-bright)", marginLeft:18
          }}>
            #{d.episode}
          </span>
        </h1>
        <div className="tech" style={{
          marginTop:10, fontSize:30, fontWeight:600, color:"var(--silver-2)",
          letterSpacing:".04em",
          textShadow:"0 2px 12px rgba(0,0,0,.7)"
        }}>
          {d.titleSub}
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16 }}>
          <div className="mono" style={{ fontSize:13, color:"var(--blue-glow)", letterSpacing:".06em" }}>
            ▸ {d.subtitle}
          </div>
          <YuutaMark size={22} showEn={true}/>
        </div>
      </div>
    </div>
  );
}

window.CardA = CardA;
window.CardB = CardB;
window.CardC = CardC;
window.CardD = CardD;
