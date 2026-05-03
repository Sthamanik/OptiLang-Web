import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import './LandingPage.css'

// ── Cursor ────────────────────────────────────────────────────────────────────
function Cursor() {
  const cursorRef  = useRef<HTMLDivElement>(null)
  const ringRef    = useRef<HTMLDivElement>(null)
  const mx = useRef(0), my = useRef(0)
  const rx = useRef(0), ry = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX; my.current = e.clientY
      if (cursorRef.current) { cursorRef.current.style.left = `${e.clientX}px`; cursorRef.current.style.top = `${e.clientY}px` }
    }
    document.addEventListener('mousemove', onMove)
    let raf: number
    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.13
      ry.current += (my.current - ry.current) * 0.13
      if (ringRef.current) { ringRef.current.style.left = `${rx.current}px`; ringRef.current.style.top = `${ry.current}px` }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    const expand = () => { cursorRef.current && (cursorRef.current.style.width = '20px', cursorRef.current.style.height = '20px'); ringRef.current && (ringRef.current.style.width = '56px', ringRef.current.style.height = '56px') }
    const shrink = () => { cursorRef.current && (cursorRef.current.style.width = '10px', cursorRef.current.style.height = '10px'); ringRef.current && (ringRef.current.style.width = '36px', ringRef.current.style.height = '36px') }
    document.querySelectorAll('a,button,.feature-card,.team-card').forEach(el => { el.addEventListener('mouseenter', expand); el.addEventListener('mouseleave', shrink) })

    // Hide cursor when near scroll indicator (bottom 120px of viewport)
    const onMoveHide = (e: MouseEvent) => {
      const nearBottom = e.clientY > window.innerHeight - 120
      const op = nearBottom ? '0' : '1'
      if (cursorRef.current)  cursorRef.current.style.opacity  = op
      if (ringRef.current)    ringRef.current.style.opacity    = op
    }
    document.addEventListener('mousemove', onMoveHide)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousemove', onMoveHide)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (<><div id="cursor" ref={cursorRef} /><div id="cursor-ring" ref={ringRef} /></>)
}

// ── Preloader ─────────────────────────────────────────────────────────────────
function Preloader({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div id="preloader">
      <div className="pre-logo">OptiLang</div>
      <div className="pre-bar-wrap"><div className="pre-bar" /></div>
      <div className="pre-lines">
        {['▶ Initializing lexer engine...','▶ Loading AST parser modules...','▶ Compiling semantic analyzer...','▶ Attaching profiler & optimizer...','✓ Pipeline ready. Score: 98.5'].map((l,i) => (
          <div key={i} className="pre-line" style={{ animationDelay: `${0.8 + i * 0.3}s` }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  )
}

// ── Pipeline data ────────────────────────────────────────────────────────────
const TOKENS = [
  { type:"KW",     value:"def",    cls:"kw-token",   line:1, node:"func",    sx:28, sy:38 },
  { type:"ID",     value:"total",  cls:"fn-token",   line:1, node:"func",    sx:38, sy:38 },
  { type:"PUNC",   value:"(",      cls:"punc-token", line:1, node:"func",    sx:45, sy:38 },
  { type:"ID",     value:"limit",  cls:"id-token",   line:1, node:"param",   sx:50, sy:38 },
  { type:"PUNC",   value:"):",     cls:"punc-token", line:1, node:"func",    sx:58, sy:38 },
  { type:"ID",     value:"result", cls:"id-token",   line:2, node:"assignA", sx:34, sy:45 },
  { type:"ASSIGN", value:"=",      cls:"op-token",   line:2, node:"assignA", sx:46, sy:45 },
  { type:"NUMBER", value:"0",      cls:"num-token",  line:2, node:"assignA", sx:52, sy:45 },
  { type:"ID",     value:"factor", cls:"id-token",   line:3, node:"assignB", sx:34, sy:52 },
  { type:"ASSIGN", value:"=",      cls:"op-token",   line:3, node:"assignB", sx:46, sy:52 },
  { type:"NUMBER", value:"2",      cls:"num-token",  line:3, node:"assignB", sx:52, sy:52 },
  { type:"KW",     value:"for",    cls:"kw-token",   line:4, node:"for",     sx:30, sy:59 },
  { type:"ID",     value:"i",      cls:"id-token",   line:4, node:"for",     sx:36, sy:59 },
  { type:"KW",     value:"in",     cls:"kw-token",   line:4, node:"for",     sx:40, sy:59 },
  { type:"CALL",   value:"range",  cls:"fn-token",   line:4, node:"range",   sx:46, sy:59 },
  { type:"ID",     value:"limit",  cls:"id-token",   line:4, node:"range",   sx:55, sy:59 },
  { type:"ID",     value:"result", cls:"id-token",   line:5, node:"assignC", sx:39, sy:66 },
  { type:"ASSIGN", value:"=",      cls:"op-token",   line:5, node:"assignC", sx:51, sy:66 },
  { type:"ID",     value:"result", cls:"id-token",   line:5, node:"binop",   sx:58, sy:66 },
  { type:"PLUS",   value:"+",      cls:"op-token",   line:5, node:"binop",   sx:69, sy:66 },
  { type:"ID",     value:"i",      cls:"id-token",   line:5, node:"binop",   sx:75, sy:66 },
  { type:"STAR",   value:"*",      cls:"op-token",   line:5, node:"binop",   sx:80, sy:66 },
  { type:"ID",     value:"factor", cls:"id-token",   line:5, node:"binop",   sx:86, sy:66 },
  { type:"KW",     value:"return", cls:"kw-token",   line:6, node:"return",  sx:34, sy:73 },
  { type:"ID",     value:"result", cls:"id-token",   line:6, node:"return",  sx:46, sy:73 },
  { type:"CALL",   value:"print",  cls:"fn-token",   line:8, node:"print",   sx:28, sy:86 },
  { type:"CALL",   value:"total",  cls:"fn-token",   line:8, node:"call",    sx:38, sy:86 },
  { type:"NUMBER", value:"8",      cls:"num-token",  line:8, node:"call",    sx:48, sy:86 },
]

const AST_NODES = [
  { id:"program", label:"<strong>Program</strong><br>8 lines",            x:50, y:13 },
  { id:"func",    label:"<strong>FunctionDef</strong><br>total(limit)",   x:34, y:27 },
  { id:"print",   label:"<strong>ExprStmt</strong><br>print(...)",        x:68, y:27 },
  { id:"param",   label:"<strong>Param</strong><br>limit",                x:18, y:42 },
  { id:"body",    label:"<strong>Block</strong><br>function body",        x:36, y:42 },
  { id:"call",    label:"<strong>Call</strong><br>total(8)",              x:68, y:42 },
  { id:"assignA", label:"<strong>Assign</strong><br>result = 0",          x:22, y:58 },
  { id:"assignB", label:"<strong>Assign</strong><br>factor = 2",          x:39, y:58 },
  { id:"for",     label:"<strong>For</strong><br>i in range",             x:56, y:58 },
  { id:"return",  label:"<strong>Return</strong><br>result",              x:73, y:58 },
  { id:"range",   label:"<strong>Call</strong><br>range(limit)",          x:48, y:74 },
  { id:"assignC", label:"<strong>Assign</strong><br>result = ...",        x:64, y:74 },
  { id:"binop",   label:"<strong>BinOp</strong><br>result + i * factor",  x:76, y:88 },
]

const AST_EDGES: [string,string][] = [
  ["program","func"],["program","print"],
  ["func","param"],["func","body"],
  ["print","call"],
  ["body","assignA"],["body","assignB"],["body","for"],["body","return"],
  ["for","range"],["for","assignC"],
  ["assignC","binop"],
]

const STAGE_TEXT = [
  { kicker:"01 / Source",    title:"Source program",              desc:"OptiLang begins with Python-like text. The lexer has not touched it yet — every keyword, identifier, number, operator, and delimiter is still a character sequence." },
  { kicker:"02 / Lexer",     title:"Tokens form",                 desc:"The DFA lexer scans the source and emits typed tokens with line metadata. The original program zooms back while the token stream becomes the next artifact." },
  { kicker:"03 / Parser",    title:"Tokens assemble into an AST", desc:"The recursive descent parser consumes the token stream and builds a ProgramNode tree with functions, assignments, loops, calls, and binary expressions." },
  { kicker:"04 / Semantic",  title:"Meaning is validated",        desc:"Semantic analysis resolves scopes, validates identifiers and types, and blocks execution if the program is not meaningful." },
  { kicker:"05 / Executor",  title:"Runtime evidence",            desc:"The tree-walking executor runs the validated AST. Profiling records hit counts and hot lines so later optimization is based on runtime evidence." },
  { kicker:"06 / Optimizer", title:"Suggestions are ranked",      desc:"The optimizer combines AST patterns and profiling data to produce targeted findings such as hot_loop and loop_invariant." },
  { kicker:"07 / Scorer",    title:"Quality report",              desc:"The scorer turns correctness, efficiency, quality, and maintainability into a single ScoreReport with a grade and narrative." },
]

const STAGE_RANGES: [number,number][] = [
  [0,.12],[.12,.30],[.30,.48],[.48,.60],[.60,.72],[.72,.86],[.86,1.01]
]

const STAGE_NAMES = ['Source','Lexer','Parser','Semantic','Executor','Optimizer','Scorer']

// ── Pipeline section ──────────────────────────────────────────────────────────
function Pipeline() {
  const pipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pipe = pipeRef.current
    if (!pipe) return

    // ── helpers ──
    const clamp = (v: number, mn=0, mx=1) => Math.min(mx, Math.max(mn, v))
    const lerp  = (a: number, b: number, t: number) => a + (b-a)*t
    const ease  = (t: number) => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2
    const local = (p: number, s: number, e: number) => clamp((p-s)/(e-s))

    // ── refs to DOM elements ──
    const sticky     = pipe.querySelector('.pipeline-sticky') as HTMLElement
    const srcWin     = pipe.querySelector('#source-window')   as HTMLElement
    const tokenLayer = pipe.querySelector('#token-layer')     as HTMLElement
    const streamGrid = pipe.querySelector('#stream-grid')     as HTMLElement
    const tokenStream = pipe.querySelector('#token-stream')   as HTMLElement
    const astLayer   = pipe.querySelector('#ast-layer')       as HTMLElement
    const astSvg     = pipe.querySelector('#ast-svg')         as SVGElement & HTMLElement
    const progFill   = pipe.querySelector('#progress-fill')   as HTMLElement
    const kickerEl   = pipe.querySelector('#stage-kicker')    as HTMLElement
    const indexEl    = pipe.querySelector('#stage-index')     as HTMLElement
    const titleEl    = pipe.querySelector('#stage-title')     as HTMLElement
    const descEl     = pipe.querySelector('#stage-desc')      as HTMLElement
    const listItems  = Array.from(pipe.querySelectorAll('#stage-list span')) as HTMLElement[]
    const scoreNumEl = pipe.querySelector('#score-number')    as HTMLElement
    const labelLexer = pipe.querySelector('#label-lexer')     as HTMLElement
    const labelParser= pipe.querySelector('#label-parser')    as HTMLElement

    // ── create floating tokens ──
    const tokenEls: HTMLElement[] = []
    tokenLayer.innerHTML = ''
    streamGrid.innerHTML = ''
    TOKENS.forEach((tok, idx) => {
      const el = document.createElement('span')
      el.className = `float-token ${tok.cls}`
      el.textContent = tok.value
      tokenLayer.appendChild(el)
      tokenEls.push(el)
      ;[String(idx+1).padStart(2,'0'), tok.type, tok.value, String(tok.line)].forEach(val => {
        const cell = document.createElement('span')
        cell.className = 'stream-cell'
        cell.textContent = val
        streamGrid.appendChild(cell)
      })
    })

    // ── create AST nodes ──
    const astEls = new Map<string, HTMLElement>()
    astLayer.innerHTML = ''
    astSvg.innerHTML = ''
    AST_NODES.forEach(node => {
      const el = document.createElement('div')
      el.className = 'ast-node-el'
      el.id = `astn-${node.id}`
      el.innerHTML = node.label
      el.style.left = `${node.x}%`
      el.style.top  = `${node.y}%`
      astLayer.appendChild(el)
      astEls.set(node.id, el)
    })
    AST_EDGES.forEach(([from, to]) => {
      const a = AST_NODES.find(n => n.id === from)!
      const b = AST_NODES.find(n => n.id === to)!
      const line = document.createElementNS('http://www.w3.org/2000/svg','line')
      line.classList.add('ast-line-el')
      line.setAttribute('x1', String(a.x*10))
      line.setAttribute('y1', String(a.y*7))
      line.setAttribute('x2', String(b.x*10))
      line.setAttribute('y2', String(b.y*7))
      line.setAttribute('pathLength','1')
      astSvg.appendChild(line)
    })

    // ── stage UI ──
    let activeStage = -1
    const setStageUI = (idx: number) => {
      if (activeStage === idx) return
      activeStage = idx
      const s = STAGE_TEXT[idx]
      kickerEl.textContent = s.kicker
      titleEl.textContent  = s.title
      descEl.textContent   = s.desc
      listItems.forEach((el, i) => el.classList.toggle('active', i === idx))
    }

    const updateStageCopy = (p: number) => {
      const idx = STAGE_RANGES.findIndex(([s,e]) => p >= s && p < e)
      setStageUI(Math.max(0, idx < 0 ? STAGE_RANGES.length-1 : idx))
      indexEl.textContent   = `Scroll ${Math.round(p*100)}%`
      progFill.style.width  = `${p*100}%`
    }

    const getMetrics = () => {
      const top     = pipe.getBoundingClientRect().top + window.scrollY
      const total   = Math.max(1, pipe.offsetHeight - window.innerHeight)
      const scrolled = window.scrollY - top
      return {
        progress: clamp(scrolled/total),
        isActive: scrolled >= 0 && scrolled <= total,
        isAfter:  scrolled > total,
      }
    }

    const setPanel = (id: string, visible: boolean) => {
      const el = pipe.querySelector(`#${id}`) as HTMLElement
      if (el) el.classList.toggle('visible', visible)
    }

    const updateSource = (p: number) => {
      const zoom  = ease(local(p, .04, .22))
      const exit  = ease(local(p, .42, .52))
      const scale = lerp(1, .48, zoom)
      const x     = lerp(0, -21, zoom)
      const y     = lerp(0, -19, zoom) + lerp(0, -10, exit)
      const op    = lerp(1, .32, zoom) * lerp(1, .08, exit)
      srcWin.style.transform = `translate(-50%,-50%) translate(${x}%,${y}%) scale(${scale})`
      srcWin.style.opacity   = String(op)
    }

    const updateTokens = (p: number) => {
      const flowIn      = ease(local(p, .12, .26))
      const astFlow     = ease(local(p, .30, .43))
      const fadeAfterAst = ease(local(p, .43, .50))
      tokenStream.classList.toggle('visible', p > .22 && p < .42)

      tokenEls.forEach((el, idx) => {
        const tok = TOKENS[idx]
        const lineOffset = (tok.line - 4) * 4.6
        const streamCol  = idx % 7, streamRow = Math.floor(idx/7)
        const midX = 14 + streamCol*12 + (streamRow%2 ? 4 : 0)
        const midY = 21 + streamRow*10
        const astNode = AST_NODES.find(n => n.id === tok.node) || AST_NODES[0]
        const astX = astNode.x + ((idx%3)-1)*2.2
        const astY = astNode.y + (Math.floor(idx/3)%3-1)*2

        let x = lerp(tok.sx, midX, flowIn)
        let y = lerp(tok.sy + lineOffset, midY, flowIn)
        if (p > .30) { x = lerp(midX, astX, astFlow); y = lerp(midY, astY, astFlow) }

        const delay  = clamp((flowIn - idx*.012)*1.16)
        const op     = p < .12 ? 0 : clamp(delay) * lerp(1, 0, fadeAfterAst)
        const scale  = lerp(.74, 1, clamp(delay)) * lerp(1, .72, astFlow)
        el.style.left      = `${x}%`
        el.style.top       = `${y}%`
        el.style.opacity   = String(op)
        el.style.transform = `translate(-50%,-50%) scale(${scale})`
      })
    }

    const updateAst = (p: number) => {
      const astIn  = ease(local(p, .36, .50))
      const astHold = p > .48 && p < .61
      AST_NODES.forEach((node, idx) => {
        const el = astEls.get(node.id)!
        const visible = astIn > idx/AST_NODES.length*.72 || astHold
        el.classList.toggle('visible', visible && p < .54)
        el.style.borderColor = (p > .48 && p < .60)
          ? 'rgba(124,106,245,0.38)' : 'rgba(232,234,240,0.22)'
      })
      Array.from(astSvg.querySelectorAll('.ast-line-el')).forEach((line, idx) => {
        const visible = astIn > idx/AST_EDGES.length*.78 || astHold
        ;(line as HTMLElement).classList.toggle('visible', visible && p < .54)
      })
    }

    const updatePanels = (p: number) => {
      setPanel('semantic-panel',  p >= .50 && p < .63)
      setPanel('profile-panel',   p >= .62 && p < .74)
      setPanel('optimizer-panel', p >= .74 && p < .88)
      setPanel('score-panel',     p >= .87)
      const scoreIn = ease(local(p, .87, .96))
      if (scoreNumEl) scoreNumEl.textContent = String(Math.round(87*scoreIn))
    }

    let ticking = false
    const render = () => {
      ticking = false
      const m = getMetrics()
      sticky.classList.toggle('pipeline-fixed', m.isActive)
      sticky.classList.toggle('pipeline-after',  m.isAfter)
      updateStageCopy(m.progress)
      updateSource(m.progress)
      updateTokens(m.progress)
      updateAst(m.progress)
      updatePanels(m.progress)
      labelLexer.classList.toggle('visible',  m.progress > .14 && m.progress < .34)
      labelParser.classList.toggle('visible', m.progress > .31 && m.progress < .49)
    }

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(render) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', render)
    render()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', render)
    }
  }, [])

  return (
    <div id="pipeline" ref={pipeRef}>
      <div className="pipeline-sticky">
        <div className="pipeline-shell">

          {/* Left sidebar */}
          <aside className="stage-copy">
            <div className="stage-kicker" id="stage-kicker">01 / Source</div>
            <div className="stage-index"  id="stage-index">Scroll 0%</div>
            <h3 id="stage-title">Source program</h3>
            <p  id="stage-desc">OptiLang begins with Python-like text. The lexer has not touched it yet — every keyword, identifier, number, operator, and delimiter is still a character sequence.</p>
            <div className="stage-list" id="stage-list">
              {STAGE_NAMES.map(name => <span key={name}>{name}</span>)}
            </div>
            <div className="progress-rail">
              <div className="progress-fill" id="progress-fill" />
            </div>
          </aside>

          {/* Right visual canvas */}
          <section className="stage-visual" id="visual-stage">

            <svg className="flow-svg" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 138 350 C 265 120, 495 115, 590 255 S 770 535, 890 330" fill="none" stroke="rgba(124,106,245,0.12)" strokeWidth="2" strokeDasharray="6 10"/>
            </svg>

            {/* Source code window */}
            <div className="source-window" id="source-window">
              <div className="window-bar">
                <span className="dot"/><span className="dot"/><span className="dot"/>
                analysis_demo.pylite
              </div>
              <div className="code-lines" id="code-lines">
                {[
                  <><span className="ln">1</span><span><span className="tok-kw">def</span> <span className="tok-fn">total</span>(<span className="tok-var">limit</span>):</span></>,
                  <><span className="ln">2</span><span>&nbsp;&nbsp;<span className="tok-var">result</span> <span className="tok-op">=</span> <span className="tok-num">0</span></span></>,
                  <><span className="ln">3</span><span>&nbsp;&nbsp;<span className="tok-var">factor</span> <span className="tok-op">=</span> <span className="tok-num">2</span></span></>,
                  <><span className="ln">4</span><span>&nbsp;&nbsp;<span className="tok-kw">for</span> <span className="tok-var">i</span> <span className="tok-kw">in</span> <span className="tok-fn">range</span>(<span className="tok-var">limit</span>):</span></>,
                  <><span className="ln">5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-var">result</span> <span className="tok-op">=</span> <span className="tok-var">result</span> <span className="tok-op">+</span> <span className="tok-var">i</span> <span className="tok-op">*</span> <span className="tok-var">factor</span></span></>,
                  <><span className="ln">6</span><span>&nbsp;&nbsp;<span className="tok-kw">return</span> <span className="tok-var">result</span></span></>,
                  <><span className="ln">7</span><span></span></>,
                  <><span className="ln">8</span><span><span className="tok-fn">print</span>(<span className="tok-fn">total</span>(<span className="tok-num">8</span>))</span></>,
                ].map((row, i) => <div key={i} className="code-row">{row}</div>)}
              </div>
            </div>

            {/* Floating token layer — populated by JS */}
            <div className="scene-layer" id="token-layer" aria-hidden="true" />

            {/* Token stream table */}
            <div className="token-stream" id="token-stream">
              <div className="stream-head">
                <span className="stream-cell">#</span>
                <span className="stream-cell">Type</span>
                <span className="stream-cell">Value</span>
                <span className="stream-cell">Line</span>
              </div>
              <div className="stream-grid" id="stream-grid" />
            </div>

            {/* AST SVG + node layer — populated by JS */}
            <svg className="ast-svg" id="ast-svg" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" />
            <div className="scene-layer" id="ast-layer" aria-hidden="true" />

            {/* Flow labels */}
            <div className="flow-label" id="label-lexer"  style={{ left:'10%', top:'18%' }}>DFA lexer emits typed tokens</div>
            <div className="flow-label" id="label-parser" style={{ right:'8%', top:'16%' }}>Recursive descent parser builds AST</div>

            {/* Semantic panel */}
            <div className="viz-panel" id="semantic-panel">
              <div className="panel-head"><span>SemanticAnalyzer</span><span className="ok">0 errors</span></div>
              <div className="semantic-grid">
                <div className="semantic-item"><b>Global scope</b><span className="check">✓</span> function total(limit)<br/><span className="check">✓</span> builtin print resolved</div>
                <div className="semantic-item"><b>Local scope</b>result: int<br/>factor: int<br/>i: int from range(limit)</div>
                <div className="semantic-item"><b>Type checks</b><span className="check">✓</span> arithmetic returns int<br/><span className="check">✓</span> return type is stable</div>
                <div className="semantic-item"><b>Executor handoff</b>ProgramNode is valid — execution and profiling can run.</div>
              </div>
            </div>

            {/* Profiler panel */}
            <div className="viz-panel" id="profile-panel">
              <div className="panel-head"><span>Executor + Profiler</span><span>output: 56</span></div>
              <div className="profile-lines">
                {[
                  { ln:'1', code:'def total(limit):',              count:'1×', w:'12%', hot:'' },
                  { ln:'2', code:'result = 0',                     count:'1×', w:'10%', hot:'' },
                  { ln:'3', code:'factor = 2',                     count:'1×', w:'10%', hot:'' },
                  { ln:'4', code:'for i in range(limit):',         count:'8×', w:'62%', hot:'warm' },
                  { ln:'5', code:'result = result + i * factor',   count:'8×', w:'100%',hot:'hot'  },
                  { ln:'6', code:'return result',                  count:'1×', w:'14%', hot:'' },
                ].map((r,i) => (
                  <div key={i} className={`profile-row ${r.hot}`}>
                    <span>{r.ln}</span><span>{r.code}</span><span>{r.count}</span>
                    <div className="heat"><span style={{ ['--w' as any]: r.w }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimizer panel */}
            <div className="viz-panel" id="optimizer-panel">
              <div className="panel-head"><span>Optimizer(...).run()</span><span>ranked suggestions</span></div>
              <div className="optimizer-list">
                <div className="optimizer-item"><b>hot_loop</b>Line 5 is the hottest statement. Profile data confirms the loop body dominates runtime.<span className="severity">MED</span></div>
                <div className="optimizer-item"><b>loop_invariant</b>The value of factor does not change inside the loop — related work can stay outside the hot path.<span className="severity">LOW</span></div>
                <div className="optimizer-item"><b>correctness pass</b>No semantic errors, dead code, or unused variables detected for this sample.<span className="severity" style={{ background:'var(--jade)' }}>OK</span></div>
              </div>
            </div>

            {/* Score panel — exact sample.html structure */}
            <div className="viz-panel score-viz-panel" id="score-panel">
              <div className="panel-head"><span>ScoreReport</span><span>grade: Good</span></div>
              <div className="score-body">
                <div className="score-top">
                  <div className="score-number" id="score-number">0</div>
                  <div className="score-meta-block">
                    <div className="grade">Good</div>
                    <div className="meta">O(n) · 8 lines · 0 errors<br/>analysis_demo.pylite</div>
                  </div>
                </div>
                <div className="score-bars">
                  {[
                    ['Correctness',    '100%', '35'],
                    ['Efficiency',     '77%',  '23'],
                    ['Quality',        '90%',  '18'],
                    ['Maintainability','93%',  '14'],
                  ].map(([label, w, val]) => (
                    <div key={label} className="score-row">
                      <span>{label}</span>
                      <div className="bar"><span style={{ ['--w' as any]: w }} /></div>
                      <strong>{val}</strong>
                    </div>
                  ))}
                </div>
                <p className="score-note">
                  The program is correct and readable. Efficiency is reduced because the measured hot loop
                  performs the most work — the optimizer surfaces that evidence instead of giving a generic style warning.
                </p>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  )
}

// ── Playground — exact match to sample.html ─────────────────────────────────
function Playground() {
  const DEFAULT_CODE = `total = 0
for i in range(10):
    total += i

print(total)

def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`

  const codeRef    = useRef<HTMLTextAreaElement>(null)
  const lineNumRef = useRef<HTMLDivElement>(null)

  const [code,     setCode]     = useState(DEFAULT_CODE)
  const [output,   setOutput]   = useState('')
  const [running,  setRunning]  = useState(false)
  const [scoreNum, setScoreNum] = useState<string>('--')
  const [scoreGrade, setScoreGrade] = useState('Ready to analyze')
  const [scoreBar, setScoreBar] = useState('0%')
  const [dims,     setDims]     = useState(['0%','0%','0%','0%'])
  const [suggList, setSuggList] = useState<{type:string;pattern:string;desc:string}[]>([])

  // Update line numbers
  const lineCount = code.split('\n').length

  // Sync textarea scroll → line numbers
  const onScroll = () => {
    if (codeRef.current && lineNumRef.current) {
      lineNumRef.current.scrollTop = codeRef.current.scrollTop
    }
  }

  const runAnalysis = () => {
    setRunning(true)
    setOutput('▶ Executing...')

    setTimeout(() => {
      const hasRange   = code.includes('range')
      const hasPrint   = code.includes('print')
      const hasFact    = code.includes('factorial')

      let out = ''
      if (hasPrint) {
        if (hasRange) out += '> 45\n'
        if (hasFact)  out += '> 120\n'
        if (!hasRange && !hasFact) out += '> (output)\n'
      }
      out += 'Execution complete · 0.004s · O(n) detected'
      setOutput(out)

      const sc = Math.floor(85 + Math.random() * 14)
      const grade = sc >= 90 ? 'Excellent' : sc >= 75 ? 'Good' : 'Fair'

      // Animate score number
      let cur = 0
      const inc = setInterval(() => {
        cur = Math.min(cur + 2, sc)
        setScoreNum(String(cur))
        if (cur >= sc) clearInterval(inc)
      }, 18)

      setScoreGrade(`${grade.toUpperCase()} · ${sc}/100`)
      setTimeout(() => setScoreBar(sc + '%'), 100)
      setTimeout(() => setDims(['100%', '80%', '90%', '87%']), 300)

      setSuggList([
        { type:'warn', pattern:'hot_loop',        desc:'Loop executes >100 times. Consider vectorization.' },
        { type:'info', pattern:'recursion_depth',  desc:'factorial() uses recursion — consider iterative for large n.' },
        { type:'ok',   pattern:'correctness',      desc:'No semantic or runtime errors detected.' },
      ])

      setRunning(false)
    }, 900)
  }

  return (
    <section id="playground">
      <Reveal>
        <span className="section-label">// Interactive</span>
        <h2 className="section-title">Live Playground</h2>
        <p className="section-sub">Write PyLite code and see simulated analysis results.</p>
      </Reveal>

      <Reveal delay={0.1} className="ide-full">

        {/* Editor pane */}
        <div className="ide-editor-pane">
          <div className="pane-header">
            <span>editor · main.pylite</span>
            <button className="pane-run" onClick={runAnalysis} disabled={running}>
              {running ? '⏳' : '▶'} Run Analysis
            </button>
          </div>

          <div id="editor-area">
            {/* Line numbers */}
            <div id="line-numbers" ref={lineNumRef}>
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            {/* Plain textarea — same color as sample.html (var(--jade)) */}
            <textarea
              id="code-input"
              ref={codeRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onScroll={onScroll}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div id="output-area">
            {output ? (
              output.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))
            ) : (
              <span style={{ color:'var(--text-muted)', fontSize:'.65rem' }}>
                // Press ▶ Run Analysis to execute
              </span>
            )}
          </div>
        </div>

        {/* Analysis sidebar */}
        <div className="ide-sidebar-pane">
          <div className="pane-header">analysis</div>

          <div className="score-display">
            <div className="score-big">{scoreNum}</div>
            <div className="score-grade-txt">{scoreGrade}</div>
            <div className="score-bar">
              <div className="score-bar-fill" style={{ width: scoreBar }} />
            </div>
          </div>

          <div className="dim-list">
            {[
              { name:'Correctness',    val:'35/35', id:0 },
              { name:'Efficiency',     val:'24/30', id:1 },
              { name:'Quality',        val:'18/20', id:2 },
              { name:'Maintainability',val:'13/15', id:3 },
            ].map(d => (
              <div key={d.name} className="dim-row">
                <div>
                  <div className="dim-name">{d.name}</div>
                  <div className="dim-minibar">
                    <div className="dim-minibar-fill" style={{ width: dims[d.id] }} />
                  </div>
                </div>
                <div className="dim-val">{d.val}</div>
              </div>
            ))}
          </div>

          <div className="suggestions-panel">
            <div className="sugg-title">Suggestions</div>
            {suggList.length === 0 ? (
              <div className="sugg-item info">
                <span className="sugg-pattern">// run to see suggestions</span>
                Optimization hints will appear after analysis.
              </div>
            ) : (
              suggList.map((s, i) => (
                <div key={i} className={`sugg-item ${s.type === 'warn' ? '' : s.type}`}>
                  <span className="sugg-pattern">{s.pattern}</span>
                  {s.desc}
                </div>
              ))
            )}
          </div>
        </div>

      </Reveal>
    </section>
  )
}


// ── Animated hero stat counter ───────────────────────────────────────────────
function useCounter(target: number, start: boolean, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) { setVal(0); return }
    let startTime: number | null = null
    let raf: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const prog = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - prog, 3)
      setVal(Math.round(ease * target))
      if (prog < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return val
}

function AnimatedStats({ loaded }: { loaded: boolean }) {
  const ref  = useRef<HTMLDivElement>(null)
  // once:false so it re-animates every time scrolled into view
  const inView = useInView(ref, { once: false, margin: '-60px' })
  const [go, setGo] = useState(false)

  useEffect(() => {
    if (!loaded) return
    setGo(inView)
  }, [inView, loaded])

  const v1 = useCounter(10,  go, 1000)
  const v2 = useCounter(7,   go, 800)
  const v3 = useCounter(100, go, 1400)

  return (
    <motion.div ref={ref} className="hero-stat-row"
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:3.55, duration:.7 }}>
      <div className="hero-stat">
        <div className="hero-stat-num stat-red">{v1}</div>
        <div className="hero-stat-label">Optimization Patterns</div>
      </div>
      <div className="hero-stat">
        <div className="hero-stat-num stat-amber">{v2}</div>
        <div className="hero-stat-label">Core Components</div>
      </div>
      <div className="hero-stat">
        <div className="hero-stat-num stat-green">0–{v3}</div>
        <div className="hero-stat-label">Quality Score</div>
      </div>
    </motion.div>
  )
}

// ── Scroll indicator ─────────────────────────────────────────────────────────
function ScrollIndicator() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`scroll-indicator ${hidden ? 'hidden' : ''}`}>
      <span className="scroll-indicator-text">Scroll</span>
      <div className="scroll-indicator-arrow">
        <svg viewBox="0 0 16 16">
          <polyline points="3,5 8,11 13,5" />
        </svg>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Always start from top on load/refresh
    window.scrollTo(0, 0)
    document.body.style.cursor = 'none'
    return () => { document.body.style.cursor = '' }
  }, [])

  const goEditor = () => navigate('/editor')
  const goAuth   = () => navigate('/auth')

  const features = [
    { icon:'⚡', name:'Real-time Profiling',      desc:'Per-line and per-function execution metrics, recursion depth tracking, and peak memory estimation during runtime.',                             mono:'profiler.py · ProfilingData' },
    { icon:'🔍', name:'10 Optimization Patterns',  desc:'Detects unused vars, dead code, constant folding, loop invariants, hot loops, nested O(n²) and more.',                                        mono:'optimizer.py · 10 detectors' },
    { icon:'📊', name:'4-Dimension Scoring',        desc:'Correctness (35pt), Efficiency (30pt), Quality (20pt), Maintainability (15pt) — scored 0–100 with grade labels.',                              mono:'scoring.py · ScoreReport' },
    { icon:'🌳', name:'Full AST Pipeline',          desc:'From DFA lexing to recursive descent parsing to semantic annotation — a complete compiler frontend.',                                            mono:'lexer → parser → semantic' },
    { icon:'📐', name:'Complexity Estimation',      desc:'Automatically classifies algorithmic complexity from O(1) to O(2ⁿ) with confidence levels based on execution patterns.',                       mono:'O(1) · O(n) · O(n²) · O(2ⁿ)' },
    { icon:'🎓', name:'Educational Core',           desc:'Beginner-friendly narrative explanations, ML-ready synthetic program generation for research workflows.',                                        mono:'ml/ · synthetic generation' },
  ]

  const team = [
    { initials:'MK', name:'Manik Kumar Shrestha', handle:'@Sthamanik',    url:'https://github.com/Sthamanik' },
    { initials:'OS', name:'Om Shree Mahat',       handle:'@itsomshree',   url:'https://github.com/itsomshree' },
    { initials:'AR', name:'Aashish Rimal',         handle:'@aashishrimal22', url:'https://github.com/aashishrimal22' },
  ]

  return (
    <div className="lp2-root">
      <Cursor />
      <div className="grid-bg" />

      <ScrollIndicator />

      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      {/* NAV */}
      <nav>
        <div className="nav-logo">Opti<span>Lang</span></div>
        <ul className="nav-links">
          <li><a href="#pipeline-canvas-section">Pipeline</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#playground">Playground</a></li>
          <li><a href="#team">Team</a></li>
        </ul>
        <div className="nav-right">
          <button className="nav-sign-in" onClick={goAuth}>Sign In</button>
          <button className="nav-cta" onClick={goEditor}>Launch IDE</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-content">
          <motion.div className="hero-badge" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:3, duration:.6 }}>
            <div className="dot" />v1.0.0 · MIT License · Python 3.9+
          </motion.div>
          <motion.h1 className="hero-title" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:3.1, duration:.7 }}>
            Code That<br/><span className="line2">Teaches</span><span className="stroke"> Itself.</span>
          </motion.h1>
          <motion.p className="hero-sub" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:3.25, duration:.7 }}>
            A Python-inspired interpreted language with a full compilation pipeline — from tokens to optimization suggestions and quality scoring.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:3.4, duration:.7 }}>
            <button className="btn-primary" onClick={goEditor}>Launch IDE ↗</button>
            <button className="btn-ghost" onClick={() => window.open('https://github.com/Sthamanik/optilang','_blank')}>View on GitHub ↗</button>
          </motion.div>
          <AnimatedStats loaded={loaded} />
        </div>

        {/* Hero IDE mockup */}
        <motion.div className="hero-ide-wrap" initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ delay:3.3, duration:1.1, ease:[0.4,0,0.2,1] }}>
          <div className="ide glass">
            <div className="ide-titlebar">
              <div className="ide-dots"><div className="ide-dot ide-dot-r"/><div className="ide-dot ide-dot-y"/><div className="ide-dot ide-dot-g"/></div>
              <span className="ide-filename">example.pylite</span>
            </div>
            <div className="ide-tabs">
              <div className="ide-tab active">example.pylite</div>
              <div className="ide-tab">fibonacci.pylite</div>
              <div className="ide-tab">sort.pylite</div>
            </div>
            <div className="ide-body">
              <div className="ide-gutter">{[1,2,3,4,5,6,7,8,9].map(n => <span key={n}>{n}</span>)}</div>
              <div className="ide-code">
                <span className="tok-cmt"># Compute cumulative sum</span><br/>
                <span className="tok-var">total</span> <span className="tok-op">=</span> <span className="tok-num">0</span><br/>
                <span className="tok-var">values</span> <span className="tok-op">=</span> [<span className="tok-num">1</span>,<span className="tok-num">2</span>,<span className="tok-num">3</span>,<span className="tok-num">4</span>,<span className="tok-num">5</span>]<br/><br/>
                <span className="tok-kw">for</span> <span className="tok-var">x</span> <span className="tok-kw">in</span> <span className="tok-var">values</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-var">total</span> <span className="tok-op">+=</span> <span className="tok-var">x</span><br/><br/>
                <span className="tok-bi">print</span>(<span className="tok-str">"Sum:"</span>, <span className="tok-var">total</span>)<br/>
                <span className="code-cursor"/>
              </div>
            </div>
            <div className="ide-status"><span><span className="status-dot"/>Execution complete · 0.003s</span><span>O(n) · Lines: 9</span></div>
            <div className="ide-output">
              <div className="out-label">Output</div>
              <div className="out-line">&gt; Sum: 15</div>
              <div className="out-score"><span>Code Quality Score</span><span className="out-score-grade">Excellent · 94.5</span></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PIPELINE STORY */}
      <section id="pipeline-story">
        <div className="story-intro">
          <Reveal>
            <span className="section-label">// Architecture</span>
            <h2 className="section-title">Watch the Pipeline Run</h2>
            <p className="section-sub">Scroll through each stage. Watch code dissolve into tokens, fold into an AST, get profiled and scored — live.</p>
          </Reveal>
        </div>
      </section>

      <section id="pipeline-canvas-section">
        <Pipeline />
      </section>

      {/* FEATURES */}
      <section id="features">
        <Reveal>
          <span className="section-label">// Capabilities</span>
          <h2 className="section-title">Everything You Need<br/>to Understand Code</h2>
        </Reveal>
        <Reveal delay={0.1} className="features-grid">
          {features.map(f => (
            <div key={f.name} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-name">{f.name}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-mono">{f.mono}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* PLAYGROUND */}
      <Playground />

      {/* TEAM */}
      <section id="team">
        <Reveal><span className="section-label">// Team</span><h2 className="section-title">Built By</h2></Reveal>
        <div className="team-grid">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 0.1}>
              <div className="team-card glass">
                <div className="team-avatar">{member.initials}</div>
                <div className="team-name">{member.name}</div>
                <a className="team-handle" href={member.url} target="_blank" rel="noreferrer">{member.handle} ↗</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Opti<span>Lang</span></div>
        <div className="footer-copy">© 2026 OptiLang · MIT License · v1.0.0 · Tribhuvan University, Nepal</div>
        <div className="footer-links">
          <a href="mailto:shresthamanik1820@gmail.com">Contact</a>
          <a href="https://github.com/Sthamanik/optilang" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://pypi.org/project/optilang" target="_blank" rel="noreferrer">PyPI</a>
        </div>
      </footer>
    </div>
  )
}
