import { useState, useRef, useCallback, useEffect } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function normalPDF(x, mu = 0, s = 1) {
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / s) ** 2);
}
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422802 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
function buildHist(vals, bc = 40, range = [-4, 4]) {
  const bw = (range[1] - range[0]) / bc;
  const bins = Array(bc).fill(0);
  vals.forEach(v => { const i = Math.min(Math.floor((v - range[0]) / bw), bc - 1); if (i >= 0 && i < bc) bins[i]++; });
  return bins.map((c, i) => ({ x: range[0] + i * bw + bw / 2, count: c, width: bw }));
}

// ─── Colors ─────────────────────────────────────────────────────────
const C = {
  bg: "#FAFBFC", card: "#FFFFFF", bdr: "#E2E8F0",
  sh: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  pop: "#D97706", popBg: "rgba(217,119,6,0.06)", popLt: "#FEF3C7",
  sam: "#0284C7", samBg: "rgba(2,132,199,0.06)", samLt: "#E0F2FE",
  smp: "#7C3AED", smpBg: "rgba(124,58,237,0.05)", smpLt: "#EDE9FE",
  grn: "#059669", grnBg: "rgba(5,150,105,0.06)",
  rose: "#E11D48", roseBg: "rgba(225,29,72,0.06)", roseLt: "#FFF1F2",
  tx: "#1E293B", txB: "#334155", txD: "#64748B", txM: "#94A3B8",
  grid: "rgba(148,163,184,0.12)",
};
const font = "'DM Sans', sans-serif";
const mono = "'DM Mono', monospace";
const serif = "'Source Serif 4', serif";

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
function CBox({ children, title, color = C.sam }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) {
  return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>;
}
function Ins({ children }) {
  return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>;
}
function GoDeeperBox({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", marginTop: "12px", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "12px 18px", border: "none", background: "transparent",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", fontFamily: font,
      }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: C.smp }}>{"\u{1F9D0}"} Going Deeper: {title}</span>
        <span style={{ fontSize: "16px", color: C.smp, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>{"\u25BC"}</span>
      </button>
      {open && <div style={{ padding: "0 18px 16px", animation: "fadeIn 0.3s ease" }}>{children}</div>}
    </div>
  );
}
function AB({ onClick, label, primary, danger, muted, disabled }) {
  const bg = primary ? C.smp : danger ? "rgba(239,68,68,0.08)" : "transparent";
  const bd = primary ? C.smp : danger ? "#ef4444" : C.bdr;
  const cl = primary ? "#fff" : danger ? "#ef4444" : muted ? C.txM : C.tx;
  return <button onClick={onClick} disabled={disabled} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${bd}`, background: bg, color: cl, fontSize: "13px", fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: font, opacity: disabled ? 0.45 : 1 }}>{label}</button>;
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: COURTROOM
// ═══════════════════════════════════════════════════════════════════
function CourtroomViz() {
  const [step, setStep] = useState(0);
  const steps = [
    { court: "Defendant is assumed innocent", science: "The treatment is assumed to have no effect (H₀)", label: "Start with a default assumption" },
    { court: "Prosecutor presents evidence", science: "You collect data and compute a test statistic", label: "Gather evidence" },
    { court: "Jury asks: could this evidence appear if they were innocent?", science: "Ask: how likely is this data if H₀ were true?", label: "Evaluate the evidence" },
    { court: "If evidence is overwhelming → guilty verdict", science: "If the data is very unlikely under H₀ → reject the null", label: "Make a decision" },
  ];
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "16px" }}>
        Hypothesis testing works exactly like a courtroom trial. Click through to see the parallel:
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "240px", background: C.popLt, borderRadius: "12px", padding: "18px 20px", border: "1px solid rgba(217,119,6,0.2)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.pop, fontFamily: mono, marginBottom: "10px" }}>{"\u2696\uFE0F"} COURTROOM</div>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "6px", background: i <= step ? "#fff" : "transparent", border: `1px solid ${i <= step ? C.pop + "33" : "transparent"}`, opacity: i <= step ? 1 : 0.35, transition: "all 0.3s", fontSize: "13px", color: C.txB, fontWeight: i === step ? 600 : 400, lineHeight: 1.5 }}>
              <span style={{ fontFamily: mono, fontSize: "11px", color: C.pop, marginRight: "6px" }}>{i + 1}.</span>{s.court}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: "240px", background: C.smpLt, borderRadius: "12px", padding: "18px 20px", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "10px" }}>{"\u{1F52C}"} HYPOTHESIS TEST</div>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "6px", background: i <= step ? "#fff" : "transparent", border: `1px solid ${i <= step ? C.smp + "33" : "transparent"}`, opacity: i <= step ? 1 : 0.35, transition: "all 0.3s", fontSize: "13px", color: C.txB, fontWeight: i === step ? 600 : 400, lineHeight: 1.5 }}>
              <span style={{ fontFamily: mono, fontSize: "11px", color: C.smp, marginRight: "6px" }}>{i + 1}.</span>{s.science}
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "16px", padding: "10px 16px", background: C.bg, borderRadius: "10px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>Step {step + 1} of 4</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.tx }}>{steps[step].label}</div>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: step === 0 ? C.txM : C.txB, fontSize: "12px", fontWeight: 600, cursor: step === 0 ? "default" : "pointer", fontFamily: font, opacity: step === 0 ? 0.5 : 1 }}>{"←"} Back</button>
        <button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step === 3} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.smp}`, background: step === 3 ? "transparent" : C.smpBg, color: step === 3 ? C.txM : C.smp, fontSize: "12px", fontWeight: 600, cursor: step === 3 ? "default" : "pointer", fontFamily: font, opacity: step === 3 ? 0.5 : 1 }}>Next {"→"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: EFFECT SIZE VIZ
// ═══════════════════════════════════════════════════════════════════
function EffectSizeViz() {
  const [d, setD] = useState(0.5);
  const W = 480, H = 160, pad = { t: 20, r: 16, b: 28, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const range = [-4, 6];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;
  const curve = (mu) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const x = range[0] + (i / 200) * (range[1] - range[0]);
      pts.push({ x, y: normalPDF(x, mu, 1) });
    }
    return pts;
  };
  const c0 = curve(0), c1 = curve(d);
  const mx = Math.max(...c0.map(p => p.y));
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ");
  const label = d === 0 ? "No effect" : d <= 0.3 ? "Small effect" : d <= 0.6 ? "Medium effect" : "Large effect";
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
        <strong>Effect size</strong> measures <em>how big</em> a difference or relationship is, independent of sample size. The most common measure is <strong>Cohen's d</strong>, which expresses the difference in units of standard deviation. Drag the slider to see what different effect sizes look like:
      </div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Effect Size (Cohen's d)</div>
        <input type="range" min="0" max="2" step="0.1" value={d} onChange={e => setD(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.grn }} />
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn, fontFamily: mono }}>d = {d.toFixed(1)} &mdash; {label}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "500px", display: "block" }}>
        <path d={toPath(c0)} fill="none" stroke={C.txD} strokeWidth="2.5" />
        <path d={toPath(c1)} fill="none" stroke={C.grn} strokeWidth="2.5" />
        <line x1={sc(0)} x2={sc(0)} y1={pad.t} y2={pad.t + ch} stroke={C.txD} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
        {d > 0 && <line x1={sc(d)} x2={sc(d)} y1={pad.t} y2={pad.t + ch} stroke={C.grn} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />}
        {d > 0 && <>
          <line x1={sc(0)} x2={sc(d)} y1={pad.t + ch - 6} y2={pad.t + ch - 6} stroke={C.pop} strokeWidth="2" />
          <text x={sc(d / 2)} y={pad.t + ch - 12} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.pop} fontFamily={mono}>d = {d.toFixed(1)}</text>
        </>}
        <text x={sc(0)} y={pad.t - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.txD} fontFamily={font}>Control</text>
        {d > 0 && <text x={sc(d)} y={pad.t - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.grn} fontFamily={font}>Treatment</text>}
        {[-3, -2, -1, 0, 1, 2, 3, 4, 5].filter(v => v >= range[0] && v <= range[1]).map(v => <text key={v} x={sc(v)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>
      <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px", lineHeight: 1.7 }}>
        The grey curve is the control group (no treatment). The green curve is the treatment group. <strong>d</strong> is the gap between their centers, measured in standard deviations.
        {d === 0 && " When d = 0, the curves overlap perfectly — the treatment does nothing."}
        {d > 0 && d <= 0.3 && " At d = " + d.toFixed(1) + ", the curves mostly overlap. The effect exists, but it's subtle — hard to notice for any individual."}
        {d > 0.3 && d <= 0.6 && " At d = " + d.toFixed(1) + ", you can clearly see the shift. A noticeable, meaningful difference."}
        {d > 0.6 && " At d = " + d.toFixed(1) + ", the curves are clearly separated. A large, obvious effect."}
      </div>
    </div>
  );
}

// ─── Alpha threshold viz ────────────────────────────────────────────
function AlphaViz() {
  const [alpha, setAlpha] = useState(0.05);
  const zCrit = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
  const W = 480, H = 140, pad = { t: 16, r: 16, b: 28, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const range = [-4, 4];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;
  const pts = [];
  for (let i = 0; i <= 200; i++) { const x = range[0] + (i / 200) * (range[1] - range[0]); pts.push({ x, y: normalPDF(x) }); }
  const mx = Math.max(...pts.map(p => p.y));
  const curvePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ");
  const tailPath = (lo, hi) => {
    const f = pts.filter(p => p.x >= lo && p.x <= hi);
    if (!f.length) return "";
    return f.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ") + ` L${sc(f[f.length - 1].x)},${pad.t + ch} L${sc(f[0].x)},${pad.t + ch} Z`;
  };
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
        <strong>Significance level (α)</strong> is the threshold you set <em>before</em> looking at data. It answers: "How much risk of a false alarm am I willing to accept?" The red-shaded tails show the "rejection region" — if your result lands there, you reject H{"₀"}.
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px" }}>
        {[{ a: 0.10, label: "α = 0.10", desc: "Lenient — 10% false alarm risk" }, { a: 0.05, label: "α = 0.05", desc: "Standard — 5% false alarm risk" }, { a: 0.01, label: "α = 0.01", desc: "Strict — 1% false alarm risk" }].map(opt => (
          <button key={opt.a} onClick={() => setAlpha(opt.a)} style={{
            padding: "8px 16px", borderRadius: "10px", border: "1.5px solid",
            borderColor: alpha === opt.a ? C.rose : C.bdr,
            background: alpha === opt.a ? C.roseBg : "transparent",
            color: alpha === opt.a ? C.rose : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
          }}>
            <span style={{ fontFamily: mono }}>{opt.label}</span>
            <span style={{ fontSize: "10px", fontWeight: 400, opacity: 0.7 }}>{opt.desc}</span>
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "500px", display: "block", margin: "0 auto" }}>
        <path d={tailPath(zCrit, range[1])} fill={C.rose} opacity="0.25" />
        <path d={tailPath(range[0], -zCrit)} fill={C.rose} opacity="0.25" />
        <path d={curvePath} fill="none" stroke={C.txD} strokeWidth="2.5" />
        <line x1={sc(zCrit)} x2={sc(zCrit)} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" />
        <line x1={sc(-zCrit)} x2={sc(-zCrit)} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" />
        <text x={sc(zCrit + 0.7)} y={pad.t + 14} fontSize="10" fill={C.rose} fontFamily={mono} fontWeight="600">{(alpha / 2 * 100).toFixed(1)}%</text>
        <text x={sc(-zCrit - 0.7)} y={pad.t + 14} fontSize="10" fill={C.rose} fontFamily={mono} fontWeight="600" textAnchor="end">{(alpha / 2 * 100).toFixed(1)}%</text>
        <text x={sc(0)} y={pad.t + ch * 0.45} textAnchor="middle" fontSize="11" fill={C.txD} fontFamily={font} fontWeight="600">{((1 - alpha) * 100).toFixed(0)}% safe zone</text>
        {[-3, -2, -1, 0, 1, 2, 3].map(v => <text key={v} x={sc(v)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>
      <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px", lineHeight: 1.7, textAlign: "center" }}>
        At α = {alpha}, you reject H{"₀"} if your test statistic falls beyond ±{zCrit.toFixed(2)} (the red tails).
        {alpha === 0.10 && " More lenient — easier to reject, but more false alarms."}
        {alpha === 0.05 && " The conventional standard in most social science research."}
        {alpha === 0.01 && " Very strict — fewer false alarms, but you'll miss more real effects."}
      </div>
    </div>
  );
}

// ─── Power concept viz: flashlight analogy ──────────────────────────
function PowerConceptViz() {
  const [n, setN] = useState(30);
  const [eff, setEff] = useState(0.5);

  // Power approximation
  const se = 1 / Math.sqrt(n);
  const zCrit = 1.96;
  const zBeta = (eff / se) - zCrit;
  const power = normalCDF(zBeta);
  const powerPct = Math.max(0, Math.min(100, power * 100));

  const barColor = powerPct < 50 ? C.pop : powerPct < 80 ? C.pop : C.grn;
  const barLabel = powerPct < 50 ? "Low — you'll probably miss a real effect" : powerPct < 80 ? "Moderate — coin flip territory" : "Good — you'll likely detect a real effect";

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        <strong>Power</strong> is your study's ability to detect a real effect when one exists. Think of it as the "sensitivity" of your test. If power is low, a real effect could be right in front of you and your test would still say "nothing found."
      </div>

      <Anl>Imagine searching for a friend in a dark park with a flashlight. <strong>Effect size</strong> is how tall your friend is (easier to spot a 7-footer than a child). <strong>Sample size</strong> is how bright your flashlight is. <strong>Power</strong> is the chance you actually find them. A dim flashlight (small n) searching for a short person (small effect) = low power. A spotlight (large n) searching for a giant (large effect) = high power.</Anl>

      <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "10px", marginTop: "16px" }}>What affects power? Try it:</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Sample Size (your flashlight)</div>
          <input type="range" min="5" max="200" step="5" value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.sam, fontFamily: mono }}>n = {n} {n <= 15 ? "(tiny)" : n <= 40 ? "(typical)" : n <= 100 ? "(good)" : "(large)"}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Effect Size (how big the difference is)</div>
          <input type="range" min="0.1" max="1.5" step="0.05" value={eff} onChange={e => setEff(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>d = {eff.toFixed(2)} {eff <= 0.3 ? "(small)" : eff <= 0.6 ? "(medium)" : "(large)"}</div>
        </div>
      </div>

      {/* Power meter */}
      <div style={{ background: C.bg, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "8px" }}>Statistical Power</div>
        <div style={{ fontSize: "42px", fontWeight: 700, color: barColor, fontFamily: font }}>{powerPct.toFixed(0)}%</div>
        <div style={{ width: "100%", maxWidth: "400px", height: "12px", borderRadius: "6px", background: C.bdr, margin: "10px auto", overflow: "hidden" }}>
          <div style={{ width: `${powerPct}%`, height: "100%", borderRadius: "6px", background: `linear-gradient(90deg, ${C.rose}, ${C.pop}, ${C.grn})`, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "400px", margin: "0 auto", fontSize: "9px", color: C.txM, fontFamily: mono }}>
          <span>0% (blind)</span><span>80% (conventional target)</span><span>100% (perfect)</span>
        </div>
        <div style={{ fontSize: "13px", color: C.txD, marginTop: "10px", fontStyle: "italic" }}>{barLabel}</div>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>The 80% rule:</strong> Researchers conventionally aim for at least 80% power. This means if there's a real effect, you have an 80% chance of detecting it (and a 20% chance of missing it). Before collecting data, researchers do a <strong>power analysis</strong> to figure out how large their sample needs to be to reach 80% power for a given expected effect size.
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "8px", lineHeight: 1.7 }}>
        <strong>Try this:</strong> Set effect = 0.20 (small) with n = 30. Power is very low. Now increase n to 200 — watch power climb. Small effects require big samples. Alternatively, set effect = 0.80 (large) — even n = 20 gives decent power. This is why <strong>underpowered studies</strong> are a major problem in social science: many studies use sample sizes too small to detect the effects they're looking for.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: P-VALUE SIMULATOR (FIXED)
// ═══════════════════════════════════════════════════════════════════

// ─── Standard Error concept viz ──────────────────────────────────────
function SEConceptViz() {
  const [n, setN] = useState(10);
  const sd = 15; // fixed population SD
  const se = sd / Math.sqrt(n);
  const seAtN = (nv) => sd / Math.sqrt(nv);
  const sizeSteps = [5, 10, 25, 50, 100, 200, 500];

  const W = 480, H = 140, pad = { t: 16, r: 16, b: 28, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const range = [20, 80];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;

  // Draw two curves: population spread vs sampling distribution spread
  const makeCurve = (sigma) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const x = range[0] + (i / 200) * (range[1] - range[0]);
      pts.push({ x, y: normalPDF(x, 50, sigma) });
    }
    return pts;
  };
  const popCurve = makeCurve(sd);
  const seCurve = makeCurve(se);
  const mx = Math.max(...popCurve.map(p => p.y), ...seCurve.map(p => p.y));
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch * 0.95}`).join(" ");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "10px" }}>
        You learned in Module 1 that the <strong>standard error (SE)</strong> is the standard deviation of the sampling distribution — it measures how much your sample mean bounces around from sample to sample. But where does it come from? There's a beautifully simple formula:
      </div>
      <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 24px", marginTop: "8px", marginBottom: "14px", textAlign: "center", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "20px", fontFamily: mono, color: C.sam, fontWeight: 600 }}>
          SE = SD / √n
        </div>
        <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px" }}>
          Standard deviation of the data divided by the square root of sample size
        </div>
      </div>

      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginBottom: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.pop }}>Important subtlety:</strong> The SD in this formula is technically the population's true SD (statisticians write it as <strong>σ</strong>). But here's the catch — <strong>you almost never know the population SD</strong>, for the same reason you don't know the population mean: you can't observe everyone. So in practice, you estimate it using the <strong>sample SD</strong> (written as <strong>s</strong>), which you calculate from your actual data. The formula becomes SE = s / √n. This is what every statistics software does automatically. The estimate is quite good when n is reasonably large (say, 30+).
      </div>

      <GoDeeperBox title="Where does the adjustment hide? (Bessel's correction &amp; the t-distribution)">
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75 }}>
          <p style={{ marginBottom: "10px" }}>You might wonder: if we're using an <em>estimate</em> of SD instead of the real thing, don't we need some kind of correction? Yes — but it's built into two places you've already been using without realizing:</p>
          <p style={{ marginBottom: "10px" }}><strong>1. Bessel's correction (inside the sample SD).</strong> When computing the sample SD, we divide by <strong>n − 1</strong> instead of n:</p>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 16px", margin: "8px 0 12px", textAlign: "center", border: `1px solid ${C.bdr}`, fontFamily: mono, fontSize: "14px", color: C.smp }}>
            s = √[ Σ(xᵢ − x̄)² / (<strong>n − 1</strong>) ]
          </div>
          <p style={{ marginBottom: "10px" }}>Why n − 1? Your sample data points are slightly closer to the <em>sample mean</em> than to the <em>true population mean</em> (because the sample mean was calculated to fit them). Dividing by n would systematically underestimate the true spread. Dividing by n − 1 corrects this bias. Every statistics software (Stata, R, SPSS) does this by default — when they report "SD," it's already using n − 1.</p>
          <p style={{ marginBottom: "10px" }}><strong>2. The t-distribution (instead of the normal).</strong> Because we're estimating σ with s, we've introduced extra uncertainty. To account for this, we don't compare our test statistic to a normal distribution — we use the <strong>t-distribution</strong>, which has heavier tails (meaning more probability in the extremes). This makes it slightly harder to reach significance, which is the appropriate price for not knowing σ.</p>
          <p>The t-distribution has a parameter called <strong>degrees of freedom</strong> (usually n − 1). When n is small, the t-distribution has much fatter tails than the normal — you need a more extreme result to reject H₀. As n grows, s gets closer to σ, the extra uncertainty shrinks, and the t-distribution converges on the normal. By n ≈ 30+, the difference is negligible.</p>
        </div>
      </GoDeeperBox>

      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Either way, the core insight is the same: <strong>the only thing you can control to shrink SE is sample size</strong>. The population's spread is a fixed fact about the world. But by collecting more data, you divide by a larger √n, and your estimate becomes more precise. Drag the slider to see this happen:
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Sample Size (n)</div>
        <input type="range" min="5" max="500" step="5" value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.sam }} />
        <div style={{ display: "flex", gap: "16px", fontSize: "13px", fontFamily: mono, fontWeight: 600, marginTop: "4px" }}>
          <span style={{ color: C.sam }}>n = {n}</span>
          <span style={{ color: C.txD }}>SD (of data) = {sd}</span>
          <span style={{ color: C.smp }}>SE = {sd} / √{n} = <strong>{se.toFixed(2)}</strong></span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "500px", display: "block" }}>
        {[20, 30, 40, 50, 60, 70, 80].map(v => <line key={v} x1={sc(v)} x2={sc(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
        {/* Population curve - faded */}
        <path d={toPath(popCurve)} fill="none" stroke={C.txM} strokeWidth="1.5" strokeDasharray="5,4" opacity="0.5" />
        {/* SE curve */}
        <path d={toPath(seCurve)} fill="none" stroke={C.smp} strokeWidth="2.5" />
        {/* Mean line */}
        <line x1={sc(50)} x2={sc(50)} y1={pad.t} y2={pad.t + ch} stroke={C.grn} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
        {/* SE bracket */}
        {se < 25 && <>
          <line x1={sc(50 - se)} x2={sc(50 + se)} y1={pad.t + 8} y2={pad.t + 8} stroke={C.smp} strokeWidth="2" />
          <line x1={sc(50 - se)} x2={sc(50 - se)} y1={pad.t + 4} y2={pad.t + 12} stroke={C.smp} strokeWidth="2" />
          <line x1={sc(50 + se)} x2={sc(50 + se)} y1={pad.t + 4} y2={pad.t + 12} stroke={C.smp} strokeWidth="2" />
          <text x={sc(50)} y={pad.t + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.smp} fontFamily={mono}>±1 SE = ±{se.toFixed(1)}</text>
        </>}
        <text x={sc(75)} y={pad.t + ch - 4} fontSize="9" fill={C.txM} fontFamily={font} opacity="0.6">population (SD={sd})</text>
        <text x={sc(75)} y={pad.t + ch - 16} fontSize="9" fill={C.smp} fontFamily={font} fontWeight="600">sampling dist (SE={se.toFixed(1)})</text>
        {[20, 30, 40, 50, 60, 70, 80].map(v => <text key={v} x={sc(v)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>

      {/* SE at different n - table */}
      <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginTop: "14px", flexWrap: "wrap" }}>
        {sizeSteps.map(nv => (
          <div key={nv} style={{
            padding: "6px 10px", borderRadius: "8px", textAlign: "center",
            background: n === nv ? C.smpBg : C.bg,
            border: `1px solid ${n === nv ? C.smp + "44" : C.bdr}`,
            cursor: "pointer", minWidth: "58px",
          }} onClick={() => setN(nv)}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>n={nv}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: n === nv ? C.smp : C.txB, fontFamily: mono }}>{seAtN(nv).toFixed(1)}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "12px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Notice the diminishing returns:</strong> going from n=5 to n=25 cuts SE dramatically (from {seAtN(5).toFixed(1)} to {seAtN(25).toFixed(1)}). But going from n=200 to n=500 barely makes a difference ({seAtN(200).toFixed(1)} to {seAtN(500).toFixed(1)}). This is because of the square root — you need to <em>quadruple</em> your sample to cut SE in half. This is why researchers do power analyses: to find the sweet spot where adding more data still meaningfully improves precision.
      </div>
    </div>
  );
}

// ─── Sample size demo for p-value tab ───────────────────────────────
function SampleSizeDemo() {
  const effect = 0.3;
  const [results, setResults] = useState(null);

  const runExperiment = () => {
    const sizes = [10, 30, 100, 500];
    const res = sizes.map(n => {
      const vals = Array.from({ length: n }, () => rNorm(effect, 1));
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const se = 1 / Math.sqrt(n);
      const t = mean / se;
      // approximate two-tailed p-value from t
      const p = 2 * (1 - normalCDF(Math.abs(t)));
      return { n, t: t.toFixed(2), se: se.toFixed(3), p };
    });
    setResults(res);
  };

  return (
    <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", marginTop: "20px", boxShadow: C.sh }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "8px" }}>Why does sample size matter for p-values?</div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "12px" }}>
        The same true effect (d = 0.3, a small effect) is tested with four different sample sizes — <em>simultaneously, from the same population</em>. Watch how the t-statistic grows and the p-value shrinks as n increases:
      </div>
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <button onClick={runExperiment} style={{ padding: "9px 24px", borderRadius: "9px", border: "none", background: C.sam, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Run Experiment (same effect, 4 sample sizes)</button>
      </div>

      {results && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {results.map(r => (
              <div key={r.n} style={{ background: C.bg, borderRadius: "10px", border: `1px solid ${r.p < 0.05 ? C.rose + "44" : C.bdr}`, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono, marginBottom: "6px" }}>n = {r.n}</div>
                <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>SE = {r.se}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: C.sam, fontFamily: font, margin: "4px 0" }}>t = {r.t}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: r.p < 0.05 ? C.rose : C.txD, fontFamily: mono }}>{r.p < 0.001 ? "p < .001" : "p = " + r.p.toFixed(3)}</div>
                <div style={{ fontSize: "10px", marginTop: "4px", color: r.p < 0.05 ? C.rose : C.txD, fontWeight: 600 }}>{r.p < 0.05 ? "Significant!" : "Not significant"}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "12px", color: C.txD, marginTop: "12px", lineHeight: 1.7, fontStyle: "italic" }}>
            <strong>Same real effect, different conclusions.</strong> The standard error (SE) shrinks as n grows, making the t-statistic larger. Larger t = more extreme = smaller p-value. This is why a non-significant result doesn't mean "no effect" — it might just mean "not enough data." Click again to see the randomness — results vary each time, but the pattern holds.
          </div>
        </div>
      )}
    </div>
  );
}

function PValueSim() {
  const [trueEffect, setTrueEffect] = useState(0.5);
  const [sampleSize, setSampleSize] = useState(30);
  const [observed, setObserved] = useState(null); // { mean, se, t }
  const [nullDist, setNullDist] = useState([]);
  const [running, setRunning] = useState(false);
  const intRef = useRef(null);
  const nullRef = useRef([]);

  const reset = useCallback(() => {
    if (intRef.current) clearInterval(intRef.current);
    setRunning(false); setObserved(null); setNullDist([]); nullRef.current = [];
  }, []);

  useEffect(() => { reset(); }, [trueEffect, sampleSize, reset]);
  useEffect(() => () => { if (intRef.current) clearInterval(intRef.current); }, []);

  const drawReal = useCallback(() => {
    const vals = Array.from({ length: sampleSize }, () => rNorm(trueEffect, 1));
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const se = 1 / Math.sqrt(sampleSize);
    setObserved({ mean, se, t: mean / se });
  }, [trueEffect, sampleSize]);

  const addNull = useCallback((n = 1) => {
    for (let j = 0; j < n; j++) {
      const vals = Array.from({ length: sampleSize }, () => rNorm(0, 1));
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const se = 1 / Math.sqrt(sampleSize);
      nullRef.current.push(mean / se);
    }
    setNullDist([...nullRef.current]);
  }, [sampleSize]);

  const toggleRun = useCallback(() => {
    if (running) { clearInterval(intRef.current); setRunning(false); }
    else { setRunning(true); intRef.current = setInterval(() => addNull(5), 50); }
  }, [running, addNull]);

  // Dynamic range based on observed value
  const absObs = observed !== null ? Math.abs(observed.t) : 3;
  const rangeMax = Math.max(5, Math.ceil(absObs) + 2);
  const range = [-rangeMax, rangeMax];

  const pValue = observed !== null && nullDist.length > 20
    ? nullDist.filter(v => Math.abs(v) >= Math.abs(observed.t)).length / nullDist.length
    : null;

  const W = 600, H = 200, pad = { t: 28, r: 24, b: 32, l: 24 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;
  const bins = buildHist(nullDist, 60, range);
  const mc = Math.max(...bins.map(b => b.count), 1);

  // Tick generation
  const ticks = [];
  const tickStep = rangeMax > 8 ? 2 : 1;
  for (let v = Math.ceil(range[0] / tickStep) * tickStep; v <= Math.floor(range[1]); v += tickStep) ticks.push(v);

  return (
    <div>
      <div style={{ background: C.samBg, border: "1px solid rgba(2,132,199,0.15)", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}>
        <strong style={{ color: C.sam }}>Why do we set a "true effect"?</strong> In real research, you never know the truth — that's why you're testing! But this is a <strong>teaching sandbox</strong> where you play God: you decide what's actually happening behind the scenes, then see how the testing machinery responds. This lets you discover things like "even when the effect is real, I sometimes miss it" or "even when there's no effect, I sometimes find one."
      </div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7, marginBottom: "14px" }}>
        Set a true effect size, draw a real sample, then build the null distribution to see where your result lands:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>True Effect Size (Cohen's d)</div>
          <input type="range" min="0" max="1.5" step="0.1" value={trueEffect}
            onChange={e => setTrueEffect(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>{trueEffect.toFixed(1)} {trueEffect === 0 ? "(no effect)" : trueEffect <= 0.3 ? "(small)" : trueEffect <= 0.7 ? "(medium)" : "(large)"}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>Sample Size</div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[10, 30, 100].map(n => (
              <button key={n} onClick={() => setSampleSize(n)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid", borderColor: sampleSize === n ? C.sam : C.bdr, background: sampleSize === n ? C.samBg : "transparent", color: sampleSize === n ? C.sam : C.txD, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: mono }}>n={n}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <AB onClick={drawReal} primary label="1. Draw Real Sample" />
        <AB onClick={() => addNull(100)} disabled={!observed} label="2. Simulate 100 Null Samples" />
        <AB onClick={toggleRun} disabled={!observed} label={running ? "\u23F8 Stop" : "\u25B6 Auto-Run Null"} danger={running} />
        <AB onClick={reset} label="Reset" muted />
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.txD, fontFamily: mono }}>NULL DISTRIBUTION (what happens if H{"₀"} is true)</div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono }}>{nullDist.length} simulations</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
          {ticks.map(v => <line key={v} x1={sc(v)} x2={sc(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}

          {/* Tail shading */}
          {observed !== null && nullDist.length > 20 && bins.map((b, i) => {
            if (Math.abs(b.x) < Math.abs(observed.t)) return null;
            const bw = (b.width / (range[1] - range[0])) * cw;
            const bh = (b.count / mc) * ch;
            return <rect key={`t-${i}`} x={pad.l + ((b.x - b.width / 2 - range[0]) / (range[1] - range[0])) * cw} y={pad.t + ch - bh} width={bw - 0.5} height={bh} fill={C.rose} opacity="0.35" rx="1" />;
          })}

          {/* Histogram */}
          {bins.map((b, i) => {
            const bw = (b.width / (range[1] - range[0])) * cw;
            const bh = (b.count / mc) * ch;
            return <rect key={i} x={pad.l + ((b.x - b.width / 2 - range[0]) / (range[1] - range[0])) * cw} y={pad.t + ch - bh} width={bw - 0.5} height={bh} fill={C.txD} opacity="0.2" rx="1" />;
          })}

          {/* Observed line */}
          {observed !== null && (() => {
            const obsX = sc(observed.t);
            const clampedX = Math.max(pad.l + 60, Math.min(W - pad.r - 60, obsX));
            const anchor = obsX < W / 2 ? "start" : "end";
            const labelX = obsX < W / 2 ? Math.max(pad.l + 4, obsX + 6) : Math.min(W - pad.r - 4, obsX - 6);
            return <>
              <line x1={obsX} x2={obsX} y1={pad.t} y2={pad.t + ch} stroke={C.rose} strokeWidth="2.5" />
              <rect x={labelX - (anchor === "end" ? 110 : 0)} y={pad.t} width="112" height="18" rx="4" fill="#fff" stroke={C.rose} strokeWidth="1" opacity="0.9" />
              <text x={labelX - (anchor === "end" ? 54 : -54)} y={pad.t + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.rose} fontFamily={mono}>Your t = {observed.t.toFixed(2)}</text>
            </>;
          })()}

          {ticks.map(v => <text key={v} x={sc(v)} y={H - 6} textAnchor="middle" fontSize="10" fill={C.txM} fontFamily={mono}>{v}</text>)}
          <text x={sc(0)} y={H - 18} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={font}>test statistic</text>
        </svg>

        {/* P-value display */}
        {pValue !== null && (
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "12px", padding: "14px 18px", borderRadius: "10px", background: pValue < 0.05 ? C.roseBg : C.grnBg, border: `1px solid ${pValue < 0.05 ? "rgba(225,29,72,0.15)" : "rgba(5,150,105,0.15)"}` }}>
            <div style={{ textAlign: "center", minWidth: "70px" }}>
              <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>p-value</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: pValue < 0.05 ? C.rose : C.grn, fontFamily: font }}>{pValue < 0.001 ? "<.001" : pValue.toFixed(3)}</div>
            </div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.6, flex: 1 }}>
              <strong>The red-shaded area</strong> shows all null simulations that produced a result as extreme as yours (or more).
              {pValue < 0.05
                ? <> Only <strong style={{ color: C.rose }}>{(pValue * 100).toFixed(1)}%</strong> did — this is unlikely under the null. At α = 0.05, you would <strong>reject H{"₀"}</strong>.</>
                : <> A full <strong style={{ color: C.grn }}>{(pValue * 100).toFixed(1)}%</strong> did — your result isn't unusual. You would <strong>not reject H{"₀"}</strong>.</>
              }
            </div>
          </div>
        )}
      </div>

      {/* Stats breakdown when observed exists */}
      {observed && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "Sample Mean", value: observed.mean.toFixed(3), color: C.txB },
              { label: "SD (of data)", value: "1.00", color: C.txD },
              { label: "SE = SD / √n", value: observed.se.toFixed(3), color: C.sam },
              { label: "t = Mean / SE", value: observed.t.toFixed(2), color: C.rose },
            ].map(s => (
              <div key={s.label} style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "100px" }}>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: s.color, fontFamily: font }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11px", color: C.txD, textAlign: "center", marginTop: "6px", fontFamily: mono }}>
            Mean ({observed.mean.toFixed(3)}) ÷ SE ({observed.se.toFixed(3)}) = t ({observed.t.toFixed(2)})
          </div>
          <div style={{ fontSize: "11px", color: C.txM, textAlign: "center", marginTop: "4px" }}>
            (In this simulation, the population SD = 1 by design, so SE = 1 / √{sampleSize} = {observed.se.toFixed(3)})
          </div>
        </div>
      )}

      {!observed && <div style={{ fontSize: "13px", color: C.txD, textAlign: "center", marginTop: "12px", fontStyle: "italic" }}>Start by clicking "Draw Real Sample" to get your observed result.</div>}
      {observed && nullDist.length === 0 && <div style={{ fontSize: "13px", color: C.txD, textAlign: "center", marginTop: "12px", fontStyle: "italic" }}>Your sample mean is {observed.mean.toFixed(3)}, divided by SE = {observed.se.toFixed(3)}, giving t = {observed.t.toFixed(2)}. Now build the null distribution to see how unusual this is.</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: ERROR TYPES + POWER
// ═══════════════════════════════════════════════════════════════════
function ErrorTypesViz() {
  const [alpha, setAlpha] = useState(0.05);
  const [effect, setEffect] = useState(2.0);
  const zCrit = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645;
  const powerRight = 1 - normalCDF(zCrit - effect);
  const powerLeft = normalCDF(-zCrit - effect);
  const power = powerRight + powerLeft;
  const beta = 1 - power;

  const W = 540, H = 220, pad = { t: 20, r: 16, b: 36, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const range = [-4, 7];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;

  const nullC = [], altC = [];
  for (let i = 0; i <= 300; i++) {
    const x = range[0] + (i / 300) * (range[1] - range[0]);
    nullC.push({ x, y: normalPDF(x, 0, 1) });
    altC.push({ x, y: normalPDF(x, effect, 1) });
  }
  const mx = Math.max(...nullC.map(p => p.y), ...altC.map(p => p.y));
  const toP = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ");
  const area = (pts, lo, hi) => {
    const f = pts.filter(p => p.x >= lo && p.x <= hi);
    if (!f.length) return "";
    return f.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ") + ` L${sc(f[f.length - 1].x)},${pad.t + ch} L${sc(f[0].x)},${pad.t + ch} Z`;
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>Significance Level (α)</div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[0.01, 0.05, 0.10].map(a => (
              <button key={a} onClick={() => setAlpha(a)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1.5px solid", borderColor: alpha === a ? C.rose : C.bdr, background: alpha === a ? C.roseBg : "transparent", color: alpha === a ? C.rose : C.txD, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: mono }}>α = {a}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>True Effect Size</div>
          <input type="range" min="0.5" max="4" step="0.1" value={effect} onChange={e => setEffect(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.sam, fontFamily: mono }}>d = {effect.toFixed(1)}</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <path d={area(nullC, zCrit, range[1])} fill={C.rose} opacity="0.25" />
        <path d={area(nullC, range[0], -zCrit)} fill={C.rose} opacity="0.25" />
        <path d={area(altC, -zCrit, zCrit)} fill={C.pop} opacity="0.2" />
        <path d={toP(nullC)} fill="none" stroke={C.txD} strokeWidth="2.5" />
        <path d={toP(altC)} fill="none" stroke={C.sam} strokeWidth="2.5" />
        <line x1={sc(zCrit)} x2={sc(zCrit)} y1={pad.t} y2={pad.t + ch + 4} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" />
        <line x1={sc(-zCrit)} x2={sc(-zCrit)} y1={pad.t} y2={pad.t + ch + 4} stroke={C.rose} strokeWidth="1.5" strokeDasharray="5,3" />
        <text x={sc(0)} y={pad.t - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.txD} fontFamily={font}>H{"₀"} (no effect)</text>
        <text x={sc(effect)} y={pad.t - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.sam} fontFamily={font}>H{"₁"} (real effect)</text>
        <text x={sc(Math.min(zCrit + 0.8, range[1] - 0.5))} y={pad.t + ch - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.rose} fontFamily={mono}>Type I (α)</text>
        {beta > 0.02 && <text x={sc(Math.min(zCrit * 0.5, effect - 0.3))} y={pad.t + ch * 0.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.pop} fontFamily={mono}>Type II (β)</text>}
        {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6].filter(v => v >= range[0] && v <= range[1]).map(v => <text key={v} x={sc(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "12px" }}>
        {[
          { label: "Type I (α)", value: (alpha * 100).toFixed(0) + "%", color: C.rose, desc: "False alarm rate" },
          { label: "Type II (β)", value: (beta * 100).toFixed(1) + "%", color: C.pop, desc: "Missed detection" },
          { label: "Power (1–β)", value: (power * 100).toFixed(1) + "%", color: C.grn, desc: "Correct detection" },
          { label: "Threshold", value: "±" + zCrit.toFixed(2), color: C.txD, desc: "Critical value" },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg, borderRadius: "8px", padding: "10px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: s.color, fontFamily: font }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: C.txD }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "14px", lineHeight: 1.7 }}>
        <strong>Try this:</strong> Lower α to 0.01 — the red tails shrink (fewer false alarms), but the orange overlap grows (more missed effects). Then increase effect size — the blue curve slides right, and power rises. This is the fundamental tradeoff.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: SCENARIOS
// ═══════════════════════════════════════════════════════════════════
function PracticeViz() {
  const scenarios = [
    { id: 1, title: "Drug trial", n: 10000, d: 0.02, p: 0.03, lesson: "Statistically significant (p < 0.05), but the effect is clinically meaningless. A 0.5 mmHg blood pressure drop wouldn't change any patient's outcome. Huge samples can make trivial effects 'significant.'" },
    { id: 2, title: "Startup training", n: 25, d: 0.8, p: 0.12, lesson: "Not significant (p > 0.05), but the effect size is large! The small sample just doesn't provide enough power to detect it. This could be a real, important effect that we can't detect yet. Solution: get more data." },
    { id: 3, title: "Management practice", n: 200, d: 0.4, p: 0.002, lesson: "Both significant and practically meaningful. A medium effect with a very small p-value in a reasonably-sized sample — this is the kind of result that's most convincing." },
    { id: 4, title: "Lucky coin", n: 50, d: 0.0, p: 0.04, lesson: "Significant! But the true effect is zero — this is a Type I error happening in real time. With α = 0.05, 1 in 20 tests will 'find' something that isn't there. This is why replication matters." },
  ];
  const descs = [
    "A company tests a new drug on 10,000 patients. Blood pressure drops by 0.5 mmHg on average.",
    "A business school tests entrepreneurship training on 25 students. Trained students score 0.8 SD higher on a venture pitch evaluation.",
    "A study of 200 firms finds that those adopting a new management practice have 0.4 SD higher productivity.",
    "You flip a coin 50 times and get 31 heads. You test whether the coin is fair.",
  ];
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const s = scenarios[active];

  return (
    <div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {scenarios.map((sc, i) => (
          <button key={sc.id} onClick={() => { setActive(i); setRevealed(false); }} style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid", borderColor: active === i ? C.smp : C.bdr, background: active === i ? C.smpBg : "transparent", color: active === i ? C.smp : C.txD, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{sc.title}</button>
        ))}
      </div>
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "24px", boxShadow: C.sh }}>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "16px" }}>{descs[active]}</div>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 18px", border: `1px solid ${C.bdr}`, textAlign: "center", flex: 1, minWidth: "90px" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>SAMPLE SIZE</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: C.sam }}>{s.n.toLocaleString()}</div>
          </div>
          <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 18px", border: `1px solid ${C.bdr}`, textAlign: "center", flex: 1, minWidth: "90px" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>EFFECT SIZE</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: C.grn }}>{s.d.toFixed(2)}</div>
          </div>
          <div style={{ background: s.p < 0.05 ? C.roseBg : C.bg, borderRadius: "10px", padding: "12px 18px", border: `1px solid ${s.p < 0.05 ? "rgba(225,29,72,0.15)" : C.bdr}`, textAlign: "center", flex: 1, minWidth: "90px" }}>
            <div style={{ fontSize: "10px", color: C.txM, fontFamily: mono }}>P-VALUE</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: s.p < 0.05 ? C.rose : C.txB }}>{s.p.toFixed(3)}</div>
            <div style={{ fontSize: "10px", color: s.p < 0.05 ? C.rose : C.txD }}>{s.p < 0.05 ? "significant" : "not significant"}</div>
          </div>
        </div>
        {!revealed ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.tx, marginBottom: "10px" }}>Should you trust and act on this result?</div>
            <button onClick={() => setRevealed(true)} style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: C.smp, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Reveal Takeaway</button>
          </div>
        ) : (
          <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>{s.lesson}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "logic", label: "1. Logic of Testing" },
  { id: "concepts", label: "2. Key Concepts" },
  { id: "pval", label: "3. P-Values" },
  { id: "errors", label: "4. Errors & Power" },
  { id: "practice", label: "5. In Practice" },
];

export default function HypothesisTesting() {
  const [tab, setTab] = useState("logic");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 2 &middot; Statistical Reasoning</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Hypothesis Testing &amp; P-Values</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>How do researchers decide whether an effect is "real" or just noise? This module walks you through the logic, mechanics, and pitfalls of statistical hypothesis testing.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 16px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* ═══ TAB 1: LOGIC ═══ */}
        {tab === "logic" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Innocent until proven guilty" sub="The logical structure behind every hypothesis test" />
          <Pr>In science, we don't try to <em>prove</em> something is true. Instead, we assume nothing is happening (the <strong>null hypothesis</strong>) and then ask: "Is my evidence strong enough to reject that assumption?"</Pr>
          <Pr>This is exactly how a courtroom works. The defendant is presumed innocent. The prosecution must present evidence so overwhelming that the jury cannot maintain that presumption. If the evidence is weak, the verdict is "not guilty" &mdash; which isn't the same as "innocent."</Pr>

          <CBox title={<>{"\u2696\uFE0F"} The courtroom parallel</>} color={C.smp}>
            <CourtroomViz />
          </CBox>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <CBox title={<>H{"₀"}: Null Hypothesis</>} color={C.txD}>
              <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
                The "default" position: <strong>nothing is happening</strong>. The treatment has no effect. The two groups are the same. We assume this is true until evidence convinces us otherwise.
              </div>
            </CBox>
            <CBox title={<>H{"₁"}: Alternative Hypothesis</>} color={C.sam}>
              <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
                What you believe might be true: <strong>something is happening</strong>. The treatment works. The groups differ. You need strong evidence to conclude this.
              </div>
            </CBox>
          </div>

          <Anl>Think of a fire alarm. The null hypothesis is "there's no fire." The alarm goes off when there's enough smoke (evidence). A <strong>false alarm</strong> = no fire but the alarm rang. A <strong>missed fire</strong> = there was a fire but the alarm stayed silent.</Anl>

          <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "16px 20px", marginTop: "12px", fontSize: "14px", lineHeight: 1.7, color: C.txB }}>
            <strong style={{ color: C.pop }}>Critical distinction:</strong> "Fail to reject H{"₀"}" does <em>not</em> mean "H{"₀"} is true." Just like "not guilty" doesn't mean "innocent." It means the evidence wasn't strong enough <em>this time</em>.
          </div>

          <NBtn onClick={() => setTab("concepts")} label={"Next: Key Concepts →"} />
        </div>}

        {/* ═══ TAB 2: KEY CONCEPTS ═══ */}
        {tab === "concepts" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Five ideas you need first" sub="Effect size, significance level, power, standard error, and test statistics" />

          <CBox title={<>{"\u{1F4CF}"} Effect Size: How big is the difference?</>} color={C.grn}>
            <EffectSizeViz />
          </CBox>

          <CBox title={<>{"\u{1F6A8}"} Significance Level (α): How strict is your alarm?</>} color={C.rose}>
            <AlphaViz />
          </CBox>

          <CBox title={<>{"\u{1F4AA}"} Statistical Power: Your ability to detect a real effect</>} color={C.grn}>
            <PowerConceptViz />
          </CBox>

          <CBox title={<>{"\u{1F4D0}"} Standard Error: Why sample size is the key lever</>} color={C.sam}>
            <SEConceptViz />
          </CBox>

          <CBox title={<>{"\u{1F4CA}"} Test Statistic: Putting it all together</>} color={C.smp}>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
              Now we can see how everything connects. A <strong>test statistic</strong> converts your data into a single number. The most common is the <strong>t-statistic</strong>:
            </div>
            <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 24px", marginTop: "12px", marginBottom: "12px", textAlign: "center", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "18px", fontFamily: mono, color: C.smp, fontWeight: 600 }}>
                t = (sample mean &minus; hypothesized mean) / SE
              </div>
            </div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
              The <strong>numerator</strong> is the signal: "how far is my result from the null?" The <strong>denominator</strong> is the noise: the standard error you just learned about. A large t means your result is far from the null <em>relative to what you'd expect from sampling noise alone</em>.
            </div>
            <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", marginTop: "12px", border: `1px solid ${C.bdr}`, fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
              <strong>This is the chain:</strong> Bigger sample → smaller SE (as you just saw) → larger t-statistic → result lands further in the tails → smaller p-value → easier to reject H₀. Sample size doesn't change the <em>truth</em>, but it changes your ability to <em>see</em> the truth.
            </div>
            <Anl>Imagine weighing bags of rice labeled "5 kg." One bag weighs 5.2 kg. Is that unusual? If your scale wobbles by ±0.5 kg (large SE), then t = 0.4 — not unusual. If your scale is precise to ±0.02 kg (tiny SE), then t = 10 — clearly something's off. Same signal, different noise.</Anl>
          </CBox>

          <Ins>
            Now you have five building blocks: <strong>effect size</strong> (how big the difference is), <strong>α</strong> (false alarm threshold), <strong>power</strong> (detection ability), <strong>standard error</strong> (how much noise to expect), and the <strong>test statistic</strong> (signal ÷ noise). Next, you'll see how they produce a p-value.
          </Ins>

          <NBtn onClick={() => setTab("pval")} label={"Next: P-Values →"} />
        </div>}

        {/* ═══ TAB 3: P-VALUES ═══ */}
        {tab === "pval" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="What is a p-value, really?" sub="The most misunderstood number in all of research" />

          <Pr>A <strong>p-value</strong> answers one specific question: <em>"If the null hypothesis were true (no effect), how often would I see a result at least this extreme?"</em></Pr>

          <Pr>That's it. It's a probability of the <strong>data given the null</strong> &mdash; not the probability that the null is true. This distinction trips up even experienced researchers:</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "4px" }}>{"\u2705"} CORRECT</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>"If there's truly no effect, there's only a 3% chance I'd see data this extreme."</div>
            </div>
            <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>{"\u274C"} WRONG</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>"There's a 3% probability that the null hypothesis is true." (NOT what p means!)</div>
            </div>
          </div>

          <CBox title={<>{"\u{1F3B0}"} P-Value Simulator</>} color={C.rose}>
            <PValueSim />
          </CBox>

          <Ins>
            <strong>Things to try:</strong> (1) Set effect = 0 — you'll still sometimes get p &lt; 0.05 by pure chance. That's Type I error happening live. (2) Increase n from 10 to 100 with the same effect — notice the t-statistic gets larger because SE shrinks. (3) Re-draw several times — the p-value varies each time because it depends on your particular sample.
          </Ins>

          <SampleSizeDemo />

          <NBtn onClick={() => setTab("errors")} label={"Next: Errors & Power →"} />
        </div>}

        {/* ═══ TAB 4: ERRORS & POWER ═══ */}
        {tab === "errors" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Two ways to be wrong" sub="The fundamental tradeoff in hypothesis testing" />

          <Pr>Every time you make a decision based on data, you risk two kinds of mistakes:</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <CBox title={<>{"\u{1F6A8}"} Type I Error (False Alarm)</>} color={C.rose}>
              <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
                You <strong>reject the null when it's actually true</strong>. There's no real effect, but your data looked extreme by chance. Like a fire alarm going off with no fire.
                <div style={{ marginTop: "8px", fontSize: "13px", color: C.rose, fontWeight: 600 }}>Controlled by α (you set this before testing)</div>
              </div>
            </CBox>
            <CBox title={<>{"\u{1F648}"} Type II Error (Miss)</>} color={C.pop}>
              <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75 }}>
                You <strong>fail to reject the null when it's actually false</strong>. There's a real effect, but your data wasn't dramatic enough to catch it. Like a fire alarm staying silent during a fire.
                <div style={{ marginTop: "8px", fontSize: "13px", color: C.pop, fontWeight: 600 }}>Rate = β. Power (1 &minus; β) is the chance of catching a real effect.</div>
              </div>
            </CBox>
          </div>

          <Pr>The tricky part: <strong>reducing one error increases the other</strong>. The interactive below makes this visible. The grey curve is H{"₀"}; the blue curve is H{"₁"}. Watch the colored regions shift as you change the settings:</Pr>

          <CBox title={<>{"\u{1F50D}"} Error Tradeoff Explorer</>} color={C.smp}>
            <ErrorTypesViz />
          </CBox>

          {/* Decision matrix */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>The decision matrix</div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "0", borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}` }}>
              <div style={{ background: C.bg, padding: "12px 16px" }}></div>
              <div style={{ background: C.bg, padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderLeft: `1px solid ${C.bdr}` }}>H{"₀"} IS TRUE</div>
              <div style={{ background: C.bg, padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderLeft: `1px solid ${C.bdr}` }}>H{"₀"} IS FALSE</div>
              <div style={{ background: C.bg, padding: "12px 16px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderTop: `1px solid ${C.bdr}` }}>REJECT H{"₀"}</div>
              <div style={{ background: C.roseLt, padding: "12px", textAlign: "center", borderTop: `1px solid ${C.bdr}`, borderLeft: `1px solid ${C.bdr}` }}>
                <div style={{ fontWeight: 700, color: C.rose, fontSize: "13px" }}>Type I Error</div>
                <div style={{ fontSize: "11px", color: C.txD }}>False positive (α)</div>
              </div>
              <div style={{ background: C.grnBg, padding: "12px", textAlign: "center", borderTop: `1px solid ${C.bdr}`, borderLeft: `1px solid ${C.bdr}` }}>
                <div style={{ fontWeight: 700, color: C.grn, fontSize: "13px" }}>{"\u2705"} Correct!</div>
                <div style={{ fontSize: "11px", color: C.txD }}>Power (1 &minus; β)</div>
              </div>
              <div style={{ background: C.bg, padding: "12px 16px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.txD, borderTop: `1px solid ${C.bdr}` }}>FAIL TO REJECT</div>
              <div style={{ background: C.grnBg, padding: "12px", textAlign: "center", borderTop: `1px solid ${C.bdr}`, borderLeft: `1px solid ${C.bdr}` }}>
                <div style={{ fontWeight: 700, color: C.grn, fontSize: "13px" }}>{"\u2705"} Correct!</div>
                <div style={{ fontSize: "11px", color: C.txD }}>True negative</div>
              </div>
              <div style={{ background: C.popLt, padding: "12px", textAlign: "center", borderTop: `1px solid ${C.bdr}`, borderLeft: `1px solid ${C.bdr}` }}>
                <div style={{ fontWeight: 700, color: C.pop, fontSize: "13px" }}>Type II Error</div>
                <div style={{ fontSize: "11px", color: C.txD }}>False negative (β)</div>
              </div>
            </div>
          </div>

          <NBtn onClick={() => setTab("practice")} label={"Next: In Practice →"} />
        </div>}

        {/* ═══ TAB 5: PRACTICE ═══ */}
        {tab === "practice" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title={'Significance ≠ importance'} sub="Why you need more than a p-value to evaluate a finding" />

          <Pr>A p-value tells you whether an effect is <em>unlikely to be zero</em>. It does not tell you whether the effect is <em>large enough to matter</em>. This distinction is crucial.</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { icon: "\u{1F4CF}", label: "Effect Size", q: "How big is it?", desc: "A significant but tiny effect may be worthless in practice.", color: C.grn },
              { icon: "\u{1F4CA}", label: "P-Value", q: "Could it be chance?", desc: "With large n, even trivial effects get small p-values.", color: C.rose },
              { icon: "\u{1F50D}", label: "Sample Size", q: "How much data?", desc: "Large n detects tiny effects. Small n misses big ones.", color: C.sam },
            ].map(item => (
              <div key={item.label} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: C.tx, marginBottom: "6px" }}>{item.q}</div>
                <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <CBox title={<>{"\u{1F9EA}"} Scenario Lab</>} color={C.smp}>
            <PracticeViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> A hypothesis test starts with H{"₀"} (no effect) and asks if the evidence is strong enough to reject it.<br />
              <strong>2.</strong> The <strong>p-value</strong> = probability of data this extreme <em>if H{"₀"} were true</em>. It is NOT the probability that H{"₀"} is true.<br />
              <strong>3.</strong> <strong>Effect size</strong> measures how big the difference is (independent of sample size). Always report it.<br />
              <strong>4.</strong> <strong>Type I</strong> (false alarm, α) and <strong>Type II</strong> (miss, β) errors are in tension &mdash; reducing one increases the other.<br />
              <strong>5.</strong> <strong>Power</strong> (1 &minus; β) is the probability of detecting a real effect. It increases with sample size and effect size.<br />
              <strong>6.</strong> Statistical significance (p &lt; 0.05) does NOT equal practical importance. With enough data, <em>anything</em> is significant.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
