class Shop {
    constructor() {
        this.offers = []

        this.tokens = 0

        this.menu = {
            color: "#8e6bb5",
            border: "#735793",
            y: {val: canvas.h + 10, target: canvas.h + 10},
            active: false,
            icon: new Image()
        }
        this.menu.icon.src = './gfx/coin.png'

        this.hoveringOverButton = false;
    }
    draw() {
        this.menu.y.val = interpolate(this.menu.y.val, this.menu.y.target, 0.03 * dt);

        if (this.menu.active === true) {
            this.menu.y.target = canvas.h - 20 - 450
        } else {
            this.menu.y.target = canvas.h + 10
        }

        if (this.menu.y.val < canvas.h + 10) {
            ctx.fillStyle = this.menu.color;
            ctx.strokeStyle = this.menu.border;

            ctx.lineWidth = 8;

            ctx.beginPath();
            ctx.roundRect(130, this.menu.y.val, 500, 450, 3)
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            if(mouse.canvasX > 130 + 500 - 50 && mouse.canvasY > this.menu.y.val + 17.5 && mouse.canvasX < 130 + 500 - 50 + 30 && mouse.canvasY < this.menu.y.val + 17.5 + 30){
                ctx.fillStyle = "#c16666";
                setCursor('pointer');
                this.hoveringOverX = true;
            } else {
                this.hoveringOverX = false;
                ctx.fillStyle = '#c1565e';
            }

            ctx.strokeStyle = '#90464b';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.roundRect(130 + 500 - 50, this.menu.y.val + 17.5, 30, 30, 6);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.lineWidth = 4.75;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#cccccc';
            ctx.beginPath();
            ctx.moveTo(130 + 500 - 50 + 7.5, this.menu.y.val + 17.5 + 7.5);
            ctx.lineTo(130 + 500 - 50 + 22.5, this.menu.y.val + 17.5 + 22.5);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(130 + 500 - 50 + 22.5, this.menu.y.val + 17.5 + 7.5);
            ctx.lineTo(130 + 500 - 50 + 7.5, this.menu.y.val + 17.5 + 22.5);
            ctx.stroke();
            ctx.closePath();

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            ctx.font = `900 30px 'Ubuntu'`;
            ctx.lineWidth = 4;

            ctx.fillStyle = "#ffffff"
            ctx.strokeStyle = "#000000"

            ctx.strokeText("Shop", 130 + 250, this.menu.y.val + 32.5)
            ctx.fillText("Shop", 130 + 250, this.menu.y.val + 32.5)

            for (let i = 0; i < this.offers.length; i++) {
                ctx.globalAlpha *= 0.25

                ctx.fillStyle = "#000000"
                ctx.translate(130 + 20 + (i % 4) * (500 - 20) / 4, this.menu.y.val + 130 * Math.floor(i / 4) + 60)
                ctx.beginPath();
                ctx.roundRect(0, 0, 100, 110, 3)
                ctx.fill();
                ctx.closePath();

                ctx.globalAlpha /= 0.25

                if (this.offers[i]) {
                    ctx.translate(50, 40)
                    this.offers[i].pc.draw()

                    ctx.fillStyle = '#0ecf45';
                    ctx.strokeStyle = '#0ba938';

                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.roundRect(-40, 40, 80, 20)
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'

                    ctx.font = `900 15px 'Ubuntu'`;
                    ctx.lineWidth = 2;
                    ctx.fillStyle = "#ffffff"
                    ctx.strokeStyle = "#000000"

                    ctx.strokeText(formatAmountHighPrecision(this.offers[i].price), 0, 50)
                    ctx.fillText(formatAmountHighPrecision(this.offers[i].price), 0, 50)

                    ctx.translate(-50, -40)
                }

                ctx.translate(-(130 + 20 + (i % 4) * (500 - 20) / 4), -(this.menu.y.val + 130 * Math.floor(i / 4) + 60))
            }

            ctx.translate(130 + 20, this.menu.y.val + 15)

            ctx.globalAlpha *= 0.25

            ctx.fillStyle = "#000000"
            ctx.beginPath();
            ctx.roundRect(0, 0, 100, 35, 3)
            ctx.fill();
            ctx.closePath();

            ctx.globalAlpha /= 0.25

            ctx.translate(17.5, 17.75)

            petalRenderMap.Token({
                radius: 10,
                angle: 0,
                lastTicksSinceLastDamaged: 1000,
                ticksSinceLastDamaged: 1000,
                rarity: 0
            })

            ctx.font = `900 15px 'Ubuntu'`;
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.lineWidth = 3;

            ctx.fillStyle = this.tokens >= 0 ? "#ffffff" : "#ff0000"
            ctx.strokeStyle = "#000000"

            ctx.strokeText(formatAmountHighPrecision(this.tokens), 17.5, 0)
            ctx.fillText(formatAmountHighPrecision(this.tokens), 17.5, 0)

            ctx.translate(-17.5, -17.75)

            ctx.translate(-(130 + 20), -(this.menu.y.val + 15))
        }
    }
    drawIcon() {
        ctx.fillStyle = this.menu.color;
        ctx.strokeStyle = this.menu.border;

        if(mouse.canvasX + 6 > 20 && mouse.canvasY + 6 > canvas.h - 400 && mouse.canvasX - 6 < 100 && mouse.canvasY - 6 < canvas.h - 320){
            ctx.fillStyle = '#9979bc';
            setCursor('pointer');
            this.hoveringOverButton = true;
        } else {
            this.hoveringOverButton = false;
        }

        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.roundRect(20, canvas.h - 400, 80, 80, 3)
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(this.menu.icon, 35, canvas.h - 390, 50, 50);

        ctx.fillStyle = '#f0f0f0';// this is gonna be pain lol
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2.25;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 14px Ubuntu`;
        const lastLetterSpacing = ctx.letterSpacing;
        ctx.letterSpacing = '0px';
        ctx.strokeText("[Z]", 82.5, canvas.h - 385);
        ctx.fillText("[Z]", 82.5, canvas.h - 385);
        ctx.letterSpacing = lastLetterSpacing;
    }
    toggle() {
        if(globalInventory.menuActive === true) globalInventory.toggleMenu();
        if(craftingMenu.menuActive === true) craftingMenu.toggleMenu();
        if(mobGallery.menuActive === true) mobGallery.toggleMenu();
        this.menu.active = !this.menu.active
    }
}

const shop = new Shop();