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

// ─── Shared UI ──────────────────────────────────────────────────────
function SH({ number, title, sub }) {
  return (<div style={{ marginBottom: "22px" }}>
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.grn, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.grn }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.grn, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: THE CONCEPT
// ═══════════════════════════════════════════════════════════════════
function ConceptViz() {
  const [step, setStep] = useState(0);

  const examples = [
    { x: "Training", y: "Job Performance", z: "Employee Motivation", story: "Training improves performance, but more so for highly motivated employees. Unmotivated employees don't benefit as much — the training slides off them.", zLow: "Low motivation: training barely helps", zHigh: "High motivation: training helps a lot" },
    { x: "R&D Spending", y: "Innovation Output", z: "Organizational Slack", story: "R&D spending leads to innovation, but only when the firm has enough slack resources to absorb the risk of experimentation. Cash-strapped firms can't exploit their R&D investments.", zLow: "Low slack: R&D spending is wasted", zHigh: "High slack: R&D spending pays off" },
    { x: "CEO Confidence", y: "Firm Risk-Taking", z: "Board Independence", story: "Confident CEOs push for risky strategies. But an independent board can check overconfidence. With a weak board, confident CEOs take excessive risk.", zLow: "Independent board: confidence is kept in check", zHigh: "Weak board: confidence leads to reckless risk" },
  ];

  const ex = examples[step];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Moderation answers the question: <strong>"When does the effect of X on Y get stronger, weaker, or reverse?"</strong> A moderator (Z) is a variable that changes the <em>size or direction</em> of the X→Y relationship.
      </div>

      {/* Diagram */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "24px", boxShadow: C.sh, marginBottom: "16px" }}>
        <svg viewBox="0 0 420 180" style={{ width: "100%", maxWidth: "440px", display: "block", margin: "0 auto" }}>
          {/* X box */}
          <rect x="20" y="70" width="110" height="44" rx="10" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
          <text x="75" y="96" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.sam} fontFamily={font}>{ex.x}</text>

          {/* Y box */}
          <rect x="290" y="70" width="110" height="44" rx="10" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
          <text x="345" y="96" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.smp} fontFamily={font}>{ex.y}</text>

          {/* Z box */}
          <rect x="155" y="10" width="110" height="44" rx="10" fill={C.popBg} stroke={C.pop} strokeWidth="2" />
          <text x="210" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.pop} fontFamily={font}>{ex.z}</text>

          {/* X → Y arrow */}
          <line x1="130" x2="285" y1="92" y2="92" stroke={C.tx} strokeWidth="2" markerEnd="url(#arrowM)" />
          <defs><marker id="arrowM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.tx} /></marker></defs>

          {/* Z → arrow (hits the X→Y path) */}
          <line x1="210" x2="210" y1="54" y2="85" stroke={C.pop} strokeWidth="2" markerEnd="url(#arrowMod)" />
          <defs><marker id="arrowMod" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.pop} /></marker></defs>

          {/* Label on the interaction */}
          <text x="245" y="82" fontSize="10" fill={C.pop} fontFamily={mono} fontWeight="600">{"×"}</text>

          <text x="210" y="170" textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font}>Z doesn't cause Y directly — it changes how strongly X affects Y</text>
        </svg>
      </div>

      {/* Example selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.grn : C.bdr,
            background: step === i ? C.grnBg : "transparent",
            color: step === i ? C.grn : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>Example {i + 1}</button>
        ))}
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 20px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "10px" }}>{ex.story}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.txM, fontFamily: mono }}>WHEN Z IS LOW</div>
            <div style={{ fontSize: "13px", color: C.txB, marginTop: "4px" }}>{ex.zLow}</div>
          </div>
          <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.pop, fontFamily: mono }}>WHEN Z IS HIGH</div>
            <div style={{ fontSize: "13px", color: C.txB, marginTop: "4px" }}>{ex.zHigh}</div>
          </div>
        </div>
      </div>

      <Ins>
        <strong>Key distinction from mediation:</strong> A moderator doesn't explain <em>why</em> X affects Y (that's mediation — Module 9). A moderator explains <em>when</em> or <em>for whom</em> X affects Y more or less. The moderator changes the size of the arrow, not the path.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: THE INTERACTION TERM
// ═══════════════════════════════════════════════════════════════════
function InteractionTermViz() {
  const [b1, setB1] = useState(2);
  const [b3, setB3] = useState(1.5);

  // Y = 10 + b1*X + 2*Z + b3*X*Z
  const b0 = 10, b2 = 2;
  const effectAtZ = z => b1 + b3 * z;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Moderation is tested by adding an <strong>interaction term</strong> (X × Z) to the regression. Here's the equation and what each piece means:
      </div>

      {/* The equation, piece by piece */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "10px" }}>THE MODERATION EQUATION</div>
        <div style={{ fontSize: "18px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "16px", lineHeight: 1.6 }}>
          <span style={{ color: C.txD }}>Y = {b0}</span>
          {" + "}
          <span style={{ color: C.sam }}>{b1}·X</span>
          {" + "}
          <span style={{ color: C.txD }}>{b2}·Z</span>
          {" + "}
          <span style={{ color: C.pop, textDecoration: "underline", textDecorationStyle: "wavy" }}>{b3}·X·Z</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "60px", fontSize: "13px", fontFamily: mono, fontWeight: 600, color: C.sam, flexShrink: 0 }}>b1·X</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>The effect of X on Y <strong>when Z = 0</strong>. This is no longer "the effect of X" in general — it's the effect at a specific value of Z.</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "60px", fontSize: "13px", fontFamily: mono, fontWeight: 600, color: C.txD, flexShrink: 0 }}>b2·Z</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>The effect of Z on Y <strong>when X = 0</strong>. Similarly conditional.</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "60px", fontSize: "13px", fontFamily: mono, fontWeight: 600, color: C.pop, flexShrink: 0 }}>b3·X·Z</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}><strong>The interaction term — this is the test of moderation.</strong> It asks: does the effect of X change as Z changes? If b3 is statistically significant, Z moderates the X→Y relationship.</div>
          </div>
        </div>
      </div>

      {/* The key rearrangement */}
      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", fontSize: "14px", lineHeight: 1.75, color: C.txB }}>
        <strong style={{ color: C.pop }}>The rearrangement that makes it click.</strong> Group the terms that involve X:
        <div style={{ fontFamily: mono, fontSize: "16px", fontWeight: 600, textAlign: "center", margin: "10px 0", color: C.tx }}>
          Y = {b0} + <span style={{ color: C.pop }}>({b1} + {b3}·Z)</span>·X + {b2}·Z
        </div>
        <div>
          The part in parentheses — <strong style={{ color: C.pop }}>({b1} + {b3}·Z)</strong> — is the <strong>effective slope of X</strong>. It's not a single fixed number; it <em>depends on Z</em>. That's exactly what moderation means: Z changes how steep the X→Y relationship is.
        </div>
      </div>

      {/* Interactive: how the slope changes with Z */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Main Effect of X (b1)</div>
          <input type="range" min="-2" max="5" step="0.5" value={b1} onChange={e => setB1(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.sam, fontFamily: mono }}>b1 = {b1} (effect of X when Z = 0)</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Interaction (b3)</div>
          <input type="range" min="-3" max="3" step="0.5" value={b3} onChange={e => setB3(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>b3 = {b3} {b3 > 0 ? "(Z amplifies X's effect)" : b3 < 0 ? "(Z dampens X's effect)" : "(no moderation)"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {[-1, 0, 1, 2, 3].map(z => {
          const eff = effectAtZ(z);
          return (
            <div key={z} style={{ background: C.bg, borderRadius: "8px", padding: "10px 16px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "100px" }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>Z = {z}</div>
              <div style={{ fontSize: "12px", color: C.txD, fontFamily: mono, marginBottom: "2px" }}>{b1} + {b3}×{z}</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: eff > 0 ? C.grn : eff < 0 ? C.rose : C.txM }}>{eff.toFixed(1)}</div>
              <div style={{ fontSize: "10px", color: C.txD }}>slope of X</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "14px", lineHeight: 1.7, textAlign: "center" }}>
        The effective slope of X changes from <strong>{effectAtZ(-1).toFixed(1)}</strong> (when Z = -1) to <strong>{effectAtZ(3).toFixed(1)}</strong> (when Z = 3). {b3 > 0 ? "Higher Z makes X's effect stronger." : b3 < 0 ? "Higher Z makes X's effect weaker (or reverses it)." : "Z doesn't change X's effect — no moderation."}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: PLOTTING INTERACTIONS (SIMPLE SLOPES)
// ═══════════════════════════════════════════════════════════════════
function SimpleSlopesViz() {
  const [b1, setB1] = useState(2);
  const [b3, setB3] = useState(1.5);
  const b0 = 10, b2 = 3;

  // Data generation
  const data = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 120; i++) {
      const z = rNorm(0, 1);
      const x = rNorm(3, 1.5);
      const y = b0 + 2 * x + 3 * z + 1.5 * x * z + rNorm(0, 3);
      pts.push({ x, y, z });
    }
    return pts;
  }, []);

  // Z levels for simple slopes
  const zLow = -1, zMed = 0, zHigh = 1;
  const slopeAt = z => b1 + b3 * z;
  const interceptAt = z => b0 + b2 * z;

  const W = 540, H = 320, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xRange = [-1, 7], yRange = [-5, 45];
  const sx = v => pad.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * cw;
  const sy = v => pad.t + ch - ((v - yRange[0]) / (yRange[1] - yRange[0])) * ch;

  const lineY = (x, z) => interceptAt(z) + slopeAt(z) * x;

  const zColors = [
    { z: zLow, label: "Z = -1 (low)", color: C.sam, dash: "8,4" },
    { z: zMed, label: "Z = 0 (mean)", color: C.txD, dash: "0" },
    { z: zHigh, label: "Z = +1 (high)", color: C.pop, dash: "0" },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The standard way to visualize moderation is the <strong>simple slopes plot</strong>: draw the X→Y regression line at different levels of Z (typically mean, +1 SD, and -1 SD). If the lines have different slopes, Z is moderating the relationship.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Main Effect b1 (slope when Z = 0)</div>
          <input type="range" min="-2" max="5" step="0.5" value={b1} onChange={e => setB1(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.sam, fontFamily: mono }}>b1 = {b1}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Interaction b3 (how Z changes the slope)</div>
          <input type="range" min="-3" max="3" step="0.5" value={b3} onChange={e => setB3(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>b3 = {b3}</div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grid */}
          {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {[0, 10, 20, 30, 40].map(v => v >= yRange[0] && v <= yRange[1] && <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

          {/* Data points colored by Z */}
          {data.map((d, i) => {
            const color = d.z > 0.5 ? C.pop : d.z < -0.5 ? C.sam : C.txM;
            return <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="3" fill={color} opacity="0.25" />;
          })}

          {/* Simple slopes lines */}
          {zColors.map(({ z, color, dash }) => (
            <line key={z} x1={sx(xRange[0])} x2={sx(xRange[1])} y1={sy(lineY(xRange[0], z))} y2={sy(lineY(xRange[1], z))} stroke={color} strokeWidth="2.5" strokeDasharray={dash} />
          ))}

          {/* Legend */}
          {zColors.map(({ z, label, color, dash }, i) => (
            <g key={z}>
              <line x1={pad.l + cw - 130} x2={pad.l + cw - 110} y1={pad.t + 10 + i * 16} y2={pad.t + 10 + i * 16} stroke={color} strokeWidth="2.5" strokeDasharray={dash} />
              <text x={pad.l + cw - 106} y={pad.t + 14 + i * 16} fontSize="10" fill={color} fontFamily={font} fontWeight="600">{label}: slope = {slopeAt(z).toFixed(1)}</text>
            </g>
          ))}

          {/* Axes */}
          {[0, 1, 2, 3, 4, 5, 6].map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {[0, 10, 20, 30, 40].filter(v => v >= yRange[0] && v <= yRange[1]).map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          <text x={sx(3)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X</text>
          <text x="12" y={sy(20)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy(20)})`}>Y</text>
        </svg>
      </div>

      {/* How to read it */}
      <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginTop: "14px" }}>
        <strong>How to read this plot:</strong> {Math.abs(b3) < 0.01 ? (
          "All three lines have the same slope — Z doesn't change the effect of X on Y. No moderation."
        ) : b3 > 0 ? (
          `The lines fan out as X increases. At high Z (amber line), the slope is ${slopeAt(zHigh).toFixed(1)} — X has a strong effect. At low Z (blue dashed), the slope is only ${slopeAt(zLow).toFixed(1)}. Z amplifies the X→Y relationship. If the lines were parallel, there would be no moderation.`
        ) : (
          `The lines converge (or cross) as X increases. At high Z (amber line), the slope is ${slopeAt(zHigh).toFixed(1)}. At low Z (blue dashed), the slope is ${slopeAt(zLow).toFixed(1)}. Z dampens (or reverses) the X→Y relationship.`
        )}
      </div>

      <Ins>
        <strong>The visual test:</strong> If the simple slopes lines are <strong>parallel</strong>, there's no moderation — Z shifts the level of Y but doesn't change the slope. If the lines <strong>fan out, converge, or cross</strong>, Z is moderating the relationship. The interaction coefficient (b3) is significant when the slope difference between high-Z and low-Z lines is statistically distinguishable from zero.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: COMMON MISTAKES
// ═══════════════════════════════════════════════════════════════════
function MistakesViz() {
  const [showCentered, setShowCentered] = useState(false);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Interaction effects trip up even experienced researchers. Here are the most common pitfalls:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Mistake 1 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Interpreting b1 as "the effect of X"</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                In a model with an interaction term, b1 is <strong>not</strong> the overall effect of X. It's the effect of X <strong>specifically when Z = 0</strong>. If Z is something like "years of education," then b1 is the effect of X for someone with zero years of education — which might not be meaningful at all.
              </div>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)", marginTop: "8px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
                <strong style={{ color: C.grn }}>Fix: Mean-center your variables.</strong> If you subtract the mean from Z before creating the interaction, then Z = 0 means "at the average Z" — and b1 becomes "the effect of X at the average level of Z," which is much more interpretable. Same for X.
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 2 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Dropping the main effects</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                Some students include X×Z in the model but forget to include X and Z separately. This is almost always wrong. The interaction term should be <em>added to</em> the main effects, not substituted for them.
              </div>
              <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, marginTop: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono }}>✗ WRONG</div>
                    <div style={{ fontSize: "12px", fontFamily: mono, color: C.txB, marginTop: "4px" }}>Y = b0 + b3·X·Z</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono }}>✓ CORRECT</div>
                    <div style={{ fontSize: "12px", fontFamily: mono, color: C.txB, marginTop: "4px" }}>Y = b0 + b1·X + b2·Z + b3·X·Z</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 3 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>3</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Significant interaction but no plot</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                Reporting "the interaction is significant (p {"<"} 0.05)" without a simple slopes plot is incomplete. The sign and magnitude of b3 don't tell you the full story. You need to show: (1) <strong>is the slope of X significant at high Z? At low Z?</strong> (these are the "simple slopes tests"), and (2) <strong>a plot</strong> so readers can see the pattern. An interaction can be "significant" but practically meaningless if the slopes are similar.
              </div>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)", marginTop: "8px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
                <strong style={{ color: C.grn }}>In Stata:</strong> After <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>reg y c.x##c.z</code>, run <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>margins, dydx(x) at(z=(-1 0 1))</code> for simple slopes, then <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>marginsplot</code> for the graph.
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 4 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>4</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Confusing the direction of moderation</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                "Z moderates the effect of X on Y" and "X moderates the effect of Z on Y" are <strong>mathematically identical</strong> — the interaction term X×Z is the same either way. But they are <strong>theoretically different</strong>. Your theory should clearly state which variable is the focal predictor (X) and which is the moderator (Z). The moderator is the one whose level you "condition on" — you're asking "at different levels of Z, how does X affect Y?" not the reverse.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "concept", label: "1. The Concept" },
  { id: "term", label: "2. The Interaction Term" },
  { id: "slopes", label: "3. Simple Slopes Plot" },
  { id: "mistakes", label: "4. Common Mistakes" },
];

export default function Moderation() {
  const [tab, setTab] = useState("concept");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.grnBg, color: C.grn, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 8 · Mechanisms</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Moderation</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>When does the effect of X on Y get stronger, weaker, or even reverse? Moderation (interaction effects) answers this question — and it's one of the most common tools in management research.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.grn : C.txD, borderBottom: `2px solid ${tab === t.id ? C.grn : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "concept" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="What is moderation?" sub='"When" or "for whom" does X affect Y?' />
          <Pr>So far, we've asked simple questions: "Does X affect Y?" and "How much?" But in real research, the answer is almost never just "yes" or "no." It depends on the context. <strong>Moderation</strong> captures this: a third variable Z changes the strength or direction of the X→Y relationship.</Pr>

          <CBox title={<>🔀 The Moderation Diagram</>} color={C.grn}>
            <ConceptViz />
          </CBox>

          <NBtn onClick={() => setTab("term")} label="Next: The Interaction Term →" />
        </div>}

        {tab === "term" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="How moderation works in regression" sub="The interaction term and what it really means" />
          <Pr>Moderation is tested by multiplying X and Z together and adding this <strong>interaction term</strong> (X × Z) to the regression equation. The key insight: the coefficient on X is no longer a fixed number — it <em>depends on the value of Z</em>.</Pr>

          <CBox title={<>🧮 The Interaction Equation</>} color={C.grn}>
            <InteractionTermViz />
          </CBox>

          <Anl>Think of a dimmer switch (Z) on a light (X→Y relationship). The light switch (X) turns on the light (Y). But the dimmer (Z) controls how bright it gets. With the dimmer low, flipping the switch produces a faint glow. With the dimmer high, the same switch floods the room with light. The interaction term captures the dimmer setting.</Anl>

          <NBtn onClick={() => setTab("slopes")} label="Next: Simple Slopes Plot →" />
        </div>}

        {tab === "slopes" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Visualizing moderation" sub="The simple slopes plot — the standard way to present interactions" />
          <Pr>A regression table with an interaction term is hard to interpret on its own. The <strong>simple slopes plot</strong> makes moderation visible: it draws separate regression lines for X→Y at low, medium, and high values of Z. If the lines aren't parallel, there's moderation.</Pr>

          <CBox title={<>📊 Interactive Simple Slopes</>} color={C.grn}>
            <SimpleSlopesViz />
          </CBox>

          <NBtn onClick={() => setTab("mistakes")} label="Next: Common Mistakes →" />
        </div>}

        {tab === "mistakes" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Pitfalls to avoid" sub="The most common mistakes researchers make with moderation" />

          <CBox title={<>⚠️ Common Moderation Mistakes</>} color={C.grn}>
            <MistakesViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>Moderation</strong> asks "when/for whom does X affect Y more or less?" A moderator Z changes the <em>size or direction</em> of the X→Y relationship.<br />
              <strong>2.</strong> Test moderation by adding an <strong>interaction term (X × Z)</strong> to the regression. If b3 is significant, Z moderates the relationship.<br />
              <strong>3.</strong> With an interaction, b1 is no longer "the effect of X" — it's the effect of X <strong>when Z = 0</strong>. Mean-center your variables so this is interpretable.<br />
              <strong>4.</strong> Always include <strong>both main effects</strong> (X and Z) alongside the interaction.<br />
              <strong>5.</strong> Always <strong>plot the interaction</strong> with a simple slopes graph. Report simple slopes tests showing whether the slope of X is significant at different levels of Z.<br />
              <strong>6.</strong> "Z moderates X→Y" and "X moderates Z→Y" use the same math. Your <strong>theory</strong> determines which is the moderator.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
