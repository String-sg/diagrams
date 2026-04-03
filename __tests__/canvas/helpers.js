const fs = require('fs')
const path = require('path')

/**
 * Extracts the first inline <script> block (no src=) from an HTML tool file.
 */
function extractMainScript(filename) {
  const html = fs.readFileSync(
    path.join(__dirname, '../../public/tools', filename),
    'utf8'
  )
  const match = html.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/m)
  if (!match) throw new Error(`No inline script found in ${filename}`)
  return match[1]
}

/**
 * Evals a non-IIFE circuit tool script and returns named exports.
 * The DOM must already be set up before calling this.
 * @param {string} filename
 * @param {string[]} exportNames  e.g. ['snap', 'gcd', 'state', 'GRID']
 */
function loadCircuitScript(filename, exportNames) {
  const script = extractMainScript(filename)
  const returnExpr = `({ ${exportNames.join(', ')} })`
  // eslint-disable-next-line no-eval
  return eval(`(function () {\n${script}\nreturn ${returnExpr};\n})()`)
}

/**
 * Evals a water-tank-style IIFE script, running all side effects
 * (event wiring, loadSample, initial render) against the current DOM.
 */
function loadIifeScript(filename) {
  const script = extractMainScript(filename)
  // eslint-disable-next-line no-eval
  eval(script)
}

module.exports = { extractMainScript, loadCircuitScript, loadIifeScript }
