const randomCols = () => (1 << Math.floor(Math.random() * 4))

const kOptions = {
  cols: 1,
  rows: 1,
  index: 1
}

var UI = {

  createHandler(index, options) {
    return () => {
      const containerNode = document.querySelector('#container')
      containerNode.classList.add('image');

      options.index = index
      options.rows = options.cols = randomCols()
    }
  },

  handleMouseLeave() {
    const containerNode = document.querySelector('#container')
    containerNode.classList.remove('image')
  },

  init(options) {
    const textList = Array.from(document.querySelectorAll('article a'))
    textList.map((e, index) => {
      e.addEventListener('mouseenter', this.createHandler(index, options))
      e.addEventListener('mouseleave', this.handleMouseLeave)
    })
  }
}

var Kaleidoscope = {

  imageList: [
  'http://nexusinteractivearts.com/wp-content/uploads/2016/09/LED_03.jpg',
  'https://pbs.twimg.com/profile_images/674168990382604288/FF-QBq8f_200x200.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Burberry_haymarket.jpg/1024px-Burberry_haymarket.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mario_Testino_2014.jpg/800px-Mario_Testino_2014.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Rio_de_Janeiro_Brazil_slum_Pav%C3%A3ozinho_favela_December_2008.jpg/1024px-Rio_de_Janeiro_Brazil_slum_Pav%C3%A3ozinho_favela_December_2008.jpg',
  'http://www.vickyh.ch/sites/unit/_img/graph/hermes_event/hermes_1.png'
  ],
  imageElements: [],
  imagesLoaded: false,
  loadedCount: 0,

  bufferCanvas: null,
  buffer: null,
  canvas: null,
  ctx: null,
  pattern: null,
  options: null,

  counter: 0,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  rotation: 0,
  tRotation: 0,
  radius: 0,

  lastCols: -1,
  lastIndex: -1,

  resetPattern() {
    this.pattern = this.buffer.createPattern(this.imageElements[this.options.index], 'repeat')
    this.buffer.fillStyle = this.pattern
  },

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  },

  draw() {
    let ctx = this.ctx
    let buffer = this.buffer
    let radius = this.radius

    if (this.lastIndex !== this.options.index) {
      this.resetPattern()
      this.lastIndex = this.options.index
    }

    if (this.lastCols !== this.options.cols) {
      this.clear()
      this.lastCols = this.options.cols
    }

    let slices = 16;
    let step = (Math.PI * 2) / slices;
    let cx = (window.innerWidth * 0.75) / 2

    let i = slices
    while(i--) {
      let sign = i % 2 ? 1 : -1

      buffer.save()
      buffer.translate(radius, radius)
      buffer.rotate(i * step)

      buffer.beginPath()
      buffer.moveTo(0, 0)
      buffer.arc(0, 0, radius, 0, step)
      buffer.lineTo(0, 0)
      buffer.closePath()

      buffer.rotate(Math.PI / 2)
      buffer.scale(0.5, 0.5 * sign)
      buffer.translate(this.tx - cx, this.ty);
      buffer.rotate(this.rotation);

      buffer.fill();
      buffer.restore();
    }

    // 1, 2, 4, 8
    let cols = this.options.cols
    let rows = this.options.rows
    i = cols * rows

    let size = radius * 2
    let dsize = size / cols

    while(i--) {

      let col = i % cols
      let row = Math.floor(i / cols)

      let dx = col * dsize
      let dy = row * dsize

      ctx.drawImage(this.bufferCanvas, dx, dy, dsize, dsize)
    }
  },

  update() {
    this.counter++
    this.tRotation = Math.sin((this.counter * 0.01))
    this.tx += 0.1
    let delta = this.tRotation - this.rotation
    let theta = Math.atan2(Math.sin(delta), Math.cos(delta))

    this.x += (this.tx - this.x) * 0.5
    this.y += (this.ty - this.y) * 0.5

    this.rotation += (theta - this.rotation) * 0.5
  },

  tick() {
    requestAnimationFrame(this.tick)
    if (!this.imagesLoaded) return
    this.update()
    this.draw()
  },

  handleImageLoad() {
    this.loadedCount++
    if (this.loadedCount === this.imageList.length) {
      this.handleResize()
      this.imagesLoaded = true;
    }
  },

  handleImageError() {
    console.error('Image could not be loaded'); // eslint-disable-line no-console
  },

  handleResize() {
    let newRadius = 0;
    if (window.innerWidth > window.innerHeight) {
      newRadius = (window.innerHeight * 0.75) / 2;
    } else {
      newRadius = (window.innerWidth * 0.75) / 2;
    }
    this.bufferCanvas.width = this.canvas.width = newRadius * 2;
    this.bufferCanvas.height = this.canvas.height = newRadius * 2;
    this.radius = newRadius;
  },

  input(x, y) {
    let dx = x
    let dy = y
    let hx = dx - 0.5
    let hy = dy - 0.5
    this.tx = hx * this.radius * -2
    this.ty = hy * this.radius * 2
    this.tRotation = Math.atan2(hy, hx)
  },

  handleMouseMove(e) {
    this.input(e.pageX / window.innerWidth, e.pageY / window.innerHeight)
  },

  handleOrientation(e) {
    if (!isNaN(e.alpha)) {
      this.input(e.beta * 0.1, e.gamma * 0.1)
    }
  },

  init(options) {
    this.options = options

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleImageLoad = this.handleImageLoad.bind(this)
    this.handleImageError = this.handleImageError.bind(this)
    this.handleOrientation = this.handleOrientation.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.tick = this.tick.bind(this)
    requestAnimationFrame(this.tick)

    this.bufferCanvas = document.createElement('canvas')
    this.buffer = this.bufferCanvas.getContext('2d')
    this.canvas = document.querySelector('#canvas')
    this.ctx = this.canvas.getContext('2d')

    this.imageList.map(el => {
      let img = new Image()
      img.src = el
      img.onload = this.handleImageLoad
      img.onerror = this.handleImageError
      this.imageElements.push(img)
    })

    window.addEventListener('mousemove', this.handleMouseMove, false)
    window.addEventListener('resize', this.handleResize, false)

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.handleOrientation)
    }
  }
}

const ui = Object.create(UI)
ui.init(kOptions)

const kaleidoscope = Object.create(Kaleidoscope)
kaleidoscope.init(kOptions)
