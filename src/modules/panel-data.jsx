import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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
const firmColors = ["#0284C7", "#D97706", "#059669", "#7C3AED", "#E11D48", "#0891B2"];

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
function CBox({ children, title, color = C.smp }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }

// ─── Generate panel data ────────────────────────────────────────────
function genPanelData() {
  const firms = ["Firm A", "Firm B", "Firm C", "Firm D", "Firm E", "Firm F"];
  // Key: firm effect is CORRELATED with average X (bigger firms spend more AND earn more)
  const firmEffects = [10, 20, 35, 50, 65, 80]; // unobserved quality/size
  const firmBaseX =  [5,  12, 20, 30, 40, 50];  // average X correlates with firm effect
  const trueSlope = 0.5; // true within-firm effect of X on Y
  const data = [];
  firms.forEach((name, fi) => {
    for (let t = 0; t < 8; t++) {
      const x = firmBaseX[fi] + rNorm(0, 3) + t * 0.3;
      const y = firmEffects[fi] + trueSlope * x + rNorm(0, 2.5);
      data.push({ firm: name, fi, t, x, y });
    }
  });
  return data;
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: WHAT IS PANEL DATA
// ═══════════════════════════════════════════════════════════════════
function WhatIsPanelViz() {
  const [highlight, setHighlight] = useState(null);

  const miniData = [
    { firm: "Apple", years: ["2019", "2020", "2021", "2022"], rd: [16, 19, 22, 26], rev: [260, 274, 366, 394] },
    { firm: "Google", years: ["2019", "2020", "2021", "2022"], rd: [26, 28, 32, 40], rev: [162, 183, 258, 283] },
    { firm: "Tesla", years: ["2019", "2020", "2021", "2022"], rd: [1.3, 1.5, 2.6, 3.1], rev: [25, 32, 54, 82] },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        <strong>Panel data</strong> (also called longitudinal data) means you observe the <strong>same units</strong> (firms, people, countries) <strong>across multiple time periods</strong>. Unlike cross-sectional data (one snapshot), panel data lets you track how things change <em>within</em> each unit over time.
      </div>

      {/* Mini spreadsheet */}
      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}`, minWidth: "500px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 60px 80px 80px", background: C.bg, fontFamily: mono, fontSize: "10px", fontWeight: 700, color: C.txM }}>
            <div style={{ padding: "8px 10px" }}>Firm</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}` }}>Year</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}` }}>R&D ($B)</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}` }}>Revenue ($B)</div>
          </div>
          {miniData.map((firm, fi) => firm.years.map((yr, yi) => (
            <div key={`${fi}-${yi}`}
              onMouseEnter={() => setHighlight(fi)}
              onMouseLeave={() => setHighlight(null)}
              style={{
                display: "grid", gridTemplateColumns: "80px 60px 80px 80px",
                borderTop: `1px solid ${C.bdr}`,
                background: highlight === fi ? `${firmColors[fi]}11` : yi % 2 === 0 ? "#fff" : C.bg,
                fontSize: "12px", cursor: "default", transition: "background 0.15s",
              }}>
              <div style={{ padding: "6px 10px", fontWeight: yi === 0 ? 700 : 400, color: firmColors[fi] }}>{yi === 0 ? firm.firm : ""}</div>
              <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txD }}>{yr}</div>
              <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{firm.rd[yi]}</div>
              <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{firm.rev[yi]}</div>
            </div>
          )))}
        </div>
      </div>

      <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
        Hover over the table — each colored block is one firm tracked across 4 years. This structure gives us <strong>two types of variation</strong>:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div style={{ background: C.samBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(2,132,199,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "6px" }}>BETWEEN VARIATION</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>Differences <em>across</em> firms at any given time. Google spends more on R&D than Tesla. Apple has higher revenue than Google. These are cross-firm comparisons — the kind you'd see in a cross-sectional snapshot.</div>
        </div>
        <div style={{ background: C.smpBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "6px" }}>WITHIN VARIATION</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>Changes <em>within</em> the same firm over time. Apple's R&D grew from $16B to $26B. Tesla's revenue tripled. These are within-firm changes — what happens when a specific firm changes its behavior.</div>
        </div>
      </div>

      <Ins>
        <strong>Why this matters:</strong> Cross-sectional analysis (OLS on one snapshot) mixes both types of variation. It might find "firms that spend more on R&D have higher revenue" — but is that because R&D <em>causes</em> revenue, or because <em>big firms</em> happen to do both? Panel data lets you separate these. Fixed effects uses only the within variation, effectively comparing each firm to <em>itself</em> over time.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: WITHIN VS BETWEEN
// ═══════════════════════════════════════════════════════════════════
function WithinBetweenViz() {
  const data = useMemo(() => genPanelData(), []);
  const [view, setView] = useState("pooled");

  const firms = [...new Set(data.map(d => d.firm))];

  // Compute firm means
  const firmMeans = {};
  firms.forEach(f => {
    const fData = data.filter(d => d.firm === f);
    firmMeans[f] = {
      mx: fData.reduce((s, d) => s + d.x, 0) / fData.length,
      my: fData.reduce((s, d) => s + d.y, 0) / fData.length,
    };
  });

  // Demeaned data
  const demeanedData = data.map(d => ({
    ...d,
    xDm: d.x - firmMeans[d.firm].mx,
    yDm: d.y - firmMeans[d.firm].my,
  }));

  // OLS on all data (pooled)
  const allN = data.length;
  const allMx = data.reduce((s, d) => s + d.x, 0) / allN;
  const allMy = data.reduce((s, d) => s + d.y, 0) / allN;
  const pooledB1 = data.reduce((s, d) => s + (d.x - allMx) * (d.y - allMy), 0) / data.reduce((s, d) => s + (d.x - allMx) ** 2, 0);

  // OLS on demeaned data (FE)
  const feB1 = demeanedData.reduce((s, d) => s + d.xDm * d.yDm, 0) / demeanedData.reduce((s, d) => s + d.xDm ** 2, 0);

  // OLS on firm means (Between)
  const firmMeanPts = firms.map(f => firmMeans[f]);
  const bmx = firmMeanPts.reduce((s, p) => s + p.mx, 0) / firmMeanPts.length;
  const bmy = firmMeanPts.reduce((s, p) => s + p.my, 0) / firmMeanPts.length;
  const betweenB1 = firmMeanPts.reduce((s, p) => s + (p.mx - bmx) * (p.my - bmy), 0) / firmMeanPts.reduce((s, p) => s + (p.mx - bmx) ** 2, 0);
  const betweenB0 = bmy - betweenB1 * bmx;

  const W = 540, H = 340, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  // Dynamic ranges
  const ptsToShow = view === "demeaned" ? demeanedData : data;
  const xKey = view === "demeaned" ? "xDm" : "x";
  const yKey = view === "demeaned" ? "yDm" : "y";
  // For "between" view, still use raw data range but only show means
  const xVals = view === "between" ? firms.map(f => firmMeans[f].mx) : ptsToShow.map(p => p[xKey]);
  const yVals = view === "between" ? firms.map(f => firmMeans[f].my) : ptsToShow.map(p => p[yKey]);
  const xPad2 = (Math.max(...xVals) - Math.min(...xVals)) * 0.1 + 2;
  const yPad2 = (Math.max(...yVals) - Math.min(...yVals)) * 0.1 + 2;
  const xMin = Math.floor(Math.min(...xVals) - xPad2);
  const xMax = Math.ceil(Math.max(...xVals) + xPad2);
  const yMin = Math.floor(Math.min(...yVals) - yPad2);
  const yMax = Math.ceil(Math.max(...yVals) + yPad2);
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin)) * cw;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Ticks
  const xStep = Math.max(1, Math.round((xMax - xMin) / 6));
  const yStep = Math.max(1, Math.round((yMax - yMin) / 6));
  const xTicks = [];
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) xTicks.push(v);
  const yTicks = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        This is the core insight of panel data. Toggle between views to see how the same data tells different stories depending on which variation you use:
      </div>

      <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "14px", flexWrap: "wrap" }}>
        {[
          { id: "pooled", label: "Pooled OLS" },
          { id: "colored", label: "Reveal Firms" },
          { id: "between", label: "Between (firm means)" },
          { id: "demeaned", label: "Within (Fixed Effects)" },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "8px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: view === v.id ? C.smp : C.bdr,
            background: view === v.id ? C.smpBg : "transparent",
            color: view === v.id ? C.smp : C.txD,
            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {xTicks.map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {yTicks.map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

          {/* Firm-level regression lines in colored view */}
          {view === "colored" && firms.map((f, fi) => {
            const fData = data.filter(d => d.firm === f);
            const fMx = fData.reduce((s, d) => s + d.x, 0) / fData.length;
            const fMy = fData.reduce((s, d) => s + d.y, 0) / fData.length;
            const fB1 = fData.reduce((s, d) => s + (d.x - fMx) * (d.y - fMy), 0) / fData.reduce((s, d) => s + (d.x - fMx) ** 2, 0);
            const fB0 = fMy - fB1 * fMx;
            const fXMin = Math.min(...fData.map(d => d.x)) - 1;
            const fXMax = Math.max(...fData.map(d => d.x)) + 1;
            return <line key={f} x1={sx(fXMin)} x2={sx(fXMax)} y1={sy(fB0 + fB1 * fXMin)} y2={sy(fB0 + fB1 * fXMax)} stroke={firmColors[fi]} strokeWidth="1.5" opacity="0.4" />;
          })}

          {/* Regression lines */}
          {view === "pooled" && (
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(allMy + pooledB1 * (xMin - allMx))} y2={sy(allMy + pooledB1 * (xMax - allMx))} stroke={C.rose} strokeWidth="2.5" />
          )}
          {view === "between" && (
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(betweenB0 + betweenB1 * xMin)} y2={sy(betweenB0 + betweenB1 * xMax)} stroke={C.pop} strokeWidth="2.5" />
          )}
          {view === "demeaned" && (
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(feB1 * xMin)} y2={sy(feB1 * xMax)} stroke={C.smp} strokeWidth="2.5" />
          )}

          {/* Data points — hide in "between" view */}
          {view !== "between" && ptsToShow.map((d, i) => (
            <circle key={i} cx={sx(d[xKey])} cy={sy(d[yKey])} r="4.5"
              fill={view === "pooled" ? C.txM : firmColors[d.fi]}
              opacity={view === "pooled" ? 0.4 : 0.6}
              stroke="#fff" strokeWidth="1" />
          ))}

          {/* Firm mean dots — show in colored and between views */}
          {(view === "colored" || view === "between") && firms.map((f, fi) => (
            <g key={`mean-${f}`}>
              <circle cx={sx(firmMeans[f].mx)} cy={sy(firmMeans[f].my)} r={view === "between" ? 10 : 7} fill={firmColors[fi]} stroke="#fff" strokeWidth="2.5" />
              {view === "between" && <text x={sx(firmMeans[f].mx)} y={sy(firmMeans[f].my) - 14} textAnchor="middle" fontSize="10" fontWeight="600" fill={firmColors[fi]} fontFamily={font}>{f}</text>}
            </g>
          ))}

          {/* Faded individual points in between view */}
          {view === "between" && data.map((d, i) => (
            <circle key={`bg${i}`} cx={sx(d.x)} cy={sy(d.y)} r="3" fill={firmColors[d.fi]} opacity="0.12" />
          ))}

          {/* Zero crosshairs for demeaned */}
          {view === "demeaned" && <>
            <line x1={sx(0)} x2={sx(0)} y1={pad.t} y2={pad.t + ch} stroke={C.pop} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            <line x1={pad.l} x2={pad.l + cw} y1={sy(0)} y2={sy(0)} stroke={C.pop} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          </>}

          {/* Axes */}
          {xTicks.map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {yTicks.map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          <text x={sx((xMin + xMax) / 2)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>{view === "demeaned" ? "X (demeaned)" : "X (R&D spending)"}</text>
          <text x="12" y={sy((yMin + yMax) / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy((yMin + yMax) / 2)})`}>{view === "demeaned" ? "Y (demeaned)" : "Y (Revenue)"}</text>
        </svg>

        {/* Stats */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          {view === "pooled" && <div style={{ background: C.roseBg, borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(225,29,72,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>POOLED SLOPE</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.rose }}>{pooledB1.toFixed(3)}</div>
          </div>}
          {view === "between" && <div style={{ background: C.popBg, borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(217,119,6,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>BETWEEN SLOPE</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.pop }}>{betweenB1.toFixed(3)}</div>
          </div>}
          {view === "demeaned" && <>
            <div style={{ background: C.smpBg, borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(124,58,237,0.15)", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>WITHIN SLOPE (FE)</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.smp }}>{feB1.toFixed(3)}</div>
            </div>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>TRUE SLOPE</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.grn }}>0.500</div>
            </div>
          </>}
          {(view === "between" || view === "demeaned") && (
            <div style={{ background: C.roseBg, borderRadius: "8px", padding: "8px 14px", border: "1px solid rgba(225,29,72,0.15)", textAlign: "center", opacity: 0.6 }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>POOLED (for comparison)</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.rose }}>{pooledB1.toFixed(3)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Explanation for each view */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {view === "pooled" && <>
          <strong style={{ color: C.rose }}>Pooled OLS (slope = {pooledB1.toFixed(3)}):</strong> Treats every observation as independent — ignores the fact that observations from the same firm are related. The slope is steep because it mixes two things: (1) the within-firm effect (when a firm increases R&D, its revenue goes up by 0.5) and (2) the between-firm confound (firms that spend more on R&D happen to be larger firms with higher revenue). The pooled slope is <strong>biased upward</strong>.
        </>}
        {view === "colored" && <>
          <strong style={{ color: C.smp }}>Now you see the panel structure.</strong> Each color is one firm tracked over 8 years. The large dots are firm means. Notice two patterns: the <em>between-firm</em> trend (large dots trending steeply up-right — bigger firms have more R&D and more revenue) and the <em>within-firm</em> slopes (faint lines through each cluster — much flatter). The steep between pattern is driven by unobserved firm characteristics, not by R&D itself.
        </>}
        {view === "between" && <>
          <strong style={{ color: C.pop }}>Between regression (slope = {betweenB1.toFixed(3)}):</strong> This uses only the firm means — one dot per firm. It asks: "Do firms with higher <em>average</em> R&D have higher <em>average</em> revenue?" The answer is yes, but the slope is very steep ({betweenB1.toFixed(3)}) because it's contaminated by unobserved firm differences. Bigger, better-managed firms both spend more on R&D <em>and</em> earn more revenue — but that's not because R&D causes revenue. This is <strong>omitted variable bias at the firm level</strong>.
        </>}
        {view === "demeaned" && <>
          <strong style={{ color: C.smp }}>Fixed Effects / Within (slope = {feB1.toFixed(3)}, true = 0.500):</strong> Each firm's mean is subtracted. All clusters collapse to (0,0) — between-firm differences are eliminated. The slope now captures only <em>within-firm</em> changes: when <em>this firm</em> spends more on R&D than its own average, how much more revenue than its own average does it earn? The FE slope ({feB1.toFixed(3)}) is much closer to the true effect (0.500). Compare: Pooled = {pooledB1.toFixed(3)} (biased), Between = {betweenB1.toFixed(3)} (most biased), Within = {feB1.toFixed(3)} (close to truth).
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: FIXED EFFECTS
// ═══════════════════════════════════════════════════════════════════
function FixedEffectsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Fixed Effects regression is one of the most important tools in management research. It controls for <strong>all</strong> time-invariant differences between units — even ones you can't measure.
      </div>

      {/* How FE works */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>What Fixed Effects actually does — step by step</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.smpBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.smp, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong>Compute each firm's average X and average Y</strong> across all its time periods. Firm A's average R&D might be $20B; Firm B's might be $5B.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.smpBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.smp, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong>Subtract each firm's mean from its own observations</strong> (this is called "demeaning"). Now every firm's data is centered around zero. Firm A's observation becomes "how much more/less R&D than Firm A's average?"
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.smpBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.smp, fontFamily: mono, flexShrink: 0 }}>3</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong>Run OLS on the demeaned data.</strong> The slope you get is the fixed effects estimate — it uses only within-firm variation.
            </div>
          </div>
        </div>
      </div>

      {/* What it controls for */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>What does this accomplish?</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "6px" }}>✓ CONTROLS FOR</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            <strong>All time-invariant firm characteristics</strong> — things that differ across firms but don't change over time within a firm. This includes industry, founding year, country, CEO personality, corporate culture, firm DNA, and any other stable unobserved characteristic. You don't need to measure or include these as controls — FE removes them automatically through demeaning.
          </div>
        </div>
        <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "6px" }}>✗ DOES NOT CONTROL FOR</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            <strong>Time-varying confounders</strong> — things that change within a firm over time and affect both X and Y. For example, a new CEO might simultaneously increase R&D spending and improve revenue through better strategy. FE can't distinguish the R&D effect from the new-CEO effect unless you explicitly control for CEO changes.
          </div>
        </div>
      </div>

      <Anl>
        Fixed effects is like comparing each person to <em>themselves</em>. Instead of asking "do people who exercise more weigh less?" (which confuses genetics, age, diet...), FE asks "when <em>this specific person</em> exercises more in a given month, do <em>they</em> weigh less that month compared to their own average?" Each person is their own control group.
      </Anl>

      {/* The equation */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 20px", border: `1px solid ${C.bdr}`, marginTop: "10px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE FIXED EFFECTS EQUATION</div>
        <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
          Y<sub>it</sub> = <span style={{ color: C.smp }}>α<sub>i</sub></span> + β₁X<sub>it</sub> + ε<sub>it</sub>
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
          <span style={{ color: C.smp, fontWeight: 600 }}>α<sub>i</sub></span> = a separate intercept for each firm (the "fixed effect" — absorbs all time-invariant differences)
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "6px" }}>
          In Stata: <code style={{ background: C.card, padding: "2px 6px", borderRadius: "3px", fontFamily: mono }}>xtreg y x, fe</code> or <code style={{ background: C.card, padding: "2px 6px", borderRadius: "3px", fontFamily: mono }}>reghdfe y x, absorb(firm)</code>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: RANDOM EFFECTS
// ═══════════════════════════════════════════════════════════════════
function RandomEffectsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Random Effects (RE) is an alternative to Fixed Effects. It uses <strong>both</strong> between and within variation — making it more efficient (smaller SEs) but requiring a stronger assumption.
      </div>

      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.pop, marginBottom: "10px" }}>The key assumption: are unobserved firm differences correlated with X?</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: C.smpBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "4px" }}>FIXED EFFECTS assumes:</div>
              <div style={{ fontSize: "13px", lineHeight: 1.7 }}>The unobserved firm characteristics (α<sub>i</sub>) <strong>may be correlated</strong> with X. This is the safer assumption. Big firms might systematically spend more on R&D — so firm size (part of α<sub>i</sub>) correlates with X. FE handles this by removing α<sub>i</sub> entirely through demeaning.</div>
            </div>
            <div style={{ background: C.popBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(217,119,6,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, fontFamily: mono, marginBottom: "4px" }}>RANDOM EFFECTS assumes:</div>
              <div style={{ fontSize: "13px", lineHeight: 1.7 }}>The unobserved firm characteristics (α<sub>i</sub>) are <strong>uncorrelated</strong> with X. This is a stronger assumption. It says: the things that make firms inherently different (culture, industry, management quality) have nothing to do with how much they spend on R&D. If this assumption holds, RE is more efficient. If it's violated, RE is biased.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>When might RE be appropriate?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {[
          { ok: true, text: "Your X variable is something randomly assigned or exogenous (e.g., a policy shock that affects some firms but not others, and assignment isn't based on firm characteristics)" },
          { ok: true, text: "You need to estimate the effect of time-invariant variables (e.g., industry, country). FE can't do this because demeaning removes all time-invariant variables — including the ones you care about." },
          { ok: false, text: "X is something firms choose (e.g., R&D spending, CEO compensation). The choice is likely correlated with unobserved firm characteristics. Use FE." },
          { ok: false, text: "You suspect omitted variable bias from time-invariant confounders. Use FE — it removes all of them." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ fontSize: "16px", flexShrink: 0, marginTop: "2px" }}>{item.ok ? "✓" : "✗"}</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, color: item.ok ? C.grn : C.rose }}>{item.ok ? "RE may be OK:" : "Use FE instead:"}</span> {item.text}
            </div>
          </div>
        ))}
      </div>

      {/* The equation */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 20px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE RANDOM EFFECTS EQUATION</div>
        <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
          Y<sub>it</sub> = β₀ + β₁X<sub>it</sub> + <span style={{ color: C.pop }}>α<sub>i</sub></span> + ε<sub>it</sub>
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
          <span style={{ color: C.pop, fontWeight: 600 }}>α<sub>i</sub></span> is treated as a random variable (part of the composite error), not a parameter to estimate.
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "6px" }}>
          In Stata: <code style={{ background: C.card, padding: "2px 6px", borderRadius: "3px", fontFamily: mono }}>xtreg y x, re</code>
        </div>
      </div>

      {/* RE vs Pooled OLS */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginTop: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Wait — how is RE different from Pooled OLS? Both use all the data...</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
          Good question. Pooled OLS and RE both use between and within variation, but they handle the panel structure differently:
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(225,29,72,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>POOLED OLS: pretends the panel doesn't exist</div>
              <div style={{ fontSize: "13px", lineHeight: 1.7 }}>It treats all 48 observations (6 firms × 8 years) as if they came from 48 different firms. This ignores the fact that observations within the same firm are correlated — Firm A's revenue in 2020 is not independent of Firm A's revenue in 2021. Result: <strong>standard errors are too small</strong> (because the effective sample size is 6 firms, not 48 independent observations), making you overconfident in your results.</div>
            </div>
            <div style={{ background: C.popBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(217,119,6,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, fontFamily: mono, marginBottom: "4px" }}>RANDOM EFFECTS: respects the panel structure</div>
              <div style={{ fontSize: "13px", lineHeight: 1.7 }}>RE recognizes that observations within the same firm are correlated (through the shared α<sub>i</sub>). It uses a technique called <strong>Generalized Least Squares (GLS)</strong> to optimally weight the between and within variation. This produces <strong>correct standard errors</strong> that account for the clustering within firms. RE also produces a more efficient (more precise) estimate than FE because it uses both sources of variation — but only if its assumption (α<sub>i</sub> uncorrelated with X) holds.</div>
            </div>
          </div>
          <div style={{ marginTop: "10px", fontSize: "13px", color: C.txD }}>
            <strong>In short:</strong> Pooled OLS = ignores the panel → wrong SEs. RE = accounts for the panel → correct SEs + uses all variation efficiently. FE = removes between variation entirely → correct SEs + controls for unobserved heterogeneity.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: FE vs RE
// ═══════════════════════════════════════════════════════════════════
function FEvsREViz() {
  const rows = [
    { dim: "Uses which variation?", fe: "Within only (each unit compared to itself)", re: "Both within and between (weighted average)" },
    { dim: "Key assumption", fe: "None about correlation of αᵢ with X", re: "αᵢ must be uncorrelated with X" },
    { dim: "If assumption violated", fe: "Still consistent (safe)", re: "Biased (dangerous)" },
    { dim: "Efficiency", fe: "Less efficient (larger SEs) — throws away between variation", re: "More efficient (smaller SEs) — uses all variation" },
    { dim: "Time-invariant variables", fe: "Cannot estimate effects (removed by demeaning)", re: "Can estimate effects (e.g., industry, gender)" },
    { dim: "When to use", fe: "Default in most management research — safer", re: "When X is plausibly exogenous or you need time-invariant effects" },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The choice between FE and RE is one of the most common decisions in empirical research. Here's the full comparison and the formal test:
      </div>

      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}`, minWidth: "560px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", background: C.bg }}>
            <div style={{ padding: "10px 14px" }}></div>
            <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.smp, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>FIXED EFFECTS</div>
            <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.pop, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>RANDOM EFFECTS</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: C.tx, background: C.bg }}>{r.dim}</div>
              <div style={{ padding: "8px 12px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.fe}</div>
              <div style={{ padding: "8px 12px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.re}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hausman test */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>The Hausman Test: FE or RE?</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8, marginBottom: "12px" }}>
          The Hausman test compares the FE and RE coefficients. The logic is simple:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <strong>If the RE assumption holds</strong> (α<sub>i</sub> uncorrelated with X): both FE and RE are consistent, so their estimates should be similar. Any difference is just sampling noise.
          </div>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <strong>If the RE assumption is violated</strong> (α<sub>i</sub> correlates with X): FE is still consistent but RE is biased. Their estimates will systematically differ.
          </div>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <strong>The test:</strong> Are the FE and RE estimates significantly different? If <strong>p {"<"} 0.05 → reject RE</strong>, use FE. If p ≥ 0.05, RE is acceptable (but FE is still safe).
          </div>
        </div>
        <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>In Stata:</div>
          <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.8 }}>
            xtreg y x, fe<br />
            estimates store FE<br />
            xtreg y x, re<br />
            estimates store RE<br />
            hausman FE RE
          </div>
        </div>
      </div>

      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", fontSize: "14px", lineHeight: 1.75, color: C.txB }}>
        <strong style={{ color: C.pop }}>Practical advice for management research:</strong> Use <strong>Fixed Effects as your default</strong>. Most management variables (R&D, strategy, governance) are endogenous — firms choose them partly based on unobserved characteristics. FE is the safer choice. Use RE only when you have a compelling theoretical reason to believe the unobserved heterogeneity is uncorrelated with X, or when you need to estimate the effect of a time-invariant variable. Always report the Hausman test.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "what", label: "1. What is Panel Data?" },
  { id: "within", label: "2. Within vs Between" },
  { id: "fe", label: "3. Fixed Effects" },
  { id: "re", label: "4. Random Effects" },
  { id: "choose", label: "5. FE vs RE" },
];

export default function PanelData() {
  const [tab, setTab] = useState("what");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 10 · Panel & Multilevel</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Panel Data: Fixed &amp; Random Effects</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>When you observe the same firms, people, or countries over multiple time periods, you have panel data — and a powerful way to control for unobserved differences between units.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "what" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="What is panel data?" sub="Same units, multiple time periods — a structure that unlocks new power" />
          <Pr>So far, all our methods assumed <strong>cross-sectional data</strong> — one observation per unit, taken at a single point in time. But most management datasets are <strong>panel data</strong>: the same firms observed year after year, the same employees surveyed quarter after quarter.</Pr>

          <CBox title={<>📋 Panel Data Structure</>} color={C.smp}>
            <WhatIsPanelViz />
          </CBox>

          <NBtn onClick={() => setTab("within")} label="Next: Within vs Between →" />
        </div>}

        {tab === "within" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Two types of variation" sub="The insight that makes panel methods powerful" />
          <Pr>The central idea in panel data: your data contains <strong>two kinds of variation</strong>, and they tell very different stories. The key to panel methods is choosing which variation to use.</Pr>

          <CBox title={<>📊 The Within vs Between Decomposition</>} color={C.smp}>
            <WithinBetweenViz />
          </CBox>

          <NBtn onClick={() => setTab("fe")} label="Next: Fixed Effects →" />
        </div>}

        {tab === "fe" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Fixed Effects" sub="Comparing each unit to itself — the workhorse of panel data" />

          <CBox title={<>🔒 How Fixed Effects Works</>} color={C.smp}>
            <FixedEffectsViz />
          </CBox>

          <NBtn onClick={() => setTab("re")} label="Next: Random Effects →" />
        </div>}

        {tab === "re" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Random Effects" sub="More efficient, but with a price — a stronger assumption" />

          <CBox title={<>🎲 Random Effects: the tradeoff</>} color={C.pop}>
            <RandomEffectsViz />
          </CBox>

          <NBtn onClick={() => setTab("choose")} label="Next: FE vs RE →" />
        </div>}

        {tab === "choose" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="Choosing between FE and RE" sub="The Hausman test and practical guidance" />

          <CBox title={<>⚖️ The Full Comparison</>} color={C.smp}>
            <FEvsREViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>Panel data</strong> = same units observed across multiple time periods. This gives you two types of variation: between (across units) and within (within units over time).<br />
              <strong>2.</strong> <strong>Pooled OLS</strong> mixes both types, which can produce biased estimates if unobserved unit characteristics correlate with X.<br />
              <strong>3.</strong> <strong>Fixed Effects</strong> uses only within variation by demeaning each unit. This controls for <em>all</em> time-invariant unobserved differences — but can't estimate effects of time-invariant variables.<br />
              <strong>4.</strong> <strong>Random Effects</strong> uses both within and between variation (more efficient), but assumes unobserved heterogeneity is uncorrelated with X. If this assumption fails, RE is biased.<br />
              <strong>5.</strong> The <strong>Hausman test</strong> compares FE and RE. If p {"<"} 0.05, the RE assumption is rejected → use FE.<br />
              <strong>6.</strong> <strong>Default to FE</strong> in management research. Most X variables are endogenous (firms choose them). FE is the safer choice.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
