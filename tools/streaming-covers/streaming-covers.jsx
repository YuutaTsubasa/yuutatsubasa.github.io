/* global React, ReactDOM, CardA, CardB, CardC, CardD, DEFAULTS, STREAM_TAGS,
   DesignCanvas, DCSection, DCArtboard, TweaksPanel, useTweaks,
   TweakSection, TweakText, TweakNumber, TweakSelect, TweakRadio */

function CoverTweaks({ d, set }) {
  const themeOptions = [
    { value:"azure",   label:"Azure 藍" },
    { value:"cyan",    label:"Cyan 青" },
    { value:"violet",  label:"Violet 紫" },
    { value:"amber",   label:"Amber 琥珀" },
    { value:"crimson", label:"Crimson 紅" },
  ];
  const modeOptions = [
    { value:"dark",  label:"Dark" },
    { value:"light", label:"Light" },
  ];
  const tagHint = STREAM_TAGS.map((t) => `${t.id}=${t.label}`).join(' / ');
  return (
    <TweaksPanel title="封面內容">
      <TweakSection label="模式">
        <TweakRadio label="深淺主題" value={d.mode} options={modeOptions} onChange={v => set("mode", v)}/>
        <TweakSelect label="主題色"  value={d.theme} options={themeOptions} onChange={v => set("theme", v)}/>
      </TweakSection>
      <TweakSection label="編號 & 分類">
        <TweakNumber label="Vol." value={d.vol} min={0} max={9999} onChange={v => set("vol", v)}/>
        <TweakText   label="Episode #（可空）" value={d.episode ?? ""} onChange={v => set("episode", v === "" ? null : v)}/>
        <TweakText
          label="分類 ids"
          value={d.categories}
          onChange={v => set("categories", v)}
          placeholder={tagHint}
        />
      </TweakSection>
      <TweakSection label="標題">
        <TweakText label="主標題" value={d.titleMain} onChange={v => set("titleMain", v)}/>
        <TweakText label="副標題" value={d.titleSub}  onChange={v => set("titleSub", v)}/>
      </TweakSection>
      <TweakSection label="其他資訊">
        <TweakText label="繪師（可空）" value={d.artist} onChange={v => set("artist", v)}/>
        <TweakText label="直播時間（可空）" value={d.streamTime} onChange={v => set("streamTime", v)}/>
      </TweakSection>
      <TweakSection label="圖片素材">
        <TweakText label="人物立繪（右上）" value={d.heroSrc} onChange={v => set("heroSrc", v)}/>
        <TweakText label="全背景圖（可空）" value={d.bgSrc} onChange={v => set("bgSrc", v)}/>
        <TweakText label="主題 Logo 圖檔（可空）" value={d.logoSrc} onChange={v => set("logoSrc", v)}/>
        <TweakText label="VTuber Logo（右下徽章）" value={d.vtuberLogoSrc} onChange={v => set("vtuberLogoSrc", v)}/>
      </TweakSection>
    </TweaksPanel>
  );
}

function App() {
  const [d, set] = useTweaks(DEFAULTS);
  return (
    <>
      <DesignCanvas
        title="直播封面 — Knight of Code"
        subtitle="1280 × 720 · A 為主"
      >
        <DCSection id="covers" title="Streaming Covers">
          <DCArtboard id="a" label="A · MISSION_BRIEF（主用）" width={1280} height={720}>
            <CardA d={d}/>
          </DCArtboard>
          <DCArtboard id="b" label="B · TARGET_LOCK（備）" width={1280} height={720}>
            <CardB d={d}/>
          </DCArtboard>
          <DCArtboard id="c" label="C · CODE_CASTER（備）" width={1280} height={720}>
            <CardC d={d}/>
          </DCArtboard>
          <DCArtboard id="d" label="D · ARCHIVE_ENTRY（備）" width={1280} height={720}>
            <CardD d={d}/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
      <CoverTweaks d={d} set={set}/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
