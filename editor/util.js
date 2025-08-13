const onLoadFunctions = [];
window.loaded = false;
window.isEditor = true;
let damageFlash = true;
window.levelBar = {addXp: () => {}};
window.onload = () => {
  resize();
  Ref.loader.style.animation = 'fadeOut .2s';
  setTimeout(() => {
    Ref.loader.remove();
  }, 200 - 1000 / 60 * 2)

  for(let i = 0; i < onLoadFunctions.length; i++){
    onLoadFunctions[i]();
  }
  onLoadFunctions.length = 0;

  window.loaded = true;
}
let time;
window.renderFov = Infinity;

const fullscreen = {
  ratio: 9 / 16,
  zoom: 1200,
}
let renderScale = 1;
function resize(){
  const dpi = window.devicePixelRatio;
  canvas.style.width = Math.ceil(window.innerWidth) + 'px';
  canvas.style.height = Math.ceil(window.innerHeight) + 'px';
  canvas.width = Math.ceil(window.innerWidth) * dpi;
  canvas.height = Math.ceil(window.innerHeight) * dpi;
  canvas.zoom = Math.max(0.1, Math.round((Math.max(canvas.height, canvas.width * fullscreen.ratio) / fullscreen.zoom * renderScale) * 100) / 100);
  
  // w and h are calced with zoom
  canvas.w = canvas.width / canvas.zoom;
  canvas.h = canvas.height / canvas.zoom;
  ctx.scale(canvas.zoom, canvas.zoom);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

window.addEventListener('resize', resize);

const cameraBounds = {
  max: {petal: 30, enemy: 25, biome: 6},
  min: {petal: 0.5, enemy: 0.5, biome: 0.3}
}
const zoomSpeeds = {petal: 0.6, enemy: 0.6, biome: 0.9}
window.addEventListener("wheel", (e) => {
	camera.actualZoom /= 1 / (1 - e.deltaY * zoomSpeeds[mode] / 1000);
  if(window.mode === "biome" && testingGame === true && room.wave > 42){
    camera.actualZoom = Math.max(0.16, Math.min(cameraBounds.max[mode], camera.actualZoom));
  } else {
    camera.actualZoom = Math.max(cameraBounds.min[mode], Math.min(cameraBounds.max[mode], camera.actualZoom));
  }
});

window.addEventListener("contextmenu", e => e.preventDefault());

const noEnemyBox = [];
const hexChars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
function generateRandomHex(){
  let hex = '#';
  for(let i = 1; i < 7; i++){
    hex += hexChars[Math.floor(Math.random() * (hexChars.length - 1))];
  }
  return hex;
}

function roomRadiusFunction(wave){
  return Math.min(2500, (6000)/(5 + Math.pow(Math.E, -(wave - 75)/15)) + 1500);
  /*
return Math.min(3500, (10000)/(5 + Math.pow(Math.E, -(wave - 75)/12)) + 1500);
  */
/*
return Math.min(4000, (13500)/(5 + Math.pow(Math.E, -(wave - 65)/15)) + 1300);
*/
}
const roundTo = (val, roundVal) => {
    return ~~(val * roundVal) / roundVal;
}

let i;
// filter and run some function on the removed elements
const filterRemove = function(fn, removeFn) {
    var arr = this;
    const nested = () => {
        for(i = arr.length-1; i >= 0; i--){
            if(!fn(arr[i], i)){
                removeFn(arr[i], i);
                arr.splice(i,1);
            }
        }
        return arr;
    }
    return nested();
}

Object.defineProperty(Array.prototype, 'filterRemove', {
    value: filterRemove,
    enumerable: false,
    configurable: true,
    writable: true
});

function initMode(){
  modeInitMap[window.mode]();
}

const modeInitMap = {
  petal: () => {
    PetalModeManager.init();
  },
  enemy: () => {
    EnemyModeManager.init();
  },
  biome: () => {

  }
}

function terminateMode(){
  modeTerminateMap[window.mode]();
}

const modeTerminateMap = {
  'will be set in the function call': () => {},
  petal: () => {
    if(createShapeActive === true){
      PetalModeManager.finishCreateShape();
    }
    
  },
  enemy: () => {
    if(createShapeActive === true){
      EnemyModeManager.finishCreateShape();
    }
  },
  biome: () => {
    BiomeModeManager.terminateMode();
  }
}

function interpolate(s, e, t){
  t = Math.max(0, Math.min(1, t));
  return s + (e - s) * t;
}

function smoothstep(t){
  return interpolate(t * t, 1 - (1 - t) * (1 - t), t);
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

const cameraZooms = {petal: 6, enemy: 2.44949, biome: 1};
function updateZoom(){
  camera.actualZoom = cameraZooms[window.mode];
}

const onButtonClick = (b) => {
  if(b === Ref.petalButton){
    changeMode('petal');
  } else if(b === Ref.enemyButton){
    changeMode('enemy');
  } else {
    changeMode('biome');
  }
}

Ref.petalButton.onclick = () => { onButtonClick(Ref.petalButton) };
Ref.enemyButton.onclick = () => { onButtonClick(Ref.enemyButton) };
Ref.biomeButton.onclick = () => { onButtonClick(Ref.biomeButton) };

window.mouse = {x: 0, y: 0};

const mouseDownFunctions = [];
canvas.onmousedown = (e) => {
  window.mouse = {x: e.pageX, y: e.pageY};
  for(let i = 0; i < mouseDownFunctions.length; i++){
    mouseDownFunctions[i](e);
  }
}

const mouseMoveFunctions = [];
canvas.onmousemove = (e) => {
  window.mouse = {x: e.pageX, y: e.pageY};
  for(let i = 0; i < mouseMoveFunctions.length; i++){
    mouseMoveFunctions[i](e);
  }
}

const mouseUpFunctions = [];
canvas.onmouseup = (e) => {
  window.mouse = {x: e.pageX, y: e.pageY};
  for(let i = 0; i < mouseUpFunctions.length; i++){
    mouseUpFunctions[i](e);
  }
}