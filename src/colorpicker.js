const constrain = (min, max, value) => {
  if (value <= min) {
    return min
  } else if (value >= max) {
    return max
  } else {
    return value
  }
}

const createKernel = (radius) => {
  radius = ~~radius
  const a = []

  for (let y = -radius; y < radius + 1; y++) {
    for (let x = -radius; x < radius + 1; x++) {
      const len = Math.round(Math.sqrt(x * x + y * y))
      if (len <= radius) {
        a.push({
          x: x,
          y: y
        })
      }
    }
  }

  return a
}

const createSDevArray = (luminanceArray, width, height, radius) => {
  const a = new Float32Array(luminanceArray.length)
  const kernel = createKernel(radius)

  let minValue = 1000000
  let maxValue = -1000000

  for (const index in a) {
    const x = index % width
    const y = ~~(index / height)

    // avarage
    let total = 0
    let count = 0

    for (const k of kernel) {
      const sx = x + k.x
      const sy = y + k.y

      if (sx < 0 || sy < 0 || sx >= width || sy >= height) {
        continue
      }

      total += luminanceArray[sx + sy * width]
      count++
    }

    const average = total / count

    // standard deviation
    total = 0
    count = 0

    for (const k of kernel) {
      const sx = x + k.x
      const sy = y + k.y

      if (sx < 0 || sy < 0 || sx >= width || sy >= height) {
        continue
      }

      const value = luminanceArray[sx + sy * width]
      total += (value - average) * (value - average)
      count++
    }

    const value = Math.sqrt(total / count)
    a[index] = value

    if (value < minValue) {
      minValue = value
    }
    if (value > maxValue) {
      maxValue = value
    }
  }

  // normalize
  for (const index in a) {
    a[index] = (a[index] - minValue) / (maxValue - minValue)
  }

  return a
}

const createLuminanceArray = (imageData) => {
  const a = new Float32Array(imageData.data.length / 4)

  for (let i = 0; i < imageData.data.length / 4; i++) {
    const R = imageData.data[i * 4 + 0]
    const G = imageData.data[i * 4 + 1]
    const B = imageData.data[i * 4 + 2]

    a[i] = (0.299 * R + 0.587 * G + 0.114 * B) / 255
  }

  return a
}

export default class {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.width = 0
    this.height = 0
  }

  load(image, size, radius) {
    const scale = Math.min(size / image.width, size / image.height)

    this.width = Math.round(image.width * scale)
    this.height = Math.round(image.height * scale)

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx.drawImage(image, 0, 0, this.width, this.height)

    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height)
    this.luminance = createLuminanceArray(this.imageData)
    this.sDev = createSDevArray(this.luminance, this.width, this.height, radius)
  }

  getRGBA(x, y) {
    x = constrain(0, this.imageData.width, ~~x)
    y = constrain(0, this.imageData.height, ~~y)

    const w = this.imageData.width

    const R = this.imageData.data[(x + y * w) * 4 + 0] / 255
    const G = this.imageData.data[(x + y * w) * 4 + 1] / 255
    const B = this.imageData.data[(x + y * w) * 4 + 2] / 255
    const A = this.imageData.data[(x + y * w) * 4 + 3] / 255

    return [R, G, B, A]
  }

  getLuminance(x, y) {
    x = constrain(0, this.width, ~~x)
    y = constrain(0, this.height, ~~y)

    const w = this.imageData.width
    return this.luminance[x + y * w]
  }

  getSDev(x, y) {
    x = constrain(0, this.width, ~~x)
    y = constrain(0, this.height, ~~y)

    const w = this.imageData.width
    return this.sDev[x + y * w]
  }
}