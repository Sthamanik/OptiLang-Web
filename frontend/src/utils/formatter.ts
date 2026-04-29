/**
 * PyLite Code Formatter
 * Cleans up indentation, spacing, and blank lines
 * to produce properly formatted PyLite code.
 */

/**
 * Add spaces around operators, but skip strings and comments
 */
function spacingAroundOps(line: string): string {
  // Don't touch comment lines
  const trimmed = line.trimStart()
  if (trimmed.startsWith('#')) return line

  // Protect string contents — replace with placeholders
  const strings: string[] = []
  let result = line.replace(/(["\''])(?:(?!\1)[^\\]|\\.)*\1/g, (match) => {
    strings.push(match)
    return `__STR${strings.length - 1}__`
  })

  // Remove comment at end (protect it too)
  let comment = ''
  const commentIdx = result.indexOf('#')
  if (commentIdx !== -1) {
    comment = '  ' + result.slice(commentIdx)
    result = result.slice(0, commentIdx)
  }

  // Fix spacing around operators (order matters — longer ops first)
  const ops = ['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '=', '<', '>']
  for (const op of ops) {
    // Skip if already properly spaced
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`\\s*${escaped}\\s*`, 'g'),
      (match, offset) => {
        // Don't add space for unary minus at start of expression
        if (op === '-' && offset === 0) return match
        return ` ${op} `
      }
    )
  }

  // Fix function call — remove space before (
  result = result.replace(/(\w+)\s+\(/g, '$1(')

  // Restore strings
  result = result.replace(/__STR(\d+)__/g, (_, i) => strings[parseInt(i)])

  // Restore comment
  result = result.trimEnd() + comment

  return result
}

/**
 * Main formatter function
 */
export function formatCode(source: string): string {
  const lines = source.split('\n')
  const output: string[] = []
  let prevWasBlank = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()

    // Skip empty lines (we'll control blank lines ourselves)
    if (trimmed === '') {
      // Allow max 1 consecutive blank line
      if (!prevWasBlank) {
        output.push('')
        prevWasBlank = true
      }
      continue
    }

    prevWasBlank = false

    // Detect indentation level (count leading spaces, normalize to 4)
    const leadingSpaces = raw.length - raw.trimStart().length
    const indentLevel = Math.round(leadingSpaces / 4)
    const indent = '    '.repeat(indentLevel)

    // Add blank line before def/class if not already preceded by one
    const isDefLine = trimmed.startsWith('def ')
    if (isDefLine && output.length > 0 && output[output.length - 1] !== '') {
      output.push('')
    }

    // Format the line content
    let formatted = trimmed

    // Fix spacing inside for loops: "for i in range" stays clean
    // Fix spacing around = in assignments but not ==
    formatted = spacingAroundOps(formatted)

    // Clean up multiple spaces inside (but not in strings)
    const strings2: string[] = []
    let cleaned = formatted.replace(/(["\''])(?:(?!\1)[^\\]|\\.)*\1/g, (m) => {
      strings2.push(m)
      return `__S${strings2.length - 1}__`
    })
    cleaned = cleaned.replace(/  +/g, ' ')
    cleaned = cleaned.replace(/__S(\d+)__/g, (_, i) => strings2[parseInt(i)])
    formatted = cleaned

    output.push(indent + formatted)
  }

  // Remove trailing blank lines
  while (output.length > 0 && output[output.length - 1].trim() === '') {
    output.pop()
  }

  return output.join('\n') + '\n'
}
