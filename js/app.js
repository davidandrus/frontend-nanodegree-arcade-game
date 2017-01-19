var tileWidth = 101;
var tileHeight = 82;
var spriteAdjustY = -20;
var rows = 6;
var cols = 5;
var collisionOverlapPx = 20;

// http://stackoverflow.com/a/7228322/1830384
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Enemies our player must avoid
var Enemy = function() {
    this.x = -tileWidth ;
    this.id = Date.now();
    this.row = randomIntFromInterval(1, 3); // enemies only on row 1-3
    this.y = this.row * tileHeight + spriteAdjustY;
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
    this.x = this.x + this.speed * 100 * dt;
    var playerXPx = player.x * tileWidth;

    // handle collision
    if (this.row === player.y &&
        this.x > playerXPx - tileWidth + collisionOverlapPx &&
        this.x < playerXPx + tileWidth - collisionOverlapPx) {
        player.die();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


var Player = function() {
  // Player x,y are in 0 indexed tile locations
    this.startPos = {
        x: Math.ceil(cols / 2) - 1,
        y: rows - 1
    };

    this.sprites = [
      'images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png'
    ];

    this.setToRandomSprite();
    this.goToStart();
}

// NOTE: player x and y are the tile not pixel relation to the canvas like Enemy
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
      this.x = this.startPos.x
      this.y = this.startPos.y;
  },

  die: function() {
      this.goToStart();
      this.setToRandomSprite();
  },

  isValidMove: function(x, y) {
      return x >= 0 && x < cols && y >= 0 && y < rows;
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
    this.goToStart();
  },

  // necessary for game engine
  update: function() {},

  render: function() {
      var xPos = this.x * tileWidth;
      var yPos = this.y * tileHeight + spriteAdjustY;
      ctx.drawImage(Resources.get(this.sprite), xPos, yPos);
  },

  handleInput: function(direction) {
      if (direction === 'left') { this.goTo(this.x - 1, this.y) }
      if (direction === 'right') { this.goTo(this.x + 1, this.y) }
      if (direction === 'up') { this.goTo(this.x, this.y - 1) }
      if (direction === 'down') { this.goTo(this.x, this.y + 1) }
  }
}

// Place all enemy objects in an array called allEnemies
var allEnemies = [];

// Place the player object in a variable called player
var player = new Player();

// handle keypresses, moves player
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// Start Game
// create enemies at a regular intrval
setInterval(function() {
    allEnemies.push(new Enemy());
}, 700);
