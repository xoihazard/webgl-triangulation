import * as D3Force from 'd3-force'
import DelaunayTriangulate from 'delaunay-triangulate'
import ColorPicker from './colorpicker'
import Renderer from './renderer'

const NUM_POINTS = 1500
const V_ATTRACT = 0.001
const V_THETA = -0.001
const V_RADIUS_MIN = 0.01
const V_RADIUS_MAX = 0.3

const model = {}
const renderer = new Renderer(model)
const picker = new ColorPicker()
const image = new Image()

let imageScale = 1.0

const rotate = (x, y, theta) => {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return [
    c * x - s * y,
    s * x + c * y
  ]
}

const nodes = []
const simulation = D3Force.forceSimulation(nodes)
  .velocityDecay(0.2)
  .force('collide', D3Force.forceCollide()
    .radius((node, i) => {
      const x = node.x * imageScale + picker.width / 2
      const y = node.y * -imageScale + picker.height / 2

      //const l = 1 - picker.getLuminance(x, y)
      const l = 1 - picker.getSDev(x, y)
      node.color = picker.getRGBA(x, y)

      const r = rotate(node.x, node.y, V_THETA)

      node.vx += r[0] * (1 - V_ATTRACT) - node.x
      node.vy += r[1] * (1 - V_ATTRACT) - node.y

      node.r = V_RADIUS_MIN + V_RADIUS_MAX * Math.pow(l, 6)
      return node.r
    })
    .strength(0.7)
    .iterations(2)
  )

const addNode = (count = 1) => {
  for (let i = 0; i < count; i++) {
    const v = rotate(Math.random() * 1.0, 0, Math.random() * Math.PI * 2)
    nodes.push({
      x: v[0],
      y: v[1]
    })
  }
}

image.onload = (ev) => {
  picker.load(image, 256, 9)
  imageScale = Math.min(picker.width, picker.height) * 0.5
  addNode(100)

  renderer.start(() => {
    if (nodes.length < NUM_POINTS) {
      addNode(1)
    } else {
      nodes.shift()
    }

    simulation.nodes(nodes)
    simulation.tick()

    model.points = nodes.map(node => {
      return [node.x, node.y]
    })

    model.colors = nodes.map(node => {
      return node.color
    })

    model.triangles = DelaunayTriangulate(model.points)
    model.lines = []

    for (const i in model.triangles) {
      model.lines.push([model.triangles[i][0], model.triangles[i][1]])
      model.lines.push([model.triangles[i][1], model.triangles[i][2]])
      model.lines.push([model.triangles[i][2], model.triangles[i][0]])
    }
  })
}

image.src = 'img/mask.jpg'