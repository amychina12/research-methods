import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function linReg(pts) {
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
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.rose, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.rose }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.roseBg, border: "1px solid rgba(225,29,72,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.rose, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: WHAT IS ENDOGENEITY
// ═══════════════════════════════════════════════════════════════════
function WhatIsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        All the methods you've learned so far — OLS, logit, count models, FE, HLM — share a critical assumption: <strong>the independent variable X is not correlated with the error term ε</strong>. When this assumption is violated, X is <strong>endogenous</strong>, and your coefficient is biased. It no longer measures what you think it measures.
      </div>

      {/* The core diagram */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>The fundamental assumption of regression</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "14px", marginBottom: "14px" }}>
          <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(5,150,105,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "4px" }}>✓ EXOGENOUS</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>X is uncorrelated with ε. OLS gives the right answer. The coefficient captures the true effect of X on Y.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: "20px", color: C.txM }}>vs</div>
          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(225,29,72,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>✗ ENDOGENOUS</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>X is correlated with ε. OLS gives the wrong answer. The coefficient captures the effect of X <em>plus</em> the effect of whatever is hiding in ε.</div>
          </div>
        </div>

        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75 }}>
          Remember what ε contains: <strong>everything that affects Y but isn't in your model</strong>. If any of those omitted things also happen to correlate with X, then X "takes credit" for their effect. The coefficient on X absorbs the influence of whatever is lurking in the error term.
        </div>
      </div>

      <Anl>
        Imagine you're trying to measure whether a new fertilizer (X) makes plants grow taller (Y). But the gardener who uses more fertilizer also happens to give the plants more water and sunlight (things hiding in ε). When you find that fertilized plants grow taller, you can't tell if it's the fertilizer, the water, the sunlight, or all three. The fertilizer coefficient absorbs all of it. That's endogeneity — X gets credit for things it didn't do.
      </Anl>

      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginTop: "14px" }}>
        <strong>Why is this such a big deal in management research?</strong> Because almost every interesting X variable in strategy is something that firms <em>choose</em> — R&D spending, CEO compensation, diversification strategy, governance structure. And the things that influence those choices (firm quality, managerial ability, corporate culture) also directly affect Y (performance, survival, innovation). The choice variable and the outcome share common causes, making endogeneity the default condition, not the exception.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: BIAS DEMO
// ═══════════════════════════════════════════════════════════════════
function BiasDemoViz() {
  const [confoundStrength, setConfoundStrength] = useState(0);
  const trueEffect = 0.5;

  const data = useMemo(() => {
    return Array.from({ length: 120 }, () => {
      const ability = rNorm(0, 1);  // unobserved confounder
      const x = 3 + ability * confoundStrength + rNorm(0, 1); // X is influenced by ability
      const y = 1 + trueEffect * x + ability * 2 + rNorm(0, 1.5); // Y is also influenced by ability
      return { x, y, ability };
    });
  }, [confoundStrength]);

  const pts = data.map(d => ({ x: d.x, y: d.y }));
  const reg = linReg(pts);
  const bias = reg.b1 - trueEffect;

  // Chart
  const W = 540, H = 300, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xVals = pts.map(p => p.x), yVals = pts.map(p => p.y);
  const xMin = Math.floor(Math.min(...xVals) - 1), xMax = Math.ceil(Math.max(...xVals) + 1);
  const yMin = Math.floor(Math.min(...yVals) - 1), yMax = Math.ceil(Math.max(...yVals) + 1);
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin)) * cw;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const xStep = Math.max(1, Math.round((xMax - xMin) / 6));
  const yStep = Math.max(1, Math.round((yMax - yMin) / 6));
  const xTicks = []; for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) xTicks.push(v);
  const yTicks = []; for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The true effect of X on Y is <strong style={{ color: C.grn }}>0.50</strong> (we designed the data this way — like a god-mode lab). But there's a hidden confounder ("ability") that affects both X and Y. Drag the slider to increase the confounder's influence on X, and watch OLS get the wrong answer:
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Confounder's influence on X (endogeneity strength)</div>
        <input type="range" min="0" max="3" step="0.1" value={confoundStrength} onChange={e => setConfoundStrength(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.rose }} />
        <div style={{ fontSize: "13px", fontWeight: 600, color: confoundStrength === 0 ? C.grn : C.rose, fontFamily: mono }}>{confoundStrength === 0 ? "No endogeneity (ability doesn't affect X)" : `Endogeneity strength = ${confoundStrength.toFixed(1)} (ability drives both X and Y)`}</div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {xTicks.map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {yTicks.map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

          {/* OLS line */}
          <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(reg.b0 + reg.b1 * xMin)} y2={sy(reg.b0 + reg.b1 * xMax)} stroke={C.rose} strokeWidth="2.5" />

          {/* True effect line (through mean) */}
          {confoundStrength > 0 && (() => {
            const meanX = data.reduce((s, d) => s + d.x, 0) / data.length;
            const meanY = data.reduce((s, d) => s + d.y, 0) / data.length;
            const trueB0 = meanY - trueEffect * meanX;
            return <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(trueB0 + trueEffect * xMin)} y2={sy(trueB0 + trueEffect * xMax)} stroke={C.grn} strokeWidth="2" strokeDasharray="8,4" />;
          })()}

          {/* Data points */}
          {data.map((d, i) => (
            <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="3.5" fill={C.sam} opacity="0.4" stroke="#fff" strokeWidth="0.5" />
          ))}

          {/* Legend */}
          <line x1={pad.l + cw - 120} x2={pad.l + cw - 100} y1={pad.t + 10} y2={pad.t + 10} stroke={C.rose} strokeWidth="2.5" />
          <text x={pad.l + cw - 96} y={pad.t + 14} fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600">OLS estimate</text>
          {confoundStrength > 0 && <>
            <line x1={pad.l + cw - 120} x2={pad.l + cw - 100} y1={pad.t + 26} y2={pad.t + 26} stroke={C.grn} strokeWidth="2" strokeDasharray="8,4" />
            <text x={pad.l + cw - 96} y={pad.t + 30} fontSize="10" fill={C.grn} fontFamily={font} fontWeight="600">True effect</text>
          </>}

          {xTicks.map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {yTicks.map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          <text x={sx((xMin + xMax) / 2)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X (e.g. R&D spending)</text>
          <text x="12" y={sy((yMin + yMax) / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy((yMin + yMax) / 2)})`}>Y (e.g. Performance)</text>
        </svg>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
          <SC label="True Effect" value="0.500" color={C.grn} />
          <SC label="OLS Estimate" value={reg.b1.toFixed(3)} color={Math.abs(bias) < 0.1 ? C.grn : C.rose} />
          <SC label="Bias" value={bias > 0 ? "+" + bias.toFixed(3) : bias.toFixed(3)} color={Math.abs(bias) < 0.1 ? C.grn : C.rose} />
        </div>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {confoundStrength === 0 ? (
          <><strong style={{ color: C.grn }}>No endogeneity.</strong> The confounder ("ability") affects Y but doesn't affect X. OLS correctly estimates the effect as ≈0.50. There's no bias because X and ε are uncorrelated.</>
        ) : (
          <><strong style={{ color: C.rose }}>Endogeneity present. OLS is biased upward by {bias.toFixed(3)}.</strong> "Ability" now drives both X and Y. High-ability firms spend more on R&D (higher X) <em>and</em> perform better (higher Y) regardless of R&D. OLS can't tell these apart — it attributes all of it to X. The estimated slope ({reg.b1.toFixed(3)}) is steeper than the true effect (0.500) because X is "taking credit" for ability's effect on Y. {confoundStrength >= 2 ? "At this strength, more than half of what OLS attributes to X is actually the confounder's effect." : ""}</>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: THREE SOURCES
// ═══════════════════════════════════════════════════════════════════
function SourcesViz() {
  const [source, setSource] = useState("omitted");

  const sources = [
    { id: "omitted", label: "Omitted Variable Bias", color: C.rose },
    { id: "reverse", label: "Reverse Causality", color: C.pop },
    { id: "measurement", label: "Measurement Error", color: C.smp },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Endogeneity isn't one thing — it has three distinct sources, each requiring different solutions. Click through each to understand the mechanism and see management research examples:
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {sources.map(s => (
          <button key={s.id} onClick={() => setSource(s.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: source === s.id ? s.color : C.bdr,
            background: source === s.id ? `${s.color}11` : "transparent",
            color: source === s.id ? s.color : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, minHeight: "360px" }}>
        {source === "omitted" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Omitted Variable Bias (OVB)</div>

            {/* DAG */}
            <svg viewBox="0 0 360 130" style={{ width: "100%", maxWidth: "380px", display: "block", margin: "0 auto 14px" }}>
              <defs><marker id="arrOVB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.tx} /></marker></defs>
              <rect x="10" y="75" width="90" height="36" rx="8" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
              <text x="55" y="97" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.sam}>X (R&D)</text>
              <rect x="260" y="75" width="90" height="36" rx="8" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
              <text x="305" y="97" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.smp}>Y (Perf.)</text>
              <rect x="120" y="5" width="120" height="36" rx="8" fill={C.roseBg} stroke={C.rose} strokeWidth="2" />
              <text x="180" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.rose}>Z (Ability)</text>
              <text x="180" y="54" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>omitted from model!</text>
              <line x1="100" x2="255" y1="93" y2="93" stroke={C.tx} strokeWidth="2" markerEnd="url(#arrOVB)" />
              <text x="178" y="88" textAnchor="middle" fontSize="10" fill={C.tx}>?</text>
              <line x1="145" x2="70" y1="41" y2="75" stroke={C.rose} strokeWidth="2" markerEnd="url(#arrOVB)" />
              <line x1="215" x2="290" y1="41" y2="75" stroke={C.rose} strokeWidth="2" markerEnd="url(#arrOVB)" />
            </svg>

            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
              <strong>The mechanism:</strong> A third variable Z affects <em>both</em> X and Y, but isn't included in your model. Because Z lives in the error term ε, and Z correlates with X, you get Corr(X, ε) ≠ 0. OLS attributes Z's effect on Y to X.

              <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}`, margin: "12px 0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Management example:</div>
                <div style={{ fontSize: "13px", lineHeight: 1.7 }}>You regress firm performance (Y) on R&D spending (X). But <strong>managerial ability</strong> (Z) drives both: talented managers invest more in R&D <em>and</em> run firms more effectively. If ability isn't in your model, OLS overstates the effect of R&D. The coefficient on R&D absorbs ability's effect on performance.</div>
              </div>

              <div style={{ fontSize: "12px", color: C.txD }}>
                <strong>Direction of bias:</strong> Depends on the signs. If Z positively affects both X and Y, the bias is upward (OLS overestimates). If Z has opposite effects, the bias can be downward.
              </div>
            </div>
          </div>
        )}

        {source === "reverse" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.pop, marginBottom: "10px" }}>Reverse Causality (Simultaneity)</div>

            <svg viewBox="0 0 360 100" style={{ width: "100%", maxWidth: "380px", display: "block", margin: "0 auto 14px" }}>
              <defs><marker id="arrRC" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.tx} /></marker></defs>
              <rect x="10" y="35" width="100" height="36" rx="8" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
              <text x="60" y="57" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.sam}>X (CSR)</text>
              <rect x="250" y="35" width="100" height="36" rx="8" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
              <text x="300" y="57" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.smp}>Y (Profit)</text>
              <line x1="110" x2="245" y1="47" y2="47" stroke={C.tx} strokeWidth="2" markerEnd="url(#arrRC)" />
              <text x="178" y="42" textAnchor="middle" fontSize="10" fill={C.tx}>does CSR → profit?</text>
              <line x1="250" x2="115" y1="63" y2="63" stroke={C.pop} strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#arrRC)" />
              <text x="178" y="78" textAnchor="middle" fontSize="10" fill={C.pop}>or profit → CSR?</text>
            </svg>

            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
              <strong>The mechanism:</strong> You hypothesize X → Y, but Y also causes X. This creates a feedback loop: X and ε are correlated because Y (which contains ε) feeds back into X.

              <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}`, margin: "12px 0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, marginBottom: "4px" }}>Management example:</div>
                <div style={{ fontSize: "13px", lineHeight: 1.7 }}>Does CSR (X) improve financial performance (Y)? Or do more profitable firms simply have more resources to invest in CSR? If the relationship runs in both directions simultaneously, OLS mixes both effects into one coefficient. You can't tell if CSR drives profits or profits drive CSR — or both.</div>
              </div>

              <div style={{ fontSize: "12px", color: C.txD }}>
                <strong>Direction of bias:</strong> Usually inflates the coefficient in the direction of the feedback loop. If high Y causes high X and high X causes high Y, OLS overstates both.
              </div>
            </div>
          </div>
        )}

        {source === "measurement" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>Measurement Error in X (Attenuation Bias)</div>

            <svg viewBox="0 0 360 100" style={{ width: "100%", maxWidth: "380px", display: "block", margin: "0 auto 14px" }}>
              <defs><marker id="arrME" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.tx} /></marker></defs>
              <rect x="10" y="35" width="100" height="36" rx="8" fill={C.txM + "33"} stroke={C.txM} strokeWidth="2" strokeDasharray="4,3" />
              <text x="60" y="51" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.txM}>X* (true)</text>
              <text x="60" y="64" textAnchor="middle" fontSize="9" fill={C.txD}>unobserved</text>
              <rect x="130" y="35" width="100" height="36" rx="8" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
              <text x="180" y="51" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.sam}>X (measured)</text>
              <text x="180" y="64" textAnchor="middle" fontSize="9" fill={C.txD}>= X* + noise</text>
              <rect x="250" y="35" width="100" height="36" rx="8" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
              <text x="300" y="57" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.smp}>Y</text>
              <line x1="110" x2="125" y1="53" y2="53" stroke={C.txM} strokeWidth="2" markerEnd="url(#arrME)" />
              <line x1="230" x2="245" y1="53" y2="53" stroke={C.tx} strokeWidth="2" markerEnd="url(#arrME)" />
            </svg>

            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
              <strong>The mechanism:</strong> You can't perfectly measure X. What you observe is X = X* + noise, where X* is the true value and noise is random error. This noise ends up in ε (since the model uses X, not X*), and since X contains the same noise, Corr(X, ε) ≠ 0.

              <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}`, margin: "12px 0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, marginBottom: "4px" }}>Management example:</div>
                <div style={{ fontSize: "13px", lineHeight: 1.7 }}>You want to measure the effect of "firm innovation capability" (X*) on performance (Y). But you proxy it with patent counts (X), which is a noisy measure — some innovative firms don't patent, some patent-heavy firms aren't truly innovative. The measurement noise biases your coefficient <strong>toward zero</strong> (attenuation bias). You find a weaker effect than actually exists.</div>
              </div>

              <div style={{ fontSize: "12px", color: C.txD }}>
                <strong>Direction of bias:</strong> Classical measurement error in X <strong>always attenuates</strong> (shrinks toward zero). This is the one case where the direction is predictable. With multiple X variables, measurement error in one can bias coefficients on others in any direction.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: SOLUTION LANDSCAPE
// ═══════════════════════════════════════════════════════════════════
function SolutionsViz() {
  const methods = [
    { name: "Fixed Effects (FE)", addresses: "Omitted variable bias from time-invariant confounders", requires: "Panel data (same units over time)", limits: "Can't handle time-varying confounders or reverse causality", learned: "Module 10", color: C.smp },
    { name: "Difference-in-Differences (DiD)", addresses: "Selection bias when a treatment/policy affects some units but not others", requires: "Panel data + exogenous shock + parallel trends assumption", limits: "Requires convincing parallel trends; can't handle individual-level selection", learned: "Next module", color: C.sam },
    { name: "Instrumental Variables (IV)", addresses: "Any source of endogeneity — OVB, reverse causality, measurement error", requires: "A valid instrument: correlated with X but uncorrelated with ε", limits: "Valid instruments are extremely hard to find; weak instruments make things worse", learned: "Upcoming", color: C.pop },
    { name: "Regression Discontinuity (RDD)", addresses: "Selection bias around a cutoff (e.g., policy threshold)", requires: "A running variable with a sharp cutoff that determines treatment", limits: "Only estimates the effect at the cutoff point — limited generalizability", learned: "Upcoming", color: C.grn },
    { name: "Matching (PSM, CEM)", addresses: "Selection on observables — treated and control groups differ on measured variables", requires: "Rich set of pre-treatment covariates; overlap between groups", limits: "Cannot handle selection on unobservables — doesn't solve OVB from unmeasured confounders", learned: "Upcoming", color: C.txD },
    { name: "Heckman Selection", addresses: "Sample selection bias — you only observe Y for a non-random subset", requires: "A selection equation with an exclusion restriction", limits: "Relies on distributional assumptions; exclusion restriction is hard to justify", learned: "Upcoming", color: C.rose },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        There's no single fix for endogeneity — the right solution depends on <em>what kind</em> of endogeneity you have and <em>what data</em> you have access to. Here's the landscape of methods, each designed for a different situation:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {methods.map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${m.color}11`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: m.color, fontFamily: mono, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: m.color }}>{m.name}</div>
                  <div style={{ padding: "2px 8px", borderRadius: "100px", background: C.bg, border: `1px solid ${C.bdr}`, fontSize: "9px", fontWeight: 600, color: C.txD, fontFamily: mono }}>{m.learned}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "2px" }}>ADDRESSES</div>
                    <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.5 }}>{m.addresses}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "2px" }}>REQUIRES</div>
                    <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.5 }}>{m.requires}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "2px" }}>LIMITATIONS</div>
                    <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.5 }}>{m.limits}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>No method is a silver bullet.</strong> Each solves one specific type of endogeneity under specific assumptions. Reviewers will ask: "What is the source of endogeneity in your study?" and "Why does this particular method address it?" You need to name the threat (OVB? reverse causality? selection?) and explain why your chosen method is the right response. Using IV when the problem is sample selection, or PSM when the problem is reverse causality, signals that you don't understand endogeneity — even if the code runs fine.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "what", label: "1. What is Endogeneity?" },
  { id: "demo", label: "2. See the Bias" },
  { id: "sources", label: "3. Three Sources" },
  { id: "solutions", label: "4. Solution Landscape" },
];

export default function Endogeneity() {
  const [tab, setTab] = useState("what");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.roseBg}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.roseBg, color: C.rose, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 12 · Causal Inference</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Endogeneity</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>The single most important problem in empirical research. If your X is endogenous, your coefficient is biased — and no amount of controls, robustness checks, or fancy standard errors can fix it.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.rose : C.txD, borderBottom: `2px solid ${tab === t.id ? C.rose : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "what" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="The central problem" sub="When your X is correlated with the error term, everything falls apart" />
          <Pr>Every regression method you've learned makes one crucial assumption: the stuff you didn't include in the model (the error term ε) is unrelated to X. When this assumption breaks, you have <strong>endogeneity</strong> — and your results are misleading.</Pr>

          <CBox title={<>⚠️ Exogenous vs. Endogenous</>} color={C.rose}>
            <WhatIsViz />
          </CBox>

          <NBtn onClick={() => setTab("demo")} label="Next: See the Bias →" />
        </div>}

        {tab === "demo" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Watch OLS get the wrong answer" sub="An interactive demonstration of how endogeneity biases your results" />
          <Pr>This is a simulation where we control the truth. The true effect of X on Y is exactly 0.50 — we designed the data this way. But we can also add a hidden confounder that affects both X and Y. Watch what happens to OLS:</Pr>

          <CBox title={<>🔬 The Endogeneity Lab</>} color={C.rose}>
            <BiasDemoViz />
          </CBox>

          <Anl>Think of it like measuring how fast a boat moves (Y) based on how hard the engine runs (X). But there's also a river current (the confounder) that pushes the boat forward <em>and</em> makes the engine spin faster. OLS measures the total forward speed and attributes all of it to the engine — even though part of it is just the current.</Anl>

          <NBtn onClick={() => setTab("sources")} label="Next: Three Sources →" />
        </div>}

        {tab === "sources" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Where endogeneity comes from" sub="Three distinct sources — each requiring a different solution" />
          <Pr>Endogeneity isn't one problem — it's three different problems that produce the same symptom (biased coefficients). Identifying <em>which</em> source you're dealing with determines which solution to use:</Pr>

          <CBox title={<>🔍 The Three Sources of Endogeneity</>} color={C.rose}>
            <SourcesViz />
          </CBox>

          <NBtn onClick={() => setTab("solutions")} label="Next: Solution Landscape →" />
        </div>}

        {tab === "solutions" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="The toolbox for causal inference" sub="Each method addresses a specific type of endogeneity" />
          <Pr>Now that you understand <em>what</em> endogeneity is and <em>where</em> it comes from, the next several modules will teach you the tools to address it. Here's the full landscape — a roadmap for what comes next:</Pr>

          <CBox title={<>🧰 The Causal Inference Toolbox</>} color={C.rose}>
            <SolutionsViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>Endogeneity</strong> means X is correlated with the error term ε. This makes OLS coefficients biased — they don't measure what you think they measure.<br />
              <strong>2.</strong> There are <strong>three sources:</strong> omitted variable bias (a confounder drives both X and Y), reverse causality (Y feeds back into X), and measurement error (noise in X creates correlation with ε).<br />
              <strong>3.</strong> Endogeneity is the <strong>default</strong> in management research because X variables are usually things firms choose, and the factors behind those choices also affect outcomes.<br />
              <strong>4.</strong> <strong>No single method fixes all endogeneity.</strong> FE handles time-invariant confounders. DiD handles selection around policy shocks. IV handles any source (if you find a valid instrument). RDD exploits cutoffs. Matching handles selection on observables. Heckman handles sample selection.<br />
              <strong>5.</strong> The first step is always to <strong>name the threat:</strong> what specific endogeneity problem do you face? Then choose the method designed for that threat.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
