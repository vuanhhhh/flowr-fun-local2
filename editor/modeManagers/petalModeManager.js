function petalData(){
    return {
        x: 0,
        y: 0,
        angle: 0,
        radius: 10,
        type: 'Custom',
        customType: currentPetalCustomType,
        rarity: 0,
        damage: 1,
        offset: {distance: 0, angle: 0},
        distance: 0,
        dv: 0,
        id: 0,
        subId: 0,
        subStackedId: 0,
        dead: false,
        hp: 1,
        maxHp: 1,
        reload: 1000,
        maxReload: 1000,
        angleOffset: 0,
    };
}

let currentPetalCustomType = 'default';
let shapesMap = editorPetalShapesMap;
let currentShapeIndex = 0;
let currentShape = shapesMap[currentPetalCustomType][0];
let petal = new Petal(petalData());
let draggingControlPoint = null;
let controlPoints = [];
let createShapeActive = false;
const controlPointRadius = 1.35;

// stuff we need: create petal object on switch, and change parameters of the petal (ex. rendering, preset effects like poision/slow/heal/summons/etc.) 
class PetalModeManager {
    static init(){
        petal = new Petal(petalData());
        // doing the interpolate effect even when petals dont have interpolate
        petal.actualRadius = petal.radius;
        petal.radius = 0;

        controlPoints = [];
        draggingControlPoint = null;

        currentShapeIndex = 0;
        shapesMap = getShapesMap[window.mode]();
        currentShape = shapesMap[window.mode === 'petal' ? currentPetalCustomType : currentEnemyCustomType][0];
        createShapeActive = false;
    }
    static initEventListeners(){
        mouseMoveFunctions.push((e) => {
            if((window.mode !== 'petal' && window.mode !== 'enemy') || draggingControlPoint === null){
                return;
            }
            const worldCoordinates = PetalModeManager.screenToWorld({x: e.pageX, y: e.pageY});
            PetalModeManager.moveControlPoint(draggingControlPoint, worldCoordinates);
        })
        const mouseMoveFunction = mouseMoveFunctions[mouseMoveFunctions.length-1];
        mouseDownFunctions.push((e) => {
            if(window.mode !== 'petal' && window.mode !== 'enemy'){
                return;
            }
            const worldCoordinates = PetalModeManager.screenToWorld({x: e.pageX, y: e.pageY});
            for(let i = 0; i < controlPoints.length; i++){
                const point = controlPoints[i];
                if(point.x !== undefined){
                    if(Math.sqrt((worldCoordinates.x-point.x)**2+(worldCoordinates.y-point.y)**2) <= controlPointRadius){
                        draggingControlPoint = point;
                        mouseMoveFunction(e);
                        return;
                    }
                } else {
                    const x = Math.cos(point.angle) * point.distance + point.anchorPoint.x;
                    const y = Math.sin(point.angle) * point.distance + point.anchorPoint.y;
                    if(Math.sqrt((worldCoordinates.x-x)**2+(worldCoordinates.y-y)**2) <= controlPointRadius){
                        draggingControlPoint = point;
                        mouseMoveFunction(e);
                        return;
                    }
                }
            }
        })
        mouseUpFunctions.push((e) => {
            if(window.mode !== 'petal' && window.mode !== 'enemy'){
                return;
            }
            draggingControlPoint = null;
        })
    }
    static screenToWorld({x,y}){
        return {
            x: camera.x + (-Ref.canvas.w / 2 + x * (Ref.canvas.w / window.innerWidth)) / camera.zoom,
            y: camera.y + (-Ref.canvas.h / 2 + y * (Ref.canvas.h / window.innerHeight)) / camera.zoom
        }
    }
    static updateCurrentCustomType(type=petal.customType){
        if(window.mode === 'petal'){
            currentPetalCustomType = type;
        } else if(window.mode === 'enemy'){
            currentEnemyCustomType = type;
        }
        petal.customType = type;
        PetalModeManager.setShapeIndex(currentShapeIndex);
    }
    static redefineDefaultRendersIfNeeded(){
        if(window.mode === 'petal'){
            if(editorPetalShapesMap.default === undefined){
                editorPetalShapesMap.default = [[]];
            }
        } else if(window.mode === 'enemy'){
            if(editorEnemyShapesMap.default === undefined){
                editorEnemyShapesMap.default = [[]];
            }
        }
    }
    // static startOver(){
    //     shapesMap[petal.customType] = [[]];
    //     PetalModeManager.updateCurrentCustomType();
    //     PetalModeManager.init();
    // }
    static finishPetal(){
        if(petal.customType === 'default'){
            alert((window.mode === 'petal' ? "Petal": "Enemy") + ' Creation Failed!\n(Hint: change the "type name" parameter to something other than "default")')
            return;
        }
        PetalModeManager.redefineDefaultRendersIfNeeded();

        if(window.mode === 'petal'){
            settingsMenus.petal.typeName = "default";
        } else if(window.mode === 'enemy'){
            settingsMenus.enemy.typeName = "default";
        }
        PetalModeManager.updateCurrentCustomType("default");
        if(window.mode === 'petal'){
            PetalModeManager.init();
        } else if(window.mode === 'enemy') {
            EnemyModeManager.init();
        }

        PetalModeManager.removeEmptyLastShapeIfNeeded();
        updateAllMenus();
    }
    static removeLastPath(){
        if(currentShape.length <= 1){
            return false;
        }
        currentShape.pop();

        // readding the next path which creates the control points
        const current = currentShape.pop();
        const currentFunctionName = current[0];
        const currentControlPoints = toolMap[window.mode].find(p => p.data[0] === currentFunctionName)?.controlPoints;
        PetalModeManager.addPath(current, currentControlPoints);

        updateRenderMenu();
        return true;
    }
    static changeCustomType(customType){
        const lastCustomType = petal.customType;
        const shapeData = shapesMap[petal.customType];

        delete shapesMap[petal.customType];
        petal.customType = customType;
        if(shapeData.length !== 1 || shapeData[0].length !== 0 || shapesMap[petal.customType] === undefined){// if it's not [[]] or we need to replace b/c its undefined
            if(shapesMap[petal.customType] === undefined){
                shapesMap[petal.customType] = shapeData;
            } else {
                let toOverride = confirm(`You have just changed type to "${customType}" which already exists. Would you like to override?\n(Press Cancel to revert this action)`);
                if(toOverride === true){
                    shapesMap[petal.customType] = shapeData;
                } else {
                    petal.customType = lastCustomType;
                    shapesMap[petal.customType] = shapeData;
                    settingsMenus[window.mode].typeName = lastCustomType;
                    updateSettingsMenu();
                }
            }
        }

        PetalModeManager.updateCurrentCustomType(petal.customType);
        PetalModeManager.regenerateControlPoints();
        PetalModeManager.removeEmptyLastShapeIfNeeded();
        updateStatsMenu();
    }
    static setShapeIndex(i){
        if(i < 0) return;
        i = Math.min(i, shapesMap[petal.customType].length);
        currentShapeIndex = i;
        currentShape = shapesMap[petal.customType][currentShapeIndex];
        if(currentShape === undefined){
            currentShape = shapesMap[petal.customType][currentShapeIndex] = [];
        }
    }
    static startCreateShape(shapeIndex=undefined, isPreviousShape=false){
        // don't go forwards when the current shape is empty, unless we're going back one shape in which case it's fine if the currentShapeIndex > 0
        if(isPreviousShape === true && currentShapeIndex > 0){
            if(currentShape.length === 0){
                // remove that current shape
                shapesMap[petal.customType].splice(currentShapeIndex, 1);
                PetalModeManager.setShapeIndex(currentShapeIndex - 1);
            }
        } else {
            if(currentShape.length === 0)return;
        }
        if(createShapeActive === true){
            PetalModeManager.finishCreateShape();
            // return;
        }
        createShapeActive = true;
        controlPoints = [];
        if(shapesMap[petal.customType] === undefined){
            shapesMap[petal.customType] = [];
        }

        PetalModeManager.setShapeIndex(shapeIndex !== undefined ? shapeIndex : shapesMap[petal.customType].length);

        updateRenderMenu();
    }
    static finishCreateShape(){
        createShapeActive = false;
        controlPoints = [];

        updateRenderMenu();
    }
    static previousCreateShape(){
        if(currentShapeIndex <= 0){
            return;
        }
        createShapeActive = false;
        PetalModeManager.startCreateShape(currentShapeIndex - 1, true);

        PetalModeManager.regenerateControlPoints();

        updateRenderMenu();
    }
    static removeLastShape(){
        if(shapesMap[petal.customType].length <= 1){
            if(shapesMap[petal.customType].length === 1){
                // undo all except one
                while(PetalModeManager.removeLastPath()){}
            }
            return;
        }
        controlPoints = [];
        draggingControlPoint = null;
        PetalModeManager.setShapeIndex(shapesMap[petal.customType].length - 1);
        shapesMap[petal.customType].pop();
        PetalModeManager.setShapeIndex(currentShapeIndex - 1);
        
        updateRenderMenu();

        PetalModeManager.regenerateControlPoints();
    }
    static flipShapeX(){
        for(let i = 0; i < currentShape.length; i++){
            const current = currentShape[currentShape.length - 1 - i];
            const currentFunctionName = current[0];
            const currentControlPoints = toolMap[window.mode].find(p => p.data[0] === currentFunctionName)?.controlPoints;

            for(let j = 0; j < currentControlPoints.length; j++){
                if(currentControlPoints[j].x){
                    current[currentControlPoints[j].x] *= -1;
                }
            }
            PetalModeManager.setControlPoints(currentControlPoints);
        }

        updateRenderMenu();

        PetalModeManager.regenerateControlPoints();
    }
    static flipShapeY(){
        for(let i = 0; i < currentShape.length; i++){
            const current = currentShape[currentShape.length - 1 - i];
            const currentFunctionName = current[0];
            const currentControlPoints = toolMap[window.mode].find(p => p.data[0] === currentFunctionName)?.controlPoints;

            for(let j = 0; j < currentControlPoints.length; j++){
                if(currentControlPoints[j].y){
                    current[currentControlPoints[j].y] *= -1;
                }
            }
            PetalModeManager.setControlPoints(currentControlPoints);
        }

        updateRenderMenu();

        PetalModeManager.regenerateControlPoints();
    }
    static duplicateShape(){
        controlPoints = [];
        draggingControlPoint = null;
        PetalModeManager.setShapeIndex(shapesMap[petal.customType].length - 1);
        shapesMap[petal.customType].push(window.structuredClone(shapesMap[petal.customType][shapesMap[petal.customType].length - 1]));
        PetalModeManager.setShapeIndex(shapesMap[petal.customType].length - 1);
        
        updateRenderMenu();

        PetalModeManager.regenerateControlPoints();
    }
    static regenerateControlPoints(){
        if(currentShape.length === 0) return;
        // updating control points
        const current = currentShape[currentShape.length - 1];
        const currentFunctionName = current[0];
        const currentControlPoints = toolMap[window.mode].find(p => p.data[0] === currentFunctionName)?.controlPoints;
        PetalModeManager.setControlPoints(currentControlPoints);
    }
    static addPath(path, controlPoints=[]){
        if(path === "Start"){
            PetalModeManager.startCreateShape();
            return;
        } else if(path === "Previous"){
            PetalModeManager.previousCreateShape();
            return;
        } else if(path === "Undo"){
            PetalModeManager.removeLastPath();
            return;
        }
        shapesMap[petal.customType][currentShapeIndex].push(path.map(p => {
            if(p === "randomPos"){
                return Math.round((Math.random() * 1 - .5) * Math.sqrt(2) * 100) / 100;
            } else if(p === "randomHex"){
                return generateRandomHex();
            } else {
                return p;
            }
        }));
        PetalModeManager.setControlPoints(controlPoints);

        PetalModeManager.removeEmptyLastShapeIfNeeded();

        updateRenderMenu();
    }
    static removeEmptyLastShapeIfNeeded(){
        if(shapesMap[petal.customType].length - 1 === currentShapeIndex){
            return;
        }
        
        if(shapesMap[petal.customType].slice(-1)[0].length === 0){
            shapesMap[petal.customType].pop();
            updateRenderMenu();
        }
    }
    static setControlPoints(points){
        controlPoints = [];
        const currentPath = currentShape[currentShape.length - 1];
        // {x: index, y: index} or {radius: index, distance: index}
        let anchorPoint = null; 
        controlPoints.push(...points.map(p => {
            if(p.x !== undefined && p.y !== undefined){
                return anchorPoint = {track: p, path: currentPath, x: currentPath[p.x] * petal.radius, y: currentPath[p.y] * petal.radius, isOvalRadius: p.isOvalRadius === true, isOvalBase: p.isOvalBase === true};
            } else {
                return {track: p, path: currentPath, angle: currentPath[p.angle], distance: (currentPath[p.distance] ?? .3) * petal.radius, isFixedDistance: currentPath[p.distance] === undefined};
            }
        }));

        if(anchorPoint !== null){
            for(let i = 0; i < controlPoints.length; i++){
                const p = controlPoints[i];
                if((p.x === undefined && p.y === undefined) || p.isOvalRadius === true){
                    p.anchorPoint = anchorPoint;
                } else if(p.isOvalBase === true){
                    p.anchorPoint = controlPoints[controlPoints.length - 2];
                }

                // snapping to grid if needed
                if(Settings.snapToGrid === true && p.x !== undefined){
                    const snapPos = PetalModeManager.snapToGrid(p.x, p.y);
                    PetalModeManager.moveControlPoint(p, {x: snapPos[0], y: snapPos[1]});
                }
            }
        }
    }
    static updateControlPoints(){
        for(let i = 0; i < controlPoints.length; i++){
            const point = controlPoints[i];
            if(point.x !== undefined){
                point.x = point.path[point.track.x] * petal.radius;
                point.y = point.path[point.track.y] * petal.radius;
            } else {
                point.angle = point.path[point.track.angle];
                if(point.isFixedDistance === false){
                    point.distance = point.path[point.track.distance] * petal.radius;
                }
            }
        }
    }
    static moveControlPoint(point, {x,y}){
        if(Settings.boundToHitbox === true){
            if(Math.sqrt(x ** 2 + y ** 2) > petal.radius){
                const angle = Math.atan2(y, x);
                x = Math.cos(angle) * petal.radius;
                y = Math.sin(angle) * petal.radius;
            }
        }

        if(point.x !== undefined && point.y !== undefined){
            [x, y] = PetalModeManager.snapToGrid(x, y);

            if(point.isOvalRadius === true){
                point.path[point.track.x] = Math.abs((x - point.anchorPoint.x) / petal.radius);
                point.path[point.track.y] = Math.abs((y - point.anchorPoint.y) / petal.radius);
            } else if(point.isOvalBase === true){
                point.path[point.track.x] = x / petal.radius;
                point.path[point.track.y] = y / petal.radius;
                PetalModeManager.moveControlPoint(point.anchorPoint, {x: point.anchorPoint.x, y: point.anchorPoint.y});
            } else {
                point.path[point.track.x] = x / petal.radius;
                point.path[point.track.y] = y / petal.radius;
            }

            point.x = x;
            point.y = y;
        } else {
            point.path[point.track.angle] = Math.atan2(y - point.anchorPoint.y,x - point.anchorPoint.x);
            point.angle = point.path[point.track.angle];
            
            if(point.isFixedDistance === false){
                point.path[point.track.distance] = Math.sqrt((x-point.anchorPoint.x)**2 + (y-point.anchorPoint.y)**2) / petal.radius;
                point.distance = point.path[point.track.distance] * petal.radius;
            }

            // for circles: checking if there's another point with the same distance. If there is then update it
            for(let i = 0; i < controlPoints.length; i++){
                const point2 = controlPoints[i];
                if(point === point2 || point2.isFixedDistance === true) continue;
                if(point2.track.distance === point.track.distance){
                    point2.distance = point.path[point.track.distance] * petal.radius;
                }
            }
        }
        updateRenderMenu();
    }
    static snapToGrid(x, y){
        if(Settings.snapToGrid === false){
            return [roundTo(x, 1000), roundTo(y, 1000)];
        }
        x = Math.round(x / Settings.snapGridSize) * Settings.snapGridSize;
        y = Math.round(y / Settings.snapGridSize) * Settings.snapGridSize;
        if(Math.sqrt(x ** 2 + y ** 2) > petal.radius){
            if(Math.abs(x) > Math.abs(y)){
                x = Math.sign(x) * (Math.abs(x) - Settings.snapGridSize);
            } else {
                y = Math.sign(y) * (Math.abs(y) - Settings.snapGridSize);
            }
        }
        return [roundTo(x, 1000), roundTo(y, 1000)];
    }
    static drawPetalBound(){
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.arc(0, 0, petal.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
    }
    static draw(){

        petal.radius = interpolate(petal.radius, petal.actualRadius, 0.08);
        ctx.lastTransform = ctx.getTransform();
        ctx.translate(canvas.w/2 - camera.x * camera.zoom, canvas.h/2 - camera.y * camera.zoom);
        ctx.scale(camera.zoom, camera.zoom);

        if(Settings.boundToHitbox === true){
            PetalModeManager.drawPetalBound();
        }
        
        petal.draw();

        for(let i = 0; i < controlPoints.length; i++){
            drawControlPoint(controlPoints[i]);    
        }
        controlPointFlower.updateInterpolate();

        ctx.setTransform(ctx.lastTransform);
    }
}

const controlPointFlower = new Flower(0);
function drawControlPoint(point){
    if(point.x !== undefined){
        controlPointFlower.drawFlower(point.x, point.y, controlPointRadius);
        controlPointFlower.angle = Math.atan2(point.y, point.x) + Math.PI;
    } else {// TODO: fix a bug where arc is undefined if you play with the sliders for a bit (idk why)
        controlPointFlower.drawFlower(Math.cos(point.angle) * point.distance + point.anchorPoint.x, Math.sin(point.angle) * point.distance + point.anchorPoint.y, controlPointRadius);
        controlPointFlower.angle = point.angle + Math.PI;
    }
    if(isNaN(controlPointFlower.angle) === true){
        controlPointFlower.angle = Math.random() * Math.PI * 2;
    }
}

PetalModeManager.initEventListeners();