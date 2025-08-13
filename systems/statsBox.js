// in addition to Stats, we cache another modified version of stats for the permutation of pvp, tanksmith, and anything else 
let cachedStats = undefined;
let cachedState = ['please regen', false]; // is1v1, isTs

function generateCachedStats(is1v1, isTs){
    cachedState[0] = is1v1;
    cachedState[1] = isTs;

    // in pvp we modify rarity numbers for custom balance.
    var oldRarityStats = Stats.rarities;
    if (is1v1){
        Stats.rarities = [Stats.rarities[0]];
        for(let i = 1; i < oldRarityStats.length; i++){
            Stats.rarities[i] = {}
            for(let key in oldRarityStats[i]){
                Stats.rarities[i][key] = Stats.rarities[i-1][key] * 1.15;
            }
            Stats.rarities[i].name = oldRarityStats[i].name;
        }

        BaseStats.rarities = Stats.rarities;
    }

    // actually calculate the stats
    window.calculateStats(is1v1, isTs);

    // clone the stats and store them in our cache
    cachedStats = structuredClone({petals: Stats.petals, enemies: Stats.enemies});

    // reset
    Stats.rarities = BaseStats.rarities = oldRarityStats;

    // recalculate the old stats
    window.calculateStats(false);
}

class StatsBox {
    constructor(fields=[{}], {x, y, w, h}, regenData){
        this.fields = fields;

        this.x = x;
        this.y = y;
        this.w = w;

        if(h === undefined){
            this.h = 1000;
            ctx.globalAlpha = 0;
            this.draw();
            this.h = this.currentHeight + 10;
            ctx.globalAlpha = 1;
        } else {
            this.h = h;
        }
        
        this.pc = {};

        // this.is1v1Stats = false;//biomeManager !== undefined && biomeManager.getCurrentBiome() === '1v1';

        // this is the initial petal stats and source of truth
        this.regenData = regenData;

        // we need to regenerate stats if either one of these doesn't match current state
        this.lgState = {'1v1': -1, 'ts': false};

        this.isTanksmith = false;
    }
    draw(){
        // we can do a tanksmithPvpOverride later (should be as easy as copypasting things). For now here's tanksmith stats w/o 1v1 working prop
        // const selectedTanksmith = characterSelector.selectedIndex == "1" ? true : false; 
        // if(selectedTanksmith !== this.isTanksmith){
        //     const newIsTanksmith = this.isTanksmith = !this.isTanksmith;
        //     if(newIsTanksmith === true){

        //     }
        // }

        const is1v1 = (biomeManager !== undefined && biomeManager.getCurrentBiome() === '1v1');
        const isTs = (window.characterSelector !== undefined && window.characterSelector.selectedIndex == "1");

        if(this.regenData !== undefined && (this.lgState['1v1'] !== is1v1 || this.lgState.ts !== isTs)){
            if(cachedState[0] !== is1v1 || cachedState[1] !== isTs){
                generateCachedStats(is1v1, isTs);
            }

            const petalExists = cachedStats.petals[this.regenData[0].type] !== undefined;
            const enemyExists = cachedStats.enemies[this.regenData[0].type] !== undefined;

            if(this.regenData[0] !== undefined && (petalExists || enemyExists)) {

                if(petalExists && this.regenData[1] === true) this.regenData[0].petalStats = cachedStats.petals[this.regenData[0].type][this.regenData[0].rarity];
                else this.regenData[0].petalStats = cachedStats.enemies[this.regenData[0].type][this.regenData[0].rarity];

                this.regenData[0].petalStats = structuredClone(this.regenData[0].petalStats);

                const petalStats = this.regenData[0].petalStats;
                delete petalStats.override;
                delete petalStats.pvpOverride;
                
                delete petalStats.petalLayout;
                delete petalStats.damageScalers;
                delete petalStats.massScalers;
                delete petalStats.healthScalers;
                delete petalStats.healScalers;
                delete petalStats.stickParentRotation;
                delete petalStats.attackDistanceMult;
                delete petalStats.defendDistanceMult;
                delete petalStats.neutralDistanceMult;
                delete petalStats.radius;
                //delete petalStats.spawnSystem;
                delete petalStats.petalType;
                delete petalStats.killOnShoot;
                delete petalStats.homingCorrection;
                delete petalStats.killOnSummon;
                delete petalStats.raritiesBelow;
                delete petalStats.killPetsOnDie;
                delete petalStats.customBiome;
                delete petalStats.poisonDamage;
                delete petalStats.poisonTime;
                delete petalStats.boss;
                delete petalStats.bossOverride;
                delete petalStats.projectileEnabled;
                delete petalStats.summonEnabled;
                delete petalStats.codeEnabled;
                delete petalStats.code;
                delete petalStats.variableCode;
                delete petalStats.collideOtherEnemies

                delete petalStats.detectionDistance;
                delete petalStats.personality;
                if(petalStats.knockback === 0.1) delete petalStats.knockback;

                delete petalStats.tsPetalOverride;
                delete petalStats.tsBarrelData;

                if(isTs){
                    // giving the tanksmith stats better names
                    if(petalStats.tsShootSpeedBuff !== undefined){
                        petalStats.shootCooldownBuff = petalStats.tsShootSpeedBuff;
                    }
                    // if(petalStats.tsProjectileSpeed !== undefined){
                    //     petalStats.projectileSpeed = petalStats.tsProjectileSpeed;
                    // }
                    // if(petalStats.tsProjectileLifetime !== undefined){
                    //     petalStats.projectileLifetime = petalStats.tsProjectileLifetime;
                    // }
                    // if(petalStats.tanksmithHp !== undefined){
                    //     petalStats.tanksmithBaseHealth = petalStats.tanksmithHp;
                    // }
                    // if(petalStats.tanksmithRadius !== undefined){
                    //     petalStats.tanksmithBaseRadius = petalStats.tanksmithRadius;
                    // }

                    if(petalStats.tanksmithCooldown !== undefined){
                        petalStats.tanksmithRechargeTime = petalStats.tanksmithCooldown/30;
                    }

                    if(petalStats.tsProjectileSpeedBuff !== undefined){
                        petalStats.projectileSpeedBuff = petalStats.tsProjectileSpeedBuff;
                    }

                    if(petalStats.tanksmithShootCooldown !== undefined) {
                        petalStats.shootCooldown = petalStats.tanksmithShootCooldown/30;
                    } 


                    // tanksmithRadius: 100,
                    // tanksmithShootCooldown: 100,
                    // tanksmithCooldown: 0.1,
                    // tanksmithHp: 1,
                    // tanksmithBarrelNum: 3,

                    delete petalStats.reload;
                } else {
                    delete petalStats.tanksmithRadius;
                    delete petalStats.tanksmithHp;
                    delete petalStats.tanksmithPassiveHealing;
                }

                delete petalStats.tsShootSpeedBuff;
                delete petalStats.tsProjectileSpeedBuff;
                delete petalStats.tsProjectileSpeed;
                delete petalStats.tsProjectileLifetime;
                delete petalStats.tanksmithBarrelNum;
                // delete petalStats.tanksmithHp;
                delete petalStats.tanksmithCooldown;
                delete petalStats.tanksmithShootCooldown;
                delete petalStats.tanksmithBodyDamage;
            }
            this.regenData[0].is1v1Stats = this.is1v1Stats;
            const statsBox = generateStatsBox(...this.regenData);
            for(let key in statsBox){
                this[key] = statsBox[key];
            }

            this.shouldRegenPC = true;
            this.lgState['1v1'] = is1v1;
            this.lgState['ts'] = isTs;
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fontKerning = "none";
        ctx.letterSpacing = "-.1px";
        ctx.font = '900 16px Ubuntu';
        ctx.translate(this.x, this.y);

        this.drawBackground();

        this.currentHeight = 0;
        for(let i = 0; i < this.fields.length; i++){
            this.drawField(this.fields[i]);
        }

        ctx.translate(-this.x, -this.y);
    }
    drawBackground(){
        const lastGA = ctx.globalAlpha;
        ctx.globalAlpha *= 0.55;
        ctx.fillStyle = 'black';

        ctx.beginPath();
        ctx.roundRect(0, 0, this.w, this.h, 6);
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha = lastGA;
    }
    drawField(field){
        if(this['draw' + field.type] === undefined) return; 
        this['draw' + field.type](field);
    }
    drawTitle(field){
        ctx.font = '900 28px Ubuntu';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;

        ctx.strokeText(field.value, 16, this.currentHeight + 28);
        ctx.fillText(field.value, 16, this.currentHeight + 28);
        
        this.currentHeight += 40;
    }
    drawMargin(field){
        this.currentHeight += field.value;
    }
    drawRarity(field){
        ctx.font = '900 16px Ubuntu';
        ctx.fillStyle = Colors.rarities[field.value].color;
        ctx.strokeStyle = 'black';//rarityToColor[field.value].border;
        ctx.lineWidth = 2;

        ctx.strokeText(Colors.rarities[field.value].name, 16, this.currentHeight + 20); 
        ctx.fillText(Colors.rarities[field.value].name, 16, this.currentHeight + 20); 

        this.currentHeight += 40;
    }
    drawDescription(field){
        ctx.font = '900 14px Ubuntu';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        const wrappedText = wrapText(field.value, 16, this.currentHeight + 10, this.w - 20 - 10, 15);
        for(let i = 0; i < wrappedText.length; i++){
            ctx.strokeText(wrappedText[i][0], wrappedText[i][1], wrappedText[i][2]); 
            ctx.fillText(wrappedText[i][0], wrappedText[i][1], wrappedText[i][2]); 
        }
        this.currentHeight = wrappedText[wrappedText.length-1][2] + 10;
    }
    drawStat(field){
        ctx.font = '900 13px Ubuntu';
        ctx.fillStyle = field.color;
        
        if(field.name === 'petals') ctx.fillStyle = `hsl(${Date.now()/6.5}, 50%, 50%)`;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        if(Array.isArray(field.value)){
            let statValue = field.value.join(", ");
            if (field.name == "poison" || field.name == "bodyPoison"){
                statValue = formatAmountHighPrecision(field.value[0]) + " total, "+formatAmountHighPrecision(field.value[1]) +"/s";
            }
            const wrappedText = wrapText(`${this.formatName(field.name)}: ${statValue}`, 12, this.currentHeight + 10, this.w - 20 - 10, 15);
            
            for(let i = 0; i < wrappedText.length; i++){
                ctx.strokeText(wrappedText[i][0], wrappedText[i][1], wrappedText[i][2]); 
                ctx.fillText(wrappedText[i][0], wrappedText[i][1], wrappedText[i][2]); 
            }
            this.currentHeight = wrappedText[wrappedText.length-1][2] + 10;
            return;
        }

        const statText = `${this.formatName(field.name)}: ${Number.isFinite(field.value) ? Math.round(field.value * 100) / 100 : field.value}`;
        ctx.strokeText(statText, 12, this.currentHeight + 9); 
        ctx.fillText(statText, 12, this.currentHeight + 9);
        

        this.currentHeight += 16;
    }
    formatName(name){
        if(name.length > 1){
            name = name[0].toUpperCase() + name.slice(1);
        }
        
        for(let i = 0; i < name.length; i++){
            if(name[i].toUpperCase() === name[i]){
                name = name.slice(0, i) + ' ' + name[i].toUpperCase() + name.slice(i+1);
                i += 2;
            }
        }
        return name;
    }
    drawPetalContainer({pc}){
        this.pc = pc;
        pc.x = pc.render.x = this.w - 18 - pc.w / 2;
        pc.y = pc.render.y = 13 + pc.h / 2;

        const ga = ctx.globalAlpha;
        pc.draw();
        ctx.globalAlpha = ga;
    }
    drawDropsPetalContainer(field){
        let {data, rarity} = field;
        if(data === null) return;

        // generate petal containers
        if(field.pcs === undefined){
            // get our rarity out of all rarities
            //data = data[rarity];
            // console.log(data);

            field.pcs = [];
            for(let key in data){
                const type = key;
                const rarities = data[key];
                for(let i = 0; i < rarities.length; i++){
                    if(rarities[i] !== 0){
                        let petalStats = Stats.petals[type][i];
                        let data;
                        if (Stats.specialRarityDrops[rarity] != undefined){
                            let dropTable = Stats.specialRarityDrops[rarity];
                            for(let j = 0; j < dropTable.length; j ++){
                                if (dropTable[j].originalRarity >= i){
                                    data = dropTable[j];
                                    break;
                                }
                            }
                        }
                        if (data){
                            if (data.replaceRarity){
                                petalStats = Stats.petals[type][data.replaceRarity];
                            }
                        }

                        let is1v1 = false;
                        if (biomeManager !== undefined && biomeManager.getCurrentBiome() === '1v1'){
                            is1v1 = true;
                        }

                        if (is1v1){
                            var oldRarityStats = Stats.rarities;
                            Stats.rarities = [Stats.rarities[0]];
                            for(let i = 1; i < oldRarityStats.length; i++){
                                Stats.rarities[i] = {}
                                for(let key in oldRarityStats[i]){
                                    Stats.rarities[i][key] = Stats.rarities[i-1][key] * 1.15;
                                }
                                Stats.rarities[i].name = oldRarityStats[i].name;
                            } 
                            BaseStats.rarities = Stats.rarities;
                            window.calculateStats(true);
                        }


                        // console.log(Stats.petals[type]);

                        let petalAmount = 0;

                        const petalLayout = petalStats.petalLayout;
                        for(let j = 0; j < petalLayout.length; j++){
                            for(let k = 0; k < petalLayout[j].length; k++){
                                petalAmount++;
                            }
                        }

                        if (is1v1){
                            Stats.rarities = BaseStats.rarities = oldRarityStats;
                            window.calculateStats(false);
                        }

                        const petalArray = [];
                        for(let j = 0; j < petalAmount; j++){
                            petalArray.push(new Petal({
                                x: 0,
                                y: 0,
                                angle: 0,
                                radius: petalStats.radius,
                                type: type,
                                rarity: i,
                                damage: 0,
                                offset: 0,
                                distance: 0,
                                dv: 0,
                                id: Math.random(),
                                subId: 0,
                                subStackedId: 0,
                                dead: false,
                                hp: 1,
                                maxHp: 1,
                                reload: 1,
                                maxReload: 1,
                                angleOffset: 0,
                                petalContainerId: -1
                            }));
                        }

                        field.pcs.push(new PetalContainer(petalArray, {x: 0, y: 0, w: 50, h: 50, toOscillate: false, radius: 0}, Math.random(), 1, 0));
                        if (rarities[i] > 10){
                            field.pcs[field.pcs.length-1].dropPercent = Math.ceil(rarities[i] * 10) / 10;
                        }
                        else{
                            field.pcs[field.pcs.length-1].dropPercent = Math.ceil(rarities[i] * 100) / 100;
                        }
                        if (rarities[i] < 0.05){
                            field.pcs[field.pcs.length-1].dropPercent = Math.ceil(rarities[i] * 1000) / 1000;
                        }

                        //Celestial and Seraphic override
                        if (data){
                            if (data.replaceRarity){
                                field.pcs[field.pcs.length-1].rarity = data.replaceRarity;
                            }
                            if (data.amount){
                                field.pcs[field.pcs.length-1].amount = data.amount;
                            }
                        }
                        
                    }
                }
            }
        }

        this.currentHeight += 36;

        let wOffset = 0;

        for(let i = 0; i < field.pcs.length; i++){
            const pc = field.pcs[i];

            pc.render.x = pc.x = 18 + pc.w / 2 + wOffset;
            pc.render.y = pc.y = this.currentHeight;

            const ga = ctx.globalAlpha;
        pc.draw();
        ctx.globalAlpha = ga;

            // if(wOffset + pc.w / 2 > this.w) {console.log('xd'); this.w = wOffset + pc.w / 2;}
            this.w = Math.max(pc.w + 16 + pc.w / 2 + wOffset, this.w);

            const lastLetterSpacing = ctx.letterSpacing;
            ctx.font = '900 11px Ubuntu';
            ctx.letterSpacing = "-.05px";
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;

            ctx.strokeText(pc.dropPercent + '%', pc.render.x, pc.render.y + pc.h / 2 + 11);
            ctx.fillText(pc.dropPercent + '%', pc.render.x, pc.render.y + pc.h / 2 + 11);
            // mk
            ctx.letterSpacing = lastLetterSpacing;

            if(field.pcs[i+1] === undefined || field.pcs[i+1].type !== pc.type){
                this.currentHeight += pc.h + 24;
                wOffset = 0;
            } else {
                wOffset += pc.w + 16;
            }
        }

        this.currentHeight -= 38;
    }
}

// const rarityToColor = {};
// for(let i = 0; i < Colors.rarities.length; i++){
//     rarityToColor[Colors.rarities[i].name] = {
//         color: Colors.rarities[i].color,
//         border: Colors.rarities[i].border
//     };
// }

const wrapText = function(text, x, y, maxWidth, lineHeight) {
    let words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineArray = [];

    for(var n = 0; n < words.length; n++) {
        testLine += `${words[n]} `;
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lineArray.push([line, x, y]);
            y += lineHeight;
            line = `${words[n]} `;
            testLine = `${words[n]} `;
        }
        else {
            line += `${words[n]} `;
        }
        if(n === words.length - 1) {
            lineArray.push([line, x, y]);
        }
    }
    return lineArray;
}

function generateStatsBox(pc, isPetal=true/*false = is enemy*/, {x,y}){
    const stats = [];
    if (pc.petals[0].constructor === Enemy) isPetal = false
    let dropsData = null;
    for(let key in pc.petalStats){
        let data = pc.petalStats[key];
        if (data == 0 && key !== "reload") continue
        if (key == "reload" && data > 1e6) continue
        if (key == "period"){
            console.log(data)
        }
        if (typeof data == "number"){
            data = formatAmountHighPrecision(data);
        }
        if (key == "reload"){
            data += "s";
        }
        else if (key == "cooldown"){
            data += "s";
        }
        else if (key == "period"){
            data += "s";
        }
        else if (key == "lifespan" || key === "tanksmithRechargeTime" || key === "shootCooldown"){
            data += "s";
        }
        else if(key === "tanksmithHp"){
            key = "tanksmithHealth";
        }
        else if(key === "shootCooldownBuff"){
            stats.push({
                type: 'Stat',
                name: "ShootCooldownBuff",
                value: `+${formatAmountHighPrecision(pc.petalStats[key] * 100)}%`,
                color: "#ff9944"
            })
            continue;
        }
        else if(key === "projectileSpeedBuff"){
            stats.push({
                type: 'Stat',
                name: "ProjectileSpeedBuff",
                value: `${data}x`,
                color: "#ff9944"
            })
            continue;
        }
        else if(key === "petalNum"){
            key = "petals";
        }
        else if (key == "hatchTime"){
            /*
            if (pc.type == "Egg"){
                stats.push({
                    type: 'Stat',
                    name: "SpawnRarity",
                    value: enemyRarityScalars[Math.max(pc.rarity - 1, 0)].name,
                    color: Colors.rarities[Math.max(pc.rarity - 1, 0)].color
                })
            }
            */
           if (data == 0) continue;
            data += "s";
        }
        else if (key == "spawnRarity") {
            if (pc.type === "Air" && pc.rarity < 13) continue;
            stats.push({
                type: 'Stat',
                name: "SpawnData",
                value: '',
                color: '#f9f9f9'
            })
            stats.push({
                type: 'Stat',
                name: "- SpawnRarity",
                value: enemyRarityScalars[Math.max(data, 0)].name,
                color: Colors.rarities[Math.max(data, 0)].color
            })
            if (pc.type === "Egg") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Beetle",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Beetle[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Beetle[data].health),
                    color: statColors.health
                })
            }
            if (pc.type === "Plastic Egg") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Plastic",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Plastic[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Plastic[data].health),
                    color: statColors.health
                })
            }
            if (pc.type === "Jellyfish Egg") {

                let maxShocks = 2;
                if (data > 11) {
                    maxShocks = 3;
                }
                if (data > 13) {
                    maxShocks = 4;
                }

                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Jellyfish",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Jellyfish[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Jellyfish[data].health),
                    color: statColors.health
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonLightningDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Jellyfish[data].health * 0.12),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonLightningBounces",
                    value: maxShocks,
                    color: statColors.bounces
                })
            }
            if (pc.type === "Square") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Square",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Square[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Square[data].health),
                    color: statColors.health
                })
            }
            if (pc.type === "Pentagon") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Pentagon",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Pentagon[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Pentagon[data].health),
                    color: statColors.health
                })
            }
            if (pc.type === "Air") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Bubble",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(Stats.enemies.Bubble[data].damage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(Stats.enemies.Bubble[data].health),
                    color: statColors.health
                })
            }
            if (pc.type === "Ant Egg") {
                stats.push({
                    type: 'Stat',
                    name: "- SpawnType",
                    value: "Soldier Ant",
                    color: '#6fcde2'
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonDamage",
                    value: formatAmountHighPrecision(5 * Stats.rarities[data].petalDamage),
                    color: statColors.damage
                })
                stats.push({
                    type: 'Stat',
                    name: "- SummonHealth",
                    value: formatAmountHighPrecision(2500 * Stats.rarities[data].petalHealth),
                    color: statColors.health
                })
            }
            continue;
        }
        else if (key == "maximumRarity") {
            stats.push({
                type: 'Stat',
                name: "maximumRarity",
                value: enemyRarityScalars[Math.max(data, 0)].name,
                color: Colors.rarities[Math.max(data, 0)].color
            })
            continue;
        }
        else if (key == "maxConversionRarity") {
            stats.push({
                type: 'Stat',
                name: "max",
                value: enemyRarityScalars[Math.max(data, 0)].name,
                color: Colors.rarities[Math.max(data, 0)].color
            })
            continue;
        }
        else if (key == "maxDuplicationRarity") {
            stats.push({
                type: 'Stat',
                name: "max",
                value: enemyRarityScalars[Math.max(data, 0)].name,
                color: Colors.rarities[Math.max(data, 0)].color
            })
            continue;
        }

        else if (key == "highestRarity") {
            stats.push({
                type: 'Stat',
                name: "HighestRarity",
                value: enemyRarityScalars[Math.max(data, 0)].name,
                color: Colors.rarities[Math.max(data, 0)].color
            })
            continue;
        }
        else if (key == "petLifespan") {
            if (pc.type == "Ruby") {
                stats.push({
                    type: 'Stat',
                    name: "MaxSpawnRarity",
                    value: enemyRarityScalars[Math.max(currentBiome === '1v1' ? 4 : pc.rarity, 0)].name,
                    color: Colors.rarities[Math.max(currentBiome === '1v1' ? 4 : pc.rarity, 0)].color
                })
            }
            data += "s";
        }
        else if (key == "reviveHealth") {
            data *= 100;
            data += "%";
        }
        else if (key == "healthNerf") {
            data += "%";
        }
        else if (key == "passiveHealingBuff") {
            data += "/s";
        }
        else if (key == "passiveDamagePerKill") {
            data += "/s";
        }
        else if (key == "passiveHealingStack") {
            data += "/s";
        }
        else if (key == "passiveHealingStackDuration" || key == "timeLimit") {
            data += "s";
        }

        else if (key == "healingReduction") {
            data *= 100;
            data += "%";
        }
        else if (key == "spawnSystem") {
            stats.push({
                type: 'Stat',
                name: "SpawnData",
                value: '',
                color: '#f9f9f9'
            })
            stats.push({
                type: 'Stat',
                name: "- SpawnTime",
                value: data[1] + 's',
                color: '#d4d4d4'
            })
            stats.push({
                type: 'Stat',
                name: "- SpawnRarity",
                value: enemyRarityScalars[data[0]].name,
                color: Colors.rarities[data[0]].color
            })
            stats.push({
                type: 'Stat',
                name: "- MaxSpawnsPerPetal",
                value: data[2],
                color: '#59d4c1'
            })
            if (pc.type === "Stick") stats.push({
                type: 'Stat',
                name: "- SpawnType",
                value: "Sandstorm",
                color: '#6fcde2'
            })
            stats.push({
                type: 'Stat',
                name: "- SummonDamage",
                value: formatAmountHighPrecision(Stats.enemies.Sandstorm[data[0]].damage),
                color: statColors.damage
            })
            stats.push({
                type: 'Stat',
                name: "- SummonHealth",
                value: formatAmountHighPrecision(Stats.enemies.Sandstorm[data[0]].health),
                color: statColors.health
            })
            continue;
        }
        else if (key == "slowdown") {
            if (data === undefined) continue;

            let rarityRender = pc.rarity;
            let rangeUp = 2;
            if (pc){
                if (pc.is1v1Stats == true){
                    rarityRender = 2;
                    rangeUp = 4;
                }
                if (pc.rarity >= 12){
                    rangeUp = 5;
                }
            }
            let max = rarityRender + rangeUp;
            if (max < 4) {
                max = 4;
            }
            stats.push({
                type: 'Stat',
                name: "Slowdown",
                value: "",
                color: '#d4d4d4'
            })
            for (let i = rarityRender - 2; i < max; i++) {
                if (enemyRarityScalars[i]) {
                    stats.push({
                        type: 'Stat',
                        name: "- " + enemyRarityScalars[i].name,
                        value: data[i] + "%",
                        color: key.includes('Buff') ? "#ff9944" : statColors[enemyRarityScalars[i].name] ?? 'white'
                    })
                }
            }
            continue;
        }
        else if (key == "pvpOverride"){
            continue;
        }
        else if (key == "damageHeal"){
            if (pc.petalStats[key] < 0){
                console.log(pc.petalStats[key])
                stats.push({
                    type: 'Stat',
                    name: "selfDamage",
                    value: formatAmountHighPrecision(Number(-pc.petalStats[key])),
                    color: '#ff3344'
                })
                continue;
            }
            else{
                stats.push({
                    type: 'Stat',
                    name: "Lifesteal",
                    value: Math.round(pc.petalStats[key]/pc.petalStats["damage"] * 100000)/1000 + "%",
                    color: '#d4d4d4'
                })
                continue;
            }
        }
        else if (key == "knockbackMass" || key == "bodyKnockback"){
            stats.push({
                type: 'Stat',
                name: "Knockback",
                value: data,
                color: '#d4d4d4'
            })
            continue;
        }
        else if (key == "percentDamagePerDeadFlower"){
            stats.push({
                type: 'Stat',
                name: "ExtraDmg",
                value: data +"% / dead flower",
                color: '#d4d4d4'
            })
            continue;
        }
        else if (key == "salt"){
            stats.push({
                type: 'Stat',
                name: "DamageReflected",
                value: data +"%",
                color: '#d4d4d4'
            })
            continue;
        }
        else if (key == "overhealConversion"){
            stats.push({
                type: 'Stat',
                name: "overhealConversion",
                value: data +"%",
                color: '#dae09f'
            })
            continue;
        }
        else if (key == "damageConversion"){
            stats.push({
                type: 'Stat',
                name: "damageConversion",
                value: data +"%",
                color: '#dddddd'
            })
            continue;
        }
        else if (key == "killBossUnder"){
            stats.push({
                type: 'Stat',
                name: "killBossUnder",
                value: data +"%",
                color: '#dd4433'
            })
            continue;
        }
        else if (key == "shinyChanceBoost"){
            stats.push({
                type: 'Stat',
                name: "luckyChanceBoost",
                value: data +"%",
                color: '#f5e042'
            })
            continue;
        }
        else if (key == "inflation"){
            stats.push({
                type: 'Stat',
                name: "Inflation",
                value: data +"%",
                color: '#d4d4d4'
            })
            continue;
        }
        else if (key == "mana"){
            if (pc.type == "Amulet of Grace" || pc.type == "Amulet of Grace"){
                stats.push({
                    type: 'Stat',
                    name: "GraceManaGranted",
                    value: data,
                    color: Colors.mana["grace"]
                })
            }
            else if (pc.type == "Amulet of Time" || pc.type == "Shard of Time"){
                stats.push({
                    type: 'Stat',
                    name: "TimeManaGranted",
                    value: data,
                    color: Colors.mana["time"]
                })
            }
            else if (pc.type == "Amulet of Divergence" || pc.type == "Shard of Divergence"){
                stats.push({
                    type: 'Stat',
                    name: "DivergenceManaGranted",
                    value: data,
                    color: Colors.mana["divergence"]
                })
            }
            continue;
        }
        else if (key == "damagePercent"){
            stats.push({
                type: 'Stat',
                name: "damagePercent",
                value: data +"%",
                color: '#e3c59d'
            })
            continue;
        }
        else if (key == "waveSpeed"){
            stats.push({
                type: 'Stat',
                name: "WaveSpawningSpeed",
                value: data +"s",
                color: '#a4ffa4'
            })
            continue;
        }
        else if (key == "shadowTime"){
            stats.push({
                type: 'Stat',
                name: "shadowTime",
                value: data +"s",
                color: '#777777'
            })
            continue;
        }
        else if (key == "unrevivable"){
            stats.push({
                type: 'Stat',
                name: "unrevivable",
                value: data +"s",
                color: '#999999'
            })
            continue;
        }
        else if (key == "healingBoost"){
            stats.push({
                type: 'Stat',
                name: "healingBoost",
                value: data * 100 + "%",
                color: '#f8464d'
            })
            continue;
        }
        else if (key == "healing"){
            stats.push({
                type: 'Stat',
                name: "regeneration",
                value: formatAmountHighPrecision(Stats.enemies.Starfish[pc.rarity].healing * Stats.enemies.Starfish[pc.rarity].health * 30) + "/s",
                color: statColors.heal
            })
            continue;
        }
        else if (key == "agroState"){
            continue;
        }
        else if (key == "turnSpeed"){
            continue;
        }
        else if (key == "reloadBuff"){
            if (data == 0) continue;
            else data += "%";
        }
        else if (key == "radiusChange"){
            if (data == 0) continue;
            else data += "%";
        }
        
        if (key === "drops"){
            dropsData = data;
            continue;
        }
        stats.push({
            type: 'Stat',
            name: key,
            value: data,
            color: statColors[key] ? statColors[key] : (key.includes('Buff') ? "#ff9944" : 'white')
        })
    }

    if (pc.type === "Card") {
            stats.push({
                type: 'Stat',
                name: "exclusive",
                value: "Flowr Bot Market",
                color: statColors.damage
            })
        }
    if (
        pc.type === "Cash" ||
        pc.type === "Shard of Divergence" ||
        pc.type === "Shard of Time" ||
        pc.type === "Shard of Grace"
    ) {
            stats.push({
                type: 'Stat',
                name: "exclusive",
                value: "Token Shop",
                color: statColors.damage
            })
    }
    if (pc.type === "Trinket of the Sea") {
        stats.push({
            type: 'Stat',
            name: "exclusive",
            value: "Beach Biome",
            color: statColors.damage
        })
    }
    if (pc.type === "Neutron Star") {
        let rarityName = pc.rarity + 1
        if (pc.rarity >= 13) rarityName = pc.rarity + 2
        stats.push({
            type: 'Stat',
            name: "maxAttractionRarity",
            value: Colors.rarities[rarityName].name,
            color: Colors.rarities[rarityName].color//"#9067d5"
        })
    }

    if (pc.type === "Jellyfish" && isPetal == false) {
        stats.push({
            type: 'Stat',
            name: "lightningDamage",
            value: formatAmountHighPrecision(Stats.enemies.Jellyfish[pc.rarity].damage * 1.5),
            color: statColors.damage
        })
    }

    const isTs = (window.characterSelector !== undefined && window.characterSelector.selectedIndex == "1");

    let description = 
    {
        type: 'Description',
        value: (isPetal ? (isTs ? Descriptions.tanksmiths[pc.type] : Descriptions.petals[pc.type]) : Descriptions.enemies[pc.type]) ?? (isPetal ? 'A Mysterious Custom Petal...' : 'A Mysterious Custom Enemy...')
    };

    let title = pc.type;

    if (pc.type == "Third Eye" && pc.rarity == 13){
        description.value = "Something lofdjf will never get."
    }
    if (pc.type == "Peas" && pc.rarity == 13){
        description.value = "A strong 5 in 1 deal. Projectiles have 10x the health and bounce off walls."
    }
    if (pc.type == "Grapes" && pc.rarity == 13){
        description.value = "A poisonous 5 in 1 deal. Projectiles have 10x the health and bounce off walls and enemies."
    }
    if (pc.type == "Blueberries" && pc.rarity == 13){
        description.value = "An electric 5 in 1 deal. Projectiles have 10x the health and bounce off walls."
    }
    if (pc.type == "Pomegranate" && pc.rarity == 13){
        description.value = "A deadly 5 in 1 deal. Projectiles have 10x the health and bounce off walls."
    }
    if (pc.type == "Mandible" && pc.rarity == 13){
        description.value = "Has a 15% chance of doing 20x damage. Critical chance increases to 30% when 3 or more flowers are dead."
    }
    if (pc.type == "Basic" && pc.rarity >= 8){
        description.value = `A nice petal, not very strong. Has a 0.1% chance to increase special wave chance by ${pc.rarity - 7}% every tick.`
    }
    if (pc.type == "Amulet of Grace" && pc.rarity == 11) {
        description.value = "Forged by the Ancients to extend their life, it has long since lost the flame that fueled it. Maybe if it was ignited again, it could be used to extend your own life once more..."
    }
    if (pc.type == "Amulet of Divergence" && pc.rarity == 11) {
        description.value = "This was merely the prototype to something of far greater strength... capable of warping reality itself. Perhaps merging them can generate power enough to use it for your own conquest?"
    }
    if (pc.type == "Amulet of Time" && pc.rarity == 11) {
        description.value = "In times since past, this was fought over relentlessly as it was believed to slow the enemies advances. Lacking the power it once had, maybe if recharged it could aid against the onslaught..."
    }
    if (pc.type == "Amulet of Grace" && pc.rarity < 11) {
        description.value = "An odd, warm feeling overtakes you as you peer into the gem. You grow calm, but it was only for a moment. Could a more powerful amulet could harness more of this magic..?"
    }
    if (pc.type == "Amulet of Divergence" && pc.rarity < 11) {
        description.value = "Faint lights appear from within deep inside the stored gem. There appears to be movement inside, but it's too hard to discern what is causing it. What if more power was contained..?"
    }
    if (pc.type == "Amulet of Time" && pc.rarity < 11) {
        description.value = "Staring into the darkness within, memories of a time long lost fade in and out. A faint glow eminates from the deep center. Perhaps if this amulet had more power..?"
    }
    if (pc.type == "Jelly" && pc.rarity >= 13){
        description.value = "With advanced technological advancements from bioengineered Jellyfish, this Jelly only deals knockback if you are defending."
    }
    if (pc.type == "Powder" && pc.rarity >= 13){
        description.value = "Increases movement speed if not attacking, but decreases health. Reduces player radius. Does not stack."
    }
    
    if (pc.type == "Faster" && pc.rarity >= 13){
        description.value = "Makes your petals spin faster and reload faster! Rotation speed buff is stackable, reload buff is not stackable. Reload buff doubled on petals under the rarity of the faster."
    }
    if (pc.type == "Neutron Star" && pc.rarity >= 13){
        description.value = "A decoy that forcefully attracts mobs with the strength of gravity. Free will is just an illusion after all. Aims in your movement direction. Causes mobs to forcefully compress into each other, slowly wearing off over 3 seconds."
    }

    
    if (pc.type == "Oranges" && pc.rarity == 12){
        description.value = "The Oranges fused together into one heavy blob. It's too heavy to be extended further than usual, but it packs extra damage."
    }
    else if (pc.type == "Oranges" && pc.rarity == 13){
        description.value = "The Orange grew so powerful it split up again, this time into 5 pieces."
    }
    
    if (pc.type == "Honey" && pc.rarity >= 8){
        description.value = "A rocket-powered decoy that attracts mobs away from flowers. Press shift to slow it down to a stop! Works weakly on enemies one rarity higher."
    }
    if (pc.type == "Honey" && pc.rarity >= 12){
        description.value = "A rocket-powered decoy with extra sweetness. Press shift to slow it down to a stop! Works with 66% effectiveness on enemies one rarity higher and 33% effectiveness on enemies two rarities higher."
    }
    if (pc.type == "Honey" && pc.rarity >= 13){
        description.value = "A rocket-powered decoy with extra sweetness. Press shift to slow it down to a stop! Works with 75% effectiveness on enemies one rarity higher, 50% effectiveness on enemies two rarities higher, and 25% effectiveness on enemies three rarities higher."
    }

    if (pc.type == "Jolt" && pc.rarity >= 13){
        description.value = "A jolt so powerful, it teleports all players and pets across the map, at the cost of a high cooldown time. Great for escaping threats!"
    }

    if (pc.type == "Ruby" && pc.rarity >= 13){
        description.value = "A mythical gem infused with the power of friendship. Friendship lasts 20% shorter if the mob rarity is greater than or equal to the ruby rarity."
    }
    if (pc.type == "Sapphire" && pc.rarity == 13){
        description.value = "A mythical gem infused with the power of transformation. Transforming a transcendent mob causes the slot to have infinite reload time for the rest of the wave. (Effects may still apply)"
    }
    if (pc.type == "Emerald" && pc.rarity == 13){
        description.value = "A mythical gem infused with the power of genesis. Generating a transcendent mob causes the slot to have infinite reload time for the rest of the wave. (Effects may still apply)"
    }

    if (pc.type == "Egg") {
        title = "Beetle Egg"
    }
    if (pc.type == "Fangs") {
        title = "Fang"
    }

    return new StatsBox([
        {
            type: 'Title',
            value: title
        },
        {
            type: 'Rarity',
            value: pc.rarity
        },
        description,
        {
            type: 'Margin',
            value: 5
        },
        ...stats,
        {
            type: 'DropsPetalContainer',
            data: dropsData,
            rarity: pc.rarity
        },
        {
            type: 'PetalContainer',
            pc: isPetal ? clonePC(pc) : cloneEnemyPC(pc)
        }
    ],
    {x,y,w: 216 + Math.max(0, (title.length-8) * 18 + 2)},
    [clonePC(pc),isPetal,{x,y}])
}

// const testBox = generateStatsBox({
//     "petals": [
//         {
//             "x": 0,
//             "y": 0,
//             "angle": 0,
//             "radius": 10,
//             "type": "Salt",
//             "rarity": 3,
//             "damage": 29,
//             "offset": {
//                 "angle": 0,
//                 "distance": 0
//             },
//             "distance": 0,
//             "dv": 0,
//             "id": 0,
//             "subId": 0,
//             "subStackedId": 0,
//             "dead": false,
//             "hp": 19,
//             "maxHp": 19,
//             "reload": 2.5,
//             "maxReload": 2.5,
//             "angleOffset": 0,
//             "render": {
//                 "distance": 0,
//                 "angle": 0,
//                 "x": 0,
//                 "y": 0
//             },
//             "selfAngle": 0,
//             "dying": false,
//             "deadAnimationTimer": 9999,
//             "ticksSinceLastDamaged": 9999,
//             "insidePetalContainer": true,
//             "isProjectile": false
//         }
//     ],
//     "petalStats": {
//         "radius": 10,
//         "knockback": 0.1,
//         "damage": 29,
//         "health": 19,
//         "maxDamage": 23.2,
//         "salt": 20.833333333333336,
//         "reload": 2.5,
//         "petalLayout": [
//             [
//                 {}
//             ]
//         ],
//         "override": {
//             "1": {
//                 "salt": 8.333333333333334
//             },
//             "2": {
//                 "salt": 13.333333333333334
//             },
//             "3": {
//                 "salt": 20.833333333333336
//             },
//             "4": {
//                 "salt": 31.666666666666668
//             },
//             "5": {
//                 "salt": 45.833333333333336
//             },
//             "6": {
//                 "salt": 62.5
//             },
//             "7": {
//                 "salt": 91.66666666666667
//             },
//             "8": {
//                 "salt": 183.33333333333334
//             }
//         },
//         "damageScalers": [
//             "damage",
//             "maxDamage"
//         ],
//         "healthScalers": [
//             "health"
//         ]
//     },
//     "rarity": 3,
//     "type": "Salt",
//     "x": 0,
//     "y": 0,
//     "w": 62,
//     "h": 62,
//     "radius": 50,
//     "render": {
//         "x": 0,
//         "y": 0,
//         "w": 65
//     },
//     "amount": 100017,
//     "attempt": 15,
//     "id": 0.24452447930549015,
//     "spawnAnimation": 0,
//     "lastAmountChangedTime": -1000,
//     "collectTime": null,
//     "toOscillate": false,
//     "creationTime": 1315.6999999284744,
//     "isDraggingPetalContainer": false
// }, true, {x: 120, y: 160})

const statColors = {
    damage: '#ff4444',
    health: '#44ff44',
    reload: '#44ddff',
    cooldown: '#67dbad',
    tanksmithRechargeTime: '#44ddff',
    shootCooldown: '#44ddff',
    speed: '#44ddff',
    tanksmithRadius: '#e044ff',
    tanksmithHealth: '#44ff44',
    poison: '#e644ff',
    bodyPoison: '#ec73ff',
    attractionRadius: '#baa052',
    salt:   '#FCB0CB',//'#a1bec4',
    bodyDamage: '#de3380',
    shinyChanceBoost: '#f5e042',
    maxDamage:   '#FCB0CB',
    slowdown: '#777777',
    slowdownTime: '#b172cf',
    armor: '#838383',
    mass: '#696969',
    duration: '#ff44ee',
    heal: '#ff94c9',
    xp: '#f9ff44',
    detectionDistance: '#ffb144',
    extraRange: '#1585b5',
    wingExtraRange: '#1585b5',
    enemyKnockback: '#de823f',
    healAmount: '#44ff44',
    healDelay: '#44ff44',
    range: '#e00030',
    period: '#e3c59d',
    damagePercent: '#e3c59d',
    bounces: '#a7faef',
    healthNerf: '#eb7faf',
    overhealConversion: '#dae09f',
    hatchTime: '#9fd49f',
    extraDamage: '#ffbb00',
    criticalDamage: "#dd0000",
    flowerArmor: '#a3a3a3',
    maxEnemyBoost: '#33dd33',
    petLifespan: "#999999",
    lifespan: "#499999",
    reviveHealth: "#944994",
    timeToPop: "#ffeeaa",
    shadowTime: "#333333",
    unrevivable: "#555555",
    damageConversion: "#aaaaaa",
    maximumMobs: "#9055cf",
    healingReduction: "#dddddd",
    reloadBuff: "#42e38a",
    useLimit: "#4d7896",
    wavesSentBack: "#445396",
    effect: "#b0b0b0",
    passiveDamagePerKill: "#ff3344",
    radiusChange: "#4986e3",
    passiveHealingStack: "#35de3e",
    passiveHealingStackDuration: "#659c68",
    killsRequired: "#ff1234",
    timeLimit: "#3582ab",
    failDamage: "#bf245b",
    blastRadius: "#56269e",
    armorPercent: "#7d9c7b",
    finalHitDamage: "#ff5900"
}

for(let i of Object.keys(Colors.rarities)){
    statColors[Colors.rarities[i].name] = Colors.rarities[i].color;
}

const enemyRarityScalars = [{// NOTE: DO NOT CHANGE ANY OF THESE. THEY WERE SUPPOSED TO BE FINAL.
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
      xp: 656100
    }, {
        name: "Omnipotent",
        health: 968988,
        damage: 550,
        radius: 45, 
        mass: 33750,  
        petalDamage: 47162.5, 
        petalHealth: 550,
        petalHeal: 963,
        petalMass: 20000,
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
];
// for(let key in statColors){
//     statColors[key] = blendColor(statColors[key], '#cccccc', 0.18);
// }
