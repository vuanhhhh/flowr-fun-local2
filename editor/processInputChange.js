function processChange(key, value){
    PetalModeManager.updateControlPoints();
    if(changeMap[key] !== undefined) changeMap[key](value);
}

const changeMap = {
    typeName: (v) => {
        PetalModeManager.changeCustomType(v);
    },
    biomeName: (v) => {
        window.biomeName = v;
    },
    keepDrawingInsideHitbox: (v) => {
        SettingsManager.changeSetting('boundToHitbox', v);
    },
    snapToGrid: (v) => {
        SettingsManager.changeSetting('snapToGrid', v);
    },
    snapGridSize: (v) => {
        SettingsManager.changeSetting('snapGridSize', v);
    },
    backgroundColor: (v) => {
        BiomeModeManager.changeBackgroundColor(v);
    },
    gridColor: (v) => {
        BiomeModeManager.changeGridColor(v);
    },
    testPetalType: (v) => {
        testingBiomeData.testPetalType = v.selectedOption;
    },
    testPetalRarity: (v) => {
        testingBiomeData.testPetalRarity = rarityToNumber[v.selectedOption];
    },
}

const enemyDataFields = [
    'enemyType', 'spawnChance', 'spawnPower', 'enemyHealth', 'detectionDistance', 'enemyDamage',
    'enemyRadius', 'speed', 'mass', 'personality', 'defaultState', 'aggroState', 'drops',
    'spawnType', 'spawnCooldown', 'spawnAmount', 'spawnSpacing', 'spawnRarityOffset',
    'otherSimulateState', 'childrenDistance', 'childrenWanderAngle', 'childrenWanderDist',
    'childrenRotateSpeed', 'collideWithOtherEnemies', 'dropType', 'dropPercentChance',
    'minimumTierToDrop', 'code', 'variableCode', 'dieOnChildrenDie', 'killChildrenOnDie',
    'ssLimit', 'aggroOnChildrenDmg', 'childrenLookAtParent', 'aggroChildrenOnDie'
];
for(let i = 0; i < enemyDataFields.length; i++){
    changeMap[enemyDataFields[i]] = (v) => { BiomeModeManager.updateDisplayEnemies() };
}

const biomeTestDataFields = ['testWave', 'unlimitedHp', 'fixedCamera', 'specialWave', /*'testPetalType', 'testPetalRarity',*/ 'testPetalAmount'];
for(let i = 0; i < biomeTestDataFields.length; i++){
    changeMap[biomeTestDataFields[i]] = (v) => { testingBiomeData[biomeTestDataFields[i]] = v };
}

const specialWaveFields = ['swEnemyType', 'swSpawnChance'];
for(let i = 0; i < specialWaveFields.length; i++){
    changeMap[specialWaveFields[i]] = (v) => { BiomeModeManager.updateSpecialWaveStats(); }
}

const rarityToNumber = {
    "Common": 0,
    "Unusual": 1,
    "Rare": 2,
    "Epic": 3,
    "Legendary": 4,
    "Mythic": 5,
    "Ultra": 6,
    "Super": 7,
    "Omega": 8,
    "Fabled": 9
}