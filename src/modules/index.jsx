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

const CATEGORIES = [
  {
    name: "Statistical Reasoning", color: C.smp, bg: C.smpBg, tag: "STAT",
    desc: "Build intuition for randomness, inference, and uncertainty",
    modules: [
      { num: 1, title: "Sampling Distributions", file: "sampling-distributions", hint: "CLT, law of large numbers" },
      { num: 2, title: "Hypothesis Testing", file: "hypothesis-testing", hint: "p-values, Type I & II errors" },
      { num: 3, title: "Confidence Intervals", file: "confidence-intervals", hint: "Interval estimation, coverage" },
      { num: 4, title: "Bayesian Thinking", file: "bayesian-thinking", hint: "Priors, posteriors, updating" },
    ],
  },
  {
    name: "Foundations", color: C.sam, bg: C.samBg, tag: "FOUND",
    desc: "The core regression toolkit for empirical research",
    modules: [
      { num: 5, title: "OLS Regression", file: "ols-regression", hint: "Coefficients, R-squared, residuals" },
      { num: 6, title: "Logit & Probit", file: "logit-probit", hint: "Binary outcomes, odds ratios" },
      { num: 7, title: "Count Models", file: "count-models", hint: "Poisson, negative binomial" },
    ],
  },
  {
    name: "Mechanisms", color: C.grn, bg: C.grnBg, tag: "MECH",
    desc: "How and when effects operate",
    modules: [
      { num: 8, title: "Moderation", file: "moderation", hint: "Interaction effects, simple slopes" },
      { num: 9, title: "Mediation", file: "mediation", hint: "Indirect effects, bootstrapping" },
    ],
  },
  {
    name: "Panel & Multilevel", color: C.smp, bg: C.smpBg, tag: "PANEL",
    desc: "Exploiting the structure of repeated and nested observations",
    modules: [
      { num: 10, title: "Panel Data", file: "panel-data", hint: "Fixed & random effects, Hausman" },
      { num: 11, title: "Multilevel / HLM", file: "multilevel-hlm", hint: "Random intercepts, ICC, nesting" },
    ],
  },
  {
    name: "Causal Inference", color: C.rose, bg: C.roseBg, tag: "CAUSAL",
    desc: "The credibility revolution: designs for identifying causal effects",
    modules: [
      { num: 12, title: "Endogeneity", file: "endogeneity", hint: "OVB, reverse causality, solutions" },
      { num: 13, title: "Difference-in-Differences", file: "did", hint: "Parallel trends, event studies" },
      { num: 14, title: "Instrumental Variables", file: "instrumental-variables", hint: "2SLS, relevance, exclusion" },
      { num: 15, title: "Regression Discontinuity", file: "rdd", hint: "Sharp/fuzzy, bandwidth choice" },
      { num: 16, title: "Matching", file: "matching", hint: "PSM, CEM, entropy balancing" },
      { num: 17, title: "Heckman Selection", file: "heckman", hint: "Sample selection, inverse Mills" },
      { num: 18, title: "Experiments & Quasi-Experiments", file: "experiments-quasi", hint: "RCTs, natural experiments" },
    ],
  },
  {
    name: "Advanced", color: C.smp, bg: C.smpBg, tag: "ADV",
    desc: "Specialized methods for complex research questions",
    modules: [
      { num: 19, title: "Synthetic Control", file: "synthetic-control", hint: "Donor pools, placebo tests" },
      { num: 20, title: "Survival Analysis", file: "survival-analysis", hint: "Hazard functions, Cox PH" },
      { num: 21, title: "QCA", file: "qca", hint: "Set theory, truth tables" },
      { num: 22, title: "AI & ML Methods", file: "ai-ml-methods", hint: "LASSO, causal forests, NLP" },
    ],
  },
  {
    name: "Epilogue & Tools", color: C.pop, bg: C.popBg, tag: "META",
    desc: "The big picture and your method selection toolkit",
    modules: [
      { num: 23, title: "The Grand Principles", file: "grand-principles", hint: "Signal vs noise, counterfactuals" },
      { num: 24, title: "Method Chooser", file: "method-chooser", hint: "Interactive decision tree" },
    ],
  },
];

const TOTAL = CATEGORIES.reduce(function(sum, c) { return sum + c.modules.length; }, 0);

export default function LandingPage() {
  const [hoveredMod, setHoveredMod] = useState(null);

  return (
    <div style={{ fontFamily: font, maxWidth: "800px", margin: "0 auto", padding: "48px 24px 64px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap');`}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.1em", marginBottom: "12px" }}>
          {TOTAL} INTERACTIVE MODULES
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "40px", fontWeight: 700, lineHeight: 1.15, color: C.tx, marginBottom: "14px" }}>
          Research Methods<br />for Management Scholars
        </h1>
        <p style={{ fontSize: "17px", color: C.txD, lineHeight: 1.7, maxWidth: "560px", margin: "0 auto" }}>
          A visual, interactive guide to quantitative methods — from sampling distributions to causal forests. Built for PhD students with zero prior knowledge assumed.
        </p>
      </div>

      {/* How to use */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "48px" }}>
        {[
          { icon: "1", title: "Visual first", desc: "Every concept starts with an interactive visualization. Formulas come after intuition." },
          { icon: "2", title: "Management examples", desc: "Real research scenarios from strategy, entrepreneurship, and OB throughout." },
          { icon: "3", title: "Stata ready", desc: "Every method includes copy-paste Stata syntax and implementation guidance." },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ background: C.card, borderRadius: "12px", border: "1px solid " + C.bdr, padding: "18px 16px", boxShadow: C.sh, textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.smpBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: C.smp, fontFamily: mono, margin: "0 auto 10px" }}>{item.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>{item.title}</div>
              <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Module grid by category */}
      {CATEGORIES.map(function(cat, ci) {
        return (
          <div key={ci} style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: cat.color, fontFamily: mono, letterSpacing: "0.08em", background: cat.bg, padding: "3px 8px", borderRadius: "5px" }}>{cat.tag}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: C.tx, fontFamily: serif }}>{cat.name}</div>
            </div>
            <div style={{ fontSize: "13px", color: C.txD, marginBottom: "12px", lineHeight: 1.5 }}>{cat.desc}</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {cat.modules.map(function(mod) {
                return (
                  <div key={mod.num} style={{
                    background: C.card, borderRadius: "10px", border: "1px solid " + C.bdr,
                    padding: "14px 16px", boxShadow: C.sh, cursor: "pointer",
                    display: "flex", gap: "10px", alignItems: "center",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "7px",
                      background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: cat.color, fontFamily: mono, flexShrink: 0,
                    }}>{mod.num}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: C.tx, lineHeight: 1.3 }}>{mod.title}</div>
                      <div style={{ fontSize: "11px", color: C.txM, lineHeight: 1.4 }}>{mod.hint}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Learning path suggestion */}
      <div style={{ background: C.card, borderRadius: "14px", border: "1px solid " + C.bdr, padding: "24px 28px", boxShadow: C.sh, marginTop: "16px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, fontFamily: serif, marginBottom: "10px" }}>Suggested learning paths</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { path: "Complete curriculum", desc: "Modules 1 through 24 in order. One module per week for a semester-long PhD methods course.", modules: "1 - 24", color: C.smp },
            { path: "Causal inference bootcamp", desc: "Jump straight to the identification toolkit. Start with Module 12, then 13 - 18.", modules: "12 - 18", color: C.rose },
            { path: "Practitioner quickstart", desc: "OLS basics, panel data, and the Method Chooser. Get to applied work fast.", modules: "5, 10, 13, 24", color: C.sam },
            { path: "Advanced seminar", desc: "For students who already know regression. Synthetic control, survival, QCA, and ML.", modules: "19 - 23", color: C.pop },
          ].map(function(p, i) {
            return (
              <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: "1px solid " + C.bdr }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: p.color }}>{p.path}</div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: C.txM, fontFamily: mono }}>Modules {p.modules}</div>
                </div>
                <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "48px", fontSize: "13px", color: C.txM, lineHeight: 1.7 }}>
        <div style={{ fontFamily: serif, fontSize: "15px", color: C.txD, marginBottom: "6px" }}>
          Built by <strong style={{ color: C.tx }}>Wei Yu</strong>
        </div>
        <div>Department of Industrial Systems Engineering and Management</div>
        <div>National University of Singapore</div>
        <div style={{ marginTop: "8px", fontSize: "11px", color: C.txM }}>
          CC BY-NC-SA 4.0 | 2026
        </div>
      </div>
    </div>
  );
}
