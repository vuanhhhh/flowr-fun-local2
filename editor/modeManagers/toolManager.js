const toolMap = {
    petal: [
        {
            name: "New Shape",
            data: "Start",
            controlPoints: [],
        },
        {
            name: "Line",
            data: ['lineTo', "randomPos", "randomPos"],
            controlPoints: [{x: 1, y: 2}],
        },
        {// bezier curve
            name: "Curve",
            data: ['quadraticCurveTo', "randomPos", "randomPos", "randomPos", "randomPos"],
            controlPoints: [{x: 1, y: 2}, {x: 3, y: 4}],
        },
        // { // yeah i don't feel like cubics are needed for a game like florr... maybe will add in an update
        //     name: "Detailed Curve",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        // {
        //     name: "Teleport",
        //     imageSrc: generatePetalIcon(),
        //     data: ['moveTo', "randomPos", "randomPos"],
        //     controlPoints: [{x: 1, y: 2}],
        //     onclick: () => {}
        // },
        {
            name: "Circle",
            data: ['arc', "randomPos", "randomPos", 1, -Math.PI / 2, Math.PI * 1.5, false],
            controlPoints: [{x: 1, y: 2}, {distance: 3, angle: 5}, {distance: 3, angle: 4}],
        },
        // {// we can make half circles configurable in circle
        //     name: "Circle Part",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        {// oval and oval part should be the same
            name: "Oval",
            data: ['ellipse', "randomPos", "randomPos", 0.5, 0.8 / 3, 0, -Math.PI / 2, Math.PI * 1.5, false],
            controlPoints: [{angle: 6}, {angle: 7}, {angle: 5}, {x: 3, y: 4, isOvalRadius: true}, {x: 1, y: 2, isOvalBase: true}],
        },
        // {
        //     name: "Oval Part",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        // { // eh rectangles look bad and people can just make them if they really want with 4 line segs
        //     name: "Rectangle",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        // this is florr, not ui simulator. We don't need rounded rectangles lmao
        // {
        //     name: "Rounded Rectangle",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        {
            name: "Stroke Weight",
            data: ['setLineWidth', 0.2],
            controlPoints: [],
        },
        {
            name: "Fill Color",
            data: ['setFillStyle', "randomHex"],
            controlPoints: [],
        },
        {
            name: "Fill Opacity",
            data: ['setFillAlpha', 0.5],
            controlPoints: [],
        },
        {
            name: "Stroke Color",
            data: ['setStrokeStyle', "randomHex"],
            controlPoints: [],
        },
        {
            name: "Stroke Opacity",
            data: ['setStrokeAlpha', 0.5],
            controlPoints: [],
        },
        // {// dont trust kids with 4d tesseracts (or the equivalent to a non-programmer)
        //     name: "Translate",
        //     imageSrc: generatePetalIcon(),
        //     data: ['translate', "randomPos", "randomPos"],
        //     controlPoints: [{x: 1, y: 2}],
        //     onclick: () => {}
        // },
        // {
        //     name: "Rotate",
        //     imageSrc: generatePetalIcon(),
        //     data: ['rotate', Math.PI / 2],
        //     controlPoints: [],
        //     onclick: () => {}
        // },
        // {// not needed, we will fill and stroke once at the end automatically
        //     name: "Fill",
        //     imageSrc: generatePetalIcon(),
        //     data: ['fill'],
        //     onclick: () => {}
        // },
        // {
        //     name: "Stroke",
        //     imageSrc: generatePetalIcon(),
        //     data: ['stroke'],
        //     onclick: () => {}
        // },
        // {// this will ctx.save before ctx.clipping, to be done post release
        //     name: "Clip",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        // {
        //     name: "Stop Clip",
        //     imageSrc: generatePetalIcon(),
        //     onclick: () => {}
        // },
        {
            name: "Undo",
            data: "Undo",
            controlPoints: [],
        },
        {// TODO: switch this to say test when shape isn't started. Clever use of screen space :)
            name: "Previous Shape",
            data: "Previous",
            controlPoints: [],
        },
        // maybe shadow blur? or dashedLine?
    ],
    enemy: [
    
    ],
    biome: [
        {
            name: "Test Game",
            data: "Test Game",
            onclick: BiomeModeManager.toggleTestGame
        },
        // TODO
        // {
        //     name: "Add Enemy",
        //     data: "Add Enemy",
        //     onclick: BiomeModeManager.addEnemy
        // },
        // {
        //     name: "Add Special Wave",
        //     data: "Add Special Wave",
        //     onclick: BiomeModeManager.addSpecialWave
        // },
    ]
}
toolMap.enemy = window.structuredClone(toolMap.petal);

for(let mode in toolMap){
    const toolsInMode = toolMap[mode];
    for(let i = 0; i < toolsInMode.length; i++){
        if(mode === 'petal'){
            toolsInMode[i].onclick = () => {PetalModeManager.addPath(toolsInMode[i].data, toolsInMode[i].controlPoints)};
        } else if(mode === 'enemy'){
            toolsInMode[i].onclick = () => {EnemyModeManager.addPath(toolsInMode[i].data, toolsInMode[i].controlPoints)};
        }
        
        toolsInMode[i].imageSrc = (generateToolIconMap[toolsInMode[i].name] ?? generatePetalIcon)(); 
    }
}

// enemies and petals have the same rendering controls

const tools = [];

class ToolManager {
    static setTools(t){
        ToolManager.clearTools();

        for(let i = 0; i < t.length; i++){
            const newTool = createTool(t[i]);
            Ref.toolMenu.appendChild(newTool);
            tools.push(newTool);
        }
    }
    static clearTools(){
        for(let i = 0; i < tools.length; i++){
            tools[i].remove();
        }
        tools.length = 0;
    }
    static useTool(name){
        toolMap[window.mode][name];
    }
}

function createTool({imageSrc, name, onclick}){
    const menuButtonDiv = document.createElement('div');
    menuButtonDiv.classList.add('menu-button-div');

    const menuButton = document.createElement('div');
    menuButton.classList.add('menu-button');

    const menuImg = document.createElement('img');
    menuImg.style.width = "30px";
    menuImg.style.height = "30px";
    menuImg.style.draggable = "false";
    menuImg.src = imageSrc;

    menuButton.appendChild(menuImg);
    menuButtonDiv.appendChild(menuButton);
    menuButton.onclick = onclick;

    const menuButtonText = document.createElement('span');
    menuButtonText.classList.add('menu-button-text');
    menuButtonText.textContent = name;
    menuButtonDiv.appendChild(menuButtonText);

    return menuButtonDiv;
}

function updateToolsMenu(){
    ToolManager.setTools(toolMap[window.mode]);
}