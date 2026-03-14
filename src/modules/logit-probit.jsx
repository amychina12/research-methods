import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function probitCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422802 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// Generate binary outcome data
function genBinaryData(n, b0, b1) {
  return Array.from({ length: n }, () => {
    const x = Math.random() * 10 - 2;
    const p = sigmoid(b0 + b1 * x);
    const y = Math.random() < p ? 1 : 0;
    return { x, y, trueP: p };
  });
}

// Simple OLS for binary
function olsBinary(pts) {
  const n = pts.length;
  if (n < 2) return { b0: 0, b1: 0 };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const ssxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const b1 = ssxx > 0 ? ssxy / ssxx : 0;
  const b0 = my - b1 * mx;
  return { b0, b1 };
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
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.sam, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.sam }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.samBg, border: "1px solid rgba(2,132,199,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.sam, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: WHY OLS BREAKS
// ═══════════════════════════════════════════════════════════════════
function WhyOLSBreaksViz() {
  const data = useMemo(() => genBinaryData(100, -2, 1.2), []);
  const ols = useMemo(() => olsBinary(data), [data]);

  const W = 540, H = 300, pad = { t: 20, r: 20, b: 36, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xRange = [-3, 9], yRange = [-0.3, 1.3];
  const sx = v => pad.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * cw;
  const sy = v => pad.t + ch - ((v - yRange[0]) / (yRange[1] - yRange[0])) * ch;

  // OLS prediction line
  const olsY = x => ols.b0 + ols.b1 * x;

  // Problem zones
  const leftProb = olsY(-2);
  const rightProb = olsY(8);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Here's the problem: when your outcome Y can only be <strong>0 or 1</strong> (failed/succeeded, no/yes), OLS draws a straight line through the data. But a straight line doesn't respect the 0-1 boundary:
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        {/* Grid */}
        {[-2, 0, 2, 4, 6, 8].map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
        {[0, 0.5, 1].map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={v === 0 || v === 1 ? C.bdr : C.grid} strokeWidth={v === 0 || v === 1 ? "1.5" : "1"} />)}

        {/* Danger zones */}
        <rect x={pad.l} y={sy(1.3)} width={cw} height={sy(1) - sy(1.3)} fill={C.rose} opacity="0.06" />
        <rect x={pad.l} y={sy(0)} width={cw} height={sy(-0.3) - sy(0)} fill={C.rose} opacity="0.06" />
        <text x={pad.l + 4} y={sy(1.15)} fontSize="9" fill={C.rose} fontFamily={mono}>above 100%?</text>
        <text x={pad.l + 4} y={sy(-0.15)} fontSize="9" fill={C.rose} fontFamily={mono}>below 0%?</text>

        {/* OLS line */}
        <line x1={sx(xRange[0])} x2={sx(xRange[1])} y1={sy(olsY(xRange[0]))} y2={sy(olsY(xRange[1]))} stroke={C.rose} strokeWidth="2.5" strokeDasharray="8,4" />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={sx(d.x)} cy={sy(d.y + (Math.random() - 0.5) * 0.06)} r="3.5" fill={d.y === 1 ? C.grn : C.txM} opacity="0.6" stroke="#fff" strokeWidth="0.5" />
        ))}

        {/* Labels */}
        <text x={sx(7.5)} y={sy(olsY(7.5)) - 8} fontSize="11" fontWeight="600" fill={C.rose} fontFamily={font}>OLS line</text>
        {[-2, 0, 2, 4, 6, 8].map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        {[0, 0.5, 1].map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        <text x={sx(3)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X (e.g. years of experience)</text>
        <text x="10" y={sy(0.5)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${sy(0.5)})`}>Y (0 or 1)</text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Impossible predictions</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>OLS predicts {(leftProb * 100).toFixed(0)}% probability at X = -2 and {(rightProb * 100).toFixed(0)}% at X = 8. But probabilities must be between 0% and 100% — a predicted probability of {(rightProb * 100).toFixed(0)}% is meaningless. The red-shaded zones in the chart above show where OLS goes out of bounds.</div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Constant effect doesn't make sense</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
                Say X is "number of mentors" and Y is "startup survives (1) or dies (0)." OLS says each additional mentor adds the same amount to survival probability — say, +10 percentage points. But think about what that means:
                <div style={{ margin: "10px 0 10px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}><strong>0 → 1 mentor:</strong> goes from 5% to 15%. That first mentor is <em>transformative</em> — it tripled the odds of survival.</div>
                  <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}><strong>4 → 5 mentors:</strong> goes from 45% to 55%. Helpful, but less dramatic — a modest nudge.</div>
                  <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}><strong>9 → 10 mentors:</strong> goes from 95% to 105%. That's impossible. And even going from 95% to 99% — does the 10th mentor really help as much as the 1st?</div>
                </div>
                In reality, the effect of an additional mentor should be <strong>biggest when the startup is on the fence</strong> (near 50% survival), and <strong>smallest when the outcome is already nearly certain</strong> (near 0% or 100%). OLS can't capture this — it forces the same +10 points everywhere. The S-curve in the next tab handles this naturally.
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>3</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Standard errors are wrong</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>OLS assumes residuals are normally distributed with constant variance. But when Y is 0 or 1, the residuals can only take two values at each X (the gap to 0 or the gap to 1) — they can't possibly be normal. And the variance of a binary variable depends on the probability (highest at P = 50%, lowest near 0% or 100%), so it changes across X. This means your SEs, p-values, and confidence intervals from OLS are all unreliable.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: THE S-CURVE
// ═══════════════════════════════════════════════════════════════════
function SCurveViz() {
  const [b0, setB0] = useState(-2);
  const [b1, setB1] = useState(1.0);
  const [model, setModel] = useState("logit");

  const data = useMemo(() => genBinaryData(80, -2, 1.2), []);

  const W = 540, H = 300, pad = { t: 20, r: 20, b: 36, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xRange = [-3, 9], yRange = [-0.05, 1.05];
  const sx = v => pad.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * cw;
  const sy = v => pad.t + ch - ((v - yRange[0]) / (yRange[1] - yRange[0])) * ch;

  const curveFn = model === "logit" ? sigmoid : probitCDF;
  const curvePoints = Array.from({ length: 200 }, (_, i) => {
    const x = xRange[0] + (i / 199) * (xRange[1] - xRange[0]);
    return { x, y: curveFn(b0 + b1 * x) };
  });
  const curvePath = curvePoints.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ");

  // Find x where p = 0.5
  const x50 = b1 !== 0 ? -b0 / b1 : 0;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The solution: instead of a straight line, use an <strong>S-shaped curve</strong> (sigmoid) that naturally stays between 0 and 1. This is the logistic function. Drag the sliders to see how the curve changes:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Intercept (shifts left/right)</div>
          <input type="range" min="-6" max="2" step="0.2" value={b0} onChange={e => setB0(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.txD }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.txD, fontFamily: mono }}>b0 = {b0.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Slope (steepness)</div>
          <input type="range" min="0.1" max="3" step="0.1" value={b1} onChange={e => setB1(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.smp }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.smp, fontFamily: mono }}>b1 = {b1.toFixed(1)} {b1 < 0.5 ? "(gradual)" : b1 < 1.5 ? "(moderate)" : "(steep)"}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Model Type</div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["logit", "probit"].map(m => (
              <button key={m} onClick={() => setModel(m)} style={{ padding: "6px 16px", borderRadius: "8px", border: "1.5px solid", borderColor: model === m ? C.sam : C.bdr, background: model === m ? C.samBg : "transparent", color: model === m ? C.sam : C.txD, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: mono, textTransform: "capitalize" }}>{m}</button>
            ))}
          </div>
          <div style={{ fontSize: "10px", color: C.txD, marginTop: "4px" }}>Almost identical in practice</div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[-2, 0, 2, 4, 6, 8].map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {[0, 0.25, 0.5, 0.75, 1].map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={v === 0.5 ? C.pop + "44" : C.grid} strokeWidth="1" strokeDasharray={v === 0.5 ? "4,3" : "0"} />)}

          {/* Data points */}
          {data.map((d, i) => (
            <circle key={i} cx={sx(d.x)} cy={sy(d.y + (Math.random() - 0.5) * 0.04)} r="3" fill={d.y === 1 ? C.grn : C.txM} opacity="0.5" />
          ))}

          {/* S-curve */}
          <path d={curvePath} fill="none" stroke={C.sam} strokeWidth="3" />

          {/* 50% crossover point */}
          {x50 >= xRange[0] && x50 <= xRange[1] && <>
            <circle cx={sx(x50)} cy={sy(0.5)} r="5" fill={C.pop} stroke="#fff" strokeWidth="2" />
            <text x={sx(x50)} y={sy(0.5) - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.pop} fontFamily={mono}>50% at X = {x50.toFixed(1)}</text>
          </>}

          {/* Labels */}
          {[-2, 0, 2, 4, 6, 8].map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {[0, 0.25, 0.5, 0.75, 1].map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{(v * 100).toFixed(0)}%</text>)}
          <text x={sx(3)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X</text>
          <text x="10" y={sy(0.5)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${sy(0.5)})`}>P(Y = 1)</text>
        </svg>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Key properties of the S-curve:</strong> (1) Always between 0 and 1 — impossible predictions gone. (2) The effect of X on probability depends on <em>where you are</em> on the curve — steep in the middle, flat at the extremes. (3) The amber dot shows where P = 50% — this is the decision boundary. (4) Logit and probit give almost identical curves; logit is more common because it connects to odds ratios.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: ODDS & LOG-ODDS
// ═══════════════════════════════════════════════════════════════════
function OddsViz() {
  const [prob, setProb] = useState(0.7);
  const odds = prob / (1 - prob);
  const logOdds = Math.log(odds);

  const W = 460, H = 100, pad = { l: 20, r: 20, t: 10, b: 20 };
  const cw = W - pad.l - pad.r;
  // Three scales stacked
  const scales = [
    { label: "Probability", min: 0, max: 1, val: prob, color: C.sam, fmt: v => (v * 100).toFixed(0) + "%" },
    { label: "Odds", min: 0, max: 10, val: Math.min(odds, 10), color: C.smp, fmt: v => v.toFixed(2) },
    { label: "Log-odds", min: -4, max: 4, val: Math.max(-4, Math.min(4, logOdds)), color: C.grn, fmt: v => v.toFixed(2) },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        To understand logit coefficients, you need to understand three ways of expressing the same thing. They're all different ways of saying "how likely is Y = 1?" Drag the slider and watch all three transform together:
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Set a probability</div>
        <input type="range" min="0.01" max="0.99" step="0.01" value={prob} onChange={e => setProb(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.sam }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>Probability</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: C.sam }}>{(prob * 100).toFixed(0)}%</div>
          <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6, marginTop: "8px", textAlign: "left" }}>
            The most intuitive: "There's a {(prob * 100).toFixed(0)}% chance of success." Ranges from 0% to 100%.
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>Odds</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: C.smp }}>{odds < 100 ? odds.toFixed(2) : odds.toFixed(0)}</div>
          <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6, marginTop: "8px", textAlign: "left" }}>
            = P / (1 - P) = {(prob * 100).toFixed(0)} / {((1 - prob) * 100).toFixed(0)} = <strong>{odds.toFixed(2)}</strong>. {odds > 1 ? `Success is ${odds.toFixed(1)}x more likely than failure.` : odds < 1 ? `Failure is ${(1/odds).toFixed(1)}x more likely than success.` : "Success and failure are equally likely."} Ranges from 0 to infinity.
          </div>
        </div>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>Log-Odds (logit)</div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: C.grn }}>{logOdds.toFixed(2)}</div>
          <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6, marginTop: "8px", textAlign: "left" }}>
            = ln(odds) = ln({odds.toFixed(2)}) = <strong>{logOdds.toFixed(2)}</strong>. {logOdds > 0 ? "Positive = success more likely." : logOdds < 0 ? "Negative = failure more likely." : "Zero = 50/50."} Ranges from -infinity to +infinity. <strong>This is what logit regression actually models.</strong>
          </div>
        </div>
      </div>

      {/* Why log-odds? */}
      <div style={{ background: C.grnBg, borderRadius: "10px", border: "1px solid rgba(5,150,105,0.15)", padding: "16px 20px", fontSize: "14px", lineHeight: 1.75, color: C.txB }}>
        <strong style={{ color: C.grn }}>Why use log-odds?</strong> Probability is bounded (0 to 1), so we can't use a linear model directly. Odds are bounded on one side (0 to infinity). But log-odds range from -infinity to +infinity — just like any continuous variable. So <strong>logit regression is really just OLS on the log-odds scale</strong>. The equation is: log(odds) = b0 + b1 × X. That's a straight line — but on the log-odds scale, which translates to an S-curve on the probability scale.
      </div>

      <Anl>
        Think of a thermometer. Temperature in Celsius can go below zero, so it maps well to a straight line. But if you tried to model "percentage of ice cream sold" directly, you'd get stuck at 0% and 100%. Converting to log-odds is like converting to a scale where the math works linearly — then converting back when you want to interpret.
      </Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: INTERPRETING COEFFICIENTS
// ═══════════════════════════════════════════════════════════════════
function InterpretViz() {
  const [b1, setB1] = useState(0.8);
  const b0 = -2;

  // Compute values at different X
  const xValues = [0, 2, 4, 6];
  const rows = xValues.map(x => {
    const logOdds = b0 + b1 * x;
    const odds = Math.exp(logOdds);
    const prob = sigmoid(logOdds);
    return { x, logOdds, odds, prob };
  });

  const oddsRatio = Math.exp(b1);

  // Marginal effect at different points
  const marginals = xValues.map(x => {
    const p = sigmoid(b0 + b1 * x);
    return { x, me: p * (1 - p) * b1, p };
  });

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Logit coefficients are in <strong>log-odds units</strong>, which aren't intuitive. There are three ways to interpret them. Adjust b1 and see all three update:
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Coefficient (b1)</div>
        <input type="range" min="-2" max="2" step="0.1" value={b1} onChange={e => setB1(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.sam }} />
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.sam, fontFamily: mono }}>b1 = {b1.toFixed(1)} &nbsp;&nbsp; (with b0 = {b0})</div>
      </div>

      {/* Three interpretations */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
        {/* 1. Log-odds */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.grnBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.grn, fontFamily: mono }}>1</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn }}>Log-Odds Interpretation (the raw coefficient)</div>
          </div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            "A 1-unit increase in X changes the log-odds of Y = 1 by <strong>{b1.toFixed(1)}</strong>."
          </div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px" }}>This is technically correct but not very useful — nobody thinks in log-odds. Most papers don't stop here.</div>
        </div>

        {/* 2. Odds Ratio */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.smpBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.smp, fontFamily: mono }}>2</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp }}>Odds Ratio (exponentiate the coefficient)</div>
          </div>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 16px", marginBottom: "10px", textAlign: "center", border: `1px solid ${C.bdr}` }}>
            <span style={{ fontFamily: mono, fontSize: "15px", color: C.smp, fontWeight: 600 }}>OR = e^b1 = e^{b1.toFixed(1)} = <strong>{oddsRatio.toFixed(3)}</strong></span>
          </div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            {oddsRatio > 1
              ? <>"A 1-unit increase in X <strong>multiplies</strong> the odds of Y = 1 by <strong>{oddsRatio.toFixed(2)}</strong>." That's a {((oddsRatio - 1) * 100).toFixed(0)}% increase in odds.</>
              : oddsRatio < 1
              ? <>"A 1-unit increase in X <strong>multiplies</strong> the odds by <strong>{oddsRatio.toFixed(2)}</strong>." That's a {((1 - oddsRatio) * 100).toFixed(0)}% decrease in odds.</>
              : "The odds don't change — no effect."
            }
          </div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px" }}>This is the most commonly reported interpretation. OR {">"} 1 = positive effect, OR {"<"} 1 = negative effect, OR = 1 = no effect.</div>
        </div>

        {/* 3. Marginal Effects */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.samBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.sam, fontFamily: mono }}>3</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam }}>Marginal Effects (change in probability)</div>
          </div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "10px" }}>
            "A 1-unit increase in X increases the <em>probability</em> of Y = 1 by __ percentage points." But the effect depends on where you start:
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {marginals.map(m => (
              <div key={m.x} style={{ background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}`, textAlign: "center", flex: 1, minWidth: "100px" }}>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>AT X = {m.x}</div>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>P = {(m.p * 100).toFixed(0)}%</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.sam }}>{m.me > 0 ? "+" : ""}{(m.me * 100).toFixed(1)}pp</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "8px" }}>
            The marginal effect is largest near P = 50% (the steep part of the S-curve) and smallest near 0% or 100% (the flat parts). Many papers report the "average marginal effect" — the mean across all observations.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: LOGIT vs PROBIT
// ═══════════════════════════════════════════════════════════════════
function CompareViz() {
  const b0 = -2, b1 = 1;
  const W = 480, H = 200, pad = { t: 20, r: 20, b: 32, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xRange = [-3, 8];
  const sx = v => pad.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * cw;
  const sy = v => pad.t + ch - v * ch;

  const logitPts = Array.from({ length: 200 }, (_, i) => {
    const x = xRange[0] + (i / 199) * (xRange[1] - xRange[0]);
    return { x, y: sigmoid(b0 + b1 * x) };
  });
  const probitPts = Array.from({ length: 200 }, (_, i) => {
    const x = xRange[0] + (i / 199) * (xRange[1] - xRange[0]);
    return { x, y: probitCDF(b0 + b1 * x) };
  });
  const toPath = pts => pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ");

  const rows = [
    { dim: "Link function", logit: "Logistic (sigmoid)", probit: "Normal CDF (Phi)" },
    { dim: "Coefficient meaning", logit: "Change in log-odds", probit: "Change in z-score of probability" },
    { dim: "Odds ratio available?", logit: "Yes — exp(b) is directly interpretable", probit: "No — no simple equivalent" },
    { dim: "Tail behavior", logit: "Slightly heavier tails", probit: "Thinner tails (normal)" },
    { dim: "When to use", logit: "Default choice in most fields", probit: "Economics tradition; when normal errors assumed" },
    { dim: "In practice", logit: "Results almost identical to probit", probit: "Results almost identical to logit" },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Logit and probit are two ways to model binary outcomes. They use different S-curves but produce nearly identical results. Here they are overlaid:
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, marginBottom: "16px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[-2, 0, 2, 4, 6].map(v => <line key={v} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {[0, 0.25, 0.5, 0.75, 1].map(v => <line key={v} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}
          <path d={toPath(logitPts)} fill="none" stroke={C.sam} strokeWidth="3" />
          <path d={toPath(probitPts)} fill="none" stroke={C.smp} strokeWidth="3" strokeDasharray="8,4" />
          <line x1={pad.l + cw - 60} x2={pad.l + cw - 40} y1={pad.t + 10} y2={pad.t + 10} stroke={C.sam} strokeWidth="3" />
          <text x={pad.l + cw - 36} y={pad.t + 14} fontSize="10" fill={C.sam} fontFamily={font} fontWeight="600">Logit</text>
          <line x1={pad.l + cw - 60} x2={pad.l + cw - 40} y1={pad.t + 24} y2={pad.t + 24} stroke={C.smp} strokeWidth="3" strokeDasharray="8,4" />
          <text x={pad.l + cw - 36} y={pad.t + 28} fontSize="10" fill={C.smp} fontFamily={font} fontWeight="600">Probit</text>
          {[-2, 0, 2, 4, 6].map(v => <text key={v} x={sx(v)} y={H - 6} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {[0, 0.5, 1].map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{(v * 100).toFixed(0)}%</text>)}
        </svg>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "4px" }}>The curves are nearly identical. The only visible difference is in the extreme tails.</div>
      </div>

      {/* Comparison table */}
      <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", background: C.bg }}>
          <div style={{ padding: "10px 14px" }}></div>
          <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.sam, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>LOGIT</div>
          <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.smp, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>PROBIT</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
            <div style={{ padding: "8px 14px", fontSize: "11px", fontWeight: 600, color: C.tx, background: C.bg }}>{r.dim}</div>
            <div style={{ padding: "8px 14px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.logit}</div>
            <div style={{ padding: "8px 14px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.probit}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.pop }}>Practical advice:</strong> Use <strong>logit</strong> as your default — it's more common, gives you odds ratios, and reviewers expect it. Use probit if your field (economics) prefers it or if you have a theoretical reason to assume normally distributed errors. The substantive conclusions will be virtually identical either way.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "why", label: "1. Why OLS Breaks" },
  { id: "scurve", label: "2. The S-Curve" },
  { id: "odds", label: "3. Odds & Log-Odds" },
  { id: "interpret", label: "4. Interpretation" },
  { id: "compare", label: "5. Logit vs Probit" },
];

export default function LogitProbit() {
  const [tab, setTab] = useState("why");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.samLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.samLt, color: C.sam, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 6 · Foundations</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Logit &amp; Probit Regression</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>When your outcome is binary (yes/no, success/failure, IPO/no IPO), OLS breaks. Logit and probit models fix this by modeling probabilities with an S-shaped curve.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.sam : C.txD, borderBottom: `2px solid ${tab === t.id ? C.sam : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "why" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="When OLS falls apart" sub="The linear probability model and its three fatal flaws" />
          <Pr>So far, Y has been continuous (revenue, productivity, satisfaction scores). But what if Y is <strong>binary</strong> — it can only be 0 or 1? Examples: Did the startup survive? Did the CEO get fired? Did the firm go public?</Pr>
          <Pr>You <em>could</em> run OLS on binary Y (this is called the <strong>Linear Probability Model</strong>). It sometimes works as a rough approximation. But it has fundamental problems:</Pr>

          <CBox title={<>📉 The Linear Probability Model in Action</>} color={C.sam}>
            <WhyOLSBreaksViz />
          </CBox>

          <Anl>It's like using a ruler to measure a curved road. The ruler is straight and simple, but it misses the bends. For short distances (probabilities near 50%), it's roughly OK. For long distances (probabilities near 0% or 100%), it goes completely off-road.</Anl>

          <NBtn onClick={() => setTab("scurve")} label="Next: The S-Curve Solution →" />
        </div>}

        {tab === "scurve" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="The S-curve: staying between 0 and 1" sub="How logit and probit solve the OLS problem" />
          <Pr>Instead of a straight line, logit and probit use an <strong>S-shaped curve</strong> (sigmoid function) that naturally stays between 0 and 1. As X increases, the predicted probability smoothly transitions from near 0% to near 100%.</Pr>

          <CBox title={<>📐 Interactive S-Curve Explorer</>} color={C.sam}>
            <SCurveViz />
          </CBox>

          <Ins>
            <strong>Try this:</strong> (1) Set slope = 0.3 — the curve rises slowly, meaning the probability changes gradually over a wide range of X values. (2) Set slope = 3.0 — the curve rises steeply, meaning the probability jumps from near 0% to near 100% over a narrow range of X (almost like a light switch). (3) Shift the intercept to move the curve left/right — this changes where the 50% probability point falls on the X axis. (4) Toggle between logit and probit — they're nearly identical.
          </Ins>

          <NBtn onClick={() => setTab("odds")} label="Next: Odds & Log-Odds →" />
        </div>}

        {tab === "odds" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Three ways to say the same thing" sub="Probability, odds, and log-odds (the logit link)" />
          <Pr>Logit regression doesn't model probability directly — it models the <strong>log-odds</strong>. To understand why and what this means, you need to see how probability, odds, and log-odds relate to each other:</Pr>

          <CBox title={<>🔄 The Probability-Odds-LogOdds Chain</>} color={C.sam}>
            <OddsViz />
          </CBox>

          <NBtn onClick={() => setTab("interpret")} label="Next: Interpreting Coefficients →" />
        </div>}

        {tab === "interpret" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="What does a logit coefficient mean?" sub="Three levels of interpretation — from raw to useful" />
          <Pr>In OLS, the coefficient is simple: "a 1-unit increase in X is associated with a β₁ change in Y." In logit, the coefficient is in <strong>log-odds units</strong>, which requires translation. Here are three ways to interpret it, from least to most intuitive:</Pr>

          <CBox title={<>📊 Coefficient Interpreter</>} color={C.sam}>
            <InterpretViz />
          </CBox>

          <Ins>
            <strong>Which should you use?</strong> In your papers, report the <strong>odds ratio</strong> (most common in management journals) and/or <strong>average marginal effects</strong> (most intuitive). In Stata: <code style={{ background: C.bg, padding: "2px 6px", borderRadius: "4px", fontFamily: mono, fontSize: "12px" }}>logit y x, or</code> gives odds ratios, <code style={{ background: C.bg, padding: "2px 6px", borderRadius: "4px", fontFamily: mono, fontSize: "12px" }}>margins, dydx(x)</code> gives marginal effects.
          </Ins>

          <NBtn onClick={() => setTab("compare")} label="Next: Logit vs Probit →" />
        </div>}

        {tab === "compare" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="Logit vs. Probit: does it matter?" sub="Two models, nearly identical results" />

          <CBox title={<>⚖️ Head-to-Head Comparison</>} color={C.sam}>
            <CompareViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> When Y is binary, OLS (the Linear Probability Model) can predict impossible probabilities and gives wrong SEs. Use logit or probit instead.<br />
              <strong>2.</strong> Logit/probit use an <strong>S-shaped curve</strong> that naturally stays between 0 and 1. The effect of X on probability depends on where you are on the curve.<br />
              <strong>3.</strong> Logit models <strong>log-odds</strong>: log(P / (1-P)) = b0 + b1X. This is a linear model on a transformed scale.<br />
              <strong>4.</strong> Interpret coefficients as <strong>odds ratios</strong> (exp(b1) = multiplicative change in odds) or <strong>marginal effects</strong> (change in probability, which varies across observations).<br />
              <strong>5.</strong> <strong>Logit and probit give nearly identical results.</strong> Use logit as default (odds ratios are intuitive); use probit if your field expects it.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
