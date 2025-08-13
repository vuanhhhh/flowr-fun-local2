const Ref = {
    loader: el('loader'),
    canvas: id('canvas'),

    allGui: el('all-gui'),
    modeGui: id('leftgui'),
    toolGui: id('centergui'),

    selectedBox: id('selected-box'),

    gui: el('data-gui'),
    guiMenu: el('gui'),
    toggleGuiButton: el('toggle-gui'),

    toolMenu: id('toolmenu'),

    petalButtonImage: id('petal-button-image'),
    enemyButtonImage: id('enemy-button-image'),
    biomeButtonImage: id('biome-button-image'),

    petalButton: id('petal-button'),
    enemyButton: id('enemy-button'),
    biomeButton: id('biome-button'),
};

function el(s){
    return document.querySelector('.' + s);
}

function id(s){
    return document.getElementById(s);
}