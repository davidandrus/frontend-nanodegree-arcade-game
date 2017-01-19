var TILE_WIDTH = 101;
var TILE_HEIGHT = 82;
// adjust the sprites by this many pixels so they line up with the tile nicely
var SPRITE_ADJUST_Y = -20;

var ROWS = 6;
var COLS = 5;

// the amount of overlap of the beetle sprite into the players tile in px
var COLLISION_OVERLAP_PX = 20;

// http://stackoverflow.com/a/7228322/1830384
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Enemies our player must avoid
var Enemy = function() {
    // x and y values are in px since they are animated
    this.x = -TILE_WIDTH ;
    this.row = randomIntFromInterval(1, 3); // enemies only on row 1-3
    this.y = this.row * TILE_HEIGHT + SPRITE_ADJUST_Y;
    this.speed = randomIntFromInterval(3, 5);

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// You should multiply any movement by the dt parameter
// which will ensure the game runs at the same speed for
// all computers.
Enemy.prototype.update = function(dt) {
    // works out to of change of about 4.8 - 8px per tick
    this.x = this.x + this.speed * 100 * dt;

    // convert player position in tiles to px
    var playerXPx = player.x * TILE_WIDTH;

    // handle collision
    if (this.row === player.y &&
        this.x > playerXPx - TILE_WIDTH + COLLISION_OVERLAP_PX &&
        this.x < playerXPx + TILE_WIDTH - COLLISION_OVERLAP_PX) {
        player.die();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


var Player = function() {
    // Player x,y are in 0 indexed tile locations for example top second tile is 1, 0
    this.startPos = {
        x: Math.ceil(COLS / 2) - 1,
        y: ROWS - 1
    };

    // adding all sprites since when you die you get a new character
    this.sprites = [
      'images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png'
    ];

    this.setToRandomSprite();
    this.goToStart();
};

Player.prototype = {
    setToRandomSprite: function() {
        var newSprite = this.sprite;
        var randomIndex;

        // if no sprite set or sprite is same as was previously
        while (!this.sprite || this.sprite === newSprite) {
            randomIndex = randomIntFromInterval(0, this.sprites.length - 1);
            this.sprite = this.sprites[randomIndex];
        }
    },

    goToStart: function() {
        this.x = this.startPos.x;
        this.y = this.startPos.y;
    },

    hide: function() {

        // hide the player off canvas
        this.x = -10;
        this.y = -10;
    },

    die: function() {
        this.goToStart();
        this.setToRandomSprite();

        // order matters here this has to be last since game will hide the player when all lives lost
        game.removeLife();
    },

    isValidMove: function(x, y) {
        return x >= 0 && x < COLS && y >= 0 && y < ROWS;
    },

    isWaterTile: function(_, y) {
        return y === 0;
    },

    goTo: function(x, y) {
        if (this.isWaterTile(x, y)) {
            this.madeItToWater();
            return;
        }
        if (!this.isValidMove(x, y)) { return; }
        this.x = x;
        this.y = y;
    },

    madeItToWater: function() {
        game.addScore();
        this.goToStart();
    },

    // necessary for game engine
    update: function() {},

    render: function() {
        // convert tile to px position
        var xPos = this.x * TILE_WIDTH;
        var yPos = this.y * TILE_HEIGHT + SPRITE_ADJUST_Y;
        ctx.drawImage(Resources.get(this.sprite), xPos, yPos);
    },

    handleInput: function(direction) {
        if (direction === 'left') { this.goTo(this.x - 1, this.y); }
        if (direction === 'right') { this.goTo(this.x + 1, this.y); }
        if (direction === 'up') { this.goTo(this.x, this.y - 1); }
        if (direction === 'down') { this.goTo(this.x, this.y + 1); }
    }
};

// Place all enemy objects in an array called allEnemies
var allEnemies = [];
// Place the player object in a variable called player
var player = new Player();

var Game = function() {
    this.isRunning =  false;
    this.scoreElem = document.getElementById('score');
    this.heartsElem = document.getElementById('hearts');
    this.heartElem = document.querySelector('.heart');
    this.heartsElem.removeChild(this.heartElem);
    this.startButton = document.getElementById('start-button');
    this.startButton.addEventListener('click', this.start.bind(this));
};

Game.prototype = {
    start: function() {

        this.isRunning = true;
        this.score = 0;
        this.numLives = 5;
        this.multiplier = 1;
        this.score = 0;
        this.setupLivesHTML();
        this.clearScore();
        player.goToStart();

        this.hideStartButton();

        // create enemies at a regular intrval
        this.interval = setInterval(function() {
            allEnemies.push(new Enemy());
        }, 700);
    },

    end: function() {
        this.isRunning = false;
        player.hide();
        this.showStartButton();
        allEnemies = [];
        clearInterval(this.interval);
    },

    hideStartButton: function() {
        this.startButton.style.visibility = 'hidden';
    },

    showStartButton: function(node) {
        this.startButton.style.visibility = 'visible';
    },

    setupLivesHTML: function() {
        // create number of hearts equal to number of lives
        for (var i = 0; i < this.numLives; i += 1) {
          this.heartsElem.appendChild(this.heartElem.cloneNode(true));
        }
    },

    removeLife: function() {
        this.multiplier = 1;
        this.numLives -= 1;

        // remove heart from lives meter
        this.heartsElem.removeChild(this.heartsElem.querySelector('.heart'));

        if (this.numLives === 0) {
            this.end();
        }
    },

    clearScore: function() {
        this.scoreElem.innerHTML = 0;
    },

    addScore: function() {
        // base score is 100
        this.score = this.score + (100 * this.multiplier);
        this.scoreElem.innerHTML = this.score;
        this.multiplier += 1;
    }
};

var game = new Game();
game.end();

// handle keypresses, moves player
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    // don't do anything until game is running or else you could move character
    // around the screen before game starts
    if (game.isRunning) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
