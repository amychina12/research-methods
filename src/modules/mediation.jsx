import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Simple OLS
function ols(pts, xKey, yKey) {
  const n = pts.length;
  if (n < 2) return { b0: 0, b1: 0 };
  const mx = pts.reduce((s, p) => s + p[xKey], 0) / n;
  const my = pts.reduce((s, p) => s + p[yKey], 0) / n;
  const ssxy = pts.reduce((s, p) => s + (p[xKey] - mx) * (p[yKey] - my), 0);
  const ssxx = pts.reduce((s, p) => s + (p[xKey] - mx) ** 2, 0);
  const b1 = ssxx > 0 ? ssxy / ssxx : 0;
  const b0 = my - b1 * mx;
  return { b0, b1 };
}

// ─── Colors ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
  sh: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  pop: "#D97706", popBg: "rgba(217,119,6,0.06)", popLt: "#FEF3C7",
  sam: "#0284C7", samBg: "rgba(2,132,199,0.06)", samLt: "#E0F2FE",
  smp: "#7C3AED", smpBg: "rgba(124,58,237,0.05)", smpLt: "#EDE9FE",
  grn: "#059669", grnBg: "rgba(5,150,105,0.06)",
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)",
  tx: "#1E293B", txB: "#334155", txD: "#64748B", txM: "#94A3B8",
  grid: "rgba(148,163,184,0.12)",
};
const font = "'DM Sans', sans-serif", mono = "'DM Mono', monospace", serif = "'Source Serif 4', serif";

// ─── Shared UI ──────────────────────────────────────────────────────
function SH({ number, title, sub }) {
  return (<div style={{ marginBottom: "22px" }}>
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.grn, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.grn }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.grn, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: THE CONCEPT
// ═══════════════════════════════════════════════════════════════════
function ConceptViz() {
  const [step, setStep] = useState(0);

  const examples = [
    { x: "Transformational Leadership", m: "Employee Engagement", y: "Job Performance", story: "Transformational leaders don't magically improve performance. They do it by inspiring and engaging employees — and it's the engagement that drives performance. Leadership works through engagement.", arrow1: "Leaders inspire and engage employees", arrow2: "Engaged employees perform better" },
    { x: "R&D Investment", m: "Absorptive Capacity", y: "Firm Innovation", story: "Pouring money into R&D doesn't directly produce innovation. It builds the firm's ability to absorb and apply new knowledge (absorptive capacity), which then generates innovation.", arrow1: "R&D builds knowledge absorption ability", arrow2: "Absorptive capacity enables innovation" },
    { x: "Layoff Announcement", m: "Survivor Guilt", y: "Remaining Employee Turnover", story: "When a company announces layoffs, the employees who keep their jobs don't leave right away. But many develop survivor guilt, which eventually pushes them to quit too.", arrow1: "Layoffs trigger guilt in survivors", arrow2: "Guilt drives voluntary turnover" },
  ];

  const ex = examples[step];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Mediation answers the question: <strong>"How or why does X affect Y?"</strong> Instead of a direct X→Y link, the effect flows <em>through</em> an intermediate variable M (the mediator). X causes M, and M causes Y. This is the <strong>indirect effect</strong>.
      </div>

      {/* Moderation vs Mediation comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}` }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.txM, fontFamily: mono, marginBottom: "6px" }}>MODERATION (Module 8)</div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>Asks: <strong>"When"</strong> does X affect Y?</div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "4px" }}>Z changes the strength of the X→Y arrow</div>
        </div>
        <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "6px" }}>MEDIATION (this module)</div>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>Asks: <strong>"How / why"</strong> does X affect Y?</div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "4px" }}>M is the mechanism — the path X travels through to reach Y</div>
        </div>
      </div>

      {/* Diagram */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "24px", boxShadow: C.sh, marginBottom: "16px" }}>
        <svg viewBox="0 0 500 200" style={{ width: "100%", maxWidth: "520px", display: "block", margin: "0 auto" }}>
          <defs>
            <marker id="arrowMed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.grn} /></marker>
            <marker id="arrowDirect" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.txM} /></marker>
          </defs>

          {/* X box */}
          <rect x="5" y="110" width="145" height="56" rx="12" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
          {(() => {
            const words = ex.x.split(" ");
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            return words.length <= 2 ? (
              <text x="77" y="143" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sam} fontFamily={font}>{ex.x}</text>
            ) : (<>
              <text x="77" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sam} fontFamily={font}>{line1}</text>
              <text x="77" y="151" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sam} fontFamily={font}>{line2}</text>
            </>);
          })()}

          {/* M box */}
          <rect x="178" y="10" width="145" height="56" rx="12" fill={C.popBg} stroke={C.pop} strokeWidth="2" />
          {(() => {
            const words = ex.m.split(" ");
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            return words.length <= 2 ? (
              <text x="250" y="43" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.pop} fontFamily={font}>{ex.m}</text>
            ) : (<>
              <text x="250" y="35" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.pop} fontFamily={font}>{line1}</text>
              <text x="250" y="51" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.pop} fontFamily={font}>{line2}</text>
            </>);
          })()}

          {/* Y box */}
          <rect x="350" y="110" width="145" height="56" rx="12" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
          {(() => {
            const words = ex.y.split(" ");
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            return words.length <= 2 ? (
              <text x="422" y="143" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.smp} fontFamily={font}>{ex.y}</text>
            ) : (<>
              <text x="422" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.smp} fontFamily={font}>{line1}</text>
              <text x="422" y="151" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.smp} fontFamily={font}>{line2}</text>
            </>);
          })()}

          {/* Path a: X → M */}
          <line x1="120" x2="190" y1="110" y2="66" stroke={C.grn} strokeWidth="2.5" markerEnd="url(#arrowMed)" />
          <text x="138" y="82" fontSize="14" fontWeight="800" fill={C.grn} fontFamily={mono}>a</text>

          {/* Path b: M → Y */}
          <line x1="310" x2="380" y1="66" y2="110" stroke={C.grn} strokeWidth="2.5" markerEnd="url(#arrowMed)" />
          <text x="358" y="82" fontSize="14" fontWeight="800" fill={C.grn} fontFamily={mono}>b</text>

          {/* Path c': X → Y (direct) */}
          <line x1="150" x2="345" y1="142" y2="142" stroke={C.txM} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowDirect)" />
          <text x="248" y="160" fontSize="13" fontWeight="700" fill={C.txM} fontFamily={mono}>c'</text>
          <text x="248" y="174" fontSize="9" fill={C.txD} fontFamily={font}>(direct effect)</text>

          {/* Indirect label */}
          <text x="250" y="6" textAnchor="middle" fontSize="10" fill={C.grn} fontFamily={font} fontWeight="600">indirect effect = a × b</text>
        </svg>
      </div>

      {/* Example selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: step === i ? C.grn : C.bdr,
            background: step === i ? C.grnBg : "transparent",
            color: step === i ? C.grn : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>Example {i + 1}</button>
        ))}
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 20px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "10px" }}>{ex.story}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono }}>PATH a: X → M</div>
            <div style={{ fontSize: "13px", color: C.txB, marginTop: "4px" }}>{ex.arrow1}</div>
          </div>
          <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono }}>PATH b: M → Y</div>
            <div style={{ fontSize: "13px", color: C.txB, marginTop: "4px" }}>{ex.arrow2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: THE THREE REGRESSIONS
// ═══════════════════════════════════════════════════════════════════
function PathsViz() {
  const [a, setA] = useState(0.6);
  const [b, setB] = useState(0.5);
  const [cDirect, setCDirect] = useState(0.1);

  const totalC = a * b + cDirect;
  const indirect = a * b;
  const propMediated = totalC !== 0 ? Math.abs(indirect / totalC) : 0;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Mediation involves <strong>three regressions</strong> and four key coefficients. Drag the sliders to set the path strengths and see how the total, direct, and indirect effects relate:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Path a (X → M)</div>
          <input type="range" min="-1" max="1" step="0.1" value={a} onChange={e => setA(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>a = {a.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Path b (M → Y, controlling X)</div>
          <input type="range" min="-1" max="1" step="0.1" value={b} onChange={e => setB(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>b = {b.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>c' (X → Y direct)</div>
          <input type="range" min="-0.5" max="0.8" step="0.05" value={cDirect} onChange={e => setCDirect(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.txD }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.txD, fontFamily: mono }}>c' = {cDirect.toFixed(2)}</div>
        </div>
      </div>

      {/* Live diagram */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, marginBottom: "16px" }}>
        <svg viewBox="0 0 440 150" style={{ width: "100%", maxWidth: "460px", display: "block", margin: "0 auto" }}>
          <defs>
            <marker id="arrowG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.grn} /></marker>
            <marker id="arrowD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.txM} /></marker>
          </defs>

          {/* Boxes */}
          <rect x="10" y="85" width="80" height="40" rx="10" fill={C.samBg} stroke={C.sam} strokeWidth="2" />
          <text x="50" y="110" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.sam} fontFamily={font}>X</text>

          <rect x="180" y="12" width="80" height="40" rx="10" fill={C.popBg} stroke={C.pop} strokeWidth="2" />
          <text x="220" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.pop} fontFamily={font}>M</text>

          <rect x="350" y="85" width="80" height="40" rx="10" fill={C.smpBg} stroke={C.smp} strokeWidth="2" />
          <text x="390" y="110" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.smp} fontFamily={font}>Y</text>

          {/* Path a — arrow drawn first, label on top */}
          <line x1="80" x2="188" y1="87" y2="52" stroke={C.grn} strokeWidth={Math.min(3, Math.max(1.5, Math.abs(a) * 3))} markerEnd="url(#arrowG)" opacity={Math.abs(a) < 0.05 ? 0.2 : 0.7} />
          <rect x="96" y="48" width="56" height="16" rx="4" fill={C.card} opacity="0.9" />
          <text x="124" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grn} fontFamily={mono}>a = {a.toFixed(1)}</text>

          {/* Path b — arrow first, label on top */}
          <line x1="252" x2="358" y1="52" y2="87" stroke={C.grn} strokeWidth={Math.min(3, Math.max(1.5, Math.abs(b) * 3))} markerEnd="url(#arrowG)" opacity={Math.abs(b) < 0.05 ? 0.2 : 0.7} />
          <rect x="292" y="48" width="56" height="16" rx="4" fill={C.card} opacity="0.9" />
          <text x="320" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grn} fontFamily={mono}>b = {b.toFixed(1)}</text>

          {/* Path c' — arrow first, label on top */}
          <line x1="90" x2="345" y1="108" y2="108" stroke={C.txM} strokeWidth={Math.min(3, Math.max(1, Math.abs(cDirect) * 3))} strokeDasharray="6,4" markerEnd="url(#arrowD)" opacity={Math.abs(cDirect) < 0.02 ? 0.2 : 0.5} />
          <rect x="193" y="117" width="56" height="16" rx="4" fill={C.card} opacity="0.9" />
          <text x="221" y="129" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.txM} fontFamily={mono}>c' = {cDirect.toFixed(2)}</text>
        </svg>

        {/* Results */}
        <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <SC label="Total Effect (c)" value={totalC.toFixed(2)} color={C.tx} />
          <SC label="Indirect (a×b)" value={indirect.toFixed(2)} color={C.grn} />
          <SC label="Direct (c')" value={cDirect.toFixed(2)} color={C.txD} />
          <SC label="% Mediated" value={propMediated > 0 ? (propMediated * 100).toFixed(0) + "%" : "—"} color={C.pop} />
        </div>
      </div>

      {/* The key equation */}
      <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE DECOMPOSITION</div>
        <div style={{ fontSize: "18px", fontFamily: mono, fontWeight: 600, marginBottom: "8px" }}>
          <span style={{ color: C.tx }}>c</span>
          {" = "}
          <span style={{ color: C.grn }}>a × b</span>
          {" + "}
          <span style={{ color: C.txM }}>c'</span>
        </div>
        <div style={{ fontSize: "14px", fontFamily: mono, marginBottom: "8px" }}>
          <span style={{ color: C.tx }}>{totalC.toFixed(2)}</span>
          {" = "}
          <span style={{ color: C.grn }}>{indirect.toFixed(2)}</span>
          {" + "}
          <span style={{ color: C.txM }}>{cDirect.toFixed(2)}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.txD }}>
          total effect = indirect effect (through M) + direct effect (bypassing M)
        </div>
      </div>

      <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginTop: "14px" }}>
        <strong>The three regressions:</strong> (1) Regress M on X → gives path <strong style={{ color: C.grn }}>a</strong>. (2) Regress Y on both X and M → gives path <strong style={{ color: C.grn }}>b</strong> (M's effect on Y, controlling for X) and <strong style={{ color: C.txM }}>c'</strong> (X's direct effect, controlling for M). (3) Regress Y on X alone → gives <strong>c</strong> (the total effect). The indirect effect = a × b = the part of X's effect that travels through M.
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Try this:</strong> (1) Set a = 0.8, b = 0.7, c' = 0 — all of X's effect goes through M (indirect = 0.56, 100% mediated). (2) Set a = 0.8, b = 0.7, c' = 0.4 — some goes through M, some is direct. (3) Set a = 0 — there's no mediation because X doesn't affect M, so the mechanism is broken.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: TESTING MEDIATION
// ═══════════════════════════════════════════════════════════════════
function TestingViz() {
  const [approach, setApproach] = useState("bootstrap");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        How do you test whether the indirect effect (a × b) is statistically significant? The field has evolved through three approaches — understanding this history helps you evaluate older papers and choose the right method for your own.
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[
          { id: "bk", label: "Baron & Kenny (1986)", sub: "Historical" },
          { id: "sobel", label: "Sobel Test", sub: "Improvement" },
          { id: "bootstrap", label: "Bootstrap", sub: "Modern standard" },
        ].map(t => (
          <button key={t.id} onClick={() => setApproach(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: approach === t.id ? C.grn : C.bdr,
            background: approach === t.id ? C.grnBg : "transparent",
            color: approach === t.id ? C.grn : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center",
          }}>
            <div>{t.label}</div>
            <div style={{ fontSize: "10px", fontWeight: 400, color: approach === t.id ? C.grn : C.txM, marginTop: "2px" }}>{t.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, minHeight: "280px" }}>
        {approach === "bk" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.txD, marginBottom: "10px" }}>Baron & Kenny's 4 Steps (1986)</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              The original approach required passing four sequential tests. If any step failed, you concluded "no mediation":
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {[
                { step: "1", text: "Show that X significantly predicts Y (c is significant)" },
                { step: "2", text: "Show that X significantly predicts M (a is significant)" },
                { step: "3", text: "Show that M significantly predicts Y, controlling for X (b is significant)" },
                { step: "4", text: "Show that X's effect on Y weakens when M is included (c' < c)" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: C.txD, fontFamily: mono, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.roseBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(225,29,72,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Why this is now considered outdated:</div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                <strong>Step 1 is unnecessary.</strong> Mediation can exist even when c is not significant — this happens when the indirect and direct effects have opposite signs (inconsistent mediation/suppression). Requiring Step 1 misses real mediation.
                <br /><strong>It never directly tests the indirect effect.</strong> None of the four steps actually tests whether a × b is significantly different from zero. They test the pieces separately but not the product.
                <br /><strong>Low statistical power.</strong> Requiring all four steps to be significant makes the test very conservative — it misses many real mediations.
              </div>
            </div>
          </div>
        )}

        {approach === "sobel" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.txD, marginBottom: "10px" }}>The Sobel Test</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              An improvement over Baron & Kenny: it directly tests whether the indirect effect (a × b) is significantly different from zero. It computes a z-statistic:
            </div>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}`, textAlign: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, color: C.tx }}>z = (a × b) / SE{"_{a×b}"}</div>
              <div style={{ fontSize: "11px", color: C.txD, marginTop: "4px" }}>where SE is computed from the standard errors of a and b</div>
            </div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              <strong>Progress:</strong> It directly tests the indirect effect — no more relying on four separate steps.
            </div>
            <div style={{ background: C.popBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(217,119,6,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, marginBottom: "4px" }}>Remaining problem:</div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                The Sobel test assumes the sampling distribution of a × b is normal. But the product of two coefficients is often <em>not</em> normally distributed — it tends to be skewed, especially in small samples. This means the Sobel test can be inaccurate: its p-values may be wrong and it may miss real mediation effects.
              </div>
            </div>
          </div>
        )}

        {approach === "bootstrap" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn, marginBottom: "10px" }}>Bootstrap Test (Hayes PROCESS) — the modern standard</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              Instead of assuming a × b is normally distributed, the bootstrap <strong>empirically builds the distribution</strong> by resampling your data thousands of times:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {[
                { step: "1", text: "Take a random sample (with replacement) from your data — same size as the original" },
                { step: "2", text: "Run the mediation regressions on this resample. Compute a × b." },
                { step: "3", text: "Repeat steps 1–2 five thousand times. You now have 5,000 estimates of a × b." },
                { step: "4", text: "Sort these 5,000 estimates. The 2.5th and 97.5th percentiles form your 95% confidence interval for the indirect effect." },
                { step: "5", text: "If the CI does not include zero, the indirect effect is significant." },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: C.grnBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, flexShrink: 0 }}>{s.step}</div>
                  <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.grnBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(5,150,105,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, marginBottom: "4px" }}>Why this is the standard:</div>
              <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                <strong>No distributional assumption.</strong> It doesn't assume a × b is normal — it lets the data tell you the shape.
                <br /><strong>Higher power.</strong> It detects real mediation effects more often than Baron & Kenny or Sobel.
                <br /><strong>Direct test of the indirect effect.</strong> You get a CI for a × b, which is exactly what you want.
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, marginTop: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>In practice:</div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>
                <strong>Stata:</strong> <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>sgmediation y, mv(m) iv(x) / bootstrap, reps(5000): sgmediation ...</code><br />
                <strong>SPSS:</strong> Hayes' PROCESS macro (Model 4).<br />
                <strong>R:</strong> <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>mediate()</code> from the <em>mediation</em> package, or <code style={{ background: C.bg, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>lavaan</code> with bootstrapping.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: COMMON MISTAKES
// ═══════════════════════════════════════════════════════════════════
function MistakesViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Mediation is one of the most misunderstood and misused tools in management research. These pitfalls are critical to avoid:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Mistake 1 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Claiming causation from observational data</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                Mediation makes an inherently <strong>causal claim</strong>: X causes M, and M causes Y. But with cross-sectional observational data, you can't establish causation — you're only showing correlational patterns. The direction could be reversed (Y→M→X), or a confounder could drive all three variables.
              </div>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)", marginTop: "8px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
                <strong style={{ color: C.grn }}>What to do:</strong> Use causal language carefully ("consistent with mediation" rather than "M mediates"). Better: use experimental or longitudinal designs where X is measured before M, and M before Y. Best: experimentally manipulate X and M separately.
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 2 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Ignoring the M→Y confounder problem</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                Even if X is experimentally manipulated (so X→M is causal), the M→Y path is almost always <strong>observational</strong>. There may be confounders that affect both M and Y. If you don't control for these, path b is biased, and so is your indirect effect.
              </div>
              <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, marginTop: "8px" }}>
                <div style={{ fontSize: "12.5px", color: C.txB, lineHeight: 1.7 }}>
                  <strong>Example:</strong> Leadership (X) → Engagement (M) → Performance (Y). Even if you randomly assign leaders, there could be a confounder (e.g., team quality) that causes <em>both</em> high engagement and high performance. The apparent M→Y path would be inflated.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 3 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>3</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Measuring X, M, and Y at the same time</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                Mediation implies a causal sequence: X happens first, then M changes, then Y changes. But many studies measure all three in the same survey at the same time. This makes it impossible to distinguish X→M→Y from Y→M→X or any other ordering.
              </div>
              <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)", marginTop: "8px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
                <strong style={{ color: C.grn }}>Better designs:</strong> Measure X at time 1, M at time 2, and Y at time 3 (longitudinal panel). Or use archival data where temporal ordering is clear (e.g., leadership change → engagement survey → performance review). Or experimentally manipulate X.
              </div>
            </div>
          </div>
        </div>

        {/* Mistake 4 */}
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>4</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "6px" }}>Requiring a significant total effect (c) before testing mediation</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
                This is the Baron & Kenny legacy. Many researchers still believe "if c is not significant, there's no mediation to test." This is wrong. The indirect effect (a × b) can be significant even when c is not — this happens when the indirect and direct effects go in <strong>opposite directions</strong> and cancel each other out. For example, X increases M (positive a), M increases Y (positive b), but X also directly <em>decreases</em> Y (negative c'). The total effect c could be near zero even though a real mediation process exists.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "concept", label: "1. The Concept" },
  { id: "paths", label: "2. The Three Paths" },
  { id: "testing", label: "3. Testing Mediation" },
  { id: "mistakes", label: "4. Common Mistakes" },
];

export default function Mediation() {
  const [tab, setTab] = useState("concept");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.grnBg, color: C.grn, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 9 · Mechanisms</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Mediation</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>How does X affect Y? Mediation uncovers the mechanism — the intermediate variable M through which X's effect travels. It's one of the most common analyses in management research, and one of the most frequently misused.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.grn : C.txD, borderBottom: `2px solid ${tab === t.id ? C.grn : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "concept" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="What is mediation?" sub='"How" or "why" does X affect Y?' />
          <Pr>In Module 8, we asked <em>when</em> X affects Y (moderation). Now we ask the other big question: <strong>through what mechanism</strong> does X affect Y? Mediation identifies an intermediate variable M — the pathway through which X's effect travels to reach Y.</Pr>

          <CBox title={<>🔗 The Mediation Diagram</>} color={C.grn}>
            <ConceptViz />
          </CBox>

          <Anl>Think of a domino chain. X is the first domino, Y is the last domino, and M is a domino in between. Pushing X doesn't magically topple Y — the force travels <em>through</em> M. Mediation analysis asks: how much of the force goes through this particular intermediate domino?</Anl>

          <NBtn onClick={() => setTab("paths")} label="Next: The Three Paths →" />
        </div>}

        {tab === "paths" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Decomposing the total effect" sub="Paths a, b, c, and c' — how the effect splits" />
          <Pr>Mediation decomposes X's total effect on Y into two pieces: the part that goes <strong>through M</strong> (the indirect effect = a × b) and the part that goes <strong>directly</strong> from X to Y (the direct effect = c'). Together they add up to the total effect (c).</Pr>

          <CBox title={<>🔀 Interactive Path Diagram</>} color={C.grn}>
            <PathsViz />
          </CBox>

          <NBtn onClick={() => setTab("testing")} label="Next: Testing Mediation →" />
        </div>}

        {tab === "testing" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="How to test mediation" sub="From Baron & Kenny to modern bootstrapping" />
          <Pr>The central question is: <strong>is the indirect effect (a × b) significantly different from zero?</strong> The method for answering this has evolved significantly. Click through the three approaches to see the progression:</Pr>

          <CBox title={<>🧪 Three Approaches to Mediation Testing</>} color={C.grn}>
            <TestingViz />
          </CBox>

          <Ins>
            <strong>Bottom line for your papers:</strong> Use <strong>bootstrapped confidence intervals</strong> for the indirect effect. Report the point estimate of a × b and the 95% bootstrap CI. If the CI excludes zero, the indirect effect is significant. You don't need to report Baron & Kenny's four steps anymore — but understand them because reviewers trained on older methods may ask about them.
          </Ins>

          <NBtn onClick={() => setTab("mistakes")} label="Next: Common Mistakes →" />
        </div>}

        {tab === "mistakes" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Critical pitfalls" sub="Mediation is easy to run but hard to do right" />

          <CBox title={<>⚠️ What Goes Wrong with Mediation</>} color={C.grn}>
            <MistakesViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>Mediation</strong> asks "how/why does X affect Y?" The mediator M is the mechanism: X → M → Y.<br />
              <strong>2.</strong> The total effect decomposes: <strong>c = a×b + c'</strong> (total = indirect + direct). The <strong>indirect effect (a×b)</strong> is what you're testing.<br />
              <strong>3.</strong> Use <strong>bootstrapped CIs</strong> for the indirect effect (Hayes PROCESS or equivalent). Baron & Kenny's 4-step approach is outdated; the Sobel test assumes normality of a×b, which is often wrong.<br />
              <strong>4.</strong> Mediation makes <strong>causal claims</strong>. With cross-sectional data, use cautious language ("consistent with mediation"). Better: longitudinal designs with temporal separation or experimental manipulation.<br />
              <strong>5.</strong> A <strong>non-significant total effect (c) does not rule out mediation</strong>. Indirect and direct effects can cancel each other out.<br />
              <strong>6.</strong> The M→Y path is vulnerable to <strong>confounders</strong>. Even if X is randomized, unmeasured variables can bias path b and the indirect effect.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
