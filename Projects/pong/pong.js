class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  get len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  set len(value) {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

class Rect {
  constructor(w, h) {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }
  get left() {
    return this.pos.x - this.size.x / 2;
  }
  get right() {
    return this.pos.x + this.size.x / 2;
  }
  get top() {
    return this.pos.y - this.size.y / 2;
  }
  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}

class Ball extends Rect {
  constructor() {
    super(10, 10); //the dimensions of the ball
    this.vel = new Vec();
  }
}

class Player extends Rect {
  constructor() {
    super(20, 100); //the dimensions of the players
    this.score = 0;
  }
}

class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");

    this.ball = new Ball();
    this.ball.pos.x = 100;
    this.ball.pos.y = 60;
    this.ball.vel.x = 100;
    this.ball.vel.y = 100;

    this.players = [new Player(), new Player()];
    this.players[0].pos.x = 40; //To place the 1st player 40 pixels from the left
    this.players[1].pos.x = this._canvas.width - 40; //To place the 2nd player 40 pixels from the right
    this.players.forEach((player) => {
      player.pos.y = this._canvas.height / 2; //To place the players at the middle of the vertical position
    });

    let lastTime;
    const callBack = (millis) => {
      if (lastTime) {
        this.update((millis - lastTime) / 400);
      }
      lastTime = millis;
      requestAnimationFrame(callBack);
    };
    callBack();

    this.CHAR_PIXEL = 10;
    this.CHARS = [
      "111101101101111",
      "010010010010010",
      "111001111100111",
      "111001111001111",
      "101101111001001",
      "111100111001111",
      "111100111101111",
      "111001001001001",
      "111101111101111",
      "111101111001111",
    ].map((str) => {
      const canvas = document.createElement("canvas");
      canvas.height = this.CHAR_PIXEL * 5;
      canvas.width = this.CHAR_PIXEL * 3;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      str.split("").forEach((fill, i) => {
        if (fill === "1") {
          context.fillRect(
            (i % 3) * this.CHAR_PIXEL,
            ((i / 3) | 0) * this.CHAR_PIXEL,
            this.CHAR_PIXEL,
            this.CHAR_PIXEL
          );
        }
      });
      return canvas;
    });

    this.reset();
  }

  collide(player, ball) {
    //for the player and ball detection
    if (
      player.left < ball.right &&
      player.right > ball.left &&
      player.top < ball.bottom &&
      player.bottom > ball.top
    ) {
      const len = ball.vel.len;
      ball.vel.x = -ball.vel.x;
      ball.vel.len *= 1.1;
    }
  }

  draw() {
    this._context.fillStyle = "#000";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this.drawRect(this.ball);
    this.players.forEach((player) => this.drawRect(player));

    this.drawScore();
  }

  drawRect(rect) {
    this._context.fillStyle = "#fff";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_W = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset =
        align * (index + 1) -
        (((CHAR_W * chars.length) / 2) * this.CHAR_PIXEL) / 2;
      chars.forEach((char, pos) => {
        this._context.drawImage(this.CHARS[char | 0], offset + pos * CHAR_W, 20);
      });
    });
  }

  reset() {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }

  start() {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      this.ball.vel.x = 100 * (Math.random() > 0.5 ? 1 : -1);
      this.ball.vel.y = 100 * (Math.random() * 2 - 1);
      this.ball.vel.len = 100;
    }
  }

  update(dt) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const playerId = (this.ball.vel.x < 0) | 0;
      // if(this.ball.vel.x < 0){
      //   playerId = 1;
      // }else {
      //   playerId = 0;
      // }
      this.players[playerId].score++;
      this.reset();
      console.log(playerId);
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.vel.y = -this.ball.vel.y;
    }

    this.players[1].pos.y = this.ball.pos.y; //For player 2 to follow the ball automatically

    this.players.forEach((player) => this.collide(player, this.ball)); //For the ball to detect collision on both players

    this.draw();
  }
}

const canvas = document.getElementById("pong");
const pong = new Pong(canvas);

//To move player 1 by moving the mouse
canvas.addEventListener("mousemove", (event) => {
  pong.players[0].pos.y = event.offsetY;
});

canvas.addEventListener("click", (event) => {
  pong.start();
});
