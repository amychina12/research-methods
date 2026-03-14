import { useState } from "react";

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
// TAB 1: THE FUNDAMENTAL PROBLEM
// ═══════════════════════════════════════════════════════════════════
function FundamentalProblemViz() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Every causal question boils down to a comparison: <strong>what happened</strong> vs <strong>what would have happened otherwise</strong>. The second quantity — the counterfactual — is never observed. This is the <strong>fundamental problem of causal inference</strong>.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. The question", "2. The problem", "3. The solution"].map((s, i) => (
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
        {/* Potential outcomes table */}
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>
          {step === 0 ? "Does an MBA increase a manager's salary?" : step === 1 ? "The fundamental problem: we observe only one potential outcome per person" : "The solution: find a credible comparison group"}
        </div>

        <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: "12px", fontSize: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", background: C.bg, fontWeight: 700, fontFamily: mono, color: C.txM }}>
            <div style={{ padding: "8px 10px" }}>Person</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.rose }}>Y(1): MBA</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.sam }}>Y(0): No MBA</div>
            <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.grn }}>Effect</div>
          </div>
          {[
            { name: "Alice", y1: "$140K", y0: "$95K", eff: "+$45K", treated: true },
            { name: "Bob", y1: "$125K", y0: "$110K", eff: "+$15K", treated: true },
            { name: "Carol", y1: "$105K", y0: "$80K", eff: "+$25K", treated: false },
            { name: "Dave", y1: "$160K", y0: "$130K", eff: "+$30K", treated: false },
          ].map((p, i) => {
            const showAll = step === 0;
            const showProblem = step >= 1;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
                <div style={{ padding: "8px 10px", fontWeight: 600, color: C.tx }}>{p.name}</div>
                <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, fontFamily: mono, color: showProblem && !p.treated ? C.txM : C.rose, fontWeight: showProblem && !p.treated ? 400 : 600 }}>
                  {showProblem && !p.treated ? "?" : p.y1}
                </div>
                <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, fontFamily: mono, color: showProblem && p.treated ? C.txM : C.sam, fontWeight: showProblem && p.treated ? 400 : 600 }}>
                  {showProblem && p.treated ? "?" : p.y0}
                </div>
                <div style={{ padding: "8px 10px", borderLeft: `1px solid ${C.bdr}`, fontFamily: mono, color: showAll ? C.grn : C.txM, fontWeight: showAll ? 700 : 400 }}>
                  {showAll ? p.eff : "?"}
                </div>
              </div>
            );
          })}
        </div>

        {step >= 2 && (
          <div style={{ background: C.grnBg, borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(5,150,105,0.15)" }}>
            <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong style={{ color: C.grn }}>The solution:</strong> We can't observe individual counterfactuals, but we can <em>estimate the average effect</em> if we find a comparison group that would have had similar outcomes in the absence of treatment. The quality of this comparison group determines the credibility of our causal claim. All research designs are ultimately strategies for constructing a credible counterfactual.
            </div>
          </div>
        )}
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>If we could see everything:</strong> In a hypothetical world, we'd observe each person's salary with AND without an MBA. Alice earns $140K with an MBA and would have earned $95K without — her individual treatment effect is +$45K. The average across everyone is the Average Treatment Effect (ATE). But this table is fiction — we can't observe both worlds for the same person.</>}
        {step === 1 && <><strong>The problem:</strong> Alice did the MBA — we see her $140K salary, but her "no-MBA" salary is forever unknown (?). Carol didn't — we see her $80K, but never know what she'd earn with an MBA (?). We <em>never</em> observe both potential outcomes for the same person. This isn't a data limitation — it's a logical impossibility. This is Holland's (1986) <strong>fundamental problem of causal inference</strong>.</>}
        {step === 2 && <><strong>Where research design comes in:</strong> Experiments solve this by <em>random assignment</em> — making groups statistically identical, so the control group's outcomes proxy for the counterfactual. When experiments aren't feasible, quasi-experimental designs (DiD, IV, RDD, matching) construct the counterfactual through other mechanisms. Each has tradeoffs in credibility, assumptions, and applicability.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: EXPERIMENTS
// ═══════════════════════════════════════════════════════════════════
function ExperimentsViz() {
  const [mode, setMode] = useState("rct");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Experiments are the gold standard for causal inference because randomization <strong>breaks the link</strong> between treatment and confounders. But not all experiments are created equal — and management scholars face unique constraints.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "16px" }}>
        {[
          { id: "rct", label: "Lab Experiments" },
          { id: "field", label: "Field Experiments" },
          { id: "natural", label: "Natural Experiments" },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: mode === t.id ? C.grn : C.bdr,
            background: mode === t.id ? C.grnBg : "transparent",
            color: mode === t.id ? C.grn : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {mode === "rct" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Randomization visual */}
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>How randomization creates causal identification</div>
            <svg viewBox="0 0 440 160" style={{ width: "100%", display: "block" }}>
              {/* Pool */}
              <rect x="10" y="50" width="90" height="60" rx="10" fill={C.smpBg} stroke={C.smp} strokeWidth="1.5" />
              <text x="55" y="75" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.smp} fontFamily={font}>Subject</text>
              <text x="55" y="88" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.smp} fontFamily={font}>Pool</text>

              {/* Randomize arrow */}
              <line x1="102" x2="155" y1="80" y2="55" stroke={C.smp} strokeWidth="2" markerEnd="url(#arrExp)" />
              <line x1="102" x2="155" y1="80" y2="105" stroke={C.smp} strokeWidth="2" markerEnd="url(#arrExp)" />
              <text x="142" y="78" textAnchor="middle" fontSize="9" fill={C.smp} fontFamily={font} fontWeight="700" transform="rotate(-20, 142, 78)">Random</text>

              {/* Treatment group */}
              <rect x="158" y="30" width="90" height="48" rx="8" fill={C.roseBg} stroke={C.rose} strokeWidth="1.5" />
              <text x="203" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.rose} fontFamily={font}>Treatment</text>
              <text x="203" y="64" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>gets intervention</text>

              {/* Control group */}
              <rect x="158" y="88" width="90" height="48" rx="8" fill={C.samBg} stroke={C.sam} strokeWidth="1.5" />
              <text x="203" y="108" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.sam} fontFamily={font}>Control</text>
              <text x="203" y="122" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>no intervention</text>

              {/* Outcome arrows */}
              <line x1="250" x2="300" y1="54" y2="54" stroke={C.rose} strokeWidth="1.5" markerEnd="url(#arrExp)" />
              <line x1="250" x2="300" y1="112" y2="112" stroke={C.sam} strokeWidth="1.5" markerEnd="url(#arrExp)" />

              {/* Outcomes */}
              <text x="310" y="50" fontSize="10" fill={C.rose} fontFamily={mono} fontWeight="700">Ȳ₁ = 78</text>
              <text x="310" y="108" fontSize="10" fill={C.sam} fontFamily={mono} fontWeight="700">Ȳ₀ = 62</text>

              {/* ATE */}
              <rect x="310" y="64" width="120" height="30" rx="8" fill={C.grnBg} stroke={C.grn} strokeWidth="1.5" />
              <text x="370" y="83" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grn} fontFamily={mono}>ATE = Ȳ₁ − Ȳ₀ = 16</text>

              <text x="220" y="150" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>Randomization ensures groups are comparable in expectation → simple difference = causal effect</text>

              <defs><marker id="arrExp" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="7" markerHeight="5" orient="auto"><path d="M0,0 L10,4 L0,8" fill="none" stroke={C.txD} strokeWidth="1.5" /></marker></defs>
            </svg>
          </div>

          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
            In a <strong>lab experiment</strong>, the researcher controls the environment and randomly assigns subjects to conditions. This eliminates all confounders — both observed and unobserved. The simple difference in means between treatment and control is an unbiased estimate of the causal effect.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: C.grnBg, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>Strengths</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>Maximum internal validity. Full control over treatment, environment, and measurement. Can test mechanisms precisely. Clean causal identification.</div>
            </div>
            <div style={{ background: C.roseBg, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Limitations in management</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>Low external validity (student subjects, artificial settings). Can't study firm-level outcomes. Hard to simulate real strategic decisions. Demand effects and experimenter bias. Short time horizons.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx }}>Common in management for:</div>
            {["Decision-making under uncertainty (behavioral strategy)", "Leadership and team dynamics (micro OB)", "Negotiation and bargaining", "Consumer choice and framing effects (marketing)", "Ethical decision-making"].map((e, i) => (
              <div key={i} style={{ fontSize: "12px", color: C.txB, paddingLeft: "12px", borderLeft: `2px solid ${C.grn}` }}>{e}</div>
            ))}
          </div>
        </div>
      )}

      {mode === "field" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Field experiments in management</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
              <strong>Field experiments</strong> randomize treatment in a <em>real-world setting</em> — actual firms, actual employees, actual markets. They combine the causal rigor of experiments with the external validity of observational data. They're increasingly published in top management journals (SMJ, ASQ, MS).
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {[
              { title: "A/B tests in tech firms", desc: "Randomly show different UI designs, pricing, or product features to users. Measure engagement, conversion, revenue. Massive sample sizes. The dominant method at tech companies.", example: "Google tested 41 shades of blue for ad links." },
              { title: "Management practice interventions", desc: "Randomly assign management training, incentive schemes, or organizational practices to firms or plants. Measure productivity, quality, or profitability.", example: "Bloom et al. (2013, QJE) randomly assigned management consulting to Indian textile firms — treated firms saw 17% productivity gains." },
              { title: "HR policy experiments", desc: "Randomly vary hiring practices, work-from-home policies, or performance feedback. Measure employee outcomes.", example: "Choudhury et al. (2021, SMJ) studied work-from-anywhere vs work-from-home via random assignment at a large company." },
              { title: "Audit / correspondence studies", desc: "Send identical applications or inquiries that vary only on the characteristic of interest (race, gender, firm prestige). Measure callback rates.", example: "Widely used to study discrimination in hiring, lending, and venture capital." },
            ].map((e, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.grn }}>{e.title}</div>
                <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{e.desc}</div>
                <div style={{ fontSize: "11px", color: C.txD, fontStyle: "italic", marginTop: "4px" }}>{e.example}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: C.grnBg, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>Strengths</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>High internal AND external validity. Real-world behavior and outcomes. Can study firm-level phenomena. Increasingly valued by top journals.</div>
            </div>
            <div style={{ background: C.roseBg, borderRadius: "10px", padding: "12px 14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Challenges</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>Expensive and time-consuming. Requires firm partnerships. Non-compliance (not everyone follows assignment). Ethical constraints. Hard to study rare or high-stakes events. Hawthorne effects.</div>
            </div>
          </div>
        </div>
      )}

      {mode === "natural" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Natural experiments</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
              A <strong>natural experiment</strong> occurs when some external event creates treatment variation that is <em>as if</em> randomly assigned — without the researcher's intervention. The researcher doesn't randomize; nature, policy, or accident does. These are the foundation of most quasi-experimental research in management.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {[
              { source: "Policy changes", desc: "A new regulation affects some firms/states but not others. Firms didn't choose the regulation — it was imposed on them.", example: "SOX (2002) imposed governance requirements on public firms; private firms were unaffected. Compare changes in both groups → DiD.", design: "DiD" },
              { source: "Arbitrary cutoffs", desc: "A threshold rule assigns treatment based on a continuous score. Units near the cutoff are quasi-randomly sorted.", example: "SEC disclosure requirements kick in at specific revenue thresholds. Firms just above vs just below → RDD.", design: "RDD" },
              { source: "Geographic / weather variation", desc: "Random shocks (earthquakes, hurricanes, droughts) or geographic features create exogenous variation.", example: "Rainfall as an instrument for economic growth when studying conflict (Miguel et al., 2004).", design: "IV" },
              { source: "Historical accidents", desc: "Arbitrary historical events create persistent variation that can be exploited.", example: "Colonial institutions, railroad placement, or historical boundary changes create variation in modern outcomes.", design: "IV / DiD" },
              { source: "Lottery-based assignment", desc: "Real lotteries (draft lotteries, visa lotteries, school assignment) create random variation.", example: "H-1B visa lottery: firms that win can hire foreign workers; losers can't. Compare firm outcomes → RCT-like.", design: "RCT" },
            ].map((e, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px", display: "flex", gap: "12px" }}>
                <div style={{ minWidth: "50px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: C.smp, fontFamily: mono, background: C.smpBg, padding: "2px 6px", borderRadius: "4px", textAlign: "center" }}>{e.design}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.smp }}>{e.source}</div>
                  <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{e.desc}</div>
                  <div style={{ fontSize: "11px", color: C.txD, fontStyle: "italic", marginTop: "3px" }}>{e.example}</div>
                </div>
              </div>
            ))}
          </div>

          <Ins>
            <strong>The key distinction:</strong> In a true experiment, the researcher controls randomization. In a natural experiment, nature or policy provides the variation — but the researcher must <em>argue</em> that this variation is as-if random. This argument is where quasi-experimental papers succeed or fail. Reviewers will scrutinize whether the "natural experiment" is truly exogenous.
          </Ins>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: THE CREDIBILITY HIERARCHY
// ═══════════════════════════════════════════════════════════════════
function HierarchyViz() {
  const [selected, setSelected] = useState(null);

  const designs = [
    { id: "rct", label: "Randomized Experiment", tier: 1, color: C.grn, assumption: "Randomization was properly implemented", internal: "Very high", external: "Varies (often low in lab, high in field)", management: "Lab: OB, behavioral strategy. Field: increasingly common in SMJ, MS, ASQ.", weakness: "Expensive, time-consuming, ethical constraints, Hawthorne effects." },
    { id: "rdd", label: "Regression Discontinuity", tier: 2, color: "#059669", assumption: "No manipulation of running variable; continuity at cutoff", internal: "High", external: "Low (local to cutoff)", management: "Policy thresholds, funding cutoffs, regulatory boundaries.", weakness: "Only estimates local effect at the cutoff. Requires sharp threshold." },
    { id: "did", label: "Difference-in-Differences", tier: 2, color: "#0284C7", assumption: "Parallel trends in absence of treatment", internal: "High (if parallel trends hold)", external: "Moderate (applies to treated group)", management: "The workhorse of strategy/management empirics. Policy changes, regulatory shocks.", weakness: "Parallel trends untestable. Staggered timing complicates things." },
    { id: "iv", label: "Instrumental Variables", tier: 2, color: "#7C3AED", assumption: "Relevance + exclusion restriction", internal: "High (if instrument valid)", external: "Limited (LATE for compliers)", management: "CEO compensation, R&D, governance studies.", weakness: "Exclusion restriction untestable. Weak instruments problematic." },
    { id: "matching", label: "Matching / Weighting", tier: 3, color: C.pop, assumption: "Selection on observables (CIA) — no unobserved confounders", internal: "Moderate", external: "Moderate to high", management: "M&A effects, diversification, strategic choices. Often combined with DiD.", weakness: "Cannot address unobserved confounders. Credibility depends entirely on CIA." },
    { id: "heckman", label: "Heckman Selection", tier: 3, color: C.pop, assumption: "Correct selection model + exclusion restriction", internal: "Moderate", external: "Moderate", management: "Exporting, M&A, analyst coverage — when outcome is selectively observed.", weakness: "Needs valid exclusion variable. Sensitive to distributional assumptions." },
    { id: "ols", label: "OLS with Controls", tier: 4, color: C.rose, assumption: "All confounders are observed and controlled for", internal: "Low to moderate", external: "High (full sample)", management: "Still common but increasingly insufficient for causal claims at top journals.", weakness: "Cannot address unobserved confounders. Reviewers skeptical of causal interpretation." },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Not all research designs are equally credible for causal inference. The <strong>credibility hierarchy</strong> ranks designs by the strength of their identifying assumptions. Higher = fewer (or more testable) assumptions = more believable causal claims.
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
        {/* Pyramid */}
        {[
          { tier: 1, label: "TIER 1: GOLD STANDARD", color: C.grn, ids: ["rct"] },
          { tier: 2, label: "TIER 2: QUASI-EXPERIMENTAL (STRONG)", color: C.sam, ids: ["rdd", "did", "iv"] },
          { tier: 3, label: "TIER 3: SELECTION CORRECTION", color: C.pop, ids: ["matching", "heckman"] },
          { tier: 4, label: "TIER 4: OBSERVATIONAL", color: C.rose, ids: ["ols"] },
        ].map((tier, ti) => (
          <div key={ti} style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: tier.color, fontFamily: mono, marginBottom: "4px", letterSpacing: "0.05em" }}>{tier.label}</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {designs.filter(d => tier.ids.includes(d.id)).map(d => (
                <button key={d.id} onClick={() => setSelected(selected === d.id ? null : d.id)} style={{
                  flex: 1, padding: "10px 12px", borderRadius: "8px",
                  border: `1.5px solid ${selected === d.id ? d.color : C.bdr}`,
                  background: selected === d.id ? d.color + "10" : C.bg,
                  color: selected === d.id ? d.color : C.txB,
                  fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
                }}>{d.label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (() => {
        const d = designs.find(x => x.id === selected);
        return (
          <div style={{ background: C.card, borderRadius: "12px", border: `1.5px solid ${d.color}`, padding: "16px 20px", animation: "fadeIn 0.3s ease", marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: d.color, marginBottom: "10px" }}>{d.label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
              <div><strong style={{ color: C.txD }}>Key assumption:</strong> {d.assumption}</div>
              <div><strong style={{ color: C.txD }}>Internal validity:</strong> {d.internal}</div>
              <div><strong style={{ color: C.txD }}>External validity:</strong> {d.external}</div>
              <div><strong style={{ color: C.txD }}>In management:</strong> {d.management}</div>
            </div>
            <div style={{ fontSize: "12px", color: C.rose, marginTop: "8px" }}><strong>Main weakness:</strong> {d.weakness}</div>
          </div>
        );
      })()}

      <Ins>
        <strong>This hierarchy is a guide, not a law.</strong> A well-executed DiD can be more credible than a poorly designed RCT. What matters is whether the <em>specific assumptions</em> of your chosen design are plausible for your setting. Top journals increasingly care about research design credibility — "identify, don't just regress" is the mantra of the credibility revolution.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: THREATS TO INTERNAL / EXTERNAL VALIDITY
// ═══════════════════════════════════════════════════════════════════
function ValidityViz() {
  const [mode, setMode] = useState("internal");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Every research design faces threats to validity. <strong>Internal validity</strong> asks: is the causal effect estimate correct for the study sample? <strong>External validity</strong> asks: does it generalize beyond the study?
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "internal", label: "Internal Validity", color: C.rose },
          { id: "external", label: "External Validity", color: C.sam },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: mode === t.id ? t.color : C.bdr,
            background: mode === t.id ? t.color + "08" : "transparent",
            color: mode === t.id ? t.color : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {mode === "internal" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
            A study has <strong>internal validity</strong> if the estimated effect is an unbiased measure of the true causal effect for the study sample. Threats to internal validity are reasons the estimate might be wrong.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { threat: "Omitted variable bias", desc: "An unobserved confounder affects both treatment and outcome. The most pervasive threat in observational research.", solutions: "IV, FE, DiD, RDD, matching", severity: "Very high" },
              { threat: "Reverse causality", desc: "Y causes X, not just X causing Y. E.g., does CSR improve performance, or do high-performing firms do more CSR?", solutions: "IV, DiD (timing), lagged X, Granger causality tests", severity: "High" },
              { threat: "Selection bias", desc: "Treatment and control groups differ systematically. Self-selection into treatment confounds the estimate.", solutions: "Randomization, matching, Heckman, IV", severity: "High" },
              { threat: "Measurement error", desc: "The treatment or outcome is measured with noise. In X, this biases toward zero (attenuation bias). In Y, increases variance.", solutions: "Better measures, IV (if error is classical), multiple indicators", severity: "Moderate" },
              { threat: "Attrition / survivorship", desc: "Units drop out of the sample non-randomly. Survivors are systematically different from dropouts.", solutions: "Balanced panels, Heckman, bounds analysis (Lee bounds)", severity: "Moderate" },
              { threat: "Spillovers (SUTVA violation)", desc: "Treatment of one unit affects outcomes of others. The control group is 'contaminated' by the treatment.", solutions: "Use distant controls, cluster randomization, model spillovers explicitly", severity: "Moderate" },
            ].map((t, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.rose }}>{t.threat}</div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: t.severity === "Very high" ? C.rose : t.severity === "High" ? C.pop : C.txD, fontFamily: mono }}>{t.severity}</div>
                </div>
                <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{t.desc}</div>
                <div style={{ fontSize: "11px", color: C.grn, marginTop: "4px" }}><strong>Addressed by:</strong> {t.solutions}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "external" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
            A study has <strong>external validity</strong> if its findings generalize to other populations, settings, or time periods. There's often a <strong>tradeoff</strong> — the strongest causal designs tend to have the most limited external validity.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            {[
              { threat: "Sample specificity", desc: "Lab experiments use students; field experiments use one firm; RDD estimates are local to the cutoff. Results may not apply to the broader population of interest.", question: "Would this effect hold for different firms, industries, or countries?" },
              { threat: "Context dependence", desc: "The institutional environment matters. A management practice that works in US tech firms may fail in Japanese manufacturing. Regulatory, cultural, and market conditions shape effects.", question: "Is the institutional context of this study similar to the context you care about?" },
              { threat: "Time dependence", desc: "Effects may be specific to a historical period. A policy studied in 2005 may not apply in 2025 due to technological change, market evolution, or regulatory shifts.", question: "Have conditions changed enough since this study that the findings may no longer hold?" },
              { threat: "Treatment heterogeneity", desc: "The average effect may mask large variation. An intervention helps some firms and hurts others — the ATE is misleading. LATE (from IV/RDD) applies only to compliers.", question: "Does the average effect apply to the specific subgroup you care about?" },
              { threat: "Hawthorne / novelty effects", desc: "Participants change behavior because they know they're being studied, or because the treatment is novel. Effects may dissipate when the treatment becomes routine.", question: "Would the effect persist without researcher attention or novelty?" },
            ].map((t, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.sam }}>{t.threat}</div>
                <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{t.desc}</div>
                <div style={{ fontSize: "11px", color: C.smp, fontStyle: "italic", marginTop: "4px" }}>{t.question}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.popBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(217,119,6,0.15)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.pop, marginBottom: "4px" }}>The internal-external validity tradeoff</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              The designs with the strongest internal validity (RCTs, RDD) often have the weakest external validity (lab settings, local-to-cutoff estimates). Observational studies with controls have high external validity but weak causal credibility. The best research programs combine multiple designs: a credible causal study + replication across settings + mechanisms that explain when and why the effect holds.
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
  { id: "fundamental", label: "1. The Problem" },
  { id: "experiments", label: "2. Experiments" },
  { id: "hierarchy", label: "3. Credibility Hierarchy" },
  { id: "validity", label: "4. Validity Threats" },
];

export default function ExperimentsModule() {
  const [tab, setTab] = useState("fundamental");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.roseBg, fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>CAUSAL INFERENCE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Experiments & Quasi-Experiments</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>The logic of causal inference and the credibility revolution</p>
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
        {tab === "fundamental" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="The fundamental problem of causal inference" sub="Why 'does X cause Y?' is harder than it looks" />
          <CBox title={<>🎯 Potential Outcomes & Counterfactuals</>} color={C.smp}>
            <FundamentalProblemViz />
          </CBox>
          <NBtn onClick={() => setTab("experiments")} label="Next: Experiments →" />
        </div>}

        {tab === "experiments" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Types of experiments" sub="Lab, field, and natural experiments in management research" />
          <CBox title={<>🧪 Experimental Designs</>} color={C.grn}>
            <ExperimentsViz />
          </CBox>
          <NBtn onClick={() => setTab("hierarchy")} label="Next: Credibility Hierarchy →" />
        </div>}

        {tab === "hierarchy" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="The credibility hierarchy" sub="Ranking research designs by the strength of their causal claims" />
          <Pr>Click any design to see its assumptions, strengths, and management applications:</Pr>
          <CBox title={<>🏔️ Research Design Credibility</>} color={C.smp}>
            <HierarchyViz />
          </CBox>
          <NBtn onClick={() => setTab("validity")} label="Next: Validity Threats →" />
        </div>}

        {tab === "validity" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Threats to validity" sub="What can go wrong — and the internal-external tradeoff" />

          <CBox title={<>⚠️ Internal & External Validity</>} color={C.rose}>
            <ValidityViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> The <strong>fundamental problem</strong>: we never observe both potential outcomes for the same unit. All causal inference is about constructing a credible counterfactual.<br />
              <strong>2.</strong> <strong>Randomized experiments</strong> (lab and field) are the gold standard because randomization eliminates all confounders. Field experiments are increasingly published in top management journals.<br />
              <strong>3.</strong> <strong>Natural experiments</strong> exploit external variation (policy changes, cutoffs, shocks) that is "as-if random." They power most quasi-experimental research designs (DiD, IV, RDD).<br />
              <strong>4.</strong> The <strong>credibility hierarchy</strong>: RCTs {">"} RDD / DiD / IV {">"} Matching / Heckman {">"} OLS with controls. But execution matters more than design choice — a well-done DiD beats a sloppy RCT.<br />
              <strong>5.</strong> <strong>Internal vs external validity tradeoff:</strong> the most credible designs (RDD, lab RCTs) often have the weakest generalizability. The best research programs combine credible identification with replication across contexts.<br />
              <strong>6.</strong> The <strong>credibility revolution</strong> in management: top journals increasingly demand quasi-experimental designs for causal claims. "Identify, don't just regress."
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
