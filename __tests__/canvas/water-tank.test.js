/**
 * @jest-environment jsdom
 *
 * Tests for water_tank_generator.html rendering logic.
 * The script is an IIFE so functions are tested via DOM interaction:
 * set input values, dispatch events, inspect svgWrap.innerHTML.
 */
const { loadIifeScript } = require('./helpers')

function setupDom() {
  document.body.innerHTML = `
    <div id="svgWrap"></div>
    <p id="status" class="status"></p>
    <div id="debugCard" style="display:none"><pre id="debugOut"></pre></div>

    <select id="waterMode">
      <option value="percent" selected>Percentage</option>
      <option value="fraction">Fraction</option>
      <option value="height">Water height (cm)</option>
      <option value="volume">Volume (L)</option>
    </select>

    <div id="percentBox">
      <input id="waterPercent" type="number" value="60" />
      <input id="waterPercentSlider" type="range" value="60" />
    </div>
    <div id="fractionBox" style="display:none">
      <input id="fractionNum" type="number" value="3" />
      <input id="fractionDen" type="number" value="4" />
      <button id="fractionApply">Apply</button>
    </div>
    <div id="heightBox" style="display:none">
      <input id="waterHeight" type="number" value="24" />
    </div>
    <div id="volumeBox" style="display:none">
      <input id="waterVolume" type="number" value="96" />
    </div>

    <input id="waterShade" type="number" value="176" />
    <input id="waterShadeSlider" type="range" value="176" />
    <input id="lineThickness" type="number" value="4" />
    <input id="lineThicknessSlider" type="range" value="4" />

    <input id="lengthCm" type="number" value="80" />
    <input id="widthCm"  type="number" value="50" />
    <input id="heightCm" type="number" value="40" />
    <input id="showAutoLength" type="checkbox" checked />
    <input id="showAutoHeight" type="checkbox" checked />
    <input id="showHidden"     type="checkbox" checked />
    <input id="debugMode"      type="checkbox" />
    <input id="showHandles"    type="checkbox" />

    <input id="fontSize"    type="number" value="20" />
    <input id="textboxText" type="text"   value="Text" />

    <button id="addTextboxBtn">Add Textbox</button>
    <button id="updateTextboxBtn">Update Textbox</button>
    <button id="deleteTextboxBtn">Delete Textbox</button>
    <button id="addLineBtn">Add Line</button>
    <button id="addVArrowBtn">Add V Arrow</button>
    <button id="addHArrowBtn">Add H Arrow</button>
    <button id="addDArrowBtn">Add D Arrow</button>
    <button id="addTapBtn">Add Tap</button>
    <button id="tapLargerBtn">Tap Larger</button>
    <button id="tapMirrorBtn">Tap Mirror</button>
    <button id="deleteShapeBtn">Delete Shape</button>
    <button id="generateBtn">Generate</button>
    <button id="sampleBtn">Sample</button>
    <button id="exportPngBtn">Export PNG</button>
    <button id="exportSvgBtn" hidden>Export SVG</button>
    <button id="copyDebugBtn" hidden>Copy Debug</button>
  `
}

beforeAll(() => {
  setupDom()
  loadIifeScript('water_tank_generator.html')
})

function fireInput(id, value) {
  const el = document.getElementById(id)
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function fireChange(id, value) {
  const el = document.getElementById(id)
  el.value = value
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('initial render', () => {
  it('produces an <svg> element in svgWrap', () => {
    const svgWrap = document.getElementById('svgWrap')
    expect(svgWrap.innerHTML).toContain('<svg')
  })

  it('status shows rendered successfully', () => {
    const status = document.getElementById('status')
    expect(status.textContent).toMatch(/rendered successfully/i)
  })

  it('reports the water level percent in status', () => {
    const status = document.getElementById('status')
    expect(status.textContent).toMatch(/water level/i)
  })
})

describe('water level rendering', () => {
  it('includes a water polygon when percent > 0', () => {
    fireInput('waterPercent', '60')
    const svg = document.getElementById('svgWrap').innerHTML
    expect(svg).toContain('<polygon')
  })

  it('omits the water polygon at 0%', () => {
    fireInput('waterPercent', '0')
    const svg = document.getElementById('svgWrap').innerHTML
    // Only the <clipPath> definition polygon remains; no visible water polygons.
    const count = (svg.match(/<polygon/g) || []).length
    expect(count).toBe(1)
  })

  it('restores water polygon when percent returns above 0', () => {
    fireInput('waterPercent', '0')
    fireInput('waterPercent', '50')
    const svg = document.getElementById('svgWrap').innerHTML
    expect(svg).toContain('<polygon')
  })
})

describe('water mode switching', () => {
  it('fraction mode renders SVG', () => {
    fireChange('waterMode', 'fraction')
    expect(document.getElementById('svgWrap').innerHTML).toContain('<svg')
  })

  it('height mode renders SVG', () => {
    fireChange('waterMode', 'height')
    expect(document.getElementById('svgWrap').innerHTML).toContain('<svg')
  })

  it('volume mode renders SVG', () => {
    fireChange('waterMode', 'volume')
    expect(document.getElementById('svgWrap').innerHTML).toContain('<svg')
  })

  it('returns to percent mode and renders SVG', () => {
    fireChange('waterMode', 'percent')
    fireInput('waterPercent', '75')
    expect(document.getElementById('svgWrap').innerHTML).toContain('<svg')
  })
})

describe('invalid input handling', () => {
  it('shows an error status for a negative tank height', () => {
    fireInput('heightCm', '-10')
    const status = document.getElementById('status')
    expect(status.textContent.toLowerCase()).toMatch(/error|failed|invalid|must/)
  })

  it('shows an error status when all dimensions are zero', () => {
    fireInput('lengthCm', '0')
    fireInput('widthCm', '0')
    fireInput('heightCm', '0')
    const status = document.getElementById('status')
    expect(status.textContent.toLowerCase()).toMatch(/error|failed|invalid|must/)
  })

  afterAll(() => {
    // Restore valid dimensions so subsequent tests aren't polluted.
    fireInput('lengthCm', '80')
    fireInput('widthCm', '50')
    fireInput('heightCm', '40')
  })
})
