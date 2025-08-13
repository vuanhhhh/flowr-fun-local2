// stuff that client and editor both need to function (ex. rendering enemies)
ctx.setFillStyle = (fs) => {
	if(window.overrideBlendColor !== undefined){
		ctx.fillStyle = blendColor(fs, window.overrideBlendColor[1], window.overrideBlendColor[0]);
		return;
	}
	ctx.fillStyle = fs;
}
ctx.setStrokeStyle = (ss) => {
	if(window.overrideBlendColor !== undefined){
		ctx.strokeStyle = blendColor(ss, window.overrideBlendColor[1], window.overrideBlendColor[0]);
		return;
	}
	ctx.strokeStyle = ss;
}
ctx.setGlobalAlpha = (a, toIgnoreAlphaMult=false) => {
	if(window.alphaMult !== undefined && toIgnoreAlphaMult !== true) {
		ctx.globalAlpha = window.alphaMult * a;
		return;
	}
	ctx.globalAlpha = a;
}
ctx.setFillAlpha = (a) => {
	ctx.fillOpacity = a;
}
ctx.setStrokeAlpha = (a) => {
	ctx.strokeOpacity = a;
}
ctx.setLineWidth = (lw) => {ctx.lineWidth = lw;}

// when we add enemies/ petals to the game from custom biomes we will put their shapes here.
// assuming devs implementing custom enemies will just JSON.stringify some exported data. Otherwise (because the strings may be very long) functions may be able to sneak into the codebase...
// better idea: we generate a bunch of text where each line corresponds to something. There will be 2 long lines that will be petalData and enemyData
const editorPetalShapesMap = {
	default: [[]] 
};

const editorEnemyShapesMap = {
	default: [[]] //['beginPath'], ['setFillStyle', 'white'], ['setStrokeStyle', 'black'], ['arc', 0, 0, 1, 0, Math.PI * 2], ['fill'], ['stroke']
};

function getCustomPetalTypes(){
	return Object.keys(editorPetalShapesMap);
}

function getCustomEnemyTypes(){
	return Object.keys(editorEnemyShapesMap);
}

let toResetFadeState;
function renderHpBar({x,y,radius,hp,maxHp,beforeStreakHp,givenAlpha,flowerName,flowerUsername,shield,team},entity={fadeState: undefined, fadeTime: 0, lastHp: hp}){
	// fadeout
	// TODO: define these params on the entities
	if(entity.fadeState === undefined){
		if(Math.ceil(entity.hp) === maxHp && !shield){
			entity.fadeState = 'invisible';
			entity.fadeTime = -220;
		} else {
			entity.fadeTime = time;
			entity.fadeState = 'fadeIn';
		}
	}
	if(entity.lastHp === undefined){
		entity.lastHp = entity.hp;
	}
	if(entity.lastShield === undefined){
		entity.lastShield = entity.shield;
	}

	let fadeAlphaMult = 1;

	// setting fadeState
	if(entity.dead !== true){
		// if(entity.petals !== undefined)console.log(entity.hp, entity.lastHp);
		if(Math.ceil(entity.lastHp) < maxHp && Math.ceil(entity.hp) === maxHp && entity.shield == 0){
			entity.fadeTime = time;
			entity.fadeState = 'fadeOut';
		} else if((Math.ceil(entity.lastHp) === maxHp && Math.ceil(entity.hp) < maxHp) || (entity.shield != 0 && entity.lastShield == 0)){
			entity.fadeTime = time;
			entity.fadeState = 'fadeIn';
		}
	}
	entity.lastShield = entity.shield;
	entity.lastHp = entity.hp;

	toResetFadeState = false;
	if (givenAlpha){
		if (givenAlpha > 0){
			toResetFadeState = entity.fadeState;
			entity.fadeState = "visible";
		}
	}
	if(entity.fadeState === 'fadeOut'){
		fadeAlphaMult = 1 - (time - entity.fadeTime) / 180;
		// if(entity.petals !== undefined){console.log((time - entity.fadeTime)/4000);}
		if(fadeAlphaMult < 0){
			fadeAlphaMult = 0;
			entity.fadeState = 'invisible';
		}
	} else if(entity.fadeState === 'fadeIn'){
		fadeAlphaMult = (time - entity.fadeTime) / 180;
		if(fadeAlphaMult > 1){
			fadeAlphaMult = 1;
			entity.fadeState = 'visible';
		}
	} else if(entity.fadeState === 'invisible' && !flowerName){
		return;
	}

	if(entity.dead === true)fadeAlphaMult *= ((10 - entity.deadAnimationTimer) / 166) ** 3;

	// if(entity.fadeInTimer === undefined){
	// 	// if we are above maxHp then fade out.
	// 	if(hp >= maxHp){
	// 		entity.fadeOutTimer = time;
	// 	}
	// } else {// fade out is in progress
	// 	fadeAlphaMult = (time - entity.fadeInTimer) / 400;
	// 	// if we're done then say so.
	// 	if(time - entity.fadeInTimer > 400){
	// 		entity.fadeInTimer = 'completed';
	// 	}
	// }
	if (givenAlpha){
		fadeAlphaMult = givenAlpha;
		// console.log(givenAlpha)
	}
	const barDimensions = {
		w: (radius/25)**1.2*25*3.2+.33,
		h: (radius/25)**1.2*25*0.39+.33,
		borderRadius: (radius/25)**1.2*25*0.25,
		innerPadding: (radius/25)**1.05*1.8-.1
	}
	ctx.globalAlpha = fadeAlphaMult;
    hp = Math.max(hp, 0);
    beforeStreakHp = Math.max(beforeStreakHp, 0);
    ctx.fillStyle = /*isEnemy ? '#131315' : */'#333333';
    ctx.beginPath();
    ctx.roundRect(x - barDimensions.w/2, y + radius*1.775, barDimensions.w, barDimensions.h, barDimensions.borderRadius);
    ctx.fill();
    ctx.closePath();

	if(flowerName !== undefined && entity.id !== window.selfId){
		
		ctx.globalAlpha = 1;
		ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2.25;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `900 22px Ubuntu`;// rendering name
			if (window.usernames === true) {
				ctx.strokeText(flowerName, x, y - radius * 2.75 + barDimensions.h + 2);
				ctx.fillText(flowerName, x, y - radius * 2.75 + barDimensions.h + 2);
				ctx.font = `900 10px Ubuntu`;// rendering username
				ctx.fillStyle = '#bbbbbb';
				ctx.strokeText(flowerUsername, x, y - radius * 2 + barDimensions.h + 2);
				ctx.fillText(flowerUsername, x, y - radius * 2 + barDimensions.h + 2);
		} else {
				ctx.strokeText(flowerName, x, y - radius * 2.375 + barDimensions.h + 2);
				ctx.fillText(flowerName, x, y - radius * 2.375 + barDimensions.h + 2);
		}
	}

    if(beforeStreakHp < maxHp / 10){
        ctx.globalAlpha = Math.max(0,hp * .95 / (maxHp / 10) + 0.05) * fadeAlphaMult;
    }
    // // red stuff
	// ctx.globalAlpha *= 0.9;
	if(beforeStreakHp > 0){
		ctx.fillStyle = '#dd3434'//'#ff0000'
		ctx.beginPath();
		const paddingMult = 1.4;
		ctx.roundRect(x - barDimensions.w/2 + barDimensions.innerPadding * paddingMult, y + radius*1.775 + barDimensions.innerPadding * paddingMult, (barDimensions.w - barDimensions.borderRadius * 1.5) * Math.min(1,beforeStreakHp / maxHp) + barDimensions.borderRadius * 1.5 - barDimensions.innerPadding * 2 * paddingMult, barDimensions.h - barDimensions.innerPadding * paddingMult * 2, barDimensions.borderRadius * barDimensions.h / (barDimensions.h + barDimensions.innerPadding * 2));
		ctx.fill();
		ctx.closePath();
	}
    

    ctx.globalAlpha = fadeAlphaMult;
    if(hp < maxHp / 10){
        ctx.globalAlpha = Math.max(0,hp * .95 / (maxHp / 10) + 0.05) * fadeAlphaMult;
    }

	if(hp > 0){
		// green "normal" part of the hp bar
		ctx.fillStyle = /*isEnemy ? '#6df12b' : */'#75dd34'
		if (team == "flower"){
			ctx.fillStyle = "#b5aa31"
		}
		ctx.beginPath();
		
		ctx.roundRect(x - barDimensions.w/2 + barDimensions.innerPadding, y + radius*1.775 + barDimensions.innerPadding, (barDimensions.w - barDimensions.borderRadius * 1.5) * Math.min(1, hp / maxHp) + barDimensions.borderRadius * 1.5 - barDimensions.innerPadding * 2, barDimensions.h - barDimensions.innerPadding * 2, barDimensions.borderRadius * barDimensions.h / (barDimensions.h + barDimensions.innerPadding * 2));
		ctx.fill();
		ctx.closePath();
	}
	if (shield){
		if (shield > maxHp * 0.005){
			ctx.fillStyle = /*isEnemy ? '#6df12b' : */'white'
			ctx.beginPath();
			
			ctx.roundRect(x - barDimensions.w/2 + barDimensions.innerPadding, y + radius*1.805 + barDimensions.innerPadding, (barDimensions.w - barDimensions.borderRadius * 1.5) * Math.min(1, shield / maxHp) + barDimensions.borderRadius * 1.5 - barDimensions.innerPadding * 2, barDimensions.h - barDimensions.innerPadding * 3, barDimensions.borderRadius * barDimensions.h / (barDimensions.h + barDimensions.innerPadding * 3));
			ctx.fill();
			ctx.closePath();
		}
	}

	ctx.globalAlpha = 1;

	if(toResetFadeState !== false){
		entity.fadeState = toResetFadeState;
	}
}

const Colors = {
	rarities: [
		{ // 0
			name: "Common",
			color: "#7eef6d",
			border: "#66c258"
		},
		{ // 1
			name: "Unusual",
			color: "#ffe65d",
			border: "#cfba4b"
		},
		{ // 2
			name: "Rare",
			color: "#4d52e3",
			border: "#3e42b8"
		},
		{ // 3
			name: "Epic",
			color: "#861fde",
			border: "#6d19b4"
		},
		{ // 4
			name: "Legendary",
			color: "#de1f1f",
			border: "#b41919"
		},
		{ // 5
			name: "Mythic",
			color: "#1fdbde",
			border: "#19b1b4"
		},
		{ // 6
			name: "Ultra",
			color: "#ff2b75",
			border: "#cf235f"
		},
		{ // 7
			name: "Super",
			color: "#2bffa3",
			border: "#23cf84"
		},
		//Unobtainable
		{ // 8
			name: "Omega",
			color: "#494849",//"#e3b62d",//"#f07a16",
			border: '#3b3a3b' //"#3c3b40"//'#b59122'//"#d96e14"
		},
		{ // 9
			name: "Fabled",
			color: "#ff5500",
			border: "#cf4500"
		},
		{ // 10
			name: "Divine",
			color: "#67549c",
			border: "#53447e",
			fancy: { 
				border: "#53447e",
				hue: 256,
				light: 47,
				sat: 30,
				spread: 20,
				period: 1.5,
			}
		},
		{ // 11
			name: "Supreme",
			color: "#b25dd9",
			border: '#904bb0', //"#9043b3"
			fancy: { 
				border: "#904bb0",
				hue: 281,
				light: 61,
				sat: 62,
				spread: 12,
				period: 2,
				stars: 1
			}
		},
		{ // 12
			name: "Omnipotent",
			color: "#5e004f",
			border: "#000000",
			fancy: { 
				border: "#151515", //border color
				hue: 285, //(average) hue of gradient, 0->360
				light: 20, //value/lightness of gradient
				sat: 100, //saturation of gradient
				spread: 35, //how much the hue varies
				period: 1.5, //how wide the gradient is
				stars: 2
			}
		},
		{ // 13
			name: "Astral",
			color: "#046307",
			border: "#035005",
			fancy: { 
				border: "#035005", 
				hue: 122,
				light: 25,
				sat: 100,
				spread: 60,
				period: 1.5,
				stars: 2
			}
		},
		{ // 14
			name: "Celestial",
			color: "#00bfff",
			border: "#009bcf",
			fancy: { 
				border: "#007baf", 
				hue: 195,
				light: 50,
				sat: 100,
				spread: 10,
				period: 1.5,
				stars: 2
			}
		},
		{ // 15
			name: "Seraphic",
			color: "#c77e5b",
			border: '#a16649',
			fancy: { 
				border: "#a16649", 
				hue: 19,
				light: 57,
				sat: 49,
				spread: 15,
				period: 1.5,
				stars: 2
			}
		},
		{ // 16
			name: "Transcendent",
			color: "#ffffff",
			border: "#cfcfcf",
			fancy: { 
				border: "#cfcfcf", 
				hue: 180,
				light: 93,
				sat: 100,
				spread: 80,
				period: 1.5,
				stars: 2
			}
		},
		{ // 17
			name: "Ethereal",
			color: "#61ffdd",
			border: "#4ecfb3",
			fancy: { 
				border: "#4ecfb3", 
				hue: 167,
				light: 69,
				sat: 100,
				spread: 30,
				period: 1,
				stars: 2
			}
		},
		{ // 18
			name: "Galactic",
			color: "#7f0226",
			border: "#974d63",
			fancy: { 
				border: "#974d63", 
				hue: 343,
				light: 26,
				sat: 97,
				spread: 20,
				period: 0.75,
				stars: 2
			}
		},
		{ // 19
			name: "Eternal",
			color: "#146636",
			border: "#0b3b1f",
			fancy: { 
				border: "#0b3b1f", 
				hue: 145,
				light: 40,
				sat: 90,
				spread: 30,
				period: 0.75,
				stars: 2
			}
		},
		{ // 20
			name: "Apotheotic",
			color: "#b3ab56",
			border: "#5e4b2c",
			fancy: { 
				border: "#5e4b2c", 
				hue: 55,
				light: 40,
				sat: 70,
				spread: 35,
				period: 0.75,
				stars: 2
			}
		},
		{ // 21
			name: "Voidbound",
			color: "#250a3d",
			border: "#3c1263",
			fancy: { 
				border: "#3c1263", 
				hue: 271,
				light: 40,
				sat: 75,
				spread: 35,
				period: 0.75,
				stars: 2
			}
		},
		{ // 22
			name: "Exalted",
			color: "#18608c",
			border: "#3c1157",
			fancy: { 
				border: "#3c1157", 
				hue: 203,
				light: 35,
				sat: 72,
				spread: 35,
				period: 0.75,
				stars: 2
			}
		},
		{ // 23
			name: "Chaos",
			color: "#20258a",
			border: "#161a61",
			fancy: { 
				border: "#161a61", 
				hue: 237,
				light: 15,
				sat: 62,
				spread: 30,
				period: 0.5,
				stars: 2
			}
		},
		{ // 24
			name: "Cataclysmic",
			color: "#940909",
			border: '#660606',
			fancy: { 
				border: "#660606", 
				hue: 0,
				light: 30,
				sat: 90,
				spread: 20,
				period: 0.75,
				stars: 2
			}
		},
		{ // 18
			name: "Nullborne",
			color: "#333333",
			border: "#666666",
			fancy: { 
				border: "#666666", 
				hue: 313,
				light: 26,
				sat: 15,
				spread: 200,
				period: 0.75,
				stars: 3
			}
		},

		//These rarities exist to prevent client-side crashing on some petals
		{ // 26
			name: "General",
			color: "#123456",
			border: '#234567',
		},
		{ // 27
			name: "Florr-discussion",
			color: "#593849",
			border: '#192385',
		},
		{ // 28
			name: "Square Victory!",
			color: "#958349",
			border: '#129348',
		},
		
	],
	mana: {
		grace: "#db81da",
		time: "#2cc6d4",
		divergence: "#7123b9"
	},
	biomes: {
		"garden": {
			background: "#1ea761",
			grid: "#1d9157"
		},
		"desert": {
			background: "#dece7b",
			grid: "#a1955a"
		},
		"ocean": {
			background: "#547db3",
			grid: "#41608a"
		},
		"1v1": {
			background: "#40444b", //"#54675f",
			grid: "#292b2f" // "#46584f"
		},
		"zoo": {
			background: "#886d9c",
			grid: "#665175"
		},
		"swamp": {
			background: "#15692d",
			grid: "#115624"
		},
		"beach": {
			background: "#64c0d1",
			grid: "#529dab"
		},
		"savanna": {
			background: "#b19948",
			grid: "#917d3b"
		}
	}
}
//function to create the gradient for fancy colors
function createFancyGradient(gradientFill, rarity){

	let hue = Colors.rarities[rarity].fancy.hue ?? 0;
	let sat = Colors.rarities[rarity].fancy.sat ?? 100;
	let light = Colors.rarities[rarity].fancy.light ?? 100;
	let spread = Colors.rarities[rarity].fancy.spread ?? 30;
	let period = Colors.rarities[rarity].fancy.period ?? 1.5;
	//cos period is 2pi
	let stop = (Date.now()/3000)%period - period;
	let curoffset = 0;

	//always draw one at 0
	let zeropoint = (0 - stop)/(period/4); //theoretical loop point when stop = 0
	gradientFill.addColorStop(0, `hsl(${linearOscillate(zeropoint * Math.PI / 2)*spread + hue}, ${sat}%, ${light}%)`);

	//always draw one at 1
	let onepoint = (1 - stop)/(period/4); //theoretical loop point when stop = 0
	gradientFill.addColorStop(1, `hsl(${linearOscillate(onepoint * Math.PI / 2)*spread + hue}, ${sat}%, ${light}%)`);

	for(; stop < 1; stop+= period/4){
		//if < 0 don't draw
		if(stop > 0){
			gradientFill.addColorStop(stop, `hsl(${linearOscillate(curoffset)*spread + hue}, ${sat}%, ${light}%)`);
		}
		curoffset += (Math.PI/2);
	}
}
//period 2pi, (0->pi go up), (pi->2pi go down)
function linearOscillate(x){
	x = x% (Math.PI * 2);
	if(x < Math.PI) return ((2 * x / Math.PI) - 1);
	else return (3 - (2 * x / Math.PI));
}

const editorBaseStats = {
	enemies: {
		/*type: {
			...data like that in editorStats.js server side
		}*/
	},
	petals: {
		"default": {
			radius: 10,
			knockback: 0.1
		},
	},
	rarities: [{// NOTE: DO NOT CHANGE ANY OF THESE. THEY WERE SUPPOSED TO BE FINAL.
		// IF YOU DO CHANGE THEM PLEASE UPDATE THEM CLIENT SIDE SO THAT STATS ARE ACCURATE
		  name: "Common",
		  health: 1,
		  damage: 1, 
		  radius: 1, 
		  mass: 1,
		  petalDamage: 1,
		  petalHealth: 1,
		  petalHeal: 1,
		  petalMass: 1,
		  detectionDistance: 1,
		  xp: 1 
		}, {
		  name: "Unusual",
		  health: 2,
		  damage: 1.2,
		  radius: 1.1, 
		  mass: 1.52,
		  petalDamage: 1.4,
		  petalHealth: 1.2,
		  petalHeal: 1.51,
		  petalMass: 1.52,
		  detectionDistance: 1.1,
		  xp: 3
		}, {
		  name: "Rare",
		  health: 4,
		  damage: 1.5,
		  radius: 1.3, 
		  mass: 2.46,
		  petalDamage: 2,
		  petalHealth: 1.5,
		  petalHeal: 2.23,
		  petalMass: 2.46,
		  detectionDistance: 1.2,
		  xp: 9
		}, {
		  name: "Epic",
		  health: 8*1.72/1.6,
		  damage: 1.9,
		  radius: 1.72,//1.6, 
		  mass: 5.7,
		  petalDamage: 2.9,
		  petalHealth: 1.9,
		  petalHeal: 3.17,
		  petalMass: 5.7,
		  detectionDistance: 1.3,
		  xp: 27
		}, {
		  name: "Legendary",
		  health: 50,
		  damage: 2.7,
		  radius: 3, 
		  mass: 18.6, 
		  petalDamage: 4.8,
		  petalHealth: 2.7,
		  petalHeal: 4.94,
		  petalMass: 18.6,
		  detectionDistance: 1.7,
		  xp: 81
		}, {
		  name: "Mythic",
		  health: 110,
		  damage: 4.3,
		  radius: 5, 
		  mass: 43, 
		  petalDamage: 9.7,//9.1
		  petalHealth: 4.3,
		  petalHeal: 10.2,
		  petalMass: 43,
		  detectionDistance: 2.1,
		  xp: 243
		}, {
		  name: "Ultra",
		  health: 310,
		  damage: 8.6,
		  radius: 7, 
		  mass: 100,  
		  petalDamage: 23,//18.3
		  petalHealth: 8.6,
		  petalHeal: 21.45,
		  petalMass: 100,
		  detectionDistance: 2.5,
		  xp: 729
		}, {
		  name: "Super",
		  health: 1350,
		  damage: 17.2,
		  radius: 9.5, 
		  mass: 216,  
		  petalDamage: 90,
		  petalHealth: 17.2,
		  petalHeal: 40.3,
		  petalMass: 216,
		  detectionDistance: 2.5,
		  xp: 2187
		}, {
		  name: "Omega",
		  health: 4941,
		  damage: 34.4,
		  radius: 13, 
		  mass: 500,  
		  petalDamage: 315, 
		  petalHealth: 34.4,
		  petalHeal: 74,
		  petalMass: 480,
		  detectionDistance: 2.5,
		  xp: 6561
		}, {
		  name: "Fabled",
		  health: 18084,
		  damage: 68.8,
		  radius: 17.7, 
		  mass: 1250,  
		  petalDamage: 1100, 
		  petalHealth: 68.8,
		  petalHeal: 140.6,
		  petalMass: 1100,
		  detectionDistance: 2.5,
		  xp: 40000
		}, {
		  name: "Divine",
		  health: 66188,
		  damage: 137.6,
		  radius: 24.1, 
		  mass: 3125,  
		  petalDamage: 3850, 
		  petalHealth: 137.6,
		  petalHeal: 267.14,
		  petalMass: 2500,
		  detectionDistance: 2.5,
		  xp: 300000
		}, {
		  name: "Supreme",
		  health: 242247,
		  damage: 275.2,
		  radius: 33, 
		  mass: 9375,  
		  petalDamage: 13475, 
		  petalHealth: 275.2,
		  petalHeal: 507,
		  petalMass: 7000,
		  detectionDistance: 2.5,
		  xp: 3e6
		}, {
      name: "Omnipotent",
      health: 968988,
      damage: 550,
      radius: 45, 
      mass: 33750,  
      petalDamage: 47162.5, 
      petalHealth: 550,
      petalHeal: 963,
      petalMass: 21000,
      detectionDistance: 2.5,
      xp: 3e7
    }, {
      
      name: "Astral",
      health: 4844940,
      damage: 1100,
      radius: 62, 
      mass: 194400,  
      petalDamage: 208000, 
      petalHealth: 1650,
      petalHeal: 2500,
      petalMass: 85000,
      detectionDistance: 2.5,
      xp: 5e8
    }, {
      
      name: "Celestial",
      health: 9800000,
      damage: 1650,
      radius: 71, 
      mass: 388800,  
      petalDamage: 884000,
      petalHealth: 4950,
      petalHeal: 5750,
      petalMass: 340000,
      detectionDistance: 2.5,
      xp: 1e10
    }, {
      
      name: "Seraphic",
      health: 20000000,
      damage: 2475,
      radius: 81, 
      mass: 777600,  
      petalDamage: 3757000, 
      petalHealth: 14850,
      petalHeal: 14375,
      petalMass: 1020000,
      detectionDistance: 2.5,
      xp: 3e11
    }, {
      
      name: "Transcendent",
      health: 60000000,
      damage: 4950,
      radius: 103, 
      mass: 2300000,  
      petalDamage: 4860000, 
      petalHealth: 8800,
      petalHeal: 12543,
      petalMass: 1200000,
      detectionDistance: 3.25,
      xp: 9e12
    }, {
      
      name: "Ethereal",
      health: 120000000,
      damage: 7425,
      radius: 118, 
      mass: 4600000,  
      petalDamage: 14580000, 
      petalHealth: 17600,
      petalHeal: 23831,
      petalMass: 1200000,
      detectionDistance: 3.25,
      xp: 27e13
    }, {
      
      name: "Galactic",
      health: 360000000,
      damage: 14850,
      radius: 135, 
      mass: 13800000,
      petalDamage: 43740000, 
      petalHealth: 35200,
      petalHeal: 45279,
      petalMass: 2400000,
      detectionDistance: 3.25,
      xp: 81e14
    },
		{
			name: "Eternal",
      health: 720000000,
      damage: 21000,
      radius: 154, 
      mass: 27600000,
      petalDamage: 153090000, 
      petalHealth: 70400,
      petalHeal: 86030,
      petalMass: 4800000,
      detectionDistance: 3.25,
      xp: 243e15
    },
		{
			name: "Apotheotic",
      health: 1440000000,
      damage: 29700,
      radius: 175, 
      mass: 55200000,
      petalDamage: 535815000, 
      petalHealth: 140800,
      petalHeal: 160000,
      petalMass: 9600000,
      detectionDistance: 3.25,
      xp: 7e18
    },
		{
			name: "Voidbound",
      health: 4.32e9,
      damage: 59400,
      radius: 200, 
      mass: 1.6e8,
      petalDamage: 1.87e9, 
      petalHealth: 281600,
      petalHeal: 320000,
      petalMass: 19200000,
      detectionDistance: 3.25,
      xp: 2e20
    },
		{
			name: "Exalted",
      health: 8.64e9,
      damage: 89100 ,
      radius: 228, 
      mass: 3.2e8,
      petalDamage: 3.6e9, 
      petalHealth: 563200,
      petalHeal: 640000,
      petalMass: 38400000,
      detectionDistance: 3.25,
      xp: 6e21
    },
		{
			name: "Chaos",
      health: 1.728e10,
      damage: 133650,
      radius: 258, 
      mass: 6.4e8,
      petalDamage: 7.2e9, 
      petalHealth: 1126400,
      petalHeal: 1280000,
      petalMass: 76800000,
      detectionDistance: 3.25,
      xp: 18e22
    },
		{
			name: "Cataclysmic",
      health: 6e10,
      damage: 267300,
      radius: 295, 
      mass: 2e9,
      petalDamage: 14.4e9, 
      petalHealth: 2252800,
      petalHeal: 2560000,
      petalMass: 153600000,
      detectionDistance: 3.25,
      xp: 6e24
    },
		{
			name: "Nullborne",
      health: 18e10,
      damage: 534600,
      radius: 335, 
      mass: 6e9,
      petalDamage: 28.8e9, 
      petalHealth: 4505600,
      petalHeal: 5120000,
      petalMass: 460000000,
      detectionDistance: 3.5,
      xp: 1.8e26
    },
		
	
	  ]
}

const editorStats = {
	petals: {},
	enemies: {},
	rarities: {}
};
let AmountOfRarities = editorBaseStats.rarities.length;
function regenerateEditorStats(){
	editorStats.petals = {}; editorStats.enemies = {}; editorStats.rarities = {};
	if(window.petalData_ !== undefined){
		for(let key in Stats.petals){
			editorStats.petals[key] = Stats.petals[key];
		}
	}
	const BaseStats = editorBaseStats;
	for(let enemyName of Object.keys(BaseStats.enemies)){
		let enemyObject = BaseStats.enemies[enemyName];
		editorStats.enemies[enemyName] = {};
		for(let i = 0; i<AmountOfRarities; i++){
		  if (i == 0){
			editorStats.enemies[enemyName][i] = BaseStats.enemies[enemyName];
			if (BaseStats.enemies[enemyName].xp == undefined){
			  editorStats.enemies[enemyName][i].xp = Math.round(BaseStats.rarities[i].xp);
			}
		  }
		  else{
			let newRarityEnemyStats = {};
			newRarityEnemyStats = JSON.parse(JSON.stringify(editorStats.enemies[enemyName][i-1]));
			newRarityEnemyStats.health = Math.round(newRarityEnemyStats.health * BaseStats.rarities[i].health/BaseStats.rarities[i-1].health * 100)/100;
			newRarityEnemyStats.damage = Math.round(newRarityEnemyStats.damage * BaseStats.rarities[i].damage/BaseStats.rarities[i-1].damage * 100)/100;
			newRarityEnemyStats.radius = Math.round(newRarityEnemyStats.radius  * BaseStats.rarities[i].radius/BaseStats.rarities[i-1].radius * 100)/100;
			newRarityEnemyStats.xp = Math.round(newRarityEnemyStats.xp  * BaseStats.rarities[i].xp/BaseStats.rarities[i-1].xp * 100)/100;
				  newRarityEnemyStats.mass = Math.round(newRarityEnemyStats.mass * BaseStats.rarities[i].mass/BaseStats.rarities[i-1].mass * 100)/100;
				  newRarityEnemyStats.detectionDistance = Math.round(newRarityEnemyStats.detectionDistance * BaseStats.rarities[i].detectionDistance/BaseStats.rarities[i-1].detectionDistance * 100)/100;
			
			if (newRarityEnemyStats.poison){
			  newRarityEnemyStats.poison[0] = Math.round(newRarityEnemyStats.poison[0] * BaseStats.rarities[i].damage/BaseStats.rarities[i-1].damage * 100)/100;
			  newRarityEnemyStats.poison[1] = Math.round(newRarityEnemyStats.poison[1] * BaseStats.rarities[i].damage/BaseStats.rarities[i-1].damage * 100)/100;
			  
			}
			for(let j of Object.keys(editorStats.enemies[enemyName][i-1])){
			  if (BaseStats.enemies[enemyName]["override"] != undefined){
				if (BaseStats.enemies[enemyName]["override"][i] != undefined){
				  if (Object.keys(BaseStats.enemies[enemyName]['override'][i]).includes(j)){
					newRarityEnemyStats[j] = BaseStats.enemies[enemyName]["override"][i][j]
				  }
				}
			  }
			}
			editorStats.enemies[enemyName][i] = newRarityEnemyStats;
		  }
		}
		  let baseDrops = JSON.parse(JSON.stringify(BaseStats.enemies[enemyName].drops));
		  for(let i of Object.keys(baseDrops)){
			  let newDrops = calculateDrops(baseDrops[i][0], baseDrops[i][1], baseDrops[i][2]);
			  for(let j of Object.keys(editorStats.enemies[enemyName])){
				  if(newDrops[j] !== undefined) editorStats.enemies[enemyName][j].drops[i] = newDrops[j];
				  else editorStats.enemies[enemyName][j].drops[i] = {};
			  }
		  }
		  BaseStats.enemies[enemyName].drops = window.structuredClone(baseDrops);
	  }
	  
	  
	  for (let petalName of Object.keys(BaseStats.petals)) {
		if (petalName != "default") {
		  let petalObject = BaseStats.petals[petalName];
		  editorStats.petals[petalName] = {};
		  for (let i = 0; i < AmountOfRarities; i++) {
			if (i == 0) {
			  editorStats.petals[petalName][i] = JSON.parse(JSON.stringify(BaseStats.petals['default']));
			  for (let j of Object.keys(petalObject)) {
				editorStats.petals[petalName][i][j] = petalObject[j];
			  }
			} else {
			  let damageMultiplier = BaseStats.rarities[i].petalDamage / BaseStats.rarities[i - 1].petalDamage
			  let healthMultiplier = BaseStats.rarities[i].petalHealth / BaseStats.rarities[i - 1].petalHealth
			  let healMultiplier = BaseStats.rarities[i].petalHeal / BaseStats.rarities[i - 1].petalHeal
	  
	  
			  let newRarityPetalStats = {};
	  
		
			  
			  for (let j of Object.keys(editorStats.petals[petalName][i - 1])) {
				let scaler = false;
	  
				if (petalObject.damageScalers.includes(j)) {
				  scaler = true;
				  newRarityPetalStats[j] = Math.round(editorStats.petals[petalName][i - 1][j] * damageMultiplier * 100) / 100;
				} else if (petalObject.healthScalers.includes(j)) {
				  scaler = true;
				  newRarityPetalStats[j] = Math.round(editorStats.petals[petalName][i - 1][j] * healthMultiplier * 100) / 100;
				} else if (petalObject.healScalers){
				  if (petalObject.healScalers.includes(j)){
					scaler = true;
					newRarityPetalStats[j] = Math.round(editorStats.petals[petalName][i - 1][j] * healMultiplier * 100) / 100;
				  }
				}
				if (j == "poison") {
				  newRarityPetalStats.poison = [];
				  newRarityPetalStats.poison[0] = Math.round(editorStats.petals[petalName][i - 1].poison[0] * damageMultiplier * 100) / 100;
				  newRarityPetalStats.poison[1] = Math.round(editorStats.petals[petalName][i - 1].poison[1] * damageMultiplier * 100) / 100;
				} else if (!scaler){
				  newRarityPetalStats[j] = editorStats.petals[petalName][i - 1][j];
				}
				if (petalObject["override"] != undefined){
				  if (petalObject["override"][i] != undefined) {
					if (Object.keys(petalObject["override"][i]).includes(j)) {
					  if (petalObject.damageScalers.includes(j) || petalObject.healthScalers.includes(j)){
						newRarityPetalStats[j] *= petalObject["override"][i][j];
					  }
					  else{
						newRarityPetalStats[j] = petalObject["override"][i][j];
					  }
					}
				  }
				}
			  }
			  editorStats.petals[petalName][i] = newRarityPetalStats;
			}
		  }
		}
		if (BaseStats.petals[petalName].slowdown){
		  	let slowdown = JSON.parse(JSON.stringify(BaseStats.petals[petalName].slowdown));
			  let balancedSlowdown = getSlowdown(slowdown);
			  for(let j of Object.keys(editorStats.petals[petalName])){
				editorStats.petals[petalName][j].slowdown = balancedSlowdown[j];
			}
		}
	}
}

// function calculateDrops(n, minDrop) {
// 	const mobS = [/*c*/355000,/*un*/71500,/*r*/10000,/*e*/950,/*l*/150,/*m*/8,/*u*/1.1,/*s*/0.06, /*h*/0.02, /*o*/0.0015];
// 	const logDrops = [0, -2.2,-4.7,-7.9,/*l*/-10.4,-14.5, -18, -24]
// 	const dropS = [];
	
// 	for(let i = 0; i < logDrops.length; i++){
// 	  if (i == 0){
// 		dropS.push(0);
// 	  }
// 	  else{
// 		dropS.push(1-Math.pow(Math.E, logDrops[i]))
// 	  }
// 	}
	
// 	const ret = new Array(10).fill(0).map(_ => new Array(8).fill(0));
// 	for (let mob = 0; mob < 10; ++mob) {
// 	  let cap = mob ? mob: 0;
// 	  if (mob > 4){
// 		cap = mob - 1;
// 	  }
// 	  if (mob > 6){
// 		cap = mob - 2;
// 	  }
// 	  for (let drop = 0; drop <= cap; ++drop) {
// 		if (drop > 7) break;
// 		if (drop < minDrop) continue;
// 		let start = dropS[drop], end = dropS[drop+1];
// 		if (drop === cap) end = 1;
// 		const ret1 = Math.pow(n*start+(1-n),300000/mobS[mob]);
// 		const ret2 = Math.pow(n*end+(1-n),300000/mobS[mob]);
// 		ret[mob][drop] = parseFloat((100*(ret2-ret1)).toFixed(2));
// 	  }
// 	}
// 	return ret;
//   }
function calculateDrops(n, minDrop, minRarityDrop) {
	if (!minRarityDrop){
		minRarityDrop = 0;
	}
  /*
  //Before 11/29/2023
  
  const mobS = [355000,71500,10000,950,150,8,1.1,0.06, 0.02, 0.0015];
  const logDrops = [0, -2.2,-4.7,-7.9,-10.4,-14.5, -18, -24]
  const dropS = [];
  
  for(let i = 0; i < logDrops.length; i++){
    if (i == 0){
      dropS.push(0);
    }
    else{
      dropS.push(1-Math.pow(Math.E, logDrops[i]))
    }
  }
  
  const ret = new Array(10).fill(0).map(_ => new Array(8).fill(0));
  for (let mob = 0; mob < 10; ++mob) {
    let cap = mob ? mob: 0;
    if (mob > 4){
      cap = mob - 1;
    }
    if (mob > 6){
      cap = mob - 2;
    }
    for (let drop = 0; drop <= cap; ++drop) {
      if (drop > 7) break;
      if (drop < minDrop) continue;
      let start = dropS[drop], end = dropS[drop+1];
      if (drop === cap) end = 1;
      const ret1 = Math.pow(n*start+(1-n),300000/mobS[mob]);
      const ret2 = Math.pow(n*end+(1-n),300000/mobS[mob]);
      ret[mob][drop] = parseFloat((100*(ret2-ret1)).toFixed(2));
    }
  }
  return ret;
  */

  /*
  //Outdated as of ocean release:
  const mobS = [355000,71500,10000,950,150,7,0.7,0.04, 0.0007, 0.0001, 0.00001, 0.00000015, 0.00000002, 0.000000003];
  const logDrops = [0, -2.2,-4.7,-7.9,-10.4,-14.4, -18.8, -22.5, -27, -31.5, -35, -39.5, -44]
  const dropS = [];

  for(let i = 0; i < logDrops.length; i++){
    if (i == 0){
      dropS.push(0);
    }
    else{
      dropS.push(1-Math.pow(Math.E, logDrops[i]))
    }
  }

  const ret = new Array(14).fill(0).map(_ => new Array(12).fill(0));
  for (let mob = 0; mob < 14; ++mob) {
    let cap = mob ? mob: 0;
    if (mob > 4){
      cap = mob - 1;
    }
    if (mob > 7){
      cap = mob - 2;
    }
    if (mob > 10){
      cap = mob - 3;
    }

    for (let drop = 0; drop <= cap; ++drop) {
      if (drop > 13) break;
      if (drop < minDrop) continue;
      let start = dropS[drop], end = dropS[drop+1];
      if (drop === cap) end = 1;
      const ret1 = Math.pow(n*start+(1-n),300000/mobS[mob]);
      const ret2 = Math.pow(n*end+(1-n),300000/mobS[mob]);
      ret[mob][drop] = parseFloat((100*(ret2-ret1)).toFixed(2));
    }
  }
  return ret;
  */


  const mobS = [[/*c*/355000,/*un*/71500,/*r*/10000,/*e*/950,/*l*/150,/*m*/7,/*u*/0.7,/*s*/0.022, /*o*/0.00029, /*f*/0.000002], [/*d*/542, /*s*/70, /*o*/9, /*a*/1, /*c*/0.27, /*s*/0.1, /*trans*/0.0045, /*q*/0.0012, /*g*/0.000022, /*e*/0.0000012, /*apo*/0.0000002, /*void*/0.00000005, /*exalted*/0.000000007]];
  const logDrops = [[0, -2.2, -4.7, -7.9,/*l*/-10.4, -14.4, -18.9, -24.1, /*o*/-30.1], [0, -2.5, -5, -7.5, -10, -12.5, /*omni drops*/-17.5, -20.9, -26, -32, -38, -43]]

  const dropS = [[], []];

  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < logDrops[j].length; i++) {

      if (i == 0) {
        dropS[j].push(0);
      }
      else {
        dropS[j].push(1 - Math.pow(Math.E, logDrops[j][i]))
      }
    }
  }

  const ret = new Array(23).fill(0).map(_ => new Array(14).fill(0));
  for (let mob = 0; mob < 23; ++mob) {
    let cap = mob ? mob : 0;
    if (mob > 4) {
      cap = mob - 1;
    }
    if (mob > 8) {
      cap = mob - 2;
    }
		if (mob > 14){
			cap = mob - 3;
		}
		if (mob > 16){
			cap = mob - 4;
		}
		if (mob > 19){
			cap = mob - 5;
		}
		if (mob > 21){
			cap = mob - 6;
		}

    let dropTable = 0;
    let mobShift = 0;
    let dropShift = 0;
    if (mob > 9){
      dropTable = 1;
      mobShift = 10;
      dropShift = 6;
      cap -= dropShift;
    }

    for (let drop = 0; drop <= cap; ++drop) {
      if (drop > 20) break;
      if (drop+dropShift < minDrop) continue;
      let start = dropS[dropTable][drop], end = dropS[dropTable][drop + 1];
      if (drop === cap) end = 1;
      const ret1 = Math.pow(n * start + (1 - n), 300000 / mobS[dropTable][mob-mobShift]);
      const ret2 = Math.pow(n * end + (1 - n), 300000 / mobS[dropTable][mob-mobShift]);
			if (mob >= minRarityDrop){
      	ret[mob][drop+dropShift] = parseFloat((100 * (ret2 - ret1)).toFixed(3));
			}
    }
  }
  return ret;
}

function getSlowdown(n) {
	const mobS = [/*c*/90000,/*un*/25000,/*r*/6450,/*e*/2162,/*l*/590,/*m*/97,/*u*/16,/*s*/1.6];
	const logDrops = [0, -1.5,-3.1,-4.7,/*l*/-7,-9.4, -11.7, -13.7]
	const dropS = [];
	
	for(let i = 0; i < logDrops.length; i++){
	  if (i == 0){
		dropS.push(0);
	  }
	  else{
		dropS.push(1-Math.pow(Math.E, logDrops[i]))
	  }
	}
	
	const ret = new Array(8).fill(0).map(_ => new Array(8).fill(0));
	for (let mob = 0; mob < 8; ++mob) {
	  let percent = 100;
	  for (let drop = 0; drop <= 7; ++drop) {
		if (drop > 7) break;
		let start = dropS[drop], end = dropS[drop+1];
		if (drop === 7) end = 1;
		const ret1 = Math.pow(n*start+(1-n),300000/mobS[mob]);
		const ret2 = Math.pow(n*end+(1-n),300000/mobS[mob]);
		ret[mob][drop] = Math.max((percent*n).toFixed(2), 0);
		percent -= (100*(ret2-ret1));
	  }
	  if (ret[mob][7] >= 0 && mob < 3){
		let reduce = ret[mob][7];
		for(let drop = 0; drop <= 7; ++drop){
		  ret[mob][drop] -= reduce;
		  ret[mob][drop] = Math.max((ret[mob][drop]).toFixed(2), 0);
		}
	  }
	}
  
	ret[8] = [90, 90, 90, 90, 90, 90, 90, 90];
  
	for(let i of ret){
	  i.push(0);
	}
  
	return ret;
}

Enemy.prototype.changeState = function(s){
    changeState(this, s);
}
