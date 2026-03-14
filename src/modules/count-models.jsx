import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function rPoisson(lambda) {
  let L = Math.exp(-lambda), k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
function rNegBin(mu, alpha) {
  // Gamma-Poisson mixture
  const r = 1 / alpha;
  const p = r / (r + mu);
  // Generate gamma(r, p/(1-p)) then poisson
  let g = 0;
  for (let i = 0; i < Math.ceil(r); i++) g -= Math.log(Math.random());
  g *= mu / Math.ceil(r);
  return rPoisson(Math.max(0.01, g));
}
function poissonPMF(k, lambda) {
  if (lambda <= 0 || k < 0) return 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}
function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

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
    <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "6px" }}>{number}</div>
    <h2 style={{ fontFamily: serif, fontSize: "24px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px", color: C.tx }}>{title}</h2>
    {sub && <p style={{ fontSize: "14px", color: C.txD, lineHeight: 1.5 }}>{sub}</p>}
  </div>);
}
function Pr({ children }) { return <p style={{ fontSize: "14.5px", color: C.txB, lineHeight: 1.8, marginBottom: "16px", maxWidth: "640px" }}>{children}</p>; }
function NBtn({ onClick, label }) { return <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}><button onClick={onClick} style={{ padding: "12px 28px", borderRadius: "10px", border: "none", background: C.sam, color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>{label}</button></div>; }
function CBox({ children, title, color = C.sam }) {
  return (<div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", marginBottom: "20px", boxShadow: C.sh }}>
    {title && <div style={{ fontSize: "15px", fontWeight: 700, color, marginBottom: "12px" }}>{title}</div>}
    {children}
  </div>);
}
function Anl({ children }) { return <div style={{ background: C.grnBg, border: "1px solid rgba(5,150,105,0.15)", borderRadius: "10px", padding: "14px 18px", margin: "14px 0", fontSize: "13.5px", lineHeight: 1.65, color: C.txB }}><span style={{ fontWeight: 700, color: C.grn, marginRight: "6px" }}>Analogy:</span>{children}</div>; }
function Ins({ children }) { return <div style={{ background: C.samBg, border: "1px solid rgba(2,132,199,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.sam, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: WHY COUNTS ARE SPECIAL
// ═══════════════════════════════════════════════════════════════════
function WhyCountsViz() {
  const data = useMemo(() => Array.from({ length: 120 }, () => {
    const x = Math.random() * 8 + 1;
    const lambda = Math.exp(0.2 + 0.25 * x);
    const y = rPoisson(lambda);
    return { x, y };
  }), []);

  // OLS fit
  const n = data.length;
  const mx = data.reduce((s, d) => s + d.x, 0) / n;
  const my = data.reduce((s, d) => s + d.y, 0) / n;
  const ssxy = data.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0);
  const ssxx = data.reduce((s, d) => s + (d.x - mx) ** 2, 0);
  const olsB1 = ssxy / ssxx, olsB0 = my - olsB1 * mx;

  const W = 540, H = 300, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xRange = [0, 10], yMax = Math.max(...data.map(d => d.y)) + 3;
  const sx = v => pad.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * cw;
  const sy = v => pad.t + ch - (v / yMax) * ch;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        When your outcome variable Y is a <strong>count</strong> — number of patents, number of acquisitions, number of customer complaints — the data has three properties that OLS doesn't handle well:
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", marginBottom: "12px" }}>
        {[0, 2, 4, 6, 8, 10].map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
        {Array.from({ length: Math.ceil(yMax / 5) + 1 }, (_, i) => i * 5).map(v => v <= yMax && <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

        {/* OLS line — goes below zero */}
        <line x1={sx(0)} x2={sx(10)} y1={sy(olsB0)} y2={sy(olsB0 + olsB1 * 10)} stroke={C.rose} strokeWidth="2" strokeDasharray="8,4" />

        {/* Zero line */}
        <line x1={pad.l} x2={pad.l + cw} y1={sy(0)} y2={sy(0)} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,3" />
        <text x={pad.l + cw + 2} y={sy(0) + 4} fontSize="9" fill={C.pop} fontFamily={mono}>y = 0</text>

        {/* Data */}
        {data.map((d, i) => (
          <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="3.5" fill={C.sam} opacity="0.5" stroke="#fff" strokeWidth="0.5" />
        ))}

        <text x={sx(9)} y={sy(olsB0 + olsB1 * 9) - 8} fontSize="10" fill={C.rose} fontFamily={font} fontWeight="600">OLS line</text>
        {[0, 2, 4, 6, 8, 10].map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        {Array.from({ length: Math.ceil(yMax / 5) + 1 }, (_, i) => i * 5).filter(v => v <= yMax).map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        <text x={sx(5)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X (e.g. firm age in years)</text>
        <text x="12" y={sy(yMax / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy(yMax / 2)})`}>Y (e.g. number of patents)</text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Counts can't be negative</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>A firm can have 0, 1, 2, 3... patents, but never -2 patents. Yet the OLS line (dashed red above) predicts negative values for low X. Same problem as predicting probabilities outside 0-1 in the logit module — the linear model doesn't respect the data's natural boundaries.</div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Counts are discrete (whole numbers only)</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
                OLS assumes the errors (the gaps between predictions and actual values) follow a smooth, bell-shaped normal distribution. But with count data, Y can only be 0, 1, 2, 3... — whole numbers. Consider a firm the model predicts will file 2 patents. The actual outcome might be 0, 1, 2, 3, or 4 — but never 1.5 or 2.3. So the errors can only take specific, discrete values (like -2, -1, 0, +1, +2), not the continuous smooth bell curve OLS expects. Especially when the expected count is low (say, 1 or 2), the distribution of outcomes is clearly asymmetric — bunched near zero with a long right tail — nothing like a normal distribution.
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>3</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Variance grows with the mean</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
                Look at the scatter plot above and compare the left side (young firms) to the right side (older firms). Young firms average about 2 patents, and most have between 0 and 5 — a small spread. Older firms average about 15 patents, and individual firms range from 5 to 30+ — a much wider spread. <strong>Why does this happen?</strong> Because counts have a floor at zero. When the average is low (near zero), there's limited room to spread downward — values are squeezed between 0 and a few. When the average is high, there's plenty of room to spread in both directions. It's like income: the spread of income among billionaires is far wider than among minimum-wage workers, simply because there's more room above. OLS assumes the spread (variance) is the same everywhere — which clearly isn't true here. This means OLS standard errors will be wrong.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Anl>Think of counting stars through a telescope. With a small telescope (small X), you see 0–3 stars — little variation. With a large telescope (large X), you see 5–50 stars — huge variation. The spread of what you observe grows with the number you expect to observe. Counts naturally work this way, and OLS doesn't account for it.</Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: POISSON DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════
function PoissonViz() {
  const [lambda, setLambda] = useState(4);

  const maxK = Math.max(20, Math.ceil(lambda * 3));
  const bars = Array.from({ length: maxK + 1 }, (_, k) => ({
    k, p: poissonPMF(k, lambda),
  }));
  const maxP = Math.max(...bars.map(b => b.p));

  const W = 520, H = 200, pad = { t: 16, r: 16, b: 32, l: 44 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const barW = cw / (maxK + 1);

  const variance = lambda; // Poisson: variance = mean

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Before learning Poisson <em>regression</em>, you need to understand the Poisson <em>distribution</em> — the probability model that describes count data.
      </div>

      {/* Build-up explanation */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "10px" }}>Where does the Poisson come from? A concrete example.</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
          Imagine a biotech startup. Every week, there's a small chance (say, 2%) that the R&D team files a patent. Whether they file in any given week doesn't depend on whether they filed the week before — each week is its own coin flip.

          <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <strong>Week by week:</strong> Each week has a 2% chance of producing a patent. That's 52 weekly "coin flips" per year, each with a 2% probability of heads (patent filed).
            </div>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <strong>Over a full year:</strong> 52 weeks × 2% = about 1.04 expected patents per year. This expected count — the average number you'd see if you watched many years — is <strong>{"λ"} (lambda)</strong>. Here, {"λ"} {"≈"} 1.
            </div>
            <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <strong>But the actual count varies:</strong> In some years the firm files 0 patents (bad luck — none of the 52 coin flips came up heads). In other years 1 or 2. Rarely 3 or 4. Almost never 5+. The Poisson distribution tells you the <em>exact probability of each outcome</em>.
            </div>
          </div>

          <div style={{ background: C.samBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(2,132,199,0.15)", marginTop: "4px" }}>
            <strong style={{ color: C.sam }}>Why does {"λ"} alone determine everything?</strong> Because we've assumed just two things: (1) each small time window has the same chance of producing an event, and (2) events don't affect each other. Under these two assumptions, knowing the average count ({"λ"}) is enough to calculate the probability of seeing exactly 0, 1, 2, 3, ... events. You don't need a separate "spread" parameter — the spread is a mathematical consequence of the average. A higher {"λ"} means more events on average <em>and</em> more room for random variation, so both the center and the spread are controlled by this single number.
          </div>
        </div>
      </div>

      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "8px" }}>
        Drag the slider to see this in action. {"λ"} is the expected count — the average number of events per period. Watch how changing it reshapes the entire distribution:
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Expected Count ({"λ"})</div>
        <input type="range" min="0.5" max="20" step="0.5" value={lambda} onChange={e => setLambda(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.sam }} />
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.sam, fontFamily: mono }}>{"λ"} = {lambda.toFixed(1)}</div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {bars.map((b, i) => {
            const bh = maxP > 0 ? (b.p / maxP) * ch : 0;
            const bx = pad.l + i * barW;
            return (
              <g key={i}>
                <rect x={bx + 1} y={pad.t + ch - bh} width={Math.max(barW - 2, 1)} height={bh} fill={C.sam} opacity="0.5" rx="2" />
                {b.p > 0.01 && barW > 14 && <text x={bx + barW / 2} y={pad.t + ch - bh - 4} textAnchor="middle" fontSize="8" fill={C.sam} fontFamily={mono}>{(b.p * 100).toFixed(0)}%</text>}
              </g>
            );
          })}
          {/* Mean line */}
          <line x1={pad.l + lambda * barW + barW / 2} x2={pad.l + lambda * barW + barW / 2} y1={pad.t} y2={pad.t + ch} stroke={C.pop} strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={pad.l + lambda * barW + barW / 2} y={pad.t - 3} textAnchor="middle" fontSize="9" fill={C.pop} fontFamily={mono} fontWeight="600">{"λ"} = {lambda}</text>

          {/* X-axis labels */}
          {bars.filter((_, i) => i % Math.max(1, Math.floor(maxK / 15)) === 0).map(b => (
            <text key={b.k} x={pad.l + b.k * barW + barW / 2} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{b.k}</text>
          ))}
          <text x={pad.l + cw / 2} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>Count (k)</text>
          <text x="12" y={pad.t + ch / 2} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${pad.t + ch / 2})`}>Probability</text>
        </svg>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
          <SC label={"Mean (\u03BB)"} value={lambda.toFixed(1)} color={C.sam} />
          <SC label="Variance" value={variance.toFixed(1)} color={C.smp} />
          <SC label="Mean = Variance?" value="Yes — always!" color={C.grn} />
        </div>
      </div>

      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.pop }}>Why does mean = variance?</strong> Go back to the coin-flip picture. When {"λ"} is small (say, 1 patent/year), most years you get 0 or 1 — the outcomes are squeezed into a narrow range near zero, so the variance is small. When {"λ"} is large (say, 20 patents/year), you're flipping many more coins, so there's more room for lucky and unlucky streaks — some years you'll get 14, others 26. More coin flips → more chances for the total to deviate from the average → more variance. The Poisson math says the variance grows at <em>exactly</em> the same rate as the mean. This is realistic for some data, but in practice the variance is often even <em>larger</em> than the mean (called overdispersion) — we'll fix that in Tab 4.
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Try this:</strong> (1) Set {"λ"} = 1 — the distribution is heavily right-skewed, most of the mass is at 0 and 1. (2) Set {"λ"} = 10 — it looks more symmetric, almost bell-shaped. (3) Set {"λ"} = 20 — nearly indistinguishable from a normal distribution. This is why researchers sometimes use OLS for large counts — the Poisson approaches normality as {"λ"} grows.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: POISSON REGRESSION
// ═══════════════════════════════════════════════════════════════════
function PoissonRegViz() {
  const [b0, setB0] = useState(0.5);
  const [b1, setB1] = useState(0.2);

  const data = useMemo(() => Array.from({ length: 80 }, () => {
    const x = Math.random() * 8 + 1;
    const lambda = Math.exp(0.5 + 0.2 * x);
    return { x, y: rPoisson(lambda), trueLambda: lambda };
  }), []);

  const W = 540, H = 280, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const yMax = Math.max(...data.map(d => d.y)) + 3;
  const sx = v => pad.l + ((v - 0) / 10) * cw;
  const sy = v => pad.t + ch - (v / yMax) * ch;

  // Predicted curve
  const curvePts = Array.from({ length: 100 }, (_, i) => {
    const x = (i / 99) * 10;
    return { x, y: Math.exp(b0 + b1 * x) };
  });
  const curvePath = curvePts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`).join(" ");

  // OLS line for comparison
  const n = data.length;
  const mx = data.reduce((s, d) => s + d.x, 0) / n;
  const my = data.reduce((s, d) => s + d.y, 0) / n;
  const ssxy = data.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0);
  const ssxx = data.reduce((s, d) => s + (d.x - mx) ** 2, 0);
  const olsB1 = ssxy / ssxx, olsB0 = my - olsB1 * mx;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Poisson regression models the <strong>log of the expected count</strong> as a linear function of X. This is the "log link": log({"λ"}) = b0 + b1 * X, which means {"λ"} = e^(b0 + b1*X). The result is an <strong>exponential curve</strong> that naturally stays positive:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Intercept (b0)</div>
          <input type="range" min="-1" max="2" step="0.1" value={b0} onChange={e => setB0(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.txD }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.txD, fontFamily: mono }}>b0 = {b0.toFixed(1)} (baseline: e^{b0.toFixed(1)} = {Math.exp(b0).toFixed(1)} counts when X=0)</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Slope (b1)</div>
          <input type="range" min="-0.3" max="0.5" step="0.02" value={b1} onChange={e => setB1(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.sam, fontFamily: mono }}>b1 = {b1.toFixed(2)} (IRR: e^{b1.toFixed(2)} = {Math.exp(b1).toFixed(3)})</div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {[0, 2, 4, 6, 8, 10].map(v => <line key={v} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {Array.from({ length: Math.ceil(yMax / 5) + 1 }, (_, i) => i * 5).filter(v => v <= yMax).map(v => <line key={v} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

          {/* OLS line */}
          <line x1={sx(0)} x2={sx(10)} y1={sy(olsB0)} y2={sy(olsB0 + olsB1 * 10)} stroke={C.rose} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5" />

          {/* Poisson curve */}
          <path d={curvePath} fill="none" stroke={C.sam} strokeWidth="3" />

          {/* Data */}
          {data.map((d, i) => <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="3.5" fill={C.sam} opacity="0.45" stroke="#fff" strokeWidth="0.5" />)}

          {/* Legend */}
          <line x1={pad.l + cw - 100} x2={pad.l + cw - 80} y1={pad.t + 10} y2={pad.t + 10} stroke={C.sam} strokeWidth="3" />
          <text x={pad.l + cw - 76} y={pad.t + 14} fontSize="10" fill={C.sam} fontFamily={font} fontWeight="600">Poisson</text>
          <line x1={pad.l + cw - 100} x2={pad.l + cw - 80} y1={pad.t + 24} y2={pad.t + 24} stroke={C.rose} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5" />
          <text x={pad.l + cw - 76} y={pad.t + 28} fontSize="10" fill={C.rose} fontFamily={font}>OLS</text>

          {[0, 2, 4, 6, 8, 10].map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {Array.from({ length: Math.ceil(yMax / 5) + 1 }, (_, i) => i * 5).filter(v => v <= yMax).map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
        </svg>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", marginTop: "14px", border: `1px solid ${C.bdr}`, textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, marginBottom: "6px" }}>THE MODEL</div>
        <div style={{ fontSize: "16px", fontFamily: mono, color: C.sam, fontWeight: 600 }}>log({"λ"}) = {b0.toFixed(1)} + {b1.toFixed(2)} * X &nbsp;&nbsp; {"→"} &nbsp;&nbsp; {"λ"} = e^({b0.toFixed(1)} + {b1.toFixed(2)} * X)</div>
        <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px" }}>The left side is linear in X (what the model estimates). The right side is the predicted count (exponential in X).</div>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "12px", lineHeight: 1.7 }}>
        <strong>Why exponential?</strong> Because we're modeling log({"λ"}) as linear, the predicted count {"λ"} = e^(b0 + b1*X) is exponential. This guarantees {"λ"} is always positive (e^anything {">"} 0) and captures the natural pattern that counts often grow multiplicatively, not additively.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: OVERDISPERSION
// ═══════════════════════════════════════════════════════════════════
function OverdispersionViz() {
  const [lambda, setLambda] = useState(5);
  const [alpha, setAlpha] = useState(0.5);

  // Generate samples from both
  const poissonSample = useMemo(() => Array.from({ length: 500 }, () => rPoisson(lambda)), [lambda]);
  const negbinSample = useMemo(() => Array.from({ length: 500 }, () => rNegBin(lambda, alpha)), [lambda, alpha]);

  // Build histograms
  const maxVal = Math.max(...poissonSample, ...negbinSample, 20);
  const bins = maxVal + 1;
  const poisHist = Array(bins).fill(0);
  const nbHist = Array(bins).fill(0);
  poissonSample.forEach(v => { if (v < bins) poisHist[v]++; });
  negbinSample.forEach(v => { if (v < bins) nbHist[v]++; });
  const maxH = Math.max(...poisHist, ...nbHist);

  const pMean = poissonSample.reduce((a, b) => a + b, 0) / poissonSample.length;
  const pVar = poissonSample.reduce((s, v) => s + (v - pMean) ** 2, 0) / poissonSample.length;
  const nbMean = negbinSample.reduce((a, b) => a + b, 0) / negbinSample.length;
  const nbVar = negbinSample.reduce((s, v) => s + (v - nbMean) ** 2, 0) / negbinSample.length;

  const W = 520, H = 180, pad = { t: 16, r: 16, b: 28, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const barW = cw / bins;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The Poisson model assumes <strong>mean = variance</strong>. But in most real data, the variance is <em>larger</em> than the mean — this is called <strong>overdispersion</strong>. It's extremely common: patent counts vary more than a Poisson predicts because some firms are just more innovative than others (unobserved heterogeneity).
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Mean ({"λ"})</div>
          <input type="range" min="1" max="15" step="0.5" value={lambda} onChange={e => setLambda(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.sam }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.sam, fontFamily: mono }}>{"λ"} = {lambda.toFixed(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Overdispersion ({"α"})</div>
          <input type="range" min="0.1" max="3" step="0.1" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.smp }} />
          <div style={{ fontSize: "12px", fontWeight: 600, color: C.smp, fontFamily: mono }}>{"α"} = {alpha.toFixed(1)} {alpha < 0.3 ? "(nearly Poisson)" : alpha < 1 ? "(moderate)" : "(severe)"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Poisson */}
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "6px" }}>POISSON (mean = variance)</div>
          <svg viewBox={`0 0 ${W / 2} ${H}`} style={{ width: "100%" }}>
            {poisHist.map((c, i) => {
              const bh = maxH > 0 ? (c / maxH) * ch : 0;
              return <rect key={i} x={8 + i * ((W / 2 - 16) / bins)} y={pad.t + ch - bh} width={Math.max((W / 2 - 16) / bins - 1, 1)} height={bh} fill={C.sam} opacity="0.5" rx="1" />;
            })}
          </svg>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "6px" }}>
            <SC label="Mean" value={pMean.toFixed(1)} color={C.sam} />
            <SC label="Variance" value={pVar.toFixed(1)} color={C.sam} />
          </div>
        </div>

        {/* Negative Binomial */}
        <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "6px" }}>NEGATIVE BINOMIAL (variance {">"} mean)</div>
          <svg viewBox={`0 0 ${W / 2} ${H}`} style={{ width: "100%" }}>
            {nbHist.map((c, i) => {
              const bh = maxH > 0 ? (c / maxH) * ch : 0;
              return <rect key={i} x={8 + i * ((W / 2 - 16) / bins)} y={pad.t + ch - bh} width={Math.max((W / 2 - 16) / bins - 1, 1)} height={bh} fill={C.smp} opacity="0.5" rx="1" />;
            })}
          </svg>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "6px" }}>
            <SC label="Mean" value={nbMean.toFixed(1)} color={C.smp} />
            <SC label="Variance" value={nbVar.toFixed(1)} color={nbVar > nbMean * 1.3 ? C.rose : C.smp} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: "13px", color: C.txD, marginTop: "14px", lineHeight: 1.7 }}>
        <strong>Compare:</strong> The Poisson (left) has variance {"\u2248"} mean = {lambda.toFixed(1)}. The Negative Binomial (right) has the same mean but variance = {nbVar.toFixed(1)} — {(nbVar / nbMean).toFixed(1)}x larger. The NegBin distribution is wider and has a heavier right tail (more firms with many patents, and more firms with zero).
      </div>

      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.pop }}>Why does overdispersion matter?</strong> If you use Poisson when the data is overdispersed, the coefficients are still roughly correct, but the <strong>standard errors are too small</strong> — making you think effects are more significant than they really are. The Negative Binomial adds an extra parameter ({"α"}) that lets the variance exceed the mean, giving honest SEs.
      </div>

      <Anl>Imagine estimating how many cookies each student eats at a party. A Poisson model assumes every student has the same appetite. But some students love cookies and eat 10, while others eat 0. This hidden variation (unobserved heterogeneity) creates more spread than Poisson allows. The Negative Binomial accounts for the fact that different students have different underlying "cookie rates."</Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: CHOOSING THE RIGHT MODEL
// ═══════════════════════════════════════════════════════════════════
function ChooseModelViz() {
  const [step, setStep] = useState(0);

  const steps = [
    { q: "Is your outcome variable a count (0, 1, 2, 3...)?", yes: 1, no: "use_ols", noLabel: "No → use OLS or logit (depending on outcome type)" },
    { q: "Are there lots of zeros (more than a Poisson would predict)?", yes: "use_zip", yesLabel: "Yes → consider Zero-Inflated Poisson (ZIP) or Zero-Inflated NegBin (ZINB)", no: 2 },
    { q: "Is the variance much larger than the mean?", yes: "use_nb", yesLabel: "Yes → use Negative Binomial", no: "use_pois", noLabel: "No → Poisson is appropriate" },
  ];

  const endpoints = {
    use_ols: { label: "OLS / Logit / Other", desc: "Your outcome isn't a count — go back to OLS (continuous) or logit (binary).", color: C.txD },
    use_pois: { label: "Poisson Regression", desc: "Your count data has variance ≈ mean with no excess zeros. Poisson is the right choice. In Stata: poisson y x, or glm y x, family(poisson).", color: C.sam },
    use_nb: { label: "Negative Binomial", desc: "Your count data is overdispersed (variance > mean). NegBin handles this by adding a dispersion parameter. In Stata: nbreg y x. Run a likelihood-ratio test to confirm NegBin is preferred over Poisson.", color: C.smp },
    use_zip: { label: "Zero-Inflated Model", desc: "Many observations are 'structural zeros' — they could never have a positive count (e.g., firms without R&D departments can't patent). ZIP/ZINB models the zeros separately from the counts. In Stata: zip y x, inflate(z) or zinb y x, inflate(z).", color: C.pop },
  };

  const current = steps[step];
  const isEnd = typeof current === "undefined";

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Not sure which count model to use? Walk through this decision tree:
      </div>

      {/* Decision tree */}
      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "22px 24px", boxShadow: C.sh }}>
        {typeof step === "number" && steps[step] ? (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, marginBottom: "8px" }}>QUESTION {step + 1} OF {steps.length}</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: C.tx, marginBottom: "16px", lineHeight: 1.4 }}>{steps[step].q}</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(steps[step].yes)} style={{ flex: 1, padding: "14px 20px", borderRadius: "10px", border: `2px solid ${C.grn}`, background: C.grnBg, color: C.grn, fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                <div>{"\u2705"} Yes</div>
                {steps[step].yesLabel && <div style={{ fontSize: "11px", fontWeight: 400, color: C.txD, marginTop: "4px" }}>{steps[step].yesLabel}</div>}
              </button>
              <button onClick={() => setStep(steps[step].no)} style={{ flex: 1, padding: "14px 20px", borderRadius: "10px", border: `2px solid ${C.txM}`, background: C.bg, color: C.txD, fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "left" }}>
                <div>No</div>
                {steps[step].noLabel && <div style={{ fontSize: "11px", fontWeight: 400, color: C.txD, marginTop: "4px" }}>{steps[step].noLabel}</div>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {endpoints[step] && <>
              <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, marginBottom: "8px" }}>RECOMMENDATION</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: endpoints[step].color, marginBottom: "10px" }}>{endpoints[step].label}</div>
              <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.7 }}>{endpoints[step].desc}</div>
            </>}
            <div style={{ marginTop: "16px" }}>
              <button onClick={() => setStep(0)} style={{ padding: "9px 20px", borderRadius: "9px", border: `1.5px solid ${C.bdr}`, background: "transparent", color: C.txD, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: font }}>Start Over</button>
            </div>
          </div>
        )}
      </div>

      {/* Quick reference table */}
      <div style={{ marginTop: "20px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr", background: C.bg, fontSize: "10px", fontWeight: 700, fontFamily: mono, color: C.txM }}>
          <div style={{ padding: "10px" }}></div>
          <div style={{ padding: "10px", borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>POISSON</div>
          <div style={{ padding: "10px", borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>NEG. BINOMIAL</div>
          <div style={{ padding: "10px", borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>ZERO-INFLATED</div>
        </div>
        {[
          { dim: "Variance", pois: "= mean", nb: "> mean (flexible)", zi: "> mean + excess zeros" },
          { dim: "Parameters", pois: "β only", nb: "β + α (dispersion)", zi: "β + inflation model" },
          { dim: "Use when", pois: "Rare events, no overdispersion", nb: "Overdispersion present", zi: "Two types of zeros" },
          { dim: "Stata", pois: "poisson y x", nb: "nbreg y x", zi: "zip y x, inflate(z)" },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr", borderTop: `1px solid ${C.bdr}`, fontSize: "11px" }}>
            <div style={{ padding: "8px 10px", fontWeight: 600, color: C.tx, background: C.bg }}>{r.dim}</div>
            <div style={{ padding: "8px 10px", color: C.txB, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.pois}</div>
            <div style={{ padding: "8px 10px", color: C.txB, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.nb}</div>
            <div style={{ padding: "8px 10px", color: C.txB, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.zi}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "why", label: "1. Why Counts Are Special" },
  { id: "poisson", label: "2. Poisson Distribution" },
  { id: "poisreg", label: "3. Poisson Regression" },
  { id: "overdispersion", label: "4. Overdispersion" },
  { id: "choose", label: "5. Choosing a Model" },
];

export default function CountModels() {
  const [tab, setTab] = useState("why");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.samLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.samLt, color: C.sam, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 7 · Foundations</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Count Models</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>When your outcome is a count — number of patents, acquisitions, complaints, or exits — OLS assumptions break. Poisson and Negative Binomial models are built for this kind of data.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.sam : C.txD, borderBottom: `2px solid ${tab === t.id ? C.sam : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "why" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Why counts need special treatment" sub="Three properties of count data that break OLS" />
          <Pr>In the previous modules, Y was either continuous (OLS) or binary (logit). Now Y is a <strong>count</strong> — a non-negative integer: 0, 1, 2, 3, ... Think: number of patents filed, number of acquisitions made, number of employees who quit.</Pr>
          <Pr>You might think: "Counts are just numbers — why not use OLS?" The scatter plot below shows why:</Pr>

          <CBox title={<>📊 OLS on Count Data</>} color={C.sam}>
            <WhyCountsViz />
          </CBox>

          <NBtn onClick={() => setTab("poisson")} label="Next: Poisson Distribution →" />
        </div>}

        {tab === "poisson" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="The Poisson distribution" sub="A probability model built specifically for counting independent random events" />

          <CBox title={<>🎲 Interactive Poisson Distribution</>} color={C.sam}>
            <PoissonViz />
          </CBox>

          <NBtn onClick={() => setTab("poisreg")} label="Next: Poisson Regression →" />
        </div>}

        {tab === "poisreg" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="Poisson regression" sub="Modeling log-counts as a linear function of X" />
          <Pr>Just as logit regression models log-odds as a linear function of X, Poisson regression models the <strong>log of the expected count</strong> as linear. This is the "log link" function — it ensures predicted counts are always positive.</Pr>

          <CBox title={<>📈 Interactive Poisson Regression</>} color={C.sam}>
            <PoissonRegViz />
          </CBox>

          <Ins>
            <strong>Interpreting coefficients:</strong> Because the model uses a log link, a 1-unit increase in X <strong>multiplies</strong> the expected count by e^b1. This is called the <strong>Incidence Rate Ratio (IRR)</strong>. If b1 = 0.20, then IRR = e^0.20 = 1.22 — each additional unit of X increases the expected count by 22%. This is multiplicative, not additive — just like odds ratios in logit.
          </Ins>

          <NBtn onClick={() => setTab("overdispersion")} label="Next: Overdispersion →" />
        </div>}

        {tab === "overdispersion" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="When Poisson isn't enough" sub="Overdispersion and the Negative Binomial solution" />
          <Pr>The Poisson model has one strict assumption: <strong>the mean equals the variance</strong>. In practice, this is often violated — the data has more variation than Poisson allows. When variance {">"} mean, it's called <strong>overdispersion</strong>.</Pr>

          <CBox title={<>📊 Poisson vs. Negative Binomial</>} color={C.sam}>
            <OverdispersionViz />
          </CBox>

          <NBtn onClick={() => setTab("choose")} label="Next: Choosing a Model →" />
        </div>}

        {tab === "choose" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="Which count model should I use?" sub="A decision tree for common situations" />

          <CBox title={<>🌳 Model Selection Decision Tree</>} color={C.sam}>
            <ChooseModelViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> Count data (0, 1, 2, ...) violates OLS assumptions: non-negative, discrete, and variance grows with the mean.<br />
              <strong>2.</strong> The <strong>Poisson distribution</strong> has one parameter ({"λ"}) that controls both the mean and variance (mean = variance).<br />
              <strong>3.</strong> <strong>Poisson regression</strong> uses a log link: log({"λ"}) = b0 + b1X. Coefficients are interpreted as Incidence Rate Ratios: IRR = e^b1.<br />
              <strong>4.</strong> <strong>Overdispersion</strong> (variance {">"} mean) is very common in real data. Using Poisson when overdispersed gives SEs that are too small.<br />
              <strong>5.</strong> The <strong>Negative Binomial</strong> adds a dispersion parameter to handle overdispersion. It's the workhorse for most count data in management research.<br />
              <strong>6.</strong> If you have <strong>excess zeros</strong> (more zeros than either model predicts), consider zero-inflated models (ZIP, ZINB).
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
