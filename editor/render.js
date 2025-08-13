// for all 3 modes render an infinite grid.
// for biome mode render a 2000 radius circle that is the arena bounds

const canvas = Ref.canvas;
let ctx = canvas.getContext('2d');

window.camera = {x: 0, y: 0, actualZoom: 1, zoom: 1, disableCulling: true, last: {}};
window.biomeName = 'garden';
window.colors = {background: "#1ea761", grid: "#1d9157"};

function render(){
    time = performance.now();
    
    petal.draw();
    updateInterpolate();

    renderBackground();

    // if(mode === 'biome'){
        renderBoundaries();
    // }

    renderTiles();

    renderModeSpecificItems();
}

function updateInterpolate(){
    updateDt();
    camera.zoom = interpolate(camera.zoom, camera.actualZoom, 0.08);
    if(mode === 'biome') BiomeModeManager.updateFlowerInterpolate();
}

function renderBackground(){
    ctx.fillStyle = colors.background;
    ctx.fillRect(0,0,canvas.w,canvas.h);
}

function renderBoundaries(){
    room.render.radius = interpolate(room.render.radius, room.radius, 0.024 * 1 / (camera.zoom ** 2) / 2.5);

    ctx.lineWidth = canvas.w * 2 + canvas.h * 2;
    ctx.strokeStyle = 'black';
    ctx.globalAlpha = 0.08;

    ctx.beginPath();
    ctx.arc(canvas.w/2 - camera.x * camera.zoom, canvas.h/2 - camera.y * camera.zoom, room.render.radius * camera.zoom + ctx.lineWidth / 2, 0, Math.PI*2);
    ctx.stroke();
    ctx.closePath();

    ctx.globalAlpha = 1;
}

const tileSize = 50;
function renderTiles(){
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = camera.zoom;
    ctx.globalAlpha = 1;

    const tileOffset = {x: (-camera.x + canvas.w/2/camera.zoom) % tileSize, y: (-camera.y + canvas.h/2/camera.zoom) % tileSize};

    for(let x = (tileOffset.x)*camera.zoom; x <= canvas.w+ctx.lineWidth; x+=tileSize*camera.zoom){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.h);
        ctx.stroke();
        ctx.closePath();
    }

    for(let y = (tileOffset.y)*camera.zoom; y <= canvas.h+ctx.lineWidth; y+=tileSize*camera.zoom){
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.w, y);
        ctx.stroke();
        ctx.closePath();
    }
}

window.dt = 0;
window.lastTime = performance.now();
function updateDt(){
    const now = performance.now();
    window.dt = now - window.lastTime;
    window.lastTime = now;
}

function renderModeSpecificItems(){
    modeRenderMap[window.mode]();
}

const modeRenderMap = {
    petal: () => {
        PetalModeManager.draw();
    },
    enemy: () => {
        EnemyModeManager.draw();
    },
    biome: () => {
        BiomeModeManager.draw();
    }
}