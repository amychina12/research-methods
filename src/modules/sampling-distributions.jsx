import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function samplePop(type, n) {
  return Array.from({ length: n }, () => {
    if (type === "normal") return rNorm(50, 15);
    if (type === "skewed") return Math.pow(Math.random(), 2.5) * 80 + 10;
    if (type === "uniform") return Math.random() * 80 + 10;
    if (type === "bimodal") return Math.random() < 0.5 ? rNorm(30, 8) : rNorm(70, 8);
    return rNorm(50, 15);
  });
}
function popCurve(type, n = 200) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = (i / n) * 100; let y;
    if (type === "normal") y = Math.exp(-0.5 * ((x - 50) / 15) ** 2);
    else if (type === "skewed") { const t = (x - 10) / 80; y = t >= 0 && t <= 1 ? (1 - t) ** 4 * 4 : 0; }
    else if (type === "uniform") y = x >= 10 && x <= 90 ? 1 : 0;
    else if (type === "bimodal") y = Math.exp(-0.5 * ((x - 30) / 8) ** 2) + Math.exp(-0.5 * ((x - 70) / 8) ** 2);
    else y = 0;
    pts.push({ x, y });
  }
  const mx = Math.max(...pts.map(p => p.y));
  return pts.map(p => ({ x: p.x, y: p.y / mx }));
}
function buildHist(vals, bc = 40, range = [0, 100]) {
  const bw = (range[1] - range[0]) / bc;
  const bins = Array(bc).fill(0);
  vals.forEach(v => { const i = Math.min(Math.floor((v - range[0]) / bw), bc - 1); if (i >= 0 && i < bc) bins[i]++; });
  return bins.map((c, i) => ({ x: range[0] + i * bw + bw / 2, count: c, width: bw }));
}

const TM = { normal: 50, skewed: 24.5, uniform: 50, bimodal: 50 };
const POPS = [
  { id: "normal", label: "Normal", desc: "Symmetric bell curve" },
  { id: "skewed", label: "Right-Skewed", desc: "Long tail to the right" },
  { id: "uniform", label: "Uniform", desc: "Flat, equal probability" },
  { id: "bimodal", label: "Bimodal", desc: "Two peaks" },
];
const SIZES = [2, 5, 10, 30, 50, 100];

// ─── Colors ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
  sh: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  pop: "#D97706", popBg: "rgba(217,119,6,0.06)", popLt: "#FEF3C7",
  sam: "#0284C7", samBg: "rgba(2,132,199,0.06)", samLt: "#E0F2FE",
  smp: "#7C3AED", smpBg: "rgba(124,58,237,0.05)", smpLt: "#EDE9FE",
  grn: "#059669", grnBg: "rgba(5,150,105,0.06)",
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)",
  tx: "#1E293B", txB: "#334155", txD: "#64748B", txM: "#94A3B8",
  grid: "rgba(148,163,184,0.12)",
};
const font = "'DM Sans', sans-serif";
const mono = "'DM Mono', monospace";
const serif = "'Source Serif 4', serif";

// ─── Shared UI ──────────────────────────────────────────────────────
function SH({ number, title, sub }) {
  return (<div style={{ marginBottom: "22px" }}>
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NB({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.smp, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function AB({ onClick, label, primary, danger, muted }) {
  const bg = primary ? C.smp : danger ? "rgba(239,68,68,0.08)" : "transparent";
  const bd = primary ? C.smp : danger ? "#ef4444" : C.bdr;
  const cl = primary ? "#fff" : danger ? "#ef4444" : muted ? C.txM : C.tx;
  return <button onClick={onClick} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${bd}`, background: bg, color: cl, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button>;
}
function Pnl({ children, color, label, right, highlight, running }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${highlight ? `${color}33` : C.bdr}`, padding: "20px 22px", marginBottom: "14px", boxShadow: C.sh, animation: "fadeIn 0.4s ease" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: mono, letterSpacing: "0.06em" }}>{label}</div>
      {right && <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, ...(running ? { animation: "pulse 1s infinite" } : {}) }}>{right}</div>}
    </div>{children}
  </div>);
}
function Anl({ children }) {
  return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>;
}
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, minWidth: "100px", textAlign: "center" }}>
    <div style={{ fontSize: "10px", color: C.txM, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px", fontFamily: mono }}>{label}</div>
    <div style={{ fontSize: "20px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}
function Ins({ children, visible }) {
  if (!visible) return null;
  return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>&#128161;</span>{children}</div>;
}
function CBox({ children, title, color = C.sam }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>{title}</div>}
    {children}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// INTERACTIVE CONCEPT VISUALS
// ═══════════════════════════════════════════════════════════════════

// ─── 1. Variable: bars that shuffle ─────────────────────────────────
function VariableViz() {
  const labels = ["Firm A", "Firm B", "Firm C", "Firm D", "Firm E", "Firm F"];
  const [vals, setVals] = useState([35, 72, 18, 55, 90, 42]);
  const [gen, setGen] = useState(0);
  const shuffle = () => { setVals(labels.map(() => Math.round(10 + Math.random() * 85))); setGen(g => g + 1); };
  const W = 440, H = 150, pad = { t: 10, r: 10, b: 30, l: 10 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const bw = cw / labels.length;
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
        A <strong>variable</strong> is anything that <em>differs</em> across the things you're studying. Click "New Data" to see how the same variable (revenue) takes different values for different firms.
      </div>
      <svg key={gen} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "460px", display: "block", margin: "0 auto" }}>
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ch} y2={pad.t + ch} stroke={C.bdr} strokeWidth="1" />
        {vals.map((v, i) => {
          const bh = (v / 100) * ch;
          const x = pad.l + i * bw + bw * 0.15;
          const w = bw * 0.7;
          return (<g key={i}>
            <rect x={x} y={pad.t + ch} width={w} height="0" rx="4" fill={C.sam} opacity="0.7">
              <animate attributeName="height" from="0" to={bh} dur="0.4s" fill="freeze" begin={`${i * 0.06}s`} />
              <animate attributeName="y" from={pad.t + ch} to={pad.t + ch - bh} dur="0.4s" fill="freeze" begin={`${i * 0.06}s`} />
            </rect>
            <text x={x + w / 2} y={pad.t + ch - bh - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.sam} fontFamily={mono} opacity="0">
              {v}
              <animate attributeName="opacity" from="0" to="1" dur="0.2s" fill="freeze" begin={`${i * 0.06 + 0.3}s`} />
            </text>
            <text x={x + w / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>{labels[i]}</text>
          </g>);
        })}
      </svg>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={shuffle} style={{ padding: "7px 20px", borderRadius: "8px", border: `1.5px solid ${C.sam}`, background: C.samBg, color: C.sam, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>&#x1F504; New Data</button>
      </div>
      <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "8px", fontStyle: "italic" }}>Each bar is one observation. The fact that they're different heights &mdash; that's <strong>variation</strong>.</div>
    </div>
  );
}

// ─── 2. Statistic vs Parameter: hidden true value ───────────────────
function StatParamViz() {
  const trueVal = 52;
  const [samples, setSamples] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const drawSample = () => {
    const s = Array.from({ length: 8 }, () => trueVal + rNorm(0, 12));
    const mean = s.reduce((a, b) => a + b, 0) / s.length;
    setSamples(prev => [...prev, { values: s, mean }].slice(-8));
  };
  const W = 440, H = 100, pad = { l: 40, r: 20, t: 10, b: 20 };
  const cw = W - pad.l - pad.r;
  const scale = v => pad.l + ((v - 10) / 80) * cw;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
        The <strong>parameter</strong> is the true value in the population &mdash; but you can't see it directly. A <strong>statistic</strong> is your estimate from a sample. Draw samples and see how close your estimates get:
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "460px", display: "block", margin: "0 auto" }}>
        <line x1={pad.l} x2={W - pad.r} y1={60} y2={60} stroke={C.bdr} strokeWidth="1" />
        {[20, 40, 60, 80].map(v => <text key={v} x={scale(v)} y={78} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        {/* True parameter */}
        <line x1={scale(trueVal)} x2={scale(trueVal)} y1={10} y2={65} stroke={revealed ? C.pop : "transparent"} strokeWidth="2.5" strokeDasharray={revealed ? "0" : "6,3"} />
        {revealed && <text x={scale(trueVal)} y={8} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.pop} fontFamily={mono}>&#956; = {trueVal} (true)</text>}
        {!revealed && <text x={scale(trueVal)} y={8} textAnchor="middle" fontSize="10" fill={C.txM} fontFamily={mono}>&#956; = ???</text>}
        {/* Sample means */}
        {samples.map((s, i) => (
          <g key={i}>
            <circle cx={scale(s.mean)} cy={42} r="6" fill={C.sam} opacity={0.3 + (i / samples.length) * 0.6} stroke="#fff" strokeWidth="1">
              <animate attributeName="r" from="0" to="6" dur="0.3s" fill="freeze" />
            </circle>
            {i === samples.length - 1 && <text x={scale(s.mean)} y={95} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.sam} fontFamily={mono}>x&#772; = {s.mean.toFixed(1)}</text>}
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
        <button onClick={drawSample} style={{ padding: "7px 20px", borderRadius: "8px", border: `1.5px solid ${C.sam}`, background: C.samBg, color: C.sam, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Draw a Sample</button>
        <button onClick={() => setRevealed(!revealed)} style={{ padding: "7px 20px", borderRadius: "8px", border: `1.5px solid ${C.pop}`, background: revealed ? C.popBg : "transparent", color: C.pop, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{revealed ? "Hide" : "Reveal"} True &#956;</button>
        {samples.length > 0 && <button onClick={() => { setSamples([]); setRevealed(false); }} style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${C.bdr}`, background: "transparent", color: C.txM, fontSize: "12px", cursor: "pointer", fontFamily: font }}>Reset</button>}
      </div>
      {samples.length >= 3 && <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "8px", fontStyle: "italic" }}>Notice how sample means (blue dots) scatter around the true value? Each one is an imperfect estimate &mdash; but they cluster near the truth.</div>}
    </div>
  );
}

// ─── 3. Mean: interactive balance beam ──────────────────────────────
function MeanViz() {
  const [points, setPoints] = useState([15, 35, 50, 65, 85]);
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const mean = points.reduce((a, b) => a + b, 0) / points.length;

  const W = 460, H = 120;
  const scale = v => 30 + (v / 100) * 400;
  const inv = px => Math.max(0, Math.min(100, Math.round(((px - 30) / 400) * 100)));

  const onDown = (i, e) => { e.preventDefault(); dragging.current = i; };
  const onMove = useCallback((e) => {
    if (dragging.current === null) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) / rect.width * W;
    setPoints(prev => { const next = [...prev]; next[dragging.current] = inv(x); return next; });
  }, []);
  const onUp = useCallback(() => { dragging.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [onMove, onUp]);

  const addPt = () => setPoints(p => p.length < 12 ? [...p, Math.round(Math.random() * 100)] : p);
  const removePt = () => setPoints(p => p.length > 2 ? p.slice(0, -1) : p);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
        The <strong>mean</strong> is the balance point of your data. Drag the blue dots left or right and watch the triangle (the mean) shift to keep everything balanced:
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "480px", display: "block", margin: "0 auto", cursor: "default", touchAction: "none" }}>
        {/* axis */}
        <line x1="30" x2="430" y1="55" y2="55" stroke={C.bdr} strokeWidth="2" />
        {[0, 25, 50, 75, 100].map(v => <text key={v} x={scale(v)} y="73" textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        {/* mean triangle */}
        <polygon points={`${scale(mean)},58 ${scale(mean) - 10},80 ${scale(mean) + 10},80`} fill={C.grn} opacity="0.85">
          <animate attributeName="opacity" from="0.4" to="0.85" dur="0.2s" fill="freeze" />
        </polygon>
        <text x={scale(mean)} y="97" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grn} fontFamily={mono}>mean = {mean.toFixed(1)}</text>
        {/* data points */}
        {points.map((v, i) => (
          <g key={i} onMouseDown={e => onDown(i, e)} onTouchStart={e => onDown(i, e)} style={{ cursor: "grab" }}>
            <circle cx={scale(v)} cy="55" r="14" fill="transparent" />
            <circle cx={scale(v)} cy="42" r="10" fill={C.sam} stroke="#fff" strokeWidth="2" opacity="0.85" />
            <text x={scale(v)} y="46" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily={mono}>{v}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
        <button onClick={addPt} style={{ padding: "6px 16px", borderRadius: "8px", border: `1.5px solid ${C.sam}`, background: C.samBg, color: C.sam, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>+ Add Point</button>
        <button onClick={removePt} style={{ padding: "6px 16px", borderRadius: "8px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: C.txD, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>- Remove</button>
      </div>
      <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "8px", fontStyle: "italic" }}>Try dragging one dot to an extreme &mdash; see how it pulls the mean? That's why outliers matter.</div>
    </div>
  );
}

// ─── 4. Variance & SD: two dartboards ───────────────────────────────
function VarianceViz() {
  const [spread, setSpread] = useState(1);
  const genDarts = (sd) => Array.from({ length: 30 }, () => ({ x: rNorm(0, sd * 22), y: rNorm(0, sd * 22) }));
  const [darts, setDarts] = useState(() => genDarts(1));
  const throwDarts = (s) => { setSpread(s); setDarts(genDarts(s)); };

  const R = 75;
  const vals = darts.map(d => Math.sqrt(d.x ** 2 + d.y ** 2));
  const sdVal = Math.sqrt(vals.reduce((s, v) => s + (v - vals.reduce((a, b) => a + b, 0) / vals.length) ** 2, 0) / vals.length);

  // Step-by-step demo data
  const demoData = [20, 35, 50, 65, 80];
  const demoMean = demoData.reduce((a, b) => a + b, 0) / demoData.length;
  const demoDeviations = demoData.map(v => v - demoMean);
  const demoSquared = demoDeviations.map(d => d * d);
  const demoVariance = demoSquared.reduce((a, b) => a + b, 0) / demoData.length;
  const demoSD = Math.sqrt(demoVariance);
  const [step, setStep] = useState(0);

  const W2 = 460, H2 = 100, pad2 = { l: 30, r: 30, t: 15, b: 25 };
  const cw2 = W2 - pad2.l - pad2.r;
  const sc2 = v => pad2.l + ((v - 0) / 100) * cw2;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
        <strong>Standard deviation</strong> measures how spread out values are from the center. Let's build the intuition in two ways:
      </div>

      {/* Part 1: Dartboard */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>Part 1: Feel the spread</div>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "14px" }}>
        {[{ s: 0.4, label: "\u{1F3C6} Expert", desc: "Low SD" }, { s: 1, label: "\u{1F9D1} Average", desc: "Medium SD" }, { s: 2, label: "\u{1F64C} Beginner", desc: "High SD" }].map(opt => (
          <button key={opt.s} onClick={() => throwDarts(opt.s)} style={{
            padding: "8px 18px", borderRadius: "10px", border: "1.5px solid",
            borderColor: spread === opt.s ? C.smp : C.bdr,
            background: spread === opt.s ? C.smpBg : "transparent",
            color: spread === opt.s ? C.smp : C.txD,
            fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font,
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
          }}>
            <span>{opt.label}</span>
            <span style={{ fontSize: "10px", fontWeight: 400, opacity: 0.7 }}>{opt.desc}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "40px", alignItems: "center", flexWrap: "wrap" }}>
        <svg viewBox="-100 -100 200 200" style={{ width: "180px", height: "180px" }}>
          {[75, 50, 25].map(r => <circle key={r} cx="0" cy="0" r={r} fill="none" stroke={C.bdr} strokeWidth="1" />)}
          <circle cx="0" cy="0" r="3" fill={C.rose} />
          <line x1="-80" x2="80" y1="0" y2="0" stroke={C.grid} strokeWidth="0.5" />
          <line x1="0" x2="0" y1="-80" y2="80" stroke={C.grid} strokeWidth="0.5" />
          {darts.map((d, i) => {
            const cx = Math.max(-R, Math.min(R, d.x));
            const cy = Math.max(-R, Math.min(R, d.y));
            return <circle key={i} cx={cx} cy={cy} r="3.5" fill={C.smp} opacity="0.6">
              <animate attributeName="r" from="0" to="3.5" dur="0.3s" begin={`${i * 0.02}s`} fill="freeze" />
            </circle>;
          })}
        </svg>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: C.txM, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: mono, marginBottom: "6px" }}>Spread (SD)</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: C.smp, fontFamily: font }}>{sdVal.toFixed(1)}</div>
          <div style={{ width: "120px", height: "8px", borderRadius: "4px", background: C.bdr, margin: "10px auto 0", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (sdVal / 50) * 100)}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${C.grn}, ${C.pop}, ${C.rose})`, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: C.txM, fontFamily: mono, width: "120px", margin: "4px auto 0" }}><span>tight</span><span>spread</span></div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={() => throwDarts(spread)} style={{ padding: "7px 20px", borderRadius: "8px", border: `1.5px solid ${C.smp}`, background: C.smpBg, color: C.smp, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>&#127919; Throw Again</button>
      </div>

      {/* Part 2: How it's actually calculated */}
      <div style={{ borderTop: `1px solid ${C.bdr}`, marginTop: "24px", paddingTop: "20px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, marginBottom: "6px" }}>Part 2: How are variance &amp; SD actually computed?</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
          Let's walk through it step by step with 5 data points. Click "Next Step" to see each stage:
        </div>

        {/* Step controls */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          {["Data points", "Find the mean", "Measure distances", "Square the distances", "Average \u2192 Variance", "Square root \u2192 SD"].map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              padding: "5px 12px", borderRadius: "6px", border: "1.5px solid",
              borderColor: step === i ? C.smp : C.bdr,
              background: step === i ? C.smpBg : i <= step ? "rgba(124,58,237,0.03)" : "transparent",
              color: step === i ? C.smp : i <= step ? C.txB : C.txM,
              fontSize: "11px", fontWeight: step === i ? 700 : 500, cursor: "pointer", fontFamily: font,
            }}>{i + 1}. {s}</button>
          ))}
        </div>

        {/* Visual */}
        <svg viewBox={`0 0 ${W2} ${H2}`} style={{ width: "100%", maxWidth: "480px", display: "block", margin: "0 auto" }}>
          {/* axis */}
          <line x1={pad2.l} x2={W2 - pad2.r} y1="55" y2="55" stroke={C.bdr} strokeWidth="1.5" />
          {[0, 20, 40, 60, 80, 100].map(v => <text key={v} x={sc2(v)} y="72" textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}

          {/* Mean line (step >= 1) */}
          {step >= 1 && <>
            <line x1={sc2(demoMean)} x2={sc2(demoMean)} y1="15" y2="58" stroke={C.grn} strokeWidth="2" strokeDasharray="4,3" />
            <text x={sc2(demoMean)} y="11" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.grn} fontFamily={mono}>mean = {demoMean}</text>
          </>}

          {/* Distance lines (step >= 2) */}
          {step >= 2 && demoData.map((v, i) => (
            <line key={`dist-${i}`} x1={sc2(v)} x2={sc2(demoMean)} y1="42" y2="42"
              stroke={v < demoMean ? C.sam : C.rose} strokeWidth="2" opacity="0.5" strokeDasharray={step < 3 ? "0" : "3,2"} />
          ))}

          {/* Squared distance boxes (step >= 3) */}
          {step >= 3 && demoData.map((v, i) => {
            const dev = v - demoMean;
            const sqSize = Math.min(Math.sqrt(Math.abs(dev * dev)) * 0.55, 28);
            const cx = sc2(v);
            return <rect key={`sq-${i}`} x={cx - sqSize / 2} y={42 - sqSize - 3} width={sqSize} height={sqSize}
              fill={C.smp} opacity="0.2" stroke={C.smp} strokeWidth="1" rx="2" />;
          })}

          {/* Data points (always) */}
          {demoData.map((v, i) => (
            <g key={i}>
              <circle cx={sc2(v)} cy="42" r="8" fill={C.sam} stroke="#fff" strokeWidth="1.5" opacity="0.85" />
              <text x={sc2(v)} y="46" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily={mono}>{v}</text>
            </g>
          ))}
        </svg>

        {/* Step explanations */}
        <div style={{ background: C.bg, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB, minHeight: "80px" }}>
          {step === 0 && <div>Here are 5 data points: <strong>{demoData.join(", ")}</strong>. They represent, say, revenues of 5 firms. We want to measure how spread out they are.</div>}
          {step === 1 && <div>First, find the <strong style={{ color: C.grn }}>mean</strong>: ({demoData.join(" + ")}) / {demoData.length} = <strong style={{ color: C.grn }}>{demoMean}</strong>. This is our reference point &mdash; the center.</div>}
          {step === 2 && <div>
            Now measure how far each point is from the mean. These are <strong>deviations</strong>:<br/>
            {demoData.map((v, i) => <span key={i} style={{ fontFamily: mono, fontSize: "12px" }}>{v} &minus; {demoMean} = <strong style={{ color: demoDeviations[i] < 0 ? C.sam : C.rose }}>{demoDeviations[i] > 0 ? "+" : ""}{demoDeviations[i]}</strong>{i < demoData.length - 1 ? ", \u00A0" : ""}</span>)}
            <br/><span style={{ fontSize: "12px", color: C.txD }}>Notice: some are negative (left of mean) and some positive (right). They always sum to zero.</span>
          </div>}
          {step === 3 && <div>
            We can't just average the deviations (they'd cancel to zero). So we <strong>square</strong> each one to make them all positive. The purple boxes show the squared distances:<br/>
            {demoData.map((v, i) => <span key={i} style={{ fontFamily: mono, fontSize: "12px" }}>({demoDeviations[i]})<sup>2</sup> = <strong>{demoSquared[i]}</strong>{i < demoData.length - 1 ? ", \u00A0" : ""}</span>)}
            <br/><span style={{ fontSize: "12px", color: C.txD }}>Bigger deviations get amplified &mdash; a point twice as far away contributes 4x as much.</span>
          </div>}
          {step === 4 && <div>
            <strong style={{ color: C.smp }}>Variance</strong> = average of the squared deviations:<br/>
            <span style={{ fontFamily: mono, fontSize: "12px" }}>({demoSquared.join(" + ")}) / {demoData.length} = <strong style={{ color: C.smp }}>{demoVariance}</strong></span><br/>
            But here's the problem: variance is in <strong>squared units</strong>. If your data is in dollars, variance is in dollars<sup>2</sup>. That's hard to interpret!
          </div>}
          {step === 5 && <div>
            <strong style={{ color: C.smp }}>Standard deviation</strong> = square root of variance:<br/>
            <span style={{ fontFamily: mono, fontSize: "12px" }}>&radic;{demoVariance} = <strong style={{ color: C.smp }}>{demoSD.toFixed(1)}</strong></span><br/>
            Now we're back in the <strong>original units</strong>. SD = {demoSD.toFixed(1)} means "on average, each data point is about {demoSD.toFixed(0)} units away from the mean." That's interpretable!
            <div style={{ marginTop: "10px", padding: "10px 14px", background: C.smpBg, borderRadius: "8px", fontSize: "13px" }}>
              <strong>TL;DR:</strong> Variance and SD both measure spread. <strong>Variance</strong> = average squared distance from the mean (useful in math, hard to interpret). <strong>SD</strong> = square root of variance (back in original units, easy to interpret). SD is what you'll use and report in papers.
            </div>
          </div>}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: step === 0 ? C.txM : C.txB, fontSize: "12px", fontWeight: 600, cursor: step === 0 ? "default" : "pointer", fontFamily: font, opacity: step === 0 ? 0.5 : 1 }}>&larr; Back</button>
          <button onClick={() => setStep(s => Math.min(5, s + 1))} disabled={step === 5} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.smp}`, background: step === 5 ? "transparent" : C.smpBg, color: step === 5 ? C.txM : C.smp, fontSize: "12px", fontWeight: 600, cursor: step === 5 ? "default" : "pointer", fontFamily: font, opacity: step === 5 ? 0.5 : 1 }}>Next Step &rarr;</button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini visual: fishbowl ──────────────────────────────────────────
function FishBowl() {
  const fish = useMemo(() => Array.from({ length: 40 }, () => ({ x: 20 + Math.random() * 260, y: 30 + Math.random() * 90, size: 4 + Math.random() * 5, color: Math.random() < 0.6 ? C.pop : Math.random() < 0.5 ? C.sam : C.smp, delay: Math.random() * 3 })), []);
  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", margin: "20px 0" }}>
      <svg viewBox="0 0 300 140" style={{ width: "220px" }}>
        <ellipse cx="150" cy="75" rx="140" ry="60" fill={C.samLt} stroke={C.bdr} strokeWidth="1.5" />
        {fish.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.size} fill={f.color} opacity="0.5"><animate attributeName="cx" values={`${f.x};${f.x + 8};${f.x}`} dur={`${2 + f.delay}s`} repeatCount="indefinite" /></circle>)}
        <text x="150" y="130" textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font}>Population</text>
      </svg>
      <div style={{ fontSize: "28px", color: C.txM }}>&#8594;</div>
      <svg viewBox="0 0 120 100" style={{ width: "90px" }}>
        <rect x="10" y="10" width="100" height="70" rx="12" fill={C.popLt} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,3" />
        {fish.slice(0, 6).map((f, i) => <circle key={i} cx={25 + (i % 3) * 30} cy={30 + Math.floor(i / 3) * 28} r="8" fill={f.color} opacity="0.7" />)}
        <text x="60" y="95" textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font}>Sample (n=6)</text>
      </svg>
    </div>
  );
}

// ─── Distribution dot builder ───────────────────────────────────────
function DotDist() {
  const [dots, setDots] = useState([]);
  const add = () => { setDots(p => [...p.slice(-80), Math.max(5, Math.min(95, rNorm(50, 14)))]); };
  const bins = buildHist(dots, 20, [0, 100]);
  const mc = Math.max(...bins.map(b => b.count), 1);
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 400 120" style={{ width: "100%", maxWidth: "400px" }}>
        {bins.map((b, i) => { const bw = (b.width / 100) * 360; const bh = (b.count / mc) * 80; return <rect key={i} x={20 + ((b.x - b.width / 2) / 100) * 360} y={95 - bh} width={bw - 1} height={bh} fill={C.smp} opacity="0.35" rx="2" />; })}
        <line x1="20" y1="96" x2="380" y2="96" stroke={C.bdr} strokeWidth="1" />
        {[0, 25, 50, 75, 100].map(v => <text key={v} x={20 + (v / 100) * 360} y={112} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>
      <div style={{ marginTop: "8px" }}>
        <button onClick={add} style={{ padding: "6px 18px", borderRadius: "8px", border: `1px solid ${C.smp}`, background: C.smpBg, color: C.smp, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>+ Add data point ({dots.length})</button>
        {dots.length > 0 && <button onClick={() => setDots([])} style={{ padding: "6px 14px", borderRadius: "8px", border: `1px solid ${C.bdr}`, background: "transparent", color: C.txM, fontSize: "12px", marginLeft: "8px", cursor: "pointer", fontFamily: font }}>Clear</button>}
      </div>
      {dots.length >= 10 && <div style={{ fontSize: "12px", color: C.txD, marginTop: "8px", fontStyle: "italic" }}>A shape is emerging &mdash; that's the <strong>distribution</strong>.</div>}
    </div>
  );
}

// ─── 68-95-99.7 Rule Interactive ─────────────────────────────────────
function NormalRuleViz() {
  const [sdCount, setSdCount] = useState(1);
  const mu = 50, sigma = 15;
  const W = 500, H = 200, pad = { t: 30, r: 20, b: 40, l: 20 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sc = v => pad.l + ((v - 0) / 100) * cw;
  const pcts = { 1: "68%", 2: "95%", 3: "99.7%" };
  const colors = { 1: C.sam, 2: C.smp, 3: C.pop };
  const curve = [];
  for (let i = 0; i <= 200; i++) {
    const x = (i / 200) * 100;
    const y = Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
    curve.push({ x, y });
  }
  const maxY = Math.max(...curve.map(p => p.y));
  // Build the shaded area path
  const lo = Math.max(0, mu - sdCount * sigma), hi = Math.min(100, mu + sdCount * sigma);
  const shadedPts = curve.filter(p => p.x >= lo && p.x <= hi);
  const shadedPath = shadedPts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / maxY) * ch}`).join(" ")
    + ` L${sc(hi)},${pad.t + ch} L${sc(lo)},${pad.t + ch} Z`;
  const curvePath = curve.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / maxY) * ch}`).join(" ");

  return (
    <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh }}>
      {/* SD toggle */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => setSdCount(n)} style={{
            padding: "8px 20px", borderRadius: "10px", border: "1.5px solid",
            borderColor: sdCount === n ? colors[n] : C.bdr,
            background: sdCount === n ? `${colors[n]}11` : "transparent",
            color: sdCount === n ? colors[n] : C.txD,
            fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: font,
          }}>&plusmn;{n} SD &nbsp;<span style={{ fontWeight: 400, opacity: 0.7 }}>= {pcts[n]}</span></button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "520px", display: "block", margin: "0 auto" }}>
        {/* Shaded region */}
        <path d={shadedPath} fill={colors[sdCount]} opacity="0.15" />
        {/* Curve */}
        <path d={curvePath} fill="none" stroke={C.txD} strokeWidth="2" />
        {/* Mean line */}
        <line x1={sc(mu)} x2={sc(mu)} y1={pad.t} y2={pad.t + ch} stroke={C.grn} strokeWidth="1.5" strokeDasharray="4,3" />
        {/* SD boundary lines */}
        {[-sdCount, sdCount].map(m => {
          const xv = mu + m * sigma;
          if (xv < 0 || xv > 100) return null;
          return <line key={m} x1={sc(xv)} x2={sc(xv)} y1={pad.t} y2={pad.t + ch} stroke={colors[sdCount]} strokeWidth="1.5" strokeDasharray="4,3" />;
        })}
        {/* Arrow and label */}
        <line x1={sc(mu - sdCount * sigma)} x2={sc(mu + sdCount * sigma)} y1={pad.t + ch + 14} y2={pad.t + ch + 14} stroke={colors[sdCount]} strokeWidth="2" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
        <defs>
          <marker id="arrowL" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke={colors[sdCount]} strokeWidth="1.5" /></marker>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke={colors[sdCount]} strokeWidth="1.5" /></marker>
        </defs>
        <text x={sc(mu)} y={pad.t + ch + 28} textAnchor="middle" fontSize="13" fontWeight="700" fill={colors[sdCount]} fontFamily={font}>{pcts[sdCount]} of data</text>
        {/* Labels */}
        <text x={sc(mu)} y={pad.t - 8} textAnchor="middle" fontSize="10" fill={C.grn} fontFamily={mono} fontWeight="600">&#956;</text>
        {sdCount >= 1 && <><text x={sc(mu - sigma)} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>-1SD</text><text x={sc(mu + sigma)} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>+1SD</text></>}
        {sdCount >= 2 && <><text x={sc(mu - 2 * sigma)} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>-2SD</text><text x={sc(mu + 2 * sigma)} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>+2SD</text></>}
        {sdCount >= 3 && <><text x={sc(Math.max(5, mu - 3 * sigma))} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>-3SD</text><text x={sc(Math.min(95, mu + 3 * sigma))} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>+3SD</text></>}
      </svg>

      <div style={{ background: C.bg, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {sdCount === 1 && <div><strong style={{ color: C.sam }}>68%</strong> of data falls within &plusmn;1 SD of the mean. If the average firm revenue is $50M with SD = $15M, then about 68% of firms have revenue between <strong>$35M and $65M</strong>. Roughly two-thirds of your data lives in this band.</div>}
        {sdCount === 2 && <div><strong style={{ color: C.smp }}>95%</strong> of data falls within &plusmn;2 SD. In our example, that's between <strong>$20M and $80M</strong>. This is why 2 SD is so important in statistics &mdash; it's the basis for 95% confidence intervals. Values beyond &plusmn;2 SD are genuinely unusual (only 5%).</div>}
        {sdCount === 3 && <div><strong style={{ color: C.pop }}>99.7%</strong> of data falls within &plusmn;3 SD. Virtually everything. A value beyond 3 SD from the mean is extremely rare &mdash; it's a strong signal that something unusual is happening. In quality control, this is where "six sigma" gets its name.</div>}
      </div>

      <div style={{ marginTop: "12px", fontSize: "13px", color: C.txD, lineHeight: 1.7 }}>
        <strong>Why this matters:</strong> When you later learn about p-values and confidence intervals, they're built on exactly this logic. A result that's 2+ SD away from the expected value under the null hypothesis? That's in the 5% tail &mdash; we call it "statistically significant."
      </div>
    </div>
  );
}

// ─── SE Comparison: side by side ────────────────────────────────────
function SECompareViz({ popType }) {
  const [meansA, setMeansA] = useState([]);
  const [meansB, setMeansB] = useState([]);
  const nA = 5, nB = 50;
  const refA = useRef([]), refB = useRef([]);
  const runRef = useRef(null);
  const [running, setRunning] = useState(false);
  const tm = TM[popType];

  const reset = useCallback(() => {
    if (runRef.current) clearInterval(runRef.current);
    setRunning(false); setMeansA([]); setMeansB([]); refA.current = []; refB.current = [];
  }, []);

  useEffect(() => { reset(); }, [popType, reset]);
  useEffect(() => () => { if (runRef.current) clearInterval(runRef.current); }, []);

  const draw = useCallback(() => {
    const sA = samplePop(popType, nA), sB = samplePop(popType, nB);
    refA.current = [...refA.current, sA.reduce((a, b) => a + b, 0) / sA.length];
    refB.current = [...refB.current, sB.reduce((a, b) => a + b, 0) / sB.length];
    setMeansA([...refA.current]); setMeansB([...refB.current]);
  }, [popType]);

  const draw100 = useCallback(() => { for (let i = 0; i < 100; i++) { const sA = samplePop(popType, nA), sB = samplePop(popType, nB); refA.current.push(sA.reduce((a, b) => a + b, 0) / sA.length); refB.current.push(sB.reduce((a, b) => a + b, 0) / sB.length); } setMeansA([...refA.current]); setMeansB([...refB.current]); }, [popType]);

  const toggle = useCallback(() => {
    if (running) { clearInterval(runRef.current); setRunning(false); }
    else { setRunning(true); runRef.current = setInterval(() => {
      const sA = samplePop(popType, nA), sB = samplePop(popType, nB);
      refA.current.push(sA.reduce((a, b) => a + b, 0) / sA.length);
      refB.current.push(sB.reduce((a, b) => a + b, 0) / sB.length);
      setMeansA([...refA.current]); setMeansB([...refB.current]);
    }, 80); }
  }, [running, popType]);

  const calcSE = (arr) => {
    if (arr.length < 2) return null;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
  };
  const seA = calcSE(meansA), seB = calcSE(meansB);

  const MiniHist = ({ means, color, label, n, se: seVal }) => {
    if (!means.length) return null;
    const mn = Math.min(...means, tm - 30), mx = Math.max(...means, tm + 30);
    const range = [Math.floor(mn / 5) * 5, Math.ceil(mx / 5) * 5];
    const bins = buildHist(means, 40, range), mc = Math.max(...bins.map(b => b.count), 1);
    const W = 320, H = 130, p = { t: 12, r: 10, b: 24, l: 10 }, cw2 = W - p.l - p.r, ch2 = H - p.t - p.b;
    const tmx = p.l + ((tm - range[0]) / (range[1] - range[0])) * cw2;
    const step = (range[1] - range[0]) <= 30 ? 5 : 10, ticks = [];
    for (let v = Math.ceil(range[0] / step) * step; v <= range[1]; v += step) ticks.push(v);
    // SE bands
    const se1L = p.l + ((tm - (seVal||0) - range[0]) / (range[1] - range[0])) * cw2;
    const se1R = p.l + ((tm + (seVal||0) - range[0]) / (range[1] - range[0])) * cw2;
    const se2L = p.l + ((tm - 2*(seVal||0) - range[0]) / (range[1] - range[0])) * cw2;
    const se2R = p.l + ((tm + 2*(seVal||0) - range[0]) / (range[1] - range[0])) * cw2;
    return (
      <div style={{ flex: 1, minWidth: "260px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: mono }}>{label} (n = {n})</div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono }}>{means.length} samples</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
          {/* SE bands */}
          {seVal && <><rect x={se2L} y={p.t} width={se2R - se2L} height={ch2} fill={color} opacity="0.06" rx="2" /><rect x={se1L} y={p.t} width={se1R - se1L} height={ch2} fill={color} opacity="0.08" rx="2" /></>}
          {ticks.map(v => <line key={v} x1={p.l + ((v - range[0]) / (range[1] - range[0])) * cw2} x2={p.l + ((v - range[0]) / (range[1] - range[0])) * cw2} y1={p.t} y2={p.t + ch2} stroke={C.grid} strokeWidth="1" />)}
          {bins.map((b, i) => { const bw = (b.width / (range[1] - range[0])) * cw2, bh = (b.count / mc) * ch2; return <rect key={i} x={p.l + ((b.x - b.width / 2 - range[0]) / (range[1] - range[0])) * cw2} y={p.t + ch2 - bh} width={Math.max(bw - 1, 1)} height={bh} fill={color} opacity="0.4" rx="1" />; })}
          <line x1={tmx} x2={tmx} y1={p.t} y2={p.t + ch2} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,3" />
          {seVal && <><line x1={se1L} x2={se1L} y1={p.t} y2={p.t + ch2} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" /><line x1={se1R} x2={se1R} y1={p.t} y2={p.t + ch2} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" /></>}
          {ticks.map(v => <text key={v} x={p.l + ((v - range[0]) / (range[1] - range[0])) * cw2} y={H - 3} textAnchor="middle" fill={C.txM} fontSize="9" fontFamily={mono}>{v}</text>)}
        </svg>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "6px" }}>
          <div style={{ background: C.bg, borderRadius: "6px", padding: "6px 12px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>SE</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color, fontFamily: font }}>{seVal ? seVal.toFixed(2) : "\u2014"}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh }}>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
        <strong>Standard Error = the SD of the sampling distribution.</strong> It tells you how spread out sample means are. Below, the same experiment runs at two sample sizes simultaneously. The shaded bands show &plusmn;1 SE (dark) and &plusmn;2 SE (light). Watch how a larger n produces a <em>tighter</em> distribution:
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <AB onClick={draw} primary label="Draw 1 Pair" />
        <AB onClick={draw100} label="Draw 100 Pairs" />
        <AB onClick={toggle} label={running ? "\u23F8 Stop" : "\u25B6 Auto-Run"} danger={running} />
        <AB onClick={reset} label="Reset" muted />
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <MiniHist means={meansA} color={C.rose} label="SMALL SAMPLE" n={nA} se={seA} />
        <MiniHist means={meansB} color={C.sam} label="LARGE SAMPLE" n={nB} se={seB} />
      </div>
      {meansA.length >= 30 && seA && seB && (
        <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.4s ease" }}>
          <span style={{ fontWeight: 700, color: C.grn, marginRight: "4px" }}>&#128161;</span>
          With n = {nA}, SE = <strong style={{ color: C.rose }}>{seA.toFixed(2)}</strong>.
          With n = {nB}, SE = <strong style={{ color: C.sam }}>{seB.toFixed(2)}</strong>.
          The larger sample gives an SE that's roughly <strong>{(seA / seB).toFixed(1)}x smaller</strong> &mdash; meaning your estimate of the mean is {(seA / seB).toFixed(1)}x more precise.
          {" "}This is why sample size matters: it doesn't change <em>what</em> you're estimating, but it changes <em>how precisely</em> you estimate it.
        </div>
      )}
    </div>
  );
}

// ─── Sandbox charts ─────────────────────────────────────────────────
function PopChart({ type, cs }) {
  const curve = popCurve(type);
  const W = 540, H = 170, p = { t: 16, r: 16, b: 28, l: 16 }, cw = W - p.l - p.r, ch = H - p.t - p.b;
  const pathD = curve.map((pt, i) => `${i === 0 ? "M" : "L"}${p.l + (pt.x / 100) * cw},${p.t + ch - pt.y * ch}`).join(" ");
  return (<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
    {[0, 25, 50, 75, 100].map(v => <line key={v} x1={p.l + (v / 100) * cw} x2={p.l + (v / 100) * cw} y1={p.t} y2={p.t + ch} stroke={C.grid} strokeWidth="1" />)}
    <path d={pathD + ` L${p.l + cw},${p.t + ch} L${p.l},${p.t + ch} Z`} fill={C.popBg} />
    <path d={pathD} fill="none" stroke={C.pop} strokeWidth="2.5" strokeLinejoin="round" />
    {cs && cs.map((v, i) => <circle key={i} cx={p.l + (Math.max(0, Math.min(100, v)) / 100) * cw} cy={p.t + ch - 6} r="3.5" fill={C.sam} opacity="0.8" style={{ animation: `popIn 0.3s ease ${i * 0.008}s both` }} />)}
    {[0, 25, 50, 75, 100].map(v => <text key={v} x={p.l + (v / 100) * cw} y={H - 4} textAnchor="middle" fill={C.txM} fontSize="10" fontFamily={mono}>{v}</text>)}
  </svg>);
}
function SamHist({ sample }) {
  if (!sample?.length) return null;
  const bins = buildHist(sample, 30, [0, 100]), mc = Math.max(...bins.map(b => b.count), 1);
  const W = 540, H = 120, p = { t: 8, r: 16, b: 24, l: 16 }, cw = W - p.l - p.r, ch = H - p.t - p.b;
  return (<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
    {bins.map((b, i) => { const bw = (b.width / 100) * cw, bh = (b.count / mc) * ch; return <rect key={i} x={p.l + ((b.x - b.width / 2) / 100) * cw} y={p.t + ch - bh} width={bw - 1} height={bh} fill={C.sam} opacity="0.45" rx="1" style={{ animation: `growUp 0.35s ease ${i * 0.008}s both` }} />; })}
    {[0, 25, 50, 75, 100].map(v => <text key={v} x={p.l + (v / 100) * cw} y={H - 3} textAnchor="middle" fill={C.txM} fontSize="10" fontFamily={mono}>{v}</text>)}
  </svg>);
}
function SmpDist({ means, trueMean }) {
  if (!means.length) return null;
  const mn = Math.min(...means, 0), mx = Math.max(...means, 100), range = [Math.floor(mn / 5) * 5, Math.ceil(mx / 5) * 5];
  const bins = buildHist(means, 50, range), mc = Math.max(...bins.map(b => b.count), 1);
  const W = 540, H = 190, p = { t: 14, r: 16, b: 28, l: 16 }, cw = W - p.l - p.r, ch = H - p.t - p.b;
  const gm = means.reduce((a, b) => a + b, 0) / means.length;
  const gmx = p.l + ((gm - range[0]) / (range[1] - range[0])) * cw;
  const tmx = p.l + ((trueMean - range[0]) / (range[1] - range[0])) * cw;
  const step = (range[1] - range[0]) <= 30 ? 5 : 10, ticks = [];
  for (let v = Math.ceil(range[0] / step) * step; v <= range[1]; v += step) ticks.push(v);
  // Compute SE for bands
  const seVal = means.length > 1 ? Math.sqrt(means.reduce((s, m) => s + (m - gm) ** 2, 0) / (means.length - 1)) : null;
  const band = (nSE) => {
    if (!seVal) return {};
    return {
      l: p.l + ((gm - nSE * seVal - range[0]) / (range[1] - range[0])) * cw,
      r: p.l + ((gm + nSE * seVal - range[0]) / (range[1] - range[0])) * cw,
    };
  };
  const b1 = band(1), b2 = band(2);
  return (<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
    {/* SE bands (show once we have 30+ samples) */}
    {seVal && means.length >= 30 && <>
      <rect x={b2.l} y={p.t} width={b2.r - b2.l} height={ch} fill={C.smp} opacity="0.06" rx="2" />
      <rect x={b1.l} y={p.t} width={b1.r - b1.l} height={ch} fill={C.smp} opacity="0.08" rx="2" />
      <line x1={b1.l} x2={b1.l} y1={p.t} y2={p.t + ch} stroke={C.smp} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <line x1={b1.r} x2={b1.r} y1={p.t} y2={p.t + ch} stroke={C.smp} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <text x={b1.l - 2} y={p.t + 10} textAnchor="end" fontSize="8" fill={C.smp} fontFamily={mono} opacity="0.6">-1 SE</text>
      <text x={b1.r + 2} y={p.t + 10} textAnchor="start" fontSize="8" fill={C.smp} fontFamily={mono} opacity="0.6">+1 SE</text>
      <line x1={b2.l} x2={b2.l} y1={p.t} y2={p.t + ch} stroke={C.smp} strokeWidth="1" strokeDasharray="2,4" opacity="0.25" />
      <line x1={b2.r} x2={b2.r} y1={p.t} y2={p.t + ch} stroke={C.smp} strokeWidth="1" strokeDasharray="2,4" opacity="0.25" />
      <text x={b2.l - 2} y={p.t + 10} textAnchor="end" fontSize="8" fill={C.smp} fontFamily={mono} opacity="0.4">-2 SE</text>
      <text x={b2.r + 2} y={p.t + 10} textAnchor="start" fontSize="8" fill={C.smp} fontFamily={mono} opacity="0.4">+2 SE</text>
    </>}
    {ticks.map(v => <line key={v} x1={p.l + ((v - range[0]) / (range[1] - range[0])) * cw} x2={p.l + ((v - range[0]) / (range[1] - range[0])) * cw} y1={p.t} y2={p.t + ch} stroke={C.grid} strokeWidth="1" />)}
    {bins.map((b, i) => { const bw = (b.width / (range[1] - range[0])) * cw, bh = (b.count / mc) * ch; return <rect key={i} x={p.l + ((b.x - b.width / 2 - range[0]) / (range[1] - range[0])) * cw} y={p.t + ch - bh} width={Math.max(bw - 1, 1)} height={bh} fill={C.smp} opacity="0.4" rx="1" />; })}
    <line x1={tmx} x2={tmx} y1={p.t} y2={p.t + ch} stroke={C.pop} strokeWidth="2" strokeDasharray="6,3" />
    <text x={tmx} y={p.t - 3} textAnchor="middle" fill={C.pop} fontSize="9" fontFamily={mono} fontWeight="600">&#956; = {trueMean.toFixed(1)}</text>
    {means.length > 1 && <><line x1={gmx} x2={gmx} y1={p.t} y2={p.t + ch} stroke={C.grn} strokeWidth="2" /><text x={gmx} y={H - p.b + 18} textAnchor="middle" fill={C.grn} fontSize="9" fontFamily={mono} fontWeight="600">x&#772; = {gm.toFixed(2)}</text></>}
    {ticks.map(v => <text key={v} x={p.l + ((v - range[0]) / (range[1] - range[0])) * cw} y={H - 3} textAnchor="middle" fill={C.txM} fontSize="10" fontFamily={mono}>{v}</text>)}
  </svg>);
}

// ─── Main ───────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("why");
  const [popType, setPopType] = useState("normal");
  const [ss, setSs] = useState(30);
  const [cs, setCs] = useState(null);
  const [means, setMeans] = useState([]);
  const [run, setRun] = useState(false);
  const iRef = useRef(null), mRef = useRef([]);
  const tm = TM[popType];
  const reset = useCallback(() => { if (iRef.current) clearInterval(iRef.current); setRun(false); setCs(null); setMeans([]); mRef.current = []; }, []);
  useEffect(() => { reset(); }, [popType, ss, reset]);
  const d1 = useCallback(() => { const s = samplePop(popType, ss), m = s.reduce((a, b) => a + b, 0) / s.length; setCs(s); mRef.current = [...mRef.current, m]; setMeans([...mRef.current]); }, [popType, ss]);
  const d100 = useCallback(() => { for (let i = 0; i < 100; i++) { const s = samplePop(popType, ss), m = s.reduce((a, b) => a + b, 0) / s.length; if (i === 99) setCs(s); mRef.current = [...mRef.current, m]; } setMeans([...mRef.current]); }, [popType, ss]);
  const tog = useCallback(() => { if (run) { clearInterval(iRef.current); setRun(false); } else { setRun(true); iRef.current = setInterval(() => { const s = samplePop(popType, ss), m = s.reduce((a, b) => a + b, 0) / s.length; setCs(s); mRef.current = [...mRef.current, m]; setMeans([...mRef.current]); }, 80); } }, [run, popType, ss]);
  useEffect(() => () => { if (iRef.current) clearInterval(iRef.current); }, []);
  const gm = means.length > 0 ? (means.reduce((a, b) => a + b, 0) / means.length).toFixed(2) : "\u2014";
  const se = means.length > 1 ? Math.sqrt(means.reduce((s, m) => s + (m - parseFloat(gm)) ** 2, 0) / (means.length - 1)).toFixed(2) : "\u2014";

  const TABS = [{ id: "why", label: "1. Why Sample?" }, { id: "what", label: "2. Key Concepts" }, { id: "dist", label: "3. Distributions" }, { id: "sandbox", label: "4. Sandbox" }];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:.8}}
        @keyframes growUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 1 &middot; Statistical Reasoning</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Sampling &amp; Distributions</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>Before learning any statistical method, you need to understand <em>why</em> we collect data the way we do, and how repeated sampling reveals deep patterns.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* ═══ TAB 1: WHY SAMPLE ═══ */}
        {tab === "why" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Why can't we just study everyone?" sub="The fundamental reason statistics exists" />
          <Pr>Imagine you want to know the average height of all adults in Singapore &mdash; roughly 4.5 million people. You <em>could</em> measure every single person. But that would take years and cost a fortune. So instead, you measure a small group and use it to make inferences about the whole.</Pr>
          <Pr>That small group is called a <strong>sample</strong>. The entire group you care about is the <strong>population</strong>. The entire field of statistics is the science of drawing reliable conclusions about populations from samples.</Pr>
          <FishBowl />
          <Anl>Think of tasting soup. You don't drink the whole pot to check if it's salty enough &mdash; you stir well and taste one spoonful. The pot is your population. The spoonful is your sample. Stirring well is <strong>random sampling</strong> &mdash; making sure your spoonful represents the whole pot.</Anl>
          <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "16px 20px", marginTop: "20px", fontSize: "14px", lineHeight: 1.7, color: C.txB }}>
            <strong style={{ color: C.pop }}>Why this matters for research:</strong> Every study you'll ever read is working with a sample and trying to say something about a larger population. Understanding that gap is where all of statistics lives.
          </div>
          <NB onClick={() => setTab("what")} label="Next: Key Concepts &#8594;" />
        </div>}

        {/* ═══ TAB 2: KEY CONCEPTS (interactive) ═══ */}
        {tab === "what" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="The building blocks" sub="Four ideas you need &mdash; learn them by playing, not reading" />

          <CBox title={<><span style={{ fontSize: "18px" }}>&#128202;</span> Variable</>} color={C.sam}>
            <VariableViz />
          </CBox>

          <CBox title={<><span style={{ fontSize: "18px" }}>&#128207;</span> Statistic vs. Parameter</>} color={C.pop}>
            <StatParamViz />
          </CBox>

          <CBox title={<><span style={{ fontSize: "18px" }}>&#9878;&#65039;</span> Mean (Average)</>} color={C.grn}>
            <MeanViz />
          </CBox>

          <CBox title={<><span style={{ fontSize: "18px" }}>&#127919;</span> Variance &amp; Standard Deviation</>} color={C.smp}>
            <VarianceViz />
          </CBox>

          <Anl>Here's how mean and SD work together: the mean tells you <em>where</em> the center is (the bullseye). The SD tells you <em>how clustered</em> things are around that center. Two datasets can have the same mean but wildly different SDs &mdash; just like two dart players can aim at the same spot but with very different precision.</Anl>
          <NB onClick={() => setTab("dist")} label="Next: Distributions &#8594;" />
        </div>}

        {/* ═══ TAB 3: DISTRIBUTIONS ═══ */}
        {tab === "dist" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="What is a distribution?" sub="The shape of possibility" />
          <Pr>A <strong>distribution</strong> describes the pattern of how values are spread out. When you plot data, you see a <em>shape</em>. Some values are common (tall bars), others are rare (short bars). That shape is the distribution.</Pr>
          <Pr>Click below to add data points one at a time. Watch a shape emerge from randomness:</Pr>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px", margin: "16px 0 20px", boxShadow: C.sh }}><DotDist /></div>
          <Pr>With few points it looks random. Add more, and a pattern appears. This is a core insight: <strong>distributions are patterns that emerge from randomness</strong>. Individual observations are unpredictable; collectively they form reliable shapes.</Pr>
          <div style={{ fontWeight: 700, fontSize: "15px", margin: "20px 0 12px" }}>Common distribution shapes</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {POPS.map(pp => {
              const curve = popCurve(pp.id);
              return (<div key={pp.id} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
                <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>{pp.label}</div>
                <div style={{ fontSize: "12px", color: C.txD, marginBottom: "8px" }}>{pp.desc}</div>
                <svg viewBox="0 0 200 60" style={{ width: "100%" }}>
                  <path d={curve.map((pt, i) => `${i ? "L" : "M"}${(pt.x / 100) * 200},${55 - pt.y * 45}`).join(" ") + " L200,55 L0,55 Z"} fill={C.popBg} />
                  <path d={curve.map((pt, i) => `${i ? "L" : "M"}${(pt.x / 100) * 200},${55 - pt.y * 45}`).join(" ")} fill="none" stroke={C.pop} strokeWidth="2" />
                </svg>
              </div>);
            })}
          </div>
          <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "16px 20px", marginTop: "20px", fontSize: "14px", lineHeight: 1.7, color: C.txB }}>
            <strong style={{ color: C.smp }}>The big idea ahead:</strong> What if you take many samples and plot the <em>means</em>? You get a <strong>sampling distribution</strong>. It tends toward a bell shape <em>regardless of the population's shape</em>. That's the Central Limit Theorem &mdash; and you're about to see it live.
          </div>

          {/* 68-95-99.7 Rule */}
          <div style={{ marginTop: "32px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>The 68-95-99.7 Rule</div>
            <Pr>For a normal distribution, the SD tells you <em>exactly</em> how much data falls within certain ranges of the mean. This is one of the most useful facts in all of statistics:</Pr>
            <NormalRuleViz />
          </div>
          <NB onClick={() => setTab("sandbox")} label="Next: Try It Yourself &#8594;" />
        </div>}

        {/* ═══ TAB 4: SANDBOX ═══ */}
        {tab === "sandbox" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="The sampling distribution sandbox" sub="Draw samples, watch the Central Limit Theorem in action" />
          <Pr>Pick a population shape and sample size. Draw repeated samples. Each time, we compute the sample mean and add it to a histogram. Watch what shape forms &mdash; even when the population isn't normal.</Pr>

          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", marginBottom: "16px", boxShadow: C.sh }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "11px", color: C.txM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: mono }}>Population Shape</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {POPS.map(pp => <button key={pp.id} onClick={() => setPopType(pp.id)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1.5px solid", borderColor: popType === pp.id ? C.pop : C.bdr, background: popType === pp.id ? C.popBg : "transparent", color: popType === pp.id ? C.pop : C.txD, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{pp.label}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: C.txM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: mono }}>Sample Size (n)</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {SIZES.map(n => <button key={n} onClick={() => setSs(n)} style={{ padding: "7px 12px", borderRadius: "8px", border: "1.5px solid", borderColor: ss === n ? C.sam : C.bdr, background: ss === n ? C.samBg : "transparent", color: ss === n ? C.sam : C.txD, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: mono }}>{n}</button>)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <AB onClick={d1} primary label="Draw 1 Sample" />
              <AB onClick={d100} label="Draw 100" />
              <AB onClick={tog} label={run ? "\u23F8 Stop" : "\u25B6 Auto-Run"} danger={run} />
              <AB onClick={reset} label="Reset" muted />
            </div>
          </div>

          <Pnl color={C.pop} label="POPULATION" right={`${POPS.find(p => p.id === popType)?.desc} \u00B7 \u03BC = ${tm}`}>
            <PopChart type={popType} cs={cs} />
            {cs && <div style={{ fontSize: "11px", color: C.txD, marginTop: "2px", fontFamily: mono }}>&uarr; Blue dots = your current sample of n = {ss}</div>}
          </Pnl>

          {cs && <Pnl color={C.sam} label="CURRENT SAMPLE" right={`x\u0304 = ${(cs.reduce((a, b) => a + b, 0) / cs.length).toFixed(2)}`}><SamHist sample={cs} /></Pnl>}

          {means.length > 0 && <Pnl color={C.smp} label={`SAMPLING DISTRIBUTION OF x\u0304`} right={`${means.length} sample${means.length !== 1 ? "s" : ""}`} highlight running={run}>
            <SmpDist means={means} trueMean={tm} />
            <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
              <SC label="Samples" value={means.length} color={C.smp} />
              <SC label="Grand Mean" value={gm} color={C.grn} />
              <SC label="True &#956;" value={tm} color={C.pop} />
              <SC label="SE of x&#772;" value={se} />
            </div>
          </Pnl>}

          <Ins visible={means.length >= 3 && means.length < 30}><strong>Getting started.</strong> Each purple bar is one sample mean. They cluster near &#956; = {tm} (dashed amber). Keep drawing to see a pattern emerge.</Ins>
          <Ins visible={means.length >= 30 && means.length < 200}><strong>A shape is forming &mdash; and notice the shaded bands.</strong> The inner band (&plusmn;1 SE) captures about 68% of sample means; the outer band (&plusmn;2 SE) captures about 95%. <strong>SE is literally the SD of this purple histogram</strong> &mdash; it measures how much sample means vary from sample to sample. This is the <strong>Central Limit Theorem</strong> in action. Try changing n to see the bands get narrower.</Ins>
          <Ins visible={means.length >= 200}><strong>CLT in full effect.</strong> The sampling distribution is normal, and the SE bands show it clearly. SE = {se} means a typical sample mean falls about {se} units from &#956;.{ss < 30 ? " Try n = 30+ to watch the bands tighten." : " Try n = 2 to see the bands spread wide."} The shaded bands work exactly like the 68-95-99.7 rule you saw earlier &mdash; except now applied to sample means, not individual data points.</Ins>

          {/* SE Comparison: side by side n=5 vs n=50 */}
          <div style={{ marginTop: "28px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Why does sample size matter?</div>
            <Pr>Standard error tells you how precise your estimates are. But what controls the SE? <strong>Sample size.</strong> Below, the same population is sampled at n=5 and n=50 simultaneously. Watch the difference:</Pr>
            <SECompareViz popType={popType} />
          </div>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Every statistic has a <strong>sampling distribution</strong> &mdash; the pattern from infinitely many samples.<br />
              <strong>2.</strong> The <strong>standard error</strong> is the SD of that distribution &mdash; you can <em>see</em> it as the width of the purple histogram. Narrower = more precise.<br />
              <strong>3.</strong> The <strong>Central Limit Theorem</strong> says the sampling distribution approaches normality regardless of population shape, so the 68-95-99.7 rule applies to it.<br />
              <strong>4.</strong> <strong>Larger samples &rarr; smaller SE &rarr; tighter bands</strong>. This is why sample size is the primary lever for statistical power.<br />
              <strong>5.</strong> This is the foundation of <em>all</em> inference &mdash; p-values ask "is my result in the tails of the sampling distribution?" and confidence intervals use &plusmn;2 SE to build a range.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
