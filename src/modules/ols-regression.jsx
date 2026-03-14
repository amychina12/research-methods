import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function normalPDF(x, mu = 0, s = 1) {
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / s) ** 2);
}
function linReg(pts) {
  const n = pts.length;
  if (n < 2) return { b0: 0, b1: 0, r2: 0, residuals: [], se_b1: 0, t: 0, p: 1 };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const ssxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const b1 = ssxx > 0 ? ssxy / ssxx : 0;
  const b0 = my - b1 * mx;
  const residuals = pts.map(p => p.y - (b0 + b1 * p.x));
  const ssr = residuals.reduce((s, r) => s + r ** 2, 0);
  const sst = pts.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const r2 = sst > 0 ? 1 - ssr / sst : 0;
  const mse = n > 2 ? ssr / (n - 2) : 0;
  const se_b1 = ssxx > 0 ? Math.sqrt(mse / ssxx) : 0;
  const t = se_b1 > 0 ? b1 / se_b1 : 0;
  // approx p
  const df = n - 2;
  const p = df > 0 ? Math.min(1, 2 * Math.exp(-0.717 * Math.abs(t) - 0.416 * t * t / df)) : 1;
  return { b0, b1, r2, residuals, se_b1, t, p, mse, n: pts.length, ssr, sst, mx, my };
}
function generateData(n, b0, b1, noise, pattern = "linear") {
  return Array.from({ length: n }, () => {
    const x = Math.random() * 80 + 10;
    let y;
    if (pattern === "linear") y = b0 + b1 * x + rNorm(0, noise);
    else if (pattern === "curved") y = b0 + b1 * x + 0.01 * (x - 50) ** 2 + rNorm(0, noise);
    else if (pattern === "heteroskedastic") y = b0 + b1 * x + rNorm(0, noise * (x / 50));
    else if (pattern === "outliers") {
      y = b0 + b1 * x + rNorm(0, noise);
      if (Math.random() < 0.08) y += (Math.random() < 0.5 ? 1 : -1) * noise * 4;
    }
    else if (pattern === "skewed") {
      // Skewed errors: exponential-ish, shifted to have mean ~0
      const raw = Math.pow(Math.random(), 0.3) * noise * 2 - noise * 0.7;
      y = b0 + b1 * x + raw;
    }
    else y = b0 + b1 * x + rNorm(0, noise);
    return { x, y };
  });
}

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
const font = "'DM Sans', sans-serif", mono = "'DM Mono', monospace", serif = "'Source Serif 4', serif";

// ─── Shared UI ──────────────────────────────────────────────────────
function SH({ number, title, sub }) {
  return (<div style={{ marginBottom: "22px" }}>
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.smp, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.sam }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ─── SVG scatter helper ─────────────────────────────────────────────
function ScatterSVG({ pts, reg, W = 540, H = 340, showResiduals = false, showSquares = false, manualLine = null, xLabel = "X", yLabel = "Y", autoRange = false }) {
  const pad = { t: 20, r: 20, b: 36, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  // Auto-detect range from data or use fixed 0-100
  const xVals = pts.map(p => p.x);
  const yVals = pts.map(p => p.y);
  const xMinD = Math.min(...xVals), xMaxD = Math.max(...xVals);
  const yMinD = Math.min(...yVals), yMaxD = Math.max(...yVals);
  const xPad = (xMaxD - xMinD) * 0.1 || 5;
  const yPad = (yMaxD - yMinD) * 0.1 || 5;
  const xMin = autoRange ? Math.floor((xMinD - xPad) / 5) * 5 : 0;
  const xMax = autoRange ? Math.ceil((xMaxD + xPad) / 5) * 5 : 100;
  const yMin = autoRange ? Math.floor((yMinD - yPad) / 5) * 5 : Math.min(...yVals, 0) - 5;
  const yMax = autoRange ? Math.ceil((yMaxD + yPad) / 5) * 5 : Math.max(...yVals, 100) + 5;

  const sx = v => pad.l + ((v - xMin) / (xMax - xMin)) * cw;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const line = manualLine || reg;
  const yAt = x => line.b0 + line.b1 * x;

  // Generate ticks
  const xRange = xMax - xMin;
  const xTickStep = autoRange ? Math.max(1, Math.round(xRange / 5 / 5) * 5) || 5 : 20;
  const xTicks = [];
  for (let v = Math.ceil(xMin / xTickStep) * xTickStep; v <= xMax; v += xTickStep) xTicks.push(v);
  const yRange = yMax - yMin;
  const yStep = Math.max(1, Math.round(yRange / 5 / 5) * 5) || 10;
  const yTicks = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      {/* Grid */}
      {xTicks.map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
      {yTicks.map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

      {/* Squared residuals */}
      {showSquares && pts.map((p, i) => {
        const predicted = yAt(p.x);
        const res = Math.abs(p.y - predicted);
        const size = Math.abs(sy(predicted) - sy(predicted + res));
        const top = Math.min(sy(p.y), sy(predicted));
        return <rect key={`sq${i}`} x={sx(p.x)} y={top} width={size} height={size} fill={C.rose} opacity="0.1" stroke={C.rose} strokeWidth="0.5" />;
      })}

      {/* Residual lines */}
      {showResiduals && pts.map((p, i) => (
        <line key={`r${i}`} x1={sx(p.x)} x2={sx(p.x)} y1={sy(p.y)} y2={sy(yAt(p.x))} stroke={C.rose} strokeWidth="1.5" opacity="0.5" strokeDasharray="3,2" />
      ))}

      {/* Regression line */}
      {line && <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(yAt(xMin))} y2={sy(yAt(xMax))} stroke={C.smp} strokeWidth="2.5" />}

      {/* Points */}
      {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill={C.sam} opacity="0.7" stroke="#fff" strokeWidth="1" />)}

      {/* Axes */}
      {xTicks.map(v => <text key={`xl${v}`} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      {yTicks.map(v => <text key={`yl${v}`} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      <text x={sx(50)} y={H - 0} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>{xLabel}</text>
      <text x="10" y={sy((yMin + yMax) / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${sy((yMin + yMax) / 2)})`}>{yLabel}</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: INTUITION
// ═══════════════════════════════════════════════════════════════════
function IntuitionViz() {
  const [noise, setNoise] = useState(10);
  const [slope, setSlope] = useState(0.6);

  // Generate stable X values and error terms ONCE
  const base = useMemo(() => Array.from({ length: 40 }, () => ({
    x: Math.random() * 80 + 10,
    err: rNorm(0, 1), // standard normal error, scaled by noise later
  })), []);

  // Compute Y from current slope and noise, using the same base errors
  const pts = useMemo(() => base.map(b => ({
    x: b.x,
    y: 20 + slope * b.x + b.err * noise,
  })), [base, slope, noise]);

  const reg = useMemo(() => linReg(pts), [pts]);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        At its core, regression asks: <strong>"Is there a pattern in this cloud of points?"</strong> Each dot is one observation (one firm, one person, one country). The line is the pattern OLS finds. Adjust the sliders — notice that changing slope moves the pattern, while changing noise spreads the points without shifting the line much:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>True Relationship (slope)</div>
          <input type="range" min="-1" max="2" step="0.1" value={slope} onChange={e => setSlope(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.smp }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.smp, fontFamily: mono }}>{slope.toFixed(1)} {slope === 0 ? "(no relationship)" : slope > 0 ? "(positive)" : "(negative)"}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Noise Level</div>
          <input type="range" min="2" max="30" step="1" value={noise} onChange={e => setNoise(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>{noise} {noise < 8 ? "(very clean)" : noise < 15 ? "(moderate)" : "(very noisy)"}</div>
        </div>
      </div>
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <ScatterSVG pts={pts} reg={reg} xLabel="X (e.g. R&D spending)" yLabel="Y (e.g. Revenue)" />
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <SC label="True Slope" value={slope.toFixed(1)} color={C.pop} />
          <SC label="Estimated β₁" value={reg.b1.toFixed(3)} color={C.smp} />
          <SC label="Intercept (β₀)" value={reg.b0.toFixed(1)} color={C.txD} />
          <SC label="R²" value={reg.r2.toFixed(3)} color={C.grn} />
          <SC label="p-value" value={reg.p < 0.001 ? "<.001" : reg.p.toFixed(3)} color={reg.p < 0.05 ? C.rose : C.txD} />
        </div>
        {Math.abs(slope - reg.b1) > 0.01 && (
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "8px", textAlign: "center", fontStyle: "italic" }}>
            Notice: the true slope is <strong style={{ color: C.pop }}>{slope.toFixed(1)}</strong> but OLS estimates <strong style={{ color: C.smp }}>{reg.b1.toFixed(3)}</strong> — they don't match exactly! This gap is <strong>sampling error</strong>. Every sample gives a slightly different estimate. The SE tells you how much the estimate typically varies. {noise > 15 ? "With this much noise, the gap can be large." : "With low noise, the estimate is close to the truth."}
          </div>
        )}
      </div>
      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>The equation:</strong> Y = {reg.b0.toFixed(1)} + {reg.b1.toFixed(3)} × X. This means: for every 1-unit increase in X, Y increases by {reg.b1.toFixed(3)} on average. The R² of {reg.r2.toFixed(3)} means X explains about {(reg.r2 * 100).toFixed(1)}% of the variation in Y. {noise > 15 ? "Notice how high noise makes R² low even when there's a real relationship — the signal is drowned by noise." : ""}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: RESIDUALS
// ═══════════════════════════════════════════════════════════════════
function ResidualsViz() {
  const [pts] = useState(() => generateData(25, 20, 0.6, 10));
  const reg = useMemo(() => linReg(pts), [pts]);
  const [userB0, setUserB0] = useState(10);
  const [userB1, setUserB1] = useState(0.3);
  const [showOLS, setShowOLS] = useState(false);

  const userLine = { b0: userB0, b1: userB1 };
  const userResiduals = pts.map(p => p.y - (userB0 + userB1 * p.x));
  const userSSR = userResiduals.reduce((s, r) => s + r ** 2, 0);
  const olsSSR = reg.ssr;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        OLS stands for <strong>Ordinary Least Squares</strong>. The "least squares" part means: find the line that minimizes the <strong>total squared distance</strong> from each point to the line. The dashed lines below are <strong>residuals</strong> — the gap between what the line predicts and what actually happened. The pink squares show the squared residuals visually. Try adjusting the line and see if you can beat OLS:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, marginBottom: "4px" }}>Your Intercept (β₀)</div>
          <input type="range" min="-20" max="60" step="1" value={userB0} onChange={e => setUserB0(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>{userB0}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, marginBottom: "4px" }}>Your Slope (β₁)</div>
          <input type="range" min="-1" max="2" step="0.05" value={userB1} onChange={e => setUserB1(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>{userB1.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <ScatterSVG pts={pts} reg={showOLS ? reg : null} showResiduals={true} showSquares={true} manualLine={showOLS ? null : userLine} />

        <div style={{ display: "flex", gap: "12px", marginTop: "12px", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.popBg, borderRadius: "10px", padding: "12px 18px", border: "1px solid rgba(217,119,6,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>YOUR SSR</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: C.pop }}>{userSSR.toFixed(0)}</div>
          </div>
          <div style={{ fontSize: "20px", color: C.txM }}>vs</div>
          <div style={{ background: C.smpBg, borderRadius: "10px", padding: "12px 18px", border: "1px solid rgba(124,58,237,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>OLS SSR</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: C.smp }}>{showOLS ? olsSSR.toFixed(0) : "???"}</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => setShowOLS(!showOLS)} style={{ padding: "9px 24px", borderRadius: "9px", border: "none", background: C.smp, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            {showOLS ? "Hide OLS line" : "Reveal OLS line — can you beat it?"}
          </button>
        </div>
      </div>

      {showOLS && (
        <Ins>
          OLS SSR = {olsSSR.toFixed(0)}, yours = {userSSR.toFixed(0)}. {userSSR <= olsSSR * 1.01 ? "Incredibly close! You basically matched OLS." : userSSR <= olsSSR * 1.1 ? "Very close! But OLS still wins — it always finds the mathematical minimum." : `OLS wins by ${((userSSR / olsSSR - 1) * 100).toFixed(0)}%. No matter how you adjust the sliders, you can't beat OLS — that's the point. It finds the unique line that makes this total as small as possible.`}
        </Ins>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: READING OUTPUT
// ═══════════════════════════════════════════════════════════════════
function OutputViz() {
  const [pts] = useState(() => generateData(100, 15, 0.55, 12));
  const reg = useMemo(() => linReg(pts), [pts]);
  const [selected, setSelected] = useState(null);

  const ciLo = reg.b1 - 1.96 * reg.se_b1;
  const ciHi = reg.b1 + 1.96 * reg.se_b1;

  const cells = [
    { id: "b1", label: "X coefficient", value: reg.b1.toFixed(4), row: 1, col: 1 },
    { id: "se", label: "Std. Error", value: reg.se_b1.toFixed(4), row: 1, col: 2 },
    { id: "t", label: "t-statistic", value: reg.t.toFixed(3), row: 1, col: 3 },
    { id: "p", label: "P > |t|", value: reg.p < 0.001 ? "0.000" : reg.p.toFixed(3), row: 1, col: 4 },
    { id: "ci", label: "95% CI", value: `[${ciLo.toFixed(3)}, ${ciHi.toFixed(3)}]`, row: 1, col: 5 },
    { id: "b0", label: "Intercept", value: reg.b0.toFixed(4), row: 2, col: 1 },
    { id: "r2", label: "R²", value: reg.r2.toFixed(4), row: 3, col: 1 },
    { id: "n", label: "N", value: reg.n.toString(), row: 3, col: 2 },
  ];

  const explanations = {
    b1: { title: "Coefficient (β₁)", color: C.smp, text: `For every 1-unit increase in X, Y changes by ${reg.b1.toFixed(4)} on average, holding everything else constant. This is the slope of the line — the core finding of the regression. The sign tells you direction: positive means X and Y move together.` },
    se: { title: "Standard Error of β₁", color: C.sam, text: `This is the standard deviation of the sampling distribution of β₁ — same concept from Module 1! If you ran this study many times, the coefficient would vary. SE = ${reg.se_b1.toFixed(4)} tells you how much. Smaller SE = more precise estimate. SE shrinks with larger n and less noise.` },
    t: { title: "t-statistic", color: C.txD, text: `t = coefficient / SE = ${reg.b1.toFixed(4)} / ${reg.se_b1.toFixed(4)} = ${reg.t.toFixed(3)}. This is the "signal-to-noise ratio" from Module 2. A |t| > 1.96 roughly corresponds to p < 0.05. Here, |t| = ${Math.abs(reg.t).toFixed(3)}, which is ${Math.abs(reg.t) > 1.96 ? "above" : "below"} the threshold.` },
    p: { title: "P-value", color: C.rose, text: `If the true coefficient were zero (no relationship), how often would you see a coefficient this extreme just by chance? p = ${reg.p < 0.001 ? "<0.001" : reg.p.toFixed(3)}. ${reg.p < 0.05 ? "Since p < 0.05, we reject the null: there's a statistically significant relationship." : "Since p ≥ 0.05, we can't reject the null at the 5% level."} Remember: this doesn't tell you how big or important the effect is.` },
    ci: { title: "95% Confidence Interval", color: C.smp, text: `The CI [${ciLo.toFixed(3)}, ${ciHi.toFixed(3)}] gives you the range of plausible values for β₁. From Module 3: it's β₁ ± 1.96 × SE. ${ciLo > 0 ? "Since the entire interval is above 0, we can be confident the effect is positive." : ciHi < 0 ? "The entire interval is below 0 — the effect is negative." : "The interval includes 0, so we can't rule out 'no effect.'"}` },
    b0: { title: "Intercept (β₀)", color: C.txD, text: `The predicted value of Y when X = 0. Here, β₀ = ${reg.b0.toFixed(2)}. This is often not very meaningful — it depends on whether X = 0 makes sense in your context. If X is "years of experience," then X = 0 means a brand new employee. If X is "firm age," X = 0 is a firm that doesn't exist yet.` },
    r2: { title: "R-squared", color: C.grn, text: `R² = ${reg.r2.toFixed(4)} means X explains about ${(reg.r2 * 100).toFixed(1)}% of the variation in Y. The remaining ${((1 - reg.r2) * 100).toFixed(1)}% is unexplained (noise, omitted variables, randomness). R² ranges from 0 (X explains nothing) to 1 (X perfectly predicts Y). In social science, R² of 0.10–0.30 is typical and acceptable.` },
    n: { title: "Sample Size", color: C.sam, text: `N = ${reg.n} observations were used. Larger N gives smaller SEs, larger t-statistics, and more statistical power. But as we learned in Module 2, larger N also makes tiny, meaningless effects "significant." Always consider N alongside effect size.` },
  };

  const sel = selected ? explanations[selected] : null;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Below is a regression output table — what you'd see in Stata, R, or SPSS. <strong>Click any number</strong> to understand what it means and how it connects to the concepts you've already learned:
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, fontFamily: mono, fontSize: "13px" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", gap: "1px", marginBottom: "2px" }}>
          <div style={{ padding: "6px 8px", fontWeight: 700, color: C.txM, fontSize: "10px" }}></div>
          {["Coef.", "Std.Err.", "t", "P>|t|", "95% CI"].map(h => (
            <div key={h} style={{ padding: "6px 8px", fontWeight: 700, color: C.txM, fontSize: "10px", textAlign: "center", borderBottom: `2px solid ${C.bdr}` }}>{h}</div>
          ))}
        </div>
        {/* X row */}
        <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", gap: "1px" }}>
          <div style={{ padding: "8px", fontWeight: 600, color: C.tx }}>X</div>
          {["b1", "se", "t", "p", "ci"].map(id => {
            const cell = cells.find(c => c.id === id);
            return (
              <div key={id} onClick={() => setSelected(id)} style={{
                padding: "8px", textAlign: "center", cursor: "pointer", borderRadius: "6px",
                background: selected === id ? `${explanations[id].color}11` : "transparent",
                border: `2px solid ${selected === id ? explanations[id].color : "transparent"}`,
                color: C.tx, fontWeight: 600, transition: "all 0.15s",
              }}>{cell?.value}</div>
            );
          })}
        </div>
        {/* Intercept row */}
        <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", gap: "1px", borderTop: `1px solid ${C.grid}` }}>
          <div style={{ padding: "8px", fontWeight: 600, color: C.txD }}>Intercept</div>
          <div onClick={() => setSelected("b0")} style={{ padding: "8px", textAlign: "center", cursor: "pointer", borderRadius: "6px", background: selected === "b0" ? `${C.txD}11` : "transparent", border: `2px solid ${selected === "b0" ? C.txD : "transparent"}`, color: C.txD, fontWeight: 600 }}>{reg.b0.toFixed(4)}</div>
        </div>
        {/* Model stats */}
        <div style={{ display: "flex", gap: "20px", marginTop: "10px", padding: "8px", borderTop: `2px solid ${C.bdr}` }}>
          <span onClick={() => setSelected("r2")} style={{ cursor: "pointer", borderRadius: "4px", padding: "2px 6px", background: selected === "r2" ? C.grnBg : "transparent", border: `2px solid ${selected === "r2" ? C.grn : "transparent"}` }}>R² = {reg.r2.toFixed(4)}</span>
          <span onClick={() => setSelected("n")} style={{ cursor: "pointer", borderRadius: "4px", padding: "2px 6px", background: selected === "n" ? C.samBg : "transparent", border: `2px solid ${selected === "n" ? C.sam : "transparent"}` }}>N = {reg.n}</span>
        </div>
      </div>

      {/* Explanation panel */}
      {sel && (
        <div style={{ background: `${sel.color}08`, border: `1px solid ${sel.color}22`, borderRadius: "12px", padding: "16px 20px", marginTop: "14px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: sel.color, marginBottom: "6px" }}>{sel.title}</div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75 }}>{sel.text}</div>
        </div>
      )}

      {!selected && <div style={{ fontSize: "13px", color: C.txD, textAlign: "center", marginTop: "14px", fontStyle: "italic" }}>Click any number in the table above to see what it means.</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: MULTIPLE REGRESSION
// ═══════════════════════════════════════════════════════════════════
function MultipleRegViz() {
  const [showControl, setShowControl] = useState(false);
  const [vennStep, setVennStep] = useState(0);

  // Generate data where X and Y are both correlated with a confounder Z
  const data = useMemo(() => {
    return Array.from({ length: 80 }, () => {
      const z = Math.random() * 80 + 10;
      const x = 0.4 * z + rNorm(0, 12) + 20;
      const y = 0.5 * z + 0.1 * x + rNorm(0, 10) + 10;
      return { x, y, z };
    });
  }, []);

  const pts = data.map(d => ({ x: d.x, y: d.y }));
  const regSimple = useMemo(() => linReg(pts), [pts]);

  const ptsXZ = data.map(d => ({ x: d.z, y: d.x }));
  const ptsYZ = data.map(d => ({ x: d.z, y: d.y }));
  const regXZ = linReg(ptsXZ);
  const regYZ = linReg(ptsYZ);
  const residX = data.map((d) => d.x - (regXZ.b0 + regXZ.b1 * d.z));
  const residY = data.map((d) => d.y - (regYZ.b0 + regYZ.b1 * d.z));
  const ptsResid = residX.map((rx, i) => ({ x: rx, y: residY[i] }));
  const regControlled = linReg(ptsResid);

  const vennSteps = [
    { label: "Three variables", desc: "We have three variables: X (R&D spending), Y (Revenue), and Z (Firm Size). Each circle represents the total variation in that variable. Where circles overlap, the variables share variation — they're correlated." },
    { label: "Simple regression (Y ~ X)", desc: "Simple regression looks at the TOTAL overlap between X and Y — everything inside the dashed region. But part of that overlap (the dark area in the middle) is actually driven by Z, which correlates with both X and Y. The simple regression coefficient conflates the direct X→Y effect with the indirect X←Z→Y path." },
    { label: "What 'controlling for Z' means", desc: "Multiple regression removes Z's influence. Think of it as subtracting Z's circle from both X and Y. What's left is the unique overlap between X and Y that has nothing to do with Z. This partial overlap — region 'a' — is what the controlled coefficient captures." },
    { label: "Why the coefficient shrinks", desc: "The simple β₁ captured regions a + b (total X-Y overlap). The controlled β₁ captures only region 'a' (unique X-Y overlap). Since much of the apparent X-Y relationship was actually driven by Z, the coefficient drops. If region 'a' is tiny, X may not matter at all once you account for Z — that's what omitted variable bias hides." },
  ];

  // SVG Venn diagram
  const VennDiagram = ({ step }) => {
    const W = 420, H = 280;
    // Circle positions
    const cx_x = 140, cy_x = 140, r = 90; // X circle (left)
    const cx_y = 280, cy_y = 140; // Y circle (right)
    const cx_z = 210, cy_z = 100; // Z circle (top)

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "440px", display: "block", margin: "0 auto" }}>
        <defs>
          <clipPath id="clipX"><circle cx={cx_x} cy={cy_x} r={r} /></clipPath>
          <clipPath id="clipY"><circle cx={cx_y} cy={cy_y} r={r} /></clipPath>
          <clipPath id="clipZ"><circle cx={cx_z} cy={cy_z} r={r} /></clipPath>
          <clipPath id="clipXY"><circle cx={cx_x} cy={cy_x} r={r} /><circle cx={cx_y} cy={cy_y} r={r} /></clipPath>
        </defs>

        {/* Step 1+: Show all three circles */}
        <circle cx={cx_z} cy={cy_z} r={r} fill={C.popBg} stroke={C.pop} strokeWidth="2" opacity={step >= 0 ? 0.6 : 0} />
        <circle cx={cx_x} cy={cy_x} r={r} fill={C.samBg} stroke={C.sam} strokeWidth="2" opacity={step >= 0 ? 0.6 : 0} />
        <circle cx={cx_y} cy={cy_y} r={r} fill={C.smpBg} stroke={C.smp} strokeWidth="2" opacity={step >= 0 ? 0.6 : 0} />

        {/* Step 2: Highlight total X-Y overlap */}
        {step === 1 && (
          <circle cx={cx_y} cy={cy_y} r={r} clipPath="url(#clipX)" fill={C.rose} opacity="0.2" stroke={C.rose} strokeWidth="2" strokeDasharray="6,3" />
        )}

        {/* Step 3+: Show region labels */}
        {step >= 2 && <>
          {/* Region a: X∩Y but not Z — unique X-Y overlap */}
          <circle cx={cx_y} cy={cy_y} r={r} clipPath="url(#clipX)" fill={C.grn} opacity="0.25" />
          {/* Region b: X∩Y∩Z — shared by all three */}
          <g clipPath="url(#clipZ)">
            <circle cx={cx_y} cy={cy_y} r={r} clipPath="url(#clipX)" fill={C.pop} opacity="0.35" />
          </g>
          {/* Label a */}
          <text x={200} y={195} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.grn} fontFamily={mono}>a</text>
          {/* Label b */}
          <text x={200} y={130} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.pop} fontFamily={mono}>b</text>
        </>}

        {/* Step 4: Cross out region b */}
        {step >= 3 && <>
          <line x1={190} x2={210} y1={118} y2={138} stroke={C.rose} strokeWidth="2.5" />
          <line x1={210} x2={190} y1={118} y2={138} stroke={C.rose} strokeWidth="2.5" />
        </>}

        {/* Labels */}
        <text x={cx_x - 45} y={cy_x + 50} fontSize="13" fontWeight="700" fill={C.sam} fontFamily={font}>X</text>
        <text x={cx_x - 45} y={cy_x + 63} fontSize="9" fill={C.txD} fontFamily={font}>(R&D)</text>
        <text x={cx_y + 25} y={cy_y + 50} fontSize="13" fontWeight="700" fill={C.smp} fontFamily={font}>Y</text>
        <text x={cx_y + 25} y={cy_y + 63} fontSize="9" fill={C.txD} fontFamily={font}>(Revenue)</text>
        <text x={cx_z + 45} y={cy_z - 40} fontSize="13" fontWeight="700" fill={C.pop} fontFamily={font}>Z</text>
        <text x={cx_z + 45} y={cy_z - 27} fontSize="9" fill={C.txD} fontFamily={font}>(Firm Size)</text>

        {/* Step-specific annotations */}
        {step === 1 && <text x={210} y={260} textAnchor="middle" fontSize="11" fill={C.rose} fontFamily={font} fontWeight="600">Total X-Y overlap (what simple regression sees)</text>}
        {step >= 2 && <>
          <text x={105} y={264} textAnchor="middle" fontSize="10" fill={C.grn} fontFamily={mono} fontWeight="600">a = unique X→Y</text>
          <text x={305} y={264} textAnchor="middle" fontSize="10" fill={C.pop} fontFamily={mono} fontWeight="600">b = shared via Z</text>
        </>}
      </svg>
    );
  };

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        In the real world, variables are correlated with each other. If firms with more R&D (X) have higher revenue (Y), is it because R&D drives revenue? Or because bigger firms (Z) do both? To understand "controlling for," think in terms of <strong>shared variance</strong>:
      </div>

      {/* Venn diagram walkthrough */}
      <CBox title={<>🔵 The Venn Diagram of Variance</>} color={C.smp}>
        <VennDiagram step={vennStep} />

        {/* Step explanation */}
        <div style={{ background: C.bg, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", marginTop: "12px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB, minHeight: "60px" }}>
          <strong style={{ color: C.smp }}>{vennSteps[vennStep].label}:</strong> {vennSteps[vennStep].desc}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
          <button onClick={() => setVennStep(s => Math.max(0, s - 1))} disabled={vennStep === 0} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: vennStep === 0 ? C.txM : C.txB, fontSize: "12px", fontWeight: 600, cursor: vennStep === 0 ? "default" : "pointer", fontFamily: font, opacity: vennStep === 0 ? 0.5 : 1 }}>← Back</button>
          <button onClick={() => setVennStep(s => Math.min(3, s + 1))} disabled={vennStep === 3} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.smp}`, background: vennStep === 3 ? "transparent" : C.smpBg, color: vennStep === 3 ? C.txM : C.smp, fontSize: "12px", fontWeight: 600, cursor: vennStep === 3 ? "default" : "pointer", fontFamily: font, opacity: vennStep === 3 ? 0.5 : 1 }}>Next Step →</button>
        </div>
      </CBox>

      {/* The formula connection */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "20px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong>In equation form:</strong> Simple regression <strong>Y ~ X</strong> gives β₁ that reflects regions <strong style={{ color: C.grn }}>a</strong> + <strong style={{ color: C.pop }}>b</strong>. Multiple regression <strong>Y ~ X + Z</strong> gives β₁ that reflects only region <strong style={{ color: C.grn }}>a</strong> — the unique contribution of X after Z is accounted for. This is what we mean by "holding Z constant" or "controlling for Z."
      </div>

      {/* Now show it with actual data */}
      <div style={{ fontSize: "15px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>See it in the data</div>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
        <button onClick={() => setShowControl(false)} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${!showControl ? C.smp : C.bdr}`, background: !showControl ? C.smpBg : "transparent", color: !showControl ? C.smp : C.txD, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Simple: Y ~ X (a + b)</button>
        <button onClick={() => setShowControl(true)} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${showControl ? C.smp : C.bdr}`, background: showControl ? C.smpBg : "transparent", color: showControl ? C.smp : C.txD, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Controlled: Y ~ X + Z (only a)</button>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        {!showControl ? (
          <>
            <ScatterSVG pts={pts} reg={regSimple} xLabel="X (R&D spending)" yLabel="Y (Revenue)" />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <SC label="β₁ (a+b)" value={regSimple.b1.toFixed(3)} color={C.smp} />
              <SC label="R²" value={regSimple.r2.toFixed(3)} color={C.grn} />
              <SC label="p-value" value={regSimple.p < 0.001 ? "<.001" : regSimple.p.toFixed(3)} color={C.rose} />
            </div>
            <div style={{ fontSize: "12px", color: C.txD, marginTop: "8px", textAlign: "center" }}>
              This coefficient captures both the direct X→Y effect <em>and</em> the confounded path through Z.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "12px", color: C.txD, marginBottom: "6px", textAlign: "center" }}>
              After removing Z's influence from both X and Y (residualizing), what's left is the unique X-Y relationship:
            </div>
            <ScatterSVG pts={ptsResid} reg={regControlled} xLabel="X residual (R&D, net of firm size)" yLabel="Y residual (Revenue, net of firm size)" autoRange={true} />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
              <SC label="β₁ (only a)" value={regControlled.b1.toFixed(3)} color={C.smp} />
              <SC label="R²" value={regControlled.r2.toFixed(3)} color={C.grn} />
              <SC label="p-value" value={regControlled.p < 0.001 ? "<.001" : regControlled.p.toFixed(3)} color={regControlled.p < 0.05 ? C.rose : C.txD} />
            </div>
          </>
        )}
      </div>

      {showControl && (
        <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
          <strong style={{ color: C.pop }}>What happened?</strong> β₁ dropped from <strong>{regSimple.b1.toFixed(3)}</strong> (regions a+b) to <strong>{regControlled.b1.toFixed(3)}</strong> (region a only). The difference ({(regSimple.b1 - regControlled.b1).toFixed(3)}) was the confounded part — variation that Z explained in both X and Y. This is <strong>omitted variable bias</strong>: leaving out Z made X look more important than it really is.
        </div>
      )}

      <Anl>Think of three friends splitting a restaurant bill. X claims to have paid $50, Y confirms receiving $50 worth of food. But $35 of that came from Z (who quietly paid for the shared appetizers). X's <em>actual</em> unique contribution was only $15. Without accounting for Z, X gets credit for Z's generosity. Controlling for Z sets the record straight.</Anl>
    </div>
  );
}

// ─── Residual Histogram ─────────────────────────────────────────────
function ResidHistogram({ resids }) {
  const W2 = 300, H2 = 120, pad2 = { t: 10, r: 10, b: 20, l: 10 };
  const cw2 = W2 - pad2.l - pad2.r, ch2 = H2 - pad2.t - pad2.b;
  const mn = Math.min(...resids), mx = Math.max(...resids);
  const rng = mx - mn || 1;
  const lo = mn - rng * 0.05, hi = mx + rng * 0.05;
  const bc = 20, bw = (hi - lo) / bc;
  const bins = Array(bc).fill(0);
  resids.forEach(v => { const i = Math.min(Math.floor((v - lo) / bw), bc - 1); if (i >= 0) bins[i]++; });
  const maxC = Math.max(...bins, 1);
  const mean = resids.reduce((a, b) => a + b, 0) / resids.length;
  const sd = Math.sqrt(resids.reduce((s, v) => s + (v - mean) ** 2, 0) / resids.length) || 1;
  const normPts = Array.from({ length: 100 }, (_, i) => {
    const x = lo + (i / 99) * (hi - lo);
    const y = normalPDF(x, mean, sd) * resids.length * bw;
    return { x, y };
  });
  const normMax = Math.max(...normPts.map(p => p.y), 1);
  const scaleY = ch2 / Math.max(maxC, normMax);

  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "4px" }}>RESIDUAL HISTOGRAM (check normality)</div>
      <svg viewBox={`0 0 ${W2} ${H2}`} style={{ width: "100%" }}>
        {bins.map((c, i) => {
          const bx = pad2.l + (i / bc) * cw2;
          const bh = c * scaleY;
          return <rect key={i} x={bx} y={pad2.t + ch2 - bh} width={cw2 / bc - 1} height={bh} fill={C.smp} opacity="0.35" rx="1" />;
        })}
        <path d={normPts.map((p, i) => {
          const x = pad2.l + ((p.x - lo) / (hi - lo)) * cw2;
          const y = pad2.t + ch2 - p.y * scaleY;
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        }).join(" ")} fill="none" stroke={C.rose} strokeWidth="2" strokeDasharray="4,3" />
        <text x={W2 - pad2.r - 4} y={pad2.t + 12} textAnchor="end" fontSize="9" fill={C.rose} fontFamily={mono}>— normal</text>
        <line x1={pad2.l} x2={pad2.l + cw2} y1={pad2.t + ch2} y2={pad2.t + ch2} stroke={C.bdr} strokeWidth="1" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: ASSUMPTIONS
// ═══════════════════════════════════════════════════════════════════
function AssumptionsViz() {
  const [scenario, setScenario] = useState("good");
  const pts = useMemo(() => {
    if (scenario === "good") return generateData(60, 20, 0.5, 8, "linear");
    if (scenario === "curved") return generateData(60, 20, 0.5, 6, "curved");
    if (scenario === "hetero") return generateData(60, 20, 0.5, 10, "heteroskedastic");
    if (scenario === "nonnormal") return generateData(80, 20, 0.5, 10, "skewed");
    if (scenario === "outliers") return generateData(60, 20, 0.5, 8, "outliers");
    return generateData(60, 20, 0.5, 8, "linear");
  }, [scenario]);
  const reg = useMemo(() => linReg(pts), [pts]);

  const residPlot = pts.map(p => ({ x: reg.b0 + reg.b1 * p.x, y: p.y - (reg.b0 + reg.b1 * p.x) }));
  const residuals = residPlot.map(p => p.y);

  const scenarios = [
    { id: "good", label: "\u2705 All Met", desc: "All assumptions satisfied", color: C.grn },
    { id: "curved", label: "#1 Non-Linear", desc: "Assumption 1 (Linearity) violated — true relationship is curved", color: C.pop },
    { id: "hetero", label: "#3 Heterosked.", desc: "Assumption 3 (Constant Variance) violated — spread increases with X", color: C.rose },
    { id: "nonnormal", label: "#4 Non-Normal", desc: "Assumption 4 (Normality) violated — residuals are skewed", color: C.smp },
    { id: "outliers", label: "Outliers (practical)", desc: "Not a formal assumption, but a practical issue that distorts OLS", color: C.txD },
  ];

  const diagText = {
    good: "Residuals are randomly scattered around zero with constant spread. The residual histogram (bottom-right) is roughly bell-shaped, matching the dashed normal curve. All assumptions are satisfied.",
    curved: "Violation of Assumption #1 (Linearity). The residual plot shows a U-shaped pattern — the straight line is missing a curve in the raw data. Fix: add a squared term (X\u00B2), use log transforms, or switch to a non-linear model.",
    hetero: "Violation of Assumption #3 (Homoskedasticity). The residual plot fans out — variance increases with fitted values. Coefficients are still unbiased, but SEs are wrong. Fix: use robust (Huber-White) standard errors.",
    nonnormal: "Violation of Assumption #4 (Normality). The residual histogram is clearly skewed — it doesn't match the dashed normal curve. In small samples, this makes p-values unreliable. With large n (30+), the CLT helps. Fix: bootstrapped SEs or non-parametric tests for small samples.",
    outliers: "Not a formal OLS assumption, but a critical practical issue. A few extreme residuals pull the regression line because OLS squares the gaps — big deviations get amplified. Fix: investigate outliers, consider robust regression, or report with and without them.",
  };

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Now see what these assumptions look like in practice. Each button simulates a different condition. Compare the scatter plot (top-left), residual plot (top-right), and residual histogram (bottom-right):
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {scenarios.map(s => (
          <button key={s.id} onClick={() => setScenario(s.id)} style={{
            padding: "8px 16px", borderRadius: "8px", border: "1.5px solid",
            borderColor: scenario === s.id ? s.color : C.bdr,
            background: scenario === s.id ? `${s.color}11` : "transparent",
            color: scenario === s.id ? s.color : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Scatter + regression */}
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.txD, fontFamily: mono, marginBottom: "4px" }}>DATA + REGRESSION LINE</div>
          <ScatterSVG pts={pts} reg={reg} W={300} H={220} showResiduals={true} />
        </div>
        {/* Residual plot */}
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>RESIDUAL PLOT (check #1 linearity, #3 variance)</div>
          <ScatterSVG pts={residPlot} reg={{ b0: 0, b1: 0 }} W={300} H={220} xLabel="Fitted values" yLabel="Residuals" autoRange={true} />
        </div>
        {/* Spacer for alignment */}
        <div />
        {/* Residual histogram */}
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
          <ResidHistogram resids={residuals} />
        </div>
      </div>

      <div style={{ background: `${scenarios.find(s => s.id === scenario).color}08`, border: `1px solid ${scenarios.find(s => s.id === scenario).color}22`, borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: scenarios.find(s => s.id === scenario).color }}>{scenarios.find(s => s.id === scenario).desc}:</strong> {diagText[scenario]}
      </div>

      <div style={{ fontSize: "12px", color: C.txD, marginTop: "14px", lineHeight: 1.7 }}>
        <strong>Note:</strong> This checker visualizes violations of Assumptions #1 (linearity — via residual plot pattern), #3 (homoskedasticity — via residual plot fanning), and #4 (normality — via residual histogram). Assumptions #2 (independence) and #5 (multicollinearity) require different diagnostics: the Durbin-Watson test for autocorrelation and VIF statistics for multicollinearity. See the assumption cards above for details on each.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "intuition", label: "1. What is Regression?" },
  { id: "residuals", label: "2. How OLS Works" },
  { id: "output", label: "3. Reading Output" },
  { id: "multiple", label: "4. Multiple Regression" },
  { id: "assumptions", label: "5. Assumptions" },
];

export default function OLSRegression() {
  const [tab, setTab] = useState("intuition");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.samLt, color: C.sam, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 5 · Foundations</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>OLS Regression</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>The workhorse of empirical research. OLS finds the "best-fitting" straight line through your data — and everything you learned about SEs, p-values, and CIs comes alive here.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.sam : C.txD, borderBottom: `2px solid ${tab === t.id ? C.sam : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "intuition" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Finding patterns in clouds of points" sub="What regression does and why we need it" />
          <Pr>Imagine you have data on 40 firms: how much each spends on R&D (X) and their revenue (Y). You plot the data and see a cloud of points. Regression answers: <strong>"Is there a systematic pattern, and how strong is it?"</strong></Pr>
          <Pr>The regression line is a summary of the entire cloud — it captures the average relationship between X and Y. The equation <strong>Y = β₀ + β₁X</strong> tells you: when X goes up by 1, Y goes up by β₁ on average.</Pr>

          <CBox title={<>📈 Interactive Scatter Plot</>} color={C.sam}>
            <IntuitionViz />
          </CBox>

          <Anl>Think of regression as drawing the "best average line" through a noisy crowd. Each person in the crowd is standing in a slightly different spot (that's the noise). The line captures where the crowd is heading on average. More noise = harder to see the direction. Stronger slope = clearer trend.</Anl>

          <NBtn onClick={() => setTab("residuals")} label="Next: How OLS Works →" />
        </div>}

        {tab === "residuals" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Minimizing the gaps" sub='What "least squares" actually means' />
          <Pr>There are infinitely many lines you could draw through a cloud of points. OLS picks the <strong>one specific line</strong> that minimizes the total squared distance from each point to the line. These distances are called <strong>residuals</strong>.</Pr>
          <Pr>Why squared? For the same reason as variance: squaring makes all gaps positive and penalizes big misses more than small ones. A point that's 10 units away contributes 100 to the total; a point 2 units away contributes only 4.</Pr>

          <CBox title={<>🎯 Can You Beat OLS?</>} color={C.sam}>
            <ResidualsViz />
          </CBox>

          <Anl>Residuals are like forecast errors. If the weather app says "25°C" and the actual temp is 27°C, the residual is +2°C. OLS finds the forecast model that makes the squared forecast errors as small as possible overall.</Anl>

          <NBtn onClick={() => setTab("output")} label="Next: Reading Output →" />
        </div>}

        {tab === "output" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Decoding the regression table" sub="Every number connects to something you already know" />
          <Pr>This is the moment everything clicks. The regression output table contains coefficients, standard errors, t-statistics, p-values, and confidence intervals — all the concepts from Modules 1–3, applied to the regression setting.</Pr>

          <CBox title={<>📋 Interactive Regression Output</>} color={C.sam}>
            <OutputViz />
          </CBox>

          <Ins>
            <strong>The chain, one more time:</strong> Coefficient (effect size) → divided by SE → gives t-statistic → compared to the t-distribution → gives p-value. CI = coefficient ± 1.96 × SE. R² tells you how much variance is explained. Every number in that table is a concept you've already learned — now applied to the regression line.
          </Ins>

          <NBtn onClick={() => setTab("multiple")} label="Next: Multiple Regression →" />
        </div>}

        {tab === "multiple" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Controlling for other variables" sub="Why simple regression can lie to you" />
          <Pr>In the real world, X and Y are rarely the only things in play. There are almost always other variables (confounders) that affect both. If you ignore them, your coefficient on X absorbs their effect — giving you the wrong answer.</Pr>
          <Pr><strong>Multiple regression</strong> solves this by including additional variables (controls). The coefficient on X then answers: "Holding Z constant, what is the effect of X on Y?" Toggle below to see the dramatic difference:</Pr>

          <CBox title={<>🔀 Simple vs. Controlled Regression</>} color={C.sam}>
            <MultipleRegViz />
          </CBox>

          <Anl>It's like comparing test scores between students who went to tutoring vs. those who didn't — but ignoring that the tutoring group also happens to attend a better school. The "tutoring effect" you measure includes the school effect. Adding "school quality" as a control strips that out and reveals the pure tutoring effect.</Anl>

          <NBtn onClick={() => setTab("assumptions")} label="Next: Assumptions →" />
        </div>}

        {tab === "assumptions" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="When the model breaks" sub="OLS assumptions and what happens when they're violated" />
          <Pr>OLS gives you the <strong>Best Linear Unbiased Estimator (BLUE)</strong> — but only when its assumptions hold. Here are the key assumptions, what they mean in plain language, and what goes wrong when they're violated:</Pr>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {[
              { num: "1", title: "Linearity", plain: "The true relationship between X and Y is a straight line (or can be made straight with transformations). This is an assumption about reality — about how X actually relates to Y in the population.", breaks: "If the real relationship is curved, the line misses the pattern systematically. Your predictions will be wrong in predictable ways.", fix: "Add polynomial terms (X²), use log transforms, or switch to non-linear models.", check: "Look at the residual plot. If the residuals show a systematic pattern (e.g., U-shaped), it means the straight line is missing a curve in the raw data. Random residuals = linearity holds.", color: C.pop },
              { num: "2", title: "Independence of errors", plain: "The residual for one observation doesn't depend on the residual for another. Each data point's \"error\" is its own.", breaks: "Common in time-series (today's error predicts tomorrow's) and clustered data (employees in the same firm have correlated errors). SEs become wrong, p-values unreliable.", fix: "Use clustered standard errors, time-series models, or multilevel models.", check: "Use the Durbin-Watson test for autocorrelation. Plot residuals in order — if you see waves or trends, errors aren't independent.", color: C.sam },
              { num: "3", title: "Homoskedasticity (constant variance)", plain: "The spread of residuals is the same across all values of X. The \"noise\" doesn't get bigger or smaller as X changes.", breaks: "When variance is unequal (heteroskedasticity), the OLS coefficients are still unbiased, but the standard errors are wrong — so your p-values and CIs can't be trusted.", fix: "Use robust (Huber-White) standard errors. These are so standard that many researchers use them by default.", check: "Look at the residual plot. If residuals fan out (wider on one side), variance isn't constant.", color: C.rose },
              { num: "4", title: "Normality of errors", plain: "The residuals follow a roughly normal (bell-shaped) distribution.", breaks: "With non-normal errors, coefficient estimates are still unbiased, but hypothesis tests (t-stats, p-values) may be inaccurate in small samples.", fix: "With large samples (n > 30), the Central Limit Theorem rescues you — tests are approximately valid regardless. For small samples, consider bootstrapping.", check: "Plot a histogram or Q-Q plot of the residuals. Minor departures from normality are fine with large n.", color: C.smp },
              { num: "5", title: "No perfect multicollinearity", plain: "No independent variable is a perfect linear combination of other independent variables.", breaks: "If two variables are perfectly correlated (e.g., including both \"age\" and \"birth year\"), OLS can't separate their effects. The math literally breaks — no unique solution exists.", fix: "Drop one of the redundant variables. Check variance inflation factors (VIF) for near-multicollinearity.", check: "Compute VIF for each variable. VIF > 10 suggests problematic multicollinearity. Also check your correlation matrix.", color: C.txD },
            ].map(a => (
              <div key={a.num} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${a.color}11`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: a.color, fontFamily: mono, flexShrink: 0 }}>{a.num}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: a.color, marginBottom: "4px" }}>{a.title}</div>
                    <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "6px" }}>{a.plain}</div>
                    <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}><strong>If violated:</strong> {a.breaks}</div>
                    <div style={{ fontSize: "12px", color: C.sam, lineHeight: 1.6, marginTop: "4px" }}><strong>How to check:</strong> {a.check}</div>
                    <div style={{ fontSize: "12px", color: C.grn, lineHeight: 1.6, marginTop: "4px" }}><strong>Fix:</strong> {a.fix}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pr>The good news: most violations are detectable from the <strong>residual plot</strong> (residuals vs. fitted values). Click each scenario below to see what healthy vs. unhealthy residuals look like:</Pr>

          <CBox title={<>🔍 Assumption Checker</>} color={C.sam}>
            <AssumptionsViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Regression finds the best-fitting line through a scatter plot. <strong>Y = β₀ + β₁X</strong> means "a 1-unit increase in X is associated with a β₁ change in Y."<br />
              <strong>2.</strong> OLS minimizes the <strong>sum of squared residuals</strong>. That's where the name comes from.<br />
              <strong>3.</strong> The regression table contains the coefficient, SE, t-stat, p-value, CI, and R² — all concepts from earlier modules, applied to the regression slope.<br />
              <strong>4.</strong> <strong>Multiple regression</strong> controls for confounders. Without controls, coefficients can be biased by <strong>omitted variable bias</strong>.<br />
              <strong>5.</strong> Always check the <strong>residual plot</strong>. Patterns in residuals signal violations: non-linearity (curved pattern), heteroskedasticity (fanning), or outlier influence.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
