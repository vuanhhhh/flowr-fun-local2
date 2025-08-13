let spawnableTypesInBiome = {// NOTE: This is for customType, not normal types (cuz all editor normal types will be the string "custom")
    // "enemyCustomType": 36,
    // // ...
}

let specialWaveTypes = [
    // {
    //     enemyType1: 1,
    //     enemyType2: 0.5
    // },//...
]

const randomNormals = (rng) => {
    let u1 = 0, u2 = 0;
    //Convert [0,1) to (0,1)
    while (u1 === 0) u1 = rng();
    while (u2 === 0) u2 = rng();
    const R = Math.sqrt(-2.0 * Math.log(u1));
    const Θ = 2.0 * Math.PI * u2;
    return [R * Math.cos(Θ), R * Math.sin(Θ)];
};
const aggressiveProportion = (wave) => {
    return Math.max(0, 2.2/(1 + Math.pow(Math.E, -((wave-2.6)/8))) - 1.2)
}
const gaussianRandom = (mean, std, skew = 0, min, max) => {
    let ξ = mean;
    let ω = std;
    let α = skew;
    let rng = Math.random;
    const [u0, v] = randomNormals(rng);
    if (α === 0) {
        let value = ξ + ω * u0;
        return Math.min(Math.max(value, min), max);
    }
    const 𝛿 = α / Math.sqrt(1 + α * α);
    const u1 = 𝛿 * u0 + Math.sqrt(1 - 𝛿 * 𝛿) * v;
    const z = u0 >= 0 ? u1 : -u1;
    let value = ξ + ω * z;
    return Math.min(Math.max(value, min), max);
};
const powerMultipliers = {
    // TODO: to be calculated based on factors
    // mobName: 2
}

// thesse should be kept constant, should not be able to be modified by editor
const rarityMultipliers = [
    /*common*/1,
    /*unusual*/1.7,
    /*rare*/3,
    /*epic*/5.4,
    /*legendary*/13.5,
    /*mythic*/28.6,
    /*ultra*/80,
    /*super*/280,
    /*hyper*/1040,
    /*fabled*/1300
]

const aggressiveEnemies = [/*unused for editor*/];

function wavePowerFunc(x){
    return (x**4/990-.02*(x**3)+2*(x**2)+22*x+40)/1.5;
}

function waveLengthFunc(x){
    if(x < 10){
        return x ** 0.2 * 18.9287 + 30;
    } else {
        return 60;
    }
}

function waveSpawnData(wave, special=testingBiomeData.specialWave/*special=false (special not supported for editor)*/){
    const averageWaveRarity = Math.log(wave + 36.5) * 6 - 21.6;
    const waveSpread = 0.7;//...
    let wavePower = wavePowerFunc(wave);
    const waveLength = waveLengthFunc(wave);
    const waveSkew = -1.5;

    let wavePowerTick = 0;
    let timeTick = 0;
    let previousRestore = 0;
    let targetPerTick = 0;

    let spawnableTypes;
    
    // special waves not supported as well
    if (!special){
        spawnableTypes = JSON.parse(JSON.stringify(spawnableTypesInBiome));
        // editor doesn't support aggressive types
        // let multiplier = aggressiveProportion(wave);
        // for(let i of Object.keys(spawnableTypes)){
        //     if (aggressiveEnemies.includes(i)){
        //         spawnableTypes[i] *= multiplier;
        //     }
        // }
    }
    else{
        spawnableTypes = JSON.parse(JSON.stringify(specialWaveTypes[Math.floor(Math.random() * specialWaveTypes.length)]));
    }


    let spawns = [];
    let powerUsed = 0;
    while (timeTick < waveLength) {
        timeTick += 2;

        let tickSpawns = [];
        if (timeTick > previousRestore){
            previousRestore += waveLength/6;
            
            wavePowerTick += wavePower/7;
            
            let ticksUntilNextRefill = Math.floor(waveLength/12);
            targetPerTick = wavePowerTick/ticksUntilNextRefill;
        }

        let tickPowerUsed = 0;

        if (timeTick >= waveLength){
            targetPerTick = wavePower - powerUsed;
        }
        while (tickPowerUsed < targetPerTick && wavePowerTick > 0){
            let type;
            let total = 0;
            for(let i of Object.keys(spawnableTypes)){
                total += spawnableTypes[i];
            }
            let typeNumber = Math.random() * total;
            for(let i of Object.keys(spawnableTypes)){
                typeNumber -= spawnableTypes[i];
                if (typeNumber <= 0){
                    type = i;
                    break;
                }
            }

            if (Math.random() < 1/1e6){
                type = "Square";
            }

            let rarity = Math.floor(gaussianRandom(averageWaveRarity + 0.46139220235180645, waveSpread, waveSkew, 0, 9.9999));
            let power = rarityMultipliers[rarity] * powerMultipliers[type];
            tickPowerUsed += power;
            tickSpawns.push({type: type, rarity: rarity});
        }
        spawns.push(tickSpawns);
        wavePowerTick -= tickPowerUsed;
        powerUsed += tickPowerUsed;
    }
    
    return spawns;
}

// console.log(waveSpawnData(30));