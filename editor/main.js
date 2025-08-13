window.mode = 'will be set in the function call'// can be ['petal', 'enemy', 'biome']

// const a = prompt('please enter beta key!');
// if(a !== 'Hleoygsaonra!'){// yeah this is pretty easy to break. Congrats if you found the /editor url though, dm me how you did it (i won't ban you or anything (i can't, i don't have your ip on this local website and i use vultr so no logs), im just genuinely curious)
//     location.reload();
// }
let petalReloadData = {}
let petalHpData = {};

const roomRadius = 500;// rooms have a constant radius. TODO: once testing is implemented then make this radius dynamically update with wave and roomRadiusFunction.
room.radius = roomRadius * 5;
room.render = {radius: roomRadius * 5};

const selectedBox = Ref.selectedBox;
const boxWidth = Ref.modeGui.clientWidth / 3;
selectedBox.style.width = boxWidth + "px";

function changeMode(mode){
    if(mode === window.mode) return;

    terminateMode();

    window.mode = mode;

    let leftIndex = 0;
    if(mode === 'enemy'){
        leftIndex = 1;
    } else if(mode === 'biome'){
        leftIndex = 2;
    }

    // room render radius effect
    if(mode === 'biome'){
        room.radius = roomRadius;
    } else {
        room.radius = roomRadius * 5;
    }

    selectedBox.style.left = leftIndex * boxWidth + "px";
    updateAllMenus();
    updateZoom();
    initMode();
}

changeMode('petal');

// flowr.fun/customBiome/Slime
const split = location.href.split('/');
window.isIframePlayer = split[split.length-2] === 'customBiome';
if(window.isIframePlayer === true){
    let pd, sw;
    const startGame = () => {
        // TODO: set hp as finite, get petals from worker message + append
        (async() => {
            changeMode('biome');
            await importBiome(window.biomeData_);
            
            const s = document.createElement('script');
            s.src = "/client/stats.js";
            document.body.appendChild(s);
            s.onload = () => {
                console.log('loaded');
                window.calculateStats(false);
                for(let key in Stats.petals){
                    if(editorStats.petals[key] === undefined) editorStats.petals[key] = Stats.petals[key];
                }
                
                document.getElementById('toolmenu').classList.add('hidden');

                window.petalData_ = pd;
                window.sw_ = sw;
                testingBiomeData.unlimitedHp = window.unlimHp_ = false;
                testingBiomeData.testWave = room.wave = sw;

                testingFlower.petals = playingPetalData(window.petalData_);
                
                // start game!
                BiomeModeManager.toggleTestGame();
            }
            // testingFlower.petals = playingPetalData(window.petalData_);
            // delete window.petalData_; delete window.biomeData_;
        })();
    }
    let condition1 = false;
    let condition2 = false;
    window.addEventListener(
        "message",
        (event) => {
            if(event.origin !== location.origin) return;

            pd = event.data[0];
            sw = event.data[1] ?? 1;
            
            condition1 = true;
            if(condition1 && condition2) startGame();
        },
        false,
    );

    const s = document.createElement('script');
    s.src = '/_customCodeBiomes/importCustomCodeBiomes.js';
    document.body.appendChild(s);
    s.onload = () => {
        // console.log(customCodeBiomeNames, importedCustomBiomeData);
        for(let i = 0; i < customCodeBiomeNames.length; i++){
            if(customCodeBiomeNames[i] === split[split.length-1]){
                window.biomeData_ = importedCustomBiomeData[i];
                condition2 = true;
                if(condition1 && condition2) startGame();
            }
        }
    }
}

(function draw(){
    render();

    requestAnimationFrame(draw);
}());