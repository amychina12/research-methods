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
function Ins({ children }) { return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.12)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }

// ═══════════════════════════════════════════════════════════════════
// TAB 1: WHY DURATION DATA IS SPECIAL
// ═══════════════════════════════════════════════════════════════════
function WhySpecialViz() {
  const [step, setStep] = useState(0);

  // Timeline visual — 8 firms, some exit, some censored
  const firms = [
    { id: "A", start: 0, end: 3, event: true },
    { id: "B", start: 0, end: 7, event: false },  // censored — still alive
    { id: "C", start: 1, end: 4, event: true },
    { id: "D", start: 0, end: 6, event: true },
    { id: "E", start: 2, end: 7, event: false },  // censored
    { id: "F", start: 0, end: 2, event: true },
    { id: "G", start: 1, end: 5, event: true },
    { id: "H", start: 3, end: 7, event: false },  // censored
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Many questions in management are about <strong>when</strong> something happens, not just <em>whether</em> it happens: How long until a startup fails? When do employees quit? How quickly do firms adopt a new technology? These are <strong>duration</strong> or <strong>time-to-event</strong> questions — and OLS can't handle them properly.
      </div>

      <Anl>
        You're studying how long startups survive after founding. Some fail in year 2, some in year 5, and some are <em>still alive</em> when your study ends. That last group is the problem — you know they survived at least 7 years, but you don't know when (or if) they'll eventually fail. Dropping them wastes data; coding them as "didn't fail" is wrong. Survival analysis handles this gracefully through <strong>censoring</strong>.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. Duration data", "2. The censoring problem", "3. Why not OLS?"].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.smp : C.bdr,
            background: step === i ? C.smpBg : "transparent",
            color: step === i ? C.smp : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s}</button>
        ))}
      </div>

      {/* Timeline visualization */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Startup survival: 8 firms observed over 7 years</div>

        <svg viewBox="0 0 420 190" style={{ width: "100%", display: "block" }}>
          {/* Year grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(y => (
            <g key={y}>
              <line x1={60 + y * 45} x2={60 + y * 45} y1="10" y2="170" stroke={C.grid} strokeWidth="1" />
              <text x={60 + y * 45} y="185" textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>Y{y}</text>
            </g>
          ))}

          {/* Study end line */}
          {step >= 1 && (
            <g>
              <line x1={60 + 7 * 45} x2={60 + 7 * 45} y1="5" y2="175" stroke={C.smp} strokeWidth="2" strokeDasharray="5,3" />
              <text x={60 + 7 * 45 + 6} y="14" fontSize="9" fill={C.smp} fontFamily={font} fontWeight="600">Study ends</text>
            </g>
          )}

          {/* Firm timelines */}
          {firms.map((f, i) => {
            const y = 18 + i * 20;
            const x1 = 60 + f.start * 45;
            const x2 = 60 + f.end * 45;
            const isCensored = !f.event;
            return (
              <g key={i}>
                <text x="10" y={y + 4} fontSize="10" fontWeight="600" fill={isCensored && step >= 1 ? C.smp : C.txB} fontFamily={mono}>Firm {f.id}</text>
                <line x1={x1} x2={x2} y1={y} y2={y} stroke={isCensored && step >= 1 ? C.smp : C.rose} strokeWidth="3" strokeLinecap="round" />
                {/* Event marker (X for failure) or arrow (for censored) */}
                {f.event ? (
                  <g>
                    <line x1={x2 - 4} x2={x2 + 4} y1={y - 4} y2={y + 4} stroke={C.rose} strokeWidth="2.5" />
                    <line x1={x2 - 4} x2={x2 + 4} y1={y + 4} y2={y - 4} stroke={C.rose} strokeWidth="2.5" />
                  </g>
                ) : (
                  step >= 1 && <polygon points={`${x2},${y - 5} ${x2 + 8},${y} ${x2},${y + 5}`} fill={C.smp} />
                )}
                {/* Duration label */}
                {step >= 0 && (
                  <text x={x2 + (f.event ? 10 : 14)} y={y + 4} fontSize="9" fill={C.txD} fontFamily={mono}>
                    {f.event ? `${f.end - f.start}yr` : step >= 1 ? `≥${f.end - f.start}yr` : `${f.end - f.start}yr?`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <line x1="62" x2="78" y1="178" y2="178" stroke={C.rose} strokeWidth="3" />
          <text x="82" y="181" fontSize="9" fill={C.rose} fontFamily={font}>Failed</text>
          {step >= 1 && (
            <g>
              <line x1="130" x2="146" y1="178" y2="178" stroke={C.smp} strokeWidth="3" />
              <polygon points="146,173 154,178 146,183" fill={C.smp} />
              <text x="158" y="181" fontSize="9" fill={C.smp} fontFamily={font}>Censored (still alive)</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>Duration data:</strong> Each firm has a <strong>start time</strong>, an <strong>end time</strong>, and an <strong>event indicator</strong> (did the event happen?). Firm A started at year 0, failed at year 3 — duration = 3 years. Firm F failed quickly (2 years). Firm D lasted 6 years. The key outcome is <em>time until the event</em>, not a snapshot at one point.</>}
        {step === 1 && <><strong>Censoring:</strong> Firms B, E, and H are still alive when the study ends (purple arrows). We know they survived <em>at least</em> 7, 5, and 4 years respectively — but we don't know their ultimate fate. This is <strong>right-censoring</strong>, the most common type. Censored observations carry real information (they survived a long time!) but they're not complete. Survival analysis uses this partial information correctly; dropping censored observations would bias results toward shorter durations.</>}
        {step === 2 && <><strong>Why not OLS?</strong> Three problems: (1) <strong>Censoring</strong> — OLS can't handle observations where the outcome is "at least X years." (2) <strong>Duration is always positive</strong> — OLS can predict negative durations. (3) <strong>The distribution is typically skewed</strong> — many short durations, few very long ones — violating normality assumptions. Survival models handle all three issues by modeling the <em>hazard rate</em> (instantaneous risk of the event) rather than duration directly.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: KEY CONCEPTS
// ═══════════════════════════════════════════════════════════════════
function KeyConceptsViz() {
  const [concept, setConcept] = useState("survival");

  // Survival curve data (Kaplan-Meier style)
  const kmSteps = [
    { t: 0, s: 1.0 }, { t: 2, s: 0.88 }, { t: 3, s: 0.75 },
    { t: 4, s: 0.63 }, { t: 5, s: 0.50 }, { t: 6, s: 0.38 },
  ];

  // Hazard shapes
  const hazardFlat = t => 0.15;
  const hazardInc = t => 0.05 + 0.03 * t;
  const hazardDec = t => 0.4 * Math.exp(-0.3 * t);
  const hazardBath = t => 0.3 * Math.exp(-0.5 * t) + 0.005 * t * t;

  const W = 420, H = 200, pad = { t: 20, r: 16, b: 34, l: 42 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Survival analysis has its own vocabulary. Three functions describe everything about the timing of events — and they're mathematically linked, so knowing one gives you the others.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "16px" }}>
        {[
          { id: "survival", label: "Survival Function" },
          { id: "hazard", label: "Hazard Function" },
          { id: "km", label: "Kaplan-Meier" },
        ].map(t => (
          <button key={t.id} onClick={() => setConcept(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: concept === t.id ? C.smp : C.bdr,
            background: concept === t.id ? C.smpBg : "transparent",
            color: concept === t.id ? C.smp : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {concept === "survival" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {[
                { func: "S(t)", name: "Survival function", desc: "P(T > t) — probability of surviving past time t. Starts at 1, decreases toward 0.", color: C.sam },
                { func: "f(t)", name: "Density function", desc: "The probability distribution of event times. How likely is the event at exactly time t?", color: C.grn },
                { func: "h(t)", name: "Hazard function", desc: "The instantaneous risk of the event at time t, given survival up to t. The core concept.", color: C.rose },
              ].map((f, i) => (
                <div key={i} style={{ background: f.color + "08", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${f.color}22` }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: f.color, fontFamily: mono }}>{f.func}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: f.color, marginBottom: "4px" }}>{f.name}</div>
                  <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>HOW THEY RELATE</div>
              <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, textAlign: "center", lineHeight: 2 }}>
                h(t) = f(t) / S(t)<br />
                S(t) = exp(−∫₀ᵗ h(s) ds) = exp(−H(t))
              </div>
              <div style={{ fontSize: "11.5px", color: C.txD, textAlign: "center" }}>H(t) = cumulative hazard = total accumulated risk up to time t</div>
            </div>
          </div>
        </div>
      )}

      {concept === "hazard" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
            The <strong>hazard function h(t)</strong> is the key concept in survival analysis. It answers: "given that a firm has survived until time t, what is the instantaneous risk of failure right now?" Different phenomena produce different hazard shapes:
          </div>

          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, marginBottom: "14px" }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
              {/* Grid */}
              <line x1={pad.l} x2={W - pad.r} y1={pad.t + ch} y2={pad.t + ch} stroke={C.bdr} strokeWidth="1" />
              <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + ch} stroke={C.bdr} strokeWidth="1" />

              {/* Hazard curves */}
              {[
                { fn: hazardFlat, color: C.sam, label: "Constant", x: 360 },
                { fn: hazardInc, color: C.rose, label: "Increasing", x: 360 },
                { fn: hazardDec, color: C.grn, label: "Decreasing", x: 360 },
                { fn: hazardBath, color: C.smp, label: "Bathtub", x: 360 },
              ].map((h, hi) => {
                const pts = [];
                for (let t = 0; t <= 10; t += 0.3) {
                  const x = pad.l + (t / 10) * cw;
                  const y = pad.t + ch - (h.fn(t) / 0.5) * ch;
                  pts.push(`${x},${y}`);
                }
                return (
                  <g key={hi}>
                    <polyline points={pts.join(" ")} fill="none" stroke={h.color} strokeWidth="2" opacity="0.8" />
                  </g>
                );
              })}

              <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Time</text>
              <text x="10" y={(pad.t + H - pad.b) / 2} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 10, ${(pad.t + H - pad.b) / 2})`}>h(t)</text>
            </svg>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
              {[
                { shape: "Constant", color: C.sam, example: "Random failure — risk doesn't depend on age. Light bulbs, some diseases." },
                { shape: "Increasing", color: C.rose, example: "Aging / wear-out — risk grows with time. Old firms losing competitiveness." },
                { shape: "Decreasing", color: C.grn, example: "Liability of newness — highest risk early, survivors stabilize. Startups, new products." },
                { shape: "Bathtub", color: C.smp, example: "High early risk (shakeout), stable middle, rising late risk. Many organizational life cycles." },
              ].map((s, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: "6px", padding: "8px 10px", border: `1px solid ${C.bdr}` }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: s.color }}>{s.shape}</div>
                  <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{s.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {concept === "km" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
            The <strong>Kaplan-Meier estimator</strong> is the non-parametric way to estimate the survival function — no model assumptions needed. It produces the classic "staircase" survival curve that you see in nearly every survival analysis paper.
          </div>

          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Kaplan-Meier survival curve: startup survival</div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
              {/* Grid */}
              {[0.0, 0.25, 0.50, 0.75, 1.0].map(v => (
                <g key={v}>
                  <line x1={pad.l} x2={W - pad.r} y1={pad.t + ch - v * ch} y2={pad.t + ch - v * ch} stroke={C.grid} strokeWidth="1" />
                  <text x={pad.l - 8} y={pad.t + ch - v * ch + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{(v * 100).toFixed(0)}%</text>
                </g>
              ))}

              {/* KM curve — staircase */}
              {kmSteps.map((step, i) => {
                const x = pad.l + (step.t / 7) * cw;
                const y = pad.t + ch - step.s * ch;
                const nextX = i < kmSteps.length - 1 ? pad.l + (kmSteps[i + 1].t / 7) * cw : W - pad.r;
                const nextY = i < kmSteps.length - 1 ? pad.t + ch - kmSteps[i + 1].s * ch : y;
                return (
                  <g key={i}>
                    {/* Horizontal line (survival holds) */}
                    <line x1={x} x2={nextX} y1={y} y2={y} stroke={C.smp} strokeWidth="2.5" />
                    {/* Vertical drop (event happens) */}
                    {i < kmSteps.length - 1 && (
                      <line x1={nextX} x2={nextX} y1={y} y2={nextY} stroke={C.smp} strokeWidth="2.5" />
                    )}
                    {/* Censoring tick marks */}
                    {step.t > 0 && (
                      <line x1={x} x2={x} y1={y - 4} y2={y + 4} stroke={C.smp} strokeWidth="1.5" />
                    )}
                  </g>
                );
              })}

              {/* Median survival line */}
              <line x1={pad.l} x2={pad.l + (5 / 7) * cw} y1={pad.t + ch - 0.5 * ch} y2={pad.t + ch - 0.5 * ch} stroke={C.pop} strokeWidth="1" strokeDasharray="4,3" />
              <line x1={pad.l + (5 / 7) * cw} x2={pad.l + (5 / 7) * cw} y1={pad.t + ch - 0.5 * ch} y2={pad.t + ch} stroke={C.pop} strokeWidth="1" strokeDasharray="4,3" />
              <text x={pad.l + (5 / 7) * cw} y={pad.t + ch + 14} textAnchor="middle" fontSize="9" fill={C.pop} fontFamily={font} fontWeight="600">Median survival ≈ 5 yrs</text>

              {/* Year labels */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(y => (
                <text key={y} x={pad.l + (y / 7) * cw} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{y}</text>
              ))}
              <text x={(pad.l + W - pad.r) / 2} y={H} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Years since founding</text>
            </svg>
          </div>

          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            <strong>Reading the curve:</strong> At time 0, 100% of firms are alive. At year 3, ~75% survive. At year 5, ~50% survive (the <strong>median survival time</strong>). Vertical tick marks indicate censored observations. The <strong>log-rank test</strong> compares KM curves between groups (e.g., VC-funded vs bootstrapped startups) — it's the survival analysis equivalent of a t-test.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: COX PROPORTIONAL HAZARDS
// ═══════════════════════════════════════════════════════════════════
function CoxViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The <strong>Cox proportional hazards model</strong> (Cox, 1972) is the workhorse of survival analysis — the equivalent of OLS for duration data. It's <strong>semi-parametric</strong>: it makes no assumption about the shape of the baseline hazard but assumes covariates shift the hazard proportionally.
      </div>

      {/* The equation */}
      <div style={{ background: C.bg, borderRadius: "12px", padding: "18px 22px", border: `1px solid ${C.bdr}`, marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "8px" }}>THE COX PROPORTIONAL HAZARDS MODEL</div>
        <div style={{ fontSize: "17px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "8px" }}>
          h(t|X) = <span style={{ color: C.smp }}>h₀(t)</span> · exp(<span style={{ color: C.rose }}>β₁X₁ + β₂X₂ + ...</span>)
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", fontSize: "12px", color: C.txD }}>
          <span><span style={{ color: C.smp, fontWeight: 600 }}>h₀(t)</span> = baseline hazard (unspecified)</span>
          <span><span style={{ color: C.rose, fontWeight: 600 }}>β</span> = log hazard ratios</span>
        </div>
      </div>

      {/* Hazard ratio explanation */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Interpreting hazard ratios</div>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
          Cox regression reports <strong>hazard ratios</strong> (HR = exp(β)) — the multiplicative effect on the hazard. This is the key number you interpret.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { hr: "HR = 1.0", meaning: "No effect", desc: "The covariate doesn't change the hazard. The event rate is the same regardless of this variable.", color: C.txD, example: "" },
            { hr: "HR = 1.5", meaning: "50% higher hazard", desc: "A one-unit increase in X multiplies the hazard by 1.5. The event happens 50% faster.", color: C.rose, example: "HR = 1.5 for CEO turnover with poor earnings → CEOs at underperforming firms face 50% higher risk of exit." },
            { hr: "HR = 0.7", meaning: "30% lower hazard", desc: "A one-unit increase in X multiplies the hazard by 0.7. The event happens 30% slower — protective.", color: C.grn, example: "HR = 0.7 for startup survival with VC funding → VC-funded startups have 30% lower failure risk." },
            { hr: "HR = 2.0", meaning: "Double the hazard", desc: "The event rate doubles. Very strong effect.", color: C.rose, example: "HR = 2.0 for employee quit with toxic manager → employees under toxic managers quit at twice the rate." },
          ].map((h, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: h.color, fontFamily: mono }}>{h.hr}</div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: h.color }}>{h.meaning}</div>
              </div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.5, marginTop: "2px" }}>{h.desc}</div>
              {h.example && <div style={{ fontSize: "11px", color: C.txD, fontStyle: "italic", marginTop: "4px" }}>{h.example}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* The PH assumption */}
      <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.pop}`, padding: "16px 20px", marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.pop, marginBottom: "6px" }}>The proportional hazards assumption</div>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          The Cox model assumes the hazard ratio between any two groups is <strong>constant over time</strong>. If VC-funded startups have HR = 0.7, this means 30% lower hazard at year 1, year 3, year 10 — always 0.7. If the ratio changes over time (e.g., VC helps early but not later), the PH assumption is violated.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
          <div style={{ background: C.grnBg, borderRadius: "6px", padding: "8px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn }}>How to test</div>
            <div style={{ fontSize: "11px", color: C.txB, lineHeight: 1.5 }}>Schoenfeld residual test (estat phtest in Stata). Plot scaled residuals vs time — should be flat. Log-log plot of survival should show parallel curves.</div>
          </div>
          <div style={{ background: C.roseBg, borderRadius: "6px", padding: "8px 12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose }}>If violated</div>
            <div style={{ fontSize: "11px", color: C.txB, lineHeight: 1.5 }}>Interact the offending covariate with time, split the sample by time periods, use an accelerated failure time model (AFT), or stratify by the offending variable.</div>
          </div>
        </div>
      </div>

      {/* Stata code */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>Stata implementation</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Declare survival data<br />
          stset duration, failure(event==1)<br /><br />
          * Kaplan-Meier curve<br />
          sts graph, by(group)<br />
          * Log-rank test<br />
          sts test group<br /><br />
          * Cox proportional hazards<br />
          stcox x1 x2 x3, efron<br />
          * Report hazard ratios (default) or coefficients:<br />
          stcox x1 x2 x3, efron nohr<br /><br />
          * Test PH assumption<br />
          estat phtest, detail<br />
          stphplot, by(group)  // log-log plot
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: BEYOND COX
// ═══════════════════════════════════════════════════════════════════
function BeyondCoxViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Cox PH is the default, but several extensions and alternatives are important in management research — especially when the PH assumption fails, when you have competing events, or when you want to model duration directly.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {[
          {
            title: "Parametric models (AFT)",
            desc: "Accelerated failure time models specify the baseline hazard shape explicitly (exponential, Weibull, log-normal, log-logistic). Unlike Cox, they model the duration directly: log(T) = βX + ε. Coefficients are time ratios — HR = 0.7 becomes 'this covariate shortens expected time by 30%.'",
            when: "When you have theoretical reasons to expect a specific hazard shape. When the PH assumption fails. When you want to predict duration directly (e.g., 'how long until failure?').",
            stata: "streg x1 x2 x3, distribution(weibull)",
            color: C.sam,
          },
          {
            title: "Competing risks (Fine & Gray)",
            desc: "What if there are multiple ways the event can occur? A startup might fail by bankruptcy OR by being acquired — these are different outcomes. Standard survival analysis treats all non-event observations the same, but with competing risks, experiencing one event precludes the other.",
            when: "When your 'event' has distinct types: CEO exits (fired vs resigned vs retired), firm exit (bankruptcy vs acquisition vs merger), employee departure (quit vs layoff vs retirement).",
            stata: "stcrreg x1 x2 x3, compete(event==2)",
            color: C.rose,
          },
          {
            title: "Frailty models (unobserved heterogeneity)",
            desc: "Some firms are inherently more 'frail' (prone to failure) than others for unobserved reasons. Frailty models add a random effect to the Cox model to capture this unobserved heterogeneity — analogous to random effects in panel data.",
            when: "When you suspect unobserved differences across firms affect their baseline hazard. When you have clustered data (employees within firms, firms within industries).",
            stata: "stcox x1 x2 x3, shared(firm_id)",
            color: C.smp,
          },
          {
            title: "Discrete-time survival (logit/cloglog)",
            desc: "When time is measured in discrete intervals (years, quarters), you can reshape the data into person-period format and use logit or complementary log-log regression. Each observation is a firm-year; the dependent variable is 'did the event happen this period?'",
            when: "When your data is naturally discrete (annual observations). When you want to include time-varying covariates easily. When you're more comfortable with logit than stcox.",
            stata: "* Reshape to firm-year, then:\nlogit event x1 x2 x3 i.year\n* or cloglog for proportional hazards equivalent",
            color: C.grn,
          },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: m.color, marginBottom: "6px" }}>{m.title}</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7, marginBottom: "8px" }}>{m.desc}</div>
            <div style={{ background: C.bg, borderRadius: "6px", padding: "8px 12px", marginBottom: "6px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: m.color }}>When to use</div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.5 }}>{m.when}</div>
            </div>
            <div style={{ fontSize: "11px", color: C.txD, fontFamily: mono, lineHeight: 1.6 }}>{m.stata}</div>
          </div>
        ))}
      </div>

      {/* Management applications */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Common management research applications</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {[
          { area: "Entrepreneurship", topics: "Time to startup failure, time to IPO, time to first funding round, new venture survival" },
          { area: "Strategy", topics: "Time to market entry, firm survival in an industry, duration of competitive advantage, alliance termination" },
          { area: "OB / HR", topics: "Employee tenure / turnover, time to promotion, CEO tenure, career transition timing" },
          { area: "Innovation", topics: "Time to patent grant, technology adoption timing, diffusion speed, time from R&D to commercialization" },
          { area: "Finance", topics: "Time to default, IPO underpricing duration, bond maturity, duration of financial distress" },
          { area: "International", topics: "Time to foreign market entry, survival of foreign subsidiaries, export spell duration" },
        ].map((a, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: C.smp }}>{a.area}</div>
            <div style={{ fontSize: "11px", color: C.txB, lineHeight: 1.5 }}>{a.topics}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>Survival analysis and causal inference:</strong> Cox and other survival models estimate <em>associations</em>, not causal effects. The same endogeneity concerns (OVB, reverse causality, selection) apply. You can combine survival models with causal inference strategies: IV-based hazard models, matched survival analysis, or survival analysis on a DiD-constructed sample. The hazard ratio from a Cox model is only causal if the covariates satisfy the same conditional independence assumption as in OLS.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "why", label: "1. Why Survival?" },
  { id: "concepts", label: "2. Key Concepts" },
  { id: "cox", label: "3. Cox PH" },
  { id: "beyond", label: "4. Beyond Cox" },
];

export default function SurvivalModule() {
  const [tab, setTab] = useState("why");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.smpBg, fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>ADVANCED</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Survival Analysis</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Modeling when events happen — duration, hazard, and censoring</p>
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
        {tab === "why" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Why duration data is special" sub="Censoring, skewness, and why OLS doesn't work" />
          <CBox title={<>⏱️ Time-to-Event Data</>} color={C.smp}>
            <WhySpecialViz />
          </CBox>
          <NBtn onClick={() => setTab("concepts")} label="Next: Key Concepts →" />
        </div>}

        {tab === "concepts" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Survival, hazard, and Kaplan-Meier" sub="The three functions that describe duration data" />
          <CBox title={<>📈 Core Concepts</>} color={C.smp}>
            <KeyConceptsViz />
          </CBox>
          <NBtn onClick={() => setTab("cox")} label="Next: Cox PH →" />
        </div>}

        {tab === "cox" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Cox Proportional Hazards" sub="The workhorse model — semi-parametric, flexible, and ubiquitous" />
          <CBox title={<>⚙️ The Cox Model</>} color={C.rose}>
            <CoxViz />
          </CBox>
          <NBtn onClick={() => setTab("beyond")} label="Next: Beyond Cox →" />
        </div>}

        {tab === "beyond" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Beyond Cox" sub="Parametric models, competing risks, frailty, and discrete time" />

          <CBox title={<>🔬 Extensions & Applications</>} color={C.smp}>
            <BeyondCoxViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Survival analysis models <strong>time until an event</strong>. It handles <strong>censoring</strong> (incomplete observations) that OLS cannot — this is its key advantage.<br />
              <strong>2.</strong> Three linked functions: <strong>S(t)</strong> = probability of surviving past t, <strong>h(t)</strong> = instantaneous risk given survival, <strong>f(t)</strong> = density of event times.<br />
              <strong>3.</strong> <strong>Kaplan-Meier</strong> gives non-parametric survival curves. The <strong>log-rank test</strong> compares curves between groups. Always plot KM curves first.<br />
              <strong>4.</strong> <strong>Cox PH</strong> is the workhorse: h(t|X) = h₀(t)·exp(βX). Interpret <strong>hazard ratios</strong>: HR {">"} 1 = faster events, HR {"<"} 1 = slower events. Test the PH assumption with Schoenfeld residuals.<br />
              <strong>5.</strong> Beyond Cox: <strong>parametric AFT models</strong> when you want to predict duration, <strong>competing risks</strong> for multiple event types, <strong>frailty models</strong> for unobserved heterogeneity, <strong>discrete-time logit</strong> for annual data.<br />
              <strong>6.</strong> In Stata: <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>stset duration, failure(event)</code> then <code style={{ fontFamily: mono, fontSize: "12px" }}>stcox x1 x2</code>. Always run <code style={{ fontFamily: mono, fontSize: "12px" }}>estat phtest</code>.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
