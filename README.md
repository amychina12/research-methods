# Research Methods for Management Scholars

> **24 interactive modules** taking you from sampling distributions to causal forests — visually, intuitively, and with ready-to-use Stata code.

**[Launch the app](https://amychina12.github.io/research-methods/)**

---

An interactive, visual-first web app for learning quantitative research methods. Designed for PhD students in management, strategy, and entrepreneurship — zero prior statistical knowledge assumed.

## Why This Exists

Traditional methods textbooks are dense, formula-heavy, and disconnected from the research questions management scholars actually face. This app flips the script: every concept starts with an **interactive visualization**, uses **real management research examples**, and only introduces formal notation after the intuition clicks.

## What's Inside

| Category | Modules | What You'll Learn |
|----------|---------|-------------------|
| **Statistical Reasoning** | Sampling Distributions, Hypothesis Testing, Confidence Intervals, Bayesian Thinking | Build intuition for randomness, inference, and uncertainty |
| **Foundations** | OLS Regression, Logit & Probit, Count Models | The core regression toolkit for empirical research |
| **Mechanisms** | Moderation, Mediation | How and when effects operate |
| **Panel & Multilevel** | Panel Data, Multilevel / HLM | Exploiting repeated and nested observations |
| **Causal Inference** | Endogeneity, DiD, Instrumental Variables, RDD, Matching, Heckman, Experiments | The credibility revolution: designs for identifying causal effects |
| **Advanced** | Synthetic Control, Survival Analysis, QCA, AI & ML Methods | Specialized methods for complex research questions |
| **Epilogue & Tools** | The Grand Principles, Method Chooser | The big picture and an interactive method selection toolkit |

## Learning Paths

- **Complete curriculum** — Modules 1-24, one per week for a semester-long PhD methods course
- **Causal inference bootcamp** — Start at Module 12, then work through 13-18
- **Practitioner quickstart** — OLS, Panel Data, DiD, and the Method Chooser (Modules 5, 10, 13, 24)
- **Advanced seminar** — Synthetic Control, Survival, QCA, and ML (Modules 19-23)

## Running Locally

```bash
git clone https://github.com/amychina12/research-methods.git
cd research-methods
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Tech Stack

React + Vite, hand-crafted SVG visualizations, Recharts for interactive charts, inline styling with no external UI framework. Each module is a self-contained component.

## Citation

```
@software{research_methods_app,
  title = {Research Methods for Management Scholars: An Interactive Visual Guide},
  author = {Wei Yu},
  year = {2026},
  url = {https://amychina12.github.io/research-methods/}
}
```

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — free to share and adapt for non-commercial purposes with attribution.

---

Built by **Wei Yu** · Department of Industrial Systems Engineering and Management · National University of Singapore
