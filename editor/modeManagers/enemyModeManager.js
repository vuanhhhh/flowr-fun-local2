let currentEnemyCustomType = 'default';
function enemyData(){
    return {
        x: 0,
        y: 0,
        radius: 20,
        hp: 1,
        maxHp: 1,
        id: 0,
        type: "Custom",
        customType: currentEnemyCustomType,
        rarity: 0,
        angle: 0,
        team: "enemy",
        xp: this.xp,
    };
}

class EnemyModeManager extends PetalModeManager {// hehe boi copypasting code ftw
    static init(){
        PetalModeManager.init();
        // petal is just guaranteed to be an interface with customType, radius, etc. , so this is kind of like weak dependency injection
        petal = new Enemy(enemyData());
        petal.actualRadius = petal.radius;
        petal.radius = 0;
    }
    // do nothing because we already
    // have the event listeners
    // defined in petalModeManager
    static initEventListeners(){}// BUG: if you create a petal, create an enemy, change the default type, and then finish the enemy, the petal appears in the enemy's slot until the menu is refreshed
}