import { useState } from "react";

const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
  sh: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  pop: "#D97706", popBg: "rgba(217,119,6,0.06)",
  sam: "#0284C7", samBg: "rgba(2,132,199,0.06)",
  smp: "#7C3AED", smpBg: "rgba(124,58,237,0.05)",
  grn: "#059669", grnBg: "rgba(5,150,105,0.06)",
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)",
  tx: "#1E293B", txB: "#334155", txD: "#64748B", txM: "#94A3B8",
};
const font = "'DM Sans', sans-serif";
const mono = "'DM Mono', monospace";
const serif = "'Source Serif 4', serif";

const METHODS = [
  { id: "ols", name: "OLS Regression", module: 5, cat: "Foundations", color: C.sam, cred: "Low-Moderate", best: "Descriptive relationships, well-controlled settings", handles: "Observable confounders only", stata: "reg y x1 x2 x3, robust", warn: "Cannot handle unobserved confounders." },
  { id: "logit", name: "Logit / Probit", module: 6, cat: "Foundations", color: C.sam, cred: "Low-Moderate", best: "Binary DV (entry, survival, adoption)", handles: "Binary outcomes + observable confounders", stata: "logit y x1 x2 x3, robust", warn: "Same endogeneity concerns as OLS." },
  { id: "count", name: "Count Models", module: 7, cat: "Foundations", color: C.sam, cred: "Low-Moderate", best: "Count DV (patents, alliances, citations)", handles: "Count outcomes", stata: "nbreg y x1 x2 x3, robust", warn: "Choose Poisson vs NB based on overdispersion." },
  { id: "fe", name: "Panel FE / RE", module: 10, cat: "Panel", color: C.smp, cred: "Moderate", best: "Panel data with time-invariant confounders", handles: "Time-invariant unobserved confounders", stata: "reghdfe y x1 x2, absorb(firm year)", warn: "FE cannot estimate time-invariant predictors." },
  { id: "hlm", name: "Multilevel / HLM", module: 11, cat: "Panel", color: C.smp, cred: "Moderate", best: "Nested data (employees in firms)", handles: "Group-level variation", stata: "mixed y x1 x2 || firm:", warn: "Does not solve endogeneity on its own." },
  { id: "did", name: "Difference-in-Differences", module: 13, cat: "Causal", color: C.rose, cred: "High", best: "Policy change affecting some units but not others", handles: "Time-invariant + common-trend confounders", stata: "reghdfe y treated#post, absorb(firm year)", warn: "Requires parallel trends assumption." },
  { id: "iv", name: "Instrumental Variables", module: 14, cat: "Causal", color: C.rose, cred: "High (if valid)", best: "When you have a credible instrument for X", handles: "Unobserved confounders via exclusion", stata: "ivregress 2sls y (x = z), first robust", warn: "Exclusion restriction is untestable." },
  { id: "rdd", name: "Regression Discontinuity", module: 15, cat: "Causal", color: C.rose, cred: "Very High", best: "Treatment assigned by a threshold rule", handles: "All confounders near cutoff", stata: "rdrobust y running_var, c(50)", warn: "Local estimate only at the cutoff." },
  { id: "matching", name: "Matching / Weighting", module: 16, cat: "Causal", color: C.rose, cred: "Moderate", best: "Selection driven by observables", handles: "Observable confounders only", stata: "teffects psmatch (y) (treat x1 x2)", warn: "Cannot handle unobserved confounders." },
  { id: "heckman", name: "Heckman Selection", module: 17, cat: "Causal", color: C.rose, cred: "Moderate", best: "DV observed only for a self-selected subset", handles: "Non-random sample selection", stata: "heckman y x1 x2, select(d = w1 w2 excl)", warn: "Needs exclusion restriction." },
  { id: "synth", name: "Synthetic Control", module: 19, cat: "Advanced", color: C.smp, cred: "High", best: "One treated unit, many pre-treatment periods", handles: "Single-unit causal inference", stata: "synth outcome pred, trunit(1) trperiod(2012)", warn: "Requires good pre-treatment fit." },
  { id: "survival", name: "Survival / Duration", module: 20, cat: "Advanced", color: C.smp, cred: "Varies", best: "Time-to-event (failure, exit, adoption)", handles: "Censored duration data", stata: "stcox x1 x2", warn: "Cox PH assumes proportional hazards." },
  { id: "qca", name: "QCA", module: 21, cat: "Advanced", color: C.smp, cred: "Different paradigm", best: "Causes combine in recipes, small-medium N", handles: "Configurational causation", stata: "fsQCA software / R: QCA", warn: "Not for estimating net effects." },
  { id: "ml", name: "AI / ML Methods", module: 22, cat: "Advanced", color: C.smp, cred: "For prediction: High", best: "Prediction, NLP measurement, heterogeneity", handles: "Complex patterns, text data", stata: "Python: sklearn | R: caret", warn: "Does NOT solve endogeneity." },
];

function getMethod(id) {
  return METHODS.find(function(m) { return m.id === id; });
}

function MethodCard({ methodId, note }) {
  const m = getMethod(methodId);
  if (!m) return null;
  return (
    <div style={{ background: C.card, borderRadius: "16px", border: "2px solid " + m.color, padding: "20px 24px", boxShadow: C.sh, marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: m.color, fontFamily: serif }}>{m.name}</div>
          <div style={{ fontSize: "12px", color: C.txD }}>{m.cat} | Module {m.module}</div>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: m.color, background: m.color + "10", padding: "4px 10px", borderRadius: "6px", fontFamily: mono }}>{m.cred}</div>
      </div>
      {note && <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", marginBottom: "10px", fontSize: "13px", color: C.txB }}><strong style={{ color: C.grn }}>Note: </strong>{note}</div>}
      <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", marginBottom: "6px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono }}>BEST FOR</div>
        <div style={{ fontSize: "12.5px", color: C.txB }}>{m.best}</div>
      </div>
      <div style={{ background: C.samBg, borderRadius: "8px", padding: "10px 14px", marginBottom: "6px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, fontFamily: mono }}>HANDLES</div>
        <div style={{ fontSize: "12.5px", color: C.txB }}>{m.handles}</div>
      </div>
      <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", marginBottom: "6px", border: "1px solid " + C.bdr }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.txD, fontFamily: mono }}>STATA</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono }}>{m.stata}</div>
      </div>
      <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono }}>WATCH OUT</div>
        <div style={{ fontSize: "12.5px", color: C.txB }}>{m.warn}</div>
      </div>
    </div>
  );
}

function Btn({ selected, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? C.smpBg : C.card,
      borderRadius: "10px",
      border: "1.5px solid " + (selected ? C.smp : C.bdr),
      padding: "12px 16px",
      cursor: "pointer",
      textAlign: "left",
      fontSize: "13px",
      fontWeight: selected ? 600 : 400,
      color: selected ? C.smp : C.txB,
      fontFamily: font,
      width: "100%",
      marginBottom: "6px",
    }}>{children}</button>
  );
}

function DecisionTree() {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);

  const reset = () => { setQ1(null); setQ2(null); setQ3(null); };

  let result = null;
  let note = null;
  let alts = [];

  // Q1 direct results
  if (q1 === "predict") { result = "ml"; alts = ["ols", "logit"]; }
  if (q1 === "config") { result = "qca"; alts = ["ols"]; }
  if (q1 === "nested") { result = "hlm"; alts = ["fe"]; }

  // Q2 direct results (causal path)
  if (q1 === "causal" && q2 === "threshold") { result = "rdd"; alts = ["iv", "did"]; }
  if (q1 === "causal" && q2 === "instrument") { result = "iv"; alts = ["did", "rdd"]; }

  // Q2 direct results (describe path)
  if (q1 === "describe" && q2 === "cont") { result = "ols"; alts = ["fe"]; }
  if (q1 === "describe" && q2 === "binary") { result = "logit"; alts = ["ols"]; }
  if (q1 === "describe" && q2 === "countdv") { result = "count"; alts = ["logit"]; }
  if (q1 === "describe" && q2 === "duration") { result = "survival"; alts = ["logit"]; }
  if (q1 === "describe" && q2 === "selection") { result = "heckman"; alts = ["matching"]; }

  // Q3 results (causal sub-paths)
  if (q1 === "causal" && q2 === "shock" && q3 === "many") { result = "did"; alts = ["synth", "fe"]; }
  if (q1 === "causal" && q2 === "shock" && q3 === "one") { result = "synth"; alts = ["did"]; }
  if (q1 === "causal" && q2 === "randomize" && q3 === "full") { result = "ols"; note = "Simple difference in means with treatment dummy."; alts = []; }
  if (q1 === "causal" && q2 === "randomize" && q3 === "partial") { result = "iv"; note = "Use assignment as instrument for actual treatment."; alts = ["did"]; }
  if (q1 === "causal" && q2 === "observables" && q3 === "panel") { result = "fe"; note = "Consider combining FE with matching."; alts = ["did", "hlm"]; }
  if (q1 === "causal" && q2 === "observables" && q3 === "cross") { result = "matching"; alts = ["heckman", "ols"]; }

  return (
    <div>
      {/* Q1: Goal */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>What is your primary research goal?</div>
        <Btn selected={q1 === "causal"} onClick={() => { setQ1("causal"); setQ2(null); setQ3(null); }}>Estimate a causal effect</Btn>
        <Btn selected={q1 === "describe"} onClick={() => { setQ1("describe"); setQ2(null); setQ3(null); }}>Describe a relationship (not necessarily causal)</Btn>
        <Btn selected={q1 === "predict"} onClick={() => { setQ1("predict"); setQ2(null); setQ3(null); }}>Predict an outcome</Btn>
        <Btn selected={q1 === "config"} onClick={() => { setQ1("config"); setQ2(null); setQ3(null); }}>Find configurations / recipes for an outcome</Btn>
        <Btn selected={q1 === "nested"} onClick={() => { setQ1("nested"); setQ2(null); setQ3(null); }}>Account for nested / hierarchical data</Btn>
      </div>

      {/* Q2: Causal path */}
      {q1 === "causal" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>What identifies the causal effect?</div>
          <Btn selected={q2 === "shock"} onClick={() => { setQ2("shock"); setQ3(null); }}>A policy/shock hit some units but not others</Btn>
          <Btn selected={q2 === "threshold"} onClick={() => { setQ2("threshold"); setQ3(null); }}>Treatment assigned by a score/threshold</Btn>
          <Btn selected={q2 === "instrument"} onClick={() => { setQ2("instrument"); setQ3(null); }}>I have an instrumental variable</Btn>
          <Btn selected={q2 === "randomize"} onClick={() => { setQ2("randomize"); setQ3(null); }}>I can randomize treatment</Btn>
          <Btn selected={q2 === "observables"} onClick={() => { setQ2("observables"); setQ3(null); }}>No experiment; selection on observables</Btn>
        </div>
      )}

      {/* Q2: Describe path */}
      {q1 === "describe" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>What type is your dependent variable?</div>
          <Btn selected={q2 === "cont"} onClick={() => setQ2("cont")}>Continuous (revenue, ROA, productivity)</Btn>
          <Btn selected={q2 === "binary"} onClick={() => setQ2("binary")}>Binary (0/1: entry, survival, adoption)</Btn>
          <Btn selected={q2 === "countdv"} onClick={() => setQ2("countdv")}>Count (patents, alliances, citations)</Btn>
          <Btn selected={q2 === "duration"} onClick={() => setQ2("duration")}>Time-to-event (how long until...?)</Btn>
          <Btn selected={q2 === "selection"} onClick={() => setQ2("selection")}>Only observed for a subset (selection)</Btn>
        </div>
      )}

      {/* Q3: Shock sub */}
      {q1 === "causal" && q2 === "shock" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>How many treated units do you have?</div>
          <Btn selected={q3 === "many"} onClick={() => setQ3("many")}>Many treated units</Btn>
          <Btn selected={q3 === "one"} onClick={() => setQ3("one")}>One (or very few) treated units</Btn>
        </div>
      )}

      {/* Q3: Randomize sub */}
      {q1 === "causal" && q2 === "randomize" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>Is there full compliance with random assignment?</div>
          <Btn selected={q3 === "full"} onClick={() => setQ3("full")}>Yes, full compliance</Btn>
          <Btn selected={q3 === "partial"} onClick={() => setQ3("partial")}>No, some non-compliance</Btn>
        </div>
      )}

      {/* Q3: Observables sub */}
      {q1 === "causal" && q2 === "observables" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>Do you have panel data (multiple time periods)?</div>
          <Btn selected={q3 === "panel"} onClick={() => setQ3("panel")}>Yes, panel data</Btn>
          <Btn selected={q3 === "cross"} onClick={() => setQ3("cross")}>No, cross-sectional</Btn>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn, fontFamily: mono, letterSpacing: "0.05em", marginBottom: "10px", marginTop: "8px" }}>RECOMMENDED METHOD</div>
          <MethodCard methodId={result} note={note} />
          {alts.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.txD, marginBottom: "6px" }}>Also consider:</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {alts.map(function(altId) {
                  const am = getMethod(altId);
                  if (!am) return null;
                  return <span key={altId} style={{ fontSize: "11px", fontWeight: 600, color: am.color, background: am.color + "10", padding: "4px 10px", borderRadius: "6px" }}>{am.name} (Mod. {am.module})</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {q1 && (
        <button onClick={reset} style={{
          marginTop: "12px", padding: "8px 18px", borderRadius: "8px",
          border: "1.5px solid " + C.bdr, background: C.card, color: C.txD,
          fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
        }}>Start over</button>
      )}
    </div>
  );
}

function ComparisonTable() {
  const [filter, setFilter] = useState("all");
  const cats = ["all", "Foundations", "Panel", "Causal", "Advanced"];
  const filtered = filter === "all" ? METHODS : METHODS.filter(function(m) { return m.cat === filter; });

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>All 14 methods side by side. Filter by category:</div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
        {cats.map(function(c) {
          return (
            <button key={c} onClick={function() { setFilter(c); }} style={{
              padding: "6px 14px", borderRadius: "8px",
              border: "1.5px solid " + (filter === c ? C.smp : C.bdr),
              background: filter === c ? C.smpBg : "transparent",
              color: filter === c ? C.smp : C.txD,
              fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
            }}>{c === "all" ? "All" : c}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map(function(m) {
          return (
            <div key={m.id} style={{ background: C.card, borderRadius: "10px", border: "1px solid " + C.bdr, padding: "12px 16px", boxShadow: C.sh }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: m.color }}>{m.name}</div>
                <span style={{ fontSize: "10px", fontWeight: 600, color: m.color, background: m.color + "10", padding: "2px 8px", borderRadius: "4px", fontFamily: mono }}>{m.cred}</span>
              </div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>
                <span style={{ color: C.grn, fontWeight: 600 }}>Best for: </span>{m.best}
              </div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6, marginTop: "2px" }}>
                <span style={{ color: C.rose, fontWeight: 600 }}>Watch out: </span>{m.warn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickLookup() {
  const scenarios = [
    { q: "I have panel data and a policy shock", p: "did", a: ["fe"] },
    { q: "I want causal effect but cannot randomize", p: "iv", a: ["did", "rdd"] },
    { q: "My DV is only observed for some firms", p: "heckman", a: [] },
    { q: "Treatment assigned by a score cutoff", p: "rdd", a: [] },
    { q: "One treated country/state/firm", p: "synth", a: ["did"] },
    { q: "My DV is a count (patents, alliances)", p: "count", a: ["ols"] },
    { q: "Time until an event (failure, exit)", p: "survival", a: ["logit"] },
    { q: "Predict which startups will fail", p: "ml", a: ["logit"] },
    { q: "Causes combine in recipes", p: "qca", a: [] },
    { q: "Employees nested in firms", p: "hlm", a: ["fe"] },
    { q: "Staggered treatment timing", p: "did", a: [], n: "Use Callaway and Sant Anna" },
    { q: "X and Y simultaneously determined", p: "iv", a: [] },
    { q: "Find heterogeneous treatment effects", p: "ml", a: [], n: "Causal forests with credible experiment" },
    { q: "Control for observable confounders", p: "matching", a: ["ols", "fe"] },
    { q: "Measure sentiment from earnings calls", p: "ml", a: [] },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>Common research scenarios and which methods to use:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {scenarios.map(function(s, i) {
          const pm = getMethod(s.p);
          return (
            <div key={i} style={{ background: C.card, borderRadius: "10px", border: "1px solid " + C.bdr, padding: "12px 16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: C.tx, marginBottom: "6px" }}>{s.q}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {pm && <span style={{ fontSize: "11px", fontWeight: 700, color: pm.color, background: pm.color + "10", padding: "3px 10px", borderRadius: "5px" }}>{pm.name}</span>}
                {s.a.map(function(altId) {
                  const am = getMethod(altId);
                  return am ? <span key={altId} style={{ fontSize: "11px", color: C.txD, background: C.bg, padding: "3px 10px", borderRadius: "5px", border: "1px solid " + C.bdr }}>{am.name}</span> : null;
                })}
              </div>
              {s.n && <div style={{ fontSize: "11px", color: C.txD, fontStyle: "italic", marginTop: "4px" }}>{s.n}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MethodChooserModule() {
  const [tab, setTab] = useState("tree");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap');`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.popBg, fontSize: "11px", fontWeight: 700, color: C.pop, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>TOOLKIT</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Method Chooser</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Answer a few questions to find the right method for your research</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "28px" }}>
        {["tree", "compare", "lookup"].map(function(t) {
          const labels = { tree: "Decision Tree", compare: "Compare Methods", lookup: "Quick Lookup" };
          return (
            <button key={t} onClick={function() { setTab(t); }} style={{
              padding: "10px 16px", borderRadius: "10px",
              border: "1.5px solid " + (tab === t ? C.pop : C.bdr),
              background: tab === t ? C.popBg : "transparent",
              color: tab === t ? C.pop : C.txD,
              fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
            }}>{labels[t]}</button>
          );
        })}
      </div>

      {tab === "tree" && (
        <div style={{ background: C.card, borderRadius: "14px", border: "1px solid " + C.bdr, padding: "22px 24px", boxShadow: C.sh }}>
          <DecisionTree />
        </div>
      )}

      {tab === "compare" && (
        <div style={{ background: C.card, borderRadius: "14px", border: "1px solid " + C.bdr, padding: "22px 24px", boxShadow: C.sh }}>
          <ComparisonTable />
        </div>
      )}

      {tab === "lookup" && (
        <div style={{ background: C.card, borderRadius: "14px", border: "1px solid " + C.bdr, padding: "22px 24px", boxShadow: C.sh }}>
          <QuickLookup />
        </div>
      )}
    </div>
  );
}
