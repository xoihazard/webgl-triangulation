import REGL from 'regl'

const regl = REGL()

const aspectVec2 = (width, height) => {
  if (width > height) {
    return [height / width, 1]
  } else {
    return [1, width / height]
  }
}

const drawPoints = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;

    void main() {
      float len = length(gl_PointCoord.xy - 0.5) * 2.0;
      if (len > 1.0) {
        discard;
      }
      gl_FragColor = vec4(color.rgb, 1.0 - len);
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform vec2 aspect;
    uniform float zoom;

    void main() {
      gl_PointSize = 3.0;
      gl_Position = vec4(position * aspect * zoom, 0.0, 1.0);
    }`,

  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 1,
      dstRGB: 'one',
      dstAlpha: 1
    },
    equation: {
      rgb: 'add',
      alpha: 'add'
    }
  },

  uniforms: {
    aspect: regl.prop('aspect'),
    zoom: regl.prop('zoom'),
    color: regl.prop('color')
  },

  attributes: {
    position: regl.prop('position')
  },

  count: regl.prop('count'),
  primitive: 'points'
})

const drawLines = regl({
  frag: `
    precision mediump float;
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vec4(vColor.rgb, 0.5);
    }`,
  vert: `
    precision mediump float;
    attribute vec2 position;
    attribute vec4 color;
    uniform vec2 aspect;
    uniform float zoom;
    varying lowp vec4 vColor;

    void main() {
      gl_Position = vec4(position * aspect * zoom, 0.5, 1.0);
      vColor = color;
    }`,

  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 1,
      dstRGB: 'one',
      dstAlpha: 1
    },
    equation: {
      rgb: 'add',
      alpha: 'add'
    }
  },

  uniforms: {
    aspect: regl.prop('aspect'),
    zoom: regl.prop('zoom')
  },

  attributes: {
    position: regl.prop('position'),
    color: regl.prop('color')
  },

  elements: regl.prop('elements'),
  primitive: 'line',
  lineWidth: 1
})

const drawFaces = regl({
  frag: `
    precision mediump float;
    varying lowp vec4 vColor;
    void main() {
      gl_FragColor = vec4(vColor.rgb, 0.8);
    }`,
  vert: `
    precision mediump float;
    attribute vec2 position;
    attribute vec4 color;
    uniform vec2 aspect;
    uniform float zoom;
    varying lowp vec4 vColor;

    void main() {
      gl_Position = vec4(position * aspect * zoom, 0.6, 1.0);
      vColor = color;
    }`,

  blend: {
    enable: true,
    func: {
      srcRGB: 'src alpha',
      srcAlpha: 1,
      dstRGB: 'one',
      dstAlpha: 1
    },
    equation: {
      rgb: 'add',
      alpha: 'add'
    }
  },

  uniforms: {
    aspect: regl.prop('aspect'),
    zoom: regl.prop('zoom')
  },

  attributes: {
    position: regl.prop('position'),
    color: regl.prop('color')
  },

  elements: regl.prop('elements'),
  primitive: 'triangle'
})

export default class {
  constructor(model) {
    this.model = model
  }

  start(arrange) {
    regl.frame(ctx => {
      arrange()
      this.render(ctx)
    })
  }

  render(ctx) {
    const aspect = aspectVec2(ctx.viewportWidth, ctx.viewportHeight)
    const zoom = 1 + Math.sin(ctx.time * 0.1) * 0.5

    regl.clear({
      color: [0.0, 0.0, 0.2, 1],
      depth: 1
    })

    drawFaces({
      aspect: aspect,
      zoom: zoom,
      position: this.model.points,
      color: this.model.colors,
      elements: this.model.triangles
    })

    drawLines({
      aspect: aspect,
      zoom: zoom,
      position: this.model.points,
      color: this.model.colors,
      elements: this.model.lines
    })

    drawPoints({
      aspect: aspect,
      zoom: zoom,
      position: this.model.points,
      color: [1, 1, 1, 1],
      count: this.model.points.length
    })
  }
}