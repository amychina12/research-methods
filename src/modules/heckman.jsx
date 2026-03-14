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
// TAB 1: THE SELECTION PROBLEM
// ═══════════════════════════════════════════════════════════════════
function SelectionProblemViz() {
  const [step, setStep] = useState(0);

  // Simulated data — some firms choose to export, we only see export profits for exporters
  const firms = [
    { id: 1, prod: 9.2, export: true, profit: 18, color: C.rose },
    { id: 2, prod: 8.5, export: true, profit: 15, color: C.rose },
    { id: 3, prod: 7.8, export: true, profit: 12, color: C.rose },
    { id: 4, prod: 7.0, export: true, profit: 10, color: C.rose },
    { id: 5, prod: 6.5, export: false, profit: null, color: C.sam },
    { id: 6, prod: 5.8, export: false, profit: null, color: C.sam },
    { id: 7, prod: 5.0, export: false, profit: null, color: C.sam },
    { id: 8, prod: 4.2, export: false, profit: null, color: C.sam },
    { id: 9, prod: 3.5, export: false, profit: null, color: C.sam },
    { id: 10, prod: 6.8, export: false, profit: null, color: C.sam },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Sometimes you only observe the outcome for a <strong>non-random subset</strong> of your sample. This is <strong>sample selection bias</strong> — and it can't be fixed by adding controls or matching. You need a model that accounts for <em>why</em> some observations are missing.
      </div>

      <Anl>
        You want to study how exporting affects firm profits. But you only observe export profits for firms that <em>chose</em> to export. The problem: exporters aren't random — they tend to be larger, more productive, and better-managed. If you estimate the effect using only exporters, you're studying a selected sample. The "effect" conflates exporting with the characteristics that led firms to export in the first place.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. The full population", "2. Selection happens", "3. The bias"].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.rose : C.bdr,
            background: step === i ? C.roseBg : "transparent",
            color: step === i ? C.rose : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
        {/* Visual: firms as bars */}
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.txM, fontFamily: mono, marginBottom: "8px" }}>
          {step === 0 ? "ALL 10 FIRMS — PRODUCTIVITY" : step === 1 ? "SELECTED SAMPLE: ONLY EXPORTERS OBSERVED" : "WHAT WE ESTIMATE vs WHAT WE WANT"}
        </div>

        <div style={{ display: "flex", gap: "4px", alignItems: "end", height: "120px", marginBottom: "8px" }}>
          {firms.map((f, i) => {
            const h = f.prod * 11;
            const isSelected = f.export;
            const faded = step >= 1 && !isSelected;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", height: "100%" }}>
                <div style={{
                  width: "100%", maxWidth: "36px", height: `${h}%`, borderRadius: "4px 4px 0 0",
                  background: faded ? C.bdr : (isSelected ? C.rose : C.sam),
                  opacity: faded ? 0.25 : (step === 0 ? 0.6 : 0.8),
                  transition: "all 0.4s ease",
                  position: "relative",
                }}>
                  {step >= 1 && isSelected && f.profit && (
                    <div style={{ position: "absolute", top: "-18px", width: "100%", textAlign: "center", fontSize: "10px", fontWeight: 700, color: C.rose, fontFamily: mono }}>{f.profit}</div>
                  )}
                  {step >= 2 && !isSelected && (
                    <div style={{ position: "absolute", top: "-14px", width: "100%", textAlign: "center", fontSize: "12px", color: C.txM }}>?</div>
                  )}
                </div>
                <div style={{ fontSize: "9px", color: faded ? C.txM : C.txD, marginTop: "3px", fontFamily: mono }}>{f.prod}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "12px", fontSize: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.rose }} /> Exporters</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.sam }} /> Non-exporters</div>
          <div style={{ color: C.txD }}>Bar height = productivity</div>
        </div>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>The full population:</strong> 10 firms with varying productivity. We want to know: what's the effect of exporting on profits? In principle, we'd need to compare each firm's profit <em>if it exports</em> vs <em>if it doesn't</em> — but we only observe one scenario per firm.</>}
        {step === 1 && <><strong>Selection happens:</strong> Only the 4 most productive firms choose to export. We observe export profits (numbers above bars) only for these firms. The 6 non-exporters' potential export profits are <strong>unobserved</strong>. If we naively analyze only exporters, we're studying a non-random sample that's systematically more productive.</>}
        {step === 2 && <><strong>The bias:</strong> The "?" marks what we're missing — the potential export profits of non-exporters. If we regress profit on exporting using only firms that export, we conflate the export effect with selection: productive firms both (a) choose to export AND (b) would have higher profits anyway. Our estimate is biased upward. Heckman's insight: model the <strong>selection process</strong> explicitly and correct for it.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: THE TWO-STEP ESTIMATOR
// ═══════════════════════════════════════════════════════════════════
function TwoStepViz() {
  const [stage, setStage] = useState(0);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Heckman's (1979) key insight: if we can model <em>why</em> units select into the sample, we can compute a <strong>correction term</strong> that removes the selection bias from the outcome equation. This is the famous <strong>two-step estimator</strong>.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["The two equations", "Step 1: Selection", "Step 2: Correction"].map((s, i) => (
          <button key={i} onClick={() => setStage(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: stage === i ? C.smp : C.bdr,
            background: stage === i ? C.smpBg : "transparent",
            color: stage === i ? C.smp : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s}</button>
        ))}
      </div>

      {stage === 0 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
            The Heckman model has <strong>two equations</strong> that are estimated jointly. The selection equation models who enters the sample; the outcome equation models the variable of interest — corrected for selection.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: C.card, borderRadius: "12px", border: `2px solid ${C.sam}`, padding: "16px 20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "6px" }}>SELECTION EQUATION (who do we observe?)</div>
              <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "8px 0" }}>
                D<sub>i</sub>* = <span style={{ color: C.sam }}>γ</span>W<sub>i</sub> + u<sub>i</sub> {"  →  "} D<sub>i</sub> = 1 if D<sub>i</sub>* {">"} 0
              </div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                D<sub>i</sub> = whether we observe the outcome (1 = yes, 0 = no). W<sub>i</sub> = variables that predict selection (including an <strong>exclusion variable</strong> — something that predicts selection but NOT the outcome). This is a <strong>probit</strong> model.
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: "12px", border: `2px solid ${C.rose}`, padding: "16px 20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "6px" }}>OUTCOME EQUATION (what we actually care about)</div>
              <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "8px 0" }}>
                Y<sub>i</sub> = <span style={{ color: C.rose }}>β</span>X<sub>i</sub> + <span style={{ color: C.grn }}>ρσ<sub>ε</sub></span><span style={{ color: C.smp }}>λ(γ̂W<sub>i</sub>)</span> + ε<sub>i</sub>
              </div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                Y<sub>i</sub> = outcome (observed only when D<sub>i</sub> = 1). X<sub>i</sub> = covariates. The <span style={{ color: C.smp, fontWeight: 600 }}>λ(·)</span> term is the <strong>inverse Mills ratio</strong> — the correction for selection bias. <span style={{ color: C.grn, fontWeight: 600 }}>ρσ<sub>ε</sub></span> is its coefficient — if significantly different from zero, selection bias is present.
              </div>
            </div>
          </div>

          <Ins>
            <strong>The exclusion restriction:</strong> For the Heckman model to be well-identified, the selection equation should include at least one variable that predicts selection (D) but does <em>not</em> directly affect the outcome (Y). Without this, the model relies entirely on the nonlinearity of the probit function for identification — which is fragile. Reviewers will demand an exclusion restriction.
          </Ins>
        </div>
      )}

      {stage === 1 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "8px" }}>Step 1: Estimate the selection equation</div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[
                { step: "1a", title: "Run probit", desc: "Regress D (observed / not observed) on all predictors W, including the exclusion variable.", color: C.sam },
                { step: "1b", title: "Predict γ̂W", desc: "Compute the predicted linear index γ̂W for every observation.", color: C.sam },
                { step: "1c", title: "Compute λ̂", desc: "Calculate the inverse Mills ratio: λ̂ᵢ = φ(γ̂Wᵢ) / Φ(γ̂Wᵢ) for each observed unit.", color: C.grn },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: s.color + "08", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${s.color}22` }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: s.color, fontFamily: mono }}>{s.step}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: s.color, marginBottom: "4px" }}>{s.title}</div>
                  <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, marginBottom: "6px" }}>What is the inverse Mills ratio (λ)?</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
                <strong>λ(z) = φ(z) / Φ(z)</strong> — the standard normal PDF divided by the CDF, evaluated at the predicted selection index. Intuitively, λ captures <strong>how surprising it is that a unit was selected</strong>, given its characteristics. A high λ means the unit barely made it into the sample (it was unlikely to be selected) — these units carry the most information about selection bias.
              </div>
            </div>
          </div>

          {/* IMR visual */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>The inverse Mills ratio: φ(z) / Φ(z)</div>
            <svg viewBox="0 0 400 150" style={{ width: "100%", display: "block" }}>
              {/* Axes */}
              <line x1="50" x2="380" y1="120" y2="120" stroke={C.bdr} strokeWidth="1" />
              <line x1="50" x2="50" y1="10" y2="120" stroke={C.bdr} strokeWidth="1" />

              {/* IMR curve — decreasing, asymptotic */}
              <path d={`M60,15 Q100,18 140,25 Q180,38 220,55 Q260,72 300,85 Q340,95 370,100`} fill="none" stroke={C.smp} strokeWidth="2.5" />

              {/* Annotation zones */}
              <rect x="60" y="10" width="80" height="110" fill={C.rose} opacity="0.04" rx="4" />
              <text x="100" y="135" textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Low P(select)</text>
              <text x="100" y="145" textAnchor="middle" fontSize="8" fill={C.txD} fontFamily={font}>High λ → big correction</text>

              <rect x="260" y="10" width="110" height="110" fill={C.grn} opacity="0.04" rx="4" />
              <text x="315" y="135" textAnchor="middle" fontSize="9" fill={C.grn} fontFamily={font} fontWeight="600">High P(select)</text>
              <text x="315" y="145" textAnchor="middle" fontSize="8" fill={C.txD} fontFamily={font}>Low λ → small correction</text>

              {/* Axis labels */}
              <text x="215" y="118" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>γ̂W (predicted selection index)</text>
              <text x="38" y="65" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font} transform="rotate(-90, 38, 65)">λ (IMR)</text>
            </svg>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "8px" }}>Step 2: Add λ̂ to the outcome regression</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              Now run OLS on the outcome equation — but include the estimated inverse Mills ratio (λ̂) from Step 1 as an additional regressor. This corrects for the selection bias.
            </div>

            <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center" }}>
                Y<sub>i</sub> = β₀ + β₁X<sub>1i</sub> + β₂X<sub>2i</sub> + ... + <span style={{ color: C.grn, fontWeight: 700 }}>δλ̂<sub>i</sub></span> + ε<sub>i</sub>
              </div>
              <div style={{ fontSize: "12px", color: C.txD, textAlign: "center", marginTop: "6px" }}>
                Estimated on the <strong>selected sample only</strong> (D<sub>i</sub> = 1)
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn }}>If δ̂ is significant (p {"<"} 0.05):</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>Selection bias is present. The Heckman correction is needed. The β coefficients are now corrected for selection. Report the Heckman model as your main specification.</div>
              </div>
              <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.txD }}>If δ̂ is not significant:</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>No evidence of selection bias. OLS on the selected sample may be fine. But report the Heckman results anyway to show you tested for it.</div>
              </div>
            </div>
          </div>

          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Standard error caveat</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
              The two-step estimator produces <strong>incorrect standard errors</strong> in the second step because λ̂ is estimated, not observed. Options: (1) use the <strong>MLE version</strong> (<code style={{ fontFamily: mono, fontSize: "11px" }}>heckman</code> in Stata), which estimates both equations simultaneously and gets SEs right; (2) bootstrap the two-step procedure; (3) use Murphy & Topel (1985) corrected SEs. In practice, always prefer MLE — the two-step is mainly pedagogical.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: MANAGEMENT EXAMPLES
// ═══════════════════════════════════════════════════════════════════
function ExamplesViz() {
  const [example, setExample] = useState(0);

  const examples = [
    {
      title: "Exporting and firm performance",
      selection: "Firm decides whether to export (D = 1 if exports)",
      outcome: "Export profit / revenue",
      selVars: "Firm size, productivity, industry, distance to ports, exchange rate exposure",
      excl: "Distance to nearest port / free trade zone",
      exclWhy: "Proximity to ports increases likelihood of exporting (lower logistics costs) but doesn't directly affect profitability conditional on exporting.",
      concern: "If firms near ports are systematically different (e.g., in coastal industrial clusters with different labor markets), the exclusion restriction fails.",
    },
    {
      title: "M&A and acquirer returns",
      selection: "Firm decides whether to make an acquisition (D = 1 if acquires)",
      outcome: "Post-acquisition returns / performance",
      selVars: "Firm size, cash holdings, Tobin's Q, industry concentration, CEO overconfidence",
      excl: "State-level anti-takeover laws",
      exclWhy: "Anti-takeover laws reduce the probability of being an acquirer (defensive posture) but don't directly affect post-deal returns.",
      concern: "States with anti-takeover laws may have different corporate governance environments that affect firm performance through channels other than M&A.",
    },
    {
      title: "Analyst coverage and stock returns",
      selection: "Analyst decides whether to cover a firm (D = 1 if covered)",
      outcome: "Stock returns / information asymmetry",
      selVars: "Firm size, trading volume, institutional ownership, industry, brokerage size",
      excl: "Brokerage closure / analyst turnover (exogenous loss of coverage)",
      exclWhy: "When a brokerage shuts down, firms lose coverage for reasons unrelated to their own characteristics. This provides quasi-exogenous variation in coverage.",
      concern: "Brokerage closures may be correlated with market conditions that also affect the firms they covered.",
    },
  ];
  const ex = examples[example];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Heckman selection models appear frequently in management research whenever outcomes are observed only for a self-selected subset. The challenge is always finding a credible <strong>exclusion variable</strong>.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setExample(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: example === i ? C.smp : C.bdr,
            background: example === i ? C.smpBg : "transparent",
            color: example === i ? C.smp : C.txD,
            fontSize: "10.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>{e.title.split(" and ")[0]}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "12px" }}>{ex.title}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: C.samBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "3px" }}>SELECTION EQUATION</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>{ex.selection}</div>
            <div style={{ fontSize: "11px", color: C.txD, marginTop: "4px" }}><strong>Predictors:</strong> {ex.selVars}</div>
          </div>

          <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "3px" }}>OUTCOME EQUATION</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>{ex.outcome}</div>
          </div>

          <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "3px" }}>EXCLUSION VARIABLE</div>
            <div style={{ fontSize: "12.5px", color: C.txB, fontWeight: 600 }}>{ex.excl}</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6, marginTop: "4px" }}><strong>Why it works:</strong> {ex.exclWhy}</div>
          </div>

          <div style={{ background: C.popBg, borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.pop, fontFamily: mono, marginBottom: "3px" }}>POTENTIAL CONCERN</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{ex.concern}</div>
          </div>
        </div>
      </div>

      <Ins>
        <strong>Finding exclusion variables is the hardest part.</strong> The variable must predict selection into the sample but have no direct effect on the outcome. This is analogous to the exclusion restriction in IV — and just as hard to defend. Some researchers run Heckman without an exclusion restriction (relying on functional form alone), but this is fragile and increasingly challenged by reviewers.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════
function ImplementationViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Stata makes Heckman estimation straightforward. The key decisions are: MLE vs two-step, what to include in each equation, and which diagnostics to report.
      </div>

      {/* Stata code */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Stata implementation</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Method 1: MLE (preferred — correct SEs)<br />
          heckman y x1 x2 x3, select(d = w1 w2 w3 exclusion_var) <br /><br />

          * Method 2: Two-step (Heckman's original)<br />
          heckman y x1 x2 x3, select(d = w1 w2 w3 exclusion_var) twostep<br /><br />

          * Note: variables after select() predict SELECTION<br />
          * exclusion_var is in select() but NOT in the main eq<br />
          * This is the exclusion restriction<br /><br />

          * Key output to report:<br />
          * - lambda (coefficient on IMR): is selection bias present?<br />
          * - rho (correlation of errors): direction of bias<br />
          * - sigma (SD of outcome error)<br />
          * - athrho (inverse hyperbolic tangent of rho): test stat
        </div>
      </div>

      {/* Reading the output */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Reading the Heckman output</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {[
          { param: "λ̂ (lambda)", desc: "Coefficient on the inverse Mills ratio. If significant, selection bias exists and the Heckman correction is needed.", interpret: "λ̂ > 0: selected units have higher-than-expected outcomes → upward bias in naive OLS. λ̂ < 0: opposite.", color: C.smp },
          { param: "ρ (rho)", desc: "Correlation between the errors of the selection and outcome equations. Captures how the unobservable factors driving selection relate to the outcome.", interpret: "ρ > 0: unobservables that make selection more likely also increase Y. ρ < 0: unobservables that increase selection decrease Y.", color: C.rose },
          { param: "σ (sigma)", desc: "Standard deviation of the outcome equation error. Combined with ρ: λ = ρ × σ.", interpret: "Reported for completeness. The joint test of ρ = 0 (or equivalently λ = 0) is the key test for selection bias.", color: C.txD },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: p.color, fontFamily: mono, marginBottom: "4px" }}>{p.param}</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7, marginBottom: "4px" }}>{p.desc}</div>
            <div style={{ fontSize: "11.5px", color: C.txD, lineHeight: 1.6 }}>{p.interpret}</div>
          </div>
        ))}
      </div>

      {/* Common pitfalls */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Common pitfalls</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { title: "No exclusion restriction", desc: "Running Heckman with the exact same variables in both equations. Identification relies entirely on the probit's nonlinearity — fragile, and reviewers will flag it. Always include at least one variable that predicts selection but not the outcome." },
          { title: "Weak exclusion variable", desc: "The exclusion variable barely predicts selection (weak first stage). Like weak instruments in IV, this makes the correction unreliable. Check that the exclusion variable is significant in the selection equation." },
          { title: "Misspecified selection equation", desc: "Omitting important predictors of selection. If the selection model is wrong, λ̂ is wrong, and the correction introduces bias rather than removing it. Include all plausible predictors of selection." },
          { title: "Heckman when it's not needed", desc: "Applying Heckman when the research question doesn't involve sample selection. If all units are observed but treatment is endogenous, you need IV or DiD — not Heckman. Heckman is specifically for when the dependent variable is missing for a non-random subset." },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose }}>{p.title}</div>
            <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>Heckman vs other methods:</strong> Heckman solves a specific problem — <strong>sample selection</strong> (observing outcomes for a non-random subset). It does NOT solve general endogeneity. If your treatment is endogenous but outcomes are observed for everyone, use IV, DiD, or RDD instead. If your problem is both sample selection AND endogeneity in the outcome equation, you need more advanced methods (e.g., control function approaches). Don't use Heckman as a generic robustness check — use it when sample selection is the actual threat to your analysis.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "problem", label: "1. Selection Bias" },
  { id: "twostep", label: "2. The Two-Step" },
  { id: "examples", label: "3. Examples" },
  { id: "implementation", label: "4. Implementation" },
];

export default function HeckmanModule() {
  const [tab, setTab] = useState("problem");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.roseBg, fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>CAUSAL INFERENCE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Heckman Selection Model</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Correcting for non-random sample selection</p>
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
        {tab === "problem" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="The sample selection problem" sub="When your dependent variable is missing for non-random reasons" />
          <CBox title={<>👁️ You Only See Half the Picture</>} color={C.rose}>
            <SelectionProblemViz />
          </CBox>
          <NBtn onClick={() => setTab("twostep")} label="Next: The Two-Step →" />
        </div>}

        {tab === "twostep" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Heckman's two-step estimator" sub="Model selection, compute the correction, fix the bias" />
          <CBox title={<>🔧 The Two-Step Procedure</>} color={C.smp}>
            <TwoStepViz />
          </CBox>
          <NBtn onClick={() => setTab("examples")} label="Next: Examples →" />
        </div>}

        {tab === "examples" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Management research examples" sub="Exporting, M&A, and analyst coverage" />
          <CBox title={<>📋 Applied Examples</>} color={C.smp}>
            <ExamplesViz />
          </CBox>
          <NBtn onClick={() => setTab("implementation")} label="Next: Implementation →" />
        </div>}

        {tab === "implementation" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Stata implementation & diagnostics" sub="Commands, output interpretation, and common pitfalls" />

          <CBox title={<>💻 Implementation Guide</>} color={C.grn}>
            <ImplementationViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Heckman corrects for <strong>sample selection bias</strong> — when outcomes are observed only for a non-random subset (e.g., export profits observed only for exporters).<br />
              <strong>2.</strong> The model has two equations: a <strong>selection equation</strong> (probit: who is observed?) and an <strong>outcome equation</strong> (the relationship of interest, corrected for selection).<br />
              <strong>3.</strong> The <strong>inverse Mills ratio (λ)</strong> is the correction term. If its coefficient is significant, selection bias is present. Its sign tells you the direction of bias.<br />
              <strong>4.</strong> An <strong>exclusion restriction</strong> is critical: at least one variable that predicts selection but not the outcome. Without it, the model is poorly identified.<br />
              <strong>5.</strong> Use <strong>MLE</strong> (not two-step) for correct standard errors: <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>heckman y x1 x2, select(d = w1 w2 excl_var)</code><br />
              <strong>6.</strong> Heckman is for <strong>sample selection only</strong> — not a general fix for endogeneity. If outcomes are observed for everyone, use IV, DiD, or RDD instead.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
