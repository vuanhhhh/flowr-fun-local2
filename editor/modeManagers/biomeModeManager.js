let BiomeMouseMoveFunction = () => {};
let regenerateIconsTimeout = null;
let testingGame = false;// false
let runGameInterval;

const testingBiomeData = {
    testWave: 1,
    unlimitedHp: false,
    specialWave: false,
    fixedCamera: false,
    testPetalType: "Basic",
    testPetalRarity: 0,
    testPetalAmount: 5
}

function testingFlowerData(){
    return {
        id: 0,
        baseX: 0,
        baseY: 0,
        x: 0, y: 0,
        radius: 25,
        xv: 0, yv: 0,
        mass: 5,
        headX: 0, headY: 0,
        friction: .3, name: '',
        hp: 300, maxHp: 300,
        baseMaxHp: 300,
        movementType: 'mouse',
        angle: 0, magnitude: 0,// editor will be mouse only
        input: [0,0,0,0],
        petalRotateSpeed: petalRotateSpeed,
        petalRotation: 0,
        passiveHealing: .1,
        defensiveHealing: 0,
        yinYangs: 0,
        pickupRadiusMultiplier: 1,
        salt: 0, maxSaltDamage: 0,
        powder: 0, powderHealthNerf: 0,
        petalDistance: neutralPetalDistance,
        attacking: false, defending: false,
        damage: 10, maxPetals: 5,
        petals: window.petalData_ !== undefined ? playingPetalData(window.petalData_) : testingFlowerPetalData(),
        dead: false,
        mass: 5,
    }
}

function testingEnemyData({type, rarity, x, y, radius, hp, mass, damage}){
    return {
        x, y,
        radius,
        hp, maxHp: hp, damage,
        id: generateId(),
        type: "Custom",
        customType: type,
        rarity,
        angle: Math.random() * Math.PI * 2,
        team: "enemy",
        mass,
        xp: 0,
    };
}

function testingPetalData(id, subId, petalType=testingBiomeData.testPetalType, petalRarity=testingBiomeData.testPetalRarity){// TODO: make this a custom petal type
    if(petalType === "Basic"){
        if(editorStats.petals[petalType] === undefined || editorStats.petals[petalType][petalRarity] === undefined){
            return [{
                x: 0,
                y: 0,
                angle: 0,
                radius: 10,
                type: "Basic",
                rarity: petalRarity,
                damage: 10,
                offset: {distance: 0, angle: 0},
                distance: 0,
                dv: 0,
                id,
                subId: 0,
                subStackedId: 0,
                dead: false,
                hp: 10,
                maxHp: 10,
                reload: 2.6,
                maxReload: 1,
                angleOffset: 0,
            }];
        } else {
            const stats = editorStats.petals[petalType][petalRarity];
            const petalLayout = stats.petalLayout;
            const arr = [];
            for(let i = 0; i < petalLayout.length; i++){
                for(let j = 0; j < petalLayout[i].length; j++){
                    let offset = {distance: 0, angle: 0};
                    if(Object.keys(petalLayout[i][j]).length > 0){
                        const offsets = petalLayout[i][j];
                        offset = {angle: offsets.offsetAngle, distance: offsets.offsetRadius};
                    }
                    arr.push({// stuff like hp will have to be changed TODO
                        x: 0,
                        y: 0,
                        angle: 0,
                        radius: stats.radius,
                        // type: 'Custom',
                        // customType: currentPetalCustomType,
                        type: "Basic",
                        rarity: petalRarity,
                        damage: stats.damage,
                        offset,
                        distance: 0,
                        dv: 0,
                        id,
                        subId: subId++,
                        subStackedId: j,
                        dead: false,
                        hp: stats.health,// stuff like hp will have to be changed TODO
                        maxHp: stats.health,
                        reload: stats.reload,
                        maxReload: stats.reload,
                        angleOffset: 0,
                    })
                }
            }
            return arr;
        }
    };
    const stats = editorStats.petals[petalType][petalRarity];
    const petalLayout = stats.petalLayout;

    const arr = [];
    for(let i = 0; i < petalLayout.length; i++){
        for(let j = 0; j < petalLayout[i].length; j++){
            let offset = {distance: 0, angle: 0};
            if(Object.keys(petalLayout[i][j]).length > 0){
                const offsets = petalLayout[i][j];
                offset = {angle: offsets.offsetAngle, distance: offsets.offsetRadius};
            }
            arr.push({// stuff like hp will have to be changed TODO
                x: 0,
                y: 0,
                angle: 0,
                radius: stats.radius,
                // type: 'Custom',
                // customType: currentPetalCustomType,
                type: "Custom",
                customType: petalType,
                rarity: petalRarity,
                damage: stats.damage,
                offset,
                distance: 0,
                dv: 0,
                id,
                subId: subId++,
                subStackedId: j,
                dead: false,
                hp: stats.health,// stuff like hp will have to be changed TODO
                maxHp: stats.health,
                reload: stats.reload,
                maxReload: stats.reload,
                angleOffset: 0,
            })
        }
    }
    return arr;
}

function testingFlowerPetalData(extraData=undefined){
    let arr = [];
    for(let i = 0; i < Math.min(200, testingBiomeData.testPetalAmount); i++){
        const testingData = testingPetalData(i, arr.length);
        for(let j = 0; j < testingData.length; j++){
            if(extraData !== undefined){
                for(let key in extraData){
                    testingData[j][key] = extraData[key];
                }
            }
            arr.push(new Petal(testingData[j]));
        }
        // arr[i] = new Petal(testingPetalData(i));
    }
    return arr;
}

function playingPetalData(top){
    let arr = [];
    const topArr = Object.values(top);
    for(let i = 0; i < topArr.length; i++){
        const t = topArr[i];
        const testingData = testingPetalData(i, arr.length, t.type, t.rarity);
        for(let j = 0; j < testingData.length; j++){
            arr.push(new Petal(testingData[j]));
        }
    }
    return arr;
}

const room = new Room();
let testingFlower = room.addNewFlower(testingFlowerData());
window.selfId = 0;
for(let i = 0; i < testingFlower.petals.length; i++){
    testingFlower.petals[i].parent = testingFlower;
}

class BiomeModeManager {
    static changeBackgroundColor(color){
        colors.background = color;

        if(regenerateIconsTimeout === null){
            regenerateIconsTimeout = setTimeout(BiomeModeManager.regenerateIcons, 100);
        }
    }
    static changeGridColor(color){
        colors.grid = color;

        if(regenerateIconsTimeout === null){
            regenerateIconsTimeout = setTimeout(BiomeModeManager.regenerateIcons, 100);
        }
    }
    static initEventListeners(){
        mouseMoveFunctions.push((e) => {
            if(window.mode !== 'biome' || testingGame === false){
                return;
            }
            const worldCoordinates = PetalModeManager.screenToWorld({x: e.pageX, y: e.pageY});
            BiomeSimulateManager.updateFlowerInput({x: (worldCoordinates.x - testingFlower.headX) * camera.zoom, y: (worldCoordinates.y - testingFlower.headY) * camera.zoom});
        })
        BiomeMouseMoveFunction = mouseMoveFunctions[mouseMoveFunctions.length - 1];
        mouseDownFunctions.push((e) => {
            if(window.mode !== 'biome' || testingGame === false){
                return;
            }
            if(e.button == 0){
                // left click
                BiomeSimulateManager.runBindedAttack.bind(testingFlower)(true);
            } else if(e.button == 2){
                // right click
                BiomeSimulateManager.runBindedDefend.bind(testingFlower)(true);
            }
        })
        mouseUpFunctions.push((e) => {
            if(window.mode !== 'biome' || testingGame === false){
                return;
            }
            if(e.button == 0){
                // left click
                BiomeSimulateManager.runBindedAttack.bind(testingFlower)(false);
            } else if(e.button == 2){
                // right click
                BiomeSimulateManager.runBindedDefend.bind(testingFlower)(false);
            }
        })
    }
    static regenerateIcons(){
        Ref.biomeButtonImage.src = generateBiomeIcon();

        for(let mode in toolMap){
            const toolsInMode = toolMap[mode];
            for(let i = 0; i < toolsInMode.length; i++){
                toolsInMode[i].imageSrc = (generateToolIconMap[toolsInMode[i].name] ?? generatePetalIcon)(); 
            }
        }

        updateToolsMenu();

        regenerateIconsTimeout = null;
    }
    static updateFlowerInterpolate(){
        if(testingGame === false){
            return;
        }
        testingFlower.updateInterpolate();

        if(testingBiomeData.fixedCamera === true){
            camera.x = camera.y = 0;
        } else {
            camera.x = testingFlower.render.headX;
            camera.y = testingFlower.render.headY;
        }
    }
    static draw(){
        ctx.lastTransform2 = ctx.getTransform();
        ctx.translate(canvas.w/2 - camera.x * camera.zoom, canvas.h/2 - camera.y * camera.zoom);
        ctx.scale(camera.zoom, camera.zoom);

        for(let id in room.petalContainers){
            room.petalContainers[id].draw();
        }
        
        if(testingGame === true){
            window.selfId = testingFlower.id; // to skip interpolate
            testingFlower.draw();
            testingFlower.drawProjectiles();
        }
        
        for(let id in room.enemies){
            if(testingGame === false){
                if(room.enemies[id].displayAngle === undefined){
                    room.enemies[id].displayAngle = Math.atan2(room.enemies[id].y, room.enemies[id].x);
                }
                room.enemies[id].displayAngle += Math.PI / 223 * dt / 16.66;
                const distance = (room.radius - room.enemies[id].radius) * Math.sin(performance.now() / 4000 * Math.PI);
                room.enemies[id].angle -= distance / 14000;
                room.enemies[id].x = Math.cos(room.enemies[id].displayAngle) * distance;
                room.enemies[id].y = Math.sin(room.enemies[id].displayAngle) * distance;
            }
            room.enemies[id].draw();
        }

        ctx.setTransform(ctx.lastTransform2);
    }
    static toggleTestGame(){
        testingGame = !testingGame;
        if(testingGame === true){
            BiomeModeManager.startTestGame();
        } else {
            BiomeModeManager.stopTestGame();
        }
    }
    static startTestGame(){
        // these will be testing enemies
        if(Object.keys(room.enemies).length === 0){
            alert('You must add at least one enemy to test the game!\n(Hint: open the stats settings menu on the right and select "Add Enemy")');
            testingGame = false;
            return;
        }
        BiomeModeManager.updatePetalStats();
        if(editorBaseStats.petals[testingBiomeData.testPetalType] === undefined){
            alert(`You must define stats for the testing petal!\n(Hint: click "Add Petal" and then change the petal type to "${testingBiomeData.testPetalType}")`);
            testingGame = false;
            return;
        }
        // collideWithOtherEnemies
        // false
        // damage
        // 25
        // detectionDistance
        // 300
        // drops
        // {}
        // health
        // 20
        // mass
        // 1
        // personality
        // "passive"
        // radius
        // 15
        // spawnCooldown
        // 60
        // speed
        // 20
        // xp
        // 1
        BiomeModeManager.updateEnemyStats();
        const numberEnemyKeys = ['damage','detectionDistance','health','mass','radius','spawnCooldown','speed'];
        for(let key in spawnableTypesInBiome){
            const spawnType = editorBaseStats.enemies[key].spawnType;
            if(spawnType !== undefined && spawnableTypesInBiome[spawnType] === undefined){
                alert(`Stats undefined for "${spawnType}"!\n(Hint: Click "Add Enemy" and change enemy type to "${spawnType}")`);
                testingGame = false;
                return;
            }
            const drops = editorBaseStats.enemies[key].drops;
            for(let key2 in drops){
                if(editorBaseStats.petals[key2] === undefined){
                    alert(`Stats undefined for dropped petal type "${key2}"!\n(Hint: click "Add Petal" and change the petal type to "${key2}")`);
                    testingGame = false;
                    return;
                }
            }
            for(let i = 0; i < numberEnemyKeys.length; i++){
                const stats = editorBaseStats.enemies[key];
                const key2 = numberEnemyKeys[i];
                if(Number.isFinite(stats[key2]) === false && Number.isFinite(parseFloat(stats[key2])) === false){
                    alert(`Stat "${formatName(key2).slice(1)}" invalid for enemy type "${key}"!\n(Hint: open the enemies menu and change the stat "${formatName(key2).slice(1)}" to a number)`);
                    testingGame = false;
                    return;
                }
            }
        }

        const numberPetalKeys = ['damage','health','radius','reload'];
        const numberOrUndefinedPetalKeys = ['attackDistanceMult','neutralDistanceMult','defendDistanceMult','homingCorrection','projectileAmount','projectileCooldown','projectileLifetime','projectileSpeed','projectileSpread'];
        for(let key in editorBaseStats.petals){
            if(key === 'default')continue;
            for(let i = 0; i < numberPetalKeys.length; i++){
                const stats = editorBaseStats.petals[key];
                const key2 = numberPetalKeys[i];
                if(Number.isFinite(stats[key2]) === false && Number.isFinite(parseFloat(stats[key2])) === false){
                    alert(`Stat "${formatName(key2).slice(1)}" invalid for petal type "${stats.petalType}"!\n(Hint: open the petals menu and change the stat "${formatName(key2).slice(1)}" to a number)`);
                    testingGame = false;
                    return;
                }
            }
            for(let i = 0; i < numberOrUndefinedPetalKeys.length; i++){
                const stats = editorBaseStats.petals[key];
                const key2 = numberOrUndefinedPetalKeys[i];
                if(stats[key2] !== undefined && Number.isFinite(stats[key2]) === false && Number.isFinite(parseFloat(stats[key2])) === false){
                    alert(`Stat "${formatName(key2).slice(1)}" invalid for petal type "${stats.petalType}"!\n(Hint: open the petals menu and change the stat "${formatName(key2).slice(1)}" to a number)`);
                    testingGame = false;
                    return;
                }
            }
            if(editorBaseStats.petals[key].projectileEnabled === true){
                const projectileSpawnType = editorBaseStats.petals[key].projectileType;
                if(editorBaseStats.petals[projectileSpawnType] === undefined){
                    alert(`Stats undefined for projectile spawn type "${projectileSpawnType}"!\n(Hint: click "Add Petal" and change the petal type to "${projectileSpawnType}")`)
                    testingGame = false;
                    return;
                }
            }
            if(editorBaseStats.petals[key].summonEnabled === true){
                const summonSpawnType = editorBaseStats.petals[key].summonType;
                if(editorBaseStats.enemies[summonSpawnType] === undefined){
                    alert(`Stats undefined for projectile summon type "${summonSpawnType}"!\n(Hint: click "Add Enemy" and change the enemy type to "${summonSpawnType}")`);
                    testingGame = false;
                    return;
                }
            }
            // const projectileSpawnType = editorBaseStats 
        }
        if(testingBiomeData.specialWave === true && Object.keys(specialWaveTypes).length === 0){
            alert(`No special waves to spawn!\n(Hint: Turn off special wave in the testing menu or add a special wave in the stats menu!`);
            testingGame = false;
            return;
        }
        for(let i = 0; i < specialWaveTypes.length; i++){
            if(Object.keys(specialWaveTypes[i]).length === 0){
                alert(`Special wave number ${i} has no enemies!\n(Hint: navigate to special wave ${i} and click "Add Enemy")`);
                testingGame = false;
                return;
            }
            for(let key in specialWaveTypes[i]){
                const spawnType = key;
                if(spawnableTypesInBiome[spawnType] === undefined){
                    alert(`Stats undefined for "${spawnType}" special wave enemy!\n(Hint: Click "Add Enemy" and change enemy type to "${spawnType}")`);
                    testingGame = false;
                    return;
                }
            }
        }
        Ref.guiMenu.style.display = "none";
        Ref.modeGui.style.display = "none";

        regenerateEditorStats();

        BiomeSimulateManager.initRoomForGame();

        const playTool = toolMap[mode][0];
        playTool.imageSrc = generateToolIconMap["Stop Testing"]();
        playTool.name = "Stop Testing";
        updateToolsMenu();

        camera.last.actualZoom = camera.actualZoom;
        if(testingBiomeData.fixedCamera === true){
            camera.actualZoom = Math.max(0.1, canvas.h / room.radius / 2 - 0.02);
        } else {
            camera.actualZoom = 1;
        }
        runGameInterval = setInterval(() => {
            BiomeSimulateManager.simulate();
        }, 1000 / 30)

        BiomeModeManager.updateDisplayEnemies();
    }
    static stopTestGame(){
        Ref.guiMenu.style.display = "";
        Ref.modeGui.style.display = "";
        BiomeSimulateManager.unInitRoomForGame();

        const playTool = toolMap[mode][0];
        playTool.imageSrc = generateToolIconMap["Test Game"]();
        playTool.name = "Test Game";
        updateToolsMenu();

        clearInterval(runGameInterval);
        runGameInterval = undefined;

        camera.x = 0;
        camera.y = 0;
        if(camera.last.actualZoom !== undefined){
            camera.actualZoom = camera.last.actualZoom;
            delete camera.last.actualZoom;
        }

        BiomeModeManager.updateDisplayEnemies();
    }
    static terminateMode(){
        testingGame = false;
        BiomeModeManager.stopTestGame();
    }
    static addBiomeEnemyTemplate(){
        statsMenus.biome.enemies.push({
            enemyType: new Options(...BiomeModeManager.getAvailableEnemyTypes()),
            spawnChance: 1,
            spawnPower: 2,
            enemyHealth: 30,
            enemyDamage: 35,
            enemyRadius: 30,
            speed: 1,
            mass: 1.5,  
            detectionDistance: 300,
            collideWithOtherEnemies: true,
            // enemyNote: new Note('Note: some of these simulate combinations may not work together!'),
            // personality: new Options("passive", "stationary", "neutral", "aggressive", "shoot", "projectile"),
            defaultState: new Options("passive", "stationary", "sine", "detecting", "detectingSine", "projectile", "sandstorm", "fireBurrow", "burrow", "summon", "grow", "customCode"),
            aggroState: new Options("none", "passive", "stationary", "sine", "detecting", "detectingSine", "projectile", "sandstorm", "fireBurrow", "burrow", "summon", "aggressive", "shoot", "grow", "customCode", "scaredAggressive", "hop", "crab"),
            addDrop: new Button('Add Drop', () => {}),
            removeDrop: new Button('Remove Drop', () => {}),
            drops: [
                // wait we should have a "dropChance" like spawnChance that sums up to 1
                // "Cactus": [0.15, 0],
            ],
            special: {
                spawnType: new Options(...BiomeModeManager.getAvailableEnemyTypes()),
                spawnCooldown: 60,
                spawnAmount: 1,
                spawnSpacing: 0,
                spawnRarityOffset: 0,
                grow: {
                    otherSimulateState: new Options("passive", "stationary", "sine", "detecting", "detectingSine", "projectile", "sandstorm", "fireBurrow", "burrow", "summon"),
                    childrenDistance: 0,
                    childrenRotateSpeed: 0,
                    childrenWanderDist: false,
                    childrenWanderAngle: false,
                    dieOnChildrenDie: false,
                    killChildrenOnDie: false,
                    aggroOnChildrenDmg: false,
                    childrenLookAtParent: false,
                    aggroChildrenOnDie: false,
                    ssLimit: 10,
                    sslNote: new Note('Spawn same limit is the\namount of entities that will\nbe spawned if the spawn\ntype is the same as this\ntype.'),
                },
                customCode: {
                    variableCodeNote: new Note('Declare Variables'),
                    variableCode: "",
                    codeNote: new Note('Code'),
                    code: "",
                    documentation: new Button('Documentation', () => {window.location.replace('https://pastebin.com/ykNk4rTD')})
                }
            }
        });

        const lastEnemyTemplate = statsMenus.biome.enemies[statsMenus.biome.enemies.length - 1];
        lastEnemyTemplate.addDrop = new Button('Add Drop', () => {BiomeModeManager.addDropsTemplate(lastEnemyTemplate)})
        lastEnemyTemplate.removeDrop = new Button('Remove Drop', () => {BiomeModeManager.removeDropsTemplate(lastEnemyTemplate)})

        updateStatsMenu();

        const enemiesFolder = getChildFolders(statsMenuFolders.biome)[0];
        if(enemiesFolder.isOpen === false){
            clickFolder(undefined, enemiesFolder);
        }

        const newestAddedEnemyFolder = getChildFolders(enemiesFolder).slice(-1)[0];
        if(newestAddedEnemyFolder.isOpen === false){
            clickFolder(undefined, newestAddedEnemyFolder);
        }

        BiomeModeManager.updateDisplayEnemies();
    }
    static generateEffectsTemplate(){
        const effectsList = [
            'passiveHealingBuff', 'armor', ['healAmount', 'healDelay'], 'enemyKnockback', 'wingExtraRange', 'extraRange',
            ['salt', 'maxDamage'], 'speedBuff', 'healthBuff', ['slowdown', 'slowdownTime'], 'range', 'rotateSpeedBuff',
            ['poisonDamage', 'poisonTime'], ['slowdown', 'slowdownTime']
        ];
        const effectDefualtValues = {
            passiveHealingBuff: 9,
            armor: 10,
            healAmount: 10,
            healDelay: 20,
            enemyKnockback: 25,
            wingExtraRange: 0.5,
            extraRange: 1.2,
            salt: 2, 
            maxDamage: 12,
            speedBuff: 30,
            healthBuff: 30,
            slowdown: 0.8,
            slowdownTime: 3,
            range: 1500,
            rotateSpeedBuff: 0.3,
            poisonDamage: 90,
            poisonTime: 65
        }
        const obj = {};
        for(let i = 0; i < effectsList.length; i++){
            let effect = effectsList[i];
            if(!Array.isArray(effect)){
                effect = [effect];
            }

            const effectObject = obj[formatName(effect[0])] = {};

            defineAsUnEnumerable(effectObject, 'statName', {});
            defineAsUnEnumerable(effectObject, 'nameStat', {});

            let enabledText = BiomeModeManager.formatAndShortenName(effect[0]);
            
            effectObject[enabledText + ' Enabled'] = false;

            effectObject.statName.enabled = enabledText + ' Enabled';
            effectObject.nameStat[enabledText + ' Enabled'] = 'enabled'; 

            for(let j = 0; j < effect.length; j++){
                const shortenedName = BiomeModeManager.formatAndShortenName(effect[j], 14);
                effectObject[shortenedName] = effectDefualtValues[effect[j]] ?? 0;
                effectObject.statName[effect[j]] = shortenedName;
                effectObject.nameStat[shortenedName] = effect[j];
            }
        }
        return obj;
    }
    static formatAndShortenName(name, maxLength=10){
        let formattedText = formatName(name);
        if(formattedText.length > maxLength){
            let lastSpaceIndex = 0;
            for(let i = 0; i < formattedText.length; i++){
                if(formattedText[i] === ' ') {
                    formattedText = formattedText.replaceAt(i, i+1, '');
                    i--;
                    lastSpaceIndex = i;
                    continue;
                }
                if(i - lastSpaceIndex > 1) {
                    // if(i - lastSpaceIndex === 5){
                    //     formattedText = formattedText.replaceAt(i, i+1, '.');
                    // } else {
                        formattedText = formattedText.replaceAt(i, i+1, '');
                        i--;
                    // }
                }
            }
        }
        return formattedText;
    }
    static addBiomePetalTemplate(){
        statsMenus.biome.petals.push({
            petalType: new Options(...BiomeModeManager.getAvailablePetalTypes()),
            petalHealth: 10,
            petalDamage: 10,
            petalRadius: 10,
            petalReload: 2.5,
            amountPerSlot: 1,
            stickWithSlot: false,
            special: {
                // effects: {
                //     poison: {
                //         poisonEnabled: false,
                //         poisonDuration: 1,
                //     },
                //     slow: {
                //         slowEnabled: false,
                //         slowDuration: 3,
                //         slowAmount: 0.3,
                //     },
                // },
                effects: BiomeModeManager.generateEffectsTemplate(),
                swsOffsetRadius: 10,
                attackDistanceMult: 1,
                neutralDistanceMult: 1,
                defendDistanceMult: 1,
                summon: {
                    summonEnabled: false,
                    summonType: new Options(...BiomeModeManager.getAvailableEnemyTypes()),
                    smnCooldown: 10,
                    smnIncrement: 1,
                    smnAmount: 1,
                    raritiesBelow: 0,
                    smnVelocity: 0,
                    smnRange: 1000000,
                    smnLifetime: 1000000,
                    killOnSummon: false,
                    killPetsOnDie: true
                },
                projectile: {
                    projectileEnabled: false,
                    projectileType: new Options(...BiomeModeManager.getAvailablePetalTypes()),
                    projSpeed: 20,
                    projCooldown: 1,
                    projLifetime: 5,
                    projAmount: 1,
                    projectileHoming: false,
                    homingAmt: Math.PI / 3,
                    projSpread: 0,
                    killOnShoot: true,
                },
                customCode: {
                    codeEnabled: false,
                    variableCodeNote: new Note('Declare Variables'),
                    variableCode: "",
                    codeNote: new Note('Code'),
                    code: "",
                    documentation: new Button('Documentation', () => {window.location.replace('https://pastebin.com/ykNk4rTD')})
                }
            },
        })

        updateStatsMenu();

        const petalsFolder = getChildFolders(statsMenuFolders.biome)[2];
        if(petalsFolder.isOpen === false){
            clickFolder(undefined, petalsFolder);
        }

        const newestAddedEnemyFolder = getChildFolders(petalsFolder).slice(-1)[0];
        if(newestAddedEnemyFolder.isOpen === false){
            clickFolder(undefined, newestAddedEnemyFolder);
        }

        BiomeModeManager.updatePetalStats();
    }
    static addDropsTemplate(base){
        base.drops.push({
            dropType: new Options(...BiomeModeManager.getAvailablePetalTypes()),
            dropPercentChance: 15,
            minimumTierToDrop: 0
        })

        BiomeModeManager.updateEnemyStats();

        updateStatsMenu();

        const dropsFolder = base.el.drops.firstChild;
        if(dropsFolder.isOpen === false){
            clickFolder(undefined, dropsFolder);
        }

        BiomeModeManager.updateDisplayEnemies();
    }
    static removeDropsTemplate(base){
        base.drops.pop();

        BiomeModeManager.updateEnemyStats();

        updateStatsMenu();

        const dropsFolder = base.el.drops.firstChild;
        if(dropsFolder.isOpen === false){
            clickFolder(undefined, dropsFolder);
        }

        BiomeModeManager.updateDisplayEnemies();
    }
    static addSpecialWavesTemplate(){
        statsMenus.biome.specialWaves.push([]);

        const lastTemplate = statsMenus.biome.specialWaves[statsMenus.biome.specialWaves.length - 1];
        lastTemplate.addEnemy = new Button('Add Enemy', () => {BiomeModeManager.addSpecialWavesEnemyTemplate(lastTemplate)})
        lastTemplate.removeEnemy = new Button('Remove Enemy', () => {BiomeModeManager.removeSpecialWavesEnemyTemplate(lastTemplate)})

        updateStatsMenu();
        BiomeModeManager.updateSpecialWaveStats();

        const specialWavesFolder = getChildFolders(statsMenuFolders.biome)[1];
        if(specialWavesFolder.isOpen === false){
            clickFolder(undefined, specialWavesFolder);
        }

        // const newestAddedSpecialWaveFolder = getChildFolders(specialWavesFolder).slice(-1)[0];
        // if(newestAddedSpecialWaveFolder.isOpen === false){
        //     clickFolder(undefined, newestAddedSpecialWaveFolder);
        // }
    }
    static addSpecialWavesEnemyTemplate(base){
        base.push({
            swEnemyType: new Options(...BiomeModeManager.getAvailableEnemyTypes()),
            swSpawnChance: 1,
        });

        updateStatsMenu();
        BiomeModeManager.updateSpecialWaveStats();
    }
    static removeSpecialWavesEnemyTemplate(base){
        base.pop();
        updateStatsMenu();
        BiomeModeManager.updateSpecialWaveStats();
    }
    static removeSpecialWavesTemplate(){
        statsMenus.biome.specialWaves.pop();
    
        updateStatsMenu();
        BiomeModeManager.updateSpecialWaveStats();

        const specialWavesFolder = getChildFolders(statsMenuFolders.biome)[1];
        if(specialWavesFolder.isOpen === false){
            clickFolder(undefined, specialWavesFolder);
        }
    }
    static getAvailableEnemyTypes(){
        const availableEnemyTypes = getCustomEnemyTypes().filter(k => k !== 'default');
        if(availableEnemyTypes.length === 0) return ['default'];
        return availableEnemyTypes;
    }
    static getAvailablePetalTypes(){
        const availablePetalTypes = getCustomPetalTypes().filter(k => k !== 'default');
        if(availablePetalTypes.length === 0) return ['Basic'];
        return availablePetalTypes
    }
    static removeBiomeEnemyTemplate(){
        statsMenus.biome.enemies.pop();

        updateStatsMenu();

        const enemiesFolder = getChildFolders(statsMenuFolders.biome)[0];
        if(enemiesFolder.isOpen === false){
            clickFolder(undefined, enemiesFolder);
        }

        BiomeModeManager.updateDisplayEnemies();
    }
    static removeBiomePetalTemplate(){
        statsMenus.biome.petals.pop();

        updateStatsMenu();

        const petalsFolder = getChildFolders(statsMenuFolders.biome)[2];
        if(petalsFolder.isOpen === false){
            clickFolder(undefined, petalsFolder);
        }

        BiomeModeManager.updatePetalStats();
    }
    static updateDisplayEnemies(){
        room.enemies = {};
        const enemyTypes = testingGame ? [] : getBiomeEnemyTypes();
        
        for(let i = 0; i < enemyTypes.length; i++){
            const angle = i / enemyTypes.length * Math.PI * 2;
            const enemyRadius = 100;
            room.addNewEnemy(testingEnemyData({type: enemyTypes[i], rarity: 0, x: Math.cos(angle) * (room.radius - enemyRadius), y: Math.sin(angle) * (room.radius - enemyRadius), radius: enemyRadius, hp: 1, mass: 5, damage: 1}));
        }
    }
    static updateEnemyStats(){
        // updating all enemy data in the map like stats and spawnableTypes
        spawnableTypesInBiome = {};

        const enemyStats = getBiomeEnemyStats();

        for(let i = 0; i < enemyStats.length; i++){
            const stats = enemyStats[i];
            spawnableTypesInBiome[stats.enemyType] = typeof stats.spawnChance === 'string' ? parseFloat(stats.spawnChance) : stats.spawnChance;
            powerMultipliers[stats.enemyType] = stats.spawnPower;

            editorBaseStats.enemies[stats.enemyType] = {
                health: stats.enemyHealth,
                damage: stats.enemyDamage,
                radius: stats.enemyRadius,
                speed: stats.speed,
                mass: stats.mass,
                personality: "passive",//stats.personality,
                detectionDistance: stats.detectionDistance,
                drops: stats.drops,
                spawnType: stats.spawnType ?? '__DELETE',
                spawnAmount: stats.spawnAmount ?? '__DELETE',
                spawnCooldown: stats.spawnCooldown ?? '__DELETE',
                spawnSpacing: stats.spawnSpacing ?? '__DELETE',
                spawnRarityOffset: stats.spawnRarityOffset ?? '__DELETE',
                otherSimulateState: stats.otherSimulateState ?? '__DELETE',
                childrenDistance: stats.childrenDistance ?? '__DELETE',
                childrenWanderAngle: stats.childrenWanderAngle ?? '__DELETE',
                childrenWanderDistance: stats.childrenWanderDistance ?? '__DELETE',
                childrenRotateSpeed: stats.childrenRotateSpeed ?? '__DELETE',
                killChildrenOnDie: stats.killChildrenOnDie ?? '__DELETE',
                dieOnChildrenDie: stats.dieOnChildrenDie ?? '__DELETE',
                spawnSameLimit: stats.spawnSameLimit ?? '__DELETE',
                aggroOnChildrenDamage: stats.aggroOnChildrenDamage ?? '__DELETE',
                childrenLookAtParent: stats.childrenLookAtParent ?? '__DELETE',
                aggroChildrenOnDie: stats.aggroChildrenOnDie ?? '__DELETE',
                collideWithOtherEnemies: stats.collideWithOtherEnemies,
                variableCode: (stats.variableCode ?? '__DELETE').replaceAll('\\n', '\n').replaceAll('\\t', '\t'),
                code: (stats.code ?? '__DELETE').replaceAll('\\n', '\n').replaceAll('\\t', '\t')
            };

            for(let key in editorBaseStats.enemies[stats.enemyType]){
                if(editorBaseStats.enemies[stats.enemyType][key] === '__DELETE'){
                    delete editorBaseStats.enemies[stats.enemyType][key];
                }
            }
            
            if(stats.aggroState !== 'none') aggroMap[stats.enemyType] = stats.aggroState;
            else delete aggroMap[stats.enemyType];
            defaultStateMap[stats.enemyType] = stats.defaultState;
        }

        // console.log({spawnableTypesInBiome, enemyStats, powerMultipliers});

        // ... eventually we will have a global Stats object which will store the enemy's hp, damage, etc.
    }
    static updateSpecialWaveStats(){
        specialWaveTypes = [];

        const specialWaveStats = getSpecialWaveStats();

        for(let i = 0; i < specialWaveStats.length; i++){
            specialWaveTypes[i] = {};
            for(let j = 0; j < specialWaveStats[i].length; j++){
                const enemyStats = specialWaveStats[i][j];
                specialWaveTypes[i][enemyStats.swEnemyType] = enemyStats.swSpawnChance;
            }
        }

        // final result: [{enemyType1: spawnChance, enemyType2: spawnChance2, ...}, {...}, ...];
    }
    static updatePetalStats(){
        const petalStats = getBiomePetalStats();
        for(let i = 0; i < petalStats.length; i++){
            const stats = petalStats[i];

            editorBaseStats.petals[stats.petalType] = {
                petalType: stats.petalType,
                damage: stats.petalDamage,
                health: stats.petalHealth,
                radius: stats.petalRadius,
                reload: stats.petalReload,
                petalLayout: stats.petalLayout,
                damageScalers: stats.damageScalers,
                healthScalers: stats.healthScalers,
                attackDistanceMult: stats.attackDistanceMult ?? '__DELETE',
                neutralDistanceMult: stats.neutralDistanceMult ?? '__DELETE',
                defendDistanceMult: stats.defendDistanceMult ?? '__DELETE',

                projectileEnabled: stats.projectileSpeed !== undefined,
                projectileSpeed: stats.projectileSpeed ?? '__DELETE',
                projectileCooldown: stats.projectileCooldown ?? '__DELETE',
                projectileLifetime: stats.projectileLifetime ?? '__DELETE',
                projectileType: stats.projectileType ?? '__DELETE',
                projectileSpread: stats.projectileSpread ?? '__DELETE',
                projectileAmount: stats.projectileAmount ?? '__DELETE',
                projectileHoming: stats.projectileHoming ?? '__DELETE',
                homingCorrection: stats.homingCorrection ?? '__DELETE',
                killOnShoot: stats.killOnShoot ?? '__DELETE',

                summonEnabled: stats.summonEnabled !== undefined,
                summonType: stats.summonType ?? '__DELETE',
                summonCooldown: stats.summonCooldown ?? '__DELETE',
                summonIncrement: stats.summonIncrement ?? '__DELETE',
                summonAmount: stats.summonAmount ?? '__DELETE',
                raritiesBelow: stats.raritiesBelow ?? '__DELETE',
                summonVelocity: stats.summonVelocity ?? '__DELETE',
                summonRange: stats.summonRange ?? '__DELETE',
                summonLifetime: stats.summonLifetime ?? '__DELETE',
                killOnSummon: stats.killOnSummon ?? '__DELETE',
                raritiesBelow: stats.raritiesBelow ?? '__DELETE',
                killPetsOnDie: stats.killPetsOnDie ?? '__DELETE',

                codeEnabled: stats.codeEnabled ?? '__DELETE',
                code: stats.code ?? '__DELETE',
                variableCode: stats.variableCode ?? '__DELETE'
            }

            const effectKeys = ['passiveHealingBuff', 'armor', 'healAmount', 'healDelay', 'enemyKnockback', 'wingExtraRange', 'extraRange', 'salt', 'maxDamage', 'speedBuff', 'healthBuff', 'slowdown', 'slowdownTime', 'range', 'rotateSpeedBuff', 'poisonDamage', 'poisonTime'];
            for(let i = 0; i < effectKeys.length; i++){
                editorBaseStats.petals[stats.petalType][effectKeys[i]] = stats[effectKeys[i]] ?? '__DELETE';
            }

            for(let key in editorBaseStats.petals[stats.petalType]){
                if(editorBaseStats.petals[stats.petalType][key] === '__DELETE'){
                    delete editorBaseStats.petals[stats.petalType][key];
                }
            }

            if(stats.poison !== undefined){
                editorBaseStats.petals[stats.petalType].poison = stats.poison;
            }
        }
    }
}

BiomeModeManager.initEventListeners();

const bounciness = 24;
let dist;
let check;
let massDif1;
let massDif2;
let angle;
class BiomeSimulateManager {
    static simulate(){
        testingFlower.x = testingFlower.headX;
        testingFlower.y = testingFlower.headY;
        if(testingBiomeData.fixedCamera === true) BiomeMouseMoveFunction({pageX: window.mouse.x, pageY: window.mouse.y});
        BiomeSimulateManager.simulateTestingFlower();
        BiomeSimulateManager.simulateWaveSpawning();
        BiomeSimulateManager.simulateEnemies();
        BiomeSimulateManager.simulateCollisions();
        BiomeSimulateManager.pruneDeadEnemies();
        BiomeSimulateManager.checkFlowerDead();
    }
    // FLOWER
    static runBindedSimulation(){
        this.xv += Math.cos(this.angle) * this.magnitude /** dt*/ * flowerSpeed * (this.powder/100 + 1);
        this.yv += Math.sin(this.angle) * this.magnitude /** dt*/ * flowerSpeed * (this.powder/100 + 1);

        this.xv *= this.friction;
        this.yv *= this.friction;

        this.headX += this.xv;
        this.headY += this.yv;

        if(Math.sqrt(this.headX ** 2 + this.headY ** 2) + this.radius > room.radius){
            const angle = Math.atan2(this.headY, this.headX);
            this.headX = Math.cos(angle) * (room.radius - this.radius);
            this.headY = Math.sin(angle) * (room.radius - this.radius);
        }
        
        this.baseX = interpolate(this.baseX, this.headX, 0.4);
        this.baseY = interpolate(this.baseY, this.headY, 0.4);

        this.x = this.headX;
        this.y = this.headY;// for convenience to align with other entities this.x is this headX. This is used in collision detection.

        this.petalRotation += this.petalRotateSpeed;

        this.hp += this.passiveHealing;
        if (this.defending && !this.attacking){
            this.hp += this.defenseHealing;
        }
        if(this.hp > this.maxHp){
            this.hp = this.maxHp;
        }

        for(let i = 0; i < this.petals.length; i++){
            BiomeSimulateManager.runBindedPetalSimulation.bind(this.petals[i])(this, room);
        }

        for(let i = 0; i < this.projectiles.length; i++){
            BiomeSimulateManager.runBindedPetalSimulation.bind(this.projectiles[i])(this, room);
        }
        this.projectiles = this.projectiles.filter(p => p.dead !== true);

        const roomFlowers = room.flowers;
        const roomEnemies = room.enemies;
        room.flowers = room.enemies;
        for(let key in room.flowers){
            room.flowers[key].headX = room.flowers[key].x;
            room.flowers[key].headY = room.flowers[key].y;
        }
        room.enemies = roomFlowers;
        for(let key in room.enemies){
            room.enemies[key].x = room.enemies[key].headX;
            room.enemies[key].y = room.enemies[key].headY;
        }
        window.duringPetSimulations = true;
        for(let i = 0; i < this.pets.length; i++){
            if(this.pets[i]?.target?.dead === true){
                delete this.pets[i].target;
                changeToDefaultState(this.pets[i]);
            }
            BiomeSimulateManager.runBindedEnemySimulation.bind(this.pets[i])(room);
        }
        window.duringPetSimulations = false;
        room.flowers = roomFlowers;
        room.enemies = roomEnemies;
        this.pets = this.pets.filter(p => p.dead !== true || p.deadAnimationTimer < 100);

        BiomeSimulateManager.runBindedUpdatePetalAngles.bind(this)();
    }
    static simulateTestingFlower(){
        BiomeSimulateManager.runBindedSimulation.bind(testingFlower)();
    }
    static updateFlowerInput({x,y}){
        testingFlower.angle = Math.atan2(y,x);
        testingFlower.magnitude = Math.min(220, Math.sqrt(x**2 + y**2));
    }
    static runBindedAttack(state){
        if(state === true){
            this.attacking = true;
        } else if(state === false) {
            this.attacking = false;
        }
        if(this.attacking === true){
            this.petalDistance = attackPetalDistance;
        } else if(this.defending === true){
            this.petalDistance = defendPetalDistance;
        } else {
            this.petalDistance = neutralPetalDistance;
        }
    }
    static runBindedDefend(state){
        if(state === true){
            this.defending = true;
        } else if(state === false) {
            this.defending = false;
        }
        if(this.attacking === true){
            this.petalDistance = attackPetalDistance;
        } else if(this.defending === true){
            this.petalDistance = defendPetalDistance;
        } else {
            this.petalDistance = neutralPetalDistance;
        }
    }
    static runBindedUpdatePetalAngles(referencePetalIndex=0){
        const baseAngle = (this.petals[referencePetalIndex] ?? {angle: 0}).angle;
        let index = 0;

        const totalGroupedPetalsLength = this.petals.filter(p => p.subStackedId === 0).length;

        this.petalRotateSpeed = petalRotateSpeed;
        this.passiveHealing = 0.1;
        this.defenseHealing = 0;
        this.yinYangs = 0;
        this.pickupRadiusMultiplier = 1;
        this.salt = 0;
        this.maxSaltDamage = 0;
        this.powder = 0;
        this.powderHealthNerf = 0;
        this.lastMaxHp = this.maxHp;
        this.maxHp = this.baseMaxHp;
        this.extraRange = 1;

        for(let i = 0; i < this.petals.length; i++){
            this.petals[i].id = i;
            this.petals[i].angle = baseAngle + index / totalGroupedPetalsLength * Math.PI * 2;
            this.petals[i].angleOffset = index / totalGroupedPetalsLength * Math.PI * 2;
            if(this.petals[i].subStackedId === 0){
                index++;
            }

            if(/*this.petals[i].type === 'Faster'*/this.petals[i].stats.rotateSpeedBuff !== undefined){
                this.petalRotateSpeed += this.petals[i].stats.rotateSpeedBuff * 30 / 1000;
            }
            if(this.petals[i].type === 'Yucca'){
                this.defenseHealing += this.petals[i].stats.passiveHealingBuff * 30 / 1000;
            } else if(/*this.petals[i].type === 'Leaf'*/this.petals[i].stats.passiveHealingBuff !== undefined){
                this.passiveHealing += this.petals[i].stats.passiveHealingBuff * 30 / 1000;
            }
            if (this.petals[i].type === "Yin Yang"){
                this.yinYangs++;
            }
            if (/*this.petals[i].type === "Magnet"*/this.petals[i].stats.range !== undefined){
                if (this.pickupRadiusMultiplier < this.petals[i].stats.range/100){
                    this.pickupRadiusMultiplier = this.petals[i].stats.range/100;
                }
            }
            if (/*this.petals[i].type == "Salt"*/this.petals[i].stats.salt !== undefined){
                this.salt += this.petals[i].stats.salt;
                this.maxSaltDamage += this.petals[i].stats.maxDamage;
            }
            if (/*this.petals[i].type == "Powder"*/this.petals[i].stats.speedBuff !== undefined){
                if (this.powder < this.petals[i].stats.speedBuff){
                    this.powder = this.petals[i].stats.speedBuff;
                    if(this.petals[i].type === "Powder")this.powderHealthNerf = this.petals[i].stats.healthNerf;
                }
            }
            if (/*this.petals[i].type == "Cactus"*/this.petals[i].stats.healthBuff !== undefined){
                this.maxHp += this.petals[i].stats.healthBuff;
            }
            if (/*this.petals[i].type == "Third Eye"*/this.petals[i].stats.extraRange !== undefined){
                if (this.extraRange < this.petals[i].stats.extraRange){
                    this.extraRange = this.petals[i].stats.extraRange;
                }
            }
        }

        //---

        if(this.attacking === true){
            this.petalDistance = attackPetalDistance * this.extraRange;
        } else if(this.defending === true){
            this.petalDistance = defendPetalDistance;
        } else {
            this.petalDistance = neutralPetalDistance;
        }

        this.maxHp *= (100 - this.powderHealthNerf)/100;

        if (this.yinYangs % 4 == 1){
            this.petalRotateSpeed *= -1;
        }
        else if (this.yinYangs == 10){
            this.petalRotateSpeed = -0.7;
        }
        else if (this.yinYangs % 2 == 0 && this.yinYangs > 0){
            this.petalRotateSpeed = 0;
        }

        if (this.maxHp != this.lastMaxHp){
            this.hp *= this.maxHp/this.lastMaxHp;
        }
    }
    static flowerTakeDamage(f, damage, source){
        f.hp -= damage;
        f.updateRenderDamage();
        // TODO
        if (source){
            // if (source.stats){
            //     if (source.stats.poison){
            //         let poison = source.stats.poison;
            //         if (this.poisonTaken[0] < poison[0]){
            //             this.poisonTaken[0] = poison[0];
            //         }
            //         if (this.poisonTaken[1] < poison[1]){
            //             this.poisonTaken[1] = poison[1];
            //         }
            //     }
            // }
            if (f.salt > 0){
                if (source.stats){
                    if (source.parent){
                        BiomeSimulateManager.enemyTakeDamage(source.parent, Math.min(damage * f.salt/100, f.maxSaltDamage));
                    }
                    else{
                        BiomeSimulateManager.enemyTakeDamage(source, Math.min(damage * f.salt/100, f.maxSaltDamage))
                    }
                }
            }
        } 
    }
    static checkFlowerDead(){
        if(testingBiomeData.unlimitedHp === true){
            testingFlower.hp = testingFlower.maxHp;
            return;
        }
        if(testingFlower.hp < 0){
            testingGame = false;
            BiomeModeManager.stopTestGame();

            if(window.isIframePlayer === true){
                window.parent.postMessage("that's all folks", window.parent.location.href);
            }
        }
    }
    // PETAL
    static bindedSetPetalStats(type, rarity, parent, multiplier){
        this.stats = JSON.parse(JSON.stringify(editorStats.petals[type][rarity]));
        this.parent = parent;
		if(this.stats.attackDistanceMult)this.attackDistanceMult = this.stats.attackDistanceMult;
        if(this.stats.defendDistanceMult)this.defendDistanceMult = this.stats.defendDistanceMult;
        if(this.stats.neutralDistanceMult)this.neutralDistanceMult = this.stats.neutralDistanceMult;
        if(this.stats.code !== undefined) initFlowrCode(this, this.stats.code, this.stats.variableCode);
    }
    static runBindedPetalSimulation(parent, room){
        if(this.dead === true || this.dying === true){
            this.reload -= 1 / 30;
            if(this.reload < 0){
                this.reload = this.maxReload;
                this.hp = this.maxHp;
                this.dead = false;
                this.sendRevive = true;
                this.distance = -parent.radius;
                this.dv = 0;
            }
        }

        if(BiomeSimulateManager.customSimulateMap(this, room) === true){
            return;
        }

        this.angle = parent.petalRotation + this.angleOffset;

        let petalDistance = parent.petalDistance;
        if(parent.attacking === true){
            if(this.attackDistanceMult !== undefined){
                petalDistance *= this.attackDistanceMult
            }
        } else if(parent.defending === true){
            if(this.defendDistanceMult !== undefined){
                petalDistance *= this.defendDistanceMult;
            }
        } else {
            if(this.neutralDistanceMult !== undefined){
                petalDistance *= this.neutralDistanceMult;
            }
        }

        if (this.stats.wingExtraRange){
            if (parent.attacking){
                this.time ++;
                petalDistance *= 1.5;
                petalDistance *= (Math.cos(this.time/4.2 + this.id * Math.PI/3)*this.stats.wingExtraRange+1)
            }
            else{
                this.time = -1.57 * 5;
            }
        }
        
        // if (this.type === "Wing"){
        //     if (parent.attacking){
        //         this.time ++;
        //         petalDistance *= 1.5;
        //         petalDistance *= (Math.sin(this.time/5)/2+1)
        //     }
        //     else{
        //         this.time = -1.57 * 5;
        //     }
        // }

        this.dv += (petalDistance - this.distance) / 4.85; 

        this.distance += this.dv;

        let offsetAngle = this.offset.angle;
        // this is always false for editor petals
        // if (this.stats.stickParentRotation == true){
        //     offsetAngle += this.angle;
        // }

        this.x = parent.baseX + Math.cos(this.angle) * (this.distance) + Math.cos(offsetAngle) * this.offset.distance;
        this.y = parent.baseY + Math.sin(this.angle) * (this.distance) + Math.sin(offsetAngle) * this.offset.distance;

        this.dv *= 0.68;
    }
    static customSimulateMap(petal, room) {
        if(petal.petRef !== undefined && petal.stats.summonCooldown !== undefined && (petal.stats.summonRange < 10000 || petal.stats.summonVelocity !== 0 || petal.stats.summonLifetime <= 10000)){
            for(let i = 0; i < petal.petRef.length; i++){
                const summon = petal.petRef[i];
                if(petal.stats.summonVelocity !== 0){
                    summon.x += summon.summonVelocity.x;
                    summon.y += summon.summonVelocity.y;
                    summon.summonVelocity.x *= 0.72;
                    summon.summonVelocity.y *= 0.72;
                }
                if(petal.stats.summonRange < 10000){
                    const dist = Math.sqrt((petal.parent.headX - summon.x) ** 2 + (petal.parent.headY - summon.y) ** 2);
                    if(dist > petal.stats.summonRange){
                        const angle = Math.atan2(summon.y - petal.parent.headY, summon.x - petal.parent.headX);
                        summon.x = petal.parent.headX + Math.cos(angle) * petal.stats.summonRange;
                        summon.y = petal.parent.headY + Math.sin(angle) * petal.stats.summonRange;
                    }
                }
                if(summon.summonLifetime !== undefined){
                    summon.summonLifetime--;
                    if(summon.summonLifetime < 0){
                        BiomeSimulateManager.enemyTakeDamage(summon, summon.hp + 1, petal.parent, petal);
                    }
                }
            }
        }
        if(petal.dying === true || petal.dead === true){
            if(petal.petRef !== undefined && petal.stats.killPetsOnDie === true){
                for(let i = 0; i < petal.petRef.length; i++){
                    BiomeSimulateManager.enemyTakeDamage(petal.petRef[i], petal.petRef[i].hp + 1, petal.parent, petal);
                }
                petal.petRef = [];
            }
            return false;
        }
        if(petal.isProjectile === true){
            // we are a projectile
            petal.x += petal.xv;
            petal.y += petal.yv;
            petal.lifeTime--;
            if(petal.lifeTime <= 0){
                BiomeSimulateManager.petalTakeDamage(petal, petal.hp + (petal.stats.armor ?? 0) + 1);
                petal.deadPosition = {x: petal.render.x, y: petal.render.y};
            }
            return true;
        }
        if(petal.isHealingProjectile === true){
            petal.lifeTime--;
            if(!petal.relativeX){
                petal.relativeX = petal.target.x - petal.x;
                petal.relativeY = petal.target.y - petal.y;
            }
            if(petal.target){
                if (!petal.target.dead){
                    petal.relativeX *= 0.7;
                    petal.relativeY *= 0.7;
                    petal.x = petal.target.x + petal.relativeX;
                    petal.y = petal.target.y + petal.relativeY;
                    let dist = (petal.target.x - petal.x)**2 + (petal.target.y - petal.y)**2;
                    if (dist < petal.target.radius ** 2 + petal.radius ** 2){
                        petal.lifeTime = 0;
                        petal.target.hp += petal.stats.healAmount;
                        if (petal.target.hp > petal.target.maxHp){
                            petal.target.hp = petal.target.maxHp;
                        }
                    }
                }
                else{
                    petal.lifeTime = 0;
                }
            }
            else{
                petal.lifeTime = 0;
            }
            if(petal.lifeTime <= 0){
                BiomeSimulateManager.petalTakeDamage(petal, petal.hp + 1 + (petal.stats.armor ?? 0));
            }
            return true;
        }
        if(petal.stats.projectileSpeed !== undefined){
            // we are a projectile spawner
            if(petal.spawnTimer === undefined){
                petal.spawnTimer = petal.stats.projectileCooldown * 30;
            }
            if(petal.dead !== true && petal.dying !== true)petal.spawnTimer--;

            if(petal.spawnTimer < 0 && (petal.parent.attacking === true || petal.parent.defending === true)){
                delete petal.spawnTimer;

                let minAngle = null;
                if(petal.stats.projectileHoming === true){
                    let minDist = 500;
                    const flowerToPetalAngle = Math.atan2(petal.y - petal.parent.headY, petal.x - petal.parent.headX);
                    for(let key in room.enemies){
                        const e = room.enemies[key];
                        const dist = Math.sqrt((e.x-petal.x)**2+(e.y-petal.y)**2);
                        if(dist < minDist){
                            const newAngle = Math.atan2(e.y - petal.y, e.x - petal.x);
                            if(Math.abs(shortAngleDist(newAngle, flowerToPetalAngle)) < petal.stats.homingCorrection){
                                minAngle = newAngle;
                                minDist = dist;
                            }
                        }
                    }
                    if(minAngle !== null){
                        angle = minAngle;
                    }
                }

                for(let i = 0; i < petal.stats.projectileAmount; i++){
                    let angle = minAngle !== null ? minAngle : petal.angle + ((i+1) / petal.stats.projectileAmount - 0.5) * petal.stats.projectileSpread;

                    // fire missile
                    const customProjectiles = testingPetalData(0, 0, petal.stats.projectileType, petal.rarity).map(p => new Petal(p));
                    for(let j = 0; j < customProjectiles.length / petal.stats.petalLayout.length; j++){
                        const customProjectile = customProjectiles[j];
                        BiomeSimulateManager.bindedSetPetalStats.bind(customProjectile)(petal.stats.projectileType, petal.rarity, petal.parent);
                        // new Petal({...petal, type: "Custom", customType: petal.stats.projectileType/*, petalLayout: [[{}]]*/});
                        customProjectile.isProjectile = true;
                        customProjectile.parent = petal.parent
                        customProjectile.xv = Math.cos(angle) * petal.stats.projectileSpeed;
                        customProjectile.yv = Math.sin(angle) * petal.stats.projectileSpeed;
                        customProjectile.lifeTime = petal.stats.projectileLifetime * 30;
                        customProjectile.selfAngle = customProjectile.render.selfAngle = Math.atan2(customProjectile.yv, customProjectile.xv);
                        customProjectile.render.x = petal.render.x;
                        customProjectile.render.y = petal.render.y;
                        customProjectile.x = petal.x;
                        customProjectile.y = petal.y;
                        if(customProjectiles.length > 0){
                            // const angle = (i / customProjectiles.length) * Math.PI * 2;
                            customProjectile.x += Math.cos(customProjectile.offset.angle) * customProjectile.offset.distance;
                            customProjectile.y += Math.sin(customProjectile.offset.angle) * customProjectile.offset.distance;
                        }
                        BiomeSimulateManager.parentAddProjectile(petal.parent, customProjectile);
                    }
                }
                
                if(petal.stats.killOnShoot === true){
                    petal.shotFlag = true;
                    BiomeSimulateManager.petalTakeDamage(petal, petal.hp + 1);
                }
                return true;
            }
        }
        if(petal.stats.summonCooldown !== undefined){
            if(petal.summonTimer === undefined){
                petal.summonTimer = petal.stats.summonCooldown * 30;
            }
            if(petal.petRef === undefined){
                petal.petRef = [];
            }
            if(petal.dead !== true && petal.dying !== true)petal.summonTimer--;

            petal.petRef = petal.petRef.filter(p => p.dead !== true || p.deadAnimationTimer < 100);

            if(petal.summonTimer < 0){
                delete petal.summonTimer;

                const spawnAmount = Math.min(petal.stats.summonIncrement, petal.stats.summonAmount - petal.petRef.length);
                
                for(let i = 0; i < spawnAmount; i++){
                    let spawnRarity = Math.min(9,Math.max(0, petal.rarity - petal.stats.raritiesBelow));
                    const stats = editorStats.enemies[petal.stats.summonType][spawnRarity];
                    const summon = new Enemy(testingEnemyData({
                        x: petal.x,
                        y: petal.y,
                        type: petal.stats.summonType,
                        rarity: spawnRarity,
                        radius: stats.radius,
                        hp: stats.health,
                        mass: stats.mass,
                        damage: stats.damage
                    }));
                    BiomeSimulateManager.bindedSetEnemyStats.bind(summon)(summon.customType, summon.rarity, undefined);
                    summon.isCustomSummon = true;
                    initEnemyState(summon);

                    summon.team = 'flower';

                    if(petal.stats.summonVelocity !== 0){
                        const angle = petal.parent.angle;
                        summon.summonVelocity = {
                            x: Math.cos(angle) * petal.stats.summonVelocity,
                            y: Math.sin(angle) * petal.stats.summonVelocity
                        };
                    }

                    petal.petRef.push(summon);
                    summon.collisionType = 'pet';

                    if(petal.stats.summonLifetime <= 10000){
                        summon.summonLifetime = petal.stats.summonLifetime * 30;
                    }

                    summon.petalRef = petal;
                    summon.parentRef = petal.parent;
                    summon.flowerRef = petal.parent;

                    // summon.changeState("pet");
                    BiomeSimulateManager.parentAddPet(petal.parent, summon);

                    if(petal.stats.killOnSummon){
                        BiomeSimulateManager.petalTakeDamage(petal, petal.hp + 1);
                    }
                }

                if(spawnAmount !== 0){
                    return true;
                }
            }
        }
        if(petal.stats.healAmount !== undefined){
            // petal.stats.heal, petal.stats.healDelay
            if(petal.healCooldown === undefined)petal.healCooldown = petal.stats.healDelay;
            petal.healCooldown--;
            if(petal.healCooldown < 0){
                let healedFlower = null;
                if (petal.parent.hp < petal.parent.maxHp){
                    healedFlower = petal.parent;
                }
                else{
                    // let minDist = 200;
                    // for(let i of Object.keys(room.flowers)){
                    //     let flower = room.flowers[i];
                    //     let dist = Math.sqrt((flower.x - petal.x)**2 + (flower.y - petal.y)**2);
                    //     if (dist < minDist && flower.hp < flower.maxHp){
                    //         minDist = dist;
                    //         healedFlower = flower;
                    //     }
                    // }
                }
                if (healedFlower){
                    delete petal.healCooldown;
                    // fire missile
                    const customProjectiles = testingPetalData(0, 0, petal.customType, petal.rarity).map(p => new Petal(p));
                    for(let i = 0; i < customProjectiles.length; i++){
                        const customProjectile = customProjectiles[i];
                        BiomeSimulateManager.bindedSetPetalStats.bind(customProjectile)(petal.customType, petal.rarity, petal.parent);
                        // roseProjectile.xv = 0;
                        // roseProjectile.yv = 0;
                        // roseProjectile.lifeTime = 5 * 30;// 5s
                        // roseProjectile.target = healedFlower;
                        // defineProjectileUpdatePack(roseProjectile);
                        // petal.parent.addProjectile(roseProjectile);
                        // petal.projectileRef = [roseProjectile];
                        customProjectile.isHealingProjectile = true;
                        customProjectile.target = healedFlower;
                        customProjectile.parent = petal.parent;
                        customProjectile.xv = 0;
                        customProjectile.yv = 0;
                        customProjectile.lifeTime = 5 * 30;
                        customProjectile.selfAngle = customProjectile.render.selfAngle = Math.atan2(customProjectile.yv, customProjectile.xv);
                        customProjectile.render.x = petal.render.x;
                        customProjectile.render.y = petal.render.y;
                        customProjectile.x = petal.x;
                        customProjectile.y = petal.y;
                        if(customProjectiles.length > 0){
                            // const angle = (i / customProjectiles.length) * Math.PI * 2;
                            customProjectile.x += Math.cos(customProjectile.offset.angle) * customProjectile.offset.distance;
                            customProjectile.y += Math.sin(customProjectile.offset.angle) * customProjectile.offset.distance;
                        }
                        BiomeSimulateManager.parentAddProjectile(petal.parent, customProjectile);
                    }
                    petal.shotFlag = true;
                    BiomeSimulateManager.petalTakeDamage(petal, petal.hp + 1 + (petal.stats.armor ?? 0));
                    return true;
                }
            }
        }
        if(petal.stats.code !== undefined){
            flowrCode(petal, room, petal.stats.code);
            return true;
        }
        return false;
    }
    static parentAddProjectile(parent, p){
        parent.projectiles.push(p);
    }
    static parentAddPet(parent, p){
        parent.pets.push(p);
    }
    static petalTakeDamage(p, takenDamage, source){
        if (p.stats.armor){
            takenDamage -= p.stats.armor;
            if (takenDamage < 0){
                takenDamage = 0;
            }
        }
        p.hp -= takenDamage;

        if(p.onTakeDamageCode !== undefined){
            const lastCI = p.codeIndexes;
            const lastQI = p.queryIndexes;
            preprocessCode(p, p.onTakeDamageCode);
			flowrCode(p, room, p.onTakeDamageCode);
            p.codeIndexes = lastCI;
            p.queryIndexes = lastQI;
		}

        if(takenDamage > 0)p.updateRenderDamage();
        if(p.hp < 0){
            BiomeSimulateManager.petalOnKill(p);
        }
        // this.sendTakeDamage = true;
    }
    static petalOnKill(p){
        p.update({dead: true});

        if(p.onKillCode !== undefined){
            const lastCI = p.codeIndexes;
            const lastQI = p.queryIndexes;
            preprocessCode(p, p.onKillCode);
			flowrCode(p, room, p.onKillCode);
            p.codeIndexes = lastCI;
            p.queryIndexes = lastQI;
		}
    }
    // ENEMY
    static simulateEnemies(){
        for(let id in room.enemies){
            BiomeSimulateManager.runBindedEnemySimulation.bind(room.enemies[id])(room);
        }
    }
    static runBindedEnemySimulation(room){
        if(this.stateData?.detectionDistance !== undefined){
			this.stateData.detectionDistance += 0.003 * this.radius;
		}
        //Poison
        if (this.poisonTaken[0] > 0){
            BiomeSimulateManager.enemyTakeDamage(this, this.poisonTaken[1]/30, this.poisonTaken[2]);
            this.poisonTaken[0] -= this.poisonTaken[1]/30;
            if (this.poisonTaken[0] <= 0){
                this.poisonTaken[1] = 0;
            }
        }
        this.slowdownAmount = 1;
        if(Object.keys(this.slowdown).length !== 0){
            let minAmounts = {};
            for(let i of this.slowdown){
                let slowdown = 1-(i.slowdown/100);
                if (i.type == "Pincer"){
                    if (!minAmounts["Pincer"]){
                        minAmounts["Pincer"] = 1;
                    }
                    minAmounts["Pincer"] *= slowdown;

                    if (minAmounts["Pincer"] < 0.1){
                        minAmounts["Pincer"] = 0.1;
                    }
                }
                else{
                    if (minAmounts[i.type]){
                        if (minAmounts[i.type] < slowdown){
                            continue;
                        }
                    }
                    minAmounts[i.type] = slowdown;
                }
                i.time -= 1/30;
            }
            for (let i of Object.keys(minAmounts)){
                this.slowdownAmount *= minAmounts[i];
            }
            this.slowdown = this.slowdown.filter((e) => e.time > 0);
        }

        simulateMap[/*this.type*/this.state](this, room);

        if(Math.sqrt(this.x ** 2 + this.y ** 2) + this.radius > room.radius){
            if(this.state === 'projectile'){
                BiomeSimulateManager.enemyTakeDamage(this, this.hp + 1, {});
            } else {
                const angle = Math.atan2(this.y, this.x);

                // if we're facing towards the arena bounds while idle then change our angle
                if(this.target === undefined && shortAngleDist(angle, this.angle) < Math.PI / 2){
                    this.angle = interpolateDirection(this.angle, angle + Math.PI, 0.5);
                }

                this.x = Math.cos(angle) * (room.radius - this.radius);
                this.y = Math.sin(angle) * (room.radius - this.radius);
            }
        }

        if(this.state === 'stationary'){
            return;
        }

        if(this.target !== undefined && (this?.target?.dead === true || (room.flowers[this?.target?.id ?? -1] === undefined && this.team !== "flower")) && !(['HoneyProjectile'].includes(this?.target?.type) && this?.target?.dead === false && this?.target?.parent?.dead === false)){
            delete this.target;
            if(this.team !== "flower"){
                changeToDefaultState(this);
            }
        }
    }
    static enemyTakeDamage(e, damage, source, sourcePetal){
        e.hp -= damage;
        e.updateRenderDamage();

        if(e.onTakeDamageCode !== undefined){
            const lastCI = e.codeIndexes;
            const lastQI = e.queryIndexes;
            preprocessCode(e, e.onTakeDamageCode);
			flowrCode(e, room, e.onTakeDamageCode);
            e.codeIndexes = lastCI;
            e.queryIndexes = lastQI;
		}

        if(e.team === "flower" && e.isCustomSummon !== true){
            return;
        }
        
        if(e.growParentRef !== undefined && e.growParentRef.stats.aggroOnChildrenDamage === true){
            BiomeSimulateManager.enemyTakeDamage(e.growParentRef, 0, source, sourcePetal);
        }
        if(e.state === "grow"){
            if(e.stats.killChildrenOnDie === true && e.hp <= 0 && e.dyingAnimationActive !== true){
                for(let i = 0; i < e.children.length; i++){
                    if(e.children[i].dead === true){
                        continue;
                    }
                    if(e.children[i].hp <= 0 && e.hp <= 0) continue;
                    BiomeSimulateManager.enemyTakeDamage(e.children[i], e.children[i].hp + 1);
                }
            }
            if(source){
                if(aggroMap[e.customType ?? e.type] !== undefined){
                    changeState(e, aggroMap[e.customType ?? e.type]);
                }
                e.target = source;
            }
        }
        else if ((e.personality == "neutral" || (e.personality === "detecting" && e.state !== e.stateData.aggroState) || (aggroMap[e.customType ?? e.type] !== undefined && aggroMap[e.customType ?? e.type] !== e.state)) && source){
            if(e.personality === "neutral" || e.peronality === "detecting"){
                if(aggroMap[e.customType ?? e.type] !== undefined){
                    changeState(e, aggroMap[e.customType ?? e.type]);
                } else {
                    changeState(e, "aggressive");
                }
            } else {
                changeState(e, aggroMap[e.customType ?? e.type]);
            }
            e.target = source;
        }

        if (sourcePetal) {
			if (sourcePetal.stats) {
				if (sourcePetal.stats.poison) {
					let poison = sourcePetal.stats.poison;
					if (e.poisonTaken[0] < poison[0]) {
						e.poisonTaken[0] = poison[0];
					}
					if (e.poisonTaken[1] < poison[1]) {
						e.poisonTaken[1] = poison[1];
					}
					e.poisonTaken[2] = source;
				}
				if (sourcePetal.stats.slowdown) {
					let slowdown = sourcePetal.stats.slowdown[e.rarity];
					e.slowdown.push({
						type: sourcePetal.type,
						slowdown: slowdown,
						time: sourcePetal.stats.slowdownTime
					});
				}
                if(sourcePetal.stats.enemyKnockback){
					const angle = Math.atan2(sourcePetal.parent.y - e.y, sourcePetal.parent.x - e.x);
					e.xv -= Math.cos(angle) * sourcePetal.stats.enemyKnockback;
					e.yv -= Math.sin(angle) * sourcePetal.stats.enemyKnockback;
				}
				// if (sourcePetal.stats.effect) {
				// 	if (sourcePetal.type == "Dandelion"){
				// 		this.healingReduction += sourcePetal.stats.effect * 1/30;
				// 	}
				// }
			}
		}

        if(e.hp <= 0 && e.dyingAnimationActive !== true){
            if(e.stats.aggroChildrenOnDie === true){
                for(let i = 0; i < e.children.length; i++){
                    if(e.children[i].dead === true || e.children[i].hp <= 0){
                        continue;
                    }
                    BiomeSimulateManager.enemyTakeDamage(e.children[i], 0, source, sourcePetal);
                }
            }
            if(e.isCustomSummon === true){
                e.dead = true;
            } else {
                BiomeSimulateManager.enemyOnKill(e);
            }
        }
    }
    static bindedSetEnemyStats(type, rarity, multiplier){
        this.stats = JSON.parse(JSON.stringify(editorStats.enemies[type][rarity]));
		if (multiplier) {
			for (let i of Object.keys(multiplier)) {
				if (this.stats[i]) {
					this.stats[i] *= multiplier[i];
				}
			}
			if (multiplier.angle) {
				this.angle = multiplier.angle;
			}
		}
        this.rarity = rarity;
		this.hp = this.stats.health;
		this.maxHp = this.stats.health;
		this.xp = 0;// in editor this is 0
		this.damage = this.stats.damage;
		this.radius = this.stats.radius;
		this.speed = this.stats.speed;
        this.mass = this.stats.mass;

        this.slowdownAmount = 1;

		this.vx = Math.cos(this.angle) * this.speed;
		this.vy = Math.sin(this.angle) * this.speed;
		this.lastRadius = this.radius;

        this.drops = this.stats.drops;
        this.personality = this.stats.personality;

        this.poisonTaken = [0, 0, null];
		this.healingReduction = 0;
        this.slowdown = [];

        this.collideOtherEnemies = this.stats.collideWithOtherEnemies;
    }
    static enemyOnKill(e){
        e.petalsToDrop = [];
        e.dyingAnimationActive = true;
        room.removeEnemy(e.id);
        for(let dropType of Object.keys(e.drops)){
            let dropTable = e.drops[dropType];
            let random = Math.random()*100;
            let dropRarity = -1;
            for(let j = 0; j < dropTable.length; j++){
                random -= dropTable[j];
                if (random < 0){
                    dropRarity = j;
                    break;
                }
            }
            
            if(dropRarity !== -1){
                e.petalsToDrop.push({type: dropType, rarity: dropRarity});
            }
        }
        BiomeSimulateManager.addDrops(e);

        if(e.onKillCode !== undefined){
            const lastCI = e.codeIndexes;
            const lastQI = e.queryIndexes;
            preprocessCode(e, e.onKillCode);
			flowrCode(e, room, e.onKillCode);
            e.codeIndexes = lastCI;
            e.queryIndexes = lastQI;
		}
    }
    static addDrops(e){
        const offsetRadius = e.petalsToDrop.length === 1 ? 0 : 75;
        for(let i = 0; i < e.petalsToDrop.length; i++){
            const {type, rarity} = e.petalsToDrop[i];
            const offset = {
                x: offsetRadius * Math.cos(i / e.petalsToDrop.length * Math.PI * 2),
                y: offsetRadius * Math.sin(i / e.petalsToDrop.length * Math.PI * 2),
            }

            let petalAmount = 1;
            const stats = editorBaseStats.petals[type].petalLayout;
            if(stats.length > 1) petalAmount = stats.length;
            else if(stats[0].length > 1) petalAmount = stats[0].length;

            const lastTestPetalAmount = testingBiomeData.testPetalAmount;
            testingBiomeData.testPetalAmount = 1;
            const testingPetalData = testingFlowerPetalData({type: type === "Basic" ? "Basic" : "Custom", customType: type, rarity});
            BiomeSimulateManager.addPetalContainer({petal: testingPetalData[0], petalAmount: /*testingPetalData.length*/petalAmount, x: e.x + offset.x, y: e.y + offset.y, w: 50, h: 50, radius: 50, originalX: e.x, originalY: e.y, id: generateId()});
            testingBiomeData.testPetalAmount = lastTestPetalAmount;
        }
    }
    static pruneDeadEnemies(){
        for(let id in room.enemies){
            if(room.enemies[id].dead === true && room.enemies[id].deadAnimationTimer > 166){
                delete room.enemies[id];
            }
        }
    }
    // ROOM IN GENERAL
    static initRoomForGame(){
        room.flowers = {};
        testingFlower = room.addNewFlower(testingFlowerData());
        window.selfId = 0;
        for(let i = 0; i < testingFlower.petals.length; i++){
            BiomeSimulateManager.bindedSetPetalStats.bind(testingFlower.petals[i])(testingFlower.petals[i].customType ?? 'Basic', testingFlower.petals[i].rarity, testingFlower);
        }

        room.enemies = {};
        room.wave = Math.min(300, Math.max(1, testingBiomeData.testWave));
        room.radius = roomRadiusFunction(room.wave);
        room.waveData = waveSpawnData(room.wave, testingBiomeData.specialWave);
        room.waveSpawningEnded = false;
        room.waveTimer = 0;
        room.petalContainers = {};
    }
    static unInitRoomForGame(){
        room.enemies = {};
        room.radius = 500;
        room.flowers = {};
        room.waveData = [];
        room.petalContainers = {};
    }
    static simulateWaveSpawning(){
        if(room.waveSpawningEnded !== true) {
            if(room.waveTimer % 60 === 0){
                if(room.waveTimer / 60 >= room.waveData.length){
                    room.waveSpawningEnded = true;
                } else {
                    const enemies = room.waveData[room.waveTimer / 60];
                    for(let i = 0; i < enemies.length; i++){
                        BiomeSimulateManager.spawnEnemyInRoom(enemies[i]);
                    }
                }
            }
            room.waveTimer++;
        } else if(Object.keys(room.enemies).length <= 4 || room.waveTimer/60 >= room.waveData.length * 3){
            // if there's <= 4 enemies left, then start a new wave
            room.wave++;
            room.radius = roomRadiusFunction(room.wave);
            room.waveTimer = 0;
            
            // room.specialWave = false;

            // if (room.wave > 10){
            // if (Math.random() * 100 < room.specialChance){
            //     room.specialWave = true;
            //     //Decrease chance by 18% if you get a special
            //     room.specialChance -= 18;
            //     if (room.specialChance < 0){
            //         room.specialChance = 0;
            //     }
            // }
            // else{
            //     //Increase chance by 3% for each non-special
            //     room.specialChance += 3;
            // }
            // }
            
            room.waveData = waveSpawnData(room.wave, testingBiomeData.specialWave);
            room.waveSpawningEnded = false;
        } else {
            room.waveTimer++;
        }
    }
    static spawnEnemyInRoom(spawnData={type:"Ladybug", rarity: 0}, extraParams={}){     
        let spawnRadius = Math.random()**0.6 * room.radius;
        let spawnAngle = Math.random() * Math.PI * 2;
        const stats = editorStats.enemies[spawnData.type][spawnData.rarity];
        let newEnemy = testingEnemyData({
            x: spawnRadius * Math.cos(spawnAngle),
            y: spawnRadius * Math.sin(spawnAngle),
            type: spawnData.type,
            rarity: spawnData.rarity,
            radius: stats.radius,
            hp: stats.health,
            mass: stats.mass,
            damage: stats.damage
        });

        for(let key in extraParams){
            newEnemy[key] = extraParams[key];
        }

        if(extraParams.forceSpawn !== true){
            let radiusToSpawn = room.radius;
            mainLoop: for(let i = 0; i < 10; i++){
                for(let key in room.flowers){
                    const f = room.flowers[key];
                    if((newEnemy.x - f.x) ** 2 + (newEnemy.y - f.y) ** 2 < (newEnemy.radius * 3 + f.radius + 200 + room.radius / 10) ** 2){
                        spawnRadius = Math.random()**0.6 * radiusToSpawn;
                        spawnAngle = Math.random() * Math.PI * 2;
                        newEnemy.x = Math.cos(spawnAngle) * spawnRadius;
                        newEnemy.y = Math.sin(spawnAngle) * spawnRadius;
                        continue mainLoop;
                    }
                }
                break mainLoop;
            }
        }

        const e = new Enemy(newEnemy);
        BiomeSimulateManager.bindedSetEnemyStats.bind(e)(newEnemy.customType, newEnemy.rarity, undefined);
        if(extraParams.spawnSameLimit !== undefined) e.spawnSameLimit = extraParams.spawnSameLimit;
        initEnemyState(e);
        if(window.duringPetSimulations === true){
            e.team = 'flower';
            e.collisionType = 'pet';

            e.isCustomSummon = true;

            e.flowerRef = e.parentRef = testingFlower;

            BiomeSimulateManager.parentAddPet(testingFlower, e);

            return e;
        } else {
            return room.addNewEnemy(e);
        }
    }
    static addPetalContainer(data){
        room.addNewPetalContainer(data);

        // this isn't perfect but it will curb the amount of petal containers to a reasonable level.
        let pcs = Object.keys(room.petalContainers);
        let petalContainerLen = pcs.length;
        while(petalContainerLen > 100){
            petalContainerLen--;
            const randomPC = pcs[Math.floor(Math.random() * pcs.length)];
            delete room.petalContainers[randomPC];
        }
    }
    // COLLISION
    static simulateCollisions(){
        for(let key in room.enemies){
            BiomeSimulateManager.collideFlowerEnemy(testingFlower, room.enemies[key]);
            for(let i = 0; i < testingFlower.petals.length; i++){
                BiomeSimulateManager.collidePetalEnemy(testingFlower.petals[i], room.enemies[key]);
            }
            for(let i = 0; i < testingFlower.projectiles.length; i++){
                BiomeSimulateManager.collidePetalEnemy(testingFlower.projectiles[i], room.enemies[key]);
            }
            for(let i = 0; i < testingFlower.pets.length; i++){
                BiomeSimulateManager.collidePetEnemy(testingFlower.pets[i], room.enemies[key]);
                for(let j = 0; j < testingFlower.pets.length; j++){
                    if(i >= j) continue;
                    BiomeSimulateManager.collideEnemyEnemy(testingFlower.pets[i], testingFlower.pets[j]);
                }
            }
            for(let key2 in room.enemies){
                if(key >= key2) continue;
                BiomeSimulateManager.collideEnemyEnemy(room.enemies[key], room.enemies[key2]);
            }
        }
        for(let key in room.petalContainers){
            BiomeSimulateManager.collideFlowerPetalContainer(testingFlower, room.petalContainers[key]);
        }
    }
    static collideFlowerEnemy(flower, enemy){
        if(enemy.dyingAnimationActive === true) return;
        dist = flower.radius + enemy.radius;
        check = (flower.x-enemy.x)**2 + (flower.y-enemy.y)**2;
        if(check < dist**2){
            check = Math.sqrt(check);

            massDif1 = enemy.mass/(flower.mass+enemy.mass);
            massDif2 = flower.mass/(flower.mass+enemy.mass);
            
            angle = Math.atan2(flower.y - enemy.y, flower.x - enemy.x);

            enemy.x -= Math.cos(angle) * massDif1 * ((dist - check) + bounciness);
            enemy.y -= Math.sin(angle) * massDif1 * ((dist - check) + bounciness);
            flower.headX += Math.cos(angle) * massDif2 * ((dist - check) + bounciness);
            flower.headY += Math.sin(angle) * massDif2 * ((dist - check) + bounciness);

            // if you hit something you should also slow down to prevent such rapid re-hitting of the enemies
            flower.xv += Math.cos(angle) * massDif2 * 85;
            flower.yv += Math.sin(angle) * massDif2 * 85;

            BiomeSimulateManager.flowerTakeDamage(flower, enemy.damage, enemy);
            BiomeSimulateManager.enemyTakeDamage(enemy, flower.damage, flower);
        }
    }
    static collideEnemyEnemy(enemy, enemy2){
        if(enemy.dyingAnimationActive === true) return;
        if(enemy.collideOtherEnemies === false || enemy2.collideOtherEnemies === false){
            return;
        }
        dist = enemy.radius + enemy2.radius;
        check = (enemy.x-enemy2.x)**2 + (enemy.y-enemy2.y)**2;
        if(check < dist**2){
            check = Math.sqrt(check);
    
            massDif1 = enemy2.mass/(enemy.mass+enemy2.mass);
            massDif2 = enemy.mass/(enemy.mass+enemy2.mass);
            
            angle = Math.atan2(enemy2.y - enemy.y, enemy2.x - enemy.x);
    
            enemy.x -= Math.cos(angle) * massDif1 * (dist - check);
            enemy.y -= Math.sin(angle) * massDif1 * (dist - check);
            enemy2.x += Math.cos(angle) * massDif2 * (dist - check);
            enemy2.y += Math.sin(angle) * massDif2 * (dist - check); 
        }
    }
    static collidePetEnemy(pet, enemy){
        if(enemy.dyingAnimationActive === true || pet.dyingAnimationActive === true) return;
        // if(pet.collideOtherEnemies === false || enemy.collideOtherEnemies === false){
        //     return;
        // }
        dist = pet.radius + enemy.radius;
        check = (pet.x-enemy.x)**2 + (pet.y-enemy.y)**2;
        if(check < dist**2){
            check = Math.sqrt(check);
    
            massDif1 = enemy.mass/(pet.mass+enemy.mass);
            massDif2 = pet.mass/(pet.mass+enemy.mass);
            
            angle = Math.atan2(enemy.y - pet.y, enemy.x - pet.x);
    
            pet.x -= Math.cos(angle) * massDif1 * (dist - check);
            pet.y -= Math.sin(angle) * massDif1 * (dist - check);
            enemy.x += Math.cos(angle) * massDif2 * (dist - check);
            enemy.y += Math.sin(angle) * massDif2 * (dist - check); 

            BiomeSimulateManager.enemyTakeDamage(enemy, pet.damage, pet.flowerRef);
            BiomeSimulateManager.enemyTakeDamage(pet, enemy.damage);
        }
    }
    static collidePetalEnemy(petal, enemy){
        if(petal.dead === true || petal.dying === true || enemy.dyingAnimationActive === true){
            return;
        }
        dist = petal.radius + enemy.radius;
        check = (petal.x-enemy.x)**2 + (petal.y-enemy.y)**2;
        if(check < dist**2){
            BiomeSimulateManager.enemyTakeDamage(enemy, petal.damage, petal.parent, petal);
    
            if(enemy.hp <= 0){
                return;
            }
            
            BiomeSimulateManager.petalTakeDamage(petal, enemy.damage, enemy);
        }
    }
    static collideFlowerPetalContainer(flower, pc){
        let dist = flower.radius - 25 + 25 * flower.pickupRadiusMultiplier + pc.radius + 10;// +10 just for safety, floating point prescision errors do happen
        let check = (flower.x-pc.x)**2 + (flower.y-pc.y)**2;
        if(check < dist**2){
            room.collectPetalContainer(pc.id);
        }
    }
}