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
  if (n < 2) return { b0: 0, b1: 0, r2: 0 };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const ssxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const ssyy = pts.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const b1 = ssxx > 0 ? ssxy / ssxx : 0;
  const b0 = my - b1 * mx;
  const r2 = ssxx > 0 && ssyy > 0 ? (ssxy ** 2) / (ssxx * ssyy) : 0;
  return { b0, b1, r2 };
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
function SC({ children }) { return <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, marginTop: "10px", fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.9 }}>{children}</div>; }

// ═══════════════════════════════════════════════════════════════════
// TAB 1: THE IV IDEA
// ═══════════════════════════════════════════════════════════════════
function IVIdeaViz() {
  const [step, setStep] = useState(0);

  // DAG layout
  const W = 420, H = 200;
  const nodes = {
    Z: { x: 60, y: 100, label: "Z", sub: "Instrument", color: C.grn },
    X: { x: 210, y: 100, label: "X", sub: "Treatment", color: C.sam },
    Y: { x: 360, y: 100, label: "Y", sub: "Outcome", color: C.rose },
    U: { x: 285, y: 30, label: "U", sub: "Confounder", color: C.pop },
  };

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        When X and Y share an unobserved confounder (U), OLS is biased. The instrumental variables strategy finds a <strong>back door into X</strong> — a variable Z that affects Y <em>only through X</em>, bypassing the confounder entirely.
      </div>

      <Anl>
        Imagine you want to know if a drug (X) cures a disease (Y), but sicker patients take more of the drug (confounder U). You can't just compare dosages — patients who took more were already sicker. But suppose some patients were <strong>randomly assigned</strong> to a doctor who tends to prescribe higher doses (Z). The doctor's prescribing habit (Z) predicts dosage (X) but has no direct effect on the disease (Y) except through the drug. That's an instrument.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {[
          { label: "1. The problem" },
          { label: "2. Enter the instrument" },
          { label: "3. The IV logic" },
        ].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.rose : C.bdr,
            background: step === i ? C.roseBg : "transparent",
            color: step === i ? C.rose : C.txD,
            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Confounder U — always show in steps 0,1,2 */}
          <circle cx={nodes.U.x} cy={nodes.U.y} r="22" fill={C.popBg} stroke={C.pop} strokeWidth="2" />
          <text x={nodes.U.x} y={nodes.U.y + 1} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.pop} fontFamily={mono}>U</text>
          <text x={nodes.U.x} y={nodes.U.y - 30} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Unobserved</text>

          {/* U → X arrow */}
          <line x1={nodes.U.x - 15} x2={nodes.X.x - 5} y1={nodes.U.y + 18} y2={nodes.X.y - 18} stroke={C.pop} strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrIV)" />
          {/* U → Y arrow */}
          <line x1={nodes.U.x + 15} x2={nodes.Y.x - 5} y1={nodes.U.y + 18} y2={nodes.Y.y - 18} stroke={C.pop} strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrIV)" />

          {/* X node */}
          <circle cx={nodes.X.x} cy={nodes.X.y} r="22" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
          <text x={nodes.X.x} y={nodes.X.y + 1} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.sam} fontFamily={mono}>X</text>
          <text x={nodes.X.x} y={nodes.X.y + 36} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Treatment</text>

          {/* Y node */}
          <circle cx={nodes.Y.x} cy={nodes.Y.y} r="22" fill={C.roseBg} stroke={C.rose} strokeWidth="2" />
          <text x={nodes.Y.x} y={nodes.Y.y + 1} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.rose} fontFamily={mono}>Y</text>
          <text x={nodes.Y.x} y={nodes.Y.y + 36} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Outcome</text>

          {/* X → Y arrow (the causal effect we want) */}
          <line x1={nodes.X.x + 24} x2={nodes.Y.x - 24} y1={nodes.X.y} y2={nodes.Y.y} stroke={step === 0 ? C.rose : C.sam} strokeWidth="2.5" markerEnd="url(#arrIV)" />
          {step === 0 && <text x={(nodes.X.x + nodes.Y.x) / 2} y={nodes.X.y + 18} textAnchor="middle" fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600">Biased by U</text>}

          {/* Step 1 — cross out the direct X→Y */}
          {step === 0 && (
            <g>
              <line x1={(nodes.X.x + nodes.Y.x) / 2 - 12} x2={(nodes.X.x + nodes.Y.x) / 2 + 12} y1={nodes.X.y - 8} y2={nodes.X.y + 8} stroke={C.rose} strokeWidth="3" opacity="0.6" />
              <line x1={(nodes.X.x + nodes.Y.x) / 2 + 12} x2={(nodes.X.x + nodes.Y.x) / 2 - 12} y1={nodes.X.y - 8} y2={nodes.X.y + 8} stroke={C.rose} strokeWidth="3" opacity="0.6" />
            </g>
          )}

          {/* Z node — show in steps 1, 2 */}
          {step >= 1 && (
            <g>
              <circle cx={nodes.Z.x} cy={nodes.Z.y} r="22" fill={C.grnBg} stroke={C.grn} strokeWidth="2.5" />
              <text x={nodes.Z.x} y={nodes.Z.y + 1} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.grn} fontFamily={mono}>Z</text>
              <text x={nodes.Z.x} y={nodes.Z.y + 36} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Instrument</text>

              {/* Z → X arrow (relevance) */}
              <line x1={nodes.Z.x + 24} x2={nodes.X.x - 24} y1={nodes.Z.y} y2={nodes.X.y} stroke={C.grn} strokeWidth="2.5" markerEnd="url(#arrGrn)" />
              <text x={(nodes.Z.x + nodes.X.x) / 2} y={nodes.Z.y - 14} textAnchor="middle" fontSize="9" fill={C.grn} fontFamily={font} fontWeight="600">Relevance</text>
            </g>
          )}

          {/* Step 2 — show the crossed out Z → Y and the "only through X" label */}
          {step === 2 && (
            <g>
              {/* No Z → Y arrow (exclusion) — show faded crossed-out path */}
              <line x1={nodes.Z.x + 10} x2={nodes.Y.x - 10} y1={nodes.Z.y - 20} y2={nodes.Y.y - 20} stroke={C.txM} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.4" />
              <line x1={(nodes.Z.x + nodes.Y.x) / 2 - 8} x2={(nodes.Z.x + nodes.Y.x) / 2 + 8} y1={60 - 6} y2={60 + 6} stroke={C.rose} strokeWidth="2.5" />
              <line x1={(nodes.Z.x + nodes.Y.x) / 2 + 8} x2={(nodes.Z.x + nodes.Y.x) / 2 - 8} y1={60 - 6} y2={60 + 6} stroke={C.rose} strokeWidth="2.5" />
              <text x={(nodes.Z.x + nodes.Y.x) / 2} y={48} textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Exclusion: no direct path</text>

              {/* Highlight the Z→X→Y path */}
              <text x={nodes.X.x} y={nodes.X.y + 50} textAnchor="middle" fontSize="10" fill={C.grn} fontFamily={font} fontWeight="700">Z affects Y only through X</text>
            </g>
          )}

          <defs>
            <marker id="arrIV" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.pop} strokeWidth="1.5" /></marker>
            <marker id="arrGrn" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.grn} strokeWidth="1.5" /></marker>
          </defs>
        </svg>
      </div>

      {/* Step explanations */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong style={{ color: C.rose }}>The problem:</strong> We want the causal effect of X on Y, but unobserved U causes both X and Y. OLS picks up both the true X→Y effect <em>and</em> the spurious U→X→(confounded)→Y path. The estimate is biased, and no amount of data fixes this — it's a structural problem.</>}
        {step === 1 && <><strong style={{ color: C.grn }}>Enter the instrument:</strong> We find a variable Z that (1) is correlated with X — the <strong>relevance</strong> condition. Z must actually predict X. In our drug example, the doctor's prescribing habit predicts dosage. If Z doesn't move X, we have nothing to work with.</>}
        {step === 2 && <><strong style={{ color: C.grn }}>The IV logic:</strong> Z must also satisfy <strong>exclusion</strong> — it affects Y <em>only through X</em>, with no direct path and no correlation with U. This means any association between Z and Y must be <em>entirely</em> because Z→X→Y. We can use this clean variation in X (the part driven by Z) to estimate the causal effect. The confounded variation in X (driven by U) is discarded.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: THE TWO CONDITIONS
// ═══════════════════════════════════════════════════════════════════
function TwoConditionsViz() {
  const [example, setExample] = useState(0);

  const examples = [
    {
      title: "CEO compensation → Firm performance",
      Z: "Industry-median CEO pay", X: "CEO compensation", Y: "Firm performance", U: "Firm quality / board capture",
      relevance: "Industry pay norms predict individual CEO pay (firms benchmark against peers).",
      exclusion: "Industry-median pay has no direct effect on any single firm's performance — it only affects performance by changing how much the firm pays its CEO.",
      concern: "If industry trends also affect performance (e.g., industry booms), exclusion is violated. Must argue industry-level shocks are controlled for.",
    },
    {
      title: "R&D spending → Innovation",
      Z: "State R&D tax credits", X: "R&D spending", Y: "Patent output", U: "Firm absorptive capacity",
      relevance: "Tax credits reduce the effective cost of R&D, so firms in credit-states spend more.",
      exclusion: "The tax credit affects patents only by inducing more R&D spending, not through any other channel.",
      concern: "If states that pass R&D credits also invest more in universities or infrastructure, those could directly affect innovation — violating exclusion.",
    },
    {
      title: "Board diversity → Firm value",
      Z: "Country-level gender quota law", X: "Board gender diversity", Y: "Firm value (Tobin's Q)", U: "Corporate governance quality",
      relevance: "Quota laws force firms to appoint more women to boards, mechanically increasing diversity.",
      exclusion: "The quota affects firm value only through changing board composition, not through other channels.",
      concern: "Quota laws may signal broader governance reforms or coincide with other regulatory changes that directly affect firm value.",
    },
  ];
  const ex = examples[example];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        A valid instrument must satisfy <strong>two conditions</strong>. The first is testable; the second is not — it must be argued on theoretical grounds. This is what makes IV both powerful and controversial.
      </div>

      {/* Two conditions cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: C.card, borderRadius: "12px", border: `2px solid ${C.grn}`, padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "6px" }}>CONDITION 1: RELEVANCE</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            Z must be <strong>correlated with X</strong>.<br />
            Cov(Z, X) ≠ 0
          </div>
          <div style={{ fontSize: "11.5px", color: C.grn, fontWeight: 600, marginTop: "8px" }}>✓ Testable — check first-stage F-statistic</div>
        </div>
        <div style={{ background: C.card, borderRadius: "12px", border: `2px solid ${C.smp}`, padding: "16px 18px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "6px" }}>CONDITION 2: EXCLUSION</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            Z affects Y <strong>only through X</strong>.<br />
            Cov(Z, ε) = 0
          </div>
          <div style={{ fontSize: "11.5px", color: C.rose, fontWeight: 600, marginTop: "8px" }}>✗ Not testable — must argue theoretically</div>
        </div>
      </div>

      {/* Example selector */}
      <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Management research examples:</div>
      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setExample(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: example === i ? C.smp : C.bdr,
            background: example === i ? C.smpBg : "transparent",
            color: example === i ? C.smp : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>{e.title.split("→")[0].trim()}</button>
        ))}
      </div>

      {/* Example card */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>{ex.title}</div>

        {/* Mini DAG */}
        <svg viewBox="0 0 420 130" style={{ width: "100%", maxWidth: "420px", display: "block", marginBottom: "12px" }}>
          {/* U confounder — top center */}
          <circle cx="245" cy="22" r="16" fill={C.popBg} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="245" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.pop} fontFamily={mono}>U</text>
          <text x="245" y="8" textAnchor="middle" fontSize="8" fill={C.pop} fontFamily={font} fontStyle="italic">{ex.U}</text>

          {/* U→X dashed arrow */}
          <line x1="232" x2="185" y1="35" y2="60" stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrPop)" />
          {/* U→Y dashed arrow */}
          <line x1="258" x2="330" y1="35" y2="60" stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrPop)" />

          {/* Z node */}
          <circle cx="60" cy="72" r="20" fill={C.grnBg} stroke={C.grn} strokeWidth="2" />
          <text x="60" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.grn} fontFamily={mono}>Z</text>
          <text x="60" y="104" textAnchor="middle" fontSize="8.5" fill={C.grn} fontFamily={font} fontWeight="600">{ex.Z}</text>

          {/* X node */}
          <circle cx="180" cy="72" r="20" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
          <text x="180" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.sam} fontFamily={mono}>X</text>
          <text x="180" y="104" textAnchor="middle" fontSize="8.5" fill={C.sam} fontFamily={font} fontWeight="600">{ex.X}</text>

          {/* Y node */}
          <circle cx="340" cy="72" r="20" fill={C.roseBg} stroke={C.rose} strokeWidth="2" />
          <text x="340" y="76" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.rose} fontFamily={mono}>Y</text>
          <text x="340" y="104" textAnchor="middle" fontSize="8.5" fill={C.rose} fontFamily={font} fontWeight="600">{ex.Y}</text>

          {/* Z→X arrow */}
          <line x1="82" x2="158" y1="72" y2="72" stroke={C.grn} strokeWidth="2" markerEnd="url(#arrGrn2)" />
          {/* X→Y arrow */}
          <line x1="202" x2="318" y1="72" y2="72" stroke={C.sam} strokeWidth="2" markerEnd="url(#arrSam2)" />

          {/* No Z→Y (exclusion) */}
          <line x1="76" x2="322" y1="56" y2="56" stroke={C.txM} strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
          <text x="200" y="52" textAnchor="middle" fontSize="7.5" fill={C.rose} fontFamily={font}>✗ no direct path</text>

          <defs>
            <marker id="arrPop" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="7" markerHeight="5" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.pop} strokeWidth="1.5" /></marker>
            <marker id="arrGrn2" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="7" markerHeight="5" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.grn} strokeWidth="1.5" /></marker>
            <marker id="arrSam2" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="7" markerHeight="5" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.sam} strokeWidth="1.5" /></marker>
          </defs>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "3px" }}>RELEVANCE</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>{ex.relevance}</div>
          </div>
          <div style={{ background: C.smpBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "3px" }}>EXCLUSION ARGUMENT</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>{ex.exclusion}</div>
          </div>
          <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "3px" }}>POTENTIAL CONCERN</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>{ex.concern}</div>
          </div>
        </div>
      </div>

      <Ins>
        <strong>The exclusion restriction is the hardest part of IV.</strong> You can never prove it with data — you must argue it theoretically. Reviewers will challenge it, and the burden of proof is on you. A common strategy: discuss all plausible channels through which Z might affect Y, and argue (or show) that each is either implausible or controlled for.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: 2SLS
// ═══════════════════════════════════════════════════════════════════
function TwoSLSViz() {
  const [stage, setStage] = useState(0);
  const [seed, setSeed] = useState(1);

  // Generate data with endogeneity
  const data = useMemo(() => {
    const pts = [];
    const rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 120; i++) {
      const r = (k) => { const v = rng(seed * 1000 + i * 7 + k); return -2 + 4 * v; };
      const z = r(1) * 2;           // instrument
      const u = r(2) * 1.5;         // unobserved confounder
      const x = 0.8 * z + 1.2 * u + r(3) * 0.8;  // X driven by Z and U
      const y = 0.5 * x + 1.5 * u + r(4) * 1.0;   // true effect = 0.5, confounded by U
      pts.push({ z, x, y, u });
    }
    return pts;
  }, [seed]);

  // Regressions
  const olsXY = linReg(data.map(d => ({ x: d.x, y: d.y })));
  const firstStage = linReg(data.map(d => ({ x: d.z, y: d.x })));
  const xHat = data.map(d => firstStage.b0 + firstStage.b1 * d.z);
  const secondStage = linReg(data.map((d, i) => ({ x: xHat[i], y: d.y })));

  const W = 440, H = 260, pad = { t: 16, r: 16, b: 34, l: 42 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  // Plot bounds
  const getPlotData = () => {
    if (stage === 0) return { pts: data.map(d => ({ x: d.x, y: d.y })), xLabel: "X (Treatment)", yLabel: "Y (Outcome)", reg: olsXY, color: C.rose };
    if (stage === 1) return { pts: data.map(d => ({ x: d.z, y: d.x })), xLabel: "Z (Instrument)", yLabel: "X (Treatment)", reg: firstStage, color: C.grn };
    return { pts: data.map((d, i) => ({ x: xHat[i], y: d.y })), xLabel: "X̂ (Predicted from Z)", yLabel: "Y (Outcome)", reg: secondStage, color: C.smp };
  };
  const pd = getPlotData();
  const allX = pd.pts.map(p => p.x), allY = pd.pts.map(p => p.y);
  const xMin = Math.min(...allX) - 0.5, xMax = Math.max(...allX) + 0.5;
  const yMin2 = Math.min(...allY) - 0.5, yMax2 = Math.max(...allY) + 0.5;
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin)) * cw;
  const sy = v => pad.t + ch - ((v - yMin2) / (yMax2 - yMin2)) * ch;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        <strong>Two-Stage Least Squares (2SLS)</strong> operationalizes the IV idea. It literally runs two regressions. Click through to see each stage with simulated data (true effect = <strong style={{ color: C.smp }}>0.500</strong>):
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {[
          { label: "OLS (biased)" },
          { label: "Stage 1: Z → X" },
          { label: "Stage 2: X̂ → Y" },
        ].map((s, i) => (
          <button key={i} onClick={() => setStage(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: stage === i ? pd.color : C.bdr,
            background: stage === i ? (i === 0 ? C.roseBg : i === 1 ? C.grnBg : C.smpBg) : "transparent",
            color: stage === i ? pd.color : C.txD,
            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Dots */}
          {pd.pts.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="2.5" fill={pd.color} opacity="0.3" />
          ))}

          {/* Regression line */}
          <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(pd.reg.b0 + pd.reg.b1 * xMin)} y2={sy(pd.reg.b0 + pd.reg.b1 * xMax)} stroke={pd.color} strokeWidth="2.5" />

          {/* True effect line (in OLS and 2SLS views) */}
          {stage !== 1 && (
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(olsXY.b0 + 0.5 * xMin + (olsXY.b1 - 0.5) * ((xMin + xMax) / 2))} y2={sy(olsXY.b0 + 0.5 * xMax + (olsXY.b1 - 0.5) * ((xMin + xMax) / 2))} stroke={C.txM} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
          )}

          {/* Axis labels */}
          <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>{pd.xLabel}</text>
          <text x="10" y={(pad.t + H - pad.b) / 2} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${(pad.t + H - pad.b) / 2})`}>{pd.yLabel}</text>
        </svg>

        {/* Stats */}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>SLOPE</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: pd.color, fontFamily: mono }}>{pd.reg.b1.toFixed(3)}</div>
          </div>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>TRUE EFFECT</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: C.txD, fontFamily: mono }}>0.500</div>
          </div>
          <div style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>{stage === 1 ? "F-STAT" : "BIAS"}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: stage === 1 ? C.grn : Math.abs(pd.reg.b1 - 0.5) < 0.15 ? C.grn : C.rose, fontFamily: mono }}>
              {stage === 1 ? (firstStage.r2 * data.length / (1 - firstStage.r2)).toFixed(0) : (stage === 0 ? `+${(olsXY.b1 - 0.5).toFixed(3)}` : (secondStage.b1 - 0.5 > 0 ? "+" : "") + (secondStage.b1 - 0.5).toFixed(3))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage explanations */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {stage === 0 && <><strong style={{ color: C.rose }}>OLS is biased upward.</strong> The slope ({olsXY.b1.toFixed(3)}) overestimates the true effect (0.500) because the confounder U pushes both X and Y in the same direction. OLS picks up the causal effect <em>plus</em> the confounded correlation.</>}
        {stage === 1 && <><strong style={{ color: C.grn }}>First stage: regress X on Z.</strong> This isolates the variation in X that's driven by Z (the "clean" variation). The predicted values X̂ = β̂₀ + β̂₁Z contain only the Z-driven part of X — the confounder U is purged. The F-statistic tests whether Z actually predicts X (rule of thumb: F {">"} 10).</>}
        {stage === 2 && <><strong style={{ color: C.smp }}>Second stage: regress Y on X̂.</strong> Now we use only the clean, Z-driven variation in X (the predicted values from Stage 1) to estimate the effect on Y. Since X̂ contains no U contamination, the slope ({secondStage.b1.toFixed(3)}) is close to the true effect (0.500). The bias is {Math.abs(secondStage.b1 - 0.5) < 0.1 ? "nearly eliminated" : "substantially reduced"}.</>}
      </div>

      {/* Resample button */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button onClick={() => setSeed(s => s + 1)} style={{ padding: "8px 20px", borderRadius: "8px", border: `1px solid ${C.bdr}`, background: C.card, color: C.txD, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>🔄 New random sample</button>
      </div>

      {/* Equation */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>2SLS IN TWO EQUATIONS</div>
        <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, lineHeight: 2.2 }}>
          <span style={{ color: C.grn }}>Stage 1:</span> X<sub>i</sub> = γ₀ + γ₁Z<sub>i</sub> + v<sub>i</sub> {"  →  "} save <span style={{ color: C.grn }}>X̂<sub>i</sub></span><br />
          <span style={{ color: C.smp }}>Stage 2:</span> Y<sub>i</sub> = β₀ + <span style={{ color: C.smp }}>β₁</span><span style={{ color: C.grn }}>X̂<sub>i</sub></span> + ε<sub>i</sub> {"  →  "} <span style={{ color: C.smp }}>β₁</span> is the IV estimate
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: IV IN PRACTICE
// ═══════════════════════════════════════════════════════════════════
function IVPracticeViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        IV is powerful but fraught with pitfalls. Here's what you need to know for practice — the diagnostic tests, the Stata commands, and the traps that catch even experienced researchers.
      </div>

      {/* Weak instruments */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>The weak instrument problem</div>
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          If Z only weakly predicts X (low first-stage F-statistic), the IV estimate becomes <strong>unreliable</strong>: biased toward OLS, with huge standard errors and misleading confidence intervals.
        </div>

        <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
          {[
            { f: "F < 10", color: C.rose, label: "Weak — results unreliable", desc: "Classic Staiger & Stock (1997) threshold. IV is biased toward OLS. Standard inference breaks down." },
            { f: "10 ≤ F < 23", color: C.pop, label: "Moderate — use with caution", desc: "Lee et al. (2022) suggest F > 104.7 for truly reliable t-tests. Olea & Pflueger (2013) effective F is even stricter." },
            { f: "F ≥ 23", color: C.grn, label: "Strong — generally safe", desc: "Higher is better. Report the first-stage F regardless. Some journals now expect effective F-statistics." },
          ].map((r, i) => (
            <div key={i} style={{ flex: 1, background: r.color + "08", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${r.color}22` }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: r.color, fontFamily: mono, marginBottom: "4px" }}>{r.f}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: r.color, marginBottom: "4px" }}>{r.label}</div>
              <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LATE interpretation */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>What does IV actually estimate?</div>
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          IV estimates the <strong>Local Average Treatment Effect (LATE)</strong> — the causal effect only for <em>compliers</em>: units whose X changed because of Z. Not everyone in your sample is a complier.
        </div>
        <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
          {[
            { type: "Compliers", desc: "Take the drug when assigned to it, don't when not assigned", color: C.grn, note: "IV estimates the effect for this group" },
            { type: "Always-takers", desc: "Take the drug regardless of assignment", color: C.txD, note: "Not identified by IV" },
            { type: "Never-takers", desc: "Refuse the drug regardless of assignment", color: C.txD, note: "Not identified by IV" },
          ].map((t, i) => (
            <div key={i} style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: t.color }}>{t.type}</div>
              <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5, marginTop: "2px" }}>{t.desc}</div>
              <div style={{ fontSize: "10px", color: t.color, fontStyle: "italic", marginTop: "4px" }}>{t.note}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "12.5px", color: C.txD, lineHeight: 1.6 }}>
          <strong>Implication:</strong> If compliers are a small or unusual subset, LATE may not generalize to the full population. Always discuss who your compliers are and whether the LATE is externally relevant.
        </div>
      </div>

      {/* Diagnostic tests */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Key diagnostic tests</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { test: "First-stage F-statistic", purpose: "Tests instrument relevance (Z predicts X). Rule of thumb: F > 10.", stata: "estat firststage (after ivregress)" },
          { test: "Hausman test", purpose: "Tests whether OLS and IV give significantly different estimates. If not different, OLS is fine (more efficient). If different, IV is needed.", stata: "hausman iv_model ols_model" },
          { test: "Sargan / Hansen J test", purpose: "Tests overidentifying restrictions when you have more instruments than endogenous variables. Rejection suggests at least one instrument is invalid.", stata: "estat overid (after ivregress)" },
          { test: "Durbin-Wu-Hausman", purpose: "Tests endogeneity of X directly. If not rejected, X may not be endogenous and IV is unnecessary.", stata: "estat endogenous (after ivregress)" },
        ].map((t, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.tx }}>{t.test}</div>
                <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{t.purpose}</div>
              </div>
            </div>
            <div style={{ fontSize: "10.5px", color: C.txD, fontFamily: mono, marginTop: "4px" }}>{t.stata}</div>
          </div>
        ))}
      </div>

      {/* Stata code */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Stata implementation</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Method 1: ivregress (built-in)<br />
          ivregress 2sls y controls (x = z), first robust<br />
          estat firststage<br />
          estat endogenous<br />
          estat overid<br /><br />

          * Method 2: ivreg2 (community — more diagnostics)<br />
          * ssc install ivreg2<br />
          ivreg2 y controls (x = z), first robust<br /><br />

          * Method 3: Manual 2SLS (pedagogical)<br />
          regress x z controls        // Stage 1<br />
          predict x_hat               // Save predicted values<br />
          regress y x_hat controls     // Stage 2<br />
          * Note: SEs from manual 2SLS are WRONG —<br />
          * always use ivregress or ivreg2 for correct SEs
        </div>
      </div>

      <Ins>
        <strong>Common reviewer pushback on IV papers:</strong> (1) "Your exclusion restriction is not credible" — the #1 criticism. You must argue persuasively why Z has no direct effect on Y. (2) "Your instrument is weak" — report first-stage F and consider weak-instrument-robust inference (Anderson-Rubin test). (3) "LATE may not generalize" — discuss who the compliers are. (4) "Why not use a different identification strategy?" — compare IV to alternatives (DiD, RDD, matching) and explain why IV is most appropriate for your setting.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "idea", label: "1. The IV Idea" },
  { id: "conditions", label: "2. Two Conditions" },
  { id: "twosls", label: "3. 2SLS" },
  { id: "practice", label: "4. In Practice" },
];

export default function InstrumentalVariablesModule() {
  const [tab, setTab] = useState("idea");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Module header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.roseBg, fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>CAUSAL INFERENCE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Instrumental Variables</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Finding a back door into causation when experiments aren't possible</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", borderRadius: "10px", border: "1.5px solid",
            borderColor: tab === t.id ? C.rose : C.bdr,
            background: tab === t.id ? C.roseBg : "transparent",
            color: tab === t.id ? C.rose : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
            fontFamily: font, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "idea" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Why do we need instruments?" sub="When OLS is hopelessly biased and you can't run an experiment" />
          <CBox title={<>🔧 The Instrumental Variables Idea</>} color={C.grn}>
            <IVIdeaViz />
          </CBox>
          <NBtn onClick={() => setTab("conditions")} label="Next: Two Conditions →" />
        </div>}

        {tab === "conditions" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="What makes a good instrument?" sub="Relevance you can test, exclusion you must argue" />
          <CBox title={<>📋 The Two Conditions</>} color={C.smp}>
            <TwoConditionsViz />
          </CBox>
          <NBtn onClick={() => setTab("twosls")} label="Next: 2SLS Mechanics →" />
        </div>}

        {tab === "twosls" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Two-Stage Least Squares" sub="The mechanics of IV estimation with simulated data" />
          <Pr>2SLS extracts only the clean, instrument-driven variation in X and uses that to estimate the causal effect. Watch the bias shrink as you go from OLS to IV:</Pr>
          <CBox title={<>⚙️ 2SLS Step by Step</>} color={C.smp}>
            <TwoSLSViz />
          </CBox>
          <NBtn onClick={() => setTab("practice")} label="Next: IV in Practice →" />
        </div>}

        {tab === "practice" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="IV in practice" sub="Weak instruments, LATE, diagnostics, and Stata" />

          <CBox title={<>🔍 Practical IV Issues</>} color={C.rose}>
            <IVPracticeViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> IV finds a variable Z that affects X but has <strong>no direct effect on Y</strong>. This isolates "clean" variation in X that's free of confounders.<br />
              <strong>2.</strong> Two conditions: <strong>relevance</strong> (Z predicts X — testable with first-stage F) and <strong>exclusion</strong> (Z affects Y only through X — not testable, must argue theoretically).<br />
              <strong>3.</strong> <strong>2SLS</strong> operationalizes IV: Stage 1 regresses X on Z to get predicted values X̂. Stage 2 regresses Y on X̂. The Stage 2 slope is the causal estimate.<br />
              <strong>4.</strong> <strong>Weak instruments</strong> (first-stage F {"<"} 10) make IV unreliable — worse than OLS. Always report the first-stage F-statistic.<br />
              <strong>5.</strong> IV estimates <strong>LATE</strong> — the effect for compliers only. Discuss who your compliers are and whether the estimate generalizes.<br />
              <strong>6.</strong> In Stata: <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>ivregress 2sls y (x = z), first robust</code>. Always run diagnostics: <code style={{ fontFamily: mono, fontSize: "12px" }}>estat firststage</code>, <code style={{ fontFamily: mono, fontSize: "12px" }}>estat endogenous</code>.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
