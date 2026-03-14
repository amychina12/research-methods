import { useState, useCallback } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function normalPDF(x, mu = 0, s = 1) {
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / s) ** 2);
}
function betaPDF(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  const B = (gamma(a) * gamma(b)) / gamma(a + b);
  return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / B;
}
function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
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
      <span onClick={() => setShow(!show)} style={{ borderBottom: `1.5px dashed ${C.smp}`, color: C.smp, cursor: "pointer", fontWeight: 600, paddingBottom: "1px" }}>{term}</span>
      {show && (
        <span style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: C.card, border: `1px solid ${C.smp}33`, borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12.5px", lineHeight: 1.6, color: C.txB, width: "260px", zIndex: 20, animation: "fadeIn 0.2s ease" }}>
          {children}
          <span style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", background: C.card, border: `1px solid ${C.smp}33`, borderTop: "none", borderLeft: "none" }} />
        </span>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: TWO SCHOOLS
// ═══════════════════════════════════════════════════════════════════
function TwoSchoolsViz() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        A patient tests positive for a rare disease. What do you want to know?
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ background: C.samLt, borderRadius: "12px", padding: "18px 20px", border: "1px solid rgba(2,132,199,0.2)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "8px" }}>FREQUENTIST ASKS:</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: C.tx, marginBottom: "8px" }}>"If the patient were healthy, how often would this test give a positive result?"</div>
          <div style={{ fontSize: "13px", color: C.txD, lineHeight: 1.6 }}>This is the <strong>p-value</strong> mindset. It asks about the probability of the <em>data</em> given a hypothesis. It never directly answers "does this patient have the disease?"</div>
        </div>
        <div style={{ background: C.smpLt, borderRadius: "12px", padding: "18px 20px", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "8px" }}>BAYESIAN ASKS:</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: C.tx, marginBottom: "8px" }}>"Given this positive test, what is the probability the patient actually has the disease?"</div>
          <div style={{ fontSize: "13px", color: C.txD, lineHeight: 1.6 }}>This is what we actually <em>want</em> to know. Bayesian thinking combines the data with <strong>prior knowledge</strong> (how common is the disease?) to get a direct answer.</div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh }}>
        <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "12px" }}>
          <strong>Here's the scenario:</strong> A disease affects 1 in 1,000 people. The test is 99% accurate (catches 99% of sick people, and correctly clears 99% of healthy people). Your patient tests positive. What's the chance they actually have the disease?
        </div>
        {!revealed ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: C.txD, marginBottom: "8px" }}>Most people guess above 90%. What do you think?</div>
            <button onClick={() => setRevealed(true)} style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: C.smp, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Reveal the Answer</button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "48px", fontWeight: 700, color: C.rose }}>{"\u2248"}9%</div>
              <div style={{ fontSize: "14px", color: C.txD }}>Not 99%. Not even close.</div>
            </div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75 }}>
              <strong>Why so low?</strong> Because the disease is rare (1 in 1,000). Out of 1,000 people tested, about 1 truly has the disease (and tests positive). But about 10 healthy people also test positive by mistake (1% false positive rate × 999 healthy people ≈ 10). So of the ~11 positive results, only 1 actually has the disease: 1/11 ≈ 9%.
            </div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.75, marginTop: "8px" }}>
              This is <strong>base rate neglect</strong> — the tendency to ignore how common something is (the base rate) and focus only on the test's accuracy. Bayesian thinking forces you to account for the base rate. The p-value approach doesn't.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: BAYES THEOREM VISUAL
// ═══════════════════════════════════════════════════════════════════
function BayesViz() {
  const [prevalence, setPrevalence] = useState(1);
  const [sensitivity, setSensitivity] = useState(99);
  const [specificity, setSpecificity] = useState(99);

  const prev = prevalence / 100;
  const sens = sensitivity / 100;
  const spec = specificity / 100;
  const fpr = 1 - spec;

  const pPositive = sens * prev + fpr * (1 - prev);
  const posterior = pPositive > 0 ? (sens * prev) / pPositive : 0;

  const pop = 10000;
  const sick = Math.round(pop * prev);
  const healthy = pop - sick;
  const truePos = Math.round(sick * sens);
  const falseNeg = sick - truePos;
  const falsePos = Math.round(healthy * fpr);
  const trueNeg = healthy - falsePos;
  const totalPos = truePos + falsePos;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Bayes' theorem is just careful bookkeeping. Adjust the sliders and watch the numbers flow through the tree:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}><Tip term="Base Rate (Prevalence)">How common is the condition in the population <em>before</em> you test anyone. This is the "prior" — your starting belief about how likely it is.</Tip></div>
          <input type="range" min="0.1" max="50" step="0.1" value={prevalence} onChange={e => setPrevalence(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.pop, fontFamily: mono }}>{prevalence.toFixed(1)}% ({prevalence < 1 ? "very rare" : prevalence < 5 ? "uncommon" : prevalence < 20 ? "moderate" : "common"})</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}><Tip term="Sensitivity">If someone truly has the disease, what % of the time will the test correctly detect it? Also called the "true positive rate." 99% means it catches 99 out of 100 sick people.</Tip></div>
          <input type="range" min="50" max="100" step="1" value={sensitivity} onChange={e => setSensitivity(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.grn }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.grn, fontFamily: mono }}>{sensitivity}%</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}><Tip term="Specificity">If someone is healthy, what % of the time will the test correctly clear them? 99% means 1% of healthy people get a false alarm.</Tip></div>
          <input type="range" min="50" max="100" step="1" value={specificity} onChange={e => setSpecificity(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.sam, fontFamily: mono }}>{specificity}%</div>
        </div>
      </div>

      {/* Icon array */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "20px 24px", boxShadow: C.sh }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.txD, fontFamily: mono, marginBottom: "10px" }}>OUT OF {pop.toLocaleString()} PEOPLE TESTED:</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "start" }}>
          {/* Left: sick */}
          <div style={{ background: C.roseBg, borderRadius: "10px", padding: "14px", border: "1px solid rgba(225,29,72,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "6px" }}>HAVE DISEASE: {sick.toLocaleString()}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: C.grn }}>{truePos.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.txD }}>Test +</div>
                <div style={{ fontSize: "9px", color: C.grn, fontFamily: mono }}>True positives</div>
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: C.txM }}>{falseNeg.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.txD }}>Test −</div>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>False negatives</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 0" }}>
            <div style={{ fontSize: "20px", color: C.txM }}>→</div>
          </div>

          {/* Right: healthy */}
          <div style={{ background: C.samBg, borderRadius: "10px", padding: "14px", border: "1px solid rgba(2,132,199,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "6px" }}>HEALTHY: {healthy.toLocaleString()}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: C.rose }}>{falsePos.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.txD }}>Test +</div>
                <div style={{ fontSize: "9px", color: C.rose, fontFamily: mono }}>False positives!</div>
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: C.txM }}>{trueNeg.toLocaleString()}</div>
                <div style={{ fontSize: "10px", color: C.txD }}>Test −</div>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono }}>True negatives</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: the answer */}
        <div style={{ marginTop: "16px", background: C.smpBg, borderRadius: "10px", padding: "16px 20px", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "6px" }}>ALL POSITIVE RESULTS: {totalPos.toLocaleString()}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "42px", fontWeight: 700, color: C.smp }}>{(posterior * 100).toFixed(1)}%</div>
            <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.6 }}>
              Of the <strong>{totalPos.toLocaleString()}</strong> people who tested positive, only <strong style={{ color: C.grn }}>{truePos.toLocaleString()}</strong> actually have the disease. The rest (<strong style={{ color: C.rose }}>{falsePos.toLocaleString()}</strong>) are false alarms. So: P(disease | positive test) = {truePos}/{totalPos} = <strong>{(posterior * 100).toFixed(1)}%</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Formula with actual numbers */}
      <div style={{ background: C.bg, borderRadius: "12px", padding: "18px 24px", marginTop: "14px", border: `1px solid ${C.bdr}` }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "10px" }}>Bayes' Theorem — with your numbers plugged in</div>

        {/* Abstract formula */}
        <div style={{ fontSize: "14px", fontFamily: mono, color: C.txD, marginBottom: "12px", textAlign: "center" }}>
          P(disease | +) = P(+ | disease) × P(disease) / P(+)
        </div>

        {/* Labels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", gap: "6px", alignItems: "center", marginBottom: "14px" }}>
          {[
            { label: "Posterior", desc: "What we want", value: (posterior * 100).toFixed(1) + "%", color: C.smp },
            { label: "=", color: C.txM },
            { label: "Likelihood", desc: "P(+ | disease)", value: (sens * 100).toFixed(0) + "%", color: C.grn },
            { label: "×", color: C.txM },
            { label: "Prior", desc: "P(disease)", value: (prev * 100).toFixed(2) + "%", color: C.pop },
            { label: "/", color: C.txM },
            { label: "Evidence", desc: "P(+ overall)", value: (pPositive * 100).toFixed(2) + "%", color: C.txD },
          ].map((item, i) => (
            item.desc ? (
              <div key={i} style={{ background: C.card, borderRadius: "8px", padding: "8px 10px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
                <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{item.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: item.color, fontFamily: font }}>{item.value}</div>
                <div style={{ fontSize: "9px", color: C.txD, fontFamily: mono }}>{item.desc}</div>
              </div>
            ) : (
              <div key={i} style={{ textAlign: "center", fontSize: "18px", fontWeight: 700, color: item.color, fontFamily: mono }}>{item.label}</div>
            )
          ))}
        </div>

        {/* Numerical calculation */}
        <div style={{ background: C.smpBg, borderRadius: "8px", padding: "12px 16px", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ fontSize: "12px", fontFamily: mono, color: C.txB, lineHeight: 1.8, textAlign: "center" }}>
            <span style={{ color: C.smp, fontWeight: 600 }}>{(posterior * 100).toFixed(1)}%</span>
            {" = "}
            <span style={{ color: C.grn }}>{(sens * 100).toFixed(0)}%</span>
            {" × "}
            <span style={{ color: C.pop }}>{(prev * 100).toFixed(2)}%</span>
            {" / "}
            <span style={{ color: C.txD }}>{(pPositive * 100).toFixed(2)}%</span>
          </div>
          <div style={{ fontSize: "11px", color: C.txD, marginTop: "6px", textAlign: "center" }}>
            Where P(+) = P(+ | disease) × P(disease) + P(+ | healthy) × P(healthy) = {(sens * 100).toFixed(0)}% × {(prev * 100).toFixed(2)}% + {(fpr * 100).toFixed(0)}% × {((1 - prev) * 100).toFixed(2)}% = {(pPositive * 100).toFixed(2)}%
          </div>
        </div>

        <div style={{ fontSize: "12px", color: C.txD, marginTop: "10px", lineHeight: 1.7 }}>
          <strong>Read it as:</strong> The chance of actually having the disease given a positive test ({(posterior * 100).toFixed(1)}%) equals the test's accuracy ({(sens * 100).toFixed(0)}%) times the disease's rarity ({(prev * 100).toFixed(2)}%), divided by the overall chance of testing positive ({(pPositive * 100).toFixed(2)}%). The denominator is large because false positives from {((1 - prev) * 100).toFixed(0)}% healthy people inflate it.
        </div>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Try this:</strong> Keep sensitivity and specificity at 99% but increase prevalence from 0.1% to 10%. Watch the posterior jump from ~9% to ~92%. The same test, same accuracy — but the base rate changes everything. This is why screening for rare conditions produces so many false alarms.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: PRIOR → POSTERIOR
// ═══════════════════════════════════════════════════════════════════
function PriorPosteriorViz() {
  const [priorStrength, setPriorStrength] = useState(2);
  const [priorMean, setPriorMean] = useState(0.5);
  const [nHeads, setNHeads] = useState(7);
  const [nFlips, setNFlips] = useState(10);

  // Beta-binomial model: prior Beta(a0, b0) + data (nHeads, nFlips-nHeads) → posterior Beta(a0+nHeads, b0+nFlips-nHeads)
  const a0 = priorMean * priorStrength;
  const b0 = (1 - priorMean) * priorStrength;
  const aPost = a0 + nHeads;
  const bPost = b0 + (nFlips - nHeads);
  const postMean = aPost / (aPost + bPost);
  const dataRate = nFlips > 0 ? nHeads / nFlips : 0.5;

  const W = 500, H = 180, pad = { t: 16, r: 16, b: 28, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const sc = v => pad.l + v * cw;

  const makeCurve = (a, b) => {
    const pts = [];
    for (let i = 1; i < 200; i++) {
      const x = i / 200;
      pts.push({ x, y: betaPDF(x, a, b) });
    }
    return pts;
  };

  const priorPts = makeCurve(a0, b0);
  const postPts = makeCurve(aPost, bPost);
  const allY = [...priorPts.map(p => p.y), ...postPts.map(p => p.y)];
  const mx = Math.max(...allY, 0.01);
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${sc(p.x)},${pad.t + ch - (p.y / mx) * ch}`).join(" ");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The core Bayesian idea: you start with a <strong style={{ color: C.pop }}>prior belief</strong>, observe <strong style={{ color: C.txD }}>data</strong>, and update to a <strong style={{ color: C.smp }}>posterior belief</strong>. The posterior is a compromise between what you believed before and what the data says. Try it with a coin-flipping example:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Your Prior Belief</div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", color: C.txM }}>Where do you think the coin's true probability of heads is?</div>
            <input type="range" min="0.1" max="0.9" step="0.05" value={priorMean} onChange={e => setPriorMean(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>Prior center: {(priorMean * 100).toFixed(0)}% heads</div>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", color: C.txM }}>How confident are you in that belief?</div>
            <input type="range" min="2" max="50" step="1" value={priorStrength} onChange={e => setPriorStrength(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>{priorStrength < 5 ? "Weak (easily swayed)" : priorStrength < 15 ? "Moderate" : "Strong (stubborn)"} — strength = {priorStrength}</div>
          </div>
          <div style={{ background: C.popBg, borderRadius: "8px", padding: "8px 12px", border: "1px solid rgba(217,119,6,0.15)", fontSize: "11px", color: C.txD, lineHeight: 1.6 }}>
            <strong style={{ color: C.pop }}>What is "prior strength"?</strong> In Bayes' theorem, the prior is like <em>imaginary past data</em>. A strength of {priorStrength} is like saying "I've already seen {priorStrength} coin flips before this experiment." If that's only 2, new data easily changes your mind. If it's 50, you've already seen so much that a few new flips barely matter.
            {priorStrength >= 15 && <> Right now at {priorStrength}, you'd need a lot of new flips to budge your belief. Try lowering it to 2–3 and see the difference.</>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Observed Data (new evidence)</div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", color: C.txM }}>Number of flips (how much new evidence)</div>
            <input type="range" min="1" max="100" step="1" value={nFlips} onChange={e => { const v = parseInt(e.target.value); setNFlips(v); if (nHeads > v) setNHeads(v); }} style={{ width: "100%", accentColor: C.txD }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.txD, fontFamily: mono }}>{nFlips} flips</div>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", color: C.txM }}>Number of heads</div>
            <input type="range" min="0" max={nFlips} step="1" value={nHeads} onChange={e => setNHeads(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.txD }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.txD, fontFamily: mono }}>{nHeads} heads ({(dataRate * 100).toFixed(0)}%)</div>
          </div>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 12px", border: `1px solid ${C.bdr}`, fontSize: "11px", color: C.txD, lineHeight: 1.6 }}>
            <strong>The tug-of-war:</strong> Prior strength ({priorStrength}) vs. data amount ({nFlips}). {nFlips > priorStrength * 2 ? "Data dominates here — the posterior will follow the data closely." : nFlips < priorStrength / 2 ? "The prior dominates here — new data barely shifts the posterior." : "They're roughly matched — the posterior will be a genuine compromise."}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
          {[0, 0.25, 0.5, 0.75, 1].map(v => <line key={v} x1={sc(v)} x2={sc(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {/* Data line */}
          <line x1={sc(dataRate)} x2={sc(dataRate)} y1={pad.t} y2={pad.t + ch} stroke={C.txD} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
          <text x={sc(dataRate)} y={H - 14} textAnchor="middle" fontSize="9" fill={C.txD} fontFamily={mono}>data: {(dataRate * 100).toFixed(0)}%</text>
          {/* Prior */}
          <path d={toPath(priorPts)} fill="none" stroke={C.pop} strokeWidth="2.5" strokeDasharray="6,4" />
          {/* Posterior */}
          <path d={toPath(postPts)} fill="none" stroke={C.smp} strokeWidth="2.5" />
          {/* Legend */}
          <line x1={pad.l} x2={pad.l + 20} y1={pad.t + 6} y2={pad.t + 6} stroke={C.pop} strokeWidth="2.5" strokeDasharray="6,4" />
          <text x={pad.l + 24} y={pad.t + 10} fontSize="10" fill={C.pop} fontFamily={font} fontWeight="600">Prior</text>
          <line x1={pad.l + 70} x2={pad.l + 90} y1={pad.t + 6} y2={pad.t + 6} stroke={C.smp} strokeWidth="2.5" />
          <text x={pad.l + 94} y={pad.t + 10} fontSize="10" fill={C.smp} fontFamily={font} fontWeight="600">Posterior</text>
          {[0, 25, 50, 75, 100].map(v => <text key={v} x={sc(v / 100)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}%</text>)}
        </svg>

        {/* Results */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Prior Mean", value: (priorMean * 100).toFixed(0) + "%", color: C.pop },
            { label: "Data Rate", value: (dataRate * 100).toFixed(0) + "%", color: C.txD },
            { label: "Posterior Mean", value: (postMean * 100).toFixed(1) + "%", color: C.smp },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
              <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: s.color, fontFamily: font }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "14px", lineHeight: 1.7 }}>
        <strong>Things to try:</strong> (1) Set a strong prior at 50% and only 5 flips — the posterior barely moves. The prior dominates. (2) Now flip 100 times — the data overwhelms the prior. (3) Set a weak prior and just 3 flips — even a little data moves the posterior a lot. <strong>The posterior is always a weighted average of prior and data, with weights determined by how much evidence each provides.</strong>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: COMPARISON TABLE + PRACTICAL GUIDANCE
// ═══════════════════════════════════════════════════════════════════
function ComparisonViz() {
  const rows = [
    { dim: "Core question", freq: "How likely is this data if H\u2080 is true?", bayes: "Given this data, what should I believe about the hypothesis?" },
    { dim: "Uses prior knowledge?", freq: "No — ignores what you knew before", bayes: "Yes — explicitly combines prior beliefs with data" },
    { dim: "Output", freq: "p-value (probability of data | hypothesis)", bayes: "Posterior probability (probability of hypothesis | data)" },
    { dim: "Interpretation", freq: "\"If no effect exists, 3% of samples would look this extreme\"", bayes: "\"Given the data, there's a 92% probability the effect is real\"" },
    { dim: "Multiple testing", freq: "Inflates false positive rate — needs correction", bayes: "Naturally handled through prior updating" },
    { dim: "Sample size", freq: "Any effect becomes significant with enough data", bayes: "Evidence accumulates proportionally — no automatic significance" },
    { dim: "Subjectivity", freq: "Choice of α, test type, stopping rule", bayes: "Choice of prior (but data overwhelms prior eventually)" },
    { dim: "In management research", freq: "Dominant paradigm — most journals use it", bayes: "Growing but still uncommon — used more in strategy and marketing" },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "16px" }}>
        Neither approach is "right" or "wrong" — they answer different questions. Here's a side-by-side comparison:
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}`, minWidth: "600px" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", background: C.bg }}>
            <div style={{ padding: "12px 16px" }}></div>
            <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.sam, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>FREQUENTIST</div>
            <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.smp, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>BAYESIAN</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: C.tx, background: C.bg }}>{r.dim}</div>
              <div style={{ padding: "10px 14px", fontSize: "12px", color: C.txB, lineHeight: 1.6, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.freq}</div>
              <div style={{ padding: "10px 14px", fontSize: "12px", color: C.txB, lineHeight: 1.6, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.bayes}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "20px", fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>When should you care?</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <CBox title="Frequentist is fine when..." color={C.sam}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            You're running a standard hypothesis test in a well-powered study, your priors don't matter much (e.g., a randomized experiment), or you're publishing in a journal that expects frequentist reporting. Most management and entrepreneurship research falls here — for now.
          </div>
        </CBox>
        <CBox title="Bayesian adds value when..." color={C.smp}>
          <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7 }}>
            Prior knowledge is important (e.g., replication studies), you want to quantify evidence <em>for</em> the null (frequentist can't do this), you're dealing with small samples, or you want to make direct probability statements about hypotheses. Increasingly used in strategy and organizational behavior.
          </div>
        </CBox>
      </div>

      <Anl>
        Think of frequentist as a strict courtroom judge: "I can only rule on the evidence before me today." Bayesian is a detective who says: "I'll consider everything — the evidence today <em>plus</em> what I already know about this suspect." Both have a role, but the detective's approach is often closer to how we actually reason.
      </Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "schools", label: "1. Two Schools" },
  { id: "bayes", label: "2. Bayes' Theorem" },
  { id: "updating", label: "3. Updating Beliefs" },
  { id: "compare", label: "4. When It Matters" },
];

export default function BayesianThinking() {
  const [tab, setTab] = useState("schools");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 4 · Statistical Reasoning</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Bayesian Thinking</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>P-values tell you how surprising your data is. Bayesian inference tells you what you should <em>believe</em>. This module introduces a fundamentally different way of reasoning about evidence.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 18px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* ═══ TAB 1 ═══ */}
        {tab === "schools" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Two ways to think about evidence" sub="Frequentist vs. Bayesian — the question they each answer" />

          <Pr>Everything you've learned so far — p-values, confidence intervals, hypothesis tests — belongs to the <strong>frequentist</strong> tradition. It's powerful, but it has a fundamental limitation: it can never tell you the probability that a hypothesis is true. It can only tell you how surprising your data would be <em>if</em> the hypothesis were true.</Pr>

          <Pr><strong>Bayesian inference</strong> flips the question. Instead of "how likely is the data given the hypothesis?" it asks "how likely is the hypothesis given the data?" To do this, it needs one extra ingredient: what you believed <em>before</em> seeing the data.</Pr>

          <CBox title={<>🏥 The medical test that fools everyone</>} color={C.smp}>
            <TwoSchoolsViz />
          </CBox>

          <Ins>
            This isn't just a medical statistics puzzle — the same logic applies to research. When you find p &lt; 0.05 for an unlikely hypothesis (one with a low "base rate" of being true), the result is less trustworthy than finding p &lt; 0.05 for a plausible hypothesis. Frequentist testing ignores this. Bayesian thinking forces you to confront it.
          </Ins>

          <NBtn onClick={() => setTab("bayes")} label="Next: Bayes' Theorem →" />
        </div>}

        {/* ═══ TAB 2 ═══ */}
        {tab === "bayes" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Bayes' theorem: careful bookkeeping" sub="The math behind updating beliefs with evidence" />

          <Pr>Bayes' theorem isn't mysterious. It's just a systematic way to combine two pieces of information: (1) what you knew before (the <Tip term="prior">Your belief about the probability of something <em>before</em> seeing new evidence. In the medical example, the prior is the disease prevalence (1 in 1,000).</Tip>) and (2) what the evidence tells you (the <Tip term="likelihood">How likely is the observed evidence if the hypothesis is true? In the medical example: if the patient has the disease, the test is 99% likely to be positive.</Tip>). The result is the <Tip term="posterior">Your updated belief <em>after</em> seeing the evidence. It combines the prior and the likelihood. This is what you actually want to know.</Tip>.</Pr>

          <Pr>The interactive below uses the medical test example. Adjust the base rate, sensitivity, and specificity and watch how the numbers flow through to the final answer:</Pr>

          <CBox title={<>🧮 Interactive Bayes Calculator</>} color={C.smp}>
            <BayesViz />
          </CBox>

          <NBtn onClick={() => setTab("updating")} label="Next: Updating Beliefs →" />
        </div>}

        {/* ═══ TAB 3 ═══ */}
        {tab === "updating" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="How data updates what you believe" sub="From a single number to an entire distribution" />

          <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", fontSize: "14px", lineHeight: 1.75, color: C.txB }}>
            <strong style={{ color: C.smp }}>An important upgrade.</strong> In Tab 2, the prior was a <strong>single number</strong> — "the disease affects 1% of people." You plugged it into Bayes' theorem and got a posterior number. Simple.
            <div style={{ marginTop: "8px" }}>Now we go further. In full Bayesian inference, the prior is an <strong>entire distribution</strong> — a curve that expresses two things at once: (1) <em>what</em> you believe (the center of the curve), and (2) <em>how certain</em> you are about that belief (the width of the curve). A wide, flat curve means "I'm not sure." A narrow, peaked curve means "I'm quite confident." This extra dimension — certainty — is what the simple formula in Tab 2 doesn't capture.</div>
            <div style={{ marginTop: "8px" }}>When new data arrives, the posterior is a compromise between the prior distribution and the data. The <strong>relative weight</strong> depends on how much evidence each side brings: a strong (narrow) prior resists change, while a weak (wide) prior is easily overwhelmed by data.</div>
          </div>

          <Pr>Try it below. You'll set both <em>what</em> you believe about a coin (the center) and <em>how sure</em> you are (the width), then see how data shifts your belief:</Pr>

          <CBox title={<>🪙 The Coin-Flipping Belief Updater</>} color={C.smp}>
            <PriorPosteriorViz />
          </CBox>

          <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "16px 20px", marginTop: "12px", fontSize: "14px", lineHeight: 1.7, color: C.txB }}>
            <strong style={{ color: C.pop }}>Why this matters for research:</strong> In a replication study, you already have evidence from the original study. A Bayesian approach lets you <em>formally incorporate</em> that prior evidence, rather than treating each study as if it exists in a vacuum. A frequentist approach ignores everything you knew before, which is why two studies testing the same hypothesis can produce contradictory p-values even when the cumulative evidence is clear.
          </div>

          <NBtn onClick={() => setTab("compare")} label="Next: When It Matters →" />
        </div>}

        {/* ═══ TAB 4 ═══ */}
        {tab === "compare" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Frequentist vs. Bayesian: the full picture" sub="When each approach shines — and when it doesn't" />

          <CBox title={<>📊 Side-by-Side Comparison</>} color={C.smp}>
            <ComparisonViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Frequentist inference asks P(data | hypothesis). Bayesian inference asks P(hypothesis | data). The second is usually what researchers actually want.<br />
              <strong>2.</strong> <strong>Bayes' theorem</strong> combines a prior belief with new evidence to produce an updated posterior belief. It's just careful bookkeeping.<br />
              <strong>3.</strong> <strong>Base rate neglect</strong> is why intuition fails on problems like medical screening — and why p-values can be misleading when testing unlikely hypotheses.<br />
              <strong>4.</strong> The <strong>posterior is a compromise</strong> between prior and data. With enough data, the prior becomes irrelevant — which is why Bayesian and frequentist approaches often converge in large samples.<br />
              <strong>5.</strong> In management research, frequentist methods dominate — but understanding Bayesian thinking makes you a better <em>consumer</em> of frequentist results, because you'll naturally ask "how plausible was this hypothesis <em>before</em> the study?"
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
