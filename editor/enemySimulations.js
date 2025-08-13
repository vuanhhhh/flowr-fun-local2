const defaultStateMap = {
    // enemyType: 'defaultState'
}

const aggroMap = {
    // enemyType: 'shoot' // or some other state
}

function initEnemyState(e){
    changeState(e, defaultStateMap[e.customType]);
}

function changeState(e, state){
    // console.log('changing state', state);
    let lastDuring = window.duringPetSimulations;
    if(e.isCustomSummon === true) window.duringPetSimulations = true;
    if(e.state === 'grow'){
        if(state !== 'grow'){
            e.stats.otherSimulateState = state;
        }
    } else {
        e.state = state;
    }
    e.stateData = stateDataMap[state](e);
    window.duringPetSimulations = lastDuring;
}

function changeToDefaultState(e){
    changeState(e, defaultStateMap[e.customType]);
}

const stateDataMap = {
    stationary: (e) => {},
    passive: (e) => {
        e.angle = Math.random() * Math.PI * 2;
        return {
            motionTimer: 0
        }
    },
    sine: (e) => {
        e.angle = Math.random() * Math.PI * 2;
        if (Math.random() < 0.5){
            e.dir = 1;
        }
        else{
            e.dir = -1;
        }
        
        return {
            motionTimer: 0
        }
    },
    detectingSine: (e) => {
        e.angle = Math.random() * Math.PI * 2;
        if (Math.random() < 0.5){
            e.dir = 1;
        }
        else{
            e.dir = -1;
        }
        return {
            motionTimer: 0,
            detectionDistance: (e.stats.detectionDistance + e.radius) ?? 150 + e.radius * 5,
        }
    },
    customCode: (e) => {
        initFlowrCode(e, e.stats.code, e.stats.variableCode);
    },
    shoot: (e) => {
        const maxCooldown = (2 + (e.rarity / 8) ** 1.2 / 2) * 1000 / 30;
        let prediction = false;
        let predictionChance = 0;
        if (e.rarity > 1){
            //Rare or above
            predictionChance = -15 + e.rarity * 15;
            if (predictionChance > 50){
                predictionChance = 50;
            }
        }
        if (Math.random() * 100 < predictionChance){
            prediction = true;
        }
        return {
            maxCooldown,
            currentCooldown: maxCooldown * 2 / 3,
            prediction
        }
    },
    detecting: (e) => {
        return {
            detectionDistance: (e.stats.detectionDistance + e.radius) ?? 150 + e.radius * 5,
            aggroState: aggroMap[e.customType ?? e.type] ?? 'aggressive',
            ...stateDataMap.passive(e),
        }
    },
    follow: (e) => {},
    followAggressive: (e) => {
        return {
            detectionDistance: (e.stats.detectionDistance + e.radius) ?? 150 + e.radius * 5
        }
    },
    aggressive: (e) => {},
    hop: (e) => {
		const maxCooldown = 25;
		return {
			maxCooldown,
			currentCooldown: maxCooldown * 1/3
		}
	},
	scaredAggressive: (e) => {
        if(e.stats.healing === undefined){
            e.stats.healing = 1 / 100;
        }
		return {
			healing: false
		}
	},
	crab: (e) => {
		return {
			direction: Math.floor(Math.random() * 1.9999),
			anger: 0
		}
	},
    projectile: (e) => {
        return {
            lifetime: 50 + e.rarity * 10
        };
    },
    parentStuck: (e) => {},
    grow: (e) => {
        if(e.spawnSameLimit === undefined) e.spawnSameLimit = e.stats.spawnSameLimit;

        if(e.children === undefined){
            e.children = [];

            if(e.spawnSameLimit > 0){
                const spawnAmount = e.stats.spawnAmount ?? 3;
                for(let i = 0; i < spawnAmount; i++){
                    e.children.push(BiomeSimulateManager.spawnEnemyInRoom({type: e.stats.spawnType ?? 'Ladybug', rarity: Math.max(0, e.rarity - (e.stats.spawnRarityOffset ?? 0))}, {
                        x: e.x,
                        y: e.y,
                        forceSpawn: true,
                        spawnSameLimit: e.spawnSameLimit - 1
                    }));
                }
            }
            for(let i = 0; i < e.children.length; i++){
                e.children[i].growParentRef = e;
            }
        }
        
        if(e.stats.childrenWanderAngle === false){
            e.rotation = 0;
        }
        if(e.stats.otherSimulateState !== undefined)return stateDataMap[e.stats.otherSimulateState](e);
    },
    sandstorm: (e) => {},
    burrow: (e) => {},
    fireBurrow: (e) => {
        return {
            detectionDistance: (e.stats.detectionDistance + e.radius) ?? 150 + e.radius * 5
        }
    },
    pet: (e) => {
        return stateDataMap.detecting(e)
    },
    summon: (e) => {
        const maxCooldown = e.stats.spawnCooldown ?? (1 + (4 / Math.max(e.rarity, 1)) ** (1 / 2)) * 1000 / 50; // is this even neccasary-
        return {
            maxCooldown,
            currentCooldown: maxCooldown * 2 / 3,
        }
    },
}

const simulateMap = {
    // Ladybug: (e) => {
        
    // },
    // Rock: () => {},
    // Worker_Ant: (e) => {

    // }
    stationary: (e) => {},
    passive: (e) => {
        // move around and change directions every so often
        e.stateData.motionTimer++;
        const vel = Math.max(0, Math.sin(e.stateData.motionTimer * Math.PI * 2 / 90)) * e.speed / 3;
        e.xv += Math.cos(e.angle) * vel;
        e.yv += Math.sin(e.angle) * vel;

        // friction
        e.xv *= 0.86;
        e.yv *= 0.86;

        e.x += e.xv * e.slowdownAmount;
        e.y += e.yv * e.slowdownAmount;

        if(e.stateData.motionTimer > 90 * 5/6){
            e.stateData.motionTimer = 0;
            e.angle = Math.random() * Math.PI * 2;
        }
    },
    sine: (e) => {
        e.stateData.motionTimer ++;

        if (e.stateData.motionTimer % 60 == 0){
            e.dir *= -1;
        }
        e.angle += e.dir / 50 * Math.sin((e.stateData.motionTimer % 60) * (Math.PI)/60);

        e.xv += Math.cos(e.angle) * e.speed / 4;
        e.yv += Math.sin(e.angle) * e.speed / 4;

        // friction
        e.xv *= 0.86;
        e.yv *= 0.86;

        e.x += e.xv * e.slowdownAmount;
        e.y += e.yv * e.slowdownAmount;
    },
    sandstorm: (e) => {
        e.xv += (Math.random()-0.5)*4;
        e.yv += (Math.random()-0.5)*4;
        let mag = Math.sqrt(e.xv ** 2 + e.yv ** 2);
        if (mag > e.speed){
            e.xv *= e.speed/mag;
            e.yv *= e.speed/mag;
        }

        e.x += e.xv * e.slowdownAmount;
        e.y += e.yv * e.slowdownAmount;

        // friction
        e.xv *= 0.99;
        e.yv *= 0.99;

    },
    
    detecting: (e, room) => {
        // TODO: make this use the spatial hash grid!
        let minDist = e.stateData.detectionDistance ** 2;
        let target = null;
        for(let key in room.flowers){
            const f = room.flowers[key];
            if(f.dead === true){
                continue;
            }
            let dist = (f.headX - e.x) ** 2 + (f.headY - e.y) ** 2;
            if(dist < minDist){
                target = key;
                minDist = dist;
            }
        }
        if (target != null){
            e.target = room.flowers[target];
            // e.state = e.stateData.aggroState;
            // e.stateData = stateDataMap[e.state](e);
            e.changeState(e.stateData.aggroState);
            // changeState(e, e.stateData.aggroState);
            return;
        }
        
        simulateMap.passive(e);
    },
    detectingSine: (e, room) => {
        // TODO: make this use the spatial hash grid!
        let minDist = e.stateData.detectionDistance ** 2;
        let target = null;
        for(let key in room.flowers){
            const f = room.flowers[key];
            if(f.dead === true){
                continue;
            }
            let dist = (f.headX - e.x) ** 2 + (f.headY - e.y) ** 2;
            if(dist < minDist){
                target = f;
                minDist = dist;
            }
        }
        if (target != null){
            e.target = target;
            e.changeState(e.stateData.aggroState ?? "aggressive");
            return;
        }
        
        simulateMap.sine(e);
    },
    customCode: (e, room) => {
        flowrCode(e, room, e.stats.code);
    },
    burrow: (e, room) => {
        if (e.releaseThreshold === undefined) {
            e.releaseThreshold = e.maxHp;
        }
        if (e.hp < e.releaseThreshold) {
            if(e.stats.spawnCooldown !== undefined){
                e.releaseThreshold -= (e.maxHp) * (e.stats.spawnCooldown / 100);
            } else if(room.wave < 5 || e.rarity <= 1){
                e.releaseThreshold -= (e.maxHp / 4);
            } else if(room.wave < 10 || e.rarity <= 2){
                e.releaseThreshold -= (e.maxHp / 6);
            } else {
                e.releaseThreshold -= (e.maxHp / 8);
            }
            const spawnAmount = e.stats.spawnAmount ?? 3;
            for (let i = 0; i < spawnAmount; i++) {
                const ant = BiomeSimulateManager.spawnEnemyInRoom({type: e.stats.spawnType ?? 'Soldier Ant', rarity: e.rarity}, {x: e.x, y: e.y, angle: e.angle, forceSpawn: true});
            }
        }   
    },
    fireBurrow: (e, room) => {
        if (!e.releasing){
            for(let key in room.flowers){
                const f = room.flowers[key];
                if(f.dead === true){
                    continue;
                }
                if((f.headX - e.x) ** 2 + (f.headY - e.y) ** 2 < e.stateData.detectionDistance ** 2){
                    e.releasing = true;
                    e.time = 0;

                    let usedRarity = e.rarity;
                    if (usedRarity > 7){
                        usedRarity = 7;
                    }
                    e.releaseInterval = Math.floor(usedRarity/2+2);
                    if (usedRarity > 4){
                        e.releaseInterval += (usedRarity - 4)*2;
                    }
                    if (usedRarity > 6){
                        e.releaseInterval += (usedRarity - 6)*3;
                    }
                    if(e.stats.spawnCooldown !== undefined){
                        e.releaseInterval = e.stats.spawnCooldown;
                    }
                    if(e.stats.spawnAmount !== undefined){
                        e.releaseAmount = e.stats.spawnAmount;
                    } else {
                        let releaseAmount = 40;
                        if (usedRarity > 1){
                            e.releaseAmount = 100 / (usedRarity*2 - 1);
                        }
                        else{
                            e.releaseAmount = releaseAmount;
                        }
                    }
                    return;
                }
            }
        }
        else{
            if(room.gameEnded === true){
                return;
            }
            e.time ++;
            if (e.time % e.releaseInterval == 0 && e.releaseAmount > 0){
                BiomeSimulateManager.spawnEnemyInRoom({type: e.stats.spawnType ?? "Soldier Fire Ant", rarity: e.rarity}, {x: e.x, y: e.y, angle: e.angle, forceSpawn: true});
                e.releaseAmount --;
                if (e.releaseAmount <= 0){
                    BiomeSimulateManager.enemyTakeDamage(e, e.hp + 1, {});
                }
            }
        }
    },
    pet: (e, room) => {
        if(e.flowerRef.defending === true || (e.x - e.flowerRef.headX) ** 2 + (e.y - e.flowerRef.headY) ** 2 > e.stateData.detectionDistance ** 2){
            const lastTarget = e.target;
            // e.hp += 0.2 + e.hp / 1000;
            // if(e.hp > e.maxHp){
            //     e.hp = e.maxHp;
            // } else {
            //     // broadcasting healing
            //     const packBuffer = new ArrayBuffer(16);// 4 bytes: type (5 = pet enemy take damage), parent id, id, and hp value
            //     const packView = new Float32Array(packBuffer);

            //     packView[0] = 5;// type 5 = enemy take damage/ heal
            //     packView[1] = e.parentRef.id;
            //     if(e.parentPetId === undefined || e.parentRef.pets[e.parentPetId] !== this){
            //         e.parentPetId = e.parentRef.getPetId(this);
            //     }
                
            //     packView[2] = e.parentPetId;
            //     packView[3] = e.hp;

            //     e.room.broadcastRaw(packBuffer);
            // }
            e.target = e.flowerRef;
            simulateMap.aggressive(e);
            e.target = lastTarget;
            return;
        }
        const attacking = e.rarity > 2 && e.flowerRef.attacking === true;
        if(attacking === true){
            BiomeSimulateManager.enemyTakeDamage(e, 1 + e.hp / 220, {});
        }
        if(e.target != undefined){
            if(attacking === true){
                var lastSpeed = e.speed;
                e.speed *= 2;
            }
            simulateMap.aggressive(e);
            if(attacking === true){
                e.speed = lastSpeed;
            }
        } else {
            simulateMap.passive(e);
        }

        let closestDistance = Infinity;
        let closestEnemy = null;

        for(let key in room.enemies){
            const e2 = room.enemies[key];
            const dist = Math.sqrt((e2.x - e.x) ** 2 + (e2.y - e.y) ** 2);
            if(dist < closestDistance && e2.type.includes("Missile") === false){
                if((e2.x - e.flowerRef.headX) ** 2 + (e2.y - e.flowerRef.headY) ** 2 > e.stateData.detectionDistance ** 2 * (attacking ? 2 : 1)){
                    continue;
                }
                closestEnemy = e2;
                closestDistance = dist;
            }
        }

        // simulateMap.passive(e);
        // return;

        if(closestEnemy !== null && closestDistance < e.stateData.detectionDistance ** 2){
            e.target = closestEnemy;
        }
    },
    aggressive: (e) => {
        if(e.target != undefined){
            e.angle = interpolateDirection(e.angle, Math.atan2(e.target.y - e.y, e.target.x - e.x), /*e.stats.turnSpeed ?? 0.6*/1);
            e.xv += Math.cos(e.angle) * e.speed;
            e.yv += Math.sin(e.angle) * e.speed;

            // friction
            e.xv *= 0.86;
            e.yv *= 0.86;

            e.x += e.xv * e.slowdownAmount;
            e.y += e.yv * e.slowdownAmount;
        }
    },
    scaredAggressive: (e) => {
		if (e.target != undefined) {
			e.angle = interpolateDirection(e.angle, Math.atan2(e.target.y - e.y, e.target.x - e.x), /*e.stats.turnSpeed ?? 0.6*/ 1);
			e.xv += Math.cos(e.angle) * e.speed;
			e.yv += Math.sin(e.angle) * e.speed;

			// friction
			e.xv *= 0.86;
			e.yv *= 0.86;

			if ((e.hp > e.maxHp/2 && !e.stateData.healing) || e.stats.healing * e.maxHp < e.healingReduction){
				e.x += e.xv * e.slowdownAmount;
				e.y += e.yv * e.slowdownAmount;
			}
			else{
				e.stateData.healing = true;
				e.x -= e.xv * e.slowdownAmount * 0.75;
				e.y -= e.yv * e.slowdownAmount * 0.75;
				let healAmount = e.stats.healing * e.maxHp - e.healingReduction;
				if (healAmount > 0){
					e.hp += e.stats.healing * e.maxHp;
				}

				if (e.hp > e.maxHp || healAmount <= 0){
					if (e.hp > e.maxHp){
						e.hp = e.maxHp;
					}
					e.stateData.healing = false;
				}
			}
		}
	},
	
	hop: (e) => {
		if (e.target != undefined) {
			if (e.stateData.currentCooldown < 0){
				e.angle = Math.atan2(e.target.y - e.y, e.target.x - e.x);
				e.xv += Math.cos(e.angle) * e.speed;
				e.yv += Math.sin(e.angle) * e.speed;
				e.stateData.currentCooldown = e.stateData.maxCooldown;
			}
			e.stateData.currentCooldown --;

			e.xv *= 0.82;
			e.yv *= 0.82;

			e.x += e.xv;
			e.y += e.yv;
		}
	},

    crab: (e, room) => {
		if (e.target != undefined) {
			if (e.stateData.anger < 45){
				e.angle = interpolateDirection(e.angle, Math.atan2(e.target.y - e.y, e.target.x - e.x), 0.2);
			}
			const distance = Math.sqrt((e.target.y - e.y) ** 2 + (e.target.x - e.x) ** 2);

			let checkDistance = 270 + e.radius * 3 + e.target.radius;
			if (e.stateData.anger < 45){
				if (distance > checkDistance) {
					e.xv += Math.cos(e.angle) * e.speed;
					e.yv += Math.sin(e.angle) * e.speed;
				}
				else{
					if (distance < checkDistance - 70){
						e.xv -= Math.cos(e.angle) * e.speed;
						e.yv -= Math.sin(e.angle) * e.speed;
					}
					else{
						if (e.stateData.direction){
							e.xv += Math.cos(e.angle + Math.PI/2) * e.speed * 2;
							e.yv += Math.sin(e.angle + Math.PI/2) * e.speed * 2;
						}
						else{
							e.xv -= Math.cos(e.angle + Math.PI/2) * e.speed * 2;
							e.yv -= Math.sin(e.angle + Math.PI/2) * e.speed * 2;
						}
					}
					e.stateData.anger ++;
				}
			}
			else{
				e.stateData.anger ++;
				e.xv += Math.cos(e.angle) * e.speed * 1.3;
				e.yv += Math.sin(e.angle) * e.speed * 1.3;
				if (e.stateData.anger > 140){
					e.stateData.anger = 0;
				}
			}

	
			
			e.xv *= 0.86;
			e.yv *= 0.86;

			e.x += e.xv * e.slowdownAmount;
			e.y += e.yv * e.slowdownAmount;
		}
	},

    shoot: (e, room) => {
        if(e.target != undefined){
            e.angle = interpolateDirection(e.angle, Math.atan2(e.target.y - e.y, e.target.x - e.x), 0.2);

            const distance = Math.sqrt((e.target.y - e.y) ** 2 + (e.target.x - e.x) ** 2);

            if(distance > 200 + e.radius * 3){
                e.xv += Math.cos(e.angle) * e.speed;
                e.yv += Math.sin(e.angle) * e.speed;   
            }// else {
                // if(Math.abs(e.xv) > Math.abs(Math.cos(e.angle) * e.speed)){
                //     if(e.xv > 0){
                //         e.xv -= Math.cos(e.angle) * e.speed;
                //     } else {
                //         e.xv += Math.cos(e.angle) * e.speed;
                //     }
                // }
                // if(Math.abs(e.yv) > Math.abs(Math.sin(e.angle) * e.speed)){
                //     if(e.yv > 0){
                //         e.yv -= Math.sin(e.angle) * e.speed;
                //     } else {
                //         e.yv += Math.sin(e.angle) * e.speed;
                //     }
                // }
            //}

            e.stateData.currentCooldown--;
            // if(e.stateData.prediction && e.stateData.currentCooldown < 5){
            //     let MissileType = e.stats.spawnType ?? "Missile";
            //     if (e.type == "Scorpion"){
            //         MissileType = "ScorpionMissile"
            //     }

            //     let speed = (MissileType === 'Missile' ? 30 : editorStats.enemies[MissileType][e.rarity].speed) * (1 - e.rarity / 8 * .2);
            //     let target = intercept({x: e.x, y: e.y}, {x: e.target.x, y: e.target.y, vx: e.target.xv, vy: e.target.yv}, speed);
            //     if (target === null){
            //         angle = e.angle;
            //     }
            //     else{
            //         angle = Math.atan2(target.y - e.y, target.x - e.x);
            //     }
            //     e.angle = angle;
            // }
            if(e.stateData.currentCooldown < 0){
                e.stateData.currentCooldown = e.stats.spawnCooldown ?? e.stateData.maxCooldown;

                // spawn Missile
                let MissileType = e.stats.spawnType;

                let angle = e.angle;

                // if (e?.stateData?.prediction){
                //     let speed = (MissileType === 'Missile' ? 30 : editorStats.enemies[MissileType][e.rarity].speed) * (1 - e.rarity / 8 * .2);
                //     let target = intercept({x: e.x, y: e.y}, {x: e.target.x, y: e.target.y, vx: e.target.xv, vy: e.target.yv}, speed);
                //     if (target === null){
                //         angle = e.angle;
                //     }
                //     else{
                //         angle = Math.atan2(target.y - e.y, target.x - e.x);
                //     }
                // }

                if(e.stats.spawnAmount === undefined){
                    const Missile = BiomeSimulateManager.spawnEnemyInRoom({type: MissileType, rarity: e.rarity}, {x: e.x, y: e.y, angle: angle, forceSpawn: true});
                    Missile.parent = e;
                    e.xv -= e.speed * 12 * Missile.mass / e.mass * Math.cos(angle);
                    e.yv -= e.speed * 12 * Missile.mass / e.mass * Math.sin(angle);
                } else {
                    for(let i = 0; i < e.stats.spawnAmount; i++){
                        const shootAngle = angle + (i / Math.max(1,e.stats.spawnAmount-1) - 0.5) * (e.stats.spawnSpacing);

                        const Missile = BiomeSimulateManager.spawnEnemyInRoom({type: MissileType, rarity: e.rarity}, {x: e.x, y: e.y, angle: shootAngle, forceSpawn: true});
                        Missile.parent = e;
                        e.xv -= e.speed * 12 * Missile.mass / e.mass * Math.cos(shootAngle);
                        e.yv -= e.speed * 12 * Missile.mass / e.mass * Math.sin(shootAngle);
                    }
                }
            }

            // friction
            e.xv *= 0.86;
            e.yv *= 0.86;

            e.x += e.xv * e.slowdownAmount;
            e.y += e.yv * e.slowdownAmount;
        }
    },
    projectile: (e, room) => {
        e.x += Math.cos(e.angle) * e.speed * (1 - e.rarity / 8 * .2);
        e.y += Math.sin(e.angle) * e.speed * (1 - e.rarity / 8 * .2);

        // if(Math.sqrt(e.x ** 2 + e.y ** 2) + e.radius > room.radius - .1){
        //     e.takeDamage(e.hp + 1, {});
        // }
        // if(room.gameEnded === true){
        //     return;
        // }
        e.stateData.lifetime--;
        if(e.stateData.lifetime < 0){
            BiomeSimulateManager.enemyTakeDamage(e, e.hp + 1, {});
        }
    },
    // for hell hornets in the hell biome
    homingProjectile: (e) => {

    },
    follow: (e) => {
        if(e.follow === undefined || e.follow.dead === true){
            if(e?.follow?.target !== undefined && e.rarity >= 4/*legs and above*/){
                e.target = e.follow.target;
                e.changeState("aggressive");
            } else {
                e.changeState("sine");
            }
            return;
        }
        // e.angle = interpolateDirection(e.angle, Math.atan2(e.target.headY - e.y, e.target.headX - e.x), 0.2);
        // e.xv += Math.cos(e.angle) * e.speed;
        // e.yv += Math.sin(e.angle) * e.speed;

        // // friction
        // e.xv *= 0.86;
        // e.yv *= 0.86;

        // e.x += e.xv;
        // e.y += e.yv;
        const angle = Math.atan2(e.follow.y - e.y, e.follow.x - e.x);
        e.angle = angle;
        e.x = e.follow.x - Math.cos(angle) * (e.radius + e.follow.radius + .1) //+ Math.cos(angle) * (e.radius + e.follow.radius);
        e.y = e.follow.y - Math.sin(angle) * (e.radius + e.follow.radius + .1)//+ Math.sin(angle) * (e.radius + e.follow.radius);
    },
    followAggressive: (e, room) => {
        if(e.follow === undefined || e.follow.dead === true){
            if(e?.follow?.target !== undefined){
                //If seg ahead had a target, attach target to this segment
                e.target = e.follow.target;
                e.changeState("aggressive");
            } else {
                //Check nearby for target
                let minDist = e.stateData.detectionDistance ** 2;
                let target = null;
                for(let key in room.flowers){
                    const f = room.flowers[key];
                    if(f.dead === true){
                        continue;
                    }
                    let dist = (f.headX - e.x) ** 2 + (f.headY - e.y) ** 2;
                    if(dist < minDist){
                        target = f;
                        minDist = dist;
                    }
                }
                if (target != null){
                    e.target = target;
                    e.changeState("aggressive");
                    return;
                }
                //No target (no return)
                e.changeState("detectingSine");
            }
            return;
        }
        // e.angle = interpolateDirection(e.angle, Math.atan2(e.target.headY - e.y, e.target.headX - e.x), 0.2);
        // e.xv += Math.cos(e.angle) * e.speed;
        // e.yv += Math.sin(e.angle) * e.speed;

        // // friction
        // e.xv *= 0.86;
        // e.yv *= 0.86;

        // e.x += e.xv;
        // e.y += e.yv;
        const angle = Math.atan2(e.follow.y - e.y, e.follow.x - e.x);
        e.angle = angle;
        e.x = e.follow.x - Math.cos(angle) * (e.radius + e.follow.radius + .1) //+ Math.cos(angle) * (e.radius + e.follow.radius);
        e.y = e.follow.y - Math.sin(angle) * (e.radius + e.follow.radius + .1)//+ Math.sin(angle) * (e.radius + e.follow.radius);
    },
    parentStuck: (e) => {
        e.x = e.parent.x + e.relativeX;
        e.y = e.parent.y + e.relativeY;
        if (e.releaseTime){
            e.releaseTime --;
            if (e.releaseTime <= 0){
                e.changeState("projectile");
            }
        }
        if (e.parent.hp <= 0 || e.parent === undefined){
            e.changeState("projectile");
        }
    },
    grow: (e, room) => {
        if(e.stats.otherSimulateState !== undefined && e.stats.otherSimulateState !== 'grow'){
            simulateMap[e.stats.otherSimulateState](e, room);
        }
        e.rotation += e.stats.childrenRotateSpeed;

        for(let i = 0; i < e.children.length; i++){
            e.children[i].growParentRef = e;
            if(e.children[i].dead === true){
                if(e.stats.dieOnChildrenDie === true){
                    BiomeSimulateManager.enemyTakeDamage(e, e.hp + 1);
                } else {
                    continue;
                }
            }
            const angle = e.stats.childrenWanderAngle === true ?
                Math.atan2(e.children[i].y - e.y, e.children[i].x - e.x) + e.stats.childrenRotateSpeed :
                i / e.children.length * Math.PI * 2 + e.rotation;
            const distance = e.stats.childrenWanderDistance === true ?
                Math.min(e.stats.childrenDistance * e.radius / 100, Math.sqrt((e.children[i].y - e.y)**2 + (e.children[i].x - e.x)**2)) :
                e.stats.childrenDistance * e.radius / 100;
            e.children[i].x = e.x + Math.cos(angle) * distance;
            e.children[i].y = e.y + Math.sin(angle) * distance;

            if(e.stats.childrenLookAtParent){
                e.children[i].angle = angle + Math.PI;
            }
        }
    },
    summon: (e, room) => {
        // if (e.type === "Queen Ant" && e.rarity > 4 /* Above legendary rarity */ && (e.eggsLaid <= 30 || e.eggsLaid === undefined)) {
        //     e.stateData.currentCooldown--;
        //     if (e.stateData.currentCooldown < 0) {  
        //         if (e.eggsLaid === undefined || e.eggsLaid === null) {
        //             e.eggsLaid = 0;
        //         }
        //         e.changeState("summon");
        //     }
        // }

        if(e.eggsLaid === undefined){
            e.eggsLaid = 0;
        }
                
        if(e.target != undefined){
            simulateMap.aggressive(e, room);

            e.stateData.currentCooldown--;
            if((!['Queen Ant', 'Queen Fire Ant', 'Queen Shiny Ant'].includes(e.type) || e.rarity >= 4) /*above or equal to legendary rarity*/ && e.eggsLaid <= 30 && e.stateData.currentCooldown < 0){
                
                e.stateData.currentCooldown = e.stats.spawnCooldown ?? (e.stateData.maxCooldown + (1.28 ** (e.eggsLaid) * 7.2)) ?? 60;
                
                // spawn Egg
                e.eggsLaid++;

                let angle = e.angle + Math.PI;

                if(e.stats.spawnAmount === undefined){
                    const Egg = BiomeSimulateManager.spawnEnemyInRoom({type: e.stats.spawnType ?? "Ant Egg", rarity: e.rarity}, {x: e.x + (-Math.cos(e.angle) * ((e.radius / 2) * Math.sqrt(e.rarity + 1))), y: e.y + (-Math.sin(e.angle) * ((e.radius / 2) * Math.sqrt(e.rarity + 1))), angle: angle, forceSpawn: true});
                    Egg.parent = e;
                } else {
                    for(let i = 0; i < e.stats.spawnAmount; i++){
                        const shootAngle = angle + (i / Math.max(1,e.stats.spawnAmount-1) - 0.5) * (e.stats.spawnSpacing);

                        const Egg = BiomeSimulateManager.spawnEnemyInRoom({type: e.stats.spawnType ?? "Ant Egg", rarity: e.rarity}, {x: e.x + (-Math.cos(e.angle) * ((e.radius / 2) * Math.sqrt(e.rarity + 1))), y: e.y + (-Math.sin(e.angle) * ((e.radius / 2) * Math.sqrt(e.rarity + 1))), angle: shootAngle, forceSpawn: true});
                        Egg.parent = e;
                    }
                }
            }
        }
    },
}

function shortAngleDist(a0,a1) {
    const max = Math.PI*2;
    const da = (a1 - a0) % max;
    return 2*da % max - da;
}

function interpolateDirection(a0,a1,t) {
    return a0 + shortAngleDist(a0,a1)*t;
}

function interpolate(s, e, t){
    return s + (e - s) * t;
}