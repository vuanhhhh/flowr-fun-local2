const base = Ref.gui;
let openFolders = {};

function clearMenu(){
    while(base.firstChild){
        base.firstChild.remove();
    }
}

function objectToFolder(object, folderName=object.folderName){
    return base.appendChild(createFolder(object, folderName));
}

function createFolder(object, folderName=object.folderName) {
    const folder = generateFolder(folderName);
    const folderContent = folder.getElementsByClassName('folder-content')[0];

    defineAsUnEnumerable(object, 'el', {});

    for(let key in object){
        // if(excludedProperties[key] === true)continue;
        object.el[key] = folderContent.appendChild(createPropertyInFolder(object, key, object[key]));

        defineAsUnEnumerable(object.el[key], 'parentKey', key);
        for(let i = 0; i < object.el[key].children.length; i++){
            defineAsUnEnumerable(object.el[key].children[i], 'parentKey', key);
        }
    }
    
    for(let i = 0; i < folderContent.children.length; i++){
        folderContent.children[i].classList.add('hidden');
    }
    
    return folder;
}

let gid = 0;
function generateId(){
    return gid++;
}

function createPropertyInFolder(object, key, value){
    const property = document.createElement('div');
    property.classList.add('property');
    property.classList.add('text');

    const isObject = typeof value === 'object' && value !== null;
    const isCode = key === "code" || key === "variableCode";

    if((isObject === false || value?.specialType === "options") && isCode === false){
        if(value === null) value = 'null';
        const propName = document.createElement('span');
        propName.classList.add('property-name');
        propName.innerText = formatName(key);
        property.appendChild(propName);
    } else if(isObject === true && value.specialType === "note"){
        const propName = document.createElement('span');
        propName.classList.add('property-name');
        propName.innerText = value.text;
        property.style.justifyContent = "center";
        property.style.width = "calc(100% - 10px);";
        propName.style.marginRight = "8px";
        property.appendChild(propName);
    }

    const input = isCode === true ? document.createElement('textArea') : document.createElement('input');
    input.maxLength = 50000;
    input.spellcheck = 'false';
    input.id = generateId();
    
    if(typeof value === "number"){
        object[key] = value = Math.round(value * 1000) / 1000;
    }
    input.value = value;
    
    input.oninput = (event) => {
        const targetValue = typeof object[key] === 'number' ? parseFloat(event.target.value) : event.target.value;

        object[key] = targetValue;
        processChange(key, targetValue);
        
        return event.preventDefault();
    }

    if(objectPropertyMap[typeof value] !== undefined){
        objectPropertyMap[typeof value](key, value, {input, property, object});
    } else {
        input.classList.add('property-text-input');
        property.appendChild(input);
    }

    if(typeof value === 'object' && value?.specialType !== "options"){
        property.style.height = 'auto';
    } else if(isCode === true){
        input.classList.add('property-long-text-input');
        input.spellcheck = false;
        // input.style.height = "500px";
        // input.style.width = "75%";
        // if(key === "variableCode"){
        //     // input.style.height = '300px !important';
        //     property.style.height = '300px';
        // } else {
            property.style.height = '500px';
        // }
    }

    return property;
}

function generateFolder(folderName){
    const folder = document.createElement('div');
    folder.classList.add('folder');

    const folderButton = document.createElement('button');
    folderButton.classList.add('folder-button');
    
    folder.folderName = folderName;
    folderButton.innerHTML = '<span class="or">▸</span>&nbsp;' + folder.folderName;
    folder.appendChild(folderButton);

    folderButton.parentElement.isOpen = false;
    folderButton.addEventListener('mousedown', (event) =>
        clickFolder(event, folderButton.parentElement)
    );

    const folderContent = document.createElement('div');
    folderContent.classList.add('folder-content');
    folder.appendChild(folderContent);

    return folder;
}

function clickFolder(event, folder){
    folder.isOpen = !folder.isOpen;
    const folderContent = folder.getElementsByClassName('folder-content')[0];
    const folderButton = folder.getElementsByClassName('folder-button')[0];
    if(folder.isOpen === true){
        folderButton.innerHTML = '<span class="ro">▸</span>&nbsp;' + folder.folderName;
        for(let i = 0; i < folderContent.children.length; i++){
            folderContent.children[i].classList.remove('hidden');
        }
    } else {
        folderButton.innerHTML = '<span class="or">▸</span>&nbsp;' + folder.folderName;
        for(let i = 0; i < folderContent.children.length; i++){
            folderContent.children[i].classList.add('hidden');
        }
    }
}

function formatName(name){
    if(name.length > 1){
        name = name[0].toUpperCase() + name.slice(1);
    }
    
    for(let i = 0; i < name.length; i++){
        if(name[i].toUpperCase() === name[i]){
            name = name.slice(0, i) + ' ' + name[i].toLowerCase() + name.slice(i+1);
            i += 2;
        }
    }
    return name;
}

function toHex(hex, defaultHex="#ff0000"){
    if(typeof hex !== 'string' || hex.length <= 1 || (hex.length-1)%3 !== 0 /*<- rgb, rrggbb, ...*/){
        return defaultHex;
    }
    if(hex[0] !== '#')return defaultHex;
    for(let i = 1; i < hex.length; i++){
        if(Number.isFinite(parseInt(hex[i], 16)) === true)continue;
        return defaultHex;
    }
    return hex;
}

const objectPropertyMap = {
    string: (key, value, {input, property, object}) => {
        if(toHex(value, 'notahex') !== 'notahex'){
            objectPropertyMap.color(key, value, {input, property, object});
            return;
        }

        if(Number.isFinite(parseFloat(value)) === true){
            input.value = parseFloat(value).toFixed(4).toString();
        }

        input.classList.add('property-text-input');
        property.appendChild(input);
    },
    boolean: (key, value, {input, property, object}) => {
        // this code is really spaghetti. Come back here in like a year
        // when i actually know how to write proper css and fix this mess
        // also take a look at the styles, specifically the slider::before mess
        input.checked = value;

        const label = document.createElement('label');
        label.classList.add('switch');
        label.classList.add('property-checkbox-input');
        label.appendChild(input);

        const span = document.createElement('span');
        span.classList.add('slider');
        if(input.checked == true){
            span.classList.add('inputChecked'); 
        }
        label.appendChild(span);

        property.addEventListener('mousedown', (event) => {
            event.preventDefault();
            input.checked = !input.checked;
            object[key] = input.checked;

            processChange(key, object[key]);

            if(input.checked == true){
                span.classList.add('inputChecked'); 
            } else {
                span.classList.remove('inputChecked');
            }
        });

        property.appendChild(label);
    },
    object: (key, subObject, {input, property, object}) => {
        if(subObject.isSpecialObject === true){
            objectPropertyMap[subObject.specialType](key, subObject, {input, property, object});
            return;
        }

        const parent = object.parentObject ?? object;

        defineAsUnEnumerable(subObject, 'parentObject', parent);// highest layer above
        defineAsUnEnumerable(subObject, 'parentKey', key);
        defineAsUnEnumerable(subObject, 'parent', object);// 1 layer above

        if(parent.subObjects === undefined){
            defineAsUnEnumerable(parent, 'subObjects', {});
        }

        parent.subObjects[key] = subObject;
        
        property.appendChild(createFolder(subObject, formatName(key)));
    },
    button: (key, subObject, {input, property, object}) => {
        // class to add a property to an object
        input.classList.add('property-button-input');
        input.type = 'button';
        input.value = subObject.name;

        input.onclick = () => {subObject.onClickFn()};

        property.appendChild(input);
    },
    note: (key, subObject, {input, property, object}) => {
        // class to add a property to an object
        // input.classList.add('property-button-input');
        // input.type = 'button';
        // input.value = subObject.name;

        // input.onclick = subObject.onClickFn;

        // property.appendChild(input);
    },
    color: (key, value, {input, property, object}) => {
        input.classList.add('property-color-input');
        input.type = 'color';
        
        const text = document.createTextNode(input.value);
        text.nodeValue = input.value;

        const label = document.createElement('label');
        label.classList.add('color-label');
        label.style.background = input.value;
        label.htmlFor = input.id;
        label.appendChild(input);
        label.appendChild(text);

        input.addEventListener('input', () => {
            text.nodeValue = input.value;
            label.style.background = input.value;
        });
        
        property.appendChild(label);
    },
    options: (key, value, {input, property, object}) => {
        const select = document.createElement('select');
        select.classList.add('property-option-input');
        
        const arr = value.optionsArray;
        arr.forEach((data) => {
            const option = document.createElement('option');
            option.value = data;
            option.classList.add('select-items');
            option.innerText = data;
            select.appendChild(option);
        });

        if(value.selectedOption === undefined){
            value.selectedOption = arr[0];
        } else {
            select.value = value.selectedOption;
        }
        processChange(key, value);

        select.onchange = (e) => {
            value.selectedOption = select.options[select.selectedIndex].innerText;
            processChange(key, value);
        }
        
        property.appendChild(select);
    }
}

function defineEventListeners(){
    Ref.toggleGuiButton.isOpen = false;
    Ref.toggleGuiButton.onclick = (event) => {
        Ref.toggleGuiButton.isOpen = !Ref.toggleGuiButton.isOpen;
        if(Ref.toggleGuiButton.isOpen === true){
            Ref.toggleGuiButton.innerText = 'Close Menu';
            Ref.toggleGuiButton.dataset.usage = 'on';
            Ref.gui.classList.remove('hidden');
            Ref.guiMenu.classList.add('gui-on');
        } else {
            Ref.toggleGuiButton.innerText = 'Open Menu';
            Ref.toggleGuiButton.dataset.usage = 'off';
            Ref.gui.classList.add('hidden');
            Ref.guiMenu.classList.remove('gui-on');
        }
        event.preventDefault();
    }
}
defineEventListeners();

function defineAsUnEnumerable(object, keyName, value) {
    Object.defineProperty(object, keyName, {
        value,
        enumerable: false,
        configurable: true,
        writable: true
    });
}

class Button {
    constructor(name, onClickFn){
        this.name = name;
        this.onClickFn = onClickFn;
        this.isSpecialObject = true;
        this.specialType = 'button';
    }
}

class Note {
    constructor(text){
        this.text = text;
        this.isSpecialObject = true;
        this.specialType = 'note';
    }
}

class Options {
    constructor(...optionsArray){
        this.optionsArray = optionsArray;
        this.isSpecialObject = true;
        this.specialType = 'options';
    }
}

// stuff to init when you switch
const settingsMenus = {
    petal: {
        typeName: "default",
        finish: new Button('Finish Petal', PetalModeManager.finishPetal),
        // petalContainer: false,// whether to render as a petal container or not
        // startOver: new Button('New Petal', PetalModeManager.nextShape),// will eventually have a button for this
        keepDrawingInsideHitbox: true,
        snapToGrid: true,
        snapGridSize: 2.5,
    },
    enemy: {
        typeName: "default",
        finish: new Button('Finish Enemy', EnemyModeManager.finishPetal),
        // petalContainer: false,// whether to render as a petal container or not
        // startOver: new Button('New Enemy', EnemyModeManager.nextShape),// will eventually have a button for this
        keepDrawingInsideHitbox: true,
        snapToGrid: true,
        snapGridSize: 2.5,
    },
    biome: {
        biomeName: "garden",
        backgroundColor: Colors.biomes["garden"].background,
        gridColor: Colors.biomes["garden"].grid,
        testing: {
            testWave: 1,// make sure to clamp this to 50 or something
            unlimitedHp: false,
            fixedCamera: false,
            testPetalType: new Options(...BiomeModeManager.getAvailablePetalTypes()),
            testPetalAmount: 5,
            testPetalRarity: new Options("Common", "Unusual", "Rare", "Epic", "Legendary", "Mythic", "Ultra", "Super"),
            specialWave: false,
        }
        // roomRadius: 500
        // test: new Button('test', BiomeModeManager.test),
        // testSettings: {/*stuff like level, petals to use, etc. Should only let players use like ultra petals at max*/}
        // for post release specialWaves: {/*add special wave, acts like a mini enemies array where you can add certain enemy types*/}
    },
};
// adding enemies adds an object with...
// - a dropdown (type) with all of the created enemies (does not update unless the menu is refreshed)
// - a minimum wave for the enemy to spawn in (default -1)
// - a weight that relative to other enemies is the probability for a certain enemy to spawn in (ex. spider set to 3, hornet set to 6 means hornet is 2x as likely to spawn)
// settingsMenus.biome.enemies.addButton = new Button('Add Enemy', BiomeModeManager.addEnemy);
// settingsMenus.biome.enemies.removeButton = new Button('Remove Last Enemy', BiomeModeManager.addEnemy);

for(let key in settingsMenus){
    const biomeSettings = settingsMenus[key];
    defineAsUnEnumerable(biomeSettings, 'folderName', 'Settings');
}

const statsMenus = {
    // petal: {
    //     radius: 10,
    //     reload: 1,
    //     amountPerSlot: 1,
    //     stickWithSlot: false,
    //     special: {
    //         effects: {
    //             poison: {
    //                 poisonEnabled: false,
    //                 poisonDuration: 1,
    //             },
    //             slow: {
    //                 slowEnabled: false,
    //                 slowDuration: 3,
    //                 slowAmount: 0.3,
    //             },
    //         },
    //         attackDistance: attackPetalDistance,
    //         neutralDistance: neutralPetalDistance,
    //         defendDistance: defendPetalDistance
    //         // summons: {
    //         //     new Button('Add Summon', StatsManager.addSummons),
    //         // }
    //         // projectiles
    //     },
    //     damage: 1,
    //     // screw this, let players balance stuff on their own, having a bit of unbalance is fun and its way easier to code lol
    //     // damage: new Note("Note: Damage is calculated automatically" + (Math.random() > 0.99 ? " 🤓 " : " ") + "to make sure this petal is balanced.")
    // },
    biome: {
        addEnemy: new Button('Add Enemy', BiomeModeManager.addBiomeEnemyTemplate),
        removeEnemy: new Button('Remove Enemy', BiomeModeManager.removeBiomeEnemyTemplate),
        enemies: [],
        addSpecialWave: new Button('Add Special Wave', BiomeModeManager.addSpecialWavesTemplate),
        removeSpecialWave: new Button('Remove Special Wave', BiomeModeManager.removeSpecialWavesTemplate),
        specialWaves: [],
        addPetal: new Button('Add Petal', BiomeModeManager.addBiomePetalTemplate),
        removePetal: new Button('Remove Petal', BiomeModeManager.removeBiomePetalTemplate),
        petals: [],
        exportToClipboard: new Button('Export To Clipboard', () => {copyToClipboard(exportBiome())}),
        importFromClipboard: new Button('Import From Clipboard', importBiome),
        clearBiome: new Button('Clear Biome', clearBiome),
        // exportForDevelopers: new Button('Export For Developers', () => copyToClipboard(exportBiomeAsArrayBuffer()))
    }
}

for(let key in statsMenus){
    defineAsUnEnumerable(statsMenus[key], 'folderName', 'Stats');
}

function getBiomeEnemyTypes(){
    return statsMenus.biome.enemies.map(data => data.enemyType.selectedOption);
}

function getBiomeEnemyStats(){
    return statsMenus.biome.enemies.map(data => {
        const stats = {
            enemyType: data.enemyType.selectedOption,
            spawnChance: data.spawnChance,
            spawnPower: data.spawnPower,
            enemyHealth: data.enemyHealth,
            enemyDamage: data.enemyDamage,
            enemyRadius: data.enemyRadius,
            speed: data.speed,
            mass: data.mass,
            detectionDistance: data.detectionDistance,
            // personality: data.personality.selectedOption,
            defaultState: data.defaultState.selectedOption,
            aggroState: data.aggroState.selectedOption,
            drops: convertDropData(data.drops),
            spawnType: data.special.spawnType.selectedOption,
            spawnAmount: data.special.spawnAmount,
            spawnSpacing: data.special.spawnSpacing,
            spawnRarityOffset: data.special.spawnRarityOffset,
            otherSimulateState: data.special.grow.otherSimulateState.selectedOption,
            childrenDistance: data.special.grow.childrenDistance,
            childrenWanderAngle: data.special.grow.childrenWanderAngle,
            childrenWanderDistance: data.special.grow.childrenWanderDist,
            childrenRotateSpeed: data.special.grow.childrenRotateSpeed,
            killChildrenOnDie: data.special.grow.killChildrenOnDie,
            dieOnChildrenDie: data.special.grow.dieOnChildrenDie,
            aggroOnChildrenDamage: data.special.grow.aggroOnChildrenDmg,
            aggroChildrenOnDie: data.special.grow.aggroChildrenOnDie,
            childrenLookAtParent: data.special.grow.childrenLookAtParent,
            spawnSameLimit: data.special.grow.ssLimit,
            spawnCooldown: data.special.spawnCooldown,
            collideWithOtherEnemies: data.collideWithOtherEnemies,
            variableCode: data.special.customCode.variableCode.replaceAll(`\n`, '\\n').replaceAll('\t', '\\t'),
            code: data.special.customCode.code.replaceAll(`\n`, '\\n').replaceAll('\t', '\\t')
        }

        // deleting unused keys to save space
        const defaultState = data.defaultState.selectedOption;
        const aggroState = data.aggroState.selectedOption;

        const spawnerTypes = ['shoot','summon','grow','burrow','fireBurrow'];
        if(spawnerTypes.includes(defaultState) === false && spawnerTypes.includes(aggroState) === false){
            const spawnerKeys = ['spawnType','spawnAmount','spawnSpacing','spawnRarityOffset'];
            for(let i = 0; i < spawnerKeys.length; i++){
                delete stats[spawnerKeys[i]];
            }
        }

        if(defaultState !== 'grow' && aggroState !== 'grow'){
            const growKeys = ['spawnRarityOffset', 'otherSimulateState', 'childrenDistance', 'childrenWanderAngle', 'childrenWanderDistance', 'childrenRotateSpeed', 'killChildrenOnDie', 'dieOnChildrenDie', 'aggroOnChildrenDamage', 'spawnSameLimit', 'childrenLookAtParent', 'aggroChildrenOnDie'];
            for(let i = 0; i < growKeys.length; i++){
                delete stats[growKeys[i]];
            }
        }

        if(defaultState !== 'customCode' && aggroState !== 'customCode'){
            const codeKeys = ['variableCode', 'code'];
            for(let i = 0; i < codeKeys.length; i++){
                delete stats[codeKeys[i]];
            }
        }

        return stats;
    })
}

function getSpecialWaveStats(){
    const arr = [];

    const specialWavesMenu = statsMenus.biome.specialWaves;
    // console.log(JSON.parse(JSON.stringify(specialWavesMenu)));
    for(let i = 0; i < specialWavesMenu.length; i++){
        const specialWaveMenu = specialWavesMenu[i];
        if(specialWaveMenu.length > 0){
            arr.push([]);
            for(let j = 0; j < specialWaveMenu.length; j++){
                const enemyMenu = specialWaveMenu[j];
                // console.log({enemyMenu});
                arr[arr.length - 1][j] = {
                    swEnemyType: enemyMenu.swEnemyType.selectedOption,
                    swSpawnChance: enemyMenu.swSpawnChance
                }
            }
        }
    }

    // console.log(window.structuredClone(arr));

    return arr;
}

function setBiomeEnemyStats(template, stats){
    // this is the inverse of getBiomePetalStats
    template.enemyType.selectedOption = stats.enemyType;
    template.spawnChance = stats.spawnChance;
    template.spawnPower = stats.spawnPower;
    template.enemyHealth = stats.enemyHealth;
    template.enemyDamage = stats.enemyDamage;
    template.enemyRadius = stats.enemyRadius;
    template.speed = stats.speed;
    template.mass = stats.mass;
    template.detectionDistance = stats.detectionDistance;
    template.defaultState.selectedOption = stats.defaultState;
    template.aggroState.selectedOption = stats.aggroState;
    template.drops = unConvertDropData(stats.drops);
    template.special.spawnType.selectedOption = stats.spawnType;
    template.special.spawnAmount = stats.spawnAmount ?? 1;
    template.special.spawnSpacing = stats.spawnSpacing ?? 0;
    template.special.spawnCooldown = stats.spawnCooldown ?? 60;
    template.special.spawnRarityOffset = stats.spawnRarityOffset ?? 0;
    template.special.grow.otherSimulateState.selectedOption = stats.otherSimulateState ?? 'stationary';
    template.special.grow.childrenDistance = stats.childrenDistance ?? 0;
    template.special.grow.childrenWanderAngle = stats.childrenWanderAngle ?? false;
    template.special.grow.childrenWanderDist = stats.childrenWanderDistance ?? false;
    template.special.grow.childrenRotateSpeed = stats.childrenRotateSpeed ?? 0;
    template.special.grow.dieOnChildrenDie = stats.dieOnChildrenDie ?? false;
    template.special.grow.killChildrenOnDie = stats.killChildrenOnDie ?? false;
    template.special.grow.aggroOnChildrenDmg = stats.aggroOnChildrenDamage ?? false;
    template.special.grow.childrenLookAtParent = stats.childrenLookAtParent ?? false;
    template.special.grow.aggroChildrenOnDie = stats.aggroChildrenOnDie ?? false;
    template.special.grow.ssLimit = stats.spawnSameLimit ?? 10;
    template.collideWithOtherEnemies = stats.collideWithOtherEnemies;
    template.special.customCode.code = (stats.code ?? '').replaceAll('\\n', '\n').replaceAll('\\t', '\t');
    template.special.customCode.variableCode = (stats.variableCode ?? '').replaceAll('\\n', '\n').replaceAll('\\t', '\t');
}

function setBiomeSpecialWaveStats(template, stats){
    for(let key in stats){
        BiomeModeManager.addSpecialWavesEnemyTemplate(template);
        
        const enemyTemplate = template[template.length - 1];
        enemyTemplate.swEnemyType.selectedOption = key;
        enemyTemplate.swSpawnChance = stats[key];
    }
}

function convertDropData(dropData){
    // {
    //     dropType: new Options(...BiomeModeManager.getAvailablePetalTypes()),
    //     dropSeeds: {
    //         lowerRarity: 0.15,
    //         higherRarity: 0
    //     }
    // }
    // TO
    // drops: {
    //     "Rock": [0.15, 0],
    //     "Heavy": [0.05, 0]
    // }
    const obj = {};
    for(let i = 0; i < dropData.length; i++){
        const data = dropData[i];
        obj[data.dropType.selectedOption] = [data.dropPercentChance / 100, data.minimumTierToDrop];
    }
    delete obj["undefined"];
    return obj;
}

function unConvertDropData(drops){
    const arr = [];
    for(let key in drops){
        const dropType = new Options(...BiomeModeManager.getAvailablePetalTypes());
        dropType.selectedOption = key;
        arr.push({dropType, dropPercentChance: drops[key][0] * 100, minimumTierToDrop: drops[key][1]});
        // dropType: {seed, minimumTier}
        // to
        // [{dropType, minimumTierToDrop, dropPercentChance}];
    }
    return arr;
}

function toNumber(val, defaultValue=0){
    if(Number.isFinite(val)) return val;
    return defaultValue;
}

function getBiomePetalStats(){
    return statsMenus.biome.petals.map(data => {
        const stats = {
            petalType: data.petalType.selectedOption,
            petalDamage: data.petalDamage,
            petalHealth: data.petalHealth,
            petalRadius: data.petalRadius,
            petalReload: data.petalReload,
            petalLayout: generatePetalLayout(Math.min(8, data.amountPerSlot), data.stickWithSlot, toNumber(data.special.swsOffsetRadius, 10)),
            damageScalers: ["damage"],
            healthScalers: ["health"]
        }
        if(data.special.attackDistanceMult !== 1){
            stats.attackDistanceMult = data.special.attackDistanceMult;
        }
        if(data.special.neutralDistanceMult !== 1){
            stats.neutralDistanceMult = data.special.neutralDistanceMult;
        }
        if(data.special.defendDistanceMult !== 1){
            stats.defendDistanceMult = data.special.defendDistanceMult;
        }
        if(data.special.projectile.projectileEnabled === true){
            stats.projectileEnabled = true;
            stats.projectileSpeed = data.special.projectile.projSpeed;
            stats.projectileCooldown = data.special.projectile.projCooldown;
            stats.projectileLifetime = data.special.projectile.projLifetime;
            stats.projectileType = data.special.projectile.projectileType.selectedOption;
            stats.killOnShoot = data.special.projectile.killOnShoot;
            stats.projectileHoming = data.special.projectile.projectileHoming;
            stats.homingCorrection = data.special.projectile.homingAmt;
            stats.projectileSpread = data.special.projectile.projSpread;
            stats.projectileAmount = data.special.projectile.projAmount;
        }
        if(data.special.summon.summonEnabled === true){
            stats.summonEnabled = true;
            stats.summonType = data.special.summon.summonType.selectedOption;
            stats.summonCooldown = data.special.summon.smnCooldown;
            stats.summonIncrement = data.special.summon.smnIncrement;
            stats.summonAmount = data.special.summon.smnAmount;
            stats.raritiesBelow = data.special.summon.raritiesBelow;
            stats.summonVelocity = data.special.summon.smnVelocity;
            stats.summonRange = data.special.summon.smnRange;
            stats.summonLifetime = data.special.summon.smnLifetime;
            stats.killOnSummon = data.special.summon.killOnSummon;
            stats.killPetsOnDie = data.special.summon.killPetsOnDie;
        }
        if(data.special.customCode.codeEnabled === true){
            stats.codeEnabled = true;
            stats.code = data.special.customCode.code.replaceAll(`\n`, '\\n').replaceAll('\t', '\\t');
            stats.variableCode = data.special.customCode.variableCode.replaceAll(`\n`, '\\n').replaceAll('\t', '\\t');
        }
        for(let key in data.special.effects){
            const effectTemplate = data.special.effects[key];
            const enabledStatName = effectTemplate.statName.enabled;
            if(effectTemplate[enabledStatName] === true){
                // ok we're enabled!!
                for(let key2 in effectTemplate.statName){
                    if(key2 === 'enabled') continue;
                    const dataStatName = key2;
                    const dataStatValue = effectTemplate[effectTemplate.statName[key2]];
                    if(typeof dataStatValue !== 'number') continue;
                    stats[dataStatName] = dataStatValue;
                }
            }
        }
        if(stats.poisonDamage !== undefined && stats.poisonTime !== undefined){
            stats.poison = [stats.poisonTime, stats.poisonDamage];//[stats.poisonDamage, stats.poisonTime];
        }
        return stats;
    })
}

function setBiomePetalStats(template, stats){
    // this is the inverse of getBiomePetalStats
    template.petalType.selectedOption = stats.petalType;
    template.petalDamage = stats.petalDamage;
    template.petalHealth = stats.petalHealth;
    template.petalRadius = stats.petalRadius;
    template.petalReload = stats.petalReload;
    const petalLayoutData = getDataFromPetalLayout(stats.petalLayout);
    template.stickWithSlot = petalLayoutData.sticksWith;

    template.special.swsOffsetRadius = petalLayoutData.stickOffsetRadius;
    template.special.attackDistanceMult = stats.attackDistanceMult ?? 1;
    template.special.neutralDistanceMult = stats.neutralDistanceMult ?? 1;
    template.special.defendDistanceMult = stats.defendDistanceMult ?? 1;

    template.special.projectile.projectileEnabled = stats.projectileSpeed !== undefined;
    template.special.projectile.projSpeed = stats.projectileSpeed ?? 20;
    template.special.projectile.projCooldown = stats.projectileCooldown ?? 1;
    template.special.projectile.projectileType.selectedOption = stats.projectileType ?? BiomeModeManager.getAvailablePetalTypes()[0] ?? 'default';
    template.special.projectile.projLifetime = stats.projectileLifetime ?? 5;
    template.special.projectile.killOnShoot = stats.killOnShoot ?? true;
    template.special.projectile.projectileHoming = stats.projectileHoming ?? false;
    template.special.projectile.homingAmt = stats.homingCorrection ?? (Math.PI / 3);
    template.special.projectile.projAmount = stats.projectileAmount ?? 1;
    template.special.projectile.projSpread = stats.projectileSpread ?? 0;

    template.special.summon.summonEnabled = stats.summonCooldown !== undefined;
    template.special.summon.summonType.selectedOption = stats.summonType ?? BiomeModeManager.getAvailableEnemyTypes()[0] ?? 'default';
    template.special.summon.smnCooldown = stats.summonCooldown ?? 10;
    template.special.summon.smnIncrement = stats.summonIncrement ?? 1;
    template.special.summon.smnAmount = stats.summonAmount ?? 1;
    template.special.summon.raritiesBelow = stats.raritiesBelow ?? 0;
    template.special.summon.smnVelocity = stats.summonVelocity ?? 0;
    template.special.summon.smnRange = stats.summonRange ?? 1000000;
    template.special.summon.smnLifetime = stats.summonLifetime ?? 1000000;
    template.special.summon.killOnSummon = stats.killOnSummon ?? false;
    template.special.summon.killPetsOnDie = stats.killPetsOnDie ?? true;

    template.special.customCode.codeEnabled = stats.code !== undefined;
    template.special.customCode.code = (stats.code ?? '').replaceAll('\\n', '\n').replaceAll('\\t', '\t');
    template.special.customCode.variableCode = (stats.variableCode ?? '').replaceAll('\\n', '\n').replaceAll('\\t', '\t');

    template.amountPerSlot = petalLayoutData.amount;
    // console.log('ptlyt', stats.petalLayout, getDataFromPetalLayout(stats.petalLayout));
    // template.petalLayout = getDataFromPetalLayout(stats.petalLayout);
    // template.damageScalers = stats.damageScalers;
    // template.healthScalers = stats.healthScalers;

    for(let key in template.special.effects){
        const effectTemplate = template.special.effects[key];
        for(let key2 in effectTemplate){
            const templateName = key2;
            const statName = effectTemplate.nameStat[templateName];
            if(statName === 'enabled' || stats[statName] === undefined) continue;
            effectTemplate[templateName] = stats[statName];

            // enabling
            const enabledName = effectTemplate.statName.enabled;
            effectTemplate[enabledName] = true;
        }
    }
}

function initStatsMenuOnImport(petalStats, enemyStats, specialWaveStats){
    for(let i = 0; i < petalStats.length; i++){
        BiomeModeManager.addBiomePetalTemplate();
        const petalTemplate = statsMenus.biome.petals[statsMenus.biome.petals.length - 1];
        setBiomePetalStats(petalTemplate, petalStats[i]);
    }
    for(let i = 0; i < enemyStats.length; i++){
        BiomeModeManager.addBiomeEnemyTemplate();
        const petalTemplate = statsMenus.biome.enemies[statsMenus.biome.enemies.length - 1];
        setBiomeEnemyStats(petalTemplate, enemyStats[i]);
    }
    specialWaveTypes = {};
    statsMenus.biome.specialWaves = [];
    if(specialWaveStats !== undefined){
        for(let i = 0; i < specialWaveStats.length; i++){
            BiomeModeManager.addSpecialWavesTemplate();
            const swTemplate = statsMenus.biome.specialWaves[statsMenus.biome.specialWaves.length - 1];
            setBiomeSpecialWaveStats(swTemplate, specialWaveStats[i]);
        }
    }
    updateStatsMenu();
}

function initTestingMenuOnImport(data){
    const testingMenu = settingsMenus.biome.testing;
    testingMenu.testWave = window.sw_ ?? data.testWave;
    testingMenu.unlimitedHp = window.unlimHp_ ?? data.unlimitedHp;
    testingMenu.specialWave = data.specialWave ?? false;
    testingMenu.testPetalType = new Options(...BiomeModeManager.getAvailablePetalTypes());
    testingMenu.testPetalRarity = new Options("Common", "Unusual", "Rare", "Epic", "Legendary", "Mythic", "Ultra", "Super");
    testingMenu.testPetalType.selectedOption = data.testPetalType;
    const raritiesArr = ["Common", "Unusual", "Rare", "Epic", "Legendary", "Mythic", "Ultra", "Super"];
    testingMenu.testPetalRarity.selectedOption = raritiesArr[data.testPetalRarity];
    testingMenu.fixedCamera = data.fixedCamera;
    testingMenu.testPetalAmount = data.testPetalAmount;
}

function generatePetalLayout(amount, stickWith, stickOffsetRadius){
    const arr = [];
    if(stickWith === true){
        arr[0] = [];
        for(let i = 0; i < amount; i++){
            arr[0].push({offsetAngle: Math.PI * 2 * i / amount, offsetRadius: stickOffsetRadius});
        }
    } else {
        for(let i = 0; i < amount; i++){
            arr.push([{}]);
        }
    }
    return arr;
}

function getDataFromPetalLayout(petalLayout){
    if(petalLayout.length === 1){
        return {sticksWith: true, amount: petalLayout[0].length, stickOffsetRadius: petalLayout[0][0].offsetRadius ?? 10};
    } else {
        return {sticksWith: false, amount: petalLayout.length, stickOffsetRadius: 10};
    }
}

const getShapesMap = {
    petal: () => {
        return editorPetalShapesMap;
    },
    enemy: () => {
        return editorEnemyShapesMap;
    }
}
const renderMenus = {
    petal: {
        createShape: new Button('Create Shape', PetalModeManager.startCreateShape, false),
        removeLastShape: new Button('Remove Last Shape', PetalModeManager.removeLastShape, false),
        flipX: new Button('Flip X', PetalModeManager.flipShapeX),
        flipY: new Button('Flip Y', PetalModeManager.flipShapeY),
        duplicateShape: new Button('Duplicate Shape', PetalModeManager.duplicateShape),
        shapes: getShapesMap.petal()[petal.customType]
    },
    enemy: {
        createShape: new Button('Create Shape', PetalModeManager.startCreateShape, false),
        removeLastShape: new Button('Remove Last Shape', PetalModeManager.removeLastShape, false),
        flipX: new Button('Flip X', PetalModeManager.flipShapeX),
        flipY: new Button('Flip Y', PetalModeManager.flipShapeY),
        duplicateShape: new Button('Duplicate Shape', PetalModeManager.duplicateShape),
        shapes: getShapesMap.enemy()[petal.customType]
    }
}

for(let key in renderMenus){
    const renderSettings = renderMenus[key];
    defineAsUnEnumerable(renderSettings, 'folderName', 'Rendering');
}

const settingsMenuFolders = {petal: null, enemy: null, biome: null};
const statsMenuFolders = {petal: null, enemy: null, biome: null};
const renderMenuFolders = {petal: null, enemy: null, biome: null};

function updateSettingsMenu(){
    if(window.mode === 'biome'){
        const petalTypes = BiomeModeManager.getAvailablePetalTypes();
        const lastSelectedOption = settingsMenus.biome.testing.testPetalType.selectedOption;
        settingsMenus.biome.testing.testPetalType = new Options(...petalTypes);
        if(petalTypes.includes(lastSelectedOption)){
            settingsMenus.biome.testing.testPetalType.selectedOption = lastSelectedOption;
        }
    }
    updateMenu(settingsMenus[window.mode], settingsMenuFolders);
}

function updateStatsMenu(){
    // in other modes we might have changed stuff like the available enemy types.
    // This needs to be reflected in the options so we need to perform an additional update
    if(window.mode === 'biome'){
        const availableEnemyTypes = BiomeModeManager.getAvailableEnemyTypes();
        const availablePetalTypes = BiomeModeManager.getAvailablePetalTypes();

        // ENEMIES
        const firstLen = statsMenus.biome.enemies.length;
        statsMenus.biome.enemies = statsMenus.biome.enemies.filter(enemyData => enemyData.enemyType.selectedOption === undefined || editorEnemyShapesMap[enemyData.enemyType.selectedOption] !== undefined);

        // updating different types that may have changed as we switch modes
        for(let i = 0; i < statsMenus.biome.enemies.length; i++){
            // enemy type
            const previousSelectedOption = statsMenus.biome.enemies[i].enemyType.selectedOption;
            statsMenus.biome.enemies[i].enemyType = new Options(...availableEnemyTypes);
            if(availableEnemyTypes.includes(previousSelectedOption)){
                statsMenus.biome.enemies[i].enemyType.selectedOption = previousSelectedOption;
            }

            // enemy spawn type
            const previousSpawnSelectedOption = statsMenus.biome.enemies[i].special.spawnType.selectedOption;
            statsMenus.biome.enemies[i].special.spawnType = new Options(...availableEnemyTypes);
            if(availableEnemyTypes.includes(previousSpawnSelectedOption)){
                statsMenus.biome.enemies[i].special.spawnType.selectedOption = previousSpawnSelectedOption;
            }

            // enemy drops
            const drops = statsMenus.biome.enemies[i].drops;
            for(let i = 0; i < drops.length; i++){
                const previousSelectedOption = drops[i].dropType.selectedOption;
                drops[i].dropType = new Options(...availablePetalTypes);
                if(availablePetalTypes.includes(previousSelectedOption)){
                    drops[i].dropType.selectedOption = previousSelectedOption;
                }
            }
        }
        if(statsMenus.biome.enemies.length !== firstLen){
            BiomeModeManager.updateDisplayEnemies();
        }

        // PETALS
        // const firstPetalLen = statsMenus.biome.petals.length;
        statsMenus.biome.petals = statsMenus.biome.petals.filter(petalData => petalData.petalType.selectedOption === undefined || petalData.petalType.selectedOption === "Basic" || editorPetalShapesMap[petalData.petalType.selectedOption] !== undefined);
        for(let i = 0; i < statsMenus.biome.petals.length; i++){
            // petal type
            const previousSelectedOption = statsMenus.biome.petals[i].petalType.selectedOption;
            statsMenus.biome.petals[i].petalType = new Options(...availablePetalTypes);
            if(availablePetalTypes.includes(previousSelectedOption)){
                statsMenus.biome.petals[i].petalType.selectedOption = previousSelectedOption;
            }

            const projectileMenu = statsMenus.biome.petals[i].special.projectile.projectileType;
            const lastSelectedProjectileType = projectileMenu.selectedOption;
            statsMenus.biome.petals[i].special.projectile.projectileType = new Options(...availablePetalTypes);
            if(availablePetalTypes.includes(lastSelectedProjectileType)){
                statsMenus.biome.petals[i].special.projectile.projectileType.selectedOption = lastSelectedProjectileType;
            }

            const summonMenu = statsMenus.biome.petals[i].special.summon.summonType;
            const lastSelectedSummonType = summonMenu.selectedOption;
            statsMenus.biome.petals[i].special.summon.summonType = new Options(...availableEnemyTypes);
            if(availableEnemyTypes.includes(lastSelectedSummonType)){
                statsMenus.biome.petals[i].special.summon.summonType.selectedOption = lastSelectedSummonType;
            }
        }

        // SPECIAL WAVES
        for(let i = 0; i < statsMenus.biome.specialWaves.length; i++){
            const specialWave = statsMenus.biome.specialWaves[i];
            for(let j = 0; j < specialWave.length; j++){
                const enemyInSpecialWave = specialWave[j];

                const previousSelectedOption = enemyInSpecialWave.swEnemyType.selectedOption;
                enemyInSpecialWave.swEnemyType = new Options(...availableEnemyTypes);
                if(availableEnemyTypes.includes(previousSelectedOption)){
                    enemyInSpecialWave.swEnemyType.selectedOption = previousSelectedOption;
                }
            }
        }
    }
    updateMenu(statsMenus[window.mode], statsMenuFolders);
}

function updateRenderMenu(){
    updateMenu(renderMenus[window.mode], renderMenuFolders);
}

function updateAllMenus(){
    clearMenu();
    updateSettingsMenu();
    updateStatsMenu();
    updateRenderMenu();
    updateToolsMenu();
}

function updateMenu(menuObject, menuFolder){
    if(menuObject === undefined){
        return;
    }
    
    if(menuObject === renderMenus[window.mode]){
        menuObject.shapes = getShapesMap[window.mode]()[petal.customType];
    }
    
    if(menuFolder[window.mode] === null){
        menuFolder[window.mode] = objectToFolder(menuObject);
    } else {
        updateOpenFolders(menuFolder[window.mode]);
    
        menuFolder[window.mode].remove();
        menuFolder[window.mode] = objectToFolder(menuObject);

        reOpenFolders(menuFolder[window.mode]);
    }
}

function updateOpenFolders(menu=renderMenuFolders[window.mode]){
    openFolders = {Rendering: {}, isOpen: menu.isOpen};

    // breadth-first search
    let folders = [menu];
    folders[0].keyChain = [];
    folders[0].openFoldersRef = openFolders.Rendering;

    while(folders.length > 0){
        // for each folder, if it's open then add the key to the list

        let newFolders = [];
        for(let i = 0; i < folders.length; i++){
            const childFolders = getChildFolders(folders[i]);
            for(let j = 0; j < childFolders.length; j++){
                const childFolder = childFolders[j];
                
                if(folders[i].openFoldersRef[childFolder.parentKey] === undefined){
                    folders[i].openFoldersRef[childFolder.parentKey] = {};
                }
                childFolder.openFoldersRef = folders[i].openFoldersRef[childFolder.parentKey];
                childFolder.openFoldersRef.isOpen = childFolder.isOpen;
            }
            
            newFolders.push(...childFolders);
        }
        folders = newFolders;
    }
}

function reOpenFolders(menu=renderMenuFolders[window.mode]){
    let folders = [menu];
    folders[0].keyChain = [];
    folders[0].openFoldersRef = openFolders.Rendering;
    if(openFolders.isOpen === true){
        clickFolder(undefined, menu);
    }

    while(folders.length > 0){
        let newFolders = [];
        for(let i = 0; i < folders.length; i++){
            const childFolders = getChildFolders(folders[i]);
            for(let j = 0; j < childFolders.length; j++){
                const childFolder = childFolders[j];
                
                if(folders[i].openFoldersRef[childFolder.parentKey] === undefined){
                    folders[i].openFoldersRef[childFolder.parentKey] = {};
                }
                childFolder.openFoldersRef = folders[i].openFoldersRef[childFolder.parentKey];

                if(childFolder.openFoldersRef.isOpen === true){
                    clickFolder(undefined, childFolder);
                }
            }
            
            newFolders.push(...childFolders);
        }
        folders = newFolders;
    }
}

function getChildFolders(folder){
    const folderChildren = folder.querySelector('.folder-content').children;
    const childFolders = [];
    for(let i = 0; i < folderChildren.length; i++){
        for(let j = 0; j < folderChildren[i].children.length; j++){
            if(folderChildren[i].children[j].classList.contains('folder') === true){
                childFolders.push(folderChildren[i].children[j]);
            }
        }
    }
    return childFolders;
}