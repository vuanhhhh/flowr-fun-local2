function initFlowrCode(entity, code, variableCode){
    defineVariables(entity, variableCode);
    preprocessCode(entity, code);
}

function flowrCode(entity, room, code){
    _flowrCode(entity, room, cleanCode(code));
}

function defineVariables(entity={}, variableCode){
    variableCode = variableCode.replaceAll(' ', '').replaceAll('\t', '');
    entity.variables = {};

    const variableStatements = variableCode.split('\n');
    for(let i = 0; i < variableStatements.length; i++){
        const split = variableStatements[i].split(',');
        if(split.length < 2) continue;
        const [variableName, variableValue] = split;
        entity.variables[variableName] = parseType(entity, variableValue, '', -1);
    }
}

function preprocessCode(entity, code, isAdHoc=false){// isAdHoc = boolean representing if the code is run during the frame instead of init
    code = cleanCode(code);
    entity.codeIndexes = [];// indexes of important characters

    for(let i = 0; i < code.length; i++){
        if(['(', ',', ')'].includes(code[i]) === true){
            entity.codeIndexes.push(i);
        }
    }

    entity.queryIndexes = [];

    const queryLookIndexes = [];
    for(let i = 0; i < code.length; i++){
        if(code[i] !== 'q') continue;
        if(code.slice(i, i+5) === 'query') {
            queryLookIndexes.push(i+6);
        }
    }

    mainLoop: for(let i = 0; i < queryLookIndexes.length; i++){
        let startIndex = -1;
        for(let j = queryLookIndexes[i]; j < code.length; j++){
            if(code[j] === '(') {
                startIndex = j+1;
                break;
            }
        }

        if(startIndex === -1) continue mainLoop;

        let parenthesisOffset = 0;// counts the number of ( minus the number of )
        // when this is -1 that means that there's 1 more closing parenthesis than
        // open parenthesis and thus the query has ended.
        for(let j = startIndex; j < code.length; j++){
            if(code[j] === '('){
                parenthesisOffset++;
            } else if(code[j] == ')'){
                parenthesisOffset--;
                if(parenthesisOffset === -1){
                    entity.queryIndexes.push(startIndex, j);
                    continue mainLoop;
                }
            }
        }
    }

    if(isAdHoc === true) return;

    // entity.onTakeDamageFn = null;
    // entity.onKillFn = null;
    let onKillIndex = -1;
    let onTakeDamageIndex = -1;

    for(let i = 0; i < code.length; i++){
        if(code[i] !== 'o') continue;
        if(code.slice(i, i+12) === 'onTakeDamage'){
            onTakeDamageIndex = i+12+3;
            if(onKillIndex !== -1) break;
        }
        else if(code.slice(i, i+6) === 'onKill'){
            onKillIndex = i+6+3;
            if(onTakeDamageIndex !== -1) break;
        }
    }

    if(onKillIndex !== -1){
        let parenthesisOffset = 0;
        for(let i = onKillIndex; i < code.length; i++){
            if(code[i] === '('){
                parenthesisOffset++;
            } else if(code[i] === ')'){
                parenthesisOffset--;
                if(parenthesisOffset === -1){
                    entity.onKillCode = code.slice(onKillIndex, i);
                    break;
                }
            }
        }
    }

    if(onTakeDamageIndex !== -1){
        let parenthesisOffset = 0;
        for(let i = onTakeDamageIndex; i < code.length; i++){
            if(code[i] === '('){
                parenthesisOffset++;
            } else if(code[i] === ')'){
                parenthesisOffset--;
                if(parenthesisOffset === -1){
                    entity.onTakeDamageCode = code.slice(onTakeDamageIndex, i);
                    break;
                }
            }
        }
    }
}

function cleanCode(c){
    return c.replaceAll('\n', '')/*.replace(/\[[^)]*\]/g, '')*/.replaceAll('\\n', '').replaceAll(' ', '').replaceAll('\t', '').replaceAll("'", `"`).replaceAll("`", `"`);
}

String.prototype.replaceAt = function(startIndex, endIndex=startIndex, replacement="") {
    return this.slice(0, startIndex) + replacement + this.slice(endIndex);
}

let skipUntil = -1;

const isEditor = typeof window !== 'undefined';

// sample input: add(3,divide(8,4)); expected output: 5
// test case 2: floor(multiply(7.2,3))
function _flowrCode(entity={variables:{},codeIndexes:{}}, room, code, parentEntity=undefined){
    exposeVariables(entity);

    if(entity.queryIndexes.length > 0){
        // qis is a clone of queryIndexes. We need to save queryIndexes to run the code again next frame.
        entity.qis = [];
        for(let i = 0; i < entity.queryIndexes.length; i++){
            entity.qis[i] = entity.queryIndexes[i];
        }
    }

    skipUntil = -1;

    const functionBeginningStack = []; // function name beginning index
    const functionEndStack = [];// function name end index
    const argumentsStack = []; // beginning index of the arguments

    let lastFunctionIndex = 0;

    let characterOffset = 0;
    for(let j = 0; j < entity.codeIndexes.length; j++){
        const i = entity.codeIndexes[j] + characterOffset;
        if(code[i] === '('){
            functionBeginningStack.push(lastFunctionIndex);
            functionEndStack.push(i);
            argumentsStack.push(i+1);
            lastFunctionIndex = i+1;
        } else if(code[i] === ',') {
            lastFunctionIndex = i+1;
        } else if(code[i] === ')'){
            const functionBeginningIndex = functionBeginningStack.pop();
            const functionEndIndex = functionEndStack.pop();
            const argumentsStartIndex = argumentsStack.pop();

            if(skipUntil !== -1){
                if(functionBeginningStack.length === skipUntil) {
                    skipUntil = -1;
                    lastFunctionIndex = i + 1;
                }
                continue;
            }

            const functionName = code.slice(functionBeginningIndex, functionEndIndex);
            if(functionName === 'break') return;
            if(functionName === 'breakRemaining') return 'breakRemaining';
            if(functionsList[functionName] === undefined) {console.error(`Function name ${functionName} is undefined! Please check your syntax and try again!`); return; };
            let returnVal = functionsList[functionName]({entity, room, code, characterOffset, parentEntity, functionBeginningStack}, ...code.slice(argumentsStartIndex, i).split(',').map((a, i) => parseType(entity, a, functionName, i)));
            if(returnVal === undefined) returnVal = '';
            const replacement = returnVal.toString();
            code = code.replaceAt(functionBeginningIndex, i + 1, replacement);
            const offsetIncrement = functionBeginningIndex -(i + 1) + replacement.length;
            characterOffset += offsetIncrement;
            lastFunctionIndex = i + offsetIncrement + 1;
        }
    }

    updateExposedVariables(entity);
}

function parseType(entity, a, functionName, paramIndex){
    // special condition for the set function
    if(["get", "set"].includes(functionName.slice(0, 3)) && paramIndex === 0) return a;

    // variable
    if(entity.variables[a] !== undefined) return entity.variables[a];

    // number
    const parsed = parseFloat(a);
    /*second condition is there so that names like "thing2" are possible where some of it is a string and some a number*/
    if(isNaN(parsed) === false && parsed.toString().length === a.length) return parsed;

    // boolean
    if(a === "false") return false;
    if(a === "true") return true;

    // string
    return a;
}

// variables to "expose" (see below)
const enemyExposedVariables = [
    'x', 'y', 'angle', 'hp', 'xv', 'yv', 'healingReduction', 'poisonDamage', 'poisonTime'
];

const readOnlyEnemyExposedVariables = [
    'radius', 'rarity', 'type'
]

const petalExposedVariables = [
    'x', 'y', 'hp', 'angle', 'distance'
]

const readOnlyPetalExposedVariables = [
    'radius', 'subId', 'subStackedId', 'rarity'
]

const parentPetalExposedVariables = [
    ['parentX', 'headX'], ['parentY', 'headY'], ['parentAngle', 'angle'], ['parentHp', 'hp'], ['parentXV', 'xv'], ['parentYv', 'yv'], ['parentAttacking', 'attacking'], ['parentDefending', 'defending']
]

const allEnemyExposedVariables = enemyExposedVariables.concat(readOnlyEnemyExposedVariables);
const allPetalExposedVariables = petalExposedVariables.concat(readOnlyPetalExposedVariables);

// these two functions look complicated but all they do is
// "expose" certain variables so they can be manipulated
// so for example enemies have their hp "exposed". this means
// there is a variable named hp that's automatically set every
// frame and at the end of each frame the enemy's actual hp
// is set to the variable.
function exposeVariables(entity){
    const exposedVariables = getExposedVariableNames(entity);
    for(let i = 0; i < exposedVariables.length; i++){
        entity.variables[exposedVariables[i]] = entity[exposedVariables[i]];
    }

    // special case for petals where they need parent data as well
    if(entity.parent !== undefined){
        for(let i = 0; i < parentPetalExposedVariables.length; i++){
            const [proxyName, actualName] = parentPetalExposedVariables[i];
            entity.variables[proxyName] = entity.parent[actualName];
        }

        // also offset which is an object
        entity.variables['offsetDistance'] = entity['offset'].distance;
        entity.variables['offsetAngle'] = entity['offset'].angle;
    }
}

function updateExposedVariables(entity){
    const exposedVariables = getWritableExposedVariableNames(entity);
    for(let i = 0; i < exposedVariables.length; i++){
        if(entity.variables[exposedVariables[i]] === entity[exposedVariables[i]]) continue;
        if(specialUpdateMap[exposedVariables[i]] !== undefined) specialUpdateMap[exposedVariables[i]](entity, entity.variables[exposedVariables[i]]);
        entity[exposedVariables[i]] = entity.variables[exposedVariables[i]];
    }

    // special case for petals where they need parent data as well
    if(entity.parent !== undefined){
        for(let i = 0; i < parentPetalExposedVariables.length; i++){
            const [proxyName, actualName] = parentPetalExposedVariables[i];
            if(entity.parent[actualName] === entity.variables[proxyName]) continue;
            if(specialUpdateMap[proxyName] !== undefined) specialUpdateMap[proxyName](entity, entity.variables[proxyName]);
            entity.parent[actualName] = entity.variables[proxyName];
        }
    }
}

function getExposedVariableNames(entity){
    if(entity.team === undefined)return allPetalExposedVariables;
    return allEnemyExposedVariables;
}

function getWritableExposedVariableNames(entity){
    if(entity.team === undefined)return petalExposedVariables;
    return enemyExposedVariables;
}

// lets see if this is needed or not...

const specialUpdateMap = {
    hp: (entity, val) => {
        if(!isEditor) {
            entity.takeDamage(0);
            return;
        }
        const lastVal = entity.hp;
        if(val < lastVal){
            entity.updateRenderDamage();
        }
        if(val < 0){
            BiomeSimulateManager.enemyOnKill(entity); 
        }
    },
    x: (entity, val) => {
        if(entity.petals !== undefined){
            // if we're a flower
            entity.headX = val;
        }
    },
    y: (entity, val) => {
        if(entity.petals !== undefined){
            // if we're a flower
            entity.headY = val;
        }
    },
    poisonTime: (entity, val) => {
        entity.poisonTaken[0] = val;
    },
    poisonDamage: (entity, val) => {
        entity.poisonTaken[1] = val;
    }
}

const functionsList = {
    '': () => {},
    add: (adv, a, b) => {
        return a + b;
    },
    subtract: (adv, a, b) => {
        return a - b;
    },
    multiply: (adv, a, b) => {
        return a * b;
    },
    divide: (adv, a, b) => {
        return a / b;
    },
    floor: (adv, a) => {
        return Math.floor(a);
    },
    ceil: (adv, a) => {
        return Math.ceil(a);
    },
    round: (adv, a) => {
        return Math.round(a);
    },
    debug: (adv, a) => {
        console.log(a);
    },
    clearDebug: (adv) => {
        console.clear();
    },
    max: (adv, ...args) => {
        return Math.max(...args);
    },
    min: (adv, ...args) => {
        return Math.min(...args);
    },
    set: ({entity}, a, b) => {
        entity.variables[a] = b;
    },
    setAdd: ({entity}, a, b) => {
        entity.variables[a] += b;
    },
    setSubtract: ({entity}, a, b) => {
        entity.variables[a] -= b;
    },
    random: (adv) => {
        return Math.random();
    },
    sqrt: (adv, a) => {
        return Math.sqrt(a);
    },
    cbrt: (adv, a) => {
        return Math.cbrt(a);
    },
    pow: (adv, a, b) => {
        return Math.pow(a, b);
    },
    sin: (adv, angle) => {
        return Math.sin(angle);
    },
    cos: (adv, angle) => {
        return Math.cos(angle);
    },
    tan: (adv, angle) => {
        return Math.tan(angle);
    },
    atan2: (adv, y, x) => {
        return Math.atan2(y, x);
    },
    mod: (adv, a, b) => {
        return a % b;
    },
    equals: (adv, a, b) => {
        return a == b;
    },
    strictEquals: (adv, a, b) => {
        return a === b;
    },
    greater: (adv, a, b) => {
        return a > b;
    },
    greaterOrEqual: (adv, a, b) => {
        return a >= b;
    },
    less: (adv, a, b) => {
        return a < b;
    },
    lessOrEqual: (adv, a, b) => {
        return a <= b;
    },
    and: (adv, ...params) => {
        for(let i = 0; i < params.length; i++){
            if(!params[i]) return false;
        }
        return true;
    },
    or: (adv, ...params) => {
        for(let i = 0; i < params.length; i++){
            if(params[i]) return true;
        }
        return false;
    },
    not: (adv, a) => {
        return !a;
    },
    query: ({entity, room, code, characterOffset, functionBeginningStack}, queryType) => {

        const queryCodeEnd = entity.qis.pop() + characterOffset;
        const queryCodeStart = entity.qis.pop() + characterOffset;

        const queryCode = code.slice(queryCodeStart, queryCodeEnd);

        if(["flowers", "enemies"].includes(queryType) === false){
            // TODO: error system. Maybe an error function that sets error to true and returns main fn?
            console.error('query error! Query object is not of types: "flowers" or "enemies"! Please change it to one of the following and try again!');
            return;
        }

        const queryObjects = room[queryType];// possible options: "flowers", "enemies", ("petalContainers"?)

        if(queryObjects === undefined){
            console.error('query error! Query object type is undefined');
            return;
        }

        // loop through all room.queryType (room.enemies, room.flowers, etc.)
        // inside the loop, ...
            // update variables
            // _flowrCode(queryCode)
        // un-update variables

        for(let key in queryObjects){
            const entity2 = queryObjects[key];

            // defining variables if needed
            if(entity2.variables === undefined) entity2.variables = {};
            else {
                entity2.lastVariables = {};
                for(let key in entity2.variables){
                    entity2.lastVariables[key] = entity2.variables[key];
                }
            }

            // saving codeIndexes for reset
            if(entity2.codeIndexes !== undefined){
                entity2.lastCodeIndexes = entity2.codeIndexes;
                entity2.lastQueryIndexes = entity2.queryIndexes;
            }

            // TODO: optimization: preprocess once (per frame) with dummy entity and then just copy indexes
            preprocessCode(entity2, queryCode);

            for(let key in entity.variables){
                if(entity2.variables[key] !== undefined) continue;
                entity2.variables[key] = entity.variables[key];
            }
            
            const toBreak = _flowrCode(entity2, room, queryCode, entity);

            // resetting stuff
            if(entity2.lastCodeIndexes !== undefined){
                entity2.codeIndexes = entity2.lastCodeIndexes;
                entity2.queryIndexes = entity2.lastQueryIndexes;
                delete entity2.lastCodeIndexes;
                delete entity2.lastQueryIndexes;
            }
            if(entity2.lastVariables !== undefined){
                entity2.variables = entity2.lastVariables;
                delete entity2.lastVariables;
            } else {
                delete entity2.variables;
            }

            if(toBreak === 'breakRemaining') break;
        }

        // skip normal execution
        skipUntil = functionBeginningStack.length;
    },
    getParentVariable: ({parentEntity, entity}, name) => {
        if(parentEntity === undefined) return entity.variables[name];
        return parentEntity.variables[name];
    },
    // shorthand
    getPv: ({parentEntity, entity}, name) => {
        if(parentEntity === undefined) return entity.variables[name];
        return parentEntity.variables[name];
    },
    setParentVariable: ({parentEntity, entity}, name, val) => {
        if(parentEntity === undefined) {entity.variables[name] = val; return;}
        parentEntity.variables[name] = val;
    },
    // shorthand
    setPv: ({parentEntity, entity}, name, val) => {
        if(parentEntity === undefined) {entity.variables[name] = val; return;}
        parentEntity.variables[name] = val;
    },
    if: ({functionBeginningStack}, bool) => {
        // basic idea: skip evaluating until the subsequent closing parenthesis.
        // how it's done:
        // functionBeginningStack is the amount of unanswered opening parenthesis basically
        // so ((v)) v has a functionBeginningStack of 2
        // so if we had an if statement there, like ((if(bool)(code))) and bool is false then
        // this is evaluted at closing parenthesis when we've already popped from stack.
        // so we're in this outside layer ((v(bool)(code)v2)). Now notice functionBeginningStack
        // will be the same at v2 b/c it breaks free from the closing parenthesis of code.
        // so basically we skip until then, when functionBeginningStack.length == skipUntil
        // this is checked at the closing parenthesis of code but we pop from the stack first
        // meaning we can check after the fact if we're going to exit or not.
        if(!bool) skipUntil = functionBeginningStack.length;
    },
    spawnEnemy: ({room, entity}, type, rarity, amount=1, x=entity.x, y=entity.y, angle=entity.angle) => {
        if(isEditor){
            // editor
            for(let i = 0; i < amount; i++){
                BiomeSimulateManager.spawnEnemyInRoom({type, rarity}, {x,y,angle,forceSpawn: true});
            }
        } else {
            // real game
            for(let i = 0; i < amount; i++){
                room.spawnEnemy({type, rarity}, {x,y,angle,forceSpawn: true});
            }
        }
    },
    onTakeDamage: ({functionBeginningStack}) => {
        skipUntil = functionBeginningStack.length;
    },
    onKill: ({functionBeginningStack}) => {
        skipUntil = functionBeginningStack.length;
    },
    simulateState({entity, room}, stateName){
        if(entity.team === undefined){
            console.error('simulateState error! The simulateState function should only be invoked on enemies, not petals!');
            return;
        }

        // defining state if needed
        if(entity.lastState === undefined || entity.state !== entity.lastState){
            entity.lastState = entity.state;

            let lastDuring = window.duringPetSimulations;
            if(entity.isCustomSummon === true) window.duringPetSimulations = true;

            entity.state = stateName;
            entity.stateData = stateDataMap[stateName](entity);

            window.duringPetSimulations = lastDuring;
        }

        // simulating state
        if(isEditor){
            // editor
            BiomeSimulateManager.runBindedEnemySimulation.bind(entity)(room);
        } else {
            // real game
            entity.simulate(room);
        }
    },
    setStat: ({entity}, stat, value) => {
        if(entity.stats[stat] !== undefined && typeof value !== typeof entity.stats[stat]){
            console.error(`Stat error! Stat ${entity.stats[stat]} is a different type from value ${value}! Please ensure that they are always the same type and try again!`);
        }
        entity.stats[stat] = value;

        if(entity.parent !== undefined){
            if(isEditor){
                // editor
                BiomeSimulateManager.runBindedUpdatePetalAngles.bind(entity.parent)();
            } else {
                // real game
                entity.parent.updatePetalAngles();
            }
        }
    },
    normalPetalSimulate: ({entity, room}) => {
        if(entity.dv === undefined){
            console.log('normalPetalSimulate error! The normalPetalSimulate function should only be invoked on petals, not enemies!');
            return;
        }

        entity.hasNormalPetalSimulate = true;

        const last = entity.stats.code;
        delete entity.stats.code;
        if(isEditor){
            BiomeSimulateManager.runBindedPetalSimulation.bind(entity)(entity.parent, room);
        } else {
            entity.simulate(entity.parent, room);
        }
        entity.stats.code = last;
    },
    interpolate(adv, start, end, time){
        return interpolate(start, end, time);
    },
    interpolateDirection(adv, a0, a1, t){
        return a0 + shortAngleDist(a0,a1)*t;
    },
    killAllEnemies({room, entity}, excludeSelf=true, ...excludeTypes){
        if(isEditor){
            // editor
            for(let key in room.enemies){
                if(excludeSelf === true && room.enemies[key] === entity) continue;
                if(excludeTypes.includes(room.enemies[key].type) === true || excludeTypes.includes(room.enemies[key].customType) === true) continue;
                BiomeSimulateManager.enemyTakeDamage(room.enemies[key], 1E99);
            }
        } else {
            // game
            for(let key in room.enemies){
                if(excludeSelf === true && room.enemies[key] === entity) continue;
                if(excludeTypes.includes(room.enemies[key].type) === true || excludeTypes.includes(room.enemies[key].customType) === true) continue;
                room.enemies[key].takeDamage(1E99);
            }
        }
    }
}

function shortAngleDist(a0,a1) {
    const max = Math.PI*2;
    const da = (a1 - a0) % max;
    return 2*da % max - da;
}

function interpolate(s, e, t){
    return s + (e - s) * t;
}

function logAround(code, index, numsAhead=3, numsBehind=3){
    console.log(code.slice(index - numsBehind, index + numsAhead));
}

// const testEntity = {};
// defineVariables(testEntity, 
// `x, 5
// y, 3

// longer, name
// variable2, 5test
// `);

// flowrCode(testEntity, "set(x,floor(multiply(7.2,3))) debug(x)");

try{
    module.exports = {
        initFlowrCode, flowrCode, preprocessCode
    };
} catch(e){}