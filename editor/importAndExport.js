async function importBiome(preexistingData=undefined){
    let data;
    try {
        let clipboardData = preexistingData;
        if(clipboardData === undefined){
            clipboardData = await readFromClipboard();
            // console.log({clipboardData});
        }
        data = JSON.parse(clipboardData);
    } catch(e){
        alert('import failed 💀... Error: ' + e);
        return;
    }

    for(let key in editorEnemyShapesMap){
        delete editorEnemyShapesMap[key];
    }
    editorEnemyShapesMap.default = [[]];
    for(let key in editorPetalShapesMap){
        delete editorPetalShapesMap[key];
    }
    editorPetalShapesMap.default = [[]];

    // deleting existing data
    statsMenus.biome.enemies.length = 0;
    statsMenus.biome.petals.length = 0;

    assign(editorPetalShapesMap, data.editorPetalShapesMap);
    assign(editorEnemyShapesMap, data.editorEnemyShapesMap);
    const rarities = editorBaseStats.rarities;
    assign(editorBaseStats, data.editorBaseStats);
    editorBaseStats.rarities = rarities;
    // assign(settingsMenus, data.settingsMenus);
    // assign(statsMenus, data.statsMenus);
    // assign(renderMenus, data.renderMenus);
    assign(aggroMap, data.aggroMap);
    assign(defaultStateMap, data.defaultStateMap);
    window.colors = data.colors;
    settingsMenus.biome.backgroundColor = window.colors.background;
    settingsMenus.biome.gridColor = window.colors.grid;
    spawnableTypesInBiome = data.spawnableTypesInBiome;
    settingsMenus.biome.biomeName = window.biomeName = data.biomeName;
    assign(powerMultipliers, data.powerMultipliers);
    // Settings, data.Settings;
    assign(testingBiomeData, data.testingBiomeData);
    if(testingBiomeData.specialWave === undefined)testingBiomeData.specialWave = false;
    initTestingMenuOnImport(testingBiomeData);
    assign(spawnableTypesInBiome, data.spawnableTypesInBiome);
    initStatsMenuOnImport(data.petalStats, data.enemyStats, data.specialWaveTypes);

    if(testingGame === true){
        testingGame = false;
        BiomeModeManager.stopTestGame();
    }

    changeMode('petal');
    PetalModeManager.init();
    changeMode('enemy');
    EnemyModeManager.init();

    regenerateEditorStats();
    updateAllMenus();
    changeMode('biome');
    // console.log({
    //     editorPetalShapesMap,
    //     editorEnemyShapesMap,
    //     editorBaseStats,
    //     // settingsMenus,
    //     // statsMenus,
    //     // renderMenus,
    //     aggroMap,
    //     defaultStateMap,
    //     colors,
    //     spawnableTypesInBiome,
    //     // specialWaveTypes,
    //     powerMultipliers,
    //     // Settings,
    //     testingBiomeData,
    //     spawnableTypesInBiome,
    // })
}

function assign(a, b){
    for(let key in b){
        a[key] = b[key];
    }
}

function getBiomeJSON(){
    // if(window.biomeName === 'garden'){
    //     throw new Error('Could not export biome because biome name is the default "garden"! Please change it in the Settings folder and try again!');
    // }
    console.log('exporting', {editorBaseStats})
    regenerateEditorStats();
    return JSON.stringify({
        editorPetalShapesMap,
        editorEnemyShapesMap,
        editorBaseStats,
        // settingsMenus,
        // statsMenus,
        // renderMenus,
        aggroMap,
        defaultStateMap,
        colors,
        spawnableTypesInBiome,
        specialWaveTypes,
        powerMultipliers,
        // Settings,
        testingBiomeData,
        enemyStats: getBiomeEnemyStats(),
        petalStats: getBiomePetalStats(),
        biomeName
    });
}

function exportBiome(){
    try {
        return getBiomeJSON().replaceAll('\\n', '\n').replaceAll('\n', '\\n');
    } catch(e){
        alert('export failed 💀... Error: ' + e);
    }
}

function copyToClipboard(data) {
    navigator.clipboard.writeText(data);
}

async function readFromClipboard(){
    return navigator.clipboard.readText();
    // return navigator.clipboard.readText().then((data) => fn(data));
}

window.toUpdateLSOnRefresh = true;
// saving to localStorage
window.onbeforeunload = (e) => {
    if(window.isIframePlayer === true)return null;
    
    if(window.loaded === true && window.toUpdateLSOnRefresh){
        localStorage.setItem("savedBiome", exportBiome());
    }
    return null;
};

function clearBiome(){
    const p = confirm('Are you sure you want to clear the whole biome? This cannot be undone.');
    if(p === true){
        localStorage.removeItem("savedBiome");
        window.toUpdateLSOnRefresh = false;
        location.reload();
    }
}

onLoadFunctions.push(() => {
    // getting from localStorage if already set
    const savedBiome = localStorage.getItem("savedBiome");
    if(savedBiome !== null){
        changeMode('biome');
        importBiome(savedBiome);
        changeMode('petal');
    }
})