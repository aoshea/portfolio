const textNodes = document.querySelectorAll('article a');
const containerNode = document.querySelector('#container');

const imageList = [
'http://open-foundry.com/img/of-cover-preview.jpg',
'http://nexusinteractivearts.com/wp-content/uploads/2016/09/LED_03.jpg',
'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Burberry_pattern.svg/335px-Burberry_pattern.svg.png',
'http://www.mariotestino.com/wp-content/uploads/2014/10/PRESS_06-e1417802320159-1400x1126.jpg',
'http://interactivewalks.com/wp-content/uploads/2016/08/screencapture-beyondthemap-withgoogle-com-pt-br-beyond-the-map-rio-arpoador-1470060361399-C%C3%B3pia.jpg',
'http://www.vickyh.ch/sites/unit/_img/graph/hermes_event/hermes_1.png'
]

const textList = Array.from(textNodes);

const createHandler = (index) => {
  return () => {
    containerNode.classList.add('image');
    currIndex = index;
  }
}

const handleMouseLeave = () => {
  containerNode.classList.remove('image');
};

textList.map((e, index) => {
  e.addEventListener('mouseenter', createHandler(index))
  e.addEventListener('mouseleave', handleMouseLeave)
});

// cnavs
let loaded = false;

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const SLICES = 48;
const RADIUS = 250;

let radius = RADIUS;

const init = () => {

  var pattern = ctx.createPattern(imageElements[currIndex], 'repeat');
  ctx.fillStyle = pattern;

  let slices = SLICES;
  let step = TWO_PI / SLICES;
  let cx = (window.innerWidth * 0.75) / 2;
  let scale = 1;

  let offsetScale = 1;

  for(let i = 0; i < slices; ++i) {

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(i * step);

    ctx.beginPath();
    ctx.moveTo(-0.5, -0.5);
    ctx.arc(0, 0, radius, step * -0.5, step * 0.5);
    ctx.lineTo(0.5, 0.5);
    ctx.closePath();

    ctx.rotate(HALF_PI);
    ctx.scale(scale, scale);
    ctx.scale([-1,1][i % 2], 1)
    ctx.translate(offsetX - cx, offsetY);
    ctx.rotate(offsetRotation);
    ctx.scale(offsetScale, offsetScale);

    ctx.fill();
    ctx.restore();
  }
};

let currIndex = imageList.length - 1;
const imageElements = [];
let loadedCount = 0;

imageList.map((el, i, list) => {
  let img = new Image();
  img.src = el;
  img.onload = () => {
    ++loadedCount;

    if (loadedCount === list.length) {

      let newRadius = 0;
      if (window.innerWidth > window.innerHeight) {
        newRadius = (window.innerHeight * 0.75) / 2;
      } else {
        newRadius = (window.innerWidth * 0.75) / 2;
      }
      canvas.width = newRadius * 2;
      canvas.height = newRadius * 2;

      radius = newRadius;
      loaded = true;
    }
  }
  imageElements.push(img);
});

let delta = 0;
let theta = 0;
let offsetX = 0;
let offsetY = 0;
let offsetRotation = 0;
let count = 0;

const update = () => {
	tr = Math.sin(++count * 0.01);
  tx += 0.1;

	delta = tr - offsetRotation;
  theta = Math.atan2(Math.sin(delta), Math.cos(delta));

  offsetX += (tx - offsetX) * 0.5;
  offsetY += (ty - offsetY) * 0.5;
  offsetRotation += (theta - offsetRotation) * 0.5;
}

const tick = () => {
	requestAnimationFrame(tick);
	if (!loaded) return;
  update();
  init();
}
requestAnimationFrame(tick);

let tx = 0;
let ty = 0;
let tr = 0;

const handleMouseMove = (e) => {
	// let cx = window.innerWidth / 2;
  // let cy = window.innerHeight / 2;
  let dx = e.pageX / window.innerWidth;
  let dy = e.pageY / window.innerHeight;
  let hx = dx - 0.5;
  let hy = dy - 0.5;
  tx = hx * radius * -2;
  ty = hy * radius * 2;
  tr = Math.atan2(hy, hx);
}

window.addEventListener('mousemove', handleMouseMove, false);





