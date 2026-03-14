import { useState, useEffect } from "react";

// ─── Module imports ────────────────────────────────────────────────
import SamplingDistributions from "./modules/sampling-distributions";
import HypothesisTesting from "./modules/hypothesis-testing";
import ConfidenceIntervals from "./modules/confidence-intervals";
import BayesianThinking from "./modules/bayesian-thinking";
import OLSRegression from "./modules/ols-regression";
import LogitProbit from "./modules/logit-probit";
import CountModels from "./modules/count-models";
import Moderation from "./modules/moderation";
import Mediation from "./modules/mediation";
import PanelData from "./modules/panel-data";
import MultilevelHLM from "./modules/multilevel-hlm";
import Endogeneity from "./modules/endogeneity";
import DiD from "./modules/did";
import InstrumentalVariables from "./modules/instrumental-variables";
import RDD from "./modules/rdd";
import Matching from "./modules/matching";
import Heckman from "./modules/heckman";
import ExperimentsQuasi from "./modules/experiments-quasi";
import SyntheticControl from "./modules/synthetic-control";
import SurvivalAnalysis from "./modules/survival-analysis";
import QCA from "./modules/qca";
import AIMLMethods from "./modules/ai-ml-methods";
import GrandPrinciples from "./modules/grand-principles";
import MethodChooser from "./modules/method-chooser";
import LandingPage from "./modules/index";

// ─── Colors ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
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

// ─── Module registry ────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Statistical Reasoning", color: C.smp,
    modules: [
      { id: "sampling", num: 1, title: "Sampling Distributions", component: SamplingDistributions },
      { id: "hypothesis", num: 2, title: "Hypothesis Testing", component: HypothesisTesting },
      { id: "confidence", num: 3, title: "Confidence Intervals", component: ConfidenceIntervals },
      { id: "bayesian", num: 4, title: "Bayesian Thinking", component: BayesianThinking },
    ],
  },
  {
    name: "Foundations", color: C.sam,
    modules: [
      { id: "ols", num: 5, title: "OLS Regression", component: OLSRegression },
      { id: "logit", num: 6, title: "Logit & Probit", component: LogitProbit },
      { id: "count", num: 7, title: "Count Models", component: CountModels },
    ],
  },
  {
    name: "Mechanisms", color: C.grn,
    modules: [
      { id: "moderation", num: 8, title: "Moderation", component: Moderation },
      { id: "mediation", num: 9, title: "Mediation", component: Mediation },
    ],
  },
  {
    name: "Panel & Multilevel", color: C.smp,
    modules: [
      { id: "panel", num: 10, title: "Panel Data", component: PanelData },
      { id: "hlm", num: 11, title: "Multilevel / HLM", component: MultilevelHLM },
    ],
  },
  {
    name: "Causal Inference", color: C.rose,
    modules: [
      { id: "endogeneity", num: 12, title: "Endogeneity", component: Endogeneity },
      { id: "did", num: 13, title: "Difference-in-Differences", component: DiD },
      { id: "iv", num: 14, title: "Instrumental Variables", component: InstrumentalVariables },
      { id: "rdd", num: 15, title: "Regression Discontinuity", component: RDD },
      { id: "matching", num: 16, title: "Matching", component: Matching },
      { id: "heckman", num: 17, title: "Heckman Selection", component: Heckman },
      { id: "experiments", num: 18, title: "Experiments & Quasi-Experiments", component: ExperimentsQuasi },
    ],
  },
  {
    name: "Advanced", color: C.smp,
    modules: [
      { id: "synth", num: 19, title: "Synthetic Control", component: SyntheticControl },
      { id: "survival", num: 20, title: "Survival Analysis", component: SurvivalAnalysis },
      { id: "qca", num: 21, title: "QCA", component: QCA },
      { id: "aiml", num: 22, title: "AI & ML Methods", component: AIMLMethods },
    ],
  },
  {
    name: "Epilogue & Tools", color: C.pop,
    modules: [
      { id: "principles", num: 23, title: "The Grand Principles", component: GrandPrinciples },
      { id: "chooser", num: 24, title: "Method Chooser", component: MethodChooser },
    ],
  },
];

// Flat lookup
const ALL_MODULES = CATEGORIES.flatMap(function(c) {
  return c.modules.map(function(m) { return { ...m, catColor: c.color, catName: c.name }; });
});

function findModule(id) {
  return ALL_MODULES.find(function(m) { return m.id === id; });
}

// ─── Hash-based routing (works with GitHub Pages) ───────────────────
function getHashRoute() {
  var h = window.location.hash.replace("#", "");
  return h || "home";
}

function setHashRoute(id) {
  window.location.hash = id === "home" ? "" : id;
}

// ═══════════════════════════════════════════════════════════════════
// NAV SIDEBAR
// ═══════════════════════════════════════════════════════════════════
function Sidebar({ current, onNavigate, isOpen, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0,
      width: "280px", background: C.card,
      borderRight: "1px solid " + C.bdr,
      overflowY: "auto", zIndex: 100,
      transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.25s ease",
      boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid " + C.bdr, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function() { onNavigate("home"); onClose(); }} style={{
          background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0,
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, fontFamily: serif, lineHeight: 1.3 }}>Research Methods</div>
          <div style={{ fontSize: "11px", color: C.txD }}>for Management Scholars</div>
        </button>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: C.txM, padding: "4px",
        }}>x</button>
      </div>

      {/* Module list */}
      <div style={{ padding: "12px 10px" }}>
        {CATEGORIES.map(function(cat, ci) {
          return (
            <div key={ci} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: cat.color, fontFamily: mono, letterSpacing: "0.08em", padding: "4px 8px", marginBottom: "4px" }}>
                {cat.name.toUpperCase()}
              </div>
              {cat.modules.map(function(mod) {
                var active = current === mod.id;
                return (
                  <button key={mod.id} onClick={function() { onNavigate(mod.id); onClose(); }} style={{
                    display: "flex", gap: "8px", alignItems: "center",
                    width: "100%", padding: "8px 8px", borderRadius: "8px",
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: active ? cat.color + "10" : "transparent",
                    fontFamily: font, marginBottom: "1px",
                  }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "5px",
                      background: active ? cat.color + "20" : C.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 700,
                      color: active ? cat.color : C.txM,
                      fontFamily: mono, flexShrink: 0,
                    }}>{mod.num}</div>
                    <div style={{
                      fontSize: "12px", fontWeight: active ? 600 : 400,
                      color: active ? cat.color : C.txB,
                      lineHeight: 1.3,
                    }}>{mod.title}</div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════════════════════════════
function TopBar({ current, onMenuClick, onNavigate }) {
  var mod = findModule(current);
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250,251,252,0.92)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid " + C.bdr,
      padding: "0 20px", height: "52px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onMenuClick} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "20px", color: C.txD, padding: "4px", lineHeight: 1,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        </button>
        {current === "home" ? (
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.tx, fontFamily: serif }}>Research Methods</div>
        ) : mod ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: mod.catColor, fontFamily: mono }}>{mod.num}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.tx }}>{mod.title}</div>
          </div>
        ) : null}
      </div>

      {/* Prev / Next */}
      {mod && (
        <div style={{ display: "flex", gap: "6px" }}>
          {mod.num > 1 && (
            <button onClick={function() {
              var prev = ALL_MODULES.find(function(m) { return m.num === mod.num - 1; });
              if (prev) onNavigate(prev.id);
            }} style={{
              background: C.bg, border: "1px solid " + C.bdr, borderRadius: "6px",
              padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: C.txD,
              cursor: "pointer", fontFamily: font,
            }}>Prev</button>
          )}
          {mod.num < 24 && (
            <button onClick={function() {
              var next = ALL_MODULES.find(function(m) { return m.num === mod.num + 1; });
              if (next) onNavigate(next.id);
            }} style={{
              background: C.bg, border: "1px solid " + C.bdr, borderRadius: "6px",
              padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: C.txD,
              cursor: "pointer", fontFamily: font,
            }}>Next</button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  var _route = useState(getHashRoute);
  var route = _route[0];
  var setRoute = _route[1];
  var _sidebar = useState(false);
  var sidebarOpen = _sidebar[0];
  var setSidebarOpen = _sidebar[1];

  // Listen for hash changes (browser back/forward)
  useEffect(function() {
    function onHash() { setRoute(getHashRoute()); }
    window.addEventListener("hashchange", onHash);
    return function() { window.removeEventListener("hashchange", onHash); };
  }, []);

  function navigate(id) {
    setHashRoute(id);
    setRoute(id);
    window.scrollTo(0, 0);
  }

  // Find current module component
  var mod = findModule(route);
  var ModuleComponent = mod ? mod.component : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div onClick={function() { setSidebarOpen(false); }} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 90,
        }} />
      )}

      <Sidebar
        current={route}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onClose={function() { setSidebarOpen(false); }}
      />

      <TopBar
        current={route}
        onMenuClick={function() { setSidebarOpen(true); }}
        onNavigate={navigate}
      />

      {/* Content */}
      <div style={{ maxWidth: "100%", overflow: "hidden" }}>
        {route === "home" ? (
          <LandingPage />
        ) : ModuleComponent ? (
          <ModuleComponent />
        ) : (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: C.txD }}>Module not found</div>
            <button onClick={function() { navigate("home"); }} style={{
              marginTop: "16px", padding: "10px 24px", borderRadius: "8px",
              border: "none", background: C.smp, color: "#fff",
              fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font,
            }}>Back to home</button>
          </div>
        )}

        {/* Bottom nav */}
        {mod && (
          <div style={{
            maxWidth: "720px", margin: "0 auto", padding: "24px 20px 48px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            {mod.num > 1 ? (
              <button onClick={function() {
                var prev = ALL_MODULES.find(function(m) { return m.num === mod.num - 1; });
                if (prev) navigate(prev.id);
              }} style={{
                padding: "12px 20px", borderRadius: "10px",
                border: "1.5px solid " + C.bdr, background: C.card,
                fontSize: "13px", fontWeight: 600, color: C.txD,
                cursor: "pointer", fontFamily: font,
              }}>
                <span style={{ color: C.txM, marginRight: "6px" }}>{"<"}</span>
                {ALL_MODULES.find(function(m) { return m.num === mod.num - 1; }).title}
              </button>
            ) : <div />}
            {mod.num < 24 ? (
              <button onClick={function() {
                var next = ALL_MODULES.find(function(m) { return m.num === mod.num + 1; });
                if (next) navigate(next.id);
              }} style={{
                padding: "12px 20px", borderRadius: "10px",
                border: "1.5px solid " + C.bdr, background: C.card,
                fontSize: "13px", fontWeight: 600, color: C.txD,
                cursor: "pointer", fontFamily: font,
              }}>
                {ALL_MODULES.find(function(m) { return m.num === mod.num + 1; }).title}
                <span style={{ color: C.txM, marginLeft: "6px" }}>{">"}</span>
              </button>
            ) : (
              <button onClick={function() { navigate("home"); }} style={{
                padding: "12px 20px", borderRadius: "10px",
                border: "1.5px solid " + C.bdr, background: C.card,
                fontSize: "13px", fontWeight: 600, color: C.txD,
                cursor: "pointer", fontFamily: font,
              }}>Back to home</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
