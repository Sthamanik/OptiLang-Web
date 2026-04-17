import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const features = [
  { icon: '🔤', color: 'fi-purple', title: 'DFA Lexer',              desc: 'A formally correct Deterministic Finite Automaton tokenizes PyLite source code. Every token — including INDENT/DEDENT — is handled with line and column metadata for precise error messages.' },
  { icon: '🌳', color: 'fi-teal',   title: 'Recursive Descent Parser', desc: 'Hand-crafted parser builds a typed AST with full operator precedence, right-associative power, all control flow, data structures, and exception handling.' },
  { icon: '🔍', color: 'fi-orange', title: 'Semantic Analyzer',       desc: 'A Visitor Pattern + Scope Stack pass catches structural errors before execution: return outside functions, break/continue outside loops, and duplicate parameter names.' },
  { icon: '⚙️', color: 'fi-blue',   title: 'Tree-Walking Executor',   desc: 'Evaluates the full PyLite language including closures, recursion (up to depth 1000), try/except/finally, and a configurable execution timeout.' },
  { icon: '📊', color: 'fi-green',  title: 'Line-Level Profiler',     desc: 'Every statement is wrapped with execution count, timing (min/avg/max), variable memory estimation, function call graphs, and recursion depth tracking.' },
  { icon: '🎯', color: 'fi-red',    title: 'Optimization Scorer',     desc: 'Produces a 0–100 quality score from four weighted components: severity, complexity heuristic, performance, and memory — with a full breakdown and grade.' },
]

const pipeline = [
  { num: '01', icon: '🔤', name: 'Lexer',    sub: 'DFA tokens',    badge: 'LexerError',    type: 'core' },
  { num: '02', icon: '🌳', name: 'Parser',   sub: 'AST nodes',     badge: 'ParserError',   type: 'core' },
  { num: '03', icon: '🔍', name: 'Semantic', sub: 'Scope checks',  badge: 'Analyzer',      type: 'new'  },
  { num: '04', icon: '⚙️', name: 'Executor', sub: 'Runtime eval',  badge: 'RuntimeError',  type: 'core' },
  { num: '05', icon: '📊', name: 'Profiler', sub: 'Metrics',       badge: 'ProfilingData', type: 'core' },
  { num: '06', icon: '🎯', name: 'Scorer',   sub: '0–100 score',   badge: 'Optimizer',     type: 'new'  },
]

const patterns = [
  { num: '01', name: 'Nested loops',             type: 'AST + profiling · hybrid',          sev: 'high' },
  { num: '02', name: 'String concat in loops',   type: 'AST + profiling · hybrid',          sev: 'high' },
  { num: '03', name: 'Redundant calculations',   type: 'execution trace · dynamic',         sev: 'med'  },
  { num: '04', name: 'Loop-invariant code',      type: 'reaching definitions · hybrid',     sev: 'med'  },
  { num: '05', name: 'Dead code (after return)', type: 'CFG reachability · static',         sev: 'med'  },
  { num: '06', name: 'Missing early return',     type: 'guard clause detection · static',   sev: 'low'  },
  { num: '07', name: 'Unused variables',         type: 'symbol table lookup · static',      sev: 'low'  },
  { num: '08', name: 'Constant folding',         type: 'AST pattern match · static',        sev: 'low'  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="lp-root">

      {/* NAV */}
      <nav className="lp-nav">
        <a className="lp-nav-logo" href="#">
          <span className="lp-bolt">⚡</span>
          OptiLang
        </a>
        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pipeline">Pipeline</a></li>
          <li><a href="#patterns">Patterns</a></li>
        </ul>
        <div className="lp-nav-cta">
          <button className="lp-btn-ghost" onClick={() => navigate('/auth')}>
            Sign in
          </button>
          <button className="lp-btn-primary" onClick={() => navigate('/editor')}>
            Try free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-hero-glow2" />

        <h1 className="lp-hero-h1">
          Write code. <em>Understand</em> it deeply.
        </h1>

        <p className="lp-hero-sub">
          OptiLang is a PyLite interpreter with real-time profiling, semantic analysis,
          and intelligent optimization suggestions — built for learners and educators.
        </p>

        <div className="lp-hero-actions">
          <button className="lp-btn-hero-primary" onClick={() => navigate('/editor')}>
            Launch IDE — it's free →
          </button>
          <a
            className="lp-btn-hero-ghost"
            href="https://github.com/Sthamanik/OptiLang"
            target="_blank"
            rel="noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        <div className="lp-hero-pip">
          <span className="lp-pip-prompt">$</span>
          <span className="lp-pip-cmd">pip install optilang</span>
        </div>

        <div className="lp-stats-bar">
          {[
            { num: '6',    label: 'pipeline stages'      },
            { num: '500+', label: 'passing tests'        },
            { num: '8',    label: 'pattern detectors'    },
            { num: '0',    label: 'runtime dependencies' },
          ].map(s => (
            <div key={s.label} className="lp-stat-item">
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section className="lp-demo-section" id="demo">
        <div className="lp-section-label">See it in action</div>
        <h2 className="lp-section-title">Write. Run. <em>Understand.</em></h2>
        <p className="lp-section-sub">
          Paste any PyLite program. Get instant profiling data, optimization score,
          and actionable suggestions.
        </p>

        <div className="lp-demo-grid">
          {/* Code card */}
          <div className="lp-demo-card">
            <div className="lp-demo-header">
              <div className="lp-traffic-light">
                <span className="lp-tl lp-tl-r" />
                <span className="lp-tl lp-tl-y" />
                <span className="lp-tl lp-tl-g" />
              </div>
              <span className="lp-file-tab">prime.pylite</span>
            </div>
            <div className="lp-code-body">
              {[
                ['1',  <><span className="lp-cmt"># Sieve of primes up to 30</span></>],
                ['2',  ''],
                ['3',  <><span className="lp-kw">def</span> <span className="lp-fn">is_prime</span>(n):</>],
                ['4',  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">if</span> n <span className="lp-op">&lt;</span> <span className="lp-nm">2</span>:</>],
                ['5',  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">return</span> <span className="lp-kw">False</span></>],
                ['6',  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">for</span> i <span className="lp-kw">in</span> <span className="lp-fn">range</span>(<span className="lp-nm">2</span>, n):</>],
                ['7',  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">if</span> n <span className="lp-op">%</span> i <span className="lp-op">==</span> <span className="lp-nm">0</span>:</>],
                ['8',  <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">return</span> <span className="lp-kw">False</span></>],
                ['9',  <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">return</span> <span className="lp-kw">True</span></>],
                ['10', ''],
                ['11', <><span className="lp-kw">for</span> n <span className="lp-kw">in</span> <span className="lp-fn">range</span>(<span className="lp-nm">2</span>, <span className="lp-nm">31</span>):</>],
                ['12', <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-kw">if</span> <span className="lp-fn">is_prime</span>(n):</>],
                ['13', <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="lp-fn">print</span>(n)</>],
              ].map(([ln, code]) => (
                <div key={ln as string}>
                  <span className="lp-ln">{ln}</span>
                  {code as React.ReactNode}
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="lp-metrics-col">
            <div className="lp-metrics-card">
              <div className="lp-metrics-header">
                <span>Execution metrics</span>
                <span className="lp-live-badge">● Live</span>
              </div>
              {[
                { icon: '⏱', cls: 'ic-time',  label: 'Total time',      val: '8.66 ms' },
                { icon: '≡',  cls: 'ic-lines', label: 'Lines executed',   val: '332'     },
                { icon: '◈',  cls: 'ic-mem',   label: 'Peak memory',      val: '3.2 KB'  },
                { icon: '∿',  cls: 'ic-score', label: 'Complexity',       val: 'O(n²)'   },
              ].map(m => (
                <div key={m.label} className="lp-metric-row">
                  <span className="lp-metric-name">
                    <span className={`lp-metric-icon ${m.cls}`}>{m.icon}</span>
                    {m.label}
                  </span>
                  <span className="lp-metric-val">{m.val}</span>
                </div>
              ))}
            </div>

            <div className="lp-score-card">
              <p className="lp-score-title">Optimization score</p>
              <div className="lp-score-ring-wrap">
                <div className="lp-score-ring">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle className="lp-bg-circle" cx="50" cy="50" r="40" />
                    <circle className="lp-fg-circle" cx="50" cy="50" r="40" />
                  </svg>
                  <div className="lp-score-center">
                    <div className="lp-score-num">85</div>
                    <div className="lp-score-grade">GOOD</div>
                  </div>
                </div>
              </div>
              {[
                { label: 'Complexity',   val: '−15.0', color: '#f0a05a', pct: '50%' },
                { label: 'Performance',  val: '−0.0',  color: '#5edfc5', pct: '0%'  },
                { label: 'Memory',       val: '−0.0',  color: '#5edfc5', pct: '0%'  },
              ].map(b => (
                <div key={b.label} className="lp-breakdown-row">
                  <div className="lp-breakdown-top">
                    <span>{b.label}</span>
                    <span style={{ color: b.color }}>{b.val}</span>
                  </div>
                  <div className="lp-breakdown-track">
                    <div className="lp-breakdown-fill" style={{ width: b.pct, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features-section" id="features">
        <div className="lp-section-label">What's inside</div>
        <h2 className="lp-section-title">Every layer, explained.</h2>
        <p className="lp-section-sub">
          OptiLang is more than a REPL — it's a complete analysis platform built from first principles.
        </p>
        <div className="lp-features-grid">
          {features.map(f => (
            <div key={f.title} className="lp-feat-card">
              <div className={`lp-feat-icon ${f.color}`}>{f.icon}</div>
              <div className="lp-feat-title">{f.title}</div>
              <p className="lp-feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section className="lp-pipeline-section" id="pipeline">
        <div className="lp-pipeline-inner">
          <div className="lp-section-label">6-stage pipeline</div>
          <h2 className="lp-section-title">Source → Insights</h2>
          <p className="lp-section-sub">
            Each stage adds a layer of understanding, stopping on the first error
            and reporting exactly where it occurred.
          </p>
          <div className="lp-pipeline-visual">
            {pipeline.map((p, i) => (
              <div key={p.num} className="lp-pipe-stage">
                <div className="lp-pipe-num">{p.num}</div>
                <div className="lp-pipe-icon">{p.icon}</div>
                <div className="lp-pipe-name">{p.name}</div>
                <div className="lp-pipe-sub">{p.sub}</div>
                <span className={`lp-pipe-badge ${p.type === 'new' ? 'lp-pb-new' : 'lp-pb-core'}`}>
                  {p.badge}
                </span>
                {i < pipeline.length - 1 && <div className="lp-pipe-arrow">›</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATTERNS */}
      <section className="lp-patterns-section" id="patterns">
        <div className="lp-section-label">Sprint 3 · Optimizer</div>
        <h2 className="lp-section-title">8 optimization patterns</h2>
        <p className="lp-section-sub">
          Coming in v0.4.0 — the full optimizer engine with static, hybrid, and dynamic pattern detection.
        </p>
        <div className="lp-patterns-list">
          {patterns.map(p => (
            <div key={p.num} className="lp-pattern-row">
              <span className="lp-pattern-num">{p.num}</span>
              <div className="lp-pattern-info">
                <div className="lp-pattern-name">{p.name}</div>
                <div className="lp-pattern-type">{p.type}</div>
              </div>
              <span className={`lp-pattern-sev lp-sev-${p.sev}`}>{p.sev}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INSTALL / CTA */}
      <section className="lp-install-section">
        <div className="lp-install-bg" />
        <div className="lp-install-inner">
          <div className="lp-section-label">Get started</div>
          <h2 className="lp-section-title">Install in one command</h2>
          <p className="lp-install-sub">
            No external dependencies. Pure Python standard library. Works with Python ≥ 3.9.
          </p>
          <div className="lp-install-code">
            <span className="lp-install-prompt">$</span>
            <span>pip install optilang</span>
          </div>
          <p className="lp-install-note">or: pip install optilang[dev] for development extras</p>
          <div className="lp-install-actions">
            <button className="lp-btn-hero-primary" onClick={() => navigate('/editor')}>
              Launch IDE →
            </button>
            <a
              className="lp-btn-hero-ghost"
              href="https://github.com/Sthamanik/OptiLang"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-left">
          © 2026{' '}
          <a href="https://github.com/Sthamanik" target="_blank" rel="noreferrer">
            Manik Kumar Shrestha
          </a>
          {', '}
          <a href="https://github.com/omshreemahat" target="_blank" rel="noreferrer">
            Om Shree Mahat
          </a>
          {', '}
          <a href="https://github.com/aashishrimal" target="_blank" rel="noreferrer">
            Aashish Rimal
          </a>
          {' · Tribhuvan University, Nepal · MIT License'}
        </div>
        <div className="lp-footer-right">
          <a href="https://github.com/Sthamanik/OptiLang" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://pypi.org/project/optilang" target="_blank" rel="noreferrer">PyPI</a>
          <a href="https://github.com/Sthamanik/OptiLang/issues" target="_blank" rel="noreferrer">Issues</a>
        </div>
      </footer>

    </div>
  )
}
