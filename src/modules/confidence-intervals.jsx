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
function Tip({ term, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span onClick={() => setShow(!show)} style={{
        borderBottom: `1.5px dashed ${C.smp}`, color: C.smp, cursor: "pointer",
        fontWeight: 600, paddingBottom: "1px",
      }}>{term}</span>
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: C.card, border: `1px solid ${C.smp}33`, borderRadius: "10px",
          padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "12.5px", lineHeight: 1.6, color: C.txB, width: "260px",
          zIndex: 20, animation: "fadeIn 0.2s ease",
        }}>
          {children}
          <span style={{
            position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: "10px", height: "10px", background: C.card,
            border: `1px solid ${C.smp}33`, borderTop: "none", borderLeft: "none",
          }} />
        </span>
      )}
    </span>
  );
}
function AB({ onClick, label, primary, danger, muted, disabled }) {
  const bg = primary ? C.smp : danger ? "rgba(239,68,68,0.08)" : "transparent";
  const bd = primary ? C.smp : danger ? "#ef4444" : C.bdr;
  const cl = primary ? "#fff" : danger ? "#ef4444" : muted ? C.txM : C.tx;
  return <button onClick={onClick} disabled={disabled} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${bd}`, background: bg, color: cl, fontSize: "13px", fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: font, opacity: disabled ? 0.45 : 1 }}>{label}</button>;
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: THE 100 CIs SIMULATION
// ═══════════════════════════════════════════════════════════════════
function HundredCIsViz() {
  const trueMu = 50;
  const sd = 15;
  const n = 30;
  const se = sd / Math.sqrt(n);
  const z = 1.96;

  const [cis, setCis] = useState([]);
  const [showTrue, setShowTrue] = useState(false);

  const generate = () => {
    const newCis = Array.from({ length: 100 }, () => {
      const sample = Array.from({ length: n }, () => rNorm(trueMu, sd));
      const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
      const sSD = Math.sqrt(sample.reduce((s, v) => s + (v - mean) ** 2, 0) / (sample.length - 1));
      const sSE = sSD / Math.sqrt(n);
      const lo = mean - z * sSE;
      const hi = mean + z * sSE;
      const captures = lo <= trueMu && hi >= trueMu;
      return { mean, lo, hi, captures };
    });
    setCis(newCis);
    setShowTrue(false);
  };

  const captured = cis.filter(c => c.captures).length;
  const missed = cis.length - captured;

  const W = 560, H = Math.max(320, cis.length * 3.2 + 40);
  const pad = { t: 20, r: 20, b: 20, l: 20 };
  const cw = W - pad.l - pad.r;
  const range = [30, 70];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;
  const rowH = cis.length > 0 ? (H - pad.t - pad.b) / cis.length : 3;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Imagine 100 different research teams, each drawing a sample of n = {n} from the same population (true mean μ = ???). Each team builds a 95% CI. How many of those intervals will actually contain the true mean?
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <AB onClick={generate} primary label="Generate 100 Confidence Intervals" />
        {cis.length > 0 && <AB onClick={() => setShowTrue(true)} label={showTrue ? "✓ True μ revealed" : "Reveal True μ"} muted={showTrue} />}
        {cis.length > 0 && <AB onClick={() => { setCis([]); setShowTrue(false); }} label="Reset" muted />}
      </div>

      {cis.length > 0 && (
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
            {/* Grid */}
            {[30, 35, 40, 45, 50, 55, 60, 65, 70].map(v => (
              <line key={v} x1={sc(v)} x2={sc(v)} y1={pad.t} y2={H - pad.b} stroke={C.grid} strokeWidth="1" />
            ))}
            {/* True mean line */}
            {showTrue && (
              <line x1={sc(trueMu)} x2={sc(trueMu)} y1={pad.t - 5} y2={H - pad.b + 5} stroke={C.pop} strokeWidth="2.5" />
            )}
            {/* CIs */}
            {cis.map((ci, i) => {
              const y = pad.t + i * rowH + rowH / 2;
              const color = !showTrue ? C.sam : ci.captures ? C.grn : C.rose;
              const opacity = !showTrue ? 0.6 : ci.captures ? 0.5 : 0.9;
              return (
                <g key={i}>
                  <line x1={sc(Math.max(range[0], ci.lo))} x2={sc(Math.min(range[1], ci.hi))} y1={y} y2={y}
                    stroke={color} strokeWidth={rowH > 2.5 ? 2 : 1.5} opacity={opacity} />
                  <circle cx={sc(ci.mean)} cy={y} r={rowH > 3 ? 2 : 1.2} fill={color} opacity={opacity} />
                </g>
              );
            })}
            {/* Axis labels */}
            {[30, 35, 40, 45, 50, 55, 60, 65, 70].map(v => (
              <text key={v} x={sc(v)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
            ))}
            {showTrue && <text x={sc(trueMu)} y={pad.t - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.pop} fontFamily={mono}>True μ = {trueMu}</text>}
          </svg>

          {/* Results */}
          {showTrue && (
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", animation: "fadeIn 0.4s ease" }}>
              <div style={{ flex: 1, background: C.grnBg, borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(5,150,105,0.15)", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: C.grn }}>{captured}</div>
                <div style={{ fontSize: "12px", color: C.txD }}>captured μ ({(captured).toFixed(0)}%)</div>
              </div>
              <div style={{ flex: 1, background: C.roseBg, borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(225,29,72,0.15)", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: C.rose }}>{missed}</div>
                <div style={{ fontSize: "12px", color: C.txD }}>missed μ ({missed}%)</div>
              </div>
            </div>
          )}
        </div>
      )}

      {showTrue && (
        <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
          <strong>About {captured} out of 100 intervals captured the true mean.</strong> That's what "95% confidence" means — not that there's a 95% chance the truth is in <em>your</em> interval, but that the <em>procedure</em> produces intervals that capture the truth about 95% of the time. The {missed} red intervals? Those researchers were unlucky. Their data happened to produce a misleading estimate. Run it again — you'll get a different set, but always around 95 green and 5 red.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: BUILDING A CI STEP BY STEP
// ═══════════════════════════════════════════════════════════════════
function BuildCIViz() {
  const [step, setStep] = useState(0);
  const sampleMean = 52.3;
  const sSD = 14.8;
  const n = 30;
  const se = sSD / Math.sqrt(n);
  const z = 1.96;
  const moe = z * se;
  const lo = sampleMean - moe;
  const hi = sampleMean + moe;

  const W = 500, H = 100, pad = { t: 20, r: 20, b: 24, l: 20 };
  const cw = W - pad.l - pad.r;
  const range = [40, 65];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;

  const stepLabels = [
    "Start with your point estimate",
    "Calculate the standard error",
    "Choose your confidence level",
    "Compute the margin of error",
    "Build the interval!",
  ];
  const stepDescs = [
    <span>You drew a sample of n = {n} and computed the sample mean: x̄ = {sampleMean}. This is your best single guess for the true population mean. But it's just one number — how uncertain are you?</span>,
    <span>From your sample, you computed SD = {sSD.toFixed(1)}. The standard error is SE = SD / √n = {sSD.toFixed(1)} / √{n} = {se.toFixed(2)}. This tells you how much sample means typically bounce around.</span>,
    <span>You want a 95% CI. But what does the <Tip term="confidence level">The confidence level (e.g. 95%) describes the procedure, not a single interval. If you repeated your study many times, 95% of the resulting CIs would capture the true value. Higher confidence = wider interval = more likely to capture, but less precise.</Tip> mean here? It connects to the 68-95-99.7 rule: 95% of sample means fall within ±1.96 SE of the true mean. So we use <Tip term="z* = 1.96">The critical value z* comes from the normal distribution. It tells you how many SEs to extend in each direction. For 90%: 1.645. For 95%: 1.96. For 99%: 2.576.</Tip> as our critical value.</span>,
    <span>Margin of error = z* × SE = 1.96 × {se.toFixed(2)} = {moe.toFixed(2)}. This is the "±" part — the radius of your interval. It tells you: "my estimate could be off by this much."</span>,
    <span>CI = x̄ ± margin = {sampleMean} ± {moe.toFixed(2)} = [{lo.toFixed(2)}, {hi.toFixed(2)}]. If we repeated this study many times, about 95% of the intervals we'd compute would contain the true population mean.</span>,
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "16px" }}>
        Let's build a 95% confidence interval from scratch. Click through each step:
      </div>

      {/* Step buttons */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", flexWrap: "wrap" }}>
        {stepLabels.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: "5px 12px", borderRadius: "6px", border: "1.5px solid",
            borderColor: step === i ? C.smp : i <= step ? C.smp + "44" : C.bdr,
            background: step === i ? C.smpBg : "transparent",
            color: step === i ? C.smp : i <= step ? C.txB : C.txM,
            fontSize: "11px", fontWeight: step === i ? 700 : 500, cursor: "pointer", fontFamily: font,
          }}>{i + 1}. {s}</button>
        ))}
      </div>

      {/* Visual */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: "520px", display: "block", margin: "0 auto" }}>
        <line x1={pad.l} x2={W - pad.r} y1="50" y2="50" stroke={C.bdr} strokeWidth="1.5" />
        {[40, 45, 50, 55, 60, 65].map(v => (
          <text key={v} x={sc(v)} y={H - 2} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>
        ))}

        {/* Point estimate (step >= 0) */}
        <circle cx={sc(sampleMean)} cy="50" r="6" fill={C.sam} stroke="#fff" strokeWidth="2" />
        {step === 0 && <text x={sc(sampleMean)} y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.sam} fontFamily={mono}>x̄ = {sampleMean}</text>}

        {/* SE brackets (step >= 1) */}
        {step >= 1 && <>
          <line x1={sc(sampleMean - se)} x2={sc(sampleMean + se)} y1="38" y2="38" stroke={C.txD} strokeWidth="1.5" />
          <line x1={sc(sampleMean - se)} x2={sc(sampleMean - se)} y1="35" y2="41" stroke={C.txD} strokeWidth="1.5" />
          <line x1={sc(sampleMean + se)} x2={sc(sampleMean + se)} y1="35" y2="41" stroke={C.txD} strokeWidth="1.5" />
          <text x={sc(sampleMean)} y="33" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={mono}>±1 SE = ±{se.toFixed(2)}</text>
        </>}

        {/* Margin of error (step >= 3) */}
        {step >= 3 && <>
          <line x1={sc(lo)} x2={sc(hi)} y1="62" y2="62" stroke={C.smp} strokeWidth="2" />
          <line x1={sc(lo)} x2={sc(lo)} y1="58" y2="66" stroke={C.smp} strokeWidth="2" />
          <line x1={sc(hi)} x2={sc(hi)} y1="58" y2="66" stroke={C.smp} strokeWidth="2" />
          <text x={sc(sampleMean)} y="76" textAnchor="middle" fontSize="9" fill={C.smp} fontFamily={mono} fontWeight="600">±{moe.toFixed(2)} (margin of error)</text>
        </>}

        {/* Full CI (step >= 4) */}
        {step >= 4 && <>
          <rect x={sc(lo)} y="44" width={sc(hi) - sc(lo)} height="12" rx="3" fill={C.smp} opacity="0.15" />
          <text x={sc(lo)} y="92" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.smp} fontFamily={mono}>{lo.toFixed(1)}</text>
          <text x={sc(hi)} y="92" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.smp} fontFamily={mono}>{hi.toFixed(1)}</text>
        </>}
      </svg>

      {/* Step explanation */}
      <div style={{ background: C.bg, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", marginTop: "12px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB, minHeight: "70px" }}>
        {stepDescs[step]}
      </div>

      {/* Formula summary at the end */}
      {step >= 4 && (
        <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "16px 20px", marginTop: "14px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>The formula</div>
          <div style={{ fontSize: "18px", fontFamily: mono, color: C.smp, fontWeight: 600, marginBottom: "8px" }}>
            CI = x̄ ± z* × (s / √n)
          </div>
          <div style={{ fontSize: "12px", color: C.txD }}>
            point estimate ± critical value × standard error = point estimate ± margin of error
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: step === 0 ? C.txM : C.txB, fontSize: "12px", fontWeight: 600, cursor: step === 0 ? "default" : "pointer", fontFamily: font, opacity: step === 0 ? 0.5 : 1 }}>← Back</button>
        <button onClick={() => setStep(s => Math.min(4, s + 1))} disabled={step === 4} style={{ padding: "7px 18px", borderRadius: "8px", border: `1.5px solid ${C.smp}`, background: step === 4 ? "transparent" : C.smpBg, color: step === 4 ? C.txM : C.smp, fontSize: "12px", fontWeight: 600, cursor: step === 4 ? "default" : "pointer", fontFamily: font, opacity: step === 4 ? 0.5 : 1 }}>Next Step →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: WHAT AFFECTS CI WIDTH
// ═══════════════════════════════════════════════════════════════════
function CIWidthViz() {
  const [n, setN] = useState(30);
  const [confLevel, setConfLevel] = useState(0.95);
  const [sd, setSd] = useState(15);

  const zMap = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const z = zMap[confLevel];
  const se = sd / Math.sqrt(n);
  const moe = z * se;
  const sampleMean = 50;
  const lo = sampleMean - moe;
  const hi = sampleMean + moe;

  const W = 520, H = 120, pad = { t: 24, r: 20, b: 28, l: 20 };
  const cw = W - pad.l - pad.r;
  const range = [20, 80];
  const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;

  // Curve for visual
  const curve = [];
  for (let i = 0; i <= 200; i++) {
    const x = range[0] + (i / 200) * (range[1] - range[0]);
    curve.push({ x, y: normalPDF(x, sampleMean, se) });
  }
  const mx = Math.max(...curve.map(p => p.y));
  const ch = H - pad.t - pad.b;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Three things control how wide a confidence interval is. Drag each slider and watch the purple interval stretch or shrink:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Sample Size (n)</div>
          <input type="range" min="5" max="200" step="5" value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.sam, fontFamily: mono }}>n = {n}</div>
          <div style={{ fontSize: "10px", color: C.txD, marginTop: "2px" }}>↑n → ↓SE → narrower CI</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Confidence Level</div>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0.90, 0.95, 0.99].map(cl => (
              <button key={cl} onClick={() => setConfLevel(cl)} style={{
                padding: "5px 10px", borderRadius: "6px", border: "1.5px solid",
                borderColor: confLevel === cl ? C.smp : C.bdr,
                background: confLevel === cl ? C.smpBg : "transparent",
                color: confLevel === cl ? C.smp : C.txD,
                fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: mono,
              }}>{(cl * 100).toFixed(0)}%</button>
            ))}
          </div>
          <div style={{ fontSize: "10px", color: C.txD, marginTop: "4px" }}>
            {confLevel === 0.90 && "90%: if you repeated this study 100 times, ~90 of the CIs would capture the truth"}
            {confLevel === 0.95 && "95%: the standard in research — ~95 out of 100 CIs would capture the truth"}
            {confLevel === 0.99 && "99%: very confident — ~99 out of 100 CIs would capture the truth, but wider"}
          </div>
          <div style={{ fontSize: "10px", color: C.txD, marginTop: "2px" }}>↑confidence → ↑z* → wider CI</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Data Variability (SD)</div>
          <input type="range" min="5" max="30" step="1" value={sd} onChange={e => setSd(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.pop, fontFamily: mono }}>SD = {sd}</div>
          <div style={{ fontSize: "10px", color: C.txD, marginTop: "2px" }}>↑SD → ↑SE → wider CI</div>
        </div>
      </div>

      {/* Visual */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        {[20, 30, 40, 50, 60, 70, 80].map(v => <line key={v} x1={sc(v)} x2={sc(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
        {/* Sampling distribution curve */}
        <path d={curve.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch * 0.9}`).join(" ")} fill="none" stroke={C.txM} strokeWidth="1.5" opacity="0.4" />
        {/* CI bar */}
        <rect x={sc(Math.max(range[0], lo))} y={pad.t + ch * 0.4} width={sc(Math.min(range[1], hi)) - sc(Math.max(range[0], lo))} height="14" rx="4" fill={C.smp} opacity="0.2" />
        <line x1={sc(Math.max(range[0], lo))} x2={sc(Math.min(range[1], hi))} y1={pad.t + ch * 0.47} y2={pad.t + ch * 0.47} stroke={C.smp} strokeWidth="3" />
        <circle cx={sc(sampleMean)} cy={pad.t + ch * 0.47} r="5" fill={C.sam} stroke="#fff" strokeWidth="2" />
        {/* CI bounds */}
        <text x={sc(lo)} y={pad.t + ch * 0.3} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.smp} fontFamily={mono}>{lo.toFixed(1)}</text>
        <text x={sc(hi)} y={pad.t + ch * 0.3} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.smp} fontFamily={mono}>{hi.toFixed(1)}</text>
        <text x={sc(sampleMean)} y={pad.t + 10} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.sam} fontFamily={mono}>x̄ = {sampleMean}</text>
        {[20, 30, 40, 50, 60, 70, 80].map(v => <text key={v} x={sc(v)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
      </svg>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "SE = SD/√n", value: se.toFixed(2), color: C.sam },
          { label: "z*", value: z.toFixed(3), color: C.smp },
          { label: "Margin (z*×SE)", value: "±" + moe.toFixed(2), color: C.smp },
          { label: "CI Width", value: (2 * moe).toFixed(2), color: C.pop },
        ].map(s => (
          <div key={s.label} style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "100px" }}>
            <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: s.color, fontFamily: font }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "14px", lineHeight: 1.7 }}>
        <strong>The tradeoff:</strong> You want a narrow CI (more precise) and high confidence (more certain). But you can't have both — higher confidence means a wider interval. The only way to get <em>both</em> narrow and confident is to increase sample size. This is why researchers plan sample sizes carefully.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: CIs AND HYPOTHESIS TESTING
// ═══════════════════════════════════════════════════════════════════
function CIHypothesisViz() {
  const [effect, setEffect] = useState(0.5);
  const [n, setN] = useState(40);
  const sd = 1;
  const se = sd / Math.sqrt(n);
  const z = 1.96;

  // Generate a sample
  const [result, setResult] = useState(null);

  const drawSample = useCallback(() => {
    const vals = Array.from({ length: n }, () => rNorm(effect, sd));
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sSD = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / (vals.length - 1));
    const sSE = sSD / Math.sqrt(n);
    const lo = mean - z * sSE;
    const hi = mean + z * sSE;
    const includesZero = lo <= 0 && hi >= 0;
    const t = mean / sSE;
    const pApprox = 2 * (1 - cdfApprox(Math.abs(t)));
    setResult({ mean, se: sSE, lo, hi, includesZero, t, p: pApprox });
  }, [effect, n]);

  useEffect(() => { setResult(null); }, [effect, n]);

  function cdfApprox(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422802 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }

  const W = 500, H = 80, pad = { t: 16, r: 20, b: 20, l: 20 };
  const cw = W - pad.l - pad.r;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Here's the powerful connection: <strong>a 95% CI and a two-tailed hypothesis test at α = 0.05 always give the same answer.</strong> If the CI doesn't include zero (the null hypothesis value), you reject H₀. If it includes zero, you don't. They're two ways of looking at the same evidence.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>True Effect Size</div>
          <input type="range" min="0" max="1" step="0.05" value={effect} onChange={e => setEffect(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>d = {effect.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Sample Size</div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[15, 40, 100].map(nv => (
              <button key={nv} onClick={() => setN(nv)} style={{ padding: "5px 12px", borderRadius: "6px", border: "1.5px solid", borderColor: n === nv ? C.sam : C.bdr, background: n === nv ? C.samBg : "transparent", color: n === nv ? C.sam : C.txD, fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: mono }}>n={nv}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <AB onClick={drawSample} primary label="Draw a Sample & Build CI" />
      </div>

      {result && (() => {
        const minV = Math.min(result.lo, -0.3) - 0.2;
        const maxV = Math.max(result.hi, 0.3) + 0.2;
        const range = [minV, maxV];
        const sc = v => pad.l + ((v - range[0]) / (range[1] - range[0])) * cw;
        const zeroX = sc(0);

        return (
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh, animation: "fadeIn 0.4s ease" }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
              {/* Zero line */}
              <line x1={zeroX} x2={zeroX} y1={pad.t - 5} y2={H - pad.b} stroke={C.txD} strokeWidth="1.5" strokeDasharray="4,3" />
              <text x={zeroX} y={pad.t - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.txD} fontFamily={mono}>0 (H₀)</text>
              {/* CI */}
              <line x1={sc(result.lo)} x2={sc(result.hi)} y1="38" y2="38" stroke={result.includesZero ? C.txD : C.grn} strokeWidth="3" />
              <line x1={sc(result.lo)} x2={sc(result.lo)} y1="32" y2="44" stroke={result.includesZero ? C.txD : C.grn} strokeWidth="2" />
              <line x1={sc(result.hi)} x2={sc(result.hi)} y1="32" y2="44" stroke={result.includesZero ? C.txD : C.grn} strokeWidth="2" />
              <circle cx={sc(result.mean)} cy="38" r="5" fill={C.sam} stroke="#fff" strokeWidth="2" />
              {/* Labels */}
              <text x={sc(result.lo)} y="54" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={mono}>{result.lo.toFixed(2)}</text>
              <text x={sc(result.mean)} y="54" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.sam} fontFamily={mono}>x̄={result.mean.toFixed(2)}</text>
              <text x={sc(result.hi)} y="54" textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={mono}>{result.hi.toFixed(2)}</text>
            </svg>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <div style={{ flex: 1, background: result.includesZero ? C.bg : C.grnBg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${result.includesZero ? C.bdr : "rgba(5,150,105,0.15)"}` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: result.includesZero ? C.txD : C.grn, fontFamily: mono, marginBottom: "4px" }}>95% CI</div>
                <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.5 }}>
                  [{result.lo.toFixed(3)}, {result.hi.toFixed(3)}]
                  {result.includesZero ? " — includes 0" : " — does NOT include 0"}
                </div>
              </div>
              <div style={{ flex: 1, background: result.p < 0.05 ? C.roseBg : C.bg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${result.p < 0.05 ? "rgba(225,29,72,0.15)" : C.bdr}` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: result.p < 0.05 ? C.rose : C.txD, fontFamily: mono, marginBottom: "4px" }}>Hypothesis Test</div>
                <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.5 }}>
                  t = {result.t.toFixed(2)}, p = {result.p < 0.001 ? "<.001" : result.p.toFixed(3)}
                  {result.p < 0.05 ? " — reject H₀" : " — fail to reject H₀"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "13px", color: C.txD, marginTop: "10px", lineHeight: 1.7, textAlign: "center" }}>
              {result.includesZero
                ? <><strong>Both agree: not significant.</strong> The CI includes zero and p > 0.05. We can't rule out "no effect."</>
                : <><strong>Both agree: significant!</strong> The CI excludes zero and p &lt; 0.05. The data suggest a real effect.</>
              }
              {" "}They always match — try drawing several samples to see.
            </div>
          </div>
        );
      })()}

      {!result && <div style={{ fontSize: "13px", color: C.txD, textAlign: "center", fontStyle: "italic" }}>Click the button to draw a sample. Try effect = 0 and watch the CI sometimes include and sometimes exclude zero.</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "idea", label: "1. The Big Idea" },
  { id: "build", label: "2. Building a CI" },
  { id: "width", label: "3. What Affects Width" },
  { id: "connect", label: "4. CIs & Testing" },
];

export default function ConfidenceIntervals() {
  const [tab, setTab] = useState("idea");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 3 · Statistical Reasoning</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Confidence Intervals</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>A single number (your estimate) is always incomplete. Confidence intervals tell you the <em>range</em> of plausible values — and how precise your estimate really is.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* ═══ TAB 1: THE BIG IDEA ═══ */}
        {tab === "idea" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="What does 95% confidence actually mean?" sub="The most misunderstood phrase in all of statistics" />

          <Pr>When a researcher says "the 95% confidence interval is [45.0, 55.0]," what does that mean? Let's start with what it does <strong>not</strong> mean:</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(225,29,72,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>✗ WRONG</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>"There is a 95% probability that the true mean falls between 45 and 55."</div>
            </div>
            <div style={{ background: C.grnBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "4px" }}>✓ CORRECT</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>"If we repeated this study many times, about 95% of the resulting CIs would contain the true mean."</div>
            </div>
          </div>

          <Pr>Why is the first wrong? Because the true mean is a <em>fixed number</em> — it's either in your interval or it isn't. There's no probability about it. The 95% refers to the <strong>procedure</strong>, not to any single interval.</Pr>

          <Anl>Think of a factory that makes rulers. They claim "95% of our rulers are accurate." If you buy one ruler, it's either accurate or it isn't — there's no "95% chance" it's accurate. The 95% describes the <em>manufacturing process</em>. Similarly, the 95% in a CI describes the <em>statistical process</em> that generated the interval, not the specific interval you got.</Anl>

          <Pr>The simulation below makes this vivid. Each horizontal line is one confidence interval from one study. Click "Reveal True μ" to see how many actually captured it:</Pr>

          <CBox title={<>🎯 The 100 Confidence Intervals Experiment</>} color={C.smp}>
            <HundredCIsViz />
          </CBox>

          <Ins>
            <strong>Key insight:</strong> Before you reveal the truth, every CI looks equally valid — you can't tell which ones are wrong just by looking. This is the uncomfortable reality: your specific CI might be one of the ~5% that missed. You'll never know. All you know is that the procedure works 95% of the time.
          </Ins>

          <NBtn onClick={() => setTab("build")} label="Next: Building a CI →" />
        </div>}

        {/* ═══ TAB 2: BUILDING A CI ═══ */}
        {tab === "build" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="How to build a confidence interval" sub="Point estimate ± margin of error — step by step" />

          <Pr>A confidence interval has three ingredients that you already know from Module 2:</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { icon: "📍", label: "Point Estimate", desc: "Your best guess — the sample mean (x̄). This is the center of your CI.", color: C.sam },
              { icon: "📐", label: "Standard Error", desc: "SE = s / √n. Measures how much your estimate bounces from sample to sample.", color: C.txD },
              { icon: "🎚️", label: "Critical Value", desc: "z* = 1.96 for 95% confidence. From the 68-95-99.7 rule: ±1.96 SE covers 95%.", color: C.smp },
            ].map(item => (
              <div key={item.label} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <CBox title={<>🔧 Step-by-Step CI Builder</>} color={C.smp}>
            <BuildCIViz />
          </CBox>

          <Anl>A CI is like saying "I'm at kilometer 52 on this highway, and given the fog (my uncertainty), the gas station is somewhere between kilometer 47 and 57." The point estimate is where you are. The margin of error is how far the fog extends. More data (bigger n) = clearer visibility = shorter range.</Anl>

          <NBtn onClick={() => setTab("width")} label="Next: What Affects Width →" />
        </div>}

        {/* ═══ TAB 3: WIDTH ═══ */}
        {tab === "width" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="What makes a CI wider or narrower?" sub="The three levers you can pull" />

          <Pr>The CI formula is <strong>x̄ ± z* × (s / √n)</strong>. This means three things control width. (Tap any <span style={{ borderBottom: `1.5px dashed ${C.smp}`, color: C.smp, fontWeight: 600 }}>highlighted term</span> for a quick reminder.)</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.sam, marginBottom: "4px" }}>Sample size (n)</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.tx, marginBottom: "6px" }}>Bigger n → narrower</div>
              <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>More data → smaller <Tip term="SE">Standard error = s / √n. It measures how much your sample mean bounces around from sample to sample. Bigger n → smaller SE → more precise estimates.</Tip> → less uncertainty. This is the lever you control most.</div>
            </div>
            <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, marginBottom: "4px" }}><Tip term="Confidence level">The confidence level (e.g. 90%, 95%, 99%) is how often the procedure produces intervals that capture the true value. Higher confidence = you're casting a wider net to be more sure, but your interval becomes less precise.</Tip></div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.tx, marginBottom: "6px" }}>Higher confidence → wider</div>
              <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>Wanting to be 99% sure instead of 90% means using a larger <Tip term="z*">The critical value (z*) comes from the normal distribution. For 90% CI: z* = 1.645. For 95%: z* = 1.96. For 99%: z* = 2.576. Higher confidence → bigger z* → wider interval.</Tip>, which stretches the interval wider. More certainty costs precision.</div>
            </div>
            <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.pop, marginBottom: "4px" }}>Data variability (SD)</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.tx, marginBottom: "6px" }}>Larger SD → wider</div>
              <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>Noisier data → larger SE → more uncertainty. You can't control this — it's a fact about the world you're studying.</div>
            </div>
          </div>

          <CBox title={<>🎛️ CI Width Explorer</>} color={C.smp}>
            <CIWidthViz />
          </CBox>

          <Ins>
            <strong>Try this:</strong> (1) Set n = 5, SD = 30, 99% confidence — the CI is enormous, practically useless. (2) Now set n = 200, SD = 5, 90% confidence — the CI is razor-thin. (3) The sweet spot for most research: n = 30–100, 95% confidence. Notice that going from 95% to 99% confidence makes the CI noticeably wider — that extra 4% of certainty is expensive.
          </Ins>

          <NBtn onClick={() => setTab("connect")} label="Next: CIs & Testing →" />
        </div>}

        {/* ═══ TAB 4: CONNECTION ═══ */}
        {tab === "connect" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Two sides of the same coin" sub="How CIs and hypothesis tests are secretly the same thing" />

          <Pr>Here's something beautiful: a <strong>95% confidence interval</strong> and a <strong>two-tailed hypothesis test at α = 0.05</strong> always give the same answer. The rule is simple:</Pr>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <div style={{ background: C.grnBg, borderRadius: "10px", padding: "16px 18px", border: "1px solid rgba(5,150,105,0.15)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "6px" }}>CI excludes zero</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>The null value (0) is <strong>outside</strong> the interval → the data are incompatible with "no effect" → <strong>reject H₀</strong> (p &lt; 0.05)</div>
            </div>
            <div style={{ background: C.bg, borderRadius: "10px", padding: "16px 18px", border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.txD, marginBottom: "6px" }}>CI includes zero</div>
              <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>The null value (0) is <strong>inside</strong> the interval → "no effect" is plausible → <strong>fail to reject H₀</strong> (p ≥ 0.05)</div>
            </div>
          </div>

          <Pr>But CIs are <em>more informative</em> than a p-value alone. A p-value tells you "significant or not." A CI tells you the <strong>range of plausible effect sizes</strong> — how big or small the effect might be. Try the interactive below:</Pr>

          <CBox title={<>🔗 CI ↔ Hypothesis Test Matcher</>} color={C.smp}>
            <CIHypothesisViz />
          </CBox>

          <Ins>
            <strong>Why CIs are often preferred:</strong> The hypothesis test gives a yes/no answer (reject or not). The CI agrees on that answer — but adds crucial information about <em>precision</em>. Consider: two studies both find p = 0.03, so both reject H₀. Same yes/no answer. But Study A's CI is [0.01, 5.50] — the effect could be anywhere from negligible to enormous. Study B's CI is [1.80, 2.40] — the effect is precisely pinned around 2.1. Both rejected H₀, but Study B's evidence is far more useful. The p-value alone can't distinguish between them. The CI can. This is why many journals now <em>require</em> confidence intervals alongside p-values.
          </Ins>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> A <strong>confidence interval</strong> = point estimate ± margin of error, where margin = z* × SE.<br />
              <strong>2.</strong> "95% confidence" means the <em>procedure</em> captures the true value 95% of the time — not that there's a 95% chance <em>your</em> interval does.<br />
              <strong>3.</strong> Width is controlled by <strong>sample size</strong> (↑n → narrower), <strong>confidence level</strong> (↑confidence → wider), and <strong>data variability</strong> (↑SD → wider).<br />
              <strong>4.</strong> A 95% CI that <strong>excludes zero = reject H₀ at α = 0.05</strong>. They always agree.<br />
              <strong>5.</strong> CIs are more informative than p-values alone because they show the <strong>range of plausible effect sizes</strong>, not just "significant or not."
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
