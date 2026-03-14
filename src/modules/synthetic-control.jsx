import { useState, useMemo } from "react";

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
// TAB 1: THE IDEA
// ═══════════════════════════════════════════════════════════════════
function SCIdeaViz() {
  const [step, setStep] = useState(0);

  // Simulated time series
  const years = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
  const treatYear = 2012;
  const treated =  [40, 42, 43, 41, 44, 46, 48, 55, 60, 63, 66, 68, 70, 72];
  const donor1 =   [35, 37, 38, 36, 38, 40, 42, 43, 45, 47, 48, 49, 50, 52];
  const donor2 =   [50, 51, 52, 49, 53, 55, 57, 58, 60, 62, 63, 64, 65, 67];
  const donor3 =   [30, 32, 34, 33, 35, 37, 39, 40, 41, 42, 43, 44, 45, 46];
  // Synthetic = 0.4 * donor1 + 0.5 * donor2 + 0.1 * donor3 (chosen to match pre-treatment)
  const weights = [0.4, 0.5, 0.1];
  const synthetic = years.map((_, i) => weights[0] * donor1[i] + weights[1] * donor2[i] + weights[2] * donor3[i]);

  const W = 460, H = 260, pad = { t: 16, r: 16, b: 36, l: 42 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sx = i => pad.l + (i / (years.length - 1)) * cw;
  const yMin = 25, yMax = 78;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const treatIdx = years.indexOf(treatYear);
  const treatX = (sx(treatIdx - 1) + sx(treatIdx)) / 2;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        What if only <strong>one unit</strong> is treated — a single country, state, or firm? DiD needs a comparable control group, but when the treated unit is unique, no single untreated unit is a good match. The <strong>synthetic control method</strong> (Abadie, Diamond & Hainmueller, 2010) solves this by constructing a <em>weighted combination</em> of untreated units that together approximate the treated unit's pre-treatment trajectory.
      </div>

      <Anl>
        You want to know the effect of a new economic policy in California. No single state is a good comparison — California is uniquely large, diverse, and tech-heavy. But a <em>blend</em> of 40% Texas + 50% New York + 10% Washington might closely track California's pre-policy outcomes. That blend is the "synthetic California" — and the gap between real California and synthetic California after the policy is the treatment effect.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. The treated unit", "2. Donor pool", "3. Synthetic control"].map((s, i) => (
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
          {[30, 40, 50, 60, 70].map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Treatment line */}
          <line x1={treatX} x2={treatX} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.5" />
          <text x={treatX} y={pad.t - 6} textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Policy enacted</text>

          {/* Donor lines — step 1+ */}
          {step >= 1 && [
            { data: donor1, color: C.txM, label: "Donor 1" },
            { data: donor2, color: C.txM, label: "Donor 2" },
            { data: donor3, color: C.txM, label: "Donor 3" },
          ].map((d, di) => (
            <g key={di}>
              {d.data.slice(0, -1).map((v, i) => (
                <line key={i} x1={sx(i)} x2={sx(i + 1)} y1={sy(v)} y2={sy(d.data[i + 1])} stroke={d.color} strokeWidth="1.2" opacity="0.35" />
              ))}
            </g>
          ))}

          {/* Synthetic control line — step 2 */}
          {step >= 2 && (
            <g>
              {synthetic.slice(0, -1).map((v, i) => (
                <line key={i} x1={sx(i)} x2={sx(i + 1)} y1={sy(v)} y2={sy(synthetic[i + 1])} stroke={C.grn} strokeWidth="2.5" strokeDasharray={i >= treatIdx ? "none" : "6,3"} />
              ))}
              <text x={sx(years.length - 1) + 4} y={sy(synthetic[synthetic.length - 1]) + 4} fontSize="10" fill={C.grn} fontFamily={font} fontWeight="600">Synthetic</text>
            </g>
          )}

          {/* Treated line — always visible */}
          {treated.slice(0, -1).map((v, i) => (
            <line key={i} x1={sx(i)} x2={sx(i + 1)} y1={sy(v)} y2={sy(treated[i + 1])} stroke={C.rose} strokeWidth="2.5" />
          ))}
          <text x={sx(years.length - 1) + 4} y={sy(treated[treated.length - 1]) + 4} fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600">Treated</text>

          {/* Gap annotation — step 2, post-treatment */}
          {step >= 2 && (
            <g>
              {/* Arrow at 2016 */}
              {(() => {
                const idx = years.indexOf(2016);
                const yT = sy(treated[idx]), yS = sy(synthetic[idx]);
                return (
                  <g>
                    <line x1={sx(idx) + 8} x2={sx(idx) + 8} y1={yS} y2={yT} stroke={C.smp} strokeWidth="2.5" />
                    <line x1={sx(idx) + 3} x2={sx(idx) + 8} y1={yS} y2={yS} stroke={C.smp} strokeWidth="2" />
                    <line x1={sx(idx) + 3} x2={sx(idx) + 8} y1={yT} y2={yT} stroke={C.smp} strokeWidth="2" />
                    <rect x={sx(idx) + 14} y={(yS + yT) / 2 - 11} width="50" height="22" rx="5" fill={C.smpBg} stroke={C.smp} strokeWidth="1.5" />
                    <text x={sx(idx) + 39} y={(yS + yT) / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.smp} fontFamily={mono}>+{(treated[idx] - synthetic[idx]).toFixed(0)}</text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Year labels */}
          {years.filter((_, i) => i % 2 === 0).map((y, i) => (
            <text key={y} x={sx(years.indexOf(y))} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{y}</text>
          ))}
        </svg>

        {/* Weights display — step 2 */}
        {step >= 2 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {[
              { name: "Donor 1", w: 0.4 },
              { name: "Donor 2", w: 0.5 },
              { name: "Donor 3", w: 0.1 },
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>{d.name}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.grn, fontFamily: mono }}>{(d.w * 100).toFixed(0)}%</div>
                <div style={{ height: "4px", background: C.bdr, borderRadius: "2px", marginTop: "4px" }}>
                  <div style={{ height: "100%", width: `${d.w * 100}%`, background: C.grn, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong style={{ color: C.rose }}>The treated unit:</strong> We observe one unit (a state, firm, or country) that receives a treatment in 2012. We see its full outcome trajectory — before and after the intervention. The question: how much of the post-2012 increase is caused by the treatment, and how much would have happened anyway?</>}
        {step === 1 && <><strong style={{ color: C.txD }}>The donor pool:</strong> We have several untreated units (grey lines) that were never exposed to the treatment. Individually, none matches the treated unit's pre-treatment trajectory — they're at different levels and trend slightly differently. This is why a simple DiD comparison with any single donor would be unreliable.</>}
        {step === 2 && <><strong style={{ color: C.grn }}>The synthetic control:</strong> An algorithm finds <strong>weights</strong> (40% Donor 1, 50% Donor 2, 10% Donor 3) such that the weighted combination (green dashed line) closely tracks the treated unit <em>before</em> the intervention. After 2012, the synthetic control continues along its trajectory — this is the <strong>counterfactual</strong>. The gap between the treated line and the synthetic line is the estimated treatment effect.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════
function HowItWorksViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The synthetic control method has three ingredients: a treated unit, a <strong>donor pool</strong> of untreated units, and an optimization algorithm that finds weights to minimize the pre-treatment gap.
      </div>

      {/* Step-by-step */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {[
          { num: "1", title: "Define the donor pool", desc: "Choose a set of untreated units that could plausibly have experienced similar trends. Exclude units affected by the treatment (even indirectly — spillovers). Also exclude units with idiosyncratic shocks during the study period.", color: C.sam, detail: "For studying a California policy, donors might be other large US states. Exclude states that adopted similar policies. Including poor donors just adds noise — the algorithm will give them zero weight." },
          { num: "2", title: "Choose matching variables", desc: "Select pre-treatment outcome values and covariates to match on. Typically: the outcome variable in several pre-treatment years, plus relevant predictors (GDP, population, industry composition, etc.).", color: C.smp, detail: "The algorithm matches on BOTH pre-treatment outcome levels AND covariates. Matching well on pre-treatment outcomes is especially important — if the synthetic control tracks the treated unit closely pre-treatment, it's more credible post-treatment." },
          { num: "3", title: "Optimize weights", desc: "Find non-negative weights W (summing to 1) that minimize the distance between the treated unit's pre-treatment characteristics and the weighted combination of donors.", color: C.grn, detail: "The optimization ensures: (a) weights are non-negative (no extrapolation), (b) weights sum to 1 (the synthetic unit is a convex combination), (c) the synthetic control is as close to the treated unit as possible in the pre-treatment period." },
          { num: "4", title: "Estimate the effect", desc: "The treatment effect at each post-treatment period t is: τ̂ₜ = Y₁ₜ − Ŷ₁ₜ^synth — the gap between the treated unit's actual outcome and the synthetic control's projected outcome.", color: C.rose, detail: "The key assumption: in the absence of treatment, the synthetic control would have continued to track the treated unit post-treatment. This is plausible if the pre-treatment fit is very good — a poor pre-treatment fit undermines the entire method." },
        ].map((s, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: s.color, fontFamily: mono, flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: s.color, marginBottom: "4px" }}>{s.title}</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{s.desc}</div>
                <div style={{ fontSize: "11.5px", color: C.txD, lineHeight: 1.6, marginTop: "6px", background: C.bg, borderRadius: "6px", padding: "8px 12px" }}>{s.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The equation */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE SYNTHETIC CONTROL ESTIMATOR</div>
        <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
          <span style={{ color: C.rose }}>τ̂<sub>t</sub></span> = Y<sub>1t</sub> − <span style={{ color: C.grn }}>Σ<sub>j=2</sub><sup>J</sup> w<sub>j</sub>Y<sub>jt</sub></span>
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", lineHeight: 1.6 }}>
          Y<sub>1t</sub> = treated unit's outcome at time t  |  w<sub>j</sub> = weight on donor j (≥ 0, Σw = 1)  |  <span style={{ color: C.grn }}>green term</span> = synthetic control
        </div>
      </div>

      {/* SC vs DiD */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Synthetic control vs DiD</div>
        <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, fontSize: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", background: C.bg, fontWeight: 700, fontFamily: mono, color: C.txM }}>
            <div style={{ padding: "8px 10px" }}>Feature</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}` }}>DiD</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}` }}>Synth Control</div>
          </div>
          {[
            { f: "# treated units", did: "Many", sc: "One (or few)" },
            { f: "Control group", did: "Observed untreated group", sc: "Constructed weighted blend" },
            { f: "Key assumption", did: "Parallel trends", sc: "Good pre-treatment fit" },
            { f: "# time periods", did: "≥ 2 (often many)", sc: "Many pre-treatment periods needed" },
            { f: "Inference", did: "Standard (clustering)", sc: "Permutation / placebo tests" },
            { f: "Transparency", did: "Moderate", sc: "High (weights are visible)" },
          ].map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "7px 10px", fontWeight: 600, color: C.tx, background: C.bg, fontSize: "11px" }}>{r.f}</div>
              <div style={{ padding: "7px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{r.did}</div>
              <div style={{ padding: "7px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{r.sc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: INFERENCE & PLACEBO TESTS
// ═══════════════════════════════════════════════════════════════════
function InferenceViz() {
  // Simulated placebo gaps
  const placebos = [
    { name: "Treated", gaps: [0.2, -0.5, 0.3, 0.1, -0.2, 0.4, 7.2, 10.5, 12.1, 13.8], isTreated: true },
    { name: "Donor 1", gaps: [0.5, -0.3, 0.8, -0.4, 0.2, -0.1, 1.2, 0.8, -0.5, 0.3], isTreated: false },
    { name: "Donor 2", gaps: [-0.3, 0.6, -0.2, 0.5, -0.7, 0.3, -1.5, 0.2, 1.1, -0.8], isTreated: false },
    { name: "Donor 3", gaps: [0.1, -0.8, 0.4, 0.2, -0.3, 0.6, 2.1, 1.5, 0.8, 1.2], isTreated: false },
    { name: "Donor 4", gaps: [-0.6, 0.4, -0.5, 0.3, 0.1, -0.2, -0.8, 1.3, -0.4, 0.6], isTreated: false },
    { name: "Donor 5", gaps: [0.3, 0.1, -0.4, -0.6, 0.5, 0.2, 0.5, -1.2, 1.8, -0.3], isTreated: false },
  ];
  const periods = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
  const treatIdx = 5;

  const W = 460, H = 240, pad = { t: 16, r: 16, b: 36, l: 42 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sx = i => pad.l + (i / (periods.length - 1)) * cw;
  const allGaps = placebos.flatMap(p => p.gaps);
  const gMin = Math.min(...allGaps) - 1, gMax = Math.max(...allGaps) + 1;
  const sy = v => pad.t + ch - ((v - gMin) / (gMax - gMin)) * ch;
  const treatX = (sx(treatIdx - 1) + sx(treatIdx)) / 2;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Standard statistical inference (t-tests, p-values) doesn't work for synthetic control — you have <strong>one treated unit</strong>. Instead, inference relies on <strong>placebo tests</strong>: apply the same method to every donor as if <em>it</em> were treated, and see if the real treated unit's gap is unusually large.
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>Placebo test: gap plot</div>
        <div style={{ fontSize: "11px", color: C.txD, marginBottom: "8px" }}>Each line shows the gap (actual − synthetic) for one unit. If the treated unit's gap stands out, the effect is credible.</div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grid */}
          {[-5, 0, 5, 10, 15].filter(v => v >= gMin && v <= gMax).map(v => (
            <g key={v}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(v)} y2={sy(v)} stroke={v === 0 ? C.txM : C.grid} strokeWidth={v === 0 ? "1.5" : "1"} opacity={v === 0 ? 0.5 : 1} />
              <text x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            </g>
          ))}

          {/* Treatment time */}
          <line x1={treatX} x2={treatX} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.4" />

          {/* Pre/post shading */}
          <rect x={pad.l} y={pad.t} width={treatX - pad.l} height={ch} fill={C.sam} opacity="0.03" />
          <rect x={treatX} y={pad.t} width={W - pad.r - treatX} height={ch} fill={C.rose} opacity="0.03" />

          {/* Placebo lines (grey) */}
          {placebos.filter(p => !p.isTreated).map((p, pi) => (
            <g key={pi}>
              {p.gaps.slice(0, -1).map((v, i) => (
                <line key={i} x1={sx(i)} x2={sx(i + 1)} y1={sy(v)} y2={sy(p.gaps[i + 1])} stroke={C.txM} strokeWidth="1.2" opacity="0.3" />
              ))}
            </g>
          ))}

          {/* Treated line (bold rose) */}
          {placebos.filter(p => p.isTreated).map((p, pi) => (
            <g key={pi}>
              {p.gaps.slice(0, -1).map((v, i) => (
                <line key={i} x1={sx(i)} x2={sx(i + 1)} y1={sy(v)} y2={sy(p.gaps[i + 1])} stroke={C.rose} strokeWidth="2.5" />
              ))}
            </g>
          ))}

          {/* Period labels */}
          {periods.map((t, i) => (
            <text key={t} x={sx(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{t}</text>
          ))}
          <text x={(pad.l + W - pad.r) / 2} y={H} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Periods relative to treatment</text>
        </svg>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.rose }}>Reading this plot:</strong> The grey lines are placebo gaps — they show how large the gap would be if each <em>donor</em> had been "treated." They're small and centered around zero. The rose line (the actual treated unit) is indistinguishable from placebos pre-treatment (good fit) but <strong>dramatically larger post-treatment</strong> — it's clearly an outlier. This is strong evidence of a real treatment effect. If the treated unit's line was buried among the placebos post-treatment, we'd conclude no effect.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { title: "In-space placebos (main test)", desc: "Reassign treatment to each donor unit in turn. Run the full synthetic control for each. If the treated unit's post-treatment gap is larger than all (or nearly all) placebos, the effect is 'significant.' The p-value ≈ 1 / (J + 1) if the treated unit has the largest gap among J + 1 units.", color: C.smp },
          { title: "In-time placebos", desc: "Pretend the treatment occurred earlier (a fake treatment date). If the synthetic control shows a 'gap' at the fake date, the pre-treatment fit is poor and the method may not be working.", color: C.sam },
          { title: "Leave-one-out", desc: "Re-estimate the synthetic control dropping one donor at a time. If results change dramatically when one donor is removed, the estimate depends heavily on that single donor — a robustness concern.", color: C.pop },
        ].map((t, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: t.color }}>{t.title}</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>Why not just use standard errors?</strong> With N = 1 treated unit, there's no sampling variation in the usual sense. Placebo tests are a form of <strong>permutation inference</strong> — they ask "how unusual is this result compared to what we'd see by chance?" This is analogous to Fisher's exact test. A p-value of 1/20 means the treated unit's effect is larger than all 19 placebo effects.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: IMPLEMENTATION & EXTENSIONS
// ═══════════════════════════════════════════════════════════════════
function ImplementationViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The synthetic control method has become standard in policy evaluation and is increasingly used in management and strategy research. Here's how to implement it and what to watch out for.
      </div>

      {/* Stata / R code */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Implementation</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Stata: synth package<br />
          * ssc install synth<br />
          * ssc install synth_runner  // for placebo tests<br /><br />
          synth outcome predictor1 predictor2 ///<br />
          {"    "}outcome(2005) outcome(2008) outcome(2011), ///<br />
          {"    "}trunit(1) trperiod(2012) ///<br />
          {"    "}nested allopt fig<br /><br />
          * Run placebo tests across all donors:<br />
          synth_runner outcome predictor1 predictor2 ///<br />
          {"    "}outcome(2005) outcome(2008) outcome(2011), ///<br />
          {"    "}trunit(1) trperiod(2012) ///<br />
          {"    "}gen_vars
        </div>
        <div style={{ fontSize: "11px", color: C.txD, marginTop: "6px", lineHeight: 1.6 }}>
          <strong>In R:</strong> The <code style={{ fontFamily: mono, fontSize: "10.5px" }}>Synth</code> package (original) or <code style={{ fontFamily: mono, fontSize: "10.5px" }}>tidysynth</code> (tidyverse-friendly) or <code style={{ fontFamily: mono, fontSize: "10.5px" }}>augsynth</code> (supports augmented SC). The <code style={{ fontFamily: mono, fontSize: "10.5px" }}>scpi</code> package (Cattaneo et al.) provides prediction intervals.
        </div>
      </div>

      {/* Reporting checklist */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>What to report in a synthetic control paper</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { item: "Donor pool justification", desc: "Explain why each donor is included/excluded. Donors affected by similar treatments should be excluded.", must: true },
          { item: "Weights table", desc: "Show the weight assigned to each donor unit. Transparent — readers can see exactly how the synthetic control is constructed.", must: true },
          { item: "Pre-treatment fit", desc: "Plot treated vs synthetic in pre-treatment period. Report RMSPE (root mean squared prediction error). Poor fit undermines credibility.", must: true },
          { item: "Covariate balance table", desc: "Compare pre-treatment predictor values for treated, synthetic, and the simple average of donors. Synthetic should be much closer to treated.", must: true },
          { item: "Gap plot + placebo tests", desc: "Show the treated unit's gap relative to all donor placebos. Report the ratio of post/pre RMSPE.", must: true },
          { item: "Leave-one-out robustness", desc: "Show that dropping individual donors doesn't dramatically change results.", must: false },
        ].map((c, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px", display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ fontSize: "14px", marginTop: "1px" }}>{c.must ? "✅" : "📋"}</div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: c.must ? C.grn : C.txD }}>{c.item}</div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Extensions */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>Extensions beyond the original method</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {[
          { name: "Augmented Synthetic Control (Ben-Michael et al., 2021)", desc: "Combines synthetic control with an outcome model to improve fit when the standard method can't perfectly match pre-treatment outcomes. Allows for bias correction when the donor pool is limited." },
          { name: "Synthetic DiD (Arkhangelsky et al., 2021)", desc: "Combines the synthetic control idea (reweighting units) with the DiD idea (reweighting time periods). Works for multiple treated units and provides standard errors without permutation tests." },
          { name: "Generalized Synthetic Control (Xu, 2017)", desc: "Uses an interactive fixed effects model (factor model) to construct counterfactuals. Handles multiple treated units with staggered adoption. R package: gsynth." },
          { name: "Prediction intervals (Cattaneo et al., 2021)", desc: "Provides formal prediction intervals for synthetic control estimates, moving beyond permutation-based inference. R/Stata package: scpi." },
        ].map((e, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp }}>{e.name}</div>
            <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{e.desc}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>When to use synthetic control vs DiD:</strong> Use SC when you have <strong>one (or very few) treated units</strong> and many pre-treatment periods — e.g., a state policy, a firm-specific shock, a country-level intervention. Use DiD when you have <strong>many treated units</strong> and need standard inference. Synthetic DiD bridges the two. In management, SC is ideal for studying firm-specific events (a major acquisition, a CEO scandal, a product recall) where no single comparison firm is adequate.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "idea", label: "1. The Idea" },
  { id: "how", label: "2. How It Works" },
  { id: "inference", label: "3. Inference" },
  { id: "implementation", label: "4. Implementation" },
];

export default function SyntheticControlModule() {
  const [tab, setTab] = useState("idea");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.smpBg, fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>ADVANCED</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Synthetic Control Method</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Building a counterfactual from a weighted blend of donors</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", borderRadius: "10px", border: "1.5px solid",
            borderColor: tab === t.id ? C.smp : C.bdr,
            background: tab === t.id ? C.smpBg : "transparent",
            color: tab === t.id ? C.smp : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div>
        {tab === "idea" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="When one unit is treated" sub="Building a counterfactual when no single comparison exists" />
          <CBox title={<>🧬 The Synthetic Control Idea</>} color={C.grn}>
            <SCIdeaViz />
          </CBox>
          <NBtn onClick={() => setTab("how")} label="Next: How It Works →" />
        </div>}

        {tab === "how" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="The mechanics" sub="Donor pools, weights, and the optimization" />
          <CBox title={<>⚙️ Step by Step</>} color={C.smp}>
            <HowItWorksViz />
          </CBox>
          <NBtn onClick={() => setTab("inference")} label="Next: Inference →" />
        </div>}

        {tab === "inference" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Inference with N = 1" sub="Placebo tests and permutation-based significance" />
          <CBox title={<>📊 Placebo Tests</>} color={C.rose}>
            <InferenceViz />
          </CBox>
          <NBtn onClick={() => setTab("implementation")} label="Next: Implementation →" />
        </div>}

        {tab === "implementation" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Implementation & extensions" sub="Stata commands, reporting standards, and modern variants" />

          <CBox title={<>💻 Practical Guide</>} color={C.grn}>
            <ImplementationViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Synthetic control constructs a <strong>weighted blend of untreated units</strong> that matches the treated unit's pre-treatment trajectory. The post-treatment gap is the treatment effect.<br />
              <strong>2.</strong> Ideal for <strong>single-unit case studies</strong> — a country, state, or firm that experienced a unique intervention where no single comparison unit exists.<br />
              <strong>3.</strong> <strong>Pre-treatment fit is everything.</strong> If the synthetic control doesn't closely track the treated unit pre-treatment, the post-treatment comparison is not credible.<br />
              <strong>4.</strong> Inference via <strong>placebo tests</strong>: apply the method to each donor and check if the treated unit's gap is unusually large. This is permutation-based — not t-tests or p-values.<br />
              <strong>5.</strong> Always report: <strong>weights table</strong>, pre-treatment fit plot, covariate balance, gap plot with placebos, and leave-one-out robustness.<br />
              <strong>6.</strong> Extensions: <strong>Augmented SC</strong> (bias correction), <strong>Synthetic DiD</strong> (multiple treated units + standard inference), and <strong>Generalized SC</strong> (staggered treatment via factor models).
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
