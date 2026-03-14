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
function Ins({ children }) { return <div style={{ background: C.smpBg, border: "1px solid rgba(124,58,237,0.12)", borderRadius: "10px", padding: "14px 18px", marginTop: "16px", fontSize: "13.5px", lineHeight: 1.65, color: C.txB, animation: "fadeIn 0.5s ease" }}><span style={{ color: C.smp, fontWeight: 700, marginRight: "6px" }}>{"\u{1F4A1}"}</span>{children}</div>; }

// ═══════════════════════════════════════════════════════════════════
// TAB 1: PREDICTION VS INFERENCE
// ═══════════════════════════════════════════════════════════════════
function PredInferViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The most important distinction when using ML in management research: are you trying to <strong>predict</strong> or <strong>explain</strong>? The tools, evaluation criteria, and publication standards are completely different.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.sam}`, padding: "16px 18px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "8px" }}>Prediction (Ŷ)</div>
          <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "8px 0", color: C.sam }}>
            Ŷ = f(X) — find the best f
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
            <div><strong>Goal:</strong> Accurately forecast Y for new, unseen cases</div>
            <div><strong>What matters:</strong> Out-of-sample accuracy (RMSE, AUC, F1)</div>
            <div><strong>Doesn't matter:</strong> Whether β is causal or interpretable</div>
            <div><strong>Evaluation:</strong> Train/test split, cross-validation</div>
            <div><strong>Example:</strong> Which startups will fail in the next 2 years?</div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: "14px", border: `2px solid ${C.rose}`, padding: "16px 18px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "8px" }}>Inference (β̂)</div>
          <div style={{ fontSize: "14px", fontFamily: mono, fontWeight: 600, textAlign: "center", margin: "8px 0", color: C.rose }}>
            Y = βX + ε — estimate β
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", color: C.txB, lineHeight: 1.6 }}>
            <div><strong>Goal:</strong> Understand the causal effect of X on Y</div>
            <div><strong>What matters:</strong> Unbiasedness of β̂, causal identification</div>
            <div><strong>Doesn't matter:</strong> Whether the model predicts well overall</div>
            <div><strong>Evaluation:</strong> Research design, robustness, theory</div>
            <div><strong>Example:</strong> Does VC funding cause startups to survive longer?</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Where ML fits in management research</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { role: "ML as the research question", desc: "The goal IS prediction. Can we predict fraud? Startup success? Employee turnover? The ML model is the main contribution.", color: C.sam, pubs: "MS, ISR, MISQ — especially in analytics and IS" },
            { role: "ML as a measurement tool", desc: "Use ML to construct variables — sentiment from text, topics from documents, image features from photos. Then use those variables in standard causal models.", color: C.grn, pubs: "Increasingly common across all top journals. NLP-constructed variables are now standard." },
            { role: "ML for causal inference", desc: "Causal forests, double/debiased ML, targeted learning. Use ML to estimate nuisance parameters (propensity scores, outcome models) while preserving valid inference on the treatment effect.", color: C.smp, pubs: "Cutting edge — AER, Econometrica, starting to appear in SMJ/ASQ" },
            { role: "ML as exploration", desc: "Unsupervised learning (clustering, topic models) to discover patterns, generate hypotheses, or identify subgroups. Not confirmatory — but can guide theory building.", color: C.pop, pubs: "AMR, SMJ theory-building papers. Must be framed carefully — not hypothesis testing." },
          ].map((r, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: r.color }}>{r.role}</div>
              </div>
              <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6, marginTop: "2px" }}>{r.desc}</div>
              <div style={{ fontSize: "10.5px", color: C.txD, fontStyle: "italic", marginTop: "4px" }}>{r.pubs}</div>
            </div>
          ))}
        </div>
      </div>

      <Ins>
        <strong>Mullainathan & Spiess (2017, JEP):</strong> "ML is about Ŷ, not β̂." Most management research cares about β̂ (causal effects). ML can help with Ŷ as an <em>input</em> to causal analysis (e.g., predicting propensity scores) but cannot replace research design for causal claims. The exception: when prediction itself is the question, ML is the right tool.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: KEY ML METHODS
// ═══════════════════════════════════════════════════════════════════
function MLMethodsViz() {
  const [method, setMethod] = useState("lasso");

  const methods = {
    lasso: {
      title: "LASSO / Elastic Net (Regularized Regression)",
      category: "Supervised — Prediction & Variable Selection",
      desc: "OLS with a penalty that shrinks unimportant coefficients to exactly zero. Performs automatic variable selection — useful when you have many potential covariates but don't know which matter.",
      when: "High-dimensional settings (many variables, p ≈ n). Variable selection as a first step before causal analysis. Prediction with many potential features.",
      management: "Identifying which of 200 firm characteristics predict bankruptcy. Selecting control variables for matching. Predicting patent value from application features.",
      equation: "min Σ(yᵢ − Xᵢβ)² + λ₁Σ|βⱼ| + λ₂Σβⱼ²",
      software: "Python: sklearn.linear_model.Lasso | R: glmnet | Stata: lasso2, elasticnet",
    },
    trees: {
      title: "Random Forests & Gradient Boosting",
      category: "Supervised — Prediction & Feature Importance",
      desc: "Ensemble methods that combine many decision trees. Random forests average across trees (bagging); gradient boosting builds trees sequentially, each correcting the previous one's errors. Often the best off-the-shelf predictors.",
      when: "Pure prediction tasks. Complex, nonlinear relationships. Feature importance ranking. When interpretability is secondary to accuracy.",
      management: "Predicting startup failure. Classifying firms into strategic groups. Identifying key drivers of employee turnover (via feature importance).",
      equation: "Ŷ = (1/B) Σ Tree_b(X)  [random forest]\nŶ = Σ αₘ · Tree_m(X)  [boosting]",
      software: "Python: sklearn, xgboost, lightgbm | R: randomForest, xgboost | Stata: rforest",
    },
    causalforest: {
      title: "Causal Forests (Athey & Imbens)",
      category: "Causal ML — Heterogeneous Treatment Effects",
      desc: "Extends random forests to estimate treatment effect heterogeneity — how the causal effect of X on Y varies across subgroups. Instead of predicting Y, it predicts τ(X) = E[Y(1) − Y(0) | X]. Enables personalized treatment effect estimation.",
      when: "You have a credible experiment or quasi-experiment AND suspect the treatment effect varies across subgroups. Not a substitute for research design — requires exogenous variation.",
      management: "Which types of firms benefit most from a policy? Do management training effects vary by firm size? For whom does remote work improve productivity?",
      equation: "τ̂(x) = E[Y(1) − Y(0) | X = x]\nEstimated via honest splitting + doubly-robust scoring",
      software: "R: grf (generalized random forests) | Python: econml (Microsoft)",
    },
    dml: {
      title: "Double/Debiased Machine Learning",
      category: "Causal ML — Treatment Effect Estimation",
      desc: "Uses ML to estimate nuisance parameters (propensity score, outcome model) while preserving valid inference on the treatment effect β. Key insight: use cross-fitting to avoid overfitting bias, then 'partial out' the ML predictions to get an unbiased β̂ with valid standard errors.",
      when: "High-dimensional confounders where you want causal effects but have too many controls for OLS. Combines ML flexibility with econometric rigor.",
      management: "Estimating the effect of a CEO characteristic on firm performance, controlling for hundreds of firm/industry features via ML. Treatment effect of M&A with rich covariate sets.",
      equation: "Step 1: Ŷ = ML(X), D̂ = ML(X)  [nuisance]\nStep 2: (Y − Ŷ) = β(D − D̂) + ε  [debiased]",
      software: "R: DoubleML, hdm | Python: econml, doubleml | Stata: ddml",
    },
    unsupervised: {
      title: "Clustering & Topic Models",
      category: "Unsupervised — Pattern Discovery",
      desc: "Find structure in data without a target variable. K-means and hierarchical clustering group similar observations. LDA and STM discover latent topics in text data. These are exploratory — use them to generate hypotheses, not test them.",
      when: "Theory building and exploration. Identifying strategic groups, organizational types, or market segments from data. Discovering themes in qualitative data at scale.",
      management: "Strategic group identification from firm characteristics. Topic modeling of earnings calls, 10-K filings, or news articles. Clustering innovation portfolios.",
      equation: "K-means: min Σ ||xᵢ − μₖ||²\nLDA: documents as mixtures of topics, topics as mixtures of words",
      software: "Python: sklearn, gensim | R: topicmodels, stm, factoextra | Stata: cluster",
    },
  };
  const m = methods[method];

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        Not all ML is deep learning. The methods most useful in management research range from regularized regression (LASSO) to causal ML (causal forests). Here are the ones you'll encounter — and when each is appropriate.
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "14px", flexWrap: "wrap" }}>
        {Object.entries(methods).map(([id, m]) => (
          <button key={id} onClick={() => setMethod(id)} style={{
            padding: "7px 12px", borderRadius: "8px", border: "1.5px solid",
            borderColor: method === id ? C.smp : C.bdr,
            background: method === id ? C.smpBg : "transparent",
            color: method === id ? C.smp : C.txD,
            fontSize: "10.5px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{m.title.split("(")[0].trim()}</button>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.05em", marginBottom: "4px" }}>{m.category.toUpperCase()}</div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>{m.title}</div>

        <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>{m.desc}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.grn }}>When to use</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{m.when}</div>
          </div>

          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.sam }}>Management applications</div>
            <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{m.management}</div>
          </div>

          <div style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.txD }}>Core idea</div>
            <div style={{ fontSize: "12px", color: C.txB, fontFamily: mono, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{m.equation}</div>
          </div>

          <div style={{ background: C.bg, borderRadius: "8px", padding: "8px 14px", border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.txD }}>Software</div>
            <div style={{ fontSize: "11px", color: C.txB, fontFamily: mono, lineHeight: 1.6 }}>{m.software}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3: NLP & TEXT AS DATA
// ═══════════════════════════════════════════════════════════════════
function NLPViz() {
  const [topic, setTopic] = useState("overview");

  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        The biggest impact of AI/ML in management research has been <strong>text as data</strong> — transforming unstructured text (earnings calls, SEC filings, news, social media, patents) into quantitative variables. This has opened entirely new research questions.
      </div>

      <div style={{ display: "flex", gap: "5px", marginBottom: "16px" }}>
        {[
          { id: "overview", label: "The Pipeline" },
          { id: "methods", label: "NLP Methods" },
          { id: "llm", label: "LLMs in Research" },
        ].map(t => (
          <button key={t.id} onClick={() => setTopic(t.id)} style={{
            flex: 1, padding: "10px 14px", borderRadius: "9px", border: "1.5px solid",
            borderColor: topic === t.id ? C.smp : C.bdr,
            background: topic === t.id ? C.smpBg : "transparent",
            color: topic === t.id ? C.smp : C.txD,
            fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: font,
          }}>{t.label}</button>
        ))}
      </div>

      {topic === "overview" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { step: "1", title: "Collect text", desc: "Earnings call transcripts, 10-K filings, patent abstracts, news articles, Glassdoor reviews, Twitter posts, analyst reports.", color: C.sam },
              { step: "2", title: "Preprocess", desc: "Tokenization, lowercasing, removing stopwords, stemming/lemmatization. For modern models (BERT, GPT): minimal preprocessing — the model handles context.", color: C.pop },
              { step: "3", title: "Extract features", desc: "Convert text into numbers: sentiment scores, topic proportions, named entities, embeddings, similarity measures. This is where AI/ML adds value.", color: C.smp },
              { step: "4", title: "Use as variables", desc: "The extracted features become independent or dependent variables in standard econometric models (OLS, FE, DiD). The ML is a measurement step — causal identification still comes from research design.", color: C.grn },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "12px 16px", display: "flex", gap: "12px", alignItems: "start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: s.color, fontFamily: mono, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{s.title}</div>
                  <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topic === "methods" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { name: "Dictionary-based sentiment", desc: "Count positive/negative words using predefined dictionaries. Simple, transparent, reproducible. The Loughran-McDonald dictionary is standard for financial text.", strength: "Interpretable, reproducible", weakness: "Misses context, sarcasm, domain nuance", example: "Tone of earnings calls → stock market reaction" },
              { name: "Topic models (LDA / STM)", desc: "Discover latent topics in a corpus. Each document is a mixture of topics; each topic is a distribution over words. STM (Structural Topic Model) allows covariates to influence topic prevalence.", strength: "Data-driven discovery, scales to millions of docs", weakness: "Requires choosing # topics, topics may not be interpretable", example: "Topics in 10-K risk disclosures → predicting firm outcomes" },
              { name: "Word embeddings (Word2Vec, GloVe)", desc: "Represent words as dense vectors where similar words are nearby. Can measure semantic similarity, analogies, and cultural associations at scale.", strength: "Captures meaning, enables novel measures", weakness: "Trained on specific corpora, may embed biases", example: "Gender bias in job postings, cultural distance between firms" },
              { name: "Transformer models (BERT, RoBERTa)", desc: "Pre-trained language models that understand context. Fine-tune on your task (classification, NER, sentiment). State-of-the-art accuracy for most NLP tasks.", strength: "Understands context, handles nuance", weakness: "Requires GPU, less interpretable, needs labeled training data for fine-tuning", example: "Classifying strategic actions from news, detecting greenwashing in CSR reports" },
            ].map((m, i) => (
              <div key={i} style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.bdr}`, padding: "14px 18px", boxShadow: C.sh }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.smp, marginBottom: "4px" }}>{m.name}</div>
                <div style={{ fontSize: "12px", color: C.txB, lineHeight: 1.6, marginBottom: "8px" }}>{m.desc}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  <div style={{ background: C.grnBg, borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px" }}><strong style={{ color: C.grn }}>Strength:</strong> {m.strength}</div>
                  <div style={{ background: C.roseBg, borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px" }}><strong style={{ color: C.rose }}>Weakness:</strong> {m.weakness}</div>
                  <div style={{ background: C.samBg, borderRadius: "6px", padding: "6px 8px", fontSize: "10.5px" }}><strong style={{ color: C.sam }}>Example:</strong> {m.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topic === "llm" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: C.card, borderRadius: "14px", border: `1px solid ${C.bdr}`, padding: "18px 22px", boxShadow: C.sh, marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.tx, marginBottom: "10px" }}>Large Language Models (GPT-4, Claude, etc.) in research</div>
            <div style={{ fontSize: "13px", color: C.txB, lineHeight: 1.7, marginBottom: "12px" }}>
              LLMs are rapidly changing how researchers process text data. They can classify, annotate, summarize, and extract information from text with near-human accuracy — often without task-specific training data.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { use: "Annotation / coding at scale", desc: "Use LLMs to code qualitative data (sentiment, strategic actions, organizational identity themes) that would take human RAs months. Validate against human coding on a subsample.", status: "Increasingly accepted. Must demonstrate high agreement with human coders.", color: C.grn },
                { use: "Variable construction", desc: "Prompt an LLM to extract specific variables from text: 'Does this earnings call mention supply chain disruption?' or 'Rate the innovation focus of this 10-K on a 1–5 scale.'", status: "Emerging standard. Report prompts, validate externally, check inter-rater reliability.", color: C.grn },
                { use: "Synthetic data generation", desc: "Use LLMs to generate hypothetical scenarios for experiments (vignettes, simulated organizational texts) or to augment small datasets.", status: "Acceptable for experiments. Controversial for empirical analysis — reviewers may push back.", color: C.pop },
                { use: "LLM as a subject / agent", desc: "Study how LLMs make decisions, exhibit biases, or simulate human behavior. The LLM itself is the object of study.", status: "Growing rapidly. Raises unique validity questions — LLM behavior ≠ human behavior.", color: C.sam },
              ].map((u, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: "8px", padding: "10px 14px", border: `1px solid ${C.bdr}` }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: u.color }}>{u.use}</div>
                  <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.5 }}>{u.desc}</div>
                  <div style={{ fontSize: "10.5px", color: C.txD, fontStyle: "italic", marginTop: "4px" }}>{u.status}</div>
                </div>
              ))}
            </div>
          </div>

          <Ins>
            <strong>The reproducibility challenge:</strong> LLM outputs are non-deterministic and change across model versions. Papers using LLMs for measurement must: (1) report exact model version and prompts, (2) set temperature to 0 for determinism, (3) validate against human coding, (4) discuss what happens if the model is updated. Some journals now require depositing the exact LLM prompts and outputs.
          </Ins>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 4: BEST PRACTICES & PITFALLS
// ═══════════════════════════════════════════════════════════════════
function BestPracticesViz() {
  return (
    <div>
      <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.75, marginBottom: "14px" }}>
        ML in management research is powerful but tricky. The standards are still evolving, and it's easy to misuse these tools. Here are the practices that distinguish publishable work from desk-rejected work.
      </div>

      {/* Validation practices */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.grn, marginBottom: "10px" }}>If you're doing prediction</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { practice: "Train/test split (or cross-validation)", desc: "NEVER report in-sample accuracy. Always hold out data the model hasn't seen. Use k-fold cross-validation for small samples. Time-series data requires temporal splits (train on past, test on future).", must: true },
          { practice: "Appropriate metrics", desc: "Classification: AUC, F1-score, precision, recall (not just accuracy — useless with imbalanced data). Regression: RMSE, MAE, R² out of sample. Report multiple metrics.", must: true },
          { practice: "Baseline comparison", desc: "Compare your ML model to simple baselines (logistic regression, random chance, industry-average prediction). If ML barely beats logit, the complexity isn't justified.", must: true },
          { practice: "Feature importance / interpretability", desc: "Use SHAP values, permutation importance, or partial dependence plots to explain what the model learned. 'Black box' is acceptable for prediction but you must still explain what drives predictions.", must: false },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px", display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ fontSize: "14px", marginTop: "1px" }}>{p.must ? "✅" : "📋"}</div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: p.must ? C.grn : C.txD }}>{p.practice}</div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, color: C.sam, marginBottom: "10px" }}>If you're using ML for measurement</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {[
          { practice: "Validate against human judgment", desc: "If ML classifies text or constructs a variable, compare to human coding on a random subsample. Report inter-rater reliability (Cohen's κ, correlation). If agreement is low, the measure is questionable.", must: true },
          { practice: "Report the measurement model fully", desc: "Don't just say 'we used BERT.' Specify: model version, training data, fine-tuning procedure, hyperparameters, prompts (for LLMs), dictionary (for dictionary methods), number of topics and selection criteria (for topic models).", must: true },
          { practice: "Test robustness of downstream results", desc: "Do your regression results change if you use a different ML model for measurement? A different dictionary? Different number of topics? If results are fragile to measurement choices, they're not credible.", must: true },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px", display: "flex", gap: "10px", alignItems: "start" }}>
            <div style={{ fontSize: "14px", marginTop: "1px" }}>✅</div>
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: C.sam }}>{p.practice}</div>
              <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Common pitfalls */}
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.rose, marginBottom: "10px" }}>Common pitfalls</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {[
          { mistake: "Using ML for causal inference without a research design", desc: "Random forests and neural nets do not solve endogeneity. Prediction accuracy ≠ causal identification. You still need an instrument, a natural experiment, or randomization. ML can improve the precision of causal estimates, but it cannot substitute for a credible identification strategy." },
          { mistake: "Overfitting and reporting in-sample performance", desc: "ML models with many parameters can memorize the training data. Reporting R² = 0.95 on training data is meaningless. Always report out-of-sample performance." },
          { mistake: "P-hacking via model selection", desc: "Trying dozens of ML models and reporting only the best one. This is the ML equivalent of p-hacking. Pre-register your model choice or report all models tried." },
          { mistake: "Ignoring data leakage", desc: "Accidentally including post-treatment information in features, or letting test-set information leak into training. Common in time-series settings (using future data to predict the past)." },
          { mistake: "Black-box results without interpretation", desc: "Even for prediction papers, reviewers want to understand what the model learned. Feature importance, SHAP values, or partial dependence plots are expected — not just a performance number." },
        ].map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: "8px", border: `1px solid ${C.bdr}`, padding: "10px 14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.rose }}>{m.mistake}</div>
            <div style={{ fontSize: "11.5px", color: C.txB, lineHeight: 1.6 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <Ins>
        <strong>The bottom line for PhD students:</strong> Learn ML — it's an essential tool. But understand that in management research, ML is usually a <em>means</em> (measurement, prediction, exploration), not the <em>end</em> (causal identification, theory testing). The papers that combine ML methods with rigorous research design and strong theory are the ones that land in top journals.
      </Ins>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "predvsinf", label: "1. Predict vs Infer" },
  { id: "methods", label: "2. ML Methods" },
  { id: "nlp", label: "3. NLP & Text" },
  { id: "practices", label: "4. Best Practices" },
];

export default function AIMethodsModule() {
  const [tab, setTab] = useState("predvsinf");

  return (
    <div style={{ fontFamily: font, maxWidth: "720px", margin: "0 auto", padding: "32px 20px", color: C.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Source+Serif+4:wght@400;600;700&display=swap'); @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: "6px", background: C.smpBg, fontSize: "11px", fontWeight: 700, color: C.smp, fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>ADVANCED</div>
        <h1 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, lineHeight: 1.2, color: C.tx }}>AI & Machine Learning Methods</h1>
        <p style={{ fontSize: "15px", color: C.txD, lineHeight: 1.6, marginTop: "8px" }}>Prediction, measurement, and causal ML in management research</p>
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
        {tab === "predvsinf" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="01" title="Prediction vs inference" sub="The most important distinction when using ML in research" />
          <CBox title={<>🎯 Two Cultures</>} color={C.smp}>
            <PredInferViz />
          </CBox>
          <NBtn onClick={() => setTab("methods")} label="Next: ML Methods →" />
        </div>}

        {tab === "methods" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="02" title="Key ML methods" sub="From LASSO to causal forests — what each does and when to use it" />
          <CBox title={<>⚙️ The ML Toolkit</>} color={C.smp}>
            <MLMethodsViz />
          </CBox>
          <NBtn onClick={() => setTab("nlp")} label="Next: NLP & Text →" />
        </div>}

        {tab === "nlp" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="03" title="NLP & text as data" sub="The biggest ML revolution in management research" />
          <CBox title={<>📝 Text as Data</>} color={C.smp}>
            <NLPViz />
          </CBox>
          <NBtn onClick={() => setTab("practices")} label="Next: Best Practices →" />
        </div>}

        {tab === "practices" && <div style={{ animation: "fadeIn 0.4s ease" }}>
          <SH number="04" title="Best practices & pitfalls" sub="Standards for publishable ML research in management" />

          <CBox title={<>✅ Doing It Right</>} color={C.grn}>
            <BestPracticesViz />
          </CBox>

          <div style={{ marginTop: "32px", padding: "24px", borderRadius: "14px", background: C.card, border: `1px solid ${C.bdr}`, boxShadow: C.sh }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Key takeaways</div>
            <div style={{ fontSize: "14px", color: C.txB, lineHeight: 1.8 }}>
              <strong>1.</strong> ML is about <strong>Ŷ (prediction)</strong>; most management research is about <strong>β̂ (inference)</strong>. ML can serve inference as a measurement tool or through causal ML, but it doesn't replace research design.<br />
              <strong>2.</strong> Key methods: <strong>LASSO</strong> (variable selection), <strong>random forests</strong> (prediction), <strong>causal forests</strong> (heterogeneous treatment effects), <strong>double ML</strong> (causal effects with many controls), <strong>topic models</strong> (text discovery).<br />
              <strong>3.</strong> <strong>Text as data</strong> is the biggest ML impact in management: dictionary sentiment, topic models, embeddings, and now LLMs for annotation and variable construction.<br />
              <strong>4.</strong> For prediction: always report <strong>out-of-sample</strong> performance, compare to baselines, and explain what the model learned.<br />
              <strong>5.</strong> For measurement: <strong>validate against humans</strong>, report the full ML pipeline, and test robustness of downstream results to measurement choices.<br />
              <strong>6.</strong> ML does not solve endogeneity. <strong>Prediction accuracy ≠ causal identification.</strong> The best papers combine ML tools with rigorous research design and strong theory.
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
