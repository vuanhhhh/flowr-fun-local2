// CHANGE BIOME ICONS

// petal container maybe, or maybe just a petal, we'll c
function generatePetalIcon(){
    const canv = document.createElement('canvas');
    const radius = 12 - 2;
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');
    cx.translate(15, 15);

    cx.lineWidth = 3;
    cx.beginPath();
    cx.fillStyle = '#ffffff';
    cx.strokeStyle = '#cfcfcf';
    
    cx.beginPath();
    cx.arc(0, 0, radius, 0, Math.PI*2);
    cx.fill();
    cx.stroke();
    cx.closePath();

    return canv.toDataURL();
}

// ladybug
function generateEnemyIcon(){
  const canv = document.createElement('canvas');
  canv.width = 30;
  canv.height = 30;
  const cx = canv.getContext('2d');
  cx.translate(15,15);
  const data = [];
  for(let i = 0; i < 3*5; i++) data[i] = Math.random();

  const bodyColor = "#EB4034";
  const headColor = "#111111";
  const angle = Math.PI - Math.PI / 8;
  const radius = 12;

  cx.rotate(angle);
  cx.strokeStyle = blendColor(headColor, "#000000", 0.19);
  cx.fillStyle = headColor;
  cx.lineWidth = radius / 5;

  // head (little black thing sticking out)
  cx.beginPath();
  cx.arc(-radius / 2, 0, radius / 2, 0, Math.PI * 2);
  cx.fill();
  cx.stroke();
  cx.closePath();

  // main body
  cx.strokeStyle = blendColor(bodyColor, "#000000", 0.19);
  cx.fillStyle = bodyColor;
  cx.beginPath();
  cx.arc(0, 0, radius, (5.9375 / 5) * Math.PI, (4.0625 / 5) * Math.PI);
  cx.quadraticCurveTo(-10, 0, Math.cos((5.9375 / 5) * Math.PI) * radius, Math.sin((5.9375 / 5) * Math.PI) * radius);
  cx.closePath();

  cx.fill();
  cx.save();
  cx.clip();

  // ladybug spots
  cx.fillStyle = headColor;
  for (let i = 0; i < 3*5; i += 3) {
    cx.beginPath();
    cx.arc((-0.5 + data[i]) * radius / 30 * 35, (-0.5 + data[i + 1] * radius / 30 * 35), radius / 30 * (5 + data[i + 2] * 5), 0, Math.PI * 2);
    cx.fill();
    cx.closePath();
  }
  cx.restore();

  cx.beginPath();
  cx.arc(0, 0, radius, (5.9375 / 5) * Math.PI, (4.0625 / 5) * Math.PI);
  cx.quadraticCurveTo(-10, 0, Math.cos((5.9375 / 5) * Math.PI) * radius, Math.sin((5.9375 / 5) * Math.PI) * radius);
  cx.stroke();
  cx.closePath();
  cx.rotate(-angle);
  cx.translate(-15, -15);

  return canv.toDataURL();
}

// maybe a mini grid with a circle on the edge or smth? Or maybe just a group of petals and enemies
function generateBiomeIcon(){
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.beginPath();
    cx.roundRect(0,0,30,30,4);
    cx.clip();
    cx.closePath();

    cx.fillStyle = colors.background;
    cx.fillRect(0,0,30,30);

    cx.lineWidth = 100;
    cx.strokeStyle = 'black';
    cx.globalAlpha = 0.08;

    cx.beginPath();
    cx.arc(15, 15, 12 + cx.lineWidth / 2, 0, Math.PI*2);
    cx.stroke();
    cx.closePath();

    cx.globalAlpha = 1;

    cx.strokeStyle = colors.grid;
    cx.lineWidth = .5;

    for(let x = 0; x <= 30; x += 10){
        cx.beginPath();
        cx.moveTo(x, 0);
        cx.lineTo(x, 30);
        cx.stroke();
        cx.closePath();
    }

    for(let y = 0; y <= 30; y += 10){
        cx.beginPath();
        cx.moveTo(0, y);
        cx.lineTo(30, y);
        cx.stroke();
        cx.closePath();
    }

    return canv.toDataURL();
}

Ref.petalButtonImage.src = generatePetalIcon();
Ref.enemyButtonImage.src = generateEnemyIcon();
Ref.biomeButtonImage.src = generateBiomeIcon();

// TOOL MENU ICONS
const generateToolIconMap = {
  "New Shape": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';

    cx.strokeStyle = colors.grid;
    cx.lineWidth = 8;
    cx.beginPath();
    cx.moveTo(15, 25);
    cx.lineTo(15, 5);
    cx.stroke();
    cx.closePath();

    cx.beginPath();
    cx.moveTo(5, 15);
    cx.lineTo(25, 15);
    cx.stroke();
    cx.closePath();

    cx.strokeStyle = colors.background;
    cx.lineWidth = 5;

    cx.beginPath();
    cx.moveTo(15, 25);
    cx.lineTo(15, 5);
    cx.stroke();
    cx.closePath();

    cx.beginPath();
    cx.moveTo(5, 15);
    cx.lineTo(25, 15);
    cx.stroke();
    cx.closePath();

    return canv.toDataURL();
  },
  "Previous Shape": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.lineJoin = 'round';

    cx.strokeStyle = colors.grid;
    cx.lineWidth = 8;

    cx.beginPath();
    cx.moveTo(25, 15);
    cx.lineTo(5, 15);
    cx.lineTo(5+10, 15+10);
    cx.lineTo(5, 15);
    cx.lineTo(5+10, 15-10);
    cx.stroke();
    cx.closePath();

    cx.strokeStyle = colors.background;
    cx.lineWidth = 5;

    cx.beginPath();
    cx.moveTo(25, 15);
    cx.lineTo(5, 15);
    cx.lineTo(5+10, 15+10);
    cx.lineTo(5, 15);
    cx.lineTo(5+10, 15-10);
    cx.stroke();
    cx.closePath();

    return canv.toDataURL();
  },
  "Line": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    
    cx.moveTo(7, 30-7);
    cx.lineTo(30-7, 7);

    cx.lineWidth = 11;
    cx.strokeStyle = colors.grid;
    cx.stroke();

    cx.lineWidth = 8;
    cx.strokeStyle = colors.background;
    cx.stroke();

    return canv.toDataURL();
  },
  "Curve": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.moveTo(5, 22);
    cx.quadraticCurveTo(15, -5, 25, 22);

    cx.lineWidth = 8;
    cx.strokeStyle = colors.grid;
    cx.stroke();
    
    cx.lineWidth = 5;
    cx.strokeStyle = colors.background;
    cx.stroke();

    return canv.toDataURL();
  },
  "Circle": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineWidth = 3;
    cx.fillStyle = colors.background;
    cx.strokeStyle = colors.grid;
    cx.arc(15, 15, 11, 0, Math.PI * 2);
    cx.fill();
    cx.stroke();

    return canv.toDataURL();
  },
  "Oval": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineWidth = 3;
    cx.fillStyle = colors.background;
    cx.strokeStyle = colors.grid;
    cx.ellipse(15, 15, 9, 13, -Math.PI / 4, 0, Math.PI * 2);
    cx.fill();
    cx.stroke();

    return canv.toDataURL();
  },
  "Stroke Weight": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.strokeStyle = colors.grid;
    cx.lineWidth = 12;
    cx.moveTo(7, 30-7);
    cx.lineTo(30-7, 7);
    cx.stroke();

    return canv.toDataURL();
  },
  "Fill Opacity": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.globalAlpha = 0.3;
    cx.fillStyle = colors.background;
    cx.roundRect(0,0,30,30,6);
    cx.fill();

    return canv.toDataURL();
  },
  "Stroke Opacity": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.globalAlpha = 0.3
    cx.lineWidth = 6;
    cx.strokeStyle = colors.grid;
    cx.roundRect(cx.lineWidth / 2,cx.lineWidth / 2,30 - cx.lineWidth,30 - cx.lineWidth,6);
    cx.stroke();

    return canv.toDataURL();
  },
  "Fill Color": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.fillStyle = colors.background;
    cx.roundRect(0,0,30,30,6);
    cx.fill();

    return canv.toDataURL();
  },
  "Stroke Color": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineWidth = 6;
    cx.strokeStyle = colors.grid;
    cx.roundRect(cx.lineWidth / 2,cx.lineWidth / 2,30 - cx.lineWidth,30 - cx.lineWidth,6);
    cx.stroke();

    return canv.toDataURL();
  },
  "Undo": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.lineJoin = 'round'
    cx.lineWidth = 6;
    cx.strokeStyle = colors.grid;
    cx.fillStyle = colors.grid;

    // uturn arrow and then a little triangle at the end
    
    cx.beginPath();
    cx.moveTo(7, 23);
    // cx.lineTo()
    // cx.arcTo(23, 23, 23, 15, 10);
    cx.arc(15,15,8,Math.PI / 2, -Math.PI / 2, true);
    cx.lineTo(12, 7);
    // cx.arcTo(21, 7, 7, 7, 10);
    cx.stroke();
    cx.closePath();

    cx.beginPath();
    cx.moveTo(7, 7);
    cx.lineTo(14, 14);
    cx.lineTo(14, 0);
    cx.lineTo(7, 7);
    cx.fill();
    cx.closePath();

    return canv.toDataURL();
  },
  "Finish Shape": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.lineJoin = 'round'
    
    cx.beginPath();
    cx.moveTo(5, 17);
    cx.lineTo(15, 24);
    cx.lineTo(25, 7);
    cx.strokeStyle = colors.grid;
    cx.lineWidth = 8;
    cx.stroke();
    cx.strokeStyle = colors.background;
    cx.lineWidth = 5;
    cx.stroke();
    cx.closePath();
    
    return canv.toDataURL();
  },
  "Test Game": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.lineJoin = 'round';

    cx.lineWidth = 7;
    cx.strokeStyle = colors.grid;
    cx.fillStyle = colors.background;
    
    cx.moveTo(6, 4);
    cx.lineTo(24, 15);
    cx.lineTo(6, 26);
    cx.lineTo(6, 4);
    cx.stroke();
    cx.fill();
    
    return canv.toDataURL();
  },
  "Stop Testing": () => {
    const canv = document.createElement('canvas');
    canv.width = 30;
    canv.height = 30;
    const cx = canv.getContext('2d');

    cx.lineCap = 'round';
    cx.lineJoin = 'round';
    
    cx.moveTo(8, 6);
    cx.lineTo(8, 24);
    cx.moveTo(22, 6);
    cx.lineTo(22, 24);

    cx.lineWidth = 8;
    cx.strokeStyle = colors.grid;
    cx.stroke();

    cx.lineWidth = 4;
    cx.strokeStyle = colors.background;
    cx.stroke();
    
    return canv.toDataURL();
  },
}