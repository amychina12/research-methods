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
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)", roseLt: "#FFE4E6",
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

// ═══════════════════════════════════════════════════════════════════
// TAB 1: THE LOGIC
// ═══════════════════════════════════════════════════════════════════
function LogicViz() {
  const [step, setStep] = useState(0);

  const W = 460, H = 310, pad = { t: 30, r: 16, b: 44, l: 50 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  const treatPre = 40, treatPost = 65;
  const controlPre = 30, controlPost = 38;
  const counterfactual = treatPre + (controlPost - controlPre);
  const trueEffect = treatPost - counterfactual;

  const yMin = 18, yMax = 78;
  const xBefore = pad.l + cw * 0.22;
  const xAfter = pad.l + cw * 0.78;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        A new government policy (e.g., R&D tax credit) is introduced in State A but not State B. We observe firms in both states before and after the policy. Click through each step to build the DiD estimate:
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {[
          { label: "1. Raw data" },
          { label: "2. Naive: +25" },
          { label: "3. Counterfactual" },
          { label: "4. DiD = +17" },
        ].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.rose : C.bdr,
            background: step === i ? C.roseBg : "transparent",
            color: step === i ? C.rose : C.txD,
            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[20, 30, 40, 50, 60, 70].map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Policy line */}
          <line x1={(xBefore + xAfter) / 2} x2={(xBefore + xAfter) / 2} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="1" strokeDasharray="4,3" opacity="0.35" />
          <text x={(xBefore + xAfter) / 2} y={pad.t - 10} textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Policy enacted</text>

          {/* Control line */}
          <line x1={xBefore} x2={xAfter} y1={sy(controlPre)} y2={sy(controlPost)} stroke={C.sam} strokeWidth="2.5" />
          <circle cx={xBefore} cy={sy(controlPre)} r="6" fill={C.sam} stroke="#fff" strokeWidth="2" />
          <circle cx={xAfter} cy={sy(controlPost)} r="6" fill={C.sam} stroke="#fff" strokeWidth="2" />
          {/* Labels: value above left dot, name below right dot */}
          <text x={xBefore} y={sy(controlPre) + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sam} fontFamily={mono}>{controlPre}</text>
          <text x={xAfter} y={sy(controlPost) + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.sam} fontFamily={font}>Control: {controlPost}</text>

          {/* Treatment line */}
          <line x1={xBefore} x2={xAfter} y1={sy(treatPre)} y2={sy(treatPost)} stroke={C.rose} strokeWidth="2.5" />
          <circle cx={xBefore} cy={sy(treatPre)} r="6" fill={C.rose} stroke="#fff" strokeWidth="2" />
          <circle cx={xAfter} cy={sy(treatPost)} r="6" fill={C.rose} stroke="#fff" strokeWidth="2" />
          <text x={xBefore} y={sy(treatPre) + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.rose} fontFamily={mono}>{treatPre}</text>
          <text x={xAfter} y={sy(treatPost) - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.rose} fontFamily={font}>Treated: {treatPost}</text>

          {/* Step 2: Naive +25 — show before-after change at the After column */}
          {step === 1 && (
            <g>
              {/* Dashed reference line showing where treated started (40) */}
              <line x1={xBefore} x2={xAfter} y1={sy(treatPre)} y2={sy(treatPre)} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
              {/* Bracket from 40 to 65 at the After position */}
              <line x1={xAfter + 16} x2={xAfter + 16} y1={sy(treatPre)} y2={sy(treatPost)} stroke={C.pop} strokeWidth="2.5" />
              <line x1={xAfter + 10} x2={xAfter + 16} y1={sy(treatPre)} y2={sy(treatPre)} stroke={C.pop} strokeWidth="2" />
              <line x1={xAfter + 10} x2={xAfter + 16} y1={sy(treatPost)} y2={sy(treatPost)} stroke={C.pop} strokeWidth="2" />
              <rect x={xAfter + 20} y={sy((treatPre + treatPost) / 2) - 11} width="36" height="22" rx="5" fill={C.popBg} stroke={C.pop} strokeWidth="1" />
              <text x={xAfter + 38} y={sy((treatPre + treatPost) / 2) + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.pop} fontFamily={mono}>+25</text>
              <text x={xAfter + 38} y={sy((treatPre + treatPost) / 2) + 17} textAnchor="middle" fontSize="8" fill={C.pop} fontFamily={font}>naive</text>
            </g>
          )}

          {/* Step 3: Counterfactual dashed line */}
          {step >= 2 && (
            <g>
              <line x1={xBefore} x2={xAfter} y1={sy(treatPre)} y2={sy(counterfactual)} stroke={C.rose} strokeWidth="2" strokeDasharray="6,4" opacity="0.45" />
              <circle cx={xAfter} cy={sy(counterfactual)} r="5" fill="transparent" stroke={C.rose} strokeWidth="2" strokeDasharray="3,2" />
              <text x={xAfter} y={sy(counterfactual) + 16} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font} fontStyle="italic">Counterfactual: {counterfactual}</text>
            </g>
          )}

          {/* Step 4: DiD +17 green bracket */}
          {step === 3 && (
            <g>
              <line x1={xAfter + 16} x2={xAfter + 16} y1={sy(counterfactual)} y2={sy(treatPost)} stroke={C.grn} strokeWidth="3" />
              <line x1={xAfter + 16} x2={xAfter + 22} y1={sy(counterfactual)} y2={sy(counterfactual)} stroke={C.grn} strokeWidth="2.5" />
              <line x1={xAfter + 16} x2={xAfter + 22} y1={sy(treatPost)} y2={sy(treatPost)} stroke={C.grn} strokeWidth="2.5" />
              <rect x={xAfter + 24} y={sy((counterfactual + treatPost) / 2) - 12} width="40" height="24" rx="6" fill={C.grnBg} stroke={C.grn} strokeWidth="1.5" />
              <text x={xAfter + 44} y={sy((counterfactual + treatPost) / 2) + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.grn} fontFamily={mono}>+{trueEffect}</text>
            </g>
          )}

          <text x={xBefore} y={H - 8} textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font}>Before</text>
          <text x={xAfter} y={H - 8} textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font}>After</text>
          <text x="12" y={sy((yMin + yMax) / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy((yMin + yMax) / 2)})`}>Y (Performance)</text>

        </svg>
      </div>

      {/* Step explanations */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>Raw data:</strong> Before the policy, treated firms had performance = 40 and control firms had performance = 30. After the policy, treated firms = 65, control firms = 38. Treated firms are ahead — but they were ahead even <em>before</em> the policy.</>}
        {step === 1 && <><strong style={{ color: C.pop }}>Naive before-after comparison: +25.</strong> If you just compare treated firms before and after, you find a gain of 25 points. But this is misleading — part of that gain would have happened anyway (general time trends, economic growth, etc.). The naive estimate overstates the policy effect.</>}
        {step === 2 && <><strong style={{ color: C.txD }}>The counterfactual.</strong> What <em>would have happened</em> to the treated group without the policy? We can't observe this directly — it's the fundamental problem of causal inference. DiD's solution: use the control group's trend as the counterfactual. Control firms went from 30 to 38 (+8). So we estimate treated firms would have gone from 40 to <strong>48</strong> without the policy.</>}
        {step === 3 && <><strong style={{ color: C.grn }}>The DiD estimate: +{trueEffect}.</strong> The actual treated outcome (65) minus the counterfactual (48) = <strong>{trueEffect}</strong>. This is the DiD estimate — it subtracts the "what would have happened anyway" from the observed change. In equation form: DiD = (65 – 40) – (38 – 30) = 25 – 8 = <strong>{trueEffect}</strong>. That's the <strong>first difference</strong> (before-after change) <strong>differenced</strong> again by the control group's change.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: PARALLEL TRENDS
// ═══════════════════════════════════════════════════════════════════
function ParallelTrendsViz() {
  const [violation, setViolation] = useState(0);

  // 8 time periods, policy enacted at t5, effect from t5 onward (standard convention)
  const treatEffect = 12;
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const treatAt = 5; // first post-treatment period

  const controlBase = periods.map(t => 20 + t * 3);
  const treatedBase = periods.map(t => 30 + t * 3 + (t >= treatAt ? treatEffect : 0));
  const treatedViolated = periods.map(t => 30 + t * (3 + violation * 2) + (t >= treatAt ? treatEffect : 0));

  const displayTreated = violation === 0 ? treatedBase : treatedViolated;

  const W = 540, H = 280, pad = { t: 30, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const allY = [...controlBase, ...displayTreated];
  const yMin = Math.floor(Math.min(...allY) - 5);
  const yMax = Math.ceil(Math.max(...allY) + 5);
  const sx = t => pad.l + ((t - 1) / 7) * cw;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Policy line between t4 and t5 (t4 is last pre, t5 is first post)
  const policyX = (sx(treatAt - 1) + sx(treatAt)) / 2;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        DiD's crucial assumption: <strong>without the treatment, treated and control groups would have followed the same trend</strong>. They don't need to have the same <em>level</em> — they just need to be moving in <em>parallel</em> before the treatment. Drag the slider to violate this assumption and see what happens:
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Pre-treatment trend divergence</div>
        <input type="range" min="0" max="3" step="0.5" value={violation} onChange={e => setViolation(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: violation === 0 ? C.grn : C.rose }} />
        <div style={{ fontSize: "13px", fontWeight: 600, color: violation === 0 ? C.grn : C.rose, fontFamily: mono }}>
          {violation === 0 ? "✓ Parallel trends hold — DiD is valid" : `✗ Pre-trends diverge (treated slope +${(violation * 2).toFixed(0)} steeper) — DiD is biased`}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grid */}
          {Array.from({ length: 6 }, (_, i) => yMin + Math.round((yMax - yMin) / 5) * i).filter(v => v <= yMax).map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Pre-treatment shading — clearly visible */}
          <rect x={pad.l} y={pad.t} width={policyX - pad.l} height={ch} fill={C.sam} opacity="0.06" rx="4" />
          <rect x={policyX} y={pad.t} width={W - pad.r - policyX} height={ch} fill={C.rose} opacity="0.04" rx="4" />

          {/* Pre / Post labels at top */}
          <text x={(pad.l + policyX) / 2} y={pad.t + 14} textAnchor="middle" fontSize="10" fill={C.sam} fontFamily={font} fontWeight="600" opacity="0.6">Pre-treatment</text>
          <text x={(policyX + W - pad.r) / 2} y={pad.t + 14} textAnchor="middle" fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600" opacity="0.6">Post-treatment</text>

          {/* Policy line — between t4 and t5 */}
          <line x1={policyX} x2={policyX} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
          <text x={policyX} y={pad.t - 8} textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Policy enacted</text>

          {/* Control line */}
          {periods.slice(0, -1).map((t, i) => (
            <line key={`c${i}`} x1={sx(t)} x2={sx(periods[i + 1])} y1={sy(controlBase[i])} y2={sy(controlBase[i + 1])} stroke={C.sam} strokeWidth="2.5" />
          ))}
          {periods.map((t, i) => <circle key={`cd${i}`} cx={sx(t)} cy={sy(controlBase[i])} r="4" fill={C.sam} stroke="#fff" strokeWidth="1.5" />)}

          {/* Treated line */}
          {periods.slice(0, -1).map((t, i) => (
            <line key={`t${i}`} x1={sx(t)} x2={sx(periods[i + 1])} y1={sy(displayTreated[i])} y2={sy(displayTreated[i + 1])} stroke={C.rose} strokeWidth="2.5" />
          ))}
          {periods.map((t, i) => <circle key={`td${i}`} cx={sx(t)} cy={sy(displayTreated[i])} r="4" fill={C.rose} stroke="#fff" strokeWidth="1.5" />)}

          {/* Counterfactual (dashed) — what treated would have been without treatment */}
          {(() => {
            const lastPre = treatAt - 2; // array index for t4 (last pre-treatment period)
            const cfStart = displayTreated[lastPre]; // value at t4
            const cSlope = controlBase[1] - controlBase[0]; // control slope per period
            return periods.filter(t => t >= treatAt - 1).map((t, i, arr) => {
              if (i === arr.length - 1) return null;
              const y1 = cfStart + cSlope * (t - (treatAt - 1));
              const y2 = cfStart + cSlope * (t + 1 - (treatAt - 1));
              return <line key={`cf${i}`} x1={sx(t)} x2={sx(arr[i + 1])} y1={sy(y1)} y2={sy(y2)} stroke={C.rose} strokeWidth="2" strokeDasharray="6,4" opacity="0.35" />;
            });
          })()}

          {/* Period labels */}
          {periods.map(t => (
            <text key={t} x={sx(t)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>t{t}</text>
          ))}

          {/* Legend */}
          <line x1={W - pad.r - 100} x2={W - pad.r - 80} y1={pad.t + 28} y2={pad.t + 28} stroke={C.rose} strokeWidth="2.5" />
          <text x={W - pad.r - 76} y={pad.t + 32} fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600">Treated</text>
          <line x1={W - pad.r - 100} x2={W - pad.r - 80} y1={pad.t + 44} y2={pad.t + 44} stroke={C.sam} strokeWidth="2.5" />
          <text x={W - pad.r - 76} y={pad.t + 48} fontSize="10" fill={C.sam} fontFamily={font} fontWeight="600">Control</text>
        </svg>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {violation === 0 ? (
          <><strong style={{ color: C.grn }}>Parallel trends hold.</strong> In the pre-treatment period (blue shaded region, t1–t4), both groups move at the same rate — the lines are parallel even though the treated group starts higher. At t5, when the policy takes effect, the treated group jumps while the control continues its steady trend. The gap between the actual treated line and the dashed counterfactual is the causal effect.</>
        ) : (
          <><strong style={{ color: C.rose }}>Parallel trends violated.</strong> The treated group was already trending upward faster than the control group <em>before</em> the policy (look at the pre-treatment region, t1–t4). DiD would attribute this pre-existing divergence to the treatment, producing a <strong>biased estimate</strong>. {violation >= 2 ? "At this level of violation, most of what DiD estimates is the pre-existing trend difference, not the treatment." : "Reviewers will check pre-treatment trends carefully — diverging pre-trends are a major red flag."}</>
        )}
      </div>

      <Ins>
        <strong>How to test parallel trends:</strong> Plot the treated and control group means over time before the treatment — they should track each other. The formal method is an <strong>event study regression</strong> — we'll show you exactly how in the next tab.
        <br /><br /><strong>Timing convention:</strong> The standard convention is that the treatment period (t5 here) is the <em>first post-treatment period</em> — D<sub>it</sub> = 1 for t ≥ g, where g is the first treatment period (Callaway & Sant'Anna, 2021). Pre-treatment periods are t1–t4.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: THE REGRESSION
// ═══════════════════════════════════════════════════════════════════
function RegressionViz() {
  const [section, setSection] = useState("equation");

  // Simulated event study coefficients (relative to t=-1 omitted)
  const esCoefs = [
    { t: -4, b: 0.3, se: 1.8 },
    { t: -3, b: -0.5, se: 1.6 },
    { t: -2, b: 0.8, se: 1.5 },
    { t: -1, b: 0, se: 0 },  // reference (omitted)
    { t: 0, b: 5.2, se: 1.4 },
    { t: 1, b: 7.8, se: 1.5 },
    { t: 2, b: 8.1, se: 1.7 },
    { t: 3, b: 9.3, se: 2.0 },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "equation", label: "The 2×2 Regression" },
          { id: "eventstudy", label: "Event Study" },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: section === s.id ? C.rose : C.bdr,
            background: section === s.id ? C.roseBg : "transparent",
            color: section === s.id ? C.rose : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s.label}</button>
        ))}
      </div>

      {section === "equation" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
            The 2×2 DiD logic translates directly into a regression equation. Here's how each piece maps to the visual:
          </div>

          <div style={{ background: C.bg, borderRadius: "12px", padding: "18px 22px", border: `1px solid ${C.bdr}`, marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "8px" }}>THE DiD REGRESSION</div>
            <div style={{ fontSize: "17px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "10px" }}>
              Y<sub>it</sub> = β₀ + <span style={{ color: C.rose }}>β₁Treat<sub>i</sub></span> + <span style={{ color: C.sam }}>β₂Post<sub>t</sub></span> + <span style={{ color: C.grn }}>β₃(Treat<sub>i</sub> × Post<sub>t</sub>)</span> + ε<sub>it</sub>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {[
              { sym: "β₀", color: C.txD, title: "Intercept", desc: "Average Y for the control group before the treatment. The baseline.", formula: "Control, Pre = β₀" },
              { sym: "β₁", color: C.rose, title: "Treat (group difference)", desc: "How much higher (or lower) the treated group was before the treatment. Pre-existing level differences — NOT the treatment effect.", formula: "Treated, Pre = β₀ + β₁" },
              { sym: "β₂", color: C.sam, title: "Post (time effect)", desc: "How much Y changed over time for the control group. Time trends, economic conditions — everything except the treatment.", formula: "Control, Post = β₀ + β₂" },
              { sym: "β₃", color: C.grn, title: "Treat × Post (the DiD estimate) ⭐", desc: "The causal effect of the treatment. After removing group differences (β₁) and time trends (β₂), what's left is the treatment effect.", formula: "Treated, Post = β₀ + β₁ + β₂ + β₃" },
            ].map((c, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", boxShadow: i === 3 ? `0 0 0 2px ${C.grn}22` : "none" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: mono, color: c.color, minWidth: "32px" }}>{c.sym}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: c.color, marginBottom: "4px" }}>{c.title}</div>
                    <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{c.desc}</div>
                    <div style={{ fontSize: "11px", color: C.txD, fontFamily: mono, marginTop: "4px" }}>{c.formula}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", background: C.bg }}>
              <div style={{ padding: "10px 14px" }}></div>
              <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>PRE</div>
              <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>POST</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", color: C.sam, background: C.bg }}>Control</div>
              <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: "13px", textAlign: "center", borderLeft: `1px solid ${C.bdr}` }}>β₀</div>
              <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: "13px", textAlign: "center", borderLeft: `1px solid ${C.bdr}` }}>β₀ + <span style={{ color: C.sam }}>β₂</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", color: C.rose, background: C.bg }}>Treated</div>
              <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: "13px", textAlign: "center", borderLeft: `1px solid ${C.bdr}` }}>β₀ + <span style={{ color: C.rose }}>β₁</span></div>
              <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: "13px", textAlign: "center", borderLeft: `1px solid ${C.bdr}`, background: C.grnBg }}>β₀ + <span style={{ color: C.rose }}>β₁</span> + <span style={{ color: C.sam }}>β₂</span> + <span style={{ color: C.grn, fontWeight: 700 }}>β₃</span></div>
            </div>
          </div>

          <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>In Stata:</div>
            <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
              * Simple 2x2 DiD:<br />
              reg y i.treated##i.post<br /><br />
              * With panel data + FE (more common):<br />
              reghdfe y i.treated#i.post controls, absorb(firm year)<br /><br />
              * Note: firm FE absorbs β₁, year FE absorbs β₂<br />
              * The coefficient on treated#post IS β₃
            </div>
          </div>
        </div>
      )}

      {section === "eventstudy" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
            The 2×2 regression gives you one number (β₃). But what if you want to see <strong>how the treatment effect evolves over time</strong> — and simultaneously test parallel trends? That's the <strong>event study</strong>. It estimates a separate coefficient for each period relative to treatment.
          </div>

          {/* Hypothetical dataset */}
          <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Hypothetical dataset: R&D tax credit study</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6, marginBottom: "10px" }}>
              50 firms observed over 2010–2019. An R&D tax credit was enacted in <strong>2015</strong> in some states. You start with: <strong>ever_treated</strong> (= 1 if the firm's state adopted the credit) and <strong>year</strong>. From these, you construct <strong>first_treat</strong> and <strong>rel_time</strong>.
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, minWidth: "460px", fontSize: "11px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "52px 44px 76px 72px 60px 60px", background: C.bg, fontFamily: mono, fontWeight: 700, color: C.txM }}>
                  {["firm_id", "year", "ever_treated", "first_treat", "rel_time", "rd_spend"].map(h => (
                    <div key={h} style={{ padding: "6px 6px", borderLeft: h !== "firm_id" ? `1px solid ${C.bdr}` : "none", fontSize: "10px" }}>{h}</div>
                  ))}
                </div>
                {[
                  { f: 1, y: 2013, et: 1, ft: 2015, rt: "−2", rd: "12.3", post: false },
                  { f: 1, y: 2014, et: 1, ft: 2015, rt: "−1", rd: "13.1", post: false },
                  { f: 1, y: 2015, et: 1, ft: 2015, rt: "0", rd: "18.7", post: true },
                  { f: 1, y: 2016, et: 1, ft: 2015, rt: "1", rd: "20.2", post: true },
                  { f: "...", y: "...", et: "...", ft: "...", rt: "...", rd: "...", post: false },
                  { f: 30, y: 2013, et: 0, ft: ".", rt: "0", rd: "8.5", post: false },
                  { f: 30, y: 2014, et: 0, ft: ".", rt: "0", rd: "9.8", post: false },
                  { f: 30, y: 2015, et: 0, ft: ".", rt: "0", rd: "10.1", post: false },
                ].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "52px 44px 76px 72px 60px 60px", borderTop: `1px solid ${C.bdr}`, background: r.post ? C.roseBg : i % 2 === 0 ? "#fff" : C.bg, color: C.txB }}>
                    {[r.f, r.y, r.et, r.ft, r.rt, r.rd].map((v, j) => (
                      <div key={j} style={{ padding: "5px 6px", fontFamily: mono, fontSize: "11px", borderLeft: j > 0 ? `1px solid ${C.bdr}` : "none", fontWeight: j === 4 && r.et === 1 ? 600 : 400, color: j === 4 && r.et === 1 && Number(r.rt) >= 0 ? C.rose : j === 4 && r.et === 0 ? C.txM : C.txB }}>{v}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: C.txD, marginTop: "8px", lineHeight: 1.7 }}>
              <strong>ever_treated</strong> = 1 if the firm is in a treated state. Time-invariant — your starting variable.<br />
              <strong>first_treat</strong> = shock year × ever_treated. Here: 2015 for treated firms, missing (".") for never-treated. In this single-shock case it's the same for all treated firms, but constructing it this way prepares for <strong>staggered designs</strong> (Tab 5) where different firms have different first_treat values.<br />
              <strong>rel_time</strong> = (year − first_treat) × ever_treated = (year − 2015) × ever_treated. For treated: event time (−2, −1, 0, 1, ...). For never-treated: always 0.<br />
              <strong>Why 0 for never-treated works:</strong> Their rel_time is constant within firm → collinear with firm FE → absorbed by <code style={{ fontFamily: mono, fontSize: "10.5px" }}>reghdfe</code>. They still anchor year FE.
            </div>
          </div>

          {/* Event study equation */}
          <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE EVENT STUDY REGRESSION</div>
            <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "6px" }}>
              Y<sub>it</sub> = α<sub>i</sub> + δ<sub>t</sub> + <span style={{ color: C.smp }}>Σ<sub>k≠−1</sub> β<sub>k</sub> · 1(rel_time<sub>it</sub> = k)</span> + ε<sub>it</sub>
            </div>
            <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
              β<sub>k</sub> = treatment effect at event time k  |  k = −1 omitted as reference  |  α<sub>i</sub> = firm FE, δ<sub>t</sub> = year FE
            </div>
          </div>

          {/* Stata code */}
          <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Stata implementation</div>
            <div style={{ fontSize: "11.5px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
              * You start with: ever_treated, year, rd_spend<br />
              * Policy shock year = 2015<br /><br />

              * Step 1: Construct first_treat from ever_treated<br />
              gen first_treat = 2015 if ever_treated == 1<br />
              * (For staggered designs, first_treat would vary by firm)<br /><br />

              * Step 2: Create event time<br />
              gen rel_time = (year - first_treat) * ever_treated<br />
              * Treated: event time (-2, -1, 0, 1, ...)<br />
              * Never-treated: 0 for all years<br /><br />

              * Step 3: Shift for Stata i. notation (needs ≥ 0)<br />
              summ rel_time<br />
              gen rel_time_s = rel_time - r(min)<br />
              summ rel_time_s if rel_time == -1<br />
              local omit = r(mean)<br /><br />

              * Step 4: Run event study<br />
              * For never-treated: rel_time_s is constant within<br />
              * firm → collinear with firm FE → absorbed by reghdfe<br />
              reghdfe rd_spend ib`omit'.rel_time_s, ///<br />
              {"    "}absorb(firm_id year) cluster(firm_id)<br /><br />

              * Step 5: Plot<br />
              coefplot, vertical drop(_cons) ///<br />
              {"    "}xline(`omit', lp(dash)) yline(0, lc(red))
            </div>
            <div style={{ fontSize: "11.5px", color: C.txD, marginTop: "8px", fontFamily: font, lineHeight: 1.7 }}>
              <strong>How never-treated firms are used:</strong> With <code style={{ fontFamily: mono, fontSize: "10.5px" }}>rel_time = (year − 2015) × ever_treated</code>, never-treated firms have rel_time = 0 for every year — constant within firm, so collinear with firm FE and absorbed by <code style={{ fontFamily: mono, fontSize: "10.5px" }}>reghdfe</code>. They're still in the regression and anchor the year FE (what time trends look like without treatment).
            </div>
            <div style={{ fontSize: "11.5px", color: C.txD, marginTop: "8px", fontFamily: font, lineHeight: 1.7 }}>
              <strong>Simpler alternatives:</strong> <code style={{ fontFamily: mono, fontSize: "10.5px" }}>eventdd rd_spend, timevar(rel_time) method(hdfe, absorb(firm_id year)) cluster(firm_id)</code> automates all steps (Clarke & Tapia-Schythe, 2021). In Stata 17+: <code style={{ fontFamily: mono, fontSize: "10.5px" }}>xtdidregress (rd_spend) (ever_treated), group(firm_id) time(year)</code> then <code style={{ fontFamily: mono, fontSize: "10.5px" }}>estat trendplots</code>.
            </div>
            <div style={{ fontSize: "11.5px", color: C.txD, marginTop: "8px", fontFamily: font, lineHeight: 1.7 }}>
              <strong>For staggered timing (Tab 5):</strong> The only change is that <code style={{ fontFamily: mono, fontSize: "10.5px" }}>first_treat</code> varies by firm (e.g., some treated in 2013, others in 2016). The <code style={{ fontFamily: mono, fontSize: "10.5px" }}>rel_time = (year - first_treat) * ever_treated</code> formula still works, but you should use modern estimators (Callaway & Sant'Anna, Sun & Abraham) instead of plain TWFE.
            </div>
          </div>

          {/* Simulated event study plot */}
          <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>What the output looks like: event study plot</div>
            <div style={{ fontSize: "12px", color: C.txD, marginBottom: "10px" }}>Hypothetical results from the R&D tax credit study above</div>

            {(() => {
              const W = 460, H = 220, pad = { t: 16, r: 16, b: 32, l: 46 };
              const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
              const allB = esCoefs.map(c => c.b);
              const allHi = esCoefs.map(c => c.b + 1.96 * c.se);
              const allLo = esCoefs.map(c => c.b - 1.96 * c.se);
              const yMin2 = Math.floor(Math.min(...allLo) - 1);
              const yMax2 = Math.ceil(Math.max(...allHi) + 1);
              const sx2 = t => pad.l + ((t + 4) / 7) * cw;
              const sy2 = v => pad.t + ch - ((v - yMin2) / (yMax2 - yMin2)) * ch;
              const refX = sx2(-1);
              return (
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
                  {/* Grid */}
                  {[-5, 0, 5, 10].filter(v => v >= yMin2 && v <= yMax2).map(v => (
                    <g key={v}>
                      <line x1={pad.l} x2={W - pad.r} y1={sy2(v)} y2={sy2(v)} stroke={C.grid} strokeWidth="1" />
                      <text x={pad.l - 8} y={sy2(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
                    </g>
                  ))}

                  {/* Zero line */}
                  <line x1={pad.l} x2={W - pad.r} y1={sy2(0)} y2={sy2(0)} stroke={C.rose} strokeWidth="1.5" opacity="0.4" />

                  {/* Reference period line */}
                  <line x1={refX} x2={refX} y1={pad.t} y2={pad.t + ch} stroke={C.txM} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />

                  {/* Pre/post shading */}
                  <rect x={pad.l} y={pad.t} width={refX - pad.l} height={ch} fill={C.sam} opacity="0.04" />
                  <rect x={refX} y={pad.t} width={W - pad.r - refX} height={ch} fill={C.rose} opacity="0.03" />
                  <text x={(pad.l + refX) / 2} y={pad.t + 12} textAnchor="middle" fontSize="9" fill={C.sam} fontFamily={font} fontWeight="600" opacity="0.5">Pre-treatment</text>
                  <text x={(refX + W - pad.r) / 2} y={pad.t + 12} textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600" opacity="0.5">Post-treatment</text>

                  {/* CI bars and dots */}
                  {esCoefs.filter(c => c.t !== -1).map(c => {
                    const x = sx2(c.t), hi = sy2(c.b + 1.96 * c.se), lo = sy2(c.b - 1.96 * c.se);
                    const pre = c.t < -1;
                    const col = pre ? C.sam : C.grn;
                    const sig = c.b - 1.96 * c.se > 0 || c.b + 1.96 * c.se < 0;
                    return (
                      <g key={c.t}>
                        <line x1={x} x2={x} y1={hi} y2={lo} stroke={col} strokeWidth="2" opacity="0.5" />
                        <line x1={x - 4} x2={x + 4} y1={hi} y2={hi} stroke={col} strokeWidth="1.5" opacity="0.5" />
                        <line x1={x - 4} x2={x + 4} y1={lo} y2={lo} stroke={col} strokeWidth="1.5" opacity="0.5" />
                        <circle cx={x} cy={sy2(c.b)} r="4" fill={col} stroke="#fff" strokeWidth="1.5" />
                      </g>
                    );
                  })}

                  {/* Reference dot at zero */}
                  <circle cx={refX} cy={sy2(0)} r="4" fill={C.txM} stroke="#fff" strokeWidth="1.5" />

                  {/* X labels */}
                  {esCoefs.map(c => (
                    <text key={c.t} x={sx2(c.t)} y={H - 8} textAnchor="middle" fontSize="9" fill={c.t === -1 ? C.rose : C.txM} fontFamily={mono} fontWeight={c.t === -1 ? 700 : 400}>{c.t === -1 ? "−1*" : c.t}</text>
                  ))}
                  <text x={(pad.l + W - pad.r) / 2} y={H} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Event time (periods relative to treatment)  |  * = omitted reference</text>
                </svg>
              );
            })()}
          </div>

          <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, fontSize: "13px", lineHeight: 1.7, color: C.txB }}>
            <strong>Reading this plot:</strong> Each dot is a β<sub>k</sub> coefficient with its 95% CI. The reference period (t = −1, marked with *) is normalized to zero. <strong style={{ color: C.sam }}>Pre-treatment coefficients</strong> (blue, t ≤ −2) are all close to zero and their CIs include zero — this supports parallel trends. <strong style={{ color: C.grn }}>Post-treatment coefficients</strong> (green, t ≥ 0) are positive and significant (CIs above zero) — the treatment effect appears at t = 0 and grows over time, suggesting the R&D tax credit increased spending by ~5–9 units, with the effect strengthening each year.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: THREATS & MODERN DiD
// ═══════════════════════════════════════════════════════════════════
function ThreatsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        DiD is powerful but not bulletproof. Understanding what can go wrong — and what's changed in recent methodological advances — is critical for using DiD credibly:
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Threats to validity</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {[
          { num: "1", title: "Parallel trends violation", text: "The treated group was already trending differently before the treatment. This is the most common and most damaging threat. Always plot pre-trends and run an event study specification to check.", fix: "Show pre-treatment parallel trends visually + event study regression with lead coefficients near zero." },
          { num: "2", title: "Composition changes", text: "The composition of the treated or control group changes around the treatment. For example, the policy causes some firms to exit the market — the surviving firms aren't comparable to the pre-treatment sample.", fix: "Use a balanced panel (same firms in all periods). Check for differential attrition." },
          { num: "3", title: "Anticipation effects", text: "Firms know the policy is coming and change behavior before it takes effect. This contaminates the 'pre' period and makes the treatment effect look smaller or earlier than it actually is.", fix: "Define the treatment window carefully. Consider using the announcement date rather than the implementation date." },
          { num: "4", title: "Spillover effects (SUTVA violation)", text: "The treatment affects not only the treated group but also the control group. For example, a tax credit in State A causes firms to relocate from State B, depressing State B's outcomes and inflating the DiD estimate.", fix: "Use control groups that are far from the treatment. Test for spillovers explicitly." },
        ].map(t => (
          <div key={t.num} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>{t.num}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>{t.title}</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{t.text}</div>
                <div style={{ background: C.grnBg, borderRadius: "6px", padding: "8px 12px", marginTop: "8px", fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>
                  <strong style={{ color: C.grn }}>How to address:</strong> {t.fix}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: MODERN DiD
// ═══════════════════════════════════════════════════════════════════
function ModernDiDViz() {
  const [topic, setTopic] = useState("staggered");
  const grpC = ["#0284C7", "#D97706", "#059669", "#7C3AED", "#E11D48"];

  // Staggered treatment SVG data
  const staggeredGroups = [
    { name: "State A", treatYear: 3, color: grpC[0] },
    { name: "State B", treatYear: 5, color: grpC[1] },
    { name: "State C", treatYear: 7, color: grpC[2] },
    { name: "State D", treatYear: null, color: grpC[3] }, // never treated
  ];
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The classic 2×2 DiD — one treatment group, one control group, one treatment time — is rare in practice. Most real settings involve more complex designs. Two common extensions dominate modern management research:
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "staggered", label: "Staggered Treatment Timing" },
          { id: "intensity", label: "Continuous Treatment Intensity" },
        ].map(t => (
          <button key={t.id} onClick={() => setTopic(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: topic === t.id ? C.smp : C.bdr,
            background: topic === t.id ? C.smpBg : "transparent",
            color: topic === t.id ? C.smp : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {topic === "staggered" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
            Different units adopt the treatment at different times. For example, US states adopt a policy in different years. The classic approach (two-way fixed effects, or TWFE) seems natural — but recent research has revealed a serious problem.
          </div>

          {/* Staggered treatment timeline */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Treatment adoption timeline</div>
            <svg viewBox="0 0 460 140" style={{ width: "100%", display: "block" }}>
              {/* Year labels */}
              {years.map(y => (
                <text key={y} x={40 + (y - 1) * 42} y={14} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>t{y}</text>
              ))}
              {staggeredGroups.map((g, gi) => {
                const rowY = 28 + gi * 28;
                return (
                  <g key={gi}>
                    <text x="4" y={rowY + 6} fontSize="10" fill={g.color} fontFamily={font} fontWeight="600">{g.name}</text>
                    {years.map(y => {
                      const cx = 40 + (y - 1) * 42;
                      const treated = g.treatYear && y >= g.treatYear;
                      return (
                        <rect key={y} x={cx - 16} y={rowY - 8} width="32" height="16" rx="4"
                          fill={treated ? g.color : C.bg}
                          opacity={treated ? 0.7 : 0.4}
                          stroke={treated ? g.color : C.bdr} strokeWidth="1" />
                      );
                    })}
                    {g.treatYear && (
                      <text x={40 + (g.treatYear - 1) * 42} y={rowY + 6} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700" fontFamily={mono}>▶</text>
                    )}
                  </g>
                );
              })}
              <text x="230" y={138} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Colored = post-treatment  |  ▶ = adoption year  |  State D = never treated</text>
            </svg>
          </div>

          {/* The TWFE problem */}
          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)", marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>The TWFE problem with staggered timing</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              When you run <code style={{ fontFamily: mono, fontSize: "11px", background: C.card, padding: "1px 4px", borderRadius: "3px" }}>reghdfe y treated, absorb(state year)</code>, TWFE compares <em>every</em> pair of treated-vs-untreated observations. This includes using <strong>already-treated units as "controls"</strong> for later-treated units. For example, State A (treated at t3) acts as a "control" for State B (treated at t5) during t3–t4.
              <br /><br />
              <strong>Why this is dangerous:</strong> If the treatment effect grows over time (e.g., a policy takes years to fully kick in), then State A at t4 already has a treatment effect baked in. Using it as a "control" means you're subtracting a treatment effect from the estimate — producing <strong>negative weights</strong> that can bias the overall DiD, sometimes even flipping the sign entirely.
            </div>
          </div>

          {/* The TWFE equation */}
          <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>STANDARD TWFE (what most people run)</div>
            <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "6px" }}>
              Y<sub>it</sub> = α<sub>i</sub> + δ<sub>t</sub> + <span style={{ color: C.rose }}>β D<sub>it</sub></span> + ε<sub>it</sub>
            </div>
            <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
              D<sub>it</sub> = 1 if unit i is treated at time t  |  <span style={{ color: C.rose }}>β = one number summarizing "the" treatment effect</span>
            </div>
            <div style={{ fontSize: "12px", color: C.rose, textAlign: "center", marginTop: "6px", fontWeight: 600 }}>
              Problem: β is a weighted average of all 2×2 comparisons — some with negative weights
            </div>
          </div>

          {/* The fix */}
          <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)", marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "6px" }}>Modern estimators for staggered DiD</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              These estimators ensure only <strong>clean controls</strong> (never-treated or not-yet-treated units) are used:

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                {[
                  { name: "Callaway & Sant'Anna (2021)", desc: "Groups units by treatment timing cohort g. Estimates a separate ATT(g,t) for each cohort in each time period, using only not-yet-treated and never-treated units as controls. Then aggregates into an overall estimate.", eq: "ATT(g,t) = E[Yₜ − Yₜ₋₁ | G=g] − E[Yₜ − Yₜ₋₁ | C=1]", stata: "csdid y, ivar(firm) time(year) gvar(first_treat)" },
                  { name: "Sun & Abraham (2021)", desc: "Interaction-weighted estimator that decomposes TWFE into cohort-specific effects and reweights to remove contaminated comparisons.", eq: "Y = α + δₜ + Σ_g Σ_l μ_{g,l} · 1{G=g} · D^l + ε", stata: "eventstudyinteract y lead* lag*, cohort(first_treat) control_cohort(never) absorb(firm year)" },
                  { name: "Stacked DiD", desc: "Creates separate 'clean' datasets for each cohort — each containing only that cohort and not-yet-treated units. Stacks them, runs standard DiD.", eq: "Standard TWFE on each clean sub-dataset, then stack", stata: "// Manual dataset construction per cohort, then reghdfe on stacked data" },
                ].map((m, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: "6px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn }}>{m.name}</div>
                    <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{m.desc}</div>
                    <div style={{ fontSize: "11px", fontFamily: mono, color: C.smp, marginTop: "4px" }}>{m.eq}</div>
                    <div style={{ fontSize: "10.5px", fontFamily: mono, color: C.txD, marginTop: "2px" }}>Stata: {m.stata}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {topic === "intensity" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
            Sometimes there's no clean "treated vs. untreated" — instead, all units are affected but to <strong>different degrees</strong>. For example, a tariff increase hits all firms, but firms with more imports are hit harder. This is the <strong>continuous treatment</strong> or <strong>treatment intensity</strong> design.
          </div>

          {/* Visual: intensity spectrum */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Treatment intensity spectrum</div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
              {[
                { label: "Firm A", intensity: "5% imports", pct: 5, desc: "Low exposure" },
                { label: "Firm B", intensity: "25% imports", pct: 25, desc: "Moderate" },
                { label: "Firm C", intensity: "60% imports", pct: 60, desc: "High exposure" },
                { label: "Firm D", intensity: "90% imports", pct: 90, desc: "Very high" },
              ].map((f, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: "60px", background: C.bg, borderRadius: "6px", border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${f.pct}%`, background: C.rose, opacity: 0.15 + f.pct / 200, borderRadius: "0 0 5px 5px" }} />
                    <div style={{ position: "relative", paddingTop: "8px", fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono }}>{f.pct}%</div>
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: C.tx, marginTop: "4px" }}>{f.label}</div>
                  <div style={{ fontSize: "9px", color: C.txD }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong>Example:</strong> A new tariff is imposed on Chinese imports. Firm A imports 5% from China (barely affected); Firm D imports 90% (massively affected). The "treatment" isn't binary — it's a continuous measure of exposure.
            </div>
          </div>

          {/* The equation */}
          <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 20px", border: `1px solid ${C.bdr}`, marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>CONTINUOUS DiD REGRESSION</div>
            <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
              Y<sub>it</sub> = β₀ + <span style={{ color: C.grn }}>β₁(Intensity<sub>i</sub> × Post<sub>t</sub>)</span> + α<sub>i</sub> + δ<sub>t</sub> + ε<sub>it</sub>
            </div>
            <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
              α<sub>i</sub> = firm FE  |  δ<sub>t</sub> = year FE  |  <span style={{ color: C.grn, fontWeight: 600 }}>β₁</span> = effect per unit of treatment intensity
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div style={{ background: C.card, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "4px" }}>ADVANTAGE</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>No need for a clean "control group." All units are in the analysis — you exploit variation in <em>how much</em> each unit is exposed. More statistical power than binary DiD.</div>
            </div>
            <div style={{ background: C.card, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>KEY ASSUMPTION</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>The intensity measure (Intensity<sub>i</sub>) must be determined <strong>before</strong> the treatment — typically using pre-treatment exposure. If firms can change their exposure in response to the policy, the intensity is endogenous.</div>
            </div>
          </div>

          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>Interpretation & Stata:</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7, marginBottom: "8px" }}>The coefficient on <strong>Intensity × Post</strong> tells you: for each 1-unit increase in pre-treatment exposure, how much more did Y change after the policy? A firm with 90% import share would experience 18× the effect of a firm with 5% share.</div>
            <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.8 }}>
              gen intensity = pre_import_share<br />
              reghdfe y c.intensity#i.post controls, absorb(firm year)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "logic", label: "1. The Logic" },
  { id: "trends", label: "2. Parallel Trends" },
  { id: "reg", label: "3. The Regression" },
  { id: "threats", label: "4. Threats" },
  { id: "modern", label: "5. Modern DiD" },
];

export default function DifferenceinDifferences() {
  const [tab, setTab] = useState("logic");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.roseLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.roseBg, color: C.rose, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 13 · Causal Inference</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Difference-in-Differences</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>The most widely used causal inference method in management research. DiD compares changes in outcomes over time between a treated group and a control group to estimate the causal effect of a treatment or policy.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.rose : C.txD, borderBottom: `2px solid ${tab === t.id ? C.rose : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "logic" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="The logic of Difference-in-Differences" sub="Two groups, two time periods, one causal estimate" />
          <Pr>DiD answers the question: <strong>"Did this treatment/policy cause the outcome to change?"</strong> It does this by comparing the before-after change in the treated group to the before-after change in a control group. The difference between these two differences is the treatment effect.</Pr>

          <CBox title={<>📊 DiD Step by Step</>} color={C.rose}>
            <LogicViz />
          </CBox>

          <Anl>
            Two runners are racing on parallel tracks. One runner (treated) drinks an energy drink at the halfway point; the other (control) doesn't. Both runners were speeding up at the same rate before the drink. If the treated runner accelerates more after the drink than the control runner does, the extra acceleration is the effect of the energy drink — not just natural speed-up.
          </Anl>

          <NBtn onClick={() => setTab("trends")} label="Next: Parallel Trends →" />
        </div>}

        {tab === "trends" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="The parallel trends assumption" sub="The one assumption that makes or breaks DiD" />
          <Pr>DiD only works if, in the absence of treatment, both groups would have followed the <strong>same trend</strong>. They don't need to be at the same level — they just need to be changing at the same rate. This is untestable (we can't observe the counterfactual), but we can check whether trends were parallel <em>before</em> the treatment.</Pr>

          <CBox title={<>📈 Parallel Trends Explorer</>} color={C.rose}>
            <ParallelTrendsViz />
          </CBox>

          <NBtn onClick={() => setTab("reg")} label="Next: The Regression →" />
        </div>}

        {tab === "reg" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="The DiD regression equation" sub="How the 2×2 logic translates into a regression model" />
          <Pr>The visual intuition from Tab 1 maps directly onto a regression. Each coefficient has a specific meaning tied to the 2×2 structure:</Pr>

          <CBox title={<>🧮 The Equation, Decoded</>} color={C.rose}>
            <RegressionViz />
          </CBox>

          <NBtn onClick={() => setTab("threats")} label="Next: Threats →" />
        </div>}

        {tab === "threats" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="What can go wrong" sub="Four threats to the validity of your DiD design" />

          <CBox title={<>⚠️ Threats to Validity</>} color={C.rose}>
            <ThreatsViz />
          </CBox>

          <NBtn onClick={() => setTab("modern")} label="Next: Modern DiD →" />
        </div>}

        {tab === "modern" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="Beyond the 2×2: modern DiD" sub="Staggered treatment timing and continuous treatment intensity" />
          <Pr>The classic 2×2 DiD (one treatment group, one control, one treatment time) is a special case. In management research, you'll almost always face more complex settings — different adoption times, or a treatment that varies in intensity rather than being binary.</Pr>

          <CBox title={<>🔬 Modern DiD Extensions</>} color={C.smp}>
            <ModernDiDViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>DiD</strong> estimates causal effects by comparing the <em>change</em> in the treated group to the <em>change</em> in the control group. The difference of these differences removes both group differences and time trends.<br />
              <strong>2.</strong> The <strong>parallel trends assumption</strong> is critical. Always plot pre-trends and run an event study to check.<br />
              <strong>3.</strong> The regression: Y = β₀ + β₁Treat + β₂Post + <strong>β₃(Treat × Post)</strong> + ε. With panel FE, you only need the interaction term.<br />
              <strong>4.</strong> Watch for threats: parallel trends violations, composition changes, anticipation effects, and spillovers.<br />
              <strong>5.</strong> With <strong>staggered treatment timing</strong>, standard TWFE uses already-treated units as controls — producing biased estimates with negative weights. Use modern estimators (Callaway & Sant'Anna, Sun & Abraham, stacked DiD).<br />
              <strong>6.</strong> With <strong>continuous treatment intensity</strong>, you don't need a clean treatment/control split. Interact a pre-treatment exposure measure with the post indicator. The key assumption: intensity must be determined before the treatment.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
