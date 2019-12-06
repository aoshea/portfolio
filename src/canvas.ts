// device pixel ratio
const dpr = window.devicePixelRatio || 1;
const sourceSize = 256;
const sourceCanvas: HTMLCanvasElement = document.createElement("canvas");
sourceCanvas.width = sourceCanvas.height = sourceSize;
const sourceCtx: CanvasRenderingContext2D = sourceCanvas.getContext("2d");
const hexagonCanvas: HTMLCanvasElement = document.createElement("canvas");
const hexagonCtx: CanvasRenderingContext2D = hexagonCanvas.getContext("2d");
const bufferCanvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D = bufferCanvas.getContext("2d");
const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("canvas")
);
const destCtx: CanvasRenderingContext2D = canvas.getContext("2d");
destCtx.imageSmoothingEnabled = false;
let pattern: CanvasPattern = null;
let targetSize: number = 50;
let size: number = 0;
let t: number = 0;
let dt: number = 1 / 60;
let x: number = 0;
let y: number = 0;
let tx: number = 0;
let ty: number = 0;
let isKeyDown: boolean = false;

// mouse/touch
let mx = 0;
let tmx = 0;
let m = 0;
let prevm = 0;

// viewport dimensions updated after resize
let dim;

// anchor canvases
const anchorCanvases: CanvasRenderingContext2D[] = [];

interface Point {
  x: number;
  y: number;
}

function getColour(freq: number, i: number) {
  let width = 75;
  let centre = 180;
  let r = Math.sin(freq * i) * width + centre;
  let g = Math.sin(freq * i + 1) * width + centre;
  let b = Math.sin(freq * i + 2) * width + centre;
  let hex = ((r << 16) | (g << 8) | b).toString(16);
  return `#${hex}`;
}

let k = 0;

function drawSource(accel: number, ctx = sourceCtx): void {
  let n = 16;
  let max = n * n;
  let dim = sourceSize / n;
  let r = Math.PI / max;
  ctx.fillStyle = "#f0fcaa";
  ctx.fillRect(0, 0, sourceSize, sourceSize);
  for (let i = 0; i < max; ++i) {
    let col = i % n;
    let row = Math.floor(i / n);
    let index = Math.floor(Math.abs(Math.sin(i * accel)) * 100);
    ctx.save();
    ctx.translate(col * dim, row * dim);
    ctx.fillStyle = getColour(accel, i);
    ctx.translate(dim / 2, dim / 2);
    ctx.rotate(r * i);
    ctx.translate(-dim / 2, -dim / 2);
    ctx.fillRect(0, 0, dim, dim);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sourceSize, 0);
  ctx.lineTo(sourceSize, sourceSize);
  ctx.lineTo(0, sourceSize);
  ctx.closePath();
  pattern = hexagonCtx.createPattern(sourceCanvas, "repeat");
  hexagonCtx.fillStyle = pattern;
}

function triangle(a: Point, b: Point, c: Point, dir: number, ctx = hexagonCtx) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.scale(0.5 * dir, 0.5 * dir);
  ctx.rotate(Math.sin(t * 0.1));
  ctx.translate(x, y);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function point(x: number, y: number): Point {
  return {
    x,
    y
  };
}

function hexagonTriangle(i: number, size: number): void {
  const angle = Math.PI / 3;
  const x0 = 0;
  const y0 = 0;
  const p0 = point(x0, y0);
  const x1 = size;
  const y1 = 0;
  const p1 = point(x1, y1);
  const x2 = Math.cos(angle) * size;
  const y2 = Math.sin(angle) * size;
  const p2 = point(x2, y2);
  const x3 = (p1.x + p2.x) * 0.5;
  const y3 = (p1.y + p2.y) * 0.5;
  const p3 = point(x3, y3);
  hexagonCtx.save();
  hexagonCtx.translate(size, Math.sqrt(3) * size * 0.5);
  hexagonCtx.rotate((i * Math.PI) / 3);
  triangle(p0, p1, p3, 1);
  triangle(p0, p3, p2, -1);
  hexagonCtx.restore();
}
function hexagon(size: number): void {
  hexagonTriangle(0, size);
  hexagonTriangle(1, size);
  hexagonTriangle(2, size);
  hexagonTriangle(3, size);
  hexagonTriangle(4, size);
  hexagonTriangle(5, size);
}
function hexagonColumn(
  offset: Point,
  size: number,
  w: number,
  h: number,
  rows: number
): void {
  ctx.save();
  ctx.translate(offset.x, offset.y);
  let i: number = rows;
  while (i--) {
    ctx.drawImage(hexagonCanvas, 0, 0, w * dpr, h * dpr, 0, i * h, w, h);
  }
  ctx.restore();
}

function draw(): void {
  //m !== prevm && drawSource(m);
  // figure size
  size += (targetSize - size) * 0.5;
  hexagonCtx.strokeStyle = "#fc0";
  hexagon(size);
  // size of hexagon
  const hexagonWidth = size * 2;
  const hexagonHeight = Math.sqrt(3) * size;
  // how many cols and rows needed to fill screen?
  const rows = Math.ceil(canvas.height / hexagonHeight) + 1;
  const cols = Math.ceil((canvas.width / hexagonWidth) * 1.25) + 1;
  // loop over and draw columns
  let i = cols;
  while (i--) {
    hexagonColumn(
      {
        x: hexagonWidth * i * 0.75 - hexagonWidth * 0.5,
        y: i % 2 === 0 ? 0 : -hexagonHeight * 0.5
      },
      size,
      hexagonWidth,
      hexagonHeight,
      rows
    );
  }
  anchorCanvases.forEach(c => {
    c.fillStyle = pattern;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(c.canvas.width, 0);
    c.lineTo(c.canvas.width, c.canvas.height);
    c.lineTo(0, c.canvas.height);
    c.closePath();
    c.save();
    c.translate(tx, tx);
    c.fill();
    c.restore();
  });
}
function clear(): void {
  hexagonCtx.clearRect(0, 0, hexagonCanvas.width, hexagonCanvas.height);
  destCtx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function flush() {
  let c = isKeyDown ? sourceCanvas : bufferCanvas;
  destCtx.globalCompositeOperation = "source-over"; //default
  destCtx.drawImage(
    c,
    0,
    0,
    c.width,
    c.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  destCtx.fillStyle = "#fff"; //color doesn't matter, but we want full opacity
  destCtx.globalCompositeOperation = "destination-in";
  destCtx.beginPath();

  let ax = dim * 0.5;
  destCtx.arc(ax, ax, ax, Math.PI * 2, 0, true);
  destCtx.closePath();
  destCtx.fill();
}

function resize() {
  clear();
  // Scale all drawing operations by the dpr
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let canvasRect = {
    width: vw > vh ? vw * 0.38 : vh * 0.38,
    height: vw > vh ? vw * 0.38 : vh * 0.38
  };

  dim = canvasRect.width * dpr;
  hexagonCanvas.width = bufferCanvas.width = canvas.width = dim;
  hexagonCanvas.height = bufferCanvas.height = canvas.height = dim;
  hexagonCtx.scale(dpr, dpr);
  hexagonCtx.fillStyle = pattern;
  canvas.style.width = canvasRect.width + "px";
  canvas.style.height = canvasRect.height + "px";
  ctx.scale(dpr, dpr);
}

function update() {
  t += dt;
  tx += 10 * dt;
  x += (tx - x) * 0.05;
  y += (ty - y) * 0.05;

  if (m !== prevm) {
    prevm = m;
  }
  mx += (tmx - mx) * 0.05;
  m = Math.round(mx * 100);
}

function tick() {
  requestAnimationFrame(tick);
  update();
  draw();
  flush();
}

function handleChangeSize(event: Event) {
  let target = event.target as HTMLInputElement;
  targetSize = +target.value;
}

function handleResize(event: Event) {
  resize();
}

function handleMouseMove(event: MouseEvent) {
  tmx = event.clientX / window.innerWidth;
}
function handleTouchMove(event: TouchEvent) {
  tmx = event.touches[0].clientX / window.innerWidth;
}

function handleKeyDown(event: KeyboardEvent) {
  isKeyDown = event.keyCode === 13;
}
function handleKeyUp(event: KeyboardEvent) {
  isKeyDown = false;
}

function underlineAnchors() {
  const anchors: HTMLAnchorElement[] = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a")
  );

  let id: Number = 0;

  function createAnchorUnderline(el: HTMLAnchorElement) {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
      document.createElement("canvas")
    );
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    const rect: ClientRect = el.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 2;
    canvas.classList.add("underline");
    ctx.fillStyle = pattern;
    el.appendChild(canvas);
    anchorCanvases.push(ctx);
  }

  anchors.forEach(createAnchorUnderline);
}

drawSource(0.6);
underlineAnchors();
resize();
requestAnimationFrame(tick);
window.addEventListener("resize", resize, false);
window.addEventListener("mousemove", handleMouseMove, false);
window.addEventListener("keydown", handleKeyDown, false);
window.addEventListener("touchmove", handleTouchMove, false);
window.addEventListener("keyup", handleKeyUp, false);
