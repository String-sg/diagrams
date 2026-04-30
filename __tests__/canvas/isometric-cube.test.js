/**
 * @jest-environment jsdom
 *
 * Tests for isometric-cube-generator.html (v2) UI logic.
 * Covers: toggle front/side mapping, preview overlay, export setting toggles,
 * and button label refreshes. Canvas rendering is mocked — we test state
 * and DOM mutations only.
 */
const { loadCircuitScript } = require('./helpers')

// Mock canvas so jsdom doesn't throw on getContext/toBlob
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    setLineDash: jest.fn(),
    drawImage: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    rect: jest.fn(),
    strokeRect: jest.fn(),
    roundRect: jest.fn(),
    clip: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    canvas: { width: 800, height: 600 },
  })
  HTMLCanvasElement.prototype.toBlob = jest.fn((cb) => cb(new Blob()))

  document.body.innerHTML = `
    <canvas id="canvas" width="800" height="600"></canvas>
    <canvas id="isoPreviewCanvas" width="400" height="300"></canvas>
    <canvas id="viewsPreviewCanvas" width="400" height="300"></canvas>

    <input id="cubeCount" type="number" value="5" />
    <input id="spread" type="number" value="2" />

    <button id="generateBtn">Randomise</button>
    <button id="resetBtn">Clear</button>
    <button id="previewExportsBtn">Preview Exports</button>
    <button id="closePreviewBtn">Close</button>
    <button id="toggleGuidesBtn">Hide Guides</button>
    <button id="toggleFrontSideBtn">Front/Side Mapping: Standard</button>
    <button id="toggleWallsBtn">Hide Walls</button>
    <button id="toggleDotsBtn">Hide Dotted Grid</button>
    <button id="toggleExportDotsBtn">Export Dots: On</button>
    <button id="toggleExportWallsBtn">Export Walls: On</button>
    <button id="toggleExportDirectionLabelsBtn">Export Front/Side Labels: On</button>
    <button id="downloadIsoFromPreviewBtn">Download Iso PNG</button>
    <button id="downloadViewsFromPreviewBtn">Download Views PNG</button>

    <div id="previewOverlay" class="preview-overlay" aria-hidden="true"></div>

    <span id="shapeTag"></span>
    <span id="hoverHint"></span>
    <div id="cursorLabel"></div>
    <span id="statCubes">0</span>
    <span id="statColumns">0</span>
    <span id="statHeight">0</span>
    <span id="statFootprint">0</span>
  `
})

let state, toggleFrontSideBtn, previewOverlay, previewExportsBtn, closePreviewBtn,
  toggleExportDotsBtn, toggleExportWallsBtn, toggleExportDirectionLabelsBtn

beforeAll(() => {
  ;({
    state,
    toggleFrontSideBtn,
    previewOverlay,
    previewExportsBtn,
    closePreviewBtn,
    toggleExportDotsBtn,
    toggleExportWallsBtn,
    toggleExportDirectionLabelsBtn,
  } = loadCircuitScript('isometric-cube-generator.html', [
    'state',
    'toggleFrontSideBtn',
    'previewOverlay',
    'previewExportsBtn',
    'closePreviewBtn',
    'toggleExportDotsBtn',
    'toggleExportWallsBtn',
    'toggleExportDirectionLabelsBtn',
  ]))
})

describe('initial state', () => {
  test('swapFrontSide defaults to false', () => {
    expect(state.swapFrontSide).toBe(false)
  })

  test('exportDots defaults to true', () => {
    expect(state.exportDots).toBe(true)
  })

  test('exportWalls defaults to true', () => {
    expect(state.exportWalls).toBe(true)
  })

  test('exportDirectionLabels defaults to true', () => {
    expect(state.exportDirectionLabels).toBe(true)
  })

  test('preview overlay is closed initially', () => {
    expect(previewOverlay.classList.contains('open')).toBe(false)
    expect(previewOverlay.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('toggle front/side mapping', () => {
  test('clicking toggleFrontSideBtn flips swapFrontSide to true', () => {
    toggleFrontSideBtn.click()
    expect(state.swapFrontSide).toBe(true)
  })

  test('button label updates to Swapped', () => {
    expect(toggleFrontSideBtn.textContent).toBe('Front/Side Mapping: Swapped')
  })

  test('clicking again flips swapFrontSide back to false', () => {
    toggleFrontSideBtn.click()
    expect(state.swapFrontSide).toBe(false)
    expect(toggleFrontSideBtn.textContent).toBe('Front/Side Mapping: Standard')
  })
})

describe('preview overlay', () => {
  test('clicking previewExportsBtn opens the overlay', () => {
    previewExportsBtn.click()
    expect(previewOverlay.classList.contains('open')).toBe(true)
    expect(previewOverlay.getAttribute('aria-hidden')).toBe('false')
  })

  test('clicking closePreviewBtn closes the overlay', () => {
    closePreviewBtn.click()
    expect(previewOverlay.classList.contains('open')).toBe(false)
    expect(previewOverlay.getAttribute('aria-hidden')).toBe('true')
  })

  test('pressing Escape closes an open overlay', () => {
    previewExportsBtn.click()
    expect(previewOverlay.classList.contains('open')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(previewOverlay.classList.contains('open')).toBe(false)
  })
})

describe('export settings toggles', () => {
  test('toggleExportDotsBtn flips exportDots', () => {
    const before = state.exportDots
    toggleExportDotsBtn.click()
    expect(state.exportDots).toBe(!before)
    toggleExportDotsBtn.click() // restore
    expect(state.exportDots).toBe(before)
  })

  test('toggleExportWallsBtn flips exportWalls', () => {
    const before = state.exportWalls
    toggleExportWallsBtn.click()
    expect(state.exportWalls).toBe(!before)
    toggleExportWallsBtn.click() // restore
    expect(state.exportWalls).toBe(before)
  })

  test('toggleExportDirectionLabelsBtn flips exportDirectionLabels', () => {
    const before = state.exportDirectionLabels
    toggleExportDirectionLabelsBtn.click()
    expect(state.exportDirectionLabels).toBe(!before)
    toggleExportDirectionLabelsBtn.click() // restore
    expect(state.exportDirectionLabels).toBe(before)
  })

  test('export dots button label reflects state', () => {
    toggleExportDotsBtn.click()
    const label = toggleExportDotsBtn.textContent
    expect(label).toMatch(/Export Dots: (On|Off)/)
    expect(label).toBe(`Export Dots: ${state.exportDots ? 'On' : 'Off'}`)
    toggleExportDotsBtn.click() // restore
  })
})
