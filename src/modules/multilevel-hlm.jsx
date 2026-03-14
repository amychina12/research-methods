import { useState, useMemo } from "react";

// ─── Utils ──────────────────────────────────────────────────────────
function rNorm(mu = 0, s = 1) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mu + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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
const grpColors = ["#0284C7", "#D97706", "#059669", "#7C3AED", "#E11D48", "#0891B2", "#6D28D9", "#B45309"];

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
function Ins({ children }) { return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }
function SC({ label, value, color }) {
  return (<div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}`, textAlign: "center", minWidth: "90px" }}>
    <div style={{ fontSize: "9px", color: C.txM, fontFamily: mono, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: 700, color: color || C.tx, fontFamily: font }}>{value}</div>
  </div>);
}

// ─── Generate nested data ───────────────────────────────────────────
function genNestedData(nGroups, nPerGroup, grandIntercept, avgSlope, interceptSD, slopeSD, residSD) {
  const data = [];
  const groups = [];
  for (let g = 0; g < nGroups; g++) {
    const gi = grandIntercept + rNorm(0, interceptSD);
    const gs = avgSlope + rNorm(0, slopeSD);
    groups.push({ id: g, name: `Group ${String.fromCharCode(65 + g)}`, intercept: gi, slope: gs });
    for (let j = 0; j < nPerGroup; j++) {
      const x = rNorm(5, 2);
      const y = gi + gs * x + rNorm(0, residSD);
      data.push({ g, x, y });
    }
  }
  return { data, groups };
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: NESTED DATA
// ═══════════════════════════════════════════════════════════════════
function NestedViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        In many research settings, your data has a <strong>nested</strong> (or hierarchical) structure: individuals are grouped within higher-level units.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {[
          { l1: "Employees", l2: "Firms", icon: "🏢", example: "50 employees in each of 20 firms. Employees in the same firm share a boss, culture, and policies." },
          { l1: "Students", l2: "Schools", icon: "🏫", example: "30 students in each of 15 classrooms. Students in the same classroom have the same teacher." },
          { l1: "Observations", l2: "Countries", icon: "🌍", example: "Firm-year observations nested within countries. Firms in the same country share institutions and regulations." },
        ].map((ex, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "14px", boxShadow: C.sh }}>
            <div style={{ fontSize: "24px", marginBottom: "6px" }}>{ex.icon}</div>
            <div style={{ fontSize: "12px", color: C.smp, fontWeight: 700, fontFamily: mono, marginBottom: "2px" }}>Level 2: {ex.l2}</div>
            <div style={{ fontSize: "12px", color: C.sam, fontWeight: 700, fontFamily: mono, marginBottom: "8px" }}>Level 1: {ex.l1}</div>
            <div style={{ fontSize: "12px", color: C.txD, lineHeight: 1.6 }}>{ex.example}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Why does nesting matter?</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Non-independence</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>OLS assumes every observation is independent. But employees in the same firm aren't independent — they share a work environment. If Firm A has a great culture, <em>all</em> its employees tend to perform better. This means the 50 employees in Firm A don't give you 50 independent pieces of information — they're partly redundant. Using OLS pretends you have more information than you do, making <strong>standard errors too small</strong> and p-values too optimistic.</div>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "16px 20px", boxShadow: C.sh }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: C.roseBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: C.rose, fontFamily: mono, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "4px" }}>Interesting group-level variation</div>
              <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>Sometimes the group differences are exactly what you want to study. How much do firms differ in average performance? Does the effect of training vary across firms? OLS gives you one slope for everyone. HLM lets each group have its own intercept and slope, then asks: <strong>how much do these intercepts and slopes vary across groups, and what predicts that variation?</strong></div>
            </div>
          </div>
        </div>
      </div>

      <Anl>Think of students in different classrooms. If you want to know whether homework helps test scores, you can't just pool everyone together — some classrooms have strict teachers who assign more homework <em>and</em> teach better. The students aren't independent; they share a teacher. HLM accounts for this nesting by modeling both the student level (does more homework help <em>this student</em>?) and the classroom level (does homework help more in <em>some classrooms</em> than others?).</Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: ICC
// ═══════════════════════════════════════════════════════════════════
function ICCViz() {
  const [icc, setIcc] = useState(0.3);

  const interceptSD = Math.sqrt(icc * 100);
  const residSD = Math.sqrt((1 - icc) * 100);

  const { data, groups } = useMemo(() =>
    genNestedData(6, 12, 50, 0, interceptSD, 0, residSD),
    [icc]
  );

  const grandMean = data.reduce((s, d) => s + d.y, 0) / data.length;

  // Visualize as dot strips
  const W = 520, H = 200, pad = { t: 16, r: 16, b: 24, l: 16 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const yMin = Math.min(...data.map(d => d.y)) - 3;
  const yMax = Math.max(...data.map(d => d.y)) + 3;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;
  const stripW = cw / 6;

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Before running HLM, you should check: <strong>how much of the variation in Y is between groups vs. within groups?</strong> The <strong>Intraclass Correlation Coefficient (ICC)</strong> answers this. It ranges from 0 (groups don't differ at all) to 1 (all variation is between groups).
      </div>

      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>ICC (proportion of variance between groups)</div>
        <input type="range" min="0.02" max="0.8" step="0.02" value={icc} onChange={e => setIcc(parseFloat(e.target.value))} style={{ width: "100%", maxWidth: "400px", accentColor: C.smp }} />
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.smp, fontFamily: mono }}>ICC = {(icc * 100).toFixed(0)}% {icc < 0.1 ? "(very low — groups barely differ)" : icc < 0.25 ? "(moderate — some group differences)" : icc < 0.5 ? "(substantial — groups clearly differ)" : "(high — most variation is between groups)"}</div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {/* Grand mean line */}
          <line x1={pad.l} x2={W - pad.r} y1={sy(grandMean)} y2={sy(grandMean)} stroke={C.txM} strokeWidth="1" strokeDasharray="4,3" />

          {groups.map((g, gi) => {
            const gData = data.filter(d => d.g === gi);
            const gMean = gData.reduce((s, d) => s + d.y, 0) / gData.length;
            const cx = pad.l + gi * stripW + stripW / 2;

            return (
              <g key={gi}>
                {/* Group label */}
                <text x={cx} y={H - 4} textAnchor="middle" fontSize="10" fill={grpColors[gi]} fontFamily={font} fontWeight="600">{g.name}</text>
                {/* Individual dots */}
                {gData.map((d, j) => (
                  <circle key={j} cx={cx + rNorm(0, stripW * 0.15)} cy={sy(d.y)} r="3" fill={grpColors[gi]} opacity="0.45" />
                ))}
                {/* Group mean */}
                <line x1={cx - 16} x2={cx + 16} y1={sy(gMean)} y2={sy(gMean)} stroke={grpColors[gi]} strokeWidth="2.5" />
              </g>
            );
          })}
        </svg>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
          <SC label="ICC" value={(icc * 100).toFixed(0) + "%"} color={C.smp} />
          <SC label="Between-group var" value={(icc * 100).toFixed(0) + "%"} color={C.pop} />
          <SC label="Within-group var" value={((1 - icc) * 100).toFixed(0) + "%"} color={C.sam} />
        </div>
      </div>

      <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.7, marginTop: "14px" }}>
        <strong>Try this:</strong> (1) Set ICC = 5% — the group means (colored bars) are almost at the same level; most variation is within groups. HLM may not be necessary. (2) Set ICC = 50% — the group means are clearly spread apart; there's a lot of between-group variation. HLM is important here. (3) <strong>Rule of thumb:</strong> If ICC {">"} 5–10%, you should use multilevel modeling to account for the group structure.
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE ICC FORMULA</div>
        <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", marginBottom: "6px" }}>
          ICC = σ²<sub>between</sub> / (σ²<sub>between</sub> + σ²<sub>within</sub>)
        </div>
        <div style={{ fontSize: "12px", color: C.txD, textAlign: "center" }}>
          In Stata: Run an empty HLM first (<code style={{ background: C.card, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>mixed y || group:</code>), then <code style={{ background: C.card, padding: "1px 5px", borderRadius: "3px", fontFamily: mono, fontSize: "11px" }}>estat icc</code>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: RANDOM INTERCEPTS & SLOPES
// ═══════════════════════════════════════════════════════════════════
function RandomSlopesViz() {
  const [model, setModel] = useState("pooled");
  const [interceptVar, setInterceptVar] = useState(8);
  const [slopeVar, setSlopeVar] = useState(0);

  const slopeSD = model === "slopes" ? Math.sqrt(slopeVar) : 0;
  const { data, groups } = useMemo(() =>
    genNestedData(6, 15, 20, 2, Math.sqrt(interceptVar), slopeSD, 3),
    [interceptVar, slopeVar, model]
  );

  const W = 540, H = 320, pad = { t: 20, r: 20, b: 36, l: 48 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xVals = data.map(d => d.x);
  const yVals = data.map(d => d.y);
  const xMin = Math.floor(Math.min(...xVals) - 1);
  const xMax = Math.ceil(Math.max(...xVals) + 1);
  const yMin = Math.floor(Math.min(...yVals) - 3);
  const yMax = Math.ceil(Math.max(...yVals) + 3);
  const sx = v => pad.l + ((v - xMin) / (xMax - xMin)) * cw;
  const sy = v => pad.t + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Pooled OLS
  const n = data.length;
  const mx = data.reduce((s, d) => s + d.x, 0) / n;
  const my = data.reduce((s, d) => s + d.y, 0) / n;
  const pooledB1 = data.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0) / data.reduce((s, d) => s + (d.x - mx) ** 2, 0);
  const pooledB0 = my - pooledB1 * mx;

  const xStep = Math.max(1, Math.round((xMax - xMin) / 6));
  const yStep = Math.max(1, Math.round((yMax - yMin) / 6));
  const xTicks = []; for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) xTicks.push(v);
  const yTicks = []; for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        HLM has two key extensions beyond OLS: <strong>random intercepts</strong> (groups differ in their baseline level of Y) and <strong>random slopes</strong> (the effect of X on Y differs across groups). Toggle between models:
      </div>

      <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "14px" }}>
        {[
          { id: "pooled", label: "Pooled OLS (one line)" },
          { id: "intercepts", label: "Random Intercepts" },
          { id: "slopes", label: "Random Intercepts + Slopes" },
        ].map(v => (
          <button key={v.id} onClick={() => setModel(v.id)} style={{
            padding: "8px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: model === v.id ? C.smp : C.bdr,
            background: model === v.id ? C.smpBg : "transparent",
            color: model === v.id ? C.smp : C.txD,
            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{v.label}</button>
        ))}
      </div>

      {(model === "intercepts" || model === "slopes") && (
        <div style={{ display: "grid", gridTemplateColumns: model === "slopes" ? "1fr 1fr" : "1fr", gap: "14px", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Intercept Variance (how much groups differ in baseline Y)</div>
            <input type="range" min="0" max="40" step="2" value={interceptVar} onChange={e => setInterceptVar(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.smp }} />
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.smp, fontFamily: mono }}>σ²_intercept = {interceptVar}</div>
          </div>
          {model === "slopes" && (
            <div>
              <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "4px" }}>Slope Variance (how much the X→Y effect differs across groups)</div>
              <input type="range" min="0" max="4" step="0.2" value={slopeVar} onChange={e => setSlopeVar(parseFloat(e.target.value))} style={{ width: "100%", accentColor: C.pop }} />
              <div style={{ fontSize: "12px", fontWeight: 600, color: C.pop, fontFamily: mono }}>σ²_slope = {slopeVar.toFixed(1)}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "16px", boxShadow: C.sh }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
          {xTicks.map(v => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={pad.t} y2={pad.t + ch} stroke={C.grid} strokeWidth="1" />)}
          {yTicks.map(v => <line key={`y${v}`} x1={pad.l} x2={pad.l + cw} y1={sy(v)} y2={sy(v)} stroke={C.grid} strokeWidth="1" />)}

          {/* Group-level lines */}
          {model !== "pooled" && groups.map((g, gi) => (
            <line key={`gl${gi}`} x1={sx(xMin)} x2={sx(xMax)}
              y1={sy(g.intercept + g.slope * xMin)} y2={sy(g.intercept + g.slope * xMax)}
              stroke={grpColors[gi]} strokeWidth="2" opacity="0.5" />
          ))}

          {/* Pooled line */}
          {model === "pooled" && (
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(pooledB0 + pooledB1 * xMin)} y2={sy(pooledB0 + pooledB1 * xMax)} stroke={C.rose} strokeWidth="2.5" />
          )}

          {/* Data points */}
          {data.map((d, i) => (
            <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="3.5"
              fill={model === "pooled" ? C.txM : grpColors[d.g]}
              opacity={model === "pooled" ? 0.35 : 0.5}
              stroke="#fff" strokeWidth="0.5" />
          ))}

          {/* Axes */}
          {xTicks.map(v => <text key={v} x={sx(v)} y={H - 8} textAnchor="middle" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          {yTicks.map(v => <text key={v} x={pad.l - 8} y={sy(v) + 3} textAnchor="end" fontSize="9" fill={C.txM} fontFamily={mono}>{v}</text>)}
          <text x={sx((xMin + xMax) / 2)} y={H} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font}>X (e.g. training hours)</text>
          <text x="12" y={sy((yMin + yMax) / 2)} textAnchor="middle" fontSize="10" fill={C.txD} fontFamily={font} transform={`rotate(-90, 12, ${sy((yMin + yMax) / 2)})`}>Y (e.g. performance)</text>
        </svg>
      </div>

      {/* Explanation for each model */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        {model === "pooled" && <>
          <strong style={{ color: C.rose }}>Pooled OLS: one line fits all.</strong> Ignores the group structure entirely. Every employee gets the same regression line regardless of which firm they're in. This assumes training has exactly the same effect in every firm, and all firms have the same baseline performance — which is usually unrealistic.
        </>}
        {model === "intercepts" && <>
          <strong style={{ color: C.smp }}>Random Intercepts: parallel lines.</strong> Each group gets its <em>own baseline</em> (intercept) but the <strong>same slope</strong>. This means: firms differ in average performance (some firms are just better), but the effect of training on performance is the same everywhere. The intercepts are drawn from a normal distribution with variance σ²_intercept = {interceptVar}. Try increasing the variance — the lines spread apart vertically.
        </>}
        {model === "slopes" && <>
          <strong style={{ color: C.pop }}>Random Intercepts + Slopes: lines fan out.</strong> Each group gets its <em>own intercept AND its own slope</em>. This means: not only do firms differ in baseline performance, but the <strong>effect of training differs across firms</strong>. In some firms, training helps a lot (steep slope); in others, it barely matters (flat slope). The slope variance σ²_slope = {slopeVar.toFixed(1)} controls how much the slopes vary. Try increasing it — the lines diverge instead of staying parallel.
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: THE HLM EQUATIONS
// ═══════════════════════════════════════════════════════════════════
function EquationsViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        HLM is sometimes called "two-level modeling" because it writes the model in two levels. But it can also be combined into a single equation. Here's how the pieces fit together:
      </div>

      {/* Level 1 */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "8px" }}>LEVEL 1: WITHIN-GROUP (employee level)</div>
        <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0" }}>
          Y<sub>ij</sub> = <span style={{ color: C.smp }}>β<sub>0j</sub></span> + <span style={{ color: C.pop }}>β<sub>1j</sub></span>X<sub>ij</sub> + ε<sub>ij</sub>
        </div>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          For employee <em>i</em> in firm <em>j</em>: their outcome Y depends on their firm's intercept (<span style={{ color: C.smp, fontWeight: 600 }}>β<sub>0j</sub></span>), the effect of X in their firm (<span style={{ color: C.pop, fontWeight: 600 }}>β<sub>1j</sub></span>), and individual-level error (ε<sub>ij</sub>). Notice: the intercept and slope have a <em>j</em> subscript — they vary by firm.
        </div>
      </div>

      {/* Level 2 */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "8px" }}>LEVEL 2: BETWEEN-GROUP (firm level)</div>
        <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0" }}>
          <span style={{ color: C.smp }}>β<sub>0j</sub></span> = γ<sub>00</sub> + <span style={{ color: C.grn }}>γ<sub>01</sub>W<sub>j</sub></span> + u<sub>0j</sub>
        </div>
        <div style={{ fontSize: "15px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "10px 0" }}>
          <span style={{ color: C.pop }}>β<sub>1j</sub></span> = γ<sub>10</sub> + <span style={{ color: C.grn }}>γ<sub>11</sub>W<sub>j</sub></span> + u<sub>1j</sub>
        </div>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          Each firm's intercept and slope are themselves modeled as outcomes of firm-level predictors (<span style={{ color: C.grn, fontWeight: 600 }}>W<sub>j</sub></span>, like firm size or culture). The u terms are the random deviations — the unexplained differences across firms. γ<sub>00</sub> is the grand mean intercept, γ<sub>10</sub> is the average slope. If you include a firm-level predictor W, <span style={{ color: C.grn, fontWeight: 600 }}>γ<sub>01</sub></span> tells you "does W predict the intercept?" and <span style={{ color: C.grn, fontWeight: 600 }}>γ<sub>11</sub></span> tells you "does W predict the slope?" — this is <strong>cross-level interaction</strong>.
        </div>
      </div>

      {/* Combined */}
      <div style={{ background: C.smpBg, borderRadius: "10px", padding: "16px 20px", border: "1px solid rgba(124,58,237,0.15)" }}>
        <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "8px" }}>COMBINED EQUATION (substitute Level 2 into Level 1)</div>
        <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, textAlign: "center", lineHeight: 1.8 }}>
          Y<sub>ij</sub> = γ<sub>00</sub> + γ<sub>10</sub>X<sub>ij</sub> + <span style={{ color: C.grn }}>γ<sub>01</sub>W<sub>j</sub></span> + <span style={{ color: C.grn }}>γ<sub>11</sub>W<sub>j</sub>X<sub>ij</sub></span> + u<sub>0j</sub> + u<sub>1j</sub>X<sub>ij</sub> + ε<sub>ij</sub>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>
          <div style={{ background: C.card, borderRadius: "6px", padding: "8px 12px" }}>
            <strong>Fixed part:</strong> γ<sub>00</sub> + γ<sub>10</sub>X + γ<sub>01</sub>W + γ<sub>11</sub>WX — the average relationships (like regular regression coefficients)
          </div>
          <div style={{ background: C.card, borderRadius: "6px", padding: "8px 12px" }}>
            <strong>Random part:</strong> u<sub>0j</sub> + u<sub>1j</sub>X + ε<sub>ij</sub> — the group-level deviations plus individual error
          </div>
        </div>
      </div>

      <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}`, marginTop: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "4px" }}>In Stata:</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.8 }}>
          mixed y x w c.x#c.w || firm: x, cov(unstructured)
        </div>
        <div style={{ fontSize: "11px", color: C.txD, marginTop: "4px" }}>This fits random intercepts and slopes for X, grouped by firm, with W as a firm-level predictor and the cross-level interaction x#w.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 5: HLM vs FE
// ═══════════════════════════════════════════════════════════════════
function HLMvsFEViz() {
  const rows = [
    { dim: "What it does", hlm: "Models group differences as random draws from a distribution", fe: "Gives each group its own fixed intercept (dummy variable)" },
    { dim: "Assumption about groups", hlm: "Groups are a random sample from a larger population", fe: "Groups are the specific units you care about" },
    { dim: "Group-level predictors", hlm: "Can include them (W) and test cross-level interactions", fe: "Cannot — group dummies absorb all group-level variation" },
    { dim: "Random slopes", hlm: "Yes — can model varying effects of X across groups", fe: "Not standard (possible with interactions, but awkward)" },
    { dim: "Small groups", hlm: "Handles well — \"borrows strength\" via partial pooling", fe: "Unreliable — each group estimate is based on few observations" },
    { dim: "Endogeneity", hlm: "Assumes group effects uncorrelated with X (like RE)", fe: "Controls for all time-invariant group confounders" },
    { dim: "Common in", hlm: "Organizational behavior, education, psychology", fe: "Strategy, finance, economics" },
  ];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Students often ask: "Isn't HLM just the same as Fixed Effects?" They're related but serve different purposes. Here's the comparison:
      </div>

      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.bdr}`, minWidth: "560px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", background: C.bg }}>
            <div style={{ padding: "10px 14px" }}></div>
            <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.smp, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>HLM / MULTILEVEL</div>
            <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: "12px", fontFamily: mono, color: C.sam, borderLeft: `1px solid ${C.bdr}`, textAlign: "center" }}>FIXED EFFECTS</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: C.tx, background: C.bg }}>{r.dim}</div>
              <div style={{ padding: "8px 12px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.hlm}</div>
              <div style={{ padding: "8px 12px", fontSize: "11px", color: C.txB, lineHeight: 1.5, borderLeft: `1px solid ${C.bdr}`, background: i % 2 === 0 ? "#fff" : C.bg }}>{r.fe}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
        <div style={{ background: C.smpBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(124,58,237,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.smp, fontFamily: mono, marginBottom: "6px" }}>USE HLM WHEN:</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            You want to model group-level predictors (e.g., "does firm culture predict the strength of the training effect?"). You have many groups with few observations each. You believe the effect of X varies across groups and want to estimate that variation. Your field expects HLM (OB, education, psychology).
          </div>
        </div>
        <div style={{ background: C.samBg, borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(2,132,199,0.15)" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: C.sam, fontFamily: mono, marginBottom: "6px" }}>USE FE WHEN:</div>
          <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
            Your main concern is endogeneity from unobserved group characteristics. You don't need to model group-level predictors. You have enough observations per group for reliable within-group estimates. Your field expects FE (strategy, finance, economics).
          </div>
        </div>
      </div>

      <Anl>
        HLM treats groups like a random sample from a population of possible groups — like drawing 20 firms from the universe of all firms. It asks: "What's the typical firm like, and how much do firms vary?" FE treats groups as the specific entities you're studying — like "these particular 20 firms." It asks: "After removing everything unique to each firm, what's the within-firm relationship?" HLM is generalization-oriented; FE is identification-oriented.
      </Anl>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 6: HYBRID / UNCONFLATED APPROACH
// ═══════════════════════════════════════════════════════════════════
function HybridViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        You now know FE (Module 10) and HLM (this module). But there's a problem: a <em>naive</em> mixed model throws raw X into the equation and produces a <strong>single conflated coefficient</strong> that mixes within-firm and between-firm effects into an uninterpretable weighted average. Modern practice fixes this.
      </div>

      {/* Terminology warning */}
      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "12px", padding: "18px 22px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.pop, marginBottom: "10px" }}>⚠️ Confusing terminology: "fixed" means different things!</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "10px 0" }}>
            <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <strong style={{ color: C.sam }}>"Fixed effects" in panel econometrics (Module 10):</strong> Means demeaning — removing all between-group variation. Uses <em>only</em> within-group variation. Controls for all unobserved time-invariant confounders, even if correlated with X. Stata: <code style={{ fontFamily: mono, fontSize: "11px", background: C.bg, padding: "1px 4px", borderRadius: "3px" }}>xtreg y x, fe</code>
            </div>
            <div style={{ background: C.card, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
              <strong style={{ color: C.smp }}>"Fixed part" of a mixed model (this module):</strong> Means the population-average coefficients (the γ's) — estimated using <em>both</em> within and between variation, similar to <strong>Random Effects</strong> from Module 10, <em>not</em> Fixed Effects. The group deviations (u terms) are the "random part."
            </div>
          </div>
          <strong>The problem:</strong> <code style={{ fontFamily: mono, fontSize: "11px", background: C.bg, padding: "1px 4px", borderRadius: "3px" }}>mixed y x || firm:</code> produces one coefficient that conflates within-firm and between-firm effects. If the two differ (which they often do), this coefficient is misleading.
        </div>
      </div>

      {/* The solution */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn }}>The Hybrid / Unconflated MLM</div>
          <div style={{ padding: "3px 10px", borderRadius: "100px", background: C.grnBg, border: "1px solid rgba(5,150,105,0.2)", fontSize: "10px", fontWeight: 700, color: C.grn, fontFamily: mono }}>MODERN STANDARD</div>
        </div>
        <div style={{ fontSize: "12px", color: C.txD, marginBottom: "10px" }}>Certo, Withers & Semadeni (2017, <em>SMJ</em>); Bell & Jones (2015); Preacher, Zhang & Zyphur (2016)</div>
        <div style={{ fontSize: "13.5px", color: C.txB, lineHeight: 1.8 }}>
          The fix is simple: <strong>split each Level 1 variable into two components</strong> before estimation, and include both in the model:

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "12px 0" }}>
            <div style={{ background: C.smpBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(124,58,237,0.15)" }}>
              <strong style={{ color: C.smp }}>Within-firm component (x<sub>it</sub> - x̄<sub>i</sub>):</strong> Each observation minus its firm's mean. Only within-firm variation remains. This is the demeaned variable.
            </div>
            <div style={{ background: C.popBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(217,119,6,0.15)" }}>
              <strong style={{ color: C.pop }}>Between-firm component (x̄<sub>i</sub>):</strong> Each firm's mean across all time periods. Only between-firm variation remains.
            </div>
          </div>

          <div style={{ background: C.bg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.bdr}`, margin: "10px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: C.txM, fontFamily: mono, textTransform: "uppercase", marginBottom: "6px" }}>THE HYBRID EQUATION</div>
            <div style={{ fontSize: "16px", fontFamily: mono, fontWeight: 600 }}>
              Y<sub>it</sub> = <span style={{ color: C.pop }}>β<sub>1</sub>x̄<sub>i</sub></span> + <span style={{ color: C.smp }}>β<sub>2</sub>(x<sub>it</sub> - x̄<sub>i</sub>)</span> + u<sub>i</sub> + e<sub>it</sub>
            </div>
            <div style={{ fontSize: "12px", color: C.txD, marginTop: "6px" }}>
              <span style={{ color: C.pop, fontWeight: 600 }}>β<sub>1</sub></span> = between-firm effect &nbsp;&nbsp;|&nbsp;&nbsp; <span style={{ color: C.smp, fontWeight: 600 }}>β<sub>2</sub></span> = within-firm effect (identical to FE)
            </div>
          </div>

          <strong>Why this works:</strong> β<sub>2</sub> (on the demeaned variable) is mathematically identical to the Fixed Effects estimate — it can't be biased by time-invariant confounders. But now you <em>also</em> get β<sub>1</sub> (the between-firm effect), and you can directly test whether they differ.
        </div>
      </div>

      {/* Why standard practice */}
      <div style={{ background: C.grnBg, borderRadius: "10px", border: "1px solid rgba(5,150,105,0.15)", padding: "14px 18px", marginTop: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.grn, marginBottom: "6px" }}>Why this is now standard practice:</div>
        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7 }}>
          <strong>1. Two clean coefficients instead of one conflated one.</strong> You can see whether the within and between effects agree or diverge.
          <br /><strong>2. Variable-by-variable testing.</strong> A "modified Hausman test" compares β₁ and β₂ for each variable individually — not just a global test.
          <br /><strong>3. Time-invariant variables are estimable.</strong> Unlike FE, the hybrid model can include things like industry or country.
          <br /><strong>4. Compatible with HLM features.</strong> You can still add random slopes, cross-level interactions, and group-level predictors.
          <br /><strong>5. Theoretical insight.</strong> Certo et al. (2017) found that for R&D intensity, the between-firm effect of industry R&D was 5× larger than the within-firm effect. This kind of difference — invisible with FE or conflated HLM — has real theoretical implications.
        </div>
      </div>

      {/* Old vs Modern */}
      <div style={{ background: C.bg, borderRadius: "10px", padding: "14px 18px", border: `1px solid ${C.bdr}`, marginTop: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Old practice vs. modern practice</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: C.roseBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(225,29,72,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.rose, fontFamily: mono, marginBottom: "4px" }}>✗ OLD (conflated)</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6, fontFamily: mono }}>mixed y x || firm:</div>
            <div style={{ fontSize: "11px", color: C.txD, marginTop: "4px" }}>One coefficient mixing within and between. Assumes both equal. Biased if they differ.</div>
          </div>
          <div style={{ background: C.grnBg, borderRadius: "8px", padding: "10px 14px", border: "1px solid rgba(5,150,105,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn, fontFamily: mono, marginBottom: "4px" }}>✓ MODERN (unconflated / hybrid)</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6, fontFamily: mono }}>mixed y x_dev x_mean || firm:</div>
            <div style={{ fontSize: "11px", color: C.txD, marginTop: "4px" }}>Two clean coefficients. Within = FE-equivalent. Between = cross-sectional. Directly comparable.</div>
          </div>
        </div>
      </div>

      {/* Stata */}
      <div style={{ background: C.card, borderRadius: "12px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginTop: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "8px" }}>Implementation in Stata</div>
        <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 2 }}>
          * Step 1: Create the two components for every Level 1 variable<br />
          egen x_mean = mean(x), by(firm)<br />
          gen x_dev = x - x_mean<br /><br />
          * Step 2a: Hybrid via RE panel model (Certo et al. approach)<br />
          xtreg y x_dev x_mean, re<br /><br />
          * Step 2b: Hybrid via mixed model (if you also want random slopes)<br />
          mixed y x_dev x_mean || firm: x_dev<br /><br />
          * Step 3: Test whether within ≠ between for each variable<br />
          test x_dev = x_mean
        </div>
        <div style={{ fontSize: "11px", color: C.txD, marginTop: "8px" }}>
          Both Step 2a and 2b give the same within-firm coefficient (x_dev). The <code style={{ fontFamily: mono, fontSize: "11px" }}>mixed</code> version additionally lets you model random slopes. If the test in Step 3 is significant, the within and between effects differ — investigate why.
        </div>
      </div>

      {/* When effects differ */}
      <div style={{ background: C.popBg, border: "1px solid rgba(217,119,6,0.15)", borderRadius: "10px", padding: "14px 18px", marginTop: "14px", fontSize: "13.5px", lineHeight: 1.7, color: C.txB }}>
        <strong style={{ color: C.pop }}>When within ≠ between: what does it mean?</strong> Three possible explanations:
        <div style={{ marginTop: "8px" }}>
          <strong>1. Ecological fallacy.</strong> The effects genuinely differ across levels. Classic example: heavier mammal <em>species</em> live longer (between), but heavier individuals <em>within</em> a species live shorter (within).
        </div>
        <div style={{ marginTop: "6px" }}>
          <strong>2. Between-firm endogeneity.</strong> An omitted time-invariant variable (like firm culture) inflates the between-firm coefficient. The within-firm effect is clean because demeaning removes this.
        </div>
        <div style={{ marginTop: "6px" }}>
          <strong>3. Within-firm endogeneity.</strong> An omitted time-varying variable biases even the within-firm (FE) estimate — researchers often forget this possibility.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "nested", label: "1. Nested Data" },
  { id: "icc", label: "2. ICC" },
  { id: "slopes", label: "3. Random Intercepts & Slopes" },
  { id: "equations", label: "4. The Equations" },
  { id: "vs", label: "5. HLM vs FE" },
  { id: "hybrid", label: "6. Hybrid Approach" },
];

export default function Multilevel() {
  const [tab, setTab] = useState("nested");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:${C.smpLt}}
      `}</style>

      <div style={{ padding: "36px 28px 28px", borderBottom: `1px solid ${C.bdr}`, background: "#FFF" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", background: C.smpLt, color: C.smp, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: mono, marginBottom: "14px" }}>Module 11 · Panel & Multilevel</div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "10px" }}>Multilevel Models (HLM)</h1>
          <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.65, maxWidth: "580px" }}>When individuals are nested within groups — employees in firms, students in schools — you need models that respect this structure. HLM lets each group have its own intercept and slope.</p>
        </div>
      </div>

      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "4px", padding: "0 28px", overflowX: "auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: "13px", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.smp : C.txD, borderBottom: `2px solid ${tab === t.id ? C.smp : "transparent"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 28px 60px" }}>

        {tab === "nested" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Why nesting matters" sub="When your data has a natural grouping structure" />
          <Pr>In Module 10, we looked at panel data — the same firm observed over time. Now we broaden the idea: <strong>any time observations are grouped within higher-level units</strong>, you have nested data. The groups aren't always firms over time — they could be employees within firms, patients within hospitals, or students within schools.</Pr>

          <CBox title={<>🏗️ Examples of Nested Data</>} color={C.smp}>
            <NestedViz />
          </CBox>

          <NBtn onClick={() => setTab("icc")} label="Next: ICC →" />
        </div>}

        {tab === "icc" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="How much do groups matter?" sub="The Intraclass Correlation Coefficient (ICC)" />
          <Pr>Before fitting an HLM, you should check whether the grouping actually matters. If employees in the same firm are no more similar than employees in different firms, you don't need multilevel modeling. The ICC tells you what proportion of the total variation in Y is attributable to group differences.</Pr>

          <CBox title={<>📊 ICC Explorer</>} color={C.smp}>
            <ICCViz />
          </CBox>

          <NBtn onClick={() => setTab("slopes")} label="Next: Random Intercepts & Slopes →" />
        </div>}

        {tab === "slopes" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="The building blocks of HLM" sub="Random intercepts, random slopes, and how they look in data" />
          <Pr>HLM builds on OLS by allowing the intercept and slope to <strong>vary across groups</strong>. This is what makes it "multilevel" — it models variation at the individual level <em>and</em> the group level simultaneously.</Pr>

          <CBox title={<>📈 Pooled vs Random Intercepts vs Random Slopes</>} color={C.smp}>
            <RandomSlopesViz />
          </CBox>

          <NBtn onClick={() => setTab("equations")} label="Next: The Equations →" />
        </div>}

        {tab === "equations" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="The HLM equations" sub="Two levels that combine into one mixed model" />

          <CBox title={<>🧮 Level 1 + Level 2 = Combined</>} color={C.smp}>
            <EquationsViz />
          </CBox>

          <NBtn onClick={() => setTab("vs")} label="Next: HLM vs FE →" />
        </div>}

        {tab === "vs" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="05" title="HLM vs Fixed Effects" sub='Both handle grouped data — but they answer different questions' />
          <Pr>This is the question students always ask. HLM (from Module 11) and FE (from Module 10) both deal with grouped data. When should you use which?</Pr>

          <CBox title={<>⚖️ Side-by-Side Comparison</>} color={C.smp}>
            <HLMvsFEViz />
          </CBox>

          <NBtn onClick={() => setTab("hybrid")} label="Next: Hybrid Approach →" />
        </div>}

        {tab === "hybrid" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="06" title="The Hybrid Approach" sub="Modern best practice: decompose within and between effects in one model" />
          <Pr>In practice, a naive mixed model produces a <strong>conflated coefficient</strong> — one number mixing within-firm and between-firm effects. The hybrid approach (Certo et al., 2017) fixes this by splitting variables into their two components and estimating both effects simultaneously.</Pr>

          <CBox title={<>🔀 Unconflated Multilevel Modeling</>} color={C.grn}>
            <HybridViz />
          </CBox>

          {/* Takeaways */}
          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> <strong>Nested data</strong> (individuals within groups) violates OLS's independence assumption. Ignoring nesting gives SEs that are too small.<br />
              <strong>2.</strong> The <strong>ICC</strong> tells you how much variation is between groups. ICC {">"} 5–10% suggests multilevel modeling is needed.<br />
              <strong>3.</strong> <strong>Random intercepts</strong> let groups differ in baseline Y. <strong>Random slopes</strong> let the effect of X differ across groups.<br />
              <strong>4.</strong> A naive mixed model (<code style={{ fontFamily: mono, fontSize: "12px" }}>mixed y x || firm:</code>) produces a <strong>conflated coefficient</strong> that mixes within and between effects. This is now considered outdated.<br />
              <strong>5.</strong> The <strong>hybrid approach</strong> splits each variable into x_dev (within) and x_mean (between). The within coefficient is identical to FE. Both are estimated in one model, and you can test whether they differ.<br />
              <strong>6.</strong> When within and between effects diverge, consider three explanations: ecological fallacy (genuinely different relationships), between-firm endogeneity, or within-firm endogeneity.
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
}
