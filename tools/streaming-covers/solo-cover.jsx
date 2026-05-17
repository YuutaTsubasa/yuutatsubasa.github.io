/* global React, ReactDOM, CardA, CardB, CardC, CardD, DEFAULTS */

const SOLO_CARDS = { a: CardA, b: CardB, c: CardC, d: CardD };

function SoloApp() {
  const [state, setState] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vol = params.get("vol");
    const cardOverride = (params.get("card") || "").toLowerCase();

    if (vol == null) {
      setErr("缺少 ?vol=NNN 參數");
      return;
    }
    const padded = String(vol).padStart(4, "0");
    fetch(`data/cover_${padded}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`cover_${padded}.json 載入失敗（HTTP ${r.status}）`);
        return r.json();
      })
      .then((data) => {
        const merged = { ...DEFAULTS, ...data };
        const card = (cardOverride || data.card || "a").toLowerCase();
        setState({ data: merged, card });
      })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace", color: "#EF4444" }}>
        // SOLO RENDER ERROR · {err}
      </div>
    );
  }
  if (!state) return null;

  const Card = SOLO_CARDS[state.card] || CardA;
  return <Card d={state.data} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<SoloApp />);
