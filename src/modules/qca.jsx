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
// TAB 1: A DIFFERENT LOGIC
// ═══════════════════════════════════════════════════════════════════
function DifferentLogicViz() {
  const [view, setView] = useState("regression");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Regression asks: "What is the <em>net effect</em> of X on Y, holding other variables constant?" QCA asks a fundamentally different question: <strong>"What combinations of conditions are sufficient (or necessary) for the outcome?"</strong> This is not a competing method — it's a different <em>ontology</em>.
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "regression", label: "Regression logic" },
          { id: "qca", label: "QCA logic" },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: view === t.id ? (t.id === "regression" ? C.sam : C.smp) : C.bdr,
            background: view === t.id ? (t.id === "regression" ? C.samBg : C.smpBg) : "transparent",
            color: view === t.id ? (t.id === "regression" ? C.sam : C.smp) : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {view === "regression" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.sam}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "10px" }}>Regression: net effects, one cause at a time</div>
            <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0" }}>
              Y = β₁X₁ + β₂X₂ + β₃X₃ + ε
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              {[
                { label: "Assumption", text: "Each X has an independent, additive effect. Causes are separable." },
                { label: "Logic", text: "Symmetric: if more X increases Y, then less X decreases Y." },
                { label: "Goal", text: "Isolate the net effect of each variable, holding others constant." },
                { label: "Result", text: "β₁ = 0.35, β₂ = -0.12, β₃ = 0.48 — each coefficient is a separate claim." },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, minWidth: "80px", fontFamily: mono }}>{r.label}:</div>
                  <div>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "qca" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.smp}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.smp, marginBottom: "10px" }}>QCA: configurations, multiple paths</div>
            <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0" }}>
              Outcome = (A <span style={{ color: C.grn }}>AND</span> B <span style={{ color: C.grn }}>AND</span> ~C) <span style={{ color: C.pop }}> OR </span> (D <span style={{ color: C.grn }}>AND</span> E)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
              {[
                { label: "Assumption", text: "Causes combine in configurations. The effect of A depends on whether B and C are present." },
                { label: "Logic", text: "Asymmetric: conditions for success ≠ mirror image of conditions for failure." },
                { label: "Goal", text: "Find which combinations (recipes) of conditions lead to the outcome." },
                { label: "Result", text: "Two paths to success: (A + B + not-C) OR (D + E). Multiple solutions = equifinality." },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: C.smp, minWidth: "80px", fontFamily: mono }}>{r.label}:</div>
                  <div>{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Three core QCA concepts */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Three concepts that make QCA different</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[
          { title: "Conjunctural causation", desc: "Causes don't work in isolation — they combine. The effect of CEO charisma depends on whether the firm also has a strong TMT, clear strategy, and favorable market conditions. QCA models these conjunctions explicitly.", icon: "🔗", color: C.grn },
          { title: "Equifinality", desc: "Multiple different paths can lead to the same outcome. High performance might come from (innovation + resources) OR (efficiency + scale) OR (niche positioning + loyalty). Regression collapses these into one average effect; QCA identifies each distinct recipe.", icon: "🔀", color: C.smp },
          { title: "Asymmetry", desc: "The causes of success are not the mirror image of the causes of failure. What makes a startup succeed ≠ the absence of what makes it fail. QCA analyzes the presence and absence of the outcome separately.", icon: "⚖️", color: C.pop },
        ].map((c, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", boxShadow: C.sh }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ fontSize: "20px" }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: c.color, marginBottom: "4px" }}>{c.title}</div>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>{c.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Anl>
        Think of a recipe book. Regression says "adding more salt improves taste by 0.3 units." QCA says "for a great chocolate cake, you need (cocoa + butter + sugar + eggs) — but for a great salad, you need (greens + dressing + crunch). Different outcomes, different recipes. And a bad cake isn't just a good cake minus cocoa."
      </Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: SETS & CALIBRATION
// ═══════════════════════════════════════════════════════════════════
function SetsViz() {
  const [type, setType] = useState("crisp");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        QCA works with <strong>sets</strong>, not variables. Each case is either "in" or "out of" a set (or partially in, for fuzzy sets). The first step is <strong>calibrating</strong> your raw data into set membership scores.
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "crisp", label: "Crisp sets (csQCA)" },
          { id: "fuzzy", label: "Fuzzy sets (fsQCA)" },
        ].map(t => (
          <button key={t.id} onClick={() => setType(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: type === t.id ? C.smp : C.bdr,
            background: type === t.id ? C.smpBg : "transparent",
            color: type === t.id ? C.smp : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {type === "crisp" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Crisp sets: fully in (1) or fully out (0)</div>
            <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, fontSize: "11.5px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 60px 60px", background: C.bg, fontWeight: 700, fontFamily: mono, color: C.txM }}>
                {["Firm", "Raw data", "Set", "Score"].map(h => (
                  <div key={h} style={{ padding: "6px 10px", borderLeft: h !== "Firm" ? `1px solid ${C.bdr}` : "none" }}>{h}</div>
                ))}
              </div>
              {[
                { firm: "Apple", raw: "Revenue: $394B", set: "Large", score: "1" },
                { firm: "Stripe", raw: "Revenue: $14B", set: "Large", score: "1" },
                { firm: "Joe's Cafe", raw: "Revenue: $200K", set: "Large", score: "0" },
                { firm: "Local shop", raw: "Revenue: $50K", set: "Large", score: "0" },
              ].map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 60px 60px", borderTop: `1px solid ${C.bdr}` }}>
                  <div style={{ padding: "6px 10px", fontWeight: 600 }}>{r.firm}</div>
                  <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txD }}>{r.raw}</div>
                  <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}` }}>{r.set}</div>
                  <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, fontWeight: 700, color: r.score === "1" ? C.grn : C.rose, fontFamily: mono }}>{r.score}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "12px", color: C.txD, marginTop: "8px" }}>Binary: every firm is either "in the set of large firms" (1) or not (0). Simple but loses nuance — Stripe and Apple both get 1 despite being very different in size.</div>
          </div>
        </div>
      )}

      {type === "fuzzy" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Fuzzy sets: degree of membership (0 to 1)</div>
            <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, fontSize: "11.5px", marginBottom: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 60px", background: C.bg, fontWeight: 700, fontFamily: mono, color: C.txM }}>
                {["Firm", "Revenue", "fsLarge"].map(h => (
                  <div key={h} style={{ padding: "6px 10px", borderLeft: h !== "Firm" ? `1px solid ${C.bdr}` : "none" }}>{h}</div>
                ))}
              </div>
              {[
                { firm: "Apple", rev: "$394B", fs: 0.99, bar: 99 },
                { firm: "Stripe", rev: "$14B", fs: 0.85, bar: 85 },
                { firm: "Startup X", rev: "$500M", fs: 0.55, bar: 55 },
                { firm: "Joe's Cafe", rev: "$200K", fs: 0.05, bar: 5 },
              ].map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 60px", borderTop: `1px solid ${C.bdr}` }}>
                  <div style={{ padding: "6px 10px", fontWeight: 600 }}>{r.firm}</div>
                  <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, color: C.txD }}>{r.rev}</div>
                  <div style={{ padding: "6px 10px", borderLeft: `1px solid ${C.bdr}`, position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.bar}%`, background: C.smp, opacity: 0.1 }} />
                    <span style={{ fontWeight: 700, color: C.smp, fontFamily: mono, position: "relative" }}>{r.fs.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, marginBottom: "6px" }}>Calibration: the three anchors</div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                Fuzzy set calibration requires the researcher to define three thresholds based on <strong>theoretical knowledge</strong>, not data distribution:
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {[
                  { anchor: "Fully in", val: "1.0", desc: "Above this, the case is fully in the set. E.g., revenue > $10B = 'fully large'", color: C.grn },
                  { anchor: "Crossover", val: "0.5", desc: "The point of maximum ambiguity. E.g., revenue = $1B = 'neither large nor small'", color: C.pop },
                  { anchor: "Fully out", val: "0.0", desc: "Below this, the case is fully out. E.g., revenue < $10M = 'fully not large'", color: C.rose },
                ].map((a, i) => (
                  <div key={i} style={{ flex: 1, background: a.color + "08", borderRadius: "6px", padding: "8px 10px", border: `1px solid ${a.color}22` }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: a.color, fontFamily: mono }}>{a.anchor} ({a.val})</div>
                    <div style={{ fontSize: "10.5px", color: C.txB, lineHeight: 1.5 }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Ins>
            <strong>Calibration is the most critical step in QCA</strong> — and the most subjective. The crossover point (0.5) is especially consequential because it determines which cases are "more in than out" vs "more out than in." Always justify your calibration thresholds theoretically, never mechanically (e.g., don't just use the median). Ragin (2008) and Schneider & Wagemann (2012) provide extensive guidance.
          </Ins>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: TRUTH TABLE & ANALYSIS
// ═══════════════════════════════════════════════════════════════════
function TruthTableViz() {
  const [step, setStep] = useState(0);

  const rows = [
    { a: 1, b: 1, c: 1, n: 3, outcome: 1, cons: 0.92 },
    { a: 1, b: 1, c: 0, n: 4, outcome: 1, cons: 0.88 },
    { a: 1, b: 0, c: 1, n: 2, outcome: 0, cons: 0.45 },
    { a: 1, b: 0, c: 0, n: 1, outcome: 0, cons: 0.30 },
    { a: 0, b: 1, c: 1, n: 5, outcome: 1, cons: 0.85 },
    { a: 0, b: 1, c: 0, n: 2, outcome: 0, cons: 0.52 },
    { a: 0, b: 0, c: 1, n: 1, outcome: 0, cons: 0.22 },
    { a: 0, b: 0, c: 0, n: 3, outcome: 0, cons: 0.15 },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The <strong>truth table</strong> is the heart of QCA. It lists every possible combination of conditions, counts how many cases fall into each combination, and determines whether each combination is sufficient for the outcome.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {["1. Build truth table", "2. Set thresholds", "3. Minimize"].map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "8px 10px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.smp : C.bdr,
            background: step === i ? C.smpBg : "transparent",
            color: step === i ? C.smp : C.txD,
            fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>
          Truth table: 3 conditions (A = Innovation, B = Resources, C = Experience) → Outcome (High performance)
        </div>

        <div style={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.bdr}`, fontSize: "11.5px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 40px 40px 50px 60px 60px", background: C.bg, fontWeight: 700, fontFamily: mono, color: C.txM }}>
            {["A", "B", "C", "N cases", "Consist.", "Outcome"].map(h => (
              <div key={h} style={{ padding: "6px 8px", borderLeft: h !== "A" ? `1px solid ${C.bdr}` : "none", textAlign: "center", fontSize: "10px" }}>{h}</div>
            ))}
          </div>
          {rows.map((r, i) => {
            const sufficient = step >= 1 && r.cons >= 0.8 && r.n >= 2;
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "40px 40px 40px 50px 60px 60px",
                borderTop: `1px solid ${C.bdr}`,
                background: step >= 1 ? (sufficient ? C.grnBg : i % 2 === 0 ? C.card : C.bg) : (i % 2 === 0 ? C.card : C.bg),
                opacity: step >= 1 && !sufficient ? 0.5 : 1,
              }}>
                <div style={{ padding: "6px 8px", textAlign: "center", fontFamily: mono, fontWeight: 600 }}>{r.a}</div>
                <div style={{ padding: "6px 8px", textAlign: "center", fontFamily: mono, fontWeight: 600, borderLeft: `1px solid ${C.bdr}` }}>{r.b}</div>
                <div style={{ padding: "6px 8px", textAlign: "center", fontFamily: mono, fontWeight: 600, borderLeft: `1px solid ${C.bdr}` }}>{r.c}</div>
                <div style={{ padding: "6px 8px", textAlign: "center", borderLeft: `1px solid ${C.bdr}`, color: C.txD }}>{r.n}</div>
                <div style={{ padding: "6px 8px", textAlign: "center", borderLeft: `1px solid ${C.bdr}`, fontFamily: mono, fontWeight: 600, color: step >= 1 ? (r.cons >= 0.8 ? C.grn : C.rose) : C.txB }}>{r.cons.toFixed(2)}</div>
                <div style={{ padding: "6px 8px", textAlign: "center", borderLeft: `1px solid ${C.bdr}`, fontFamily: mono, fontWeight: 700, color: step >= 1 ? (sufficient ? C.grn : C.txM) : C.txB }}>{step >= 1 ? (sufficient ? "1" : "0") : "?"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {step >= 2 && (
        <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)", marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "6px" }}>MINIMIZED SOLUTION (Boolean minimization)</div>
          <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "8px 0" }}>
            Outcome = (<span style={{ color: C.sam }}>A</span> * <span style={{ color: C.sam }}>B</span>) + (<span style={{ color: C.sam }}>~A</span> * <span style={{ color: C.sam }}>B</span> * <span style={{ color: C.sam }}>C</span>)
          </div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, textAlign: "center" }}>
            Simplifies to: <strong>B * (A + C)</strong> — Resources combined with either Innovation or Experience
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <div style={{ flex: 1, background: C.card, borderRadius: "6px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.smp }}>Path 1: A * B</div>
              <div style={{ fontSize: "11px", color: C.txB }}>Innovation + Resources → High performance</div>
            </div>
            <div style={{ flex: 1, background: C.card, borderRadius: "6px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.smp }}>Path 2: ~A * B * C</div>
              <div style={{ fontSize: "11px", color: C.txB }}>No innovation, but Resources + Experience → also works</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {step === 0 && <><strong>Building the truth table:</strong> With 3 binary conditions, there are 2³ = 8 possible combinations. Each row is a configuration. We count how many cases fall into each row and compute <strong>consistency</strong> — the proportion of cases in that row that show the outcome. Higher consistency = more reliable that this configuration leads to the outcome.</>}
        {step === 1 && <><strong>Setting thresholds:</strong> We decide which rows are "sufficient" for the outcome. Two thresholds: (1) <strong>consistency ≥ 0.80</strong> — at least 80% of cases with this configuration show the outcome, and (2) <strong>N ≥ 2</strong> — enough cases to be credible. Rows meeting both thresholds (green) are coded as outcome = 1. Three rows qualify: (A+B+C), (A+B+~C), and (~A+B+C).</>}
        {step === 2 && <><strong>Boolean minimization:</strong> The algorithm simplifies the sufficient configurations using Boolean algebra (the Quine-McCluskey algorithm). The three sufficient rows simplify to: <strong>B*(A + C)</strong> — Resources are in every path (they may be a necessary condition), combined with either Innovation or Experience. This is <strong>equifinality</strong>: two distinct recipes for success.</>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: REPORTING & BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════
function ReportingViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        QCA has become mainstream in management research (AMJ, ASQ, SMJ, JOM), but methodological standards are strict. Here's what reviewers expect and what common mistakes to avoid.
      </div>

      {/* Solution reporting */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Reporting QCA results</div>
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
          QCA produces three types of solutions (from Ragin, 2008). Report at least the <strong>intermediate solution</strong> — it balances parsimony with theoretical plausibility.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { type: "Complex solution", desc: "Uses only the observed (non-remainder) configurations. Most conservative — no assumptions about unobserved configurations.", use: "Robustness check" },
            { type: "Intermediate solution", desc: "Incorporates easy counterfactuals (remainders consistent with theoretical expectations). The standard to report.", use: "Main results" },
            { type: "Parsimonious solution", desc: "Uses all logical remainders to maximize simplification. Most concise but may include implausible assumptions.", use: "Identify core conditions" },
          ].map((s, i) => (
            <div key={i} style={{ background: i === 1 ? C.smpBg : C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${i === 1 ? C.smp + "30" : C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: i === 1 ? C.smp : C.txD }}>{s.type}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: C.txD, fontFamily: mono }}>{s.use}</div>
              </div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Key metrics to report</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {[
          { metric: "Consistency", desc: "How often the configuration leads to the outcome. Report for each path and the overall solution. Threshold: typically ≥ 0.80.", color: C.grn },
          { metric: "Coverage", desc: "How much of the outcome the solution explains. Raw coverage = proportion explained by each path. Unique coverage = proportion explained only by that path.", color: C.sam },
          { metric: "Necessity", desc: "Is any single condition present in every path to the outcome? Test before the sufficiency analysis. Threshold: consistency ≥ 0.90 for necessity.", color: C.smp },
          { metric: "PRI (Proportional Reduction in Inconsistency)", desc: "Guards against simultaneous subset relations — when a configuration is sufficient for both the outcome and its negation. PRI should be ≥ 0.70.", color: C.pop },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: m.color }}>{m.metric}</div>
            <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Software */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Software</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { name: "fsQCA 3.0", desc: "The original GUI software by Ragin. Free. Most widely used. Handles both csQCA and fsQCA.", link: "Standard in most published QCA studies." },
            { name: "QCA package (R)", desc: "install.packages('QCA'). Full-featured R package by Duşa. Integrates with R workflows.", link: "library(QCA); truthTable(data, outcome='Y', conditions=c('A','B','C'))" },
            { name: "SetMethods (R)", desc: "Comprehensive package including XY plots, robustness, and necessary condition analysis.", link: "library(SetMethods)" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: "6px", padding: "8px 12px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp }}>{s.name}</div>
              <div style={{ fontSize: "11px", color: C.txB, lineHeight: 1.5 }}>{s.desc}</div>
              <div style={{ fontSize: "10.5px", color: C.txD, fontFamily: mono }}>{s.link}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Common mistakes */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Common mistakes (Greckhamer et al., 2018)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { mistake: "Mechanical calibration", desc: "Using percentiles or the sample median as calibration anchors. Calibration must be theoretically grounded — what does 'fully in the set of high performers' mean substantively?" },
          { mistake: "Too many conditions", desc: "With k conditions, you have 2ᵏ rows. With 7+ conditions, most rows are empty (limited diversity). Keep conditions to 4–7 for typical management samples (15–80 cases)." },
          { mistake: "Ignoring necessity analysis", desc: "Testing sufficiency without first checking necessity. A condition might be necessary (present in all success paths) even if it's never individually sufficient." },
          { mistake: "Not analyzing the negation", desc: "Only analyzing conditions for the presence of the outcome. QCA's asymmetry means you should also analyze conditions for its absence — the recipes for failure may be completely different." },
          { mistake: "Treating QCA as a substitute for regression", desc: "QCA and regression answer different questions. Don't use QCA to estimate 'effects' or compare coefficient magnitudes. QCA identifies configurations; regression estimates net effects." },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose }}>{m.mistake}</div>
            <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>QCA sample sizes:</strong> QCA works best with small-to-medium N (15–80 cases) where researchers have deep case knowledge. It can work with larger N but loses some advantages. For very large N ({">"} 1000), regression is usually more appropriate. QCA is fundamentally a <strong>case-oriented</strong> method — each case should be meaningful and well-understood.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "logic", label: "1. A Different Logic" },
  { id: "sets", label: "2. Sets & Calibration" },
  { id: "truth", label: "3. Truth Table" },
  { id: "reporting", label: "4. Reporting" },
];

export default function QCAModule() {
  const [tab, setTab] = useState("logic");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.smpBg, fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>ADVANCED</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>Qualitative Comparative Analysis</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Set-theoretic methods for configurational thinking</p>
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
        {tab === "logic" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="A different kind of question" sub="From net effects to configurational recipes" />
          <CBox title={<>🧩 Regression vs QCA</>} color={C.smp}>
            <DifferentLogicViz />
          </CBox>
          <NBtn onClick={() => setTab("sets")} label="Next: Sets & Calibration →" />
        </div>}

        {tab === "sets" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Sets and calibration" sub="Converting raw data into set membership scores" />
          <CBox title={<>📐 Crisp & Fuzzy Sets</>} color={C.smp}>
            <SetsViz />
          </CBox>
          <NBtn onClick={() => setTab("truth")} label="Next: Truth Table →" />
        </div>}

        {tab === "truth" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Truth table analysis" sub="From configurations to minimized solutions" />
          <CBox title={<>📋 The Truth Table</>} color={C.smp}>
            <TruthTableViz />
          </CBox>
          <NBtn onClick={() => setTab("reporting")} label="Next: Reporting →" />
        </div>}

        {tab === "reporting" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Reporting & best practices" sub="What reviewers expect and what to avoid" />

          <CBox title={<>✅ Best Practices</>} color={C.grn}>
            <ReportingViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> QCA asks a different question than regression: <strong>"What combinations of conditions produce the outcome?"</strong> not "What is the net effect of X?"<br />
              <strong>2.</strong> Three core ideas: <strong>conjunctural causation</strong> (causes combine), <strong>equifinality</strong> (multiple paths to the same outcome), and <strong>asymmetry</strong> (success ≠ absence of failure).<br />
              <strong>3.</strong> <strong>Calibration</strong> converts raw data into set membership. Use theoretically grounded thresholds (fully in, crossover, fully out) — never mechanical percentiles.<br />
              <strong>4.</strong> The <strong>truth table</strong> lists all configurations. Boolean minimization identifies the simplest set of sufficient conditions. Report the <strong>intermediate solution</strong>.<br />
              <strong>5.</strong> Report <strong>consistency</strong> (≥ 0.80), <strong>coverage</strong> (raw + unique), and <strong>necessity</strong> (test separately, threshold ≥ 0.90). Always analyze both the outcome and its negation.<br />
              <strong>6.</strong> QCA works best with <strong>15–80 cases</strong>, 4–7 conditions, and deep case knowledge. Software: fsQCA 3.0 or the R QCA package.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
