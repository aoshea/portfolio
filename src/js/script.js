let cols = 1;
let rows = 1;

const bufferCanvas = document.createElement("canvas");
const buffer = bufferCanvas.getContext("2d");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let imagesLoaded = false;
let imageEl = null;
let pattern = null;
let counter = 0;
let x = 0;
let y = 0;
let tx = 0;
let ty = 0;
let rotation = 0;
let tRotation = 0;
let radius = 0;
let lastCols = -1;

function getRandomCols() {
  return 1 << Math.floor(Math.random() * 3);
}

function resetPattern() {
  pattern = buffer.createPattern(imageEl, "repeat");
  buffer.fillStyle = pattern;
  buffer.strokeStyle = 'blue';
  buffer.strokeWidth = 1;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {

  if (lastCols !== cols) {
    resetPattern();
    clear();
    lastCols = cols;
  }

  let slices = 2;
  let step = (Math.PI * 2) / slices;
  let cx = (window.innerWidth * 0.75) / 2;

  let i = slices;
  while (i--) {
    let sign = i % 2 ? 1 : -1;
    
    buffer.save();
    buffer.translate(radius, radius);
    buffer.rotate(rotation);
    buffer.fillRect(0, 0, radius, radius);
    buffer.rotate(Math.PI / 2);

    buffer.fillRect(0, 0, radius, radius);
/*
    buffer.save();
    buffer.translate(radius, radius);
    buffer.rotate(i * step);

    buffer.beginPath();
    buffer.moveTo(0, 0);
    buffer.arc(0, 0, radius, 0, step);
    buffer.lineTo(0, 0);
    buffer.closePath();

    buffer.rotate(Math.PI / 2);
    buffer.scale(0.5, 0.5 * sign);
    buffer.translate(tx - cx, ty);
    buffer.rotate(rotation);

*/
    buffer.fill();
    buffer.stroke();
    buffer.restore();
  }

  // 1, 2, 4, 8
  i = cols * rows;

  let size = radius * 2;
  let dsize = size / cols;

  while (i--) {
    let col = i % cols;
    let row = Math.floor(i / cols);

    let dx = col * dsize;
    let dy = row * dsize;

    ctx.drawImage(bufferCanvas, dx, dy, dsize, dsize);
  }
}

function update() {
  counter++;
  tRotation = Math.sin(counter * 0.01);
  tx += 0.1;
  let delta = tRotation - rotation;
  let theta = Math.atan2(Math.sin(delta), Math.cos(delta));

  x += (tx - x) * 0.5;
  y += (ty - y) * 0.5;

  rotation += (theta - rotation) * 0.5;
}

function tick() {
  requestAnimationFrame(tick);
  if (!imagesLoaded) return;
  update();
  draw();
}

function handleImageLoad() {
  handleResize();
  imagesLoaded = true;
}

function handleImageError() {
  console.error("Image could not be loaded"); // eslint-disable-line no-console
}

function handleResize() {
  clear();

  let newRadius = 0;
  if (window.innerWidth > window.innerHeight) {
    newRadius = (window.innerHeight * 0.75) / 2;
  } else {
    newRadius = (window.innerWidth * 0.75) / 2;
  }
  bufferCanvas.width = canvas.width = newRadius * 2;
  bufferCanvas.height = canvas.height = newRadius * 2;

  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

  canvas.width = newRadius * 4;
  canvas.height = newRadius * 4;

  ctx.scale(2, 2);

  radius = newRadius;
}

function input(x, y) {
  let dx = x;
  let dy = y;
  let hx = dx - 0.5;
  let hy = dy - 0.5;
  tx = hx * radius * -2;
  ty = hy * radius * 2;
  tRotation = Math.atan2(hy, hx);
}

function handleMouseMove(e) {
  input(e.pageX / window.innerWidth, e.pageY / window.innerHeight);
}

function handleOrientation(e) {
  if (!isNaN(e.alpha)) {
    input(e.beta * 0.1, e.gamma * 0.1);
  }
}

function handleKeyUp() {
  rows = cols = getRandomCols();
}

imageEl = new Image();
imageEl.src = 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Ask_For_Young%27s_Aerated_Waters_%285012799192%29.jpg';
// imageEl.src = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Gustave_Le_Gray_%28French_-_Cloudy_Sky_-_Mediterranean_Sea_%28Ciel_Charge_-_Mer_Mediterranee%29%29_-_Google_Art_Project.jpg';
imageEl.onload = handleImageLoad;
imageEl.onerror = handleImageError;

window.addEventListener("keyup", handleKeyUp, false);
window.addEventListener("mousemove", handleMouseMove, false);
window.addEventListener("resize", handleResize, false);

if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", handleOrientation);
}

/*
setInterval(function () {
  rows = cols = getRandomCols();
}, 5000);
*/

requestAnimationFrame(tick);
