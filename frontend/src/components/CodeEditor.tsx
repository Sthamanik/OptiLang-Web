import { useRef, useEffect, useCallback } from 'react'
import MonacoEditor, { type OnMount, type BeforeMount } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'
import type { LineStats, Suggestion } from '@/types'

// ── Register PyLite language once ────────────────────────────────────────────
function registerPyLite(monaco: typeof Monaco) {
  if (monaco.languages.getLanguages().some((l) => l.id === 'pylite')) return

  monaco.languages.register({ id: 'pylite' })

  monaco.languages.setMonarchTokensProvider('pylite', {
    keywords: [
      'if','elif','else','while','for','in','def','return',
      'break','continue','pass','and','or','not',
      'True','False','None','try','except','finally','lambda',
    ],
    builtins: ['print','range','len','str','int','float','bool','list','dict'],
    tokenizer: {
      root: [
        [/#.*$/, 'comment'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\b\d+(\.\d+)?\b/, 'number'],
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtins': 'predefined',
            '@default': 'identifier',
          },
        }],
        [/[+\-*/%=<>!]=?|\/\/|\*\*/, 'operator'],
        [/[()[\]{},:]/, 'delimiter'],
      ],
    },
  })

  monaco.editor.defineTheme('optilang-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword',    foreground: 'C792EA', fontStyle: 'bold' },
      { token: 'predefined', foreground: '82AAFF' },
      { token: 'string',     foreground: 'C3E88D' },
      { token: 'number',     foreground: 'F78C6C' },
      { token: 'comment',    foreground: '546E7A', fontStyle: 'italic' },
      { token: 'operator',   foreground: '89DDFF' },
      { token: 'identifier', foreground: 'EEFFFF' },
    ],
    colors: {
      'editor.background':              '#0d1117',
      'editor.foreground':              '#EEFFFF',
      'editorLineNumber.foreground':    '#3d444d',
      'editorLineNumber.activeForeground': '#8b949e',
      'editorCursor.foreground':        '#FFCB6B',
      'editor.selectionBackground':     '#264f78',
      'editor.lineHighlightBackground': '#161b22',
      'editorGutter.background':        '#0d1117',
      'editorWidget.background':        '#161b22',
    },
  })
}

// ── Heat colour for a line ────────────────────────────────────────────────────
function heatClass(avgMs: number): string {
  if (avgMs > 5)  return 'profile-hot'
  if (avgMs > 0.5) return 'profile-warm'
  return 'profile-cold'
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CodeEditorProps {
  value: string
  onChange: (v: string) => void
  lineStats: Record<string, LineStats>
  suggestions: Suggestion[]
  errors: string[]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CodeEditor({
  value,
  onChange,
  lineStats,
  suggestions,
  errors,
}: CodeEditorProps) {
  const editorRef  = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef  = useRef<typeof Monaco | null>(null)
  const decorIds   = useRef<string[]>([])

  const handleBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco
    registerPyLite(monaco)
  }

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    applyDecorations()
    applyMarkers()
  }

  // ── Line heat decorations ─────────────────────────────────────────────────
  const applyDecorations = useCallback(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const entries = Object.entries(lineStats)
    if (entries.length === 0) {
      decorIds.current = editor.deltaDecorations(decorIds.current, [])
      return
    }

    const newDecs: Monaco.editor.IModelDeltaDecoration[] = entries.map(
      ([lineStr, stat]) => {
        const line = Number(lineStr)
        return {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: heatClass(stat.avg_time_ms),
            glyphMarginHoverMessage: {
              value: [
                `**Line ${line}**`,
                `- Executed: **${stat.count}×**`,
                `- Total: \`${stat.total_time_ms.toFixed(3)}ms\``,
                `- Avg: \`${stat.avg_time_ms.toFixed(3)}ms\``,
                `- Memory: \`${stat.memory_bytes}B\``,
              ].join('\n'),
            },
            after: {
              content: `  ×${stat.count}`,
              inlineClassName: 'exec-count-badge',
            },
          },
        }
      },
    )

    decorIds.current = editor.deltaDecorations(decorIds.current, newDecs)
  }, [lineStats])

  // ── Suggestion + error markers ────────────────────────────────────────────
  const applyMarkers = useCallback(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    const model = editor.getModel()
    if (!model) return

    const suggMarkers: Monaco.editor.IMarkerData[] = suggestions.map((s) => ({
      severity:
        s.severity === 'high'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Hint,
      startLineNumber: s.line,
      endLineNumber:   s.line,
      startColumn:     1,
      endColumn:       model.getLineMaxColumn(s.line),
      message: `[${s.pattern}] ${s.description}\n💡 ${s.suggestion}`,
      source: 'OptiLang',
    }))

    // Parse "Line N" from error strings for error markers
    const errMarkers: Monaco.editor.IMarkerData[] = errors
      .map((msg) => {
        const match = msg.match(/[Ll]ine\s+(\d+)/);
        const line = match ? Number(match[1]) : 1
        return {
          severity:        monaco.MarkerSeverity.Error,
          startLineNumber: line,
          endLineNumber:   line,
          startColumn:     1,
          endColumn:       model.getLineMaxColumn(line),
          message:         msg,
          source:          'OptiLang',
        }
      })

    monaco.editor.setModelMarkers(model, 'optilang', [...suggMarkers, ...errMarkers])
  }, [suggestions, errors])

  useEffect(() => { applyDecorations() }, [applyDecorations])
  useEffect(() => { applyMarkers()     }, [applyMarkers])

  return (
    <MonacoEditor
      height="100%"
      language="pylite"
      theme="optilang-dark"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        fontSize:             14,
        fontFamily:           '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
        fontLigatures:        true,
        lineNumbers:          'on',
        glyphMargin:          true,
        minimap:              { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap:             'on',
        automaticLayout:      true,
        tabSize:              4,
        insertSpaces:         true,
        renderLineHighlight:  'all',
        cursorBlinking:       'smooth',
        smoothScrolling:      true,
        padding:              { top: 12 },
        scrollbar: {
          verticalScrollbarSize:   6,
          horizontalScrollbarSize: 6,
        },
      }}
    />
  )
}
