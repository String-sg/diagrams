/**
 * @jest-environment jsdom
 *
 * Tests for the pure logic functions in circuit_diagram_creatorv2.html.
 * GRID = 28.
 */
const { loadCircuitScript } = require('./helpers')

let snap, gcd, componentSize, getComponentNodes, GRID

beforeAll(() => {
  document.body.innerHTML = `
    <svg id="app" xmlns="http://www.w3.org/2000/svg"></svg>
    <button class="tool-btn active" data-tool="select">Select</button>
    <button class="tool-btn" data-tool="wire">Wire</button>
    <button class="tool-btn" data-tool="bulb">Bulb</button>
    <button class="tool-btn" data-tool="battery">Battery</button>
    <button class="tool-btn" data-tool="switch-open">Switch Open</button>
    <button class="tool-btn" data-tool="switch-closed">Switch Closed</button>
    <button class="tool-btn" data-tool="delete">Delete</button>
    <button id="rotateBtn">Rotate</button>
    <button id="rotate180Btn">Rotate 180°</button>
    <button id="toggleGridBtn">Hide Grid</button>
    <input id="batteryCells" type="number" value="2" />
    <button id="undoBtn">Undo</button>
    <button id="redoBtn">Redo</button>
    <button id="clearBtn">Clear</button>
    <button id="exportBtn">Export PNG</button>
    <div id="statusBox"></div>
    <button id="fitBtn">Centre View</button>
    <button id="zoomInBtn">Zoom In</button>
    <button id="zoomOutBtn">Zoom Out</button>
    <button id="zoomResetBtn">Reset Zoom</button>
    <input id="textValue" type="text" />
    <input id="fontSize" type="number" />
    <button id="addTextBtn">Add Text</button>
    <button id="updateTextBtn">Update Selected</button>
  `;
  ({ snap, gcd, componentSize, getComponentNodes, GRID } = loadCircuitScript(
    'circuit_diagram_creatorv2.html',
    ['snap', 'gcd', 'componentSize', 'getComponentNodes', 'GRID']
  ))
})

describe('snap()', () => {
  it('snaps 0 to 0', () => expect(snap(0)).toBe(0))
  it('snaps an exact grid value to itself', () => expect(snap(28)).toBe(28))
  it('snaps a value below midpoint down', () => expect(snap(10)).toBe(0))
  it('snaps a value above midpoint up', () => expect(snap(20)).toBe(28))
  it('snaps a large value correctly', () => expect(snap(56)).toBe(56))
  it('snaps a negative value', () => expect(snap(-10)).toBe(-0))
})

describe('gcd()', () => {
  it('returns the GCD of two multiples of GRID', () => expect(gcd(28, 56)).toBe(28))
  it('returns a non-trivial GCD', () => expect(gcd(28, 42)).toBe(14))
  it('returns a || 1 when both inputs are 0', () => expect(gcd(0, 0)).toBe(1))
})

describe('componentSize()', () => {
  it('returns bulb dimensions', () => {
    expect(componentSize('bulb')).toEqual({ w: expect.closeTo(46.4, 5), h: expect.closeTo(46.4, 5) })
  })

  it('returns battery dimensions for 2 cells', () => {
    expect(componentSize('battery', 2)).toEqual({ w: 56, h: 35.2 })
  })

  it('returns battery dimensions for 4 cells', () => {
    expect(componentSize('battery', 4)).toEqual({ w: expect.closeTo(84.8, 5), h: 35.2 })
  })

  it('returns default dimensions for unknown type', () => {
    expect(componentSize('unknown')).toEqual({ w: 64, h: 24 })
  })
})

describe('getComponentNodes()', () => {
  it('places bulb nodes left/right at rotation 0°', () => {
    const comp = { type: 'bulb', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toEqual({ x: 76.8, y: 100 })
    expect(nodes[1]).toEqual({ x: 123.2, y: 100 })
  })

  it('places bulb nodes top/bottom at rotation 90°', () => {
    const comp = { type: 'bulb', x: 100, y: 100, rotation: 90 }
    const nodes = getComponentNodes(comp)
    expect(nodes[0]).toEqual({ x: 100, y: 76.8 })
    expect(nodes[1]).toEqual({ x: 100, y: 123.2 })
  })

  it('rotation 180° produces same layout as 0° (mod 180)', () => {
    const comp0   = { type: 'bulb', x: 100, y: 100, rotation: 0 }
    const comp180 = { type: 'bulb', x: 100, y: 100, rotation: 180 }
    expect(getComponentNodes(comp180)).toEqual(getComponentNodes(comp0))
  })

  it('places battery nodes at correct offsets for 2 cells', () => {
    const comp = { type: 'battery', x: 100, y: 100, rotation: 0, cells: 2 }
    const nodes = getComponentNodes(comp)
    // battery w = (34 + 2*18) * 0.8 = 56; half = 28
    expect(nodes[0]).toEqual({ x: 72, y: 100 })
    expect(nodes[1]).toEqual({ x: 128, y: 100 })
  })
})
