/**
 * @jest-environment jsdom
 *
 * Tests for the pure logic functions in object_circuitv2.html.
 * Uses cardinal-angle optimised rotatePoint and object-style local nodes.
 */
const { loadCircuitScript } = require('./helpers')

let rotatePoint, getLocalNodes, getComponentNodes

beforeAll(() => {
  document.body.innerHTML = `
    <svg id="app" xmlns="http://www.w3.org/2000/svg"></svg>
    <button class="tool-btn active" data-tool="select">Select / Move</button>
    <button class="tool-btn" data-tool="wire">Wire</button>
    <button class="tool-btn" data-tool="bulb">Bulb</button>
    <button class="tool-btn" data-tool="battery">Battery</button>
    <button class="tool-btn" data-tool="switch-open">Switch Open</button>
    <button class="tool-btn" data-tool="switch-closed">Switch Closed</button>
    <button class="tool-btn" data-tool="delete">Delete</button>
    <button id="rotateBtn">Rotate 90°</button>
    <button id="flipBtn">Flip 180°</button>
    <button id="toggleGridBtn">Hide Grid</button>
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
  ({ rotatePoint, getLocalNodes, getComponentNodes } = loadCircuitScript(
    'object_circuitv2.html',
    ['rotatePoint', 'getLocalNodes', 'getComponentNodes']
  ))
})

describe('rotatePoint() — cardinal angles (exact arithmetic)', () => {
  it('0°: identity', () => {
    expect(rotatePoint(5, 3, 0)).toEqual({ x: 5, y: 3 })
  })

  it('90°: (x,y) → (-y, x)', () => {
    expect(rotatePoint(5, 3, 90)).toEqual({ x: -3, y: 5 })
  })

  it('180°: (x,y) → (-x, -y)', () => {
    expect(rotatePoint(5, 3, 180)).toEqual({ x: -5, y: -3 })
  })

  it('270°: (x,y) → (y, -x)', () => {
    expect(rotatePoint(5, 3, 270)).toEqual({ x: 3, y: -5 })
  })

  it('360° normalises to 0° (identity)', () => {
    expect(rotatePoint(5, 3, 360)).toEqual({ x: 5, y: 3 })
  })
})

describe('getLocalNodes()', () => {
  it('bulb has 3 connection points', () => {
    const nodes = getLocalNodes({ type: 'bulb' })
    expect(nodes).toHaveLength(3)
    expect(nodes[0]).toEqual({ x: -18, y: 18 })
    expect(nodes[1]).toEqual({ x: 18, y: 18 })
    expect(nodes[2]).toEqual({ x: 0, y: 46 })
  })

  it('battery has 2 connection points (top and bottom terminals)', () => {
    const nodes = getLocalNodes({ type: 'battery' })
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toEqual({ x: 0, y: -46 })
    expect(nodes[1]).toEqual({ x: 0, y: 46 })
  })

  it('switch has 2 connection points', () => {
    const nodes = getLocalNodes({ type: 'switch' })
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toEqual({ x: -40, y: 0 })
    expect(nodes[1]).toEqual({ x: 40, y: 0 })
  })

  it('unknown component returns empty array', () => {
    expect(getLocalNodes({ type: 'unknown' })).toEqual([])
  })
})

describe('getComponentNodes()', () => {
  it('battery at (100,100) rotation 0° → top/bottom world positions', () => {
    const comp = { type: 'battery', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes[0]).toEqual({ x: 100, y: 54 })
    expect(nodes[1]).toEqual({ x: 100, y: 146 })
  })

  it('battery at (100,100) rotation 90° → left/right world positions', () => {
    const comp = { type: 'battery', x: 100, y: 100, rotation: 90 }
    const nodes = getComponentNodes(comp)
    // rotatePoint(0, -46, 90) → (46, 0)
    expect(nodes[0]).toEqual({ x: 146, y: 100 })
    // rotatePoint(0, 46, 90) → (-46, 0)
    expect(nodes[1]).toEqual({ x: 54, y: 100 })
  })

  it('bulb at (100,100) rotation 0° returns 3 world-space nodes', () => {
    const comp = { type: 'bulb', x: 100, y: 100, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes).toHaveLength(3)
    expect(nodes[0]).toEqual({ x: 82, y: 118 })
    expect(nodes[1]).toEqual({ x: 118, y: 118 })
    expect(nodes[2]).toEqual({ x: 100, y: 146 })
  })

  it('switch at (0,0) rotation 0° returns its two endpoints', () => {
    const comp = { type: 'switch', x: 0, y: 0, rotation: 0 }
    const nodes = getComponentNodes(comp)
    expect(nodes[0]).toEqual({ x: -40, y: 0 })
    expect(nodes[1]).toEqual({ x: 40, y: 0 })
  })
})
