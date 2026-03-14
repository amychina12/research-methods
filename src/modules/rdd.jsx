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
  return { b0: my - b1 * mx, b1 };
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
// TAB 1: THE RDD IDEA
// ═══════════════════════════════════════════════════════════════════
function RDDIdeaViz() {
  const [step, setStep] = useState(0);
  const [seed] = useState(42);

  // Generate data around a cutoff
  const cutoff = 50;
  const trueEffect = 8;
  const data = useMemo(() => {
    const pts = [];
    const rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 200; i++) {
      const r = rng(seed * 100 + i * 13);
      const x = r * 100; // running variable: 0-100
      const treat = x >= cutoff ? 1 : 0;
      const noise = (rng(seed * 200 + i * 7) - 0.5) * 12;
      const y = 20 + 0.3 * x + treat * trueEffect + noise;
      pts.push({ x, y, treat });
    }
    return pts;
  }, [seed]);

  const W = 460, H = 280, pad = { t: 16, r: 16, b: 36, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sx = v => pad.l + (v / 100) * cw;
  const sy = v => pad.t + ch - ((v - 10) / 60) * ch;

  const left = data.filter(d => d.x < cutoff);
  const right = data.filter(d => d.x >= cutoff);
  const regL = linReg(left.map(d => ({ x: d.x, y: d.y })));
  const regR = linReg(right.map(d => ({ x: d.x, y: d.y })));

  // Values at cutoff
  const yLeft = regL.b0 + regL.b1 * cutoff;
  const yRight = regR.b0 + regR.b1 * cutoff;
  const jump = yRight - yLeft;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Sometimes policy creates a <strong>sharp cutoff</strong>: firms above a revenue threshold get audited, students above a GPA line get a scholarship, patents with more citations get fast-tracked. Units just above and just below the cutoff are nearly identical — <em>except one got the treatment</em>. This is a natural experiment.
      </div>

      <Anl>
        Imagine a scholarship awarded to students scoring ≥ 50 on an exam. A student scoring 50.1 is nearly identical to one scoring 49.9 — same ability, preparation, background. The only difference is the scholarship. By comparing outcomes <em>right at the boundary</em>, we get a credible causal estimate — almost as good as a randomized experiment.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. The raw data", "2. The cutoff", "3. The jump = causal effect"].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.rose : C.bdr,
            background: step === i ? C.roseBg : "transparent",
            color: step === i ? C.rose : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grid */}
          {[20, 30, 40, 50, 60].map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Cutoff line — steps 1+ */}
          {step >= 1 && (
            <g>
              <line x1={sx(cutoff)} x2={sx(cutoff)} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="2" strokeDasharray="6,4" />
              <text x={sx(cutoff)} y={pad.t - 6} textAnchor="middle" fontSize="10" fill={C.rose} fontFamily={font} fontWeight="700">Cutoff = {cutoff}</text>
            </g>
          )}

          {/* Dots */}
          {data.map((d, i) => (
            <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="2.5"
              fill={step === 0 ? C.txD : d.treat ? C.rose : C.sam}
              opacity={step === 0 ? 0.25 : 0.3} />
          ))}

          {/* Regression lines — step 2 */}
          {step >= 2 && (
            <g>
              <line x1={sx(0)} x2={sx(cutoff)} y1={sy(regL.b0)} y2={sy(regL.b0 + regL.b1 * cutoff)} stroke={C.sam} strokeWidth="2.5" />
              <line x1={sx(cutoff)} x2={sx(100)} y1={sy(regR.b0 + regR.b1 * cutoff)} y2={sy(regR.b0 + regR.b1 * 100)} stroke={C.rose} strokeWidth="2.5" />

              {/* Jump bracket */}
              <line x1={sx(cutoff) + 8} x2={sx(cutoff) + 8} y1={sy(yLeft)} y2={sy(yRight)} stroke={C.grn} strokeWidth="3" />
              <line x1={sx(cutoff) + 3} x2={sx(cutoff) + 8} y1={sy(yLeft)} y2={sy(yLeft)} stroke={C.grn} strokeWidth="2" />
              <line x1={sx(cutoff) + 3} x2={sx(cutoff) + 8} y1={sy(yRight)} y2={sy(yRight)} stroke={C.grn} strokeWidth="2" />
              <rect x={sx(cutoff) + 14} y={sy((yLeft + yRight) / 2) - 12} width="56" height="24" rx="6" fill={C.grnBg} stroke={C.grn} strokeWidth="1.5" />
              <text x={sx(cutoff) + 42} y={sy((yLeft + yRight) / 2) + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.grn} fontFamily={mono}>+{jump.toFixed(1)}</text>
            </g>
          )}

          {/* Axes */}
          <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Running variable (e.g., exam score)</text>
          <text x="10" y={(pad.t + H - pad.b) / 2} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${(pad.t + H - pad.b) / 2})`}>Outcome (Y)</text>
        </svg>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>Raw data:</strong> We observe each unit's running variable (exam score, revenue, citation count) and outcome. Without knowing the cutoff, this looks like a noisy positive relationship — nothing causal is obvious.</>}
        {step === 1 && <><strong>The cutoff:</strong> Treatment is assigned by a rule: units above {cutoff} get treated (rose), units below don't (blue). This is deterministic — there's no randomization. But units <em>near</em> the cutoff are quasi-randomly sorted on either side, because small differences in the running variable (49.9 vs 50.1) are effectively random.</>}
        {step === 2 && <><strong>The jump is the causal effect.</strong> We fit separate regression lines on each side of the cutoff. The <strong style={{ color: C.grn }}>discontinuity</strong> — the gap between the two lines at the cutoff — is the treatment effect estimate: <strong style={{ color: C.grn }}>+{jump.toFixed(1)}</strong> (true effect = {trueEffect}). This works because everything else (ability, motivation, etc.) changes <em>smoothly</em> across the cutoff. Only the treatment jumps.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: SHARP VS FUZZY
// ═══════════════════════════════════════════════════════════════════
function SharpFuzzyViz() {
  const [mode, setMode] = useState("sharp");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        RDD comes in two flavors depending on whether the cutoff <strong>perfectly determines</strong> treatment or just <strong>changes the probability</strong> of treatment.
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "sharp", label: "Sharp RDD" },
          { id: "fuzzy", label: "Fuzzy RDD" },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: mode === t.id ? C.smp : C.bdr,
            background: mode === t.id ? C.smpBg : "transparent",
            color: mode === t.id ? C.smp : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {mode === "sharp" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Sharp: treatment probability jumps from 0 to 1 */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Treatment probability by running variable</div>
            <svg viewBox="0 0 400 120" style={{ width: "100%", display: "block" }}>
              <line x1="50" x2="350" y1="90" y2="90" stroke={C.bdr} strokeWidth="1" />
              <line x1="50" x2="50" y1="20" y2="90" stroke={C.bdr} strokeWidth="1" />
              {/* 0% line left of cutoff */}
              <line x1="50" x2="200" y1="90" y2="90" stroke={C.sam} strokeWidth="3" />
              {/* 100% line right of cutoff */}
              <line x1="200" x2="350" y1="24" y2="24" stroke={C.rose} strokeWidth="3" />
              {/* Jump */}
              <line x1="200" x2="200" y1="90" y2="24" stroke={C.grn} strokeWidth="2.5" strokeDasharray="4,3" />
              <circle cx="200" cy="90" r="4" fill="#fff" stroke={C.sam} strokeWidth="2" />
              <circle cx="200" cy="24" r="4" fill={C.rose} stroke={C.rose} strokeWidth="2" />
              {/* Labels */}
              <text x="125" y="82" textAnchor="middle" fontSize="11" fill={C.sam} fontWeight="600" fontFamily={font}>P(treated) = 0</text>
              <text x="275" y="18" textAnchor="middle" fontSize="11" fill={C.rose} fontWeight="600" fontFamily={font}>P(treated) = 1</text>
              <text x="200" y="108" textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Cutoff</text>
              <text x="40" y="58" textAnchor="end" fontSize="9" fill={C.txM} fontFamily={font} transform="rotate(-90, 40, 58)">P(treat)</text>
            </svg>
          </div>

          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            In a <strong>sharp RDD</strong>, the cutoff perfectly determines treatment. Everyone above gets it; everyone below doesn't. There's no non-compliance. The treatment effect is estimated directly from the jump in Y at the cutoff.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            {[
              { title: "Government audit threshold", desc: "Firms with revenue above $10M are automatically audited. Firms below are not. Treatment = audited (yes/no) is perfectly determined by revenue." },
              { title: "Patent fast-track", desc: "Patent applications with ≥ 20 prior-art citations are automatically reviewed by senior examiners. Below 20 go to junior examiners. Deterministic assignment." },
              { title: "Electoral RDD", desc: "Candidates who win by any margin get the seat. Vote share > 50% = win. This is the cleanest possible sharp RDD — the running variable perfectly determines treatment." },
            ].map((e, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam }}>{e.title}</div>
                <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "fuzzy" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Fuzzy: treatment probability jumps but not from 0 to 1 */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Treatment probability by running variable</div>
            <svg viewBox="0 0 400 120" style={{ width: "100%", display: "block" }}>
              <line x1="50" x2="350" y1="90" y2="90" stroke={C.bdr} strokeWidth="1" />
              <line x1="50" x2="50" y1="20" y2="90" stroke={C.bdr} strokeWidth="1" />
              {/* Low probability left of cutoff */}
              <line x1="50" x2="200" y1="76" y2="70" stroke={C.sam} strokeWidth="3" />
              {/* Higher probability right of cutoff */}
              <line x1="200" x2="350" y1="38" y2="32" stroke={C.rose} strokeWidth="3" />
              {/* Jump (partial) */}
              <line x1="200" x2="200" y1="70" y2="38" stroke={C.grn} strokeWidth="2.5" strokeDasharray="4,3" />
              <circle cx="200" cy="70" r="4" fill="#fff" stroke={C.sam} strokeWidth="2" />
              <circle cx="200" cy="38" r="4" fill={C.rose} stroke={C.rose} strokeWidth="2" />
              {/* Labels */}
              <text x="125" y="64" textAnchor="middle" fontSize="10" fill={C.sam} fontWeight="600" fontFamily={font}>P ≈ 20%</text>
              <text x="275" y="28" textAnchor="middle" fontSize="10" fill={C.rose} fontWeight="600" fontFamily={font}>P ≈ 70%</text>
              <text x="200" y="108" textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Cutoff</text>
              <text x="212" y="57" fontSize="10" fill={C.grn} fontWeight="600" fontFamily={font}>Jump ≈ 50pp</text>
            </svg>
          </div>

          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            In a <strong>fuzzy RDD</strong>, the cutoff changes the <em>probability</em> of treatment but doesn't perfectly determine it. Some units above the cutoff don't comply; some below do. The jump in treatment probability is less than 100%.
          </div>

          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Fuzzy RDD = IV at the cutoff</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              Fuzzy RDD is econometrically identical to an <strong>instrumental variable</strong> regression, where the instrument Z is "above the cutoff" (0/1). Stage 1: regress treatment on Z. Stage 2: regress outcome on predicted treatment. The estimate is a <strong>LATE for compliers at the cutoff</strong>.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { title: "Scholarship eligibility → College enrollment", desc: "Students scoring ≥ 80 become eligible for a scholarship, but not all take it (some decline, go to different schools). Scoring above 80 increases — but doesn't guarantee — enrollment." },
              { title: "Age-based policy thresholds", desc: "Workers turning 65 become eligible for Medicare. Many already have insurance; some don't enroll immediately. The threshold increases coverage probability but not to 100%." },
              { title: "Funding thresholds", desc: "Grant applications scoring above a threshold are 'recommended for funding' — but final decisions depend on budget. Being above the line substantially increases but doesn't guarantee funding." },
            ].map((e, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose }}>{e.title}</div>
                <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Ins>
        <strong>Sharp vs Fuzzy in one sentence:</strong> Sharp RDD — treatment jumps from 0% to 100% at the cutoff. Fuzzy RDD — treatment probability jumps by less than 100%. Sharp is simpler (just compare outcomes); fuzzy requires an IV-style first stage. In management research, fuzzy is more common because real compliance is rarely perfect.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: ESTIMATION & BANDWIDTH
// ═══════════════════════════════════════════════════════════════════
function EstimationViz() {
  const [bandwidth, setBandwidth] = useState(20);
  const [seed] = useState(42);
  const cutoff = 50;
  const trueEffect = 8;

  const data = useMemo(() => {
    const pts = [];
    const rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 300; i++) {
      const r = rng(seed * 100 + i * 13);
      const x = r * 100;
      const treat = x >= cutoff ? 1 : 0;
      const noise = (rng(seed * 200 + i * 7) - 0.5) * 12;
      const curve = 0.002 * (x - 50) ** 2; // slight curvature
      const y = 20 + 0.3 * x + treat * trueEffect + curve + noise;
      pts.push({ x, y, treat });
    }
    return pts;
  }, [seed]);

  // Filter by bandwidth
  const inBand = data.filter(d => Math.abs(d.x - cutoff) <= bandwidth);
  const left = inBand.filter(d => d.x < cutoff);
  const right = inBand.filter(d => d.x >= cutoff);
  const regL = linReg(left.map(d => ({ x: d.x, y: d.y })));
  const regR = linReg(right.map(d => ({ x: d.x, y: d.y })));
  const yL = regL.b0 + regL.b1 * cutoff;
  const yR = regR.b0 + regR.b1 * cutoff;
  const estimate = yR - yL;

  const W = 460, H = 260, pad = { t: 16, r: 16, b: 36, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sx = v => pad.l + (v / 100) * cw;
  const sy = v => pad.t + ch - ((v - 10) / 60) * ch;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The key practical choice in RDD is the <strong>bandwidth</strong> — how far from the cutoff to include observations. Narrower = more credible (units are more comparable) but less data. Wider = more data but risks bias from non-linearity.
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Bandwidth: ±{bandwidth} around cutoff</div>
        <input type="range" min="5" max="50" step="5" value={bandwidth} onChange={e => setBandwidth(parseInt(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.smp }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: C.txD, maxWidth: "400px" }}>
          <span>±5 (very narrow)</span>
          <span>±50 (full sample)</span>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[20, 30, 40, 50, 60].map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Bandwidth shading */}
          <rect x={sx(cutoff - bandwidth)} y={pad.t} width={sx(cutoff + bandwidth) - sx(cutoff - bandwidth)} height={ch} fill={C.smp} opacity="0.06" rx="4" />

          {/* Cutoff */}
          <line x1={sx(cutoff)} x2={sx(cutoff)} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="2" strokeDasharray="6,4" />

          {/* Out-of-band dots (grey) */}
          {data.filter(d => Math.abs(d.x - cutoff) > bandwidth).map((d, i) => (
            <circle key={`o${i}`} cx={sx(d.x)} cy={sy(d.y)} r="2" fill={C.txM} opacity="0.12" />
          ))}

          {/* In-band dots */}
          {inBand.map((d, i) => (
            <circle key={`b${i}`} cx={sx(d.x)} cy={sy(d.y)} r="3" fill={d.treat ? C.rose : C.sam} opacity="0.4" />
          ))}

          {/* Local regression lines */}
          {left.length > 2 && right.length > 2 && (
            <g>
              <line x1={sx(cutoff - bandwidth)} x2={sx(cutoff)} y1={sy(regL.b0 + regL.b1 * (cutoff - bandwidth))} y2={sy(yL)} stroke={C.sam} strokeWidth="2.5" />
              <line x1={sx(cutoff)} x2={sx(cutoff + bandwidth)} y1={sy(yR)} y2={sy(regR.b0 + regR.b1 * (cutoff + bandwidth))} stroke={C.rose} strokeWidth="2.5" />

              {/* Jump */}
              <line x1={sx(cutoff) + 6} x2={sx(cutoff) + 6} y1={sy(yL)} y2={sy(yR)} stroke={C.grn} strokeWidth="3" />
              <rect x={sx(cutoff) + 12} y={sy((yL + yR) / 2) - 11} width="56" height="22" rx="5" fill={C.grnBg} stroke={C.grn} strokeWidth="1.5" />
              <text x={sx(cutoff) + 40} y={sy((yL + yR) / 2) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grn} fontFamily={mono}>{estimate >= 0 ? "+" : ""}{estimate.toFixed(1)}</text>
            </g>
          )}

          <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Running variable</text>
        </svg>

        {/* Stats */}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          {[
            { label: "ESTIMATE", val: `${estimate >= 0 ? "+" : ""}${estimate.toFixed(2)}`, color: C.grn },
            { label: "TRUE EFFECT", val: `+${trueEffect}.00`, color: C.txD },
            { label: "N IN BAND", val: inBand.length, color: C.smp },
            { label: "BIAS", val: `${(estimate - trueEffect) >= 0 ? "+" : ""}${(estimate - trueEffect).toFixed(2)}`, color: Math.abs(estimate - trueEffect) < 1.5 ? C.grn : C.rose },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>{s.label}</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: s.color, fontFamily: mono }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13px", lineHeight: 1.7, color: C.txB }}>
        {bandwidth <= 10 && <><strong style={{ color: C.smp }}>Very narrow bandwidth (±{bandwidth}).</strong> Units are very comparable, so bias is minimal — but with only {inBand.length} observations, the estimate is noisy (high variance). This illustrates the fundamental <strong>bias-variance tradeoff</strong> in RDD.</>}
        {bandwidth > 10 && bandwidth <= 25 && <><strong style={{ color: C.grn }}>Moderate bandwidth (±{bandwidth}).</strong> Good balance between bias and variance. This is typically close to what optimal bandwidth selectors (like Calonico, Cattaneo & Titiunik's <code style={{ fontFamily: mono, fontSize: "11px" }}>rdrobust</code>) would recommend.</>}
        {bandwidth > 25 && <><strong style={{ color: C.pop }}>Wide bandwidth (±{bandwidth}).</strong> More observations ({inBand.length}) reduce variance, but you're including units far from the cutoff who may differ in ways beyond the treatment. If the underlying relationship is curved, the linear approximation introduces bias.</>}
      </div>

      {/* Stata */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginTop: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Stata implementation</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Install rdrobust (optimal bandwidth + robust inference)<br />
          * ssc install rdrobust<br /><br />
          * Sharp RDD with optimal bandwidth:<br />
          rdrobust y running_var, c(50)<br /><br />
          * Fuzzy RDD (with treatment as endogenous):<br />
          rdrobust y running_var, c(50) fuzzy(treatment)<br /><br />
          * Plot the RD:<br />
          rdplot y running_var, c(50)
        </div>
        <div style={{ fontSize: "11px", color: C.txD, marginTop: "6px" }}>
          <code style={{ fontFamily: mono, fontSize: "10.5px" }}>rdrobust</code> (Calonico, Cattaneo & Titiunik, 2014) automatically selects the optimal bandwidth, uses local polynomial regression, and provides bias-corrected confidence intervals. It's the gold standard — reviewers expect it.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: VALIDITY & THREATS
// ═══════════════════════════════════════════════════════════════════
function ValidityViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        RDD is among the most credible quasi-experimental designs — but it can still fail. The key assumption is that <strong>nothing else jumps at the cutoff</strong>. Here are the tests and threats:
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn, marginBottom: "10px" }}>Validation tests (you must run these)</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {[
          { num: "1", title: "Density test (McCrary / Cattaneo)", desc: "Check that units aren't bunching just above the cutoff. If people can manipulate the running variable to land above the threshold, the 'quasi-random' assignment breaks down.", how: "Plot a histogram of the running variable around the cutoff. Formally: run a McCrary (2008) density test or Cattaneo, Jansson & Ma (2020) test.", stata: "rddensity running_var, c(50)" },
          { num: "2", title: "Covariate balance at the cutoff", desc: "Pre-treatment covariates should not jump at the cutoff. If firm size, age, or industry composition change discontinuously, it suggests the cutoff is picking up something other than the treatment.", how: "Run RDD on each covariate as the 'outcome.' None should show a significant discontinuity.", stata: "rdrobust covariate running_var, c(50)" },
          { num: "3", title: "Placebo cutoffs", desc: "Run the RDD at fake cutoffs where no treatment occurs. If you find 'effects' at placebo cutoffs, it suggests the relationship is curved (not flat) and your design is picking up nonlinearity, not a treatment effect.", how: "Run rdrobust at several cutoff values away from the true cutoff. Coefficients should be near zero.", stata: "rdrobust y running_var, c(40)  // placebo" },
        ].map(t => (
          <div key={t.num} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: C.grnBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: C.grn, fontFamily: mono, flexShrink: 0 }}>{t.num}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>{t.title}</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{t.desc}</div>
                <div style={{ fontSize: "12px", color: C.txD, marginTop: "4px" }}><strong>How:</strong> {t.how}</div>
                <div style={{ fontSize: "11px", color: C.txD, fontFamily: mono, marginTop: "3px" }}>{t.stata}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Threats to validity</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {[
          { num: "1", title: "Manipulation / sorting", desc: "If units can precisely control their running variable to land just above the cutoff, the 'as-if random' assignment is violated. Example: firms adjusting reported revenue to avoid audit thresholds. The density test catches this.", fix: "Use running variables that are hard to manipulate (election margins, exam scores with noise). Show smooth density." },
          { num: "2", title: "Compound treatment", desc: "Multiple things change at the cutoff simultaneously. Example: at the audit threshold, firms also get additional regulatory scrutiny AND a different tax rate. You can't separate the effects.", fix: "Argue or verify that only one treatment changes at the cutoff. Check for other policy discontinuities at the same point." },
          { num: "3", title: "Local extrapolation", desc: "RDD estimates the effect only at the cutoff. A scholarship effect for students scoring 50 may not apply to students scoring 80. External validity is inherently limited.", fix: "Be transparent about the local nature of the estimate. Discuss whether the effect likely generalizes." },
          { num: "4", title: "Bandwidth sensitivity", desc: "Results change dramatically with different bandwidth choices. This suggests the effect is not robust or the functional form is misspecified.", fix: "Show results across many bandwidths. Use rdrobust's optimal bandwidth and bias-corrected CIs. Report sensitivity plots." },
        ].map(t => (
          <div key={t.num} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>{t.num}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>{t.title}</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{t.desc}</div>
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
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "idea", label: "1. The RDD Idea" },
  { id: "types", label: "2. Sharp vs Fuzzy" },
  { id: "estimation", label: "3. Estimation" },
  { id: "validity", label: "4. Validity" },
];

export default function RDDModule() {
  const [tab, setTab] = useState("idea");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.roseBg, fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>CAUSAL INFERENCE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Regression Discontinuity Design</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Exploiting arbitrary cutoffs as natural experiments</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", borderRadius: "10px", border: "1.5px solid",
            borderColor: tab === t.id ? C.rose : C.bdr,
            background: tab === t.id ? C.roseBg : "transparent",
            color: tab === t.id ? C.rose : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div>
        {tab === "idea" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="The discontinuity as a natural experiment" sub="When a cutoff rule creates quasi-random treatment assignment" />
          <CBox title={<>📐 The RDD Idea</>} color={C.smp}>
            <RDDIdeaViz />
          </CBox>
          <NBtn onClick={() => setTab("types")} label="Next: Sharp vs Fuzzy →" />
        </div>}

        {tab === "types" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Sharp vs Fuzzy RDD" sub="Perfect compliance vs probabilistic treatment" />
          <CBox title={<>🔀 Two Flavors of RDD</>} color={C.smp}>
            <SharpFuzzyViz />
          </CBox>
          <NBtn onClick={() => setTab("estimation")} label="Next: Estimation →" />
        </div>}

        {tab === "estimation" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Estimation & bandwidth" sub="The bias-variance tradeoff and local polynomial regression" />
          <Pr>RDD estimation is all about the <strong>bandwidth</strong> — how much data near the cutoff to use. Drag the slider to see how this affects the estimate:</Pr>
          <CBox title={<>📊 Interactive Bandwidth Explorer</>} color={C.smp}>
            <EstimationViz />
          </CBox>
          <NBtn onClick={() => setTab("validity")} label="Next: Validity →" />
        </div>}

        {tab === "validity" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Validity tests & threats" sub="The tests every RDD paper must run, and what can go wrong" />

          <CBox title={<>✅ Validation & Threats</>} color={C.rose}>
            <ValidityViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> RDD exploits a <strong>cutoff rule</strong>: units just above and below the threshold are quasi-randomly assigned to treatment. The jump in outcomes at the cutoff is the causal effect.<br />
              <strong>2.</strong> <strong>Sharp RDD</strong>: treatment is perfectly determined by the cutoff. <strong>Fuzzy RDD</strong>: the cutoff changes the probability of treatment (estimated via IV).<br />
              <strong>3.</strong> The key choice is <strong>bandwidth</strong>. Narrower = more credible, wider = more data. Use <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>rdrobust</code> for optimal bandwidth and bias-corrected inference.<br />
              <strong>4.</strong> <strong>Always run</strong>: density test (no manipulation), covariate balance at cutoff, and placebo cutoffs.<br />
              <strong>5.</strong> The estimate is <strong>local</strong> — valid only at the cutoff. External validity is inherently limited. Be transparent about this.<br />
              <strong>6.</strong> In Stata: <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>rdrobust y running_var, c(50)</code> for sharp, add <code style={{ fontFamily: mono, fontSize: "12px" }}>fuzzy(treatment)</code> for fuzzy.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
