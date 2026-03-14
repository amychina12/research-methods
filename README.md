# Research Methods for Management Scholars

An interactive, visual-first web app teaching quantitative research methods to entry-level PhD students in management, strategy, and entrepreneurship. Built with React — zero prior statistical knowledge assumed.

## Philosophy

Every module follows the same design principle: **show, don't tell**. Instead of formulas-first, each concept is introduced through interactive visualizations, guided clickthroughs, and real management research examples. Formal notation and Stata code appear only after the intuition is built.

The app is organized as a progressive learning journey — from sampling distributions to causal forests — but each module also works as a standalone reference.

## Modules

### Statistical Reasoning
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 1 | Sampling Distributions | `sampling-distributions.jsx` | CLT, law of large numbers, sampling variability |
| 2 | Hypothesis Testing | `hypothesis-testing.jsx` | Null/alternative, p-values, Type I/II errors, power |
| 3 | Confidence Intervals | `confidence-intervals.jsx` | Interval estimation, margin of error, coverage |
| 4 | Bayesian Thinking | `bayesian-thinking.jsx` | Priors, posteriors, updating, Bayes' theorem |

### Foundations
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 5 | OLS Regression | `ols-regression.jsx` | Line of best fit, coefficients, R², residuals |
| 6 | Logit & Probit | `logit-probit.jsx` | Binary outcomes, odds ratios, marginal effects |
| 7 | Count Models | `count-models.jsx` | Poisson, negative binomial, overdispersion, zero-inflation |

### Mechanisms
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 8 | Moderation | `moderation.jsx` | Interaction effects, simple slopes, Johnson-Neyman |
| 9 | Mediation | `mediation.jsx` | Baron-Kenny, Sobel, bootstrap, causal mediation |

### Panel & Multilevel
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 10 | Panel Data | `panel-data.jsx` | Fixed effects, random effects, Hausman test, clustering |
| 11 | Multilevel / HLM | `multilevel-hlm.jsx` | Random intercepts/slopes, ICC, nesting, centering |

### Causal Inference
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 12 | Endogeneity | `endogeneity.jsx` | OVB, reverse causality, measurement error, solutions overview |
| 13 | Difference-in-Differences | `did.jsx` | Parallel trends, event study, staggered timing, modern estimators |
| 14 | Instrumental Variables | `instrumental-variables.jsx` | 2SLS, relevance, exclusion, weak instruments, LATE |
| 15 | Regression Discontinuity | `rdd.jsx` | Sharp/fuzzy, bandwidth, local estimation, placebo tests |
| 16 | Matching | `matching.jsx` | PSM, CEM, nearest neighbor, entropy balancing, Love plots |
| 17 | Heckman Selection | `heckman.jsx` | Sample selection, inverse Mills ratio, two-step, exclusion restriction |
| 18 | Experiments & Quasi-Experiments | `experiments-quasi.jsx` | Potential outcomes, RCTs, natural experiments, credibility hierarchy |

### Advanced
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 19 | Synthetic Control | `synthetic-control.jsx` | Donor pools, weights, placebo tests, SCM vs DiD |
| 20 | Survival Analysis | `survival-analysis.jsx` | Hazard functions, Kaplan-Meier, Cox PH, competing risks |
| 21 | QCA | `qca.jsx` | Set theory, calibration, truth tables, equifinality, necessity |
| 22 | AI & ML Methods | `ai-ml-methods.jsx` | Prediction vs inference, LASSO, causal forests, NLP, LLMs |

### Epilogue & Tools
| # | Module | File | Key concepts |
|---|--------|------|-------------|
| 23 | The Grand Principles | `grand-principles.jsx` | Signal/noise, counterfactuals, tradeoffs, map vs territory |
| 24 | Method Chooser | `method-chooser.jsx` | Interactive decision tree, method comparison, quick lookup |

## Design System

All modules share a consistent visual language:

- **Fonts:** DM Sans (UI), DM Mono (code/data), Source Serif 4 (headings/prose)
- **Color palette:**
  - Amber `#D97706` — population, priors, warnings
  - Blue `#0284C7` — samples, frequentist, foundations
  - Purple `#7C3AED` — sampling distributions, Bayesian, panel/advanced
  - Green `#059669` — correct answers, mechanisms, strengths
  - Rose `#E11D48` — errors, causal inference, threats
- **Shared components:** Section headers, prose blocks, insight boxes, analogy callouts, next buttons, code blocks, tooltip system

## Tech Stack

- **React** (functional components with hooks)
- **No external UI framework** — all styling is inline
- **SVG visualizations** — hand-crafted, not charting libraries (except where noted)
- **Recharts** — used in select modules for interactive charts
- **Fonts** — loaded via Google Fonts CDN

Each `.jsx` file is a self-contained React component with a default export. There are no shared dependencies between modules beyond React itself.

## Project Structure

```
research-methods/
├── index.html              # Entry point (loads fonts, base styles)
├── package.json            # Dependencies (React, Recharts, Vite)
├── vite.config.js          # Vite config with GitHub Pages base path
├── README.md
├── .gitignore
└── src/
    ├── main.jsx            # React DOM entry
    ├── App.jsx             # Router, sidebar nav, top bar, prev/next
    └── modules/
        ├── index.jsx                 # Landing page
        ├── sampling-distributions.jsx  # Module 1
        ├── hypothesis-testing.jsx      # Module 2
        ├── confidence-intervals.jsx    # Module 3
        ├── bayesian-thinking.jsx       # Module 4
        ├── ols-regression.jsx          # Module 5
        ├── logit-probit.jsx            # Module 6
        ├── count-models.jsx            # Module 7
        ├── moderation.jsx              # Module 8
        ├── mediation.jsx               # Module 9
        ├── panel-data.jsx              # Module 10
        ├── multilevel-hlm.jsx          # Module 11
        ├── endogeneity.jsx             # Module 12
        ├── did.jsx                     # Module 13
        ├── instrumental-variables.jsx  # Module 14
        ├── rdd.jsx                     # Module 15
        ├── matching.jsx                # Module 16
        ├── heckman.jsx                 # Module 17
        ├── experiments-quasi.jsx       # Module 18
        ├── synthetic-control.jsx       # Module 19
        ├── survival-analysis.jsx       # Module 20
        ├── qca.jsx                     # Module 21
        ├── ai-ml-methods.jsx           # Module 22
        ├── grand-principles.jsx        # Module 23
        └── method-chooser.jsx          # Module 24
```

## Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/research-methods.git
cd research-methods

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Deploying to GitHub Pages

1. In `vite.config.js`, set `base` to your repository name:
   ```js
   base: '/research-methods/'  // or whatever your repo is named
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

   This runs `vite build` and publishes the `dist/` folder via `gh-pages`.

3. In your GitHub repo settings, set Pages source to the `gh-pages` branch.

## How It Works

The app uses **hash-based routing** (`#module-id`) so it works on GitHub Pages without server-side configuration. Navigation features:

- **Sidebar** — slide-out menu listing all 24 modules organized by category
- **Top bar** — sticky header with hamburger menu, current module title, and prev/next buttons
- **Bottom nav** — prev/next module links at the foot of each module
- **Landing page** — module grid with category filters and suggested learning paths
- **Deep linking** — share links like `yoursite.com/#did` to jump directly to a module

## Usage

### For PhD Students
Work through the modules sequentially (1–24) for a complete methods curriculum. Each module has 3–5 tabs progressing from intuition to formal notation to Stata implementation. The Method Chooser (Module 24) serves as an ongoing reference.

### For Instructors
Each module maps to roughly one week of a PhD methods seminar. The visual-first approach works well for in-class demonstration. Modules are self-contained — you can assign subsets based on your curriculum.

### For Researchers
Use individual modules as refreshers on specific methods. The Method Chooser helps identify which technique fits your research question. Stata code in each module is copy-paste ready.

## Citation

If you use these materials in teaching or research:

```
@software{research_methods_app,
  title = {Research Methods for Management Scholars: An Interactive Visual Guide},
  author = {Wei Shi},
  year = {2026},
  url = {https://github.com/YOUR_USERNAME/research-methods}
}
```

## License

This work is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). You are free to share and adapt the materials for non-commercial purposes with attribution.

## Acknowledgments

Built iteratively with Claude (Anthropic) as a co-creation tool. All pedagogical decisions, research examples, and methodological content reflect the author's expertise in management research methods.
