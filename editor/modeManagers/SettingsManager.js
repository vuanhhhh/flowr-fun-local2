const Settings = {
    boundToHitbox: true,
    snapToGrid: true,
    snapGridSize: 2.5
}

class SettingsManager {
    static changeSetting(name, value){
        Settings[name] = value;
    }
}