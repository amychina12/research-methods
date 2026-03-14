import { useState } from "react";

// ─── Colors ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
  sh: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  pop: "#D97706", popBg: "rgba(217,119,6,0.06)",
  sam: "#0284C7", samBg: "rgba(2,132,199,0.06)",
  smp: "#7C3AED", smpBg: "rgba(124,58,237,0.05)",
  grn: "#059669", grnBg: "rgba(5,150,105,0.06)",
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)",
  tx: "#1E293B", txB: "#334155", txD: "#64748B", txM: "#94A3B8",
  grid: "rgba(148,163,184,0.12)",
};
const font = "'DM Sans', sans-serif", mono = "'DM Mono', monospace", serif = "'Source Serif 4', serif";

// ─── Shared ──────────────────────────────────────────────────────
function SH({ number, title, sub }) {
  return (<div style={{ marginBottom: "22px" }}>
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.pop, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }

// ═══════════════════════════════════════════════════════════════════
// PRINCIPLE 1: SIGNAL & NOISE
// ═══════════════════════════════════════════════════════════════════
function SignalNoiseViz() {
  return (
    <div>
      <div style={{ fontSize: "15px", color: C.txB, lineHeight: 1.85, fontFamily: serif }}>
        At the deepest level, every method you have learned is trying to do one thing: <strong>separate signal from noise</strong>.
      </div>

      <div style={{ margin: "20px 0", padding: "24px 28px", background: C.card, borderRadius: "16px", border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
        <div style={{ fontSize: "22px", fontFamily: serif, fontWeight: 700, textAlign: "center", color: C.tx, lineHeight: 1.4, marginBottom: "16px" }}>
          Y<sub style={{ fontSize: "14px" }}>observed</sub> = <span style={{ color: C.grn }}>f(truth)</span> + <span style={{ color: C.rose }}>ε(everything else)</span>
        </div>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          This single equation is the DNA of all quantitative research. The <span style={{ color: C.grn, fontWeight: 600 }}>green term</span> is the pattern you're looking for — a causal effect, a predictive relationship, a structural truth about the world. The <span style={{ color: C.rose, fontWeight: 600 }}>red term</span> is everything that gets in the way — random variation, measurement error, confounders, selection, chance.
        </div>
      </div>

      <div style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.85, fontFamily: serif, marginBottom: "16px" }}>
        Every method is a different strategy for making the green term visible through the red noise:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { method: "Sampling theory", insight: "If we draw randomly, idiosyncratic noise cancels out and the truth emerges in the average.", color: C.smp },
          { method: "Regression", insight: "Project the data onto a lower-dimensional surface. What's on the surface is signal; what's off it is residual.", color: C.sam },
          { method: "Fixed effects", insight: "Subtract away everything that's constant within a unit. What's left is within-unit signal.", color: C.sam },
          { method: "DiD / IV / RDD", insight: "Find a source of variation that only moves the signal, not the noise. Isolate it.", color: C.rose },
          { method: "Matching", insight: "Make treated and control look identical on everything but the treatment. The remaining difference is signal.", color: C.rose },
          { method: "ML / prediction", insight: "Let the algorithm find any pattern — signal or not — that predicts. Regularize to avoid memorizing noise.", color: C.smp },
        ].map((m, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ minWidth: "120px", fontSize: "12px", fontWeight: 700, color: m.color, fontFamily: mono, paddingTop: "2px" }}>{m.method}</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.65, fontFamily: serif }}>{m.insight}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", padding: "18px 22px", background: C.popBg, borderRadius: "12px", border: "1px solid rgba(217,119,6,0.15)" }}>
        <div style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          <strong style={{ color: C.pop }}>The humbling truth:</strong> Signal and noise are not properties of the data — they're properties of <em>the question you're asking</em>. One researcher's noise is another's signal. The fixed effect you "absorb away" might be the very thing a different study is trying to estimate. The method doesn't find truth in the data; it reflects the truth you were willing to assume.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRINCIPLE 2: COUNTERFACTUALS
// ═══════════════════════════════════════════════════════════════════
function CounterfactualViz() {
  return (
    <div>
      <div style={{ fontSize: "15px", color: C.txB, lineHeight: 1.85, fontFamily: serif }}>
        Every causal question is, at its heart, a question about a world that doesn't exist.
      </div>

      <div style={{ margin: "20px 0", padding: "24px 28px", background: C.card, borderRadius: "16px", border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
        <div style={{ fontSize: "18px", fontFamily: serif, fontWeight: 700, textAlign: "center", color: C.tx, lineHeight: 1.5, marginBottom: "12px" }}>
          "What would have happened if things had been different?"
        </div>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          This is the question that unifies everything in causal inference. The effect of the MBA is the difference between the salary you earned and the salary you <em>would have</em> earned without it. The effect of the policy is the difference between what happened and what <em>would have</em> happened without the policy. We never observe the counterfactual. Every method is a different way of <strong>imagining it into existence</strong>.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { method: "Experiment", how: "Randomly assigns some to treatment and others to control. The control group's outcome IS the counterfactual — because randomization makes them exchangeable.", metaphor: "Creating a parallel universe by coin flip." },
          { method: "DiD", how: "Uses the control group's change over time as the counterfactual change for the treated group. Assumes they would have moved in parallel.", metaphor: "Looking at your neighbor's trajectory and imagining yours would have been the same." },
          { method: "RDD", how: "Units just below the cutoff are the counterfactual for units just above. Their proximity makes them near-identical.", metaphor: "Your twin who scored one point lower on the exam." },
          { method: "IV", how: "Isolates variation in treatment that's driven by an exogenous instrument. The counterfactual is: what if the instrument had pushed you to a different treatment level?", metaphor: "Your doctor happened to prescribe a different dose." },
          { method: "Synthetic control", how: "Constructs a weighted blend of untreated units to approximate what the treated unit would have looked like without treatment.", metaphor: "Building a doppelgänger from pieces of other people's lives." },
          { method: "Matching", how: "Finds untreated units that look like the treated ones on observables. Their outcomes proxy for the counterfactual.", metaphor: "Finding your statistical twin who made the other choice." },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px 18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.pop, marginBottom: "4px" }}>{m.method}</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, fontFamily: serif }}>{m.how}</div>
            <div style={{ fontSize: "12.5px", color: C.txD, fontStyle: "italic", marginTop: "6px", fontFamily: serif }}>Metaphor: {m.metaphor}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", padding: "18px 22px", background: C.popBg, borderRadius: "12px", border: "1px solid rgba(217,119,6,0.15)" }}>
        <div style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          <strong style={{ color: C.pop }}>The philosophical core:</strong> Causation lives in the gap between what is and what might have been. We can never see this gap directly — we can only infer it. The credibility of a causal claim is exactly the credibility of the counterfactual it rests on. When a reviewer asks "is this result causal?", they're really asking: "do I believe your counterfactual?"
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRINCIPLE 3: NO FREE LUNCH
// ═══════════════════════════════════════════════════════════════════
function NoFreeLunchViz() {
  return (
    <div>
      <div style={{ fontSize: "15px", color: C.txB, lineHeight: 1.85, fontFamily: serif }}>
        Every method buys something by giving something up. There is no design that gives you everything. Understanding these tradeoffs is the mark of methodological maturity.
      </div>

      <div style={{ margin: "20px 0", background: C.card, borderRadius: "16px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "12px", fontFamily: serif }}>The five fundamental tradeoffs</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            {
              left: "Internal validity", right: "External validity",
              tension: "The most credible designs (lab experiments, RDD) apply to the narrowest populations. The broadest studies (cross-country OLS) have the weakest causal claims. You can rarely have both.",
              color: C.rose,
            },
            {
              left: "Bias", right: "Variance",
              tension: "Using more data (wider bandwidth, more controls) reduces variance but may introduce bias. Using less data (narrow window, exact matching) reduces bias but increases noise. The optimal point depends on your loss function.",
              color: C.sam,
            },
            {
              left: "Transparency", right: "Flexibility",
              tension: "Simple models (OLS, DiD) are easy to understand and audit. Complex models (ML, structural estimation) capture more patterns but are harder to scrutinize. Peer review rewards transparency; prediction rewards flexibility.",
              color: C.smp,
            },
            {
              left: "Assumptions", right: "Data demands",
              tension: "Fewer assumptions (experiments) require more control (randomization, compliance). Fewer data demands (OLS) require stronger assumptions (no unobserved confounders). You pay in one currency or the other.",
              color: C.grn,
            },
            {
              left: "Precision", right: "Credibility",
              tension: "A well-powered OLS gives a precise estimate with a tight confidence interval. An IV gives a noisy but credible estimate. Which matters more — knowing the effect is between 0.3 and 0.5, or knowing it's real?",
              color: C.pop,
            },
          ].map((t, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: t.color }}>{t.left}</div>
                <div style={{ fontSize: "13px", color: C.txM }}>⟷</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: t.color }}>{t.right}</div>
              </div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, fontFamily: serif }}>{t.tension}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "16px", padding: "18px 22px", background: C.popBg, borderRadius: "12px", border: "1px solid rgba(217,119,6,0.15)" }}>
        <div style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          <strong style={{ color: C.pop }}>The deeper point:</strong> There is no assumption-free method. OLS assumes no omitted variables. IV assumes exclusion. DiD assumes parallel trends. Matching assumes selection on observables. Even experiments assume compliance and SUTVA. The question is never "does this method have assumptions?" — it's "are these particular assumptions defensible for this particular question in this particular context?"
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRINCIPLE 4: THE MAP AND THE TERRITORY
// ═══════════════════════════════════════════════════════════════════
function MapTerritoryViz() {
  return (
    <div>
      <div style={{ fontSize: "15px", color: C.txB, lineHeight: 1.85, fontFamily: serif }}>
        "All models are wrong, but some are useful." George Box said this in 1976 and it remains the most important sentence in statistics. But the full wisdom goes deeper than most people realize.
      </div>

      <div style={{ margin: "20px 0", padding: "24px 28px", background: C.card, borderRadius: "16px", border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              insight: "A model is a map, not the territory.",
              explain: "A map of London is not London. It simplifies, omits, and distorts — on purpose. A regression is the same: Y = βX + ε doesn't claim the world is linear. It claims that a linear approximation captures something useful. The residual ε isn't a failure — it's the acknowledgment that the map is deliberately incomplete.",
              color: C.sam,
            },
            {
              insight: "The goal is not truth — it's useful reduction.",
              explain: "A model with 500 parameters might fit the data perfectly. But it would tell you nothing. The power of a model is what it leaves out. β = 0.35 is useful precisely because it compresses a thousand data points into a single actionable number. Simplification is not a weakness — it's the point.",
              color: C.grn,
            },
            {
              insight: "Different maps serve different purposes.",
              explain: "A subway map and a topographic map of the same city look nothing alike — and both are correct. OLS, QCA, and survival analysis are different maps of the same organizational reality. They're not competing — they're answering different questions. Asking 'which method is best?' is like asking 'which map is best?' without knowing where you're going.",
              color: C.smp,
            },
            {
              insight: "The danger is forgetting it's a map.",
              explain: "When we reify the model — when β becomes 'the effect' rather than 'our estimate of the effect under these assumptions' — we lose the intellectual humility that makes science self-correcting. The p < 0.05 is not a proof. The coefficient is not a fact. They are provisional claims about a world that's richer than our models can capture.",
              color: C.rose,
            },
          ].map((i, idx) => (
            <div key={idx}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: i.color, fontFamily: serif, marginBottom: "6px" }}>{i.insight}</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8, fontFamily: serif, paddingLeft: "16px", borderLeft: `3px solid ${i.color}22` }}>{i.explain}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "16px", padding: "18px 22px", background: C.popBg, borderRadius: "12px", border: "1px solid rgba(217,119,6,0.15)" }}>
        <div style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, fontFamily: serif }}>
          <strong style={{ color: C.pop }}>A parting thought:</strong> The 22 modules before this one gave you tools. But tools don't make a craftsperson — judgment does. The best empirical researchers are not the ones who know the most methods. They're the ones who know which method to reach for, which assumptions they can defend, what their estimates do and don't tell them, and — most importantly — when to say "I don't know." That intellectual honesty, more than any technique, is what makes good science.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "signal", label: "Signal & Noise" },
  { id: "counter", label: "Counterfactuals" },
  { id: "tradeoffs", label: "No Free Lunch" },
  { id: "map", label: "Map & Territory" },
];

export default function GrandPrinciplesModule() {
  const [tab, setTab] = useState("signal");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.popBg, fontSize: "11px", fontWeight: 700, color: C.pop, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>EPILOGUE</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>The Grand Principles</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>What all of this is really about — beneath the formulas</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", borderRadius: "10px", border: "1.5px solid",
            borderColor: tab === t.id ? C.pop : C.bdr,
            background: tab === t.id ? C.popBg : "transparent",
            color: tab === t.id ? C.pop : C.txD,
            fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      <div>
        {tab === "signal" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="I" title="Everything is signal and noise" sub="The one equation that underlies all of statistics" />
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
            <SignalNoiseViz />
          </div>
          <NBtn onClick={() => setTab("counter")} label="Next: Counterfactuals →" />
        </div>}

        {tab === "counter" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="II" title="Causation is about worlds that don't exist" sub="Every method is a different way of imagining the counterfactual" />
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
            <CounterfactualViz />
          </div>
          <NBtn onClick={() => setTab("tradeoffs")} label="Next: No Free Lunch →" />
        </div>}

        {tab === "tradeoffs" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="III" title="There is no free lunch" sub="Every method buys something by giving something up" />
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
            <NoFreeLunchViz />
          </div>
          <NBtn onClick={() => setTab("map")} label="Next: Map & Territory →" />
        </div>}

        {tab === "map" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="IV" title="The map is not the territory" sub="All models are wrong, but some are useful — and knowing the difference is wisdom" />
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
            <MapTerritoryViz />
          </div>

          {/* Final closing */}
          <div style={{ marginTop: "32px", padding: "28px", borderRadius: "16px", background: `linear-gradient(135deg, ${C.popBg}, ${C.smpBg})`, border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "18px", fontFamily: serif, fontWeight: 700, color: C.tx, textAlign: "center", marginBottom: "14px" }}>
              The journey in four sentences
            </div>
            <div style={{ fontSize: "15px", fontFamily: serif, color: C.txB, lineHeight: 2.0, textAlign: "center" }}>
              <strong style={{ color: C.smp }}>I.</strong> The world speaks to us through data, but always with noise mixed in.<br />
              <strong style={{ color: C.rose }}>II.</strong> To know what caused what, we must imagine a world that never was.<br />
              <strong style={{ color: C.grn }}>III.</strong> Every tool for doing this demands something in return — there is no free lunch.<br />
              <strong style={{ color: C.pop }}>IV.</strong> The wisest researchers know that their models are maps — useful, provisional, and never the final word.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
