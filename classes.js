// classes.js

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15);
    this.life = 255;
    this.speedX = random(-3, 3);
    this.speedY = random(-3, 3);
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 7;
  }
  show() {
    noStroke();
    fill(this.color.r, this.color.g, this.color.b, this.life);
    ellipse(this.x, this.y, this.size);
  }
  isDead() {
    return this.life <= 0;
  }
}

class BgParticle {
  constructor() {
    this.x = random(0, GAME_WIDTH);
    this.y = random(0, GAME_HEIGHT);
    this.baseSize = random(2, 5);
    this.speedX = random(-0.5, 0.5) * level;
    this.speedY = random(-0.5, 0.5) * level;
    this.color = { r: 93, g: 208, b: 207 };
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > GAME_WIDTH) this.speedX *= -1;
    if (this.y < 0 || this.y > GAME_HEIGHT) this.speedY *= -1;
  }
  show(pulseProgress) {
    let size = this.baseSize * (1 + sin(pulseProgress * TWO_PI) * 0.2);
    noStroke();
    fill(this.color.r, this.color.g, this.color.b, 100);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      let x = this.x + cos(angle) * size;
      let y = this.y + sin(angle) * size;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

class Seed {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.timer = 5000;
    this.size = 10;
  }
  update() {
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      if (random(1) < 0.7) powerUps.push(new PowerUp(this.x, this.y));
      else obstacles.push(new Obstacle(this.x, this.y));
      return true;
    }
    return false;
  }
  show() {
    fill(seedColor.r, seedColor.g, seedColor.b, 200);
    star(this.x, this.y, this.size / 2, this.size, 5);
  }
}

class PowerUp {
  constructor(x = random(100, GAME_WIDTH - 100), y = random(100, GAME_HEIGHT - 100)) {
    this.x = x;
    this.y = y;
    let availableTypes = level <= 2 ? ["life", "gas"] : ["life", "gas", "pulse"];
    if (level >= 3) availableTypes.push("orbit", "nova");
    if (level >= 5) availableTypes.push("meteor", "star");
    if (level >= 7) availableTypes.push("wave");
    this.type = random(availableTypes);
    this.size = GAME_SYMBOL_SIZE;
    this.timer = 7000;
    this.angle = 0;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.type === "life") {
      let gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, GAME_SYMBOL_SIZE / 2);
      gradient.addColorStop(0, "rgb(255, 255, 255)");
      gradient.addColorStop(1, "rgb(0, 255, 0)");
      drawingContext.fillStyle = gradient;
      star(0, 0, GAME_SYMBOL_SIZE / 4, GAME_SYMBOL_SIZE / 2 + sin(millis() * 0.005) * 5, 8);
    } else if (this.type === "gas") {
      noFill();
      stroke(0, 191, 255, 200);
      strokeWeight(3);
      for (let i = 0; i < 4; i++) {
        arc(0, 0, GAME_SYMBOL_SIZE * (i + 1) / 4, GAME_SYMBOL_SIZE * (i + 1) / 4, 0, PI + i * HALF_PI);
      }
      noStroke();
      fill(93, 208, 207, 100);
      ellipse(0, 0, GAME_SYMBOL_SIZE * 1.2);
    } else if (this.type === "pulse") {
      noFill();
      let pulse = (millis() % 1000) / 1000;
      stroke(147, 208, 207, 200);
      strokeWeight(2);
      ellipse(0, 0, GAME_SYMBOL_SIZE * pulse);
      stroke(255, 255, 255, 150);
      strokeWeight(1);
      ellipse(0, 0, GAME_SYMBOL_SIZE * (pulse + 0.5));
      stroke(147, 208, 207, 100);
      strokeWeight(3);
      ellipse(0, 0, GAME_SYMBOL_SIZE * (pulse + 1));
      noStroke();
    } else if (this.type === "orbit") {
      fill(255, 215, 0, 150);
      ellipse(0, 0, GAME_SYMBOL_SIZE);
      stroke(255, 255, 255, 200);
      strokeWeight(1);
      for (let i = -2; i <= 2; i++) {
        line(i * 10, -GAME_SYMBOL_SIZE / 2, i * 10, GAME_SYMBOL_SIZE / 2);
        line(-GAME_SYMBOL_SIZE / 2, i * 10, GAME_SYMBOL_SIZE / 2, i * 10);
      }
      noStroke();
    } else if (this.type === "nova") {
      fill(0, 255, 255, 200 + sin(millis() * 0.01) * 55);
      star(0, 0, GAME_SYMBOL_SIZE / 2, GAME_SYMBOL_SIZE, 6);
      for (let i = 0; i < 6; i++) {
        let a = TWO_PI / 6 * i;
        fill(255, 255, 255, 150);
        triangle(
          cos(a) * GAME_SYMBOL_SIZE / 2, sin(a) * GAME_SYMBOL_SIZE / 2,
          cos(a + PI / 6) * GAME_SYMBOL_SIZE / 3, sin(a + PI / 6) * GAME_SYMBOL_SIZE / 3,
          cos(a - PI / 6) * GAME_SYMBOL_SIZE / 3, sin(a - PI / 6) * GAME_SYMBOL_SIZE / 3
        );
      }
    } else if (this.type === "meteor") {
      fill(255, 100, 0, 200);
      ellipse(0, 0, GAME_SYMBOL_SIZE);
      fill(255, 0, 0, 150);
      let tailLength = 20 + sin(millis() * 0.01) * 10;
      triangle(0, -GAME_SYMBOL_SIZE / 2, -tailLength, -GAME_SYMBOL_SIZE, tailLength, -GAME_SYMBOL_SIZE);
    } else if (this.type === "star") {
      fill(147, 208, 207, 200);
      ellipse(0, 0, GAME_SYMBOL_SIZE, GAME_SYMBOL_SIZE * 0.7);
      stroke(255, 255, 255, 150);
      strokeWeight(2);
      let pulse = (millis() % 1000) / 1000;
      for (let i = 0; i < 8; i++) {
        let a = TWO_PI / 8 * i;
        line(cos(a) * GAME_SYMBOL_SIZE / 2, sin(a) * GAME_SYMBOL_SIZE / 2, 
             cos(a) * (GAME_SYMBOL_SIZE / 2 + pulse * 10), sin(a) * (GAME_SYMBOL_SIZE / 2 + pulse * 10));
      }
      noStroke();
    } else if (this.type === "wave") {
      let gradient = drawingContext.createLinearGradient(-GAME_SYMBOL_SIZE / 2, 0, GAME_SYMBOL_SIZE / 2, 0);
      gradient.addColorStop(0, "rgb(93, 208, 207)");
      gradient.addColorStop(1, "rgb(255, 215, 0)");
      drawingContext.fillStyle = gradient;
      beginShape();
      for (let i = 0; i < 6; i++) {
        let a = TWO_PI / 6 * i;
        vertex(cos(a) * GAME_SYMBOL_SIZE / 2, sin(a) * GAME_SYMBOL_SIZE / 2);
      }
      endShape(CLOSE);
      noFill();
      stroke(255, 215, 0, 150);
      strokeWeight(2);
      ellipse(0, 0, GAME_SYMBOL_SIZE + sin(millis() * 0.005) * 10);
      noStroke();
      if (mainnetBadgeEarned) {
        drawingContext.globalAlpha = 0.5;
        let logoSize = GAME_SYMBOL_SIZE * 1.5;
        image(whiteLogo, 0, 0, logoSize, logoSize / 2);
        drawingContext.globalAlpha = 1.0;
      }
    }
    pop();
    this.angle += 0.05;
  }
  update() {
    this.timer -= deltaTime;
  }
  isExpired() {
    return this.timer <= 0;
  }
}

class Obstacle {
  constructor(x = random(100, GAME_WIDTH - 100), y = random(100, GAME_HEIGHT - 100)) {
    this.x = x;
    this.y = y;
    this.size = GAME_SYMBOL_SIZE * (1 + level * 0.1);
    this.timer = 5000;
    this.speedX = random(-1, 1) * level;
    this.speedY = random(-1, 1) * level;
  }
  show() {
    fill(255, 0, 0, 200);
    ellipse(this.x, this.y, this.size);
    stroke(255, 100);
    strokeWeight(2);
    line(this.x - this.size / 2, this.y - this.size / 2, this.x + this.size / 2, this.y + this.size / 2);
    noFill();
    stroke(128, 131, 134, 200);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size + 4);
    noStroke();
  }
  update() {
    this.timer -= deltaTime;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > GAME_WIDTH) this.speedX *= -1;
    if (this.y < 0 || this.y > GAME_HEIGHT) this.speedY *= -1;
  }
  isExpired() {
    return this.timer <= 0;
  }
}

class CosmicNode {
  constructor() {
    this.x = random(100, GAME_WIDTH - 100);
    this.y = random(100, GAME_HEIGHT - 100);
    this.size = 30;
    this.timer = 7000;
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(millis() * 0.05);
    fill(255, 215, 0, 200);
    star(0, 0, this.size / 2, this.size, 5);
    pop();
  }
  update() {
    this.timer -= deltaTime;
  }
  isExpired() {
    return this.timer <= 0;
  }
}

class Player {
  constructor() {
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT - 50;
    this.size = 60;
    this.speed = 5;
  }
  show() {
    image(playerImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
  update() {
    let targetX = mouseX - (width - GAME_WIDTH) / 2;
    let targetY = mouseY - (height - GAME_HEIGHT) / 2;
    this.x = lerp(this.x, targetX, 0.2);
    this.y = lerp(this.y, targetY, 0.2);
    this.x = constrain(this.x, 0, GAME_WIDTH);
    this.y = constrain(this.y, 0, GAME_HEIGHT);
  }
}

class Bullet {
  constructor(x, y, targetX, targetY, isPlayer = true) {
    this.x = x;
    this.y = y;
    this.size = isPlayer ? 5 : 10;
    this.speed = isPlayer ? 10 : 7;
    let angle = atan2(targetY - y, targetX - x);
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed;
    this.isPlayer = isPlayer;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  show() {
    fill(this.isPlayer ? 0 : 255, this.isPlayer ? 255 : 0, this.isPlayer ? 255 : 0);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
  isOffScreen() {
    return this.x < 0 || this.x > GAME_WIDTH || this.y < 0 || this.y > GAME_HEIGHT;
  }
}

class MiningProbe {
  constructor() {
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT / 2;
    this.angle = random(TWO_PI);
    this.radius = random(100, min(GAME_WIDTH, GAME_HEIGHT) * 0.3);
    this.speed = random(0.005, 0.015);
    this.size = 20;
    this.trail = [];
  }
  update() {
    this.angle += this.speed;
    this.x = GAME_WIDTH / 2 + cos(this.angle) * this.radius;
    this.y = GAME_HEIGHT / 2 + sin(this.angle) * this.radius;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) this.trail.shift();
  }
  show() {
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 0, 150);
      fill(seedColor.r, seedColor.g, seedColor.b, alpha);
      noStroke();
      ellipse(this.trail[i].x, this.trail[i].y, this.size * 0.5);
    }
    fill(seedColor.r, seedColor.g, seedColor.b);
    ellipse(this.x, this.y, this.size);
    let pulse = 1 + sin(millis() * 0.005) * 0.2;
    noFill();
    stroke(255, 215, 0, 100);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size * pulse);
    noStroke();
  }
}

class Fragment {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = GAME_WIDTH / 2 + 200;
    this.targetY = 150;
    this.life = 255;
  }
  update() {
    this.x = lerp(this.x, this.targetX, 0.05);
    this.y = lerp(this.y, this.targetY, 0.05);
    this.life -= 5;
  }
  draw() {
    noStroke();
    fill(255, 215, 0, this.life);
    ellipse(this.x, this.y, 8, 8);
  }
}

function star(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

class Probe {
  constructor() {
    this.radius = random(200, 300);
    this.angle = random(TWO_PI);
    this.speed = random(0.01, 0.03);
    this.trail = [];
  }
  update() {
    this.angle += this.speed;
    let x = GAME_WIDTH / 2 + cos(this.angle) * this.radius;
    let y = GAME_HEIGHT / 2 + sin(this.angle) * this.radius;
    this.trail.push({ x, y, life: 100 });
    if (this.trail.length > 10) this.trail.shift();
    if (random(1) < 0.2) {
      particles.push(new Particle(x, y, { r: 255, g: 215, b: 0 }));
      fragmentsCollected.push(new Fragment(x, y));
    }
  }
  draw() {
    let x = GAME_WIDTH / 2 + cos(this.angle) * this.radius;
    let y = GAME_HEIGHT / 2 + sin(this.angle) * this.radius;
    for (let t of this.trail) {
      noStroke();
      fill(255, 215, 0, t.life);
      ellipse(t.x, t.y, 5, 5);
      t.life -= 10;
    }
    push();
    translate(x, y);
    rotate(this.angle);
    fill(255, 215, 0);
    ellipse(0, 0, 15, 15);
    noFill();
    stroke(seedColor.r, seedColor.g, seedColor.b, 150);
    strokeWeight(2);
    ellipse(0, 0, 20 + sin(frameCount * 0.05) * 5, 20 + sin(frameCount * 0.05) * 5);
    pop();
  }
}