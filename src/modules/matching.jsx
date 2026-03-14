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
// TAB 1: THE MATCHING IDEA
// ═══════════════════════════════════════════════════════════════════
function MatchingIdeaViz() {
  const [step, setStep] = useState(0);

  // 6 treated, 8 control — show matching visually
  const treated = [
    { id: "T1", size: "Large", age: "Old", ind: "Tech", y: 45 },
    { id: "T2", size: "Small", age: "Young", ind: "Retail", y: 22 },
    { id: "T3", size: "Large", age: "Young", ind: "Tech", y: 38 },
    { id: "T4", size: "Small", age: "Old", ind: "Mfg", y: 28 },
  ];
  const control = [
    { id: "C1", size: "Large", age: "Old", ind: "Tech", y: 36, matchTo: "T1" },
    { id: "C2", size: "Small", age: "Young", ind: "Retail", y: 15, matchTo: "T2" },
    { id: "C3", size: "Large", age: "Young", ind: "Tech", y: 30, matchTo: "T3" },
    { id: "C4", size: "Small", age: "Old", ind: "Mfg", y: 21, matchTo: "T4" },
    { id: "C5", size: "Large", age: "Old", ind: "Retail", y: 34, matchTo: null },
    { id: "C6", size: "Small", age: "Young", ind: "Mfg", y: 18, matchTo: null },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The core idea of matching: for every treated unit, find one (or more) control units that are <strong>as similar as possible</strong> on observable characteristics. Then compare their outcomes. If matched units differ only in whether they received the treatment, the outcome difference is the causal effect.
      </div>

      <Anl>
        Imagine you want to know if an MBA program boosts salaries. You can't just compare MBA grads to non-grads — MBA applicants are already more ambitious, better-networked, and higher-earning. Matching finds a non-MBA worker for each MBA grad who is <em>identical</em> on age, industry, prior salary, and education — then compares their salaries. The difference isolates the MBA effect.
      </Anl>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. Unmatched data", "2. Find matches", "3. Estimate effect"].map((s, i) => (
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
        {/* Visual matching display */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "14px", alignItems: "start" }}>
          {/* Treated column */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, textAlign: "center", marginBottom: "8px" }}>TREATED</div>
            {treated.map((t, i) => (
              <div key={i} style={{
                background: C.roseBg, borderRadius: "8px", padding: "8px 10px", marginBottom: "6px",
                border: `1.5px solid ${step >= 1 ? C.rose : C.bdr}`,
                opacity: 1,
              }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose }}>{t.id}</div>
                <div style={{ fontSize: "10px", color: C.txD }}>{t.size} · {t.age} · {t.ind}</div>
                {step >= 2 && <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginTop: "2px" }}>Y = {t.y}</div>}
              </div>
            ))}
          </div>

          {/* Matching arrows */}
          <div style={{ paddingTop: "26px" }}>
            {step >= 1 && treated.map((t, i) => (
              <div key={i} style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <line x1="0" x2="32" y1="10" y2="10" stroke={C.grn} strokeWidth="2" />
                  <polygon points="32,5 40,10 32,15" fill={C.grn} />
                </svg>
              </div>
            ))}
          </div>

          {/* Control column */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, fontFamily: mono, textAlign: "center", marginBottom: "8px" }}>CONTROL</div>
            {control.map((c, i) => {
              const isMatch = step >= 1 && c.matchTo;
              const isDropped = step >= 1 && !c.matchTo;
              return (
                <div key={i} style={{
                  background: isMatch ? C.samBg : C.bg, borderRadius: "8px", padding: "8px 10px", marginBottom: "6px",
                  border: `1.5px solid ${isMatch ? C.sam : C.bdr}`,
                  opacity: isDropped ? 0.3 : 1,
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: isMatch ? C.sam : C.txD }}>{c.id}</div>
                  <div style={{ fontSize: "10px", color: C.txD }}>{c.size} · {c.age} · {c.ind}</div>
                  {step >= 2 && isMatch && <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, fontFamily: mono, marginTop: "2px" }}>Y = {c.y}</div>}
                  {isDropped && <div style={{ fontSize: "9px", color: C.txM, fontStyle: "italic" }}>no match</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ATT calculation at step 2 */}
        {step >= 2 && (
          <div style={{ background: C.grnBg, borderRadius: "10px", padding: "12px 16px", marginTop: "12px", border: "1px solid rgba(5,150,105,0.15)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "6px" }}>ATT (Average Treatment Effect on the Treated)</div>
            <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.8 }}>
              = mean(Y<sub>treated</sub>) − mean(Y<sub>matched control</sub>)<br />
              = ({treated.map(t => t.y).join(" + ")}) / {treated.length} − ({control.filter(c => c.matchTo).map(c => c.y).join(" + ")}) / {control.filter(c => c.matchTo).length}<br />
              = {(treated.reduce((s, t) => s + t.y, 0) / treated.length).toFixed(1)} − {(control.filter(c => c.matchTo).reduce((s, c) => s + c.y, 0) / control.filter(c => c.matchTo).length).toFixed(1)} = <strong style={{ color: C.grn, fontSize: "14px" }}>+{((treated.reduce((s, t) => s + t.y, 0) / treated.length) - (control.filter(c => c.matchTo).reduce((s, c) => s + c.y, 0) / control.filter(c => c.matchTo).length)).toFixed(1)}</strong>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>Unmatched data:</strong> We have treated firms (adopted a policy) and control firms (didn't). But they differ systematically — treated firms tend to be larger, older, in different industries. A naive comparison of outcomes would confound the treatment effect with these pre-existing differences.</>}
        {step === 1 && <><strong>Matching:</strong> For each treated firm, we find the control firm with the most similar observable characteristics (size, age, industry). T1 (Large, Old, Tech) matches to C1 (Large, Old, Tech). Unmatched controls (C5, C6) are dropped — they have no treated counterpart. After matching, the two groups are balanced on observables.</>}
        {step === 2 && <><strong>Estimate the ATT:</strong> We compare outcomes within each matched pair, then average. The difference is the Average Treatment Effect on the Treated (ATT) — the causal effect <em>for the treated firms</em>, after removing the confounding influence of observables. The key assumption: there are <strong>no unobserved confounders</strong> (conditional independence / selection on observables).</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: MATCHING METHODS
// ═══════════════════════════════════════════════════════════════════
function MethodsViz() {
  const [method, setMethod] = useState("psm");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        How do you define "similar"? With many covariates, exact matching on all of them is impossible (the <strong>curse of dimensionality</strong>). Different methods solve this differently:
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "16px" }}>
        {[
          { id: "psm", label: "Propensity Score" },
          { id: "cem", label: "Coarsened Exact" },
          { id: "nn", label: "Nearest Neighbor" },
          { id: "entropy", label: "Entropy Balancing" },
        ].map(t => (
          <button key={t.id} onClick={() => setMethod(t.id)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: method === t.id ? C.smp : C.bdr,
            background: method === t.id ? C.smpBg : "transparent",
            color: method === t.id ? C.smp : C.txD,
            fontSize: "10.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {method === "psm" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "8px" }}>Propensity Score Matching (PSM)</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              Collapse all covariates into a <strong>single number</strong>: the propensity score = P(treated | X) — the predicted probability of being treated, given observables. Then match treated and control units with similar propensity scores.
            </div>

            {/* 3-step visual */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[
                { step: "1", title: "Estimate P(treat | X)", desc: "Run a logit/probit of treatment on all covariates. Save predicted probabilities = propensity scores.", color: C.sam },
                { step: "2", title: "Match on scores", desc: "For each treated unit, find the control unit(s) with the closest propensity score. Common methods: nearest neighbor, caliper, kernel.", color: C.grn },
                { step: "3", title: "Estimate ATT", desc: "Compare outcomes between matched treated and control units. The difference is the ATT, estimated on the matched sample.", color: C.rose },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: s.color + "08", borderRadius: "8px", padding: "10px 12px", border: `1px solid ${s.color}22` }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: s.color, fontFamily: mono }}>{s.step}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: s.color, marginBottom: "4px" }}>{s.title}</div>
                  <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* PSM visualization — number line */}
            <svg viewBox="0 0 420 90" style={{ width: "100%", display: "block" }}>
              <line x1="20" x2="400" y1="40" y2="40" stroke={C.bdr} strokeWidth="1.5" />
              <text x="20" y="60" fontSize="9" fill={C.txM} fontFamily={mono}>0.0</text>
              <text x="400" y="60" fontSize="9" fill={C.txM} fontFamily={mono} textAnchor="end">1.0</text>
              <text x="210" y="78" textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Propensity score</text>
              {/* Treated dots (top) */}
              {[0.15, 0.32, 0.48, 0.55, 0.71, 0.85].map((p, i) => (
                <circle key={`t${i}`} cx={20 + p * 380} cy="30" r="5" fill={C.rose} stroke="#fff" strokeWidth="1.5" />
              ))}
              {/* Control dots (bottom) */}
              {[0.08, 0.18, 0.30, 0.45, 0.52, 0.60, 0.73, 0.90].map((p, i) => (
                <circle key={`c${i}`} cx={20 + p * 380} cy="50" r="5" fill={C.sam} stroke="#fff" strokeWidth="1.5" />
              ))}
              {/* Match lines */}
              {[[0.15, 0.18], [0.32, 0.30], [0.48, 0.45], [0.55, 0.52], [0.71, 0.73], [0.85, 0.90]].map(([t, c], i) => (
                <line key={i} x1={20 + t * 380} x2={20 + c * 380} y1="35" y2="45" stroke={C.grn} strokeWidth="1.5" opacity="0.5" />
              ))}
              <text x="210" y="16" textAnchor="middle" fontSize="9" fill={C.rose} fontFamily={font} fontWeight="600">Treated</text>
              <text x="210" y="68" textAnchor="middle" fontSize="9" fill={C.sam} fontFamily={font} fontWeight="600">Control</text>
            </svg>
          </div>

          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Known limitations of PSM</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
              King & Nielsen (2019) show that PSM can <strong>increase imbalance and bias</strong> relative to other matching methods. The propensity score is a balancing score in theory but estimated with noise in practice — matching on a noisy estimated score can produce worse balance than matching on covariates directly. Many researchers now prefer CEM or entropy balancing. If you use PSM, always check post-matching covariate balance.
            </div>
          </div>
        </div>
      )}

      {method === "cem" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "8px" }}>Coarsened Exact Matching (CEM)</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              Temporarily <strong>coarsen</strong> each covariate into bins (e.g., revenue → "Small/Medium/Large"), then do <strong>exact matching</strong> on the coarsened values. Discard any bin that doesn't contain both treated and control units. Analyze using the original (uncoarsened) data with stratum weights.
            </div>

            {/* CEM visual — binning table */}
            <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: "12px", fontSize: "11px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "70px 80px 80px 60px 60px", background: C.bg, fontFamily: mono, fontWeight: 700, color: C.txM }}>
                {["Stratum", "Size bin", "Age bin", "Treated", "Control"].map(h => (
                  <div key={h} style={{ padding: "6px 8px", borderLeft: h !== "Stratum" ? `1px solid ${C.bdr}` : "none" }}>{h}</div>
                ))}
              </div>
              {[
                { s: "A", sz: "Small", ag: "Young", t: 2, c: 3, ok: true },
                { s: "B", sz: "Small", ag: "Old", t: 1, c: 1, ok: true },
                { s: "C", sz: "Large", ag: "Young", t: 1, c: 2, ok: true },
                { s: "D", sz: "Large", ag: "Old", t: 1, c: 1, ok: true },
                { s: "E", sz: "Large", ag: "Young", t: 0, c: 2, ok: false },
              ].map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 80px 80px 60px 60px", borderTop: `1px solid ${C.bdr}`, background: r.ok ? C.card : C.bg, opacity: r.ok ? 1 : 0.4 }}>
                  <div style={{ padding: "5px 8px", fontFamily: mono, fontWeight: 600, color: r.ok ? C.grn : C.txM }}>{r.s}</div>
                  <div style={{ padding: "5px 8px", borderLeft: `1px solid ${C.bdr}` }}>{r.sz}</div>
                  <div style={{ padding: "5px 8px", borderLeft: `1px solid ${C.bdr}` }}>{r.ag}</div>
                  <div style={{ padding: "5px 8px", borderLeft: `1px solid ${C.bdr}`, color: C.rose, fontWeight: 600 }}>{r.t}</div>
                  <div style={{ padding: "5px 8px", borderLeft: `1px solid ${C.bdr}`, color: C.sam, fontWeight: 600 }}>{r.c}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11.5px", color: C.txD, lineHeight: 1.6 }}>
              Stratum E is dropped — no treated units in that bin. Within each surviving stratum, treated and control units are exact matches on coarsened covariates. Weights adjust for different numbers of treated/control within strata.
            </div>
          </div>

          <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>Why CEM is often preferred</div>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
              CEM guarantees a maximum imbalance <em>ex ante</em> — you choose how coarse the bins are, and that bounds the worst-case imbalance. Unlike PSM, there's no risk that matching increases imbalance. The tradeoff: coarser bins = better matches but more dropped observations; finer bins = more data but weaker guarantee.
            </div>
          </div>
        </div>
      )}

      {method === "nn" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "8px" }}>Nearest Neighbor Matching (on covariates)</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              Match each treated unit to the control unit(s) with the smallest <strong>distance</strong> in covariate space. Distance is typically Mahalanobis distance (accounts for variance and correlation of covariates).
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              {[
                { title: "1:1 matching", desc: "Each treated unit matched to one control. Simple but discards information.", tradeoff: "Less bias, more variance" },
                { title: "1:k matching", desc: "Each treated unit matched to k closest controls (e.g., k=3). Averages across multiple comparisons.", tradeoff: "More data, some bias if k is large" },
                { title: "With caliper", desc: "Only accept matches within a maximum distance. Drops treated units with no good match — improves quality at cost of sample size.", tradeoff: "Better balance, fewer observations" },
                { title: "With replacement", desc: "Allow control units to be matched to multiple treated units. Improves match quality but requires adjusted standard errors.", tradeoff: "Better matches, complex inference" },
              ].map((m, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp }}>{m.title}</div>
                  <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.5 }}>{m.desc}</div>
                  <div style={{ fontSize: "10.5px", color: C.txD, fontStyle: "italic", marginTop: "2px" }}>{m.tradeoff}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {method === "entropy" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "8px" }}>Entropy Balancing</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              Instead of dropping or matching observations, entropy balancing <strong>reweights</strong> the control group so that its covariate moments (mean, variance, skewness) exactly match the treated group. No observations are discarded.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>Advantages</div>
                <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>
                  Perfect balance guaranteed on specified moments. No observations dropped. No researcher discretion on matching parameters. Preprocessing step — use weights in any subsequent analysis.
                </div>
              </div>
              <div style={{ background: C.roseBg, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Limitations</div>
                <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>
                  Extreme weights if treated and control are very different — a few control units may carry most of the weight. Only balances on specified moments. Still relies on selection-on-observables assumption.
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            Entropy balancing (Hainmueller, 2012) is increasingly popular in management research because it eliminates the iterative "match, check balance, re-match" cycle that plagues other methods. You specify which moments to balance, and the algorithm finds the weights.
          </div>
        </div>
      )}

      <Ins>
        <strong>Which method to choose?</strong> (1) If you want simplicity and guaranteed balance: <strong>CEM</strong> or <strong>entropy balancing</strong>. (2) If you need to match on many continuous covariates: <strong>PSM</strong> or <strong>Mahalanobis NN</strong> — but always check post-match balance. (3) If reviewers are skeptical of PSM (increasingly common): <strong>entropy balancing</strong> is the safest bet. Whatever you choose, the method is only as good as the <strong>selection-on-observables assumption</strong>.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: BALANCE & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════
function BalanceViz() {
  // Simulated balance statistics
  const covariates = [
    { name: "Firm size (log)", preSMD: 0.62, postSMD: 0.04 },
    { name: "Firm age", preSMD: 0.45, postSMD: 0.08 },
    { name: "ROA", preSMD: 0.38, postSMD: 0.03 },
    { name: "Leverage", preSMD: -0.28, postSMD: -0.05 },
    { name: "R&D intensity", preSMD: 0.55, postSMD: 0.06 },
    { name: "Industry HHI", preSMD: -0.15, postSMD: -0.02 },
  ];

  const W = 420, H = 200, pad = { t: 16, r: 16, b: 30, l: 100 };
  const cw = W - pad.l - pad.r;
  const rowH = (H - pad.t - pad.b) / covariates.length;
  const sx = v => pad.l + ((v + 1) / 2) * cw; // maps -1..1 to chart

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        After matching, you <strong>must</strong> check that the matched sample is actually balanced. The key diagnostic is the <strong>standardized mean difference (SMD)</strong> — the difference in means between treated and control, divided by the pooled standard deviation. Good balance: |SMD| {"<"} 0.1.
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>Love plot: covariate balance before vs after matching</div>
        <div style={{ fontSize: "11px", color: C.txD, marginBottom: "8px" }}>Each covariate shown with pre-match (hollow) and post-match (filled) SMD</div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grid lines */}
          {[-0.5, -0.25, 0, 0.25, 0.5].map(v => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={pad.t} y2={H - pad.b} stroke={v === 0 ? C.txM : C.grid} strokeWidth={v === 0 ? "1.5" : "1"} />
              <text x={sx(v)} y={H - 12} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v.toFixed(2)}</text>
            </g>
          ))}

          {/* ±0.1 threshold bands */}
          <rect x={sx(-0.1)} y={pad.t} width={sx(0.1) - sx(-0.1)} height={H - pad.t - pad.b} fill={C.grn} opacity="0.06" />

          {/* Covariate rows */}
          {covariates.map((c, i) => {
            const y = pad.t + i * rowH + rowH / 2;
            return (
              <g key={i}>
                <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill={C.txB} fontFamily={font}>{c.name}</text>
                {/* Pre-match (hollow) */}
                <circle cx={sx(c.preSMD)} cy={y} r="5" fill="none" stroke={C.rose} strokeWidth="2" />
                {/* Post-match (filled) */}
                <circle cx={sx(c.postSMD)} cy={y} r="5" fill={C.grn} stroke={C.grn} strokeWidth="1.5" />
                {/* Arrow from pre to post */}
                <line x1={sx(c.preSMD)} x2={sx(c.postSMD)} y1={y} y2={y} stroke={C.txM} strokeWidth="1" strokeDasharray="3,2" opacity="0.4" />
              </g>
            );
          })}

          {/* Legend */}
          <circle cx={pad.l + 10} cy={H - 14} r="4" fill="none" stroke={C.rose} strokeWidth="2" />
          <text x={pad.l + 18} y={H - 11} fontSize="9" fill={C.rose} fontFamily={font}>Pre-match</text>
          <circle cx={pad.l + 85} cy={H - 14} r="4" fill={C.grn} />
          <text x={pad.l + 93} y={H - 11} fontSize="9" fill={C.grn} fontFamily={font}>Post-match</text>
          <text x={W - pad.r} y={H - 11} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={font}>Green zone: |SMD| {"<"} 0.1</text>
        </svg>
      </div>

      <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
        In this example, all covariates had substantial pre-match imbalance (hollow circles far from zero). After matching, all post-match SMDs (filled circles) fall within the ±0.1 threshold — indicating good balance. If any covariate remains unbalanced after matching, you need to revise your matching specification.
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Diagnostic checklist</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { check: "Love plot / balance table", desc: "Report SMDs for all covariates before and after matching. All post-match |SMD| should be < 0.1.", must: true },
          { check: "Common support / overlap", desc: "Check that treated and control propensity score distributions overlap. Trim observations outside the region of common support.", must: true },
          { check: "Sample size after matching", desc: "Report how many observations were dropped. Losing too many raises external validity concerns.", must: true },
          { check: "Sensitivity analysis (Rosenbaum bounds)", desc: "Test how much hidden bias (an unobserved confounder) would be needed to overturn your results. Reports Γ — the threshold at which conclusions change.", must: false },
        ].map((c, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px", display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ fontSize: "14px", marginTop: "1px" }}>{c.must ? "✅" : "📋"}</div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: c.must ? C.grn : C.txD }}>{c.check}</div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stata */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Stata: matching & balance</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * PSM: estimate propensity score + match<br />
          teffects psmatch (y) (treatment x1 x2 x3, logit)<br />
          tebalance summarize   // balance table<br />
          tebalance density     // overlap plot<br /><br />
          * CEM:<br />
          * ssc install cem<br />
          cem x1 (#5) x2 (#3) x3 (0 10 50 100), treatment(treatment)<br />
          reg y treatment [iweight=cem_weights]<br /><br />
          * Entropy balancing:<br />
          * ssc install ebalance<br />
          ebalance treatment x1 x2 x3, targets(1)  // balance on means<br />
          reg y treatment [pweight=_webal]<br /><br />
          * Mahalanobis nearest-neighbor:<br />
          teffects nnmatch (y x1 x2 x3) (treatment), nneighbor(1) metric(maha)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: ASSUMPTIONS & LIMITATIONS
// ═══════════════════════════════════════════════════════════════════
function AssumptionsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Matching is intuitive and flexible, but it rests on a <strong>strong, untestable assumption</strong>. Understanding what matching can and can't do is essential for using it credibly.
      </div>

      {/* The key assumption */}
      <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.rose}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>The critical assumption: selection on observables</div>
        <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0", color: C.tx }}>
          Y(0), Y(1) ⫫ D | X
        </div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
          Conditional on observables X, treatment assignment D is <strong>independent of potential outcomes</strong>. In plain English: after controlling for everything you observe, there are <strong>no remaining unobserved differences</strong> between treated and control units that affect the outcome. This is also called the <strong>conditional independence assumption (CIA)</strong> or <strong>unconfoundedness</strong>.
        </div>
        <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px", marginTop: "10px" }}>
          <div style={{ fontSize: "12.5px", color: C.rose, fontWeight: 600 }}>This assumption is not testable. If there's an unobserved confounder that affects both treatment and outcome, matching fails — no matter how sophisticated the method.</div>
        </div>
      </div>

      {/* Matching vs other methods */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>When to use matching (and when not to)</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(5,150,105,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, marginBottom: "6px" }}>MATCHING IS APPROPRIATE WHEN</div>
          <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.7 }}>
            You have rich observables that plausibly capture all selection into treatment. Treatment is based on observable firm characteristics (size, industry, past performance). You want to reduce model dependence and make treated/control groups comparable before regression.
          </div>
        </div>
        <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(225,29,72,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>MATCHING IS INAPPROPRIATE WHEN</div>
          <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.7 }}>
            Selection is driven by unobservables (motivation, managerial ability, private information). You have a good instrument or a natural experiment — IV, DiD, or RDD will be more credible. Your treated and control groups have minimal overlap on observables.
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Matching vs other causal inference methods</div>
      <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: "16px", fontSize: "11.5px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", background: C.bg, fontWeight: 700, color: C.txM, fontFamily: mono }}>
          {["Method", "Handles unobs.", "Data needs", "Credibility"].map(h => (
            <div key={h} style={{ padding: "8px 10px", borderLeft: h !== "Method" ? `1px solid ${C.bdr}` : "none", fontSize: "10px" }}>{h}</div>
          ))}
        </div>
        {[
          { m: "Matching", u: "✗ No", d: "Rich observables", c: "Moderate" },
          { m: "IV", u: "✓ Yes", d: "Valid instrument", c: "High (if valid)" },
          { m: "DiD", u: "✓ Time-invariant", d: "Panel + parallel trends", c: "High" },
          { m: "RDD", u: "✓ Near cutoff", d: "Running variable", c: "Very high" },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
            <div style={{ padding: "8px 10px", fontWeight: 600, color: C.tx }}>{r.m}</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: r.u.startsWith("✓") ? C.grn : C.rose }}>{r.u}</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{r.d}</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txB }}>{r.c}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>The honest framing:</strong> Matching doesn't solve endogeneity — it addresses <strong>observable confounding</strong> only. If reviewers ask "what about unobserved heterogeneity?", matching alone can't answer that. Common strategies: (1) argue the CIA is plausible for your setting, (2) combine matching with DiD ("matched DiD"), (3) run Rosenbaum sensitivity analysis to show how large an unobserved confounder would need to be, (4) use matching as a robustness check alongside a stronger design.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "idea", label: "1. The Idea" },
  { id: "methods", label: "2. Methods" },
  { id: "balance", label: "3. Balance" },
  { id: "assumptions", label: "4. Assumptions" },
];

export default function MatchingModule() {
  const [tab, setTab] = useState("idea");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.roseBg, fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>CAUSAL INFERENCE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Matching Methods</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Creating comparable groups when randomization isn't possible</p>
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
          <SH number="01" title="The matching intuition" sub="Find your treated unit's twin — then compare outcomes" />
          <CBox title={<>🔗 The Matching Idea</>} color={C.smp}>
            <MatchingIdeaViz />
          </CBox>
          <NBtn onClick={() => setTab("methods")} label="Next: Matching Methods →" />
        </div>}

        {tab === "methods" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="How to match" sub="PSM, CEM, nearest neighbor, and entropy balancing" />
          <CBox title={<>⚙️ Matching Methods</>} color={C.smp}>
            <MethodsViz />
          </CBox>
          <NBtn onClick={() => setTab("balance")} label="Next: Balance Diagnostics →" />
        </div>}

        {tab === "balance" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Checking balance" sub="The Love plot and post-matching diagnostics" />
          <Pr>Matching is only useful if it actually makes the groups comparable. The <strong>Love plot</strong> is the gold standard for visualizing balance — every matching paper should have one:</Pr>
          <CBox title={<>📊 Balance Diagnostics</>} color={C.grn}>
            <BalanceViz />
          </CBox>
          <NBtn onClick={() => setTab("assumptions")} label="Next: Assumptions →" />
        </div>}

        {tab === "assumptions" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Assumptions & limitations" sub="What matching can and can't do" />

          <CBox title={<>⚠️ The Fine Print</>} color={C.rose}>
            <AssumptionsViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Matching creates comparable treated/control groups by pairing units with similar <strong>observable characteristics</strong>. The outcome difference in matched pairs estimates the ATT.<br />
              <strong>2.</strong> <strong>PSM</strong> collapses covariates into a single propensity score but can increase imbalance (King & Nielsen, 2019). <strong>CEM</strong> guarantees bounded imbalance. <strong>Entropy balancing</strong> reweights without dropping observations.<br />
              <strong>3.</strong> <strong>Always check balance</strong> after matching. Report a Love plot with standardized mean differences. Target |SMD| {"<"} 0.1 for all covariates.<br />
              <strong>4.</strong> The critical assumption is <strong>selection on observables (CIA)</strong> — no unobserved confounders. This is untestable and often implausible in management research.<br />
              <strong>5.</strong> Matching is best used as a <strong>preprocessing step</strong> (before regression) or combined with stronger designs (matched DiD). On its own, it's weaker than IV, DiD, or RDD for causal inference.<br />
              <strong>6.</strong> In Stata: <code style={{ fontFamily: mono, fontSize: "12px", background: C.bg, padding: "1px 5px", borderRadius: "3px" }}>teffects psmatch</code> for PSM, <code style={{ fontFamily: mono, fontSize: "12px" }}>cem</code> for CEM, <code style={{ fontFamily: mono, fontSize: "12px" }}>ebalance</code> for entropy balancing. Always run <code style={{ fontFamily: mono, fontSize: "12px" }}>tebalance</code> diagnostics.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
