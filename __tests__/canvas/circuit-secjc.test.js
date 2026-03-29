/**
 * @jest-environment jsdom
 *
 * Tests for the pure logic functions in circuit_diagram_secjc.html.
 * GRID = 22.4. Includes transistor and transformer node geometry.
 */
const { loadCircuitScript } = require('./helpers')

let snap, gcd, componentSize, getComponentNodes, rotatePoint, GRID

beforeAll(() => {
  document.body.innerHTML = `
    <svg id="app" xmlns="http://www.w3.org/2000/svg"></svg>
    <button class="tool-btn active" data-tool="select">Select / Move</button>
    <button class="tool-btn" data-tool="delete">Delete</button>
    <button class="tool-btn" data-tool="wire">Wire</button>
    <button class="tool-btn" data-tool="arrow">Arrow</button>
    <button class="tool-btn" data-tool="label-line">Label Line</button>
    <button class="tool-btn" data-tool="divider-arrow">Grid Arrow</button>
    <button class="tool-btn" data-tool="textbox">Textbox</button>
    <button class="tool-btn" data-tool="battery">Battery</button>
    <button class="tool-btn" data-tool="resistor">Resistor</button>
    <button class="tool-btn" data-tool="transistor">Transistor</button>
    <button class="tool-btn" data-tool="transformer">Transformer</button>
    <button id="rotateBtn">Rotate 90°</button>
    <button id="rotate180Btn">Rotate 180°</button>
    <button id="toggleGridBtn">Hide Grid</button>
    <button id="flipPolarityBtn">Flip Power Supply</button>
    <input id="batteryCells" type="number" value="2" />
    <input id="textValue" type="text" value="Type here" />
    <input id="fontSize" type="number" value="12" />
    <button id="addTextBtn">Add Text</button>
    <button id="updateTextBtn">Update Selected</button>
    <button id="undoBtn">Undo</button>
    <button id="redoBtn">Redo</button>
    <button id="clearBtn">Clear All</button>
    <button id="exportBtn">Export PNG</button>
    <div id="statusBox"></div>
    <button id="fitBtn">Centre View</button>
    <button id="zoomInBtn">+</button>
    <button id="zoomOutBtn">−</button>
    <button id="zoomResetBtn">100%</button>
  `;
  ({ snap, gcd, componentSize, getComponentNodes, rotatePoint, GRID } = loadCircuitScript(
    'circuit_diagram_secjc.html',
    ['snap', 'gcd', 'componentSize', 'getComponentNodes', 'rotatePoint', 'GRID']
  ))
})

describe('GRID constant', () => {
  it('is 22.4', () => expect(GRID).toBeCloseTo(22.4))
})

describe('snap()', () => {
  it('snaps 0 to 0', () => expect(snap(0)).toBe(0))
  it('snaps an exact grid value', () => expect(snap(22.4)).toBeCloseTo(22.4))
  it('snaps a value below midpoint down', () => expect(snap(8)).toBe(0))
  it('snaps a value above midpoint up', () => expect(snap(16)).toBeCloseTo(22.4))
})

describe('rotatePoint()', () => {
  const close = (a, b) => expect(a).toBeCloseTo(b, 10)

  it('returns identity at 0°', () => {
    const r = rotatePoint(1, 0, 0)
    close(r.x, 1); close(r.y, 0)
  })

  it('rotates (1,0) by 90° to (0,1)', () => {
    const r = rotatePoint(1, 0, 90)
    close(r.x, 0); close(r.y, 1)
  })

  it('rotates (1,0) by 180° to (-1,0)', () => {
    const r = rotatePoint(1, 0, 180)
    close(r.x, -1); close(r.y, 0)
  })

  it('rotates (0,1) by 270° to (1,0)', () => {
    const r = rotatePoint(0, 1, 270)
    close(r.x, 1); close(r.y, 0)
  })
})

describe('componentSize()', () => {
  it('transistor', () => expect(componentSize('transistor')).toEqual({ w: 67.2, h: 44.8 }))
  it('transformer', () => expect(componentSize('transformer')).toEqual({ w: 67.2, h: 89.6 }))
  it('bulb / meter group', () => expect(componentSize('bulb')).toEqual({ w: 46.4, h: 46.4 }))
  it('battery 2 cells', () => {
    expect(componentSize('battery', 2)).toEqual({ w: 27.2 + 2 * 14.4, h: 35.2 })
  })
  it('resistor (standard box)', () => expect(componentSize('resistor')).toEqual({ w: 67.2, h: 35.2 }))
})

describe('getComponentNodes() — transistor', () => {
  it('returns 3 nodes at rotation 0°', () => {
    const comp = { type: 'transistor', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(3)
    expect(nodes[0].x).toBeCloseTo(77.6)
    expect(nodes[0].y).toBeCloseTo(100)
    expect(nodes[1].x).toBeCloseTo(122.4)
    expect(nodes[1].y).toBeCloseTo(77.6)
    expect(nodes[2].x).toBeCloseTo(122.4)
    expect(nodes[2].y).toBeCloseTo(122.4)
  })

  it('rotates all 3 nodes correctly at 90°', () => {
    const comp = { type: 'transistor', x: 100, y: 100, rotation: 90 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(3)
    // base node: rotatePoint(-22.4, 0, 90) → (0, -22.4)
    expect(nodes[0].x).toBeCloseTo(100)
    expect(nodes[0].y).toBeCloseTo(77.6)
  })
})

describe('getComponentNodes() — transformer', () => {
  it('returns 2 nodes at rotation 0°', () => {
    const comp = { type: 'transformer', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(2)
    expect(nodes[0].x).toBeCloseTo(77.6)
    expect(nodes[0].y).toBeCloseTo(55.2)
    expect(nodes[1].x).toBeCloseTo(77.6)
    expect(nodes[1].y).toBeCloseTo(144.8)
  })
})

describe('getComponentNodes() — standard component', () => {
  it('places resistor left/right at rotation 0°', () => {
    const comp = { type: 'resistor', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toEqual({ x: 100 - 67.2 / 2, y: 100 })
    expect(nodes[1]).toEqual({ x: 100 + 67.2 / 2, y: 100 })
  })

  it('places resistor top/bottom at rotation 90°', () => {
    const comp = { type: 'resistor', x: 100, y: 100, rotation: 90 }
    const nodes = getComponentNodes(comp)
    expect(nodes[0]).toEqual({ x: 100, y: 100 - 67.2 / 2 })
    expect(nodes[1]).toEqual({ x: 100, y: 100 + 67.2 / 2 })
  })

  it('returns empty array for arrow-type tools', () => {
    const comp = { type: 'arrow', x: 100, y: 100, rotation: 0 }
    expect(getComponentNodes(comp)).toEqual([])
  })
})
