// Global Variables
let logo;
let whiteLogo;
let clickSound;
let backgroundMusic;
let powerUpSound;
let meteorSound;
let levelSound;
let warpSound;
let nebulaSound;
let circleSize = 100;
let maxSize = 120;
let minSize = 80;
let pulseSpeed = 2000;
let basePulseSpeed = 2000;
let lastPulse = 0;
let score = 0;
let gameTime = 0;
let isReadyToClick = false;
let combo = 0;
let comboBar = 0;
let particles = [];
let bgParticles = [];
let level = 1;
let logoX, logoY;
let logoAngle = 0;
let gameState = "howToPlay";
let lives = 5;
let lifeBar = 100;
let misses = 0;
let powerUps = [];
let obstacles = [];
let seeds = [];
let powerUpTimer = 0;
let obstacleTimer = 15000;
let eventTimer = 0;
let supernovaTimer = 0;
let overloadTimer = 0;
let nebulaTimer = 0;
let warpTimer = 0;
let chainPoint = null;
let orbitShiftTimer = 0;
let orbitType = 0;
let activeEvent = null;
let eventTimeLeft = 0;
let eventX, eventY;
let eventColor = 0;
let goal = 50;
let soundInitialized = false;
let shieldActive = false;
let freezeActive = false;
let meteorShowerActive = false;
let starBoostActive = false;
let powerUpEffect = null;
let powerUpEffectTime = 0;
let powerUpCombo = null;
let shakeTimer = 0;
let logoTrail = [];
let seedColor = { r: 147, g: 208, b: 207 };
let playerNick = "";
let leaderboard = [];
let savedGameState = null;
let challengeActive = false;
let challengeTimer = 0;
let challengeClicks = 0;
let challengeGoal = 5;
let lastClickTime = 0;
let inactivityWarning = false;
let inactivityTimer = 0;
let isTypingNick = false;
let mainnetChallengeActive = false;
let mainnetChallengeTimer = 60000;
let mainnetChallengeGoal = 500;
let mainnetChallengeScore = 0;
let mainnetBadgeEarned = false;
let mainnetChallengeTriggered = false;
let gameStartTime = 0;
let tutorialClicks = 0;
let tutorialPulseProgress = 0;
let tutorialLastPulse = 0;
let musicSwitched = false;

let powerUpDurations = {
  gas: 5000,
  pulse: 4000,
  orbit: 6000,
  nova: 5000,
  meteor: 6000,
  star: 5000
};

// Global Variables (zastępują sekcję Constants)
let GAME_WIDTH = 1200;
let GAME_HEIGHT = 1000;
let RESTART_BUTTON_WIDTH = 200;
let RESTART_BUTTON_HEIGHT = 50;
let SYMBOL_SIZE = 18;
let GAME_SYMBOL_SIZE = 40;
let TABLE_CELL_WIDTH = 500;
let TABLE_CELL_HEIGHT = 50;
let TABLE_START_X = (GAME_WIDTH - TABLE_CELL_WIDTH * 2) / 2;
let TABLE_START_Y = 300;
let HOW_TO_PLAY_BUTTON_WIDTH = 100;
let HOW_TO_PLAY_BUTTON_HEIGHT = 40;
let TUTORIAL_BUTTON_WIDTH = 200;
let TUTORIAL_BUTTON_HEIGHT = 50;
let TUTORIAL_MENU_BUTTON_WIDTH = 200;
let TUTORIAL_MENU_BUTTON_HEIGHT = 50;

// Classes
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
  
    // 1. Life (+1 życie) - Pulsująca gwiazda życia
    if (this.type === "life") {
      let gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, GAME_SYMBOL_SIZE / 2);
      gradient.addColorStop(0, "rgb(255, 255, 255)");
      gradient.addColorStop(1, "rgb(0, 255, 0)");
      drawingContext.fillStyle = gradient;
      star(0, 0, GAME_SYMBOL_SIZE / 4, GAME_SYMBOL_SIZE / 2 + sin(millis() * 0.005) * 5, 8);
    } 
    // 2. Gas Nebula (x2 punkty) - Wir mgławicy
    else if (this.type === "gas") {
      noFill();
      stroke(0, 191, 255, 200);
      strokeWeight(3);
      for (let i = 0; i < 4; i++) {
        arc(0, 0, GAME_SYMBOL_SIZE * (i + 1) / 4, GAME_SYMBOL_SIZE * (i + 1) / 4, 0, PI + i * HALF_PI);
      }
      noStroke();
      fill(93, 208, 207, 100);
      ellipse(0, 0, GAME_SYMBOL_SIZE * 1.2);
    } 
    // 3. Pulse Wave (przyspieszenie pulsu) - Fala energetyczna
    else if (this.type === "pulse") {
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
    } 
    // 4. Orbit Shield (tarcza) - Sferyczna bariera
    else if (this.type === "orbit") {
      fill(255, 215, 0, 150);
      ellipse(0, 0, GAME_SYMBOL_SIZE);
      stroke(255, 255, 255, 200);
      strokeWeight(1);
      for (let i = -2; i <= 2; i++) {
        line(i * 10, -GAME_SYMBOL_SIZE / 2, i * 10, GAME_SYMBOL_SIZE / 2);
        line(-GAME_SYMBOL_SIZE / 2, i * 10, GAME_SYMBOL_SIZE / 2, i * 10);
      }
      noStroke();
    } 
    // 5. Freeze Nova (zamrożenie pulsu) - Kryształ lodu
    else if (this.type === "nova") {
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
    } 
    // 6. Meteor Strike (więcej pułapek, x2 punkty) - Płonący meteor
    else if (this.type === "meteor") {
      fill(255, 100, 0, 200);
      ellipse(0, 0, GAME_SYMBOL_SIZE);
      fill(255, 0, 0, 150);
      let tailLength = 20 + sin(millis() * 0.01) * 10;
      triangle(0, -GAME_SYMBOL_SIZE / 2, -tailLength, -GAME_SYMBOL_SIZE, tailLength, -GAME_SYMBOL_SIZE);
    } 
    // 7. Star Seed (większe logo) - Kosmiczne ziarno
    else if (this.type === "star") {
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
    } 
    // 8. Mainnet Wave (czyszczenie pułapek) - Impuls sieciowy
    else if (this.type === "wave") {
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

function drawMainnetBadge(x, y, size) {
  push();
  translate(x, y);
  let gradient = drawingContext.createLinearGradient(-size / 2, 0, size / 2, 0);
  gradient.addColorStop(0, "rgb(93, 208, 207)");
  gradient.addColorStop(1, "rgb(255, 215, 0)");
  drawingContext.fillStyle = gradient;
  ellipse(0, 0, size, size);
  let pulseScale = 1 + sin(millis() * 0.005) * 0.1;
  noFill();
  stroke(255, 215, 0, 200);
  strokeWeight(4);
  ellipse(0, 0, size * pulseScale, size * pulseScale);
  noStroke();
  fill(255);
  textSize(size / 4);
  textStyle(BOLD);
  textFont("Open Sans");
  text("0x", 0, -size / 8);
  textSize(size / 10);
  textStyle(BOLD);
  let textRadius = size / 2 + 10;
  for (let i = 0; i < "Mainnet Synced".length; i++) {
    let angle = map(i, 0, "Mainnet Synced".length, -PI / 2, 3 * PI / 2);
    let tx = textRadius * cos(angle);
    let ty = textRadius * sin(angle);
    push();
    translate(tx, ty);
    rotate(angle + PI / 2);
    fill(255, 215, 0);
    text("Mainnet Synced"[i], 0, 0);
    pop();
  }
  pop();
}

function preload() {
  logo = loadImage('assets/superseed-logo.png');
  whiteLogo = loadImage('assets/White.webp');
  clickSound = loadSound('assets/background-beat.wav');
  backgroundMusic = loadSound('assets/background-music.mp3');
  backgroundMusic2 = loadSound('assets/background-music2.mp3'); // Nowa ścieżka od poziomu 5
  powerUpSound = loadSound('assets/power-up.mp3');
  meteorSound = loadSound('assets/meteor-hit.mp3');
  levelSound = loadSound('assets/level-up.mp3');
  warpSound = loadSound('assets/warp-transition.mp3');
  nebulaSound = loadSound('assets/nebula-burst.mp3');
  holeSound = loadSound('assets/hole.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Dynamiczne dostosowanie wymiarów gry do ekranu
  let scaleFactor = min(windowWidth / 1200, windowHeight / 1000); // Skalowanie względem domyślnych 1200x1000
  GAME_WIDTH = windowWidth;
  GAME_HEIGHT = windowHeight;
  RESTART_BUTTON_WIDTH = 200 * scaleFactor;
  RESTART_BUTTON_HEIGHT = 50 * scaleFactor;
  SYMBOL_SIZE = 18 * scaleFactor;
  GAME_SYMBOL_SIZE = 40 * scaleFactor;
  TABLE_CELL_WIDTH = 500 * scaleFactor;
  TABLE_CELL_HEIGHT = 50 * scaleFactor;
  TABLE_START_X = (GAME_WIDTH - TABLE_CELL_WIDTH * 2) / 2;
  TABLE_START_Y = 300 * scaleFactor;
  HOW_TO_PLAY_BUTTON_WIDTH = 100 * scaleFactor;
  HOW_TO_PLAY_BUTTON_HEIGHT = 40 * scaleFactor;
  TUTORIAL_BUTTON_WIDTH = 200 * scaleFactor;
  TUTORIAL_BUTTON_HEIGHT = 50 * scaleFactor;
  TUTORIAL_MENU_BUTTON_WIDTH = 200 * scaleFactor;
  TUTORIAL_MENU_BUTTON_HEIGHT = 50 * scaleFactor;

  textAlign(CENTER, CENTER);
  textFont("Open Sans");
  logoX = GAME_WIDTH / 2;
  logoY = GAME_HEIGHT / 2;
  for (let i = 0; i < 20; i++) {
    bgParticles.push(new BgParticle());
  }
  clickSound.setVolume(1.0);
  backgroundMusic.setVolume(0.3);
  backgroundMusic2.setVolume(0.3);
  powerUpSound.setVolume(0.5);
  meteorSound.setVolume(0.5);
  levelSound.setVolume(0.5);
  warpSound.setVolume(0.5);
  nebulaSound.setVolume(0.5);
  let savedLeaderboard = localStorage.getItem('leaderboard');
  leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
  lastClickTime = millis();
}

function touchStarted() {
  if (!soundInitialized) {
    soundInitialized = true;
    backgroundMusic.loop();
  }
  mousePressed(); // Reużyj logiki myszy
  return false;
}

function drawBackground(pulseProgress) {
  let bgColor = lerpColor(color(14, 39, 59), color(40 + level * 10, 70 + level * 10, 100), sin(pulseProgress * TWO_PI) * 0.5 + 0.5);
  background(bgColor);
  let c1 = color(14, 39, 59);
  let c2 = color(10, 30, 60);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function draw() {
  let currentTime = millis();
  let pulseProgress = (currentTime - lastPulse) / pulseSpeed;
  drawBackground(pulseProgress);
  let offsetX = (width - GAME_WIDTH) / 2;
  let offsetY = (height - GAME_HEIGHT) / 2;
  push();
  if (shakeTimer > 0) {
    translate(random(-5, 5), random(-5, 5));
    shakeTimer -= deltaTime;
  }
  translate(offsetX, offsetY);
  stroke(93, 208, 207);
  strokeWeight(5);
  noFill();
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  for (let i = bgParticles.length - 1; i >= 0; i--) {
    bgParticles[i].update();
    bgParticles[i].show(pulseProgress);
  }
  if (gameState !== "howToPlay" && gameState !== "tutorial") {
    logoTrail.push({ x: logoX, y: logoY });
    if (logoTrail.length > 20) logoTrail.shift();
    for (let i = 0; i < logoTrail.length; i++) {
      let alpha = map(i, 0, logoTrail.length, 0, 100);
      fill(seedColor.r, seedColor.g, seedColor.b, alpha);
      noStroke();
      ellipse(logoTrail[i].x, logoTrail[i].y, circleSize * 0.5);
    }
  }
  if (gameState === "howToPlay") {
    fill(255);
    textSize(40);
    textStyle(BOLD);
    text("Superseed Cosmic Network", GAME_WIDTH / 2, 50);

    let sectionY = 100;
    textSize(22);
    textStyle(BOLD);
    text("Choose Your Seed Color", GAME_WIDTH / 2, sectionY);
    let colorBoxSize = 50;
    let colorBoxSpacing = 40;
    let totalWidth = (colorBoxSize * 3) + (colorBoxSpacing * 2);
    let startX = (GAME_WIDTH - totalWidth) / 2;
    fill(0, 255, 0);
    rect(startX, sectionY + 20, colorBoxSize, colorBoxSize);
    fill(0, 0, 255);
    rect(startX + colorBoxSize + colorBoxSpacing, sectionY + 20, colorBoxSize, colorBoxSize);
    fill(255, 215, 0);
    rect(startX + (colorBoxSize + colorBoxSpacing) * 2, sectionY + 20, colorBoxSize, colorBoxSize);
    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(50, sectionY + 70, GAME_WIDTH - 50, sectionY + 70);
    noStroke();

    sectionY += 100;
    textSize(22);
    textStyle(BOLD);
    text("Enter Your Nick", GAME_WIDTH / 2, sectionY);
    let nickWidth = 200;
    let nickHeight = 30;
    let nickX = GAME_WIDTH / 2 - nickWidth / 2;
    let nickY = sectionY + 10;
    if (isTypingNick) {
      fill(93, 208, 207, 100);
      stroke(255, 255, 255, 200);
      strokeWeight(2);
    } else {
      fill(255, 255, 255, 50);
      stroke(255, 255, 255, 100);
      strokeWeight(1);
    }
    rect(nickX, nickY, nickWidth, nickHeight, 5);
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    if (isTypingNick) {
      let cursor = (floor(millis() / 500) % 2 === 0) ? "|" : "";
      text(playerNick + cursor, GAME_WIDTH / 2, nickY + nickHeight / 2);
    } else {
      text(playerNick || "Click to type", GAME_WIDTH / 2, nickY + nickHeight / 2);
    }
    noStroke();

    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(50, sectionY + 70, GAME_WIDTH - 50, sectionY + 70);
    noStroke();

    sectionY += 100;
    textSize(22);
    textStyle(BOLD);
    text("Scoring", GAME_WIDTH / 2, sectionY);
    textSize(16);
    textStyle(NORMAL);
    text("Sync the Cosmic Seed when it pulses green!\nStart is easy – sync nodes slowly on Orbit 1 & 2!", GAME_WIDTH / 2, sectionY + 25);
    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(50, sectionY + 70, GAME_WIDTH - 50, sectionY + 70);
    noStroke();

    sectionY += 100;
    textSize(22);
    textStyle(BOLD);
    text("Combos", GAME_WIDTH / 2, sectionY);
    textSize(16);
    textStyle(NORMAL);
    text("Chain syncs for multipliers (x1, x2, ...). 15+ gives +1 life.", GAME_WIDTH / 2, sectionY + 25);
    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(50, sectionY + 70, GAME_WIDTH - 50, sectionY + 70);
    noStroke();

    sectionY += 100;
textSize(22);
textStyle(BOLD);
text("Power-Ups (click to activate)", GAME_WIDTH / 2, sectionY);
textSize(11);
textStyle(NORMAL);
stroke(255, 255, 255, 100);
strokeWeight(1);
noFill();
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 2; col++) {
    let x = TABLE_START_X + col * TABLE_CELL_WIDTH;
    let y = sectionY + 35 + row * TABLE_CELL_HEIGHT;
    rect(x, y, TABLE_CELL_WIDTH, TABLE_CELL_HEIGHT);
  }
}
noStroke();

// 1. Life - Pulsująca gwiazda życia
let x = TABLE_START_X + 50;
let y = sectionY + 35 + TABLE_CELL_HEIGHT / 2;
push(); // Izolacja stanu
translate(x, y);
// Uproszczony gradient lub fallback na jednolity kolor
fill(0, 255, 0, 200); // Zielony z przezroczystością jako baza
let pulseSize = SYMBOL_SIZE / 2 + sin(millis() * 0.005) * 3;
star(0, 0, SYMBOL_SIZE / 4, pulseSize, 8); // Gwiazdka z pulsacją
// Opcjonalny gradient, jeśli działa
let gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, SYMBOL_SIZE / 2);
gradient.addColorStop(0, "rgb(255, 255, 255)");
gradient.addColorStop(1, "rgb(0, 255, 0)");
drawingContext.fillStyle = gradient;
star(0, 0, SYMBOL_SIZE / 4, pulseSize, 8); // Drugie wywołanie z gradientem
pop();
fill(0, 255, 0);
textAlign(LEFT, CENTER);
text("+1 Life", TABLE_START_X + 100, y);

// 2. Gas Nebula - Wir mgławicy
x = TABLE_START_X + TABLE_CELL_WIDTH + 50;
noFill();
stroke(0, 191, 255, 200);
strokeWeight(2);
for (let i = 0; i < 4; i++) {
  arc(x, y, SYMBOL_SIZE * (i + 1) / 4, SYMBOL_SIZE * (i + 1) / 4, 0, PI + i * HALF_PI);
}
noStroke();
fill(93, 208, 207, 100);
ellipse(x, y, SYMBOL_SIZE * 1.2);
fill(0, 255, 0);
text("Gas Nebula: x2 Points (3s)", TABLE_START_X + TABLE_CELL_WIDTH + 100, y);

// 3. Pulse Wave - Fala energetyczna
x = TABLE_START_X + 50;
y = sectionY + 35 + TABLE_CELL_HEIGHT + TABLE_CELL_HEIGHT / 2;
noFill();
let pulse = (millis() % 1000) / 1000;
stroke(147, 208, 207, 200);
strokeWeight(1);
ellipse(x, y, SYMBOL_SIZE * pulse);
stroke(255, 255, 255, 150);
ellipse(x, y, SYMBOL_SIZE * (pulse + 0.5));
noStroke();
fill(0, 255, 0);
text("Pulse Wave: Boost Pulse (3s)", TABLE_START_X + 100, y);

// 4. Orbit Shield - Sferyczna bariera
x = TABLE_START_X + TABLE_CELL_WIDTH + 50;
fill(255, 215, 0, 150);
ellipse(x, y, SYMBOL_SIZE);
stroke(255, 255, 255, 200);
strokeWeight(1);
for (let i = -1; i <= 1; i++) {
  line(x + i * 10, y - SYMBOL_SIZE / 2, x + i * 10, y + SYMBOL_SIZE / 2);
  line(x - SYMBOL_SIZE / 2, y + i * 10, x + SYMBOL_SIZE / 2, y + i * 10);
}
noStroke();
fill(0, 255, 0);
text("Orbit Shield: Blocks Damage (3s) [Lv3+]", TABLE_START_X + TABLE_CELL_WIDTH + 100, y);

// 5. Freeze Nova - Kryształ lodu
x = TABLE_START_X + 50;
y = sectionY + 35 + TABLE_CELL_HEIGHT * 2 + TABLE_CELL_HEIGHT / 2;
fill(0, 255, 255, 200 + sin(millis() * 0.01) * 55);
star(x, y, SYMBOL_SIZE / 2, SYMBOL_SIZE, 6);
fill(0, 255, 0);
text("Freeze Nova: Freezes Pulse (3s) [Lv3+]", TABLE_START_X + 100, y);

// 6. Meteor Strike - Płonący meteor
x = TABLE_START_X + TABLE_CELL_WIDTH + 50;
fill(255, 100, 0, 200);
ellipse(x, y, SYMBOL_SIZE);
fill(255, 0, 0, 150);
let tailLength = 15 + sin(millis() * 0.01) * 5;
triangle(x, y - SYMBOL_SIZE / 2, x - tailLength, y - SYMBOL_SIZE, x + tailLength, y - SYMBOL_SIZE);
fill(0, 255, 0);
text("Meteor Strike: More Traps, x2 (3s) [Lv5+]", TABLE_START_X + TABLE_CELL_WIDTH + 100, y);

// 7. Star Seed - Kosmiczne ziarno
x = TABLE_START_X + 50;
y = sectionY + 35 + TABLE_CELL_HEIGHT * 3 + TABLE_CELL_HEIGHT / 2;
fill(147, 208, 207, 200);
ellipse(x, y, SYMBOL_SIZE, SYMBOL_SIZE * 0.7);
stroke(255, 255, 255, 150);
strokeWeight(1);
pulse = (millis() % 1000) / 1000;
for (let i = 0; i < 8; i++) {
  let a = TWO_PI / 8 * i;
  line(x + cos(a) * SYMBOL_SIZE / 2, y + sin(a) * SYMBOL_SIZE / 2, 
       x + cos(a) * (SYMBOL_SIZE / 2 + pulse * 5), y + sin(a) * (SYMBOL_SIZE / 2 + pulse * 5));
}
noStroke();
fill(0, 255, 0);
text("Star Seed: Bigger Seed (3s) [Lv5+]", TABLE_START_X + 100, y);

// 8. Mainnet Wave - Impuls sieciowy
x = TABLE_START_X + TABLE_CELL_WIDTH + 50;
gradient = drawingContext.createLinearGradient(x - SYMBOL_SIZE / 2, y, x + SYMBOL_SIZE / 2, y);
gradient.addColorStop(0, "rgb(93, 208, 207)");
gradient.addColorStop(1, "rgb(255, 215, 0)");
drawingContext.fillStyle = gradient;
beginShape();
for (let i = 0; i < 6; i++) {
  let a = TWO_PI / 6 * i;
  vertex(x + cos(a) * SYMBOL_SIZE / 2, y + sin(a) * SYMBOL_SIZE / 2);
}
endShape(CLOSE);
noFill();
stroke(255, 215, 0, 150);
strokeWeight(1);
ellipse(x, y, SYMBOL_SIZE + sin(millis() * 0.005) * 5);
noStroke();
fill(0, 255, 0);
text("Mainnet Wave: Clears Traps [Lv7+]", TABLE_START_X + TABLE_CELL_WIDTH + 100, y);

    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(50, sectionY + 35 + TABLE_CELL_HEIGHT * 4 + 25, GAME_WIDTH - 50, sectionY + 35 + TABLE_CELL_HEIGHT * 4 + 25);
    noStroke();

    sectionY += 100 + TABLE_CELL_HEIGHT * 4;
    textSize(22);
    textStyle(BOLD);
    text("Traps", GAME_WIDTH / 2, sectionY);

    let trapsContentY = sectionY + 35;
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    noFill();
    rect(GAME_WIDTH / 2 - 275, trapsContentY - 22, 550, 60);
    noStroke();

    textSize(17);
    textStyle(NORMAL);
    fill(255, 0, 0, 200);
    ellipse(GAME_WIDTH / 2 - 150, trapsContentY + 5, SYMBOL_SIZE);
    stroke(255, 100);
    strokeWeight(2);
    line(GAME_WIDTH / 2 - 150 - SYMBOL_SIZE / 2, trapsContentY + 5 - SYMBOL_SIZE / 2, 
         GAME_WIDTH / 2 - 150 + SYMBOL_SIZE / 2, trapsContentY + 5 + SYMBOL_SIZE / 2);
    noStroke();
    fill(255, 0, 0);
    text("Avoid Meteor Strikes - 5 misses = -1 life", GAME_WIDTH / 2 - 60, trapsContentY + 5);

    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2, GAME_HEIGHT - 140, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(28);
    textAlign(CENTER, CENTER);
    text(savedGameState ? "RESUME" : "START", GAME_WIDTH / 2, GAME_HEIGHT - 140 + RESTART_BUTTON_HEIGHT / 2);

    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - TUTORIAL_MENU_BUTTON_WIDTH / 2, GAME_HEIGHT - 80, TUTORIAL_MENU_BUTTON_WIDTH, TUTORIAL_MENU_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(24);
    text("TUTORIAL", GAME_WIDTH / 2, GAME_HEIGHT - 55);

    textAlign(CENTER, BASELINE);
  } else if (gameState === "tutorial") {
    // Gradient Background with Dynamic Pulse Effect
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "#0E273B"); // Tangaroa
    gradient.addColorStop(0.5, "#93D0CF"); // Morning Glory
    gradient.addColorStop(1, "#808386"); // Aluminium
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Pulsing Border Effect
    let pulseProgress = sin(millis() * 0.002) * 0.5 + 0.5;
    stroke(93, 208, 207, map(pulseProgress, 0, 1, 100, 255));
    strokeWeight(5 + pulseProgress * 2);
    noFill();
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
    noStroke();
  
    // Text Alignment Setup
    textAlign(CENTER, BASELINE);
  
    // Title with Logo Integration
    fill(249, 249, 242); // White (#F9F9F2)
    textSize(36);
    textStyle(BOLD);
    text("Superseed Cosmic Network", GAME_WIDTH / 2, 60);
    let logoScale = 1 + sin(millis() * 0.003) * 0.1;
    image(whiteLogo, GAME_WIDTH / 2 - 100, 70, 200 * logoScale, 100 * logoScale);
  
    let sectionY = 160;
  
    // Objective Section
    fill(93, 208, 207); // Morning Glory
    textSize(24);
    textStyle(BOLD);
    text("Objective", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(16);
    textStyle(NORMAL);
    let objectiveLines = [
      "Sync your way through 10 Orbits to fully activate the Superseed Mainnet.",
      "Achieve the ultimate sync to join the cosmic leaderboard and enter to win a Tesla! (virtual :)",
      "Test your reflexes and strategy in this decentralized challenge."
    ];
    for (let i = 0; i < objectiveLines.length; i++) {
      text(objectiveLines[i], GAME_WIDTH / 2, sectionY + 25 + i * 20);
    }
  
    sectionY += 100;
  
    // Gameplay Section
    fill(93, 208, 207);
    textSize(24);
    textStyle(BOLD);
    text("Gameplay Mechanics", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(14);
    textStyle(NORMAL);
    let gameplayLines = [
      "Click the pulsing Superseed logo when it glows green to score points.",
      "Chain consecutive syncs to build combos – hit 15+ for an extra life!",
      "Dodge meteors and traps; 5 misses deduct a life unless shielded.",
      "Adapt to shifting orbits and escalating speeds as you progress."
    ];
    for (let i = 0; i < gameplayLines.length; i++) {
      text(gameplayLines[i], GAME_WIDTH / 2, sectionY + 20 + i * 20);
    }
    // Mini Demo: Pulsing Logo Preview
    push();
    translate(GAME_WIDTH / 2 + 200, sectionY + 40);
    let demoPulse = lerp(80, 120, sin(millis() * 0.002));
    tint(seedColor.r, seedColor.g, seedColor.b, 200);
    image(logo, 0, 0, demoPulse, demoPulse);
    pop();
  
    sectionY += 120;
  
    // Power-Ups Section
fill(93, 208, 207);
textSize(24);
textStyle(BOLD);
text("Power-Ups & Boosts", GAME_WIDTH / 2, sectionY);
fill(249, 249, 242);
textSize(14);
textStyle(NORMAL);
let powerUpLines = [
  "Life (+1 life) – Restore vitality to keep syncing.",
  "Gas Nebula (x2 points, 3s) – Double your score in a cosmic cloud.",
  "Pulse Wave (faster pulse, 3s) – Speed up sync opportunities.",
  "Orbit Shield (blocks damage, 3s) – Protection from meteor strikes [Lv3+].",
  "Freeze Nova (freezes pulse, 3s) – Lock the rhythm for precision [Lv3+].",
  "Meteor Strike (more traps, x2 points, 3s) – High risk, high reward [Lv5+].",
  "Star Seed (bigger logo, 3s) – Easier clicks, bigger wins [Lv5+].",
  "Mainnet Wave (clears traps) – Reset the field for a fresh start [Lv7+]."
];
for (let i = 0; i < powerUpLines.length; i++) {
  text(powerUpLines[i], GAME_WIDTH / 2, sectionY + 20 + i * 20);
}
// Power-Up Icons Demo - ikona Life
let iconX = GAME_WIDTH / 2 - 250;
push(); // Izolacja stanu
translate(iconX, sectionY + 40); // Przesunięcie do pozycji ikony
let lifeGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 20); // Unikalna nazwa zmiennej
lifeGradient.addColorStop(0, "rgb(255, 255, 255)");
lifeGradient.addColorStop(1, "rgb(0, 255, 0)");
drawingContext.fillStyle = lifeGradient;
star(0, 0, 10, 20 + sin(millis() * 0.005) * 5, 8); // Pulsująca gwiazda
pop();
  
    sectionY += 200;
  
    // Progression Section
    fill(93, 208, 207);
    textSize(24);
    textStyle(BOLD);
    text("Orbit Progression", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(14);
    textStyle(NORMAL);
    let progressionLines = [
      "Begin at Orbit 1 – earn 50 points to advance.",
      "Each orbit increases difficulty: faster pulses, more traps.",
      "Reach Orbit 10 to sync the Mainnet and unlock endgame rewards!",
      "Track your progress with the orbit bar at the top."
    ];
    for (let i = 0; i < progressionLines.length; i++) {
      text(progressionLines[i], GAME_WIDTH / 2, sectionY + 20 + i * 20);
    }
  
    sectionY += 120;
  
    // Challenges Section
    fill(93, 208, 207);
    textSize(24);
    textStyle(BOLD);
    text("Special Challenges", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(14);
    textStyle(NORMAL);
    let challengeLines = [
      "Supernova Rush (Lv5+) – 30s of intensified gameplay with doubled rewards.",
      "Mainnet Challenge (Lv5+, 2min+) – Sync 500 points in 60s for a badge.",
      "Overload Events (Lv7+) – Random boosts or penalties for 5s.",
      "Quick Click Challenges – Hit 5 syncs in 3s for bonus points."
    ];
    for (let i = 0; i < challengeLines.length; i++) {
      text(challengeLines[i], GAME_WIDTH / 2, sectionY + 20 + i * 20);
    }
  
    sectionY += 120;
  
    // Why Play Section
    fill(93, 208, 207);
    textSize(24);
    textStyle(BOLD);
    text("Why Join the Network?", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(14);
    textStyle(NORMAL);
    let whyPlayLines = [
      "Experience Superseed’s vision of a decentralized future.",
      "Master escalating challenges with strategic power-ups.",
      "Compete for leaderboard glory and real-world rewards!",
      "Built with xAI’s Grok 3 – a cosmic collaboration."
    ];
    for (let i = 0; i < whyPlayLines.length; i++) {
      text(whyPlayLines[i], GAME_WIDTH / 2, sectionY + 20 + i * 20);
    }
  
    // Start Game Button with Hover Effect
    let buttonX = GAME_WIDTH / 2 - TUTORIAL_BUTTON_WIDTH / 2;
    let buttonY = GAME_HEIGHT - 90;
    let isHovering = mouseX > buttonX && mouseX < buttonX + TUTORIAL_BUTTON_WIDTH && 
                     mouseY > buttonY && mouseY < buttonY + TUTORIAL_BUTTON_HEIGHT;
    fill(93, 208, 207, isHovering ? 255 : 200);
    rect(buttonX, buttonY, TUTORIAL_BUTTON_WIDTH, TUTORIAL_BUTTON_HEIGHT, 15);
    fill(249, 249, 242);
    textSize(26);
    textStyle(BOLD);
    text("START SYNC", GAME_WIDTH / 2, GAME_HEIGHT - 58);
  
    // Back Button with Hover Effect
    let backX = 20;
    let backY = 20;
    let isBackHovering = mouseX > backX && mouseX < backX + 120 && 
                         mouseY > backY && mouseY < backY + 50;
    fill(93, 208, 207, isBackHovering ? 255 : 200);
    rect(backX, backY, 120, 50, 10);
    fill(249, 249, 242);
    textSize(20);
    text("BACK", backX + 60, backY + 35);
  
    // Footer Branding
    fill(128, 131, 134, 150);
    textSize(12);
    text("#SuperseedGrok3 – Powered by xAI", GAME_WIDTH / 2, GAME_HEIGHT - 20);
  } else if (gameState === "start") {
    fill(255);
    textSize(40);
    textStyle(BOLD);
    text("Build the Superseed Network\nSync Nodes, Earn Rewards, Decentralize Tomorrow!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
  } else if (gameState === "playing" || gameState === "supernova") {
    if (soundInitialized) {
      if (level >= 5) {
        if (!backgroundMusic2.isPlaying()) {
          console.log("Switching to backgroundMusic2");
          backgroundMusic.stop(); // Zatrzymaj pierwszą muzykę
          backgroundMusic2.loop(); // Uruchom drugą
          musicSwitched = true; // Oznacz przełączenie
        }
      } else {
        if (!backgroundMusic.isPlaying()) {
          console.log("Playing backgroundMusic");
          backgroundMusic2.stop(); // Zatrzymaj drugą muzykę
          backgroundMusic.loop(); // Uruchom pierwszą
          musicSwitched = false; // Reset przełączenia
        }
      }
    }

    gameTime = millis();

    if (pulseProgress > 1 && !freezeActive) {
      pulseProgress = 0;
      lastPulse = currentTime;
      if (combo % 10 === 0 && combo > 0 && level > 1) {
        pulseSpeed = random(800, 1600);
      }
    }
    circleSize = lerp(minSize, maxSize, sin(pulseProgress * TWO_PI));
    if (starBoostActive) circleSize *= 1.2;
    isReadyToClick = abs(circleSize - (starBoostActive ? maxSize * 1.2 : maxSize)) < (level <= 2 ? 10 : 5);

    orbitShiftTimer -= deltaTime;
if (orbitShiftTimer <= 0) {
  orbitType = floor(random(2)); // Ograniczamy do 0 i 1 (usuwamy 2)
  orbitShiftTimer = 20000;
}
if (orbitType === 0) {
  logoX = GAME_WIDTH / 2 + sin(millis() * 0.001) * min(40 * level, 200); // Płynny ruch sinusoidalny
  logoY = GAME_HEIGHT / 2 + cos(millis() * 0.001) * min(30 * level, 150);
} else {
  logoX = GAME_WIDTH / 2 + cos(millis() * 0.002) * min(60 * level, 300); // Eliptyczny ruch
  logoY = GAME_HEIGHT / 2 + sin(millis() * 0.002) * min(60 * level, 300);
}

    if (level >= 7 && random(1) < 0.005 && !activeEvent) {
      activeEvent = "overload";
      eventTimeLeft = 5000;
      eventColor = floor(random(3));
    }

  // === TUTAJ DODAJEMY CZARNĄ DZIURĘ ===
  if (gameState === "playing" && level >= 4 && random(1) < 0.005 && !activeEvent) {
    activeEvent = "blackHole";
    eventTimeLeft = 10000;
    eventX = random(100, GAME_WIDTH - 100);
    eventY = random(100, GAME_HEIGHT - 100);
    blackHoleSoundPlayed = false; // Reset flagi przy starcie zdarzenia
  }
  
  // Obsługa efektów czarnej dziury
if (activeEvent === "blackHole") {
  eventTimeLeft -= deltaTime;

  // Rysowanie czarnej dziury
  fill(0, 0, 0, 200); // Czarny kolor z lekką przezroczystością
  let blackHoleSize = 200 + sin(millis() * 0.005) * 20; // Pulsujący rozmiar
  ellipse(eventX, eventY, blackHoleSize, blackHoleSize);

  // Odtwarzanie dźwięku przy starcie
  if (!blackHoleSoundPlayed && soundInitialized) {
    holeSound.play();
    blackHoleSoundPlayed = true; // Oznacz, że dźwięk został odtworzony
    console.log("Black hole sound played"); // Debugowanie
  }

  // Wciąganie przeszkód i power-upów
  obstacles = obstacles.filter(o => {
    let d = dist(o.x, o.y, eventX, eventY);
    if (d < blackHoleSize / 2) {
      return false; // Usuń przeszkodę, jeśli jest w zasięgu
    }
    o.x += (eventX - o.x) * 0.05; // Przyciąganie do czarnej dziury
    o.y += (eventY - o.y) * 0.05;
    return true;
  });

  powerUps = powerUps.filter(p => {
    let d = dist(p.x, p.y, eventX, eventY);
    if (d < blackHoleSize / 2) {
      return false; // Usuń power-up, jeśli jest w zasięgu
    }
    p.x += (eventX - p.x) * 0.05; // Przyciąganie do czarnej dziury
    p.y += (eventY - p.y) * 0.05;
    return true;
  });

  // Zmniejszenie obszaru gry
  let restrictedArea = 300; // Promień ograniczonego obszaru wokół czarnej dziury
  if (dist(logoX, logoY, eventX, eventY) < restrictedArea) {
    // Przesuń logo poza obszar czarnej dziury
    let angle = atan2(logoY - eventY, logoX - eventX);
    logoX = eventX + cos(angle) * restrictedArea;
    logoY = eventY + sin(angle) * restrictedArea;
  }

  // Wir cząstek
  if (random(1) < 0.2) {
    particles.push(new Particle(eventX, eventY, { r: 255, g: 255, b: 255 }));
  }
  particles.forEach(p => {
    let d = dist(p.x, p.y, eventX, eventY);
    if (d < blackHoleSize / 2) {
      p.life = 0; // Usuń cząstki wciągnięte do czarnej dziury
    } else {
      p.speedX += (eventX - p.x) * 0.1 / d;
      p.speedY += (eventY - p.y) * 0.1 / d;
    }
  });

  // Wyświetl ostrzeżenie
  fill(255, 0, 0, 200);
  textSize(20);
  text(`Czarna Dziura! ${floor(eventTimeLeft / 1000)}s`, GAME_WIDTH / 2, 50);

  // Dźwięk przy rozpoczęciu
  if (eventTimeLeft > 9990 && soundInitialized) { // Uruchom tylko raz na początku
    holeSound.play();
  }

  // Zakończ wydarzenie po czasie
  if (eventTimeLeft <= 0) {
    activeEvent = null;
    if (soundInitialized) warpSound.play(); // Dźwięk zakończenia
  }
}
// === KONIEC CZARNEJ DZIURY ===

    if (level >= 5 && random(1) < 0.01 && gameState === "playing" && !activeEvent) {
      gameState = "supernova";
      supernovaTimer = 30000;
      pulseSpeed /= 2;
      obstacleTimer /= 2;
    }
    if (level >= 7 && random(1) < 0.005 && !activeEvent && gameState !== "supernova") {
      activeEvent = "overload";
      eventTimeLeft = 5000;
      eventColor = floor(random(3));
    }

    if (
      gameState === "playing" &&
      !mainnetChallengeActive &&
      !mainnetChallengeTriggered &&
      level >= 5 &&
      combo >= 15 &&
      (millis() - gameStartTime) >= 120000 &&
      random(1) < 0.005
    ) {
      mainnetChallengeActive = true;
      mainnetChallengeTriggered = true;
      mainnetChallengeTimer = 60000;
      mainnetChallengeScore = 0;
      if (soundInitialized) warpSound.play();
    }

    if (mainnetChallengeActive) {
      mainnetChallengeTimer -= deltaTime;
      let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
      gradient.addColorStop(0, "#93D0CF");
      gradient.addColorStop(1, "#0E273B");
      drawingContext.fillStyle = gradient;
      rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawingContext.globalAlpha = 0.3;
      let logoWidth = 400;
      let logoHeight = 200;
      let pulseScale = 1 + sin(millis() * 0.005) * 0.1;
      image(whiteLogo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoWidth * pulseScale, logoHeight * pulseScale);
      drawingContext.globalAlpha = 1.0;
      fill(255, 215, 0, 200);
      textSize(20);
      text(
        `Superseed Mainnet Launch Challenge: Sync ${mainnetChallengeGoal - mainnetChallengeScore} more points! ${floor(mainnetChallengeTimer / 1000)}s`,
        GAME_WIDTH / 2,
        GAME_HEIGHT - 150
      );

      if (mainnetChallengeScore >= mainnetChallengeGoal) {
        mainnetChallengeActive = false;
        mainnetBadgeEarned = true;
        lives += 1;
        lifeBar = min(lifeBar + 20, 100);
        score += 50;
        if (soundInitialized) levelSound.play();
        for (let i = 0; i < 30; i++) {
          particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: 255, g: 215, b: 0 }));
        }
      } else if (mainnetChallengeTimer <= 0) {
        mainnetChallengeActive = false;
        shakeTimer = 500;
      }
    }

    if (gameState === "supernova") {
      supernovaTimer -= deltaTime;
      fill(255, 100, 0, 50);
      rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      fill(255);
      textSize(20);
      text(`Supernova Rush: ${floor(supernovaTimer / 1000)}s`, GAME_WIDTH - 100, 50);
      if (supernovaTimer <= 0) {
        gameState = "playing";
        pulseSpeed *= 2;
        obstacleTimer *= 2;
      }
    }

    if (activeEvent) {
      eventTimeLeft -= deltaTime;
      if (activeEvent === "overload") {
        fill(147, 112, 219, 50);
        rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
      if (eventTimeLeft <= 0) {
        activeEvent = null;
      }
    }

    if (!challengeActive && random(1) < 0.002) {
      challengeActive = true;
      challengeTimer = 10000;
      challengeClicks = 0;
      challengeGoal = 5;
    }
    if (challengeActive) {
      challengeTimer -= deltaTime;
      fill(255, 255, 0, 200);
      textSize(20);
      text(`Challenge: Click ${challengeGoal - challengeClicks} more times! ${floor(challengeTimer / 1000)}s`, GAME_WIDTH / 2, GAME_HEIGHT - 100);
      if (challengeTimer <= 0) {
        challengeActive = false;
        if (challengeClicks < challengeGoal) {
          lives -= 1;
          lifeBar -= 20;
          shakeTimer = 500;
        } else {
          score += 10;
        }
      }
    }

    if (gameState === "playing" || gameState === "supernova") {
      let timeSinceLastClick = currentTime - lastClickTime;
      if (timeSinceLastClick > 5000 && !inactivityWarning) {
        inactivityWarning = true;
        inactivityTimer = 5000;
      }
      if (inactivityWarning) {
        inactivityTimer -= deltaTime;
        fill(255, 0, 0, 200);
        textSize(20);
        text(`Click anywhere! ${floor(inactivityTimer / 1000) + 1}s`, GAME_WIDTH / 2, GAME_HEIGHT - 100);
        if (inactivityTimer <= 0) {
          lives -= 1;
          lifeBar -= 20;
          shakeTimer = 500;
          inactivityWarning = false;
          lastClickTime = currentTime;
        }
      }
    }

    if (nebulaTimer > 0) {
      fill(seedColor.r, seedColor.g, seedColor.b, map(nebulaTimer, 0, 2000, 0, 100));
      rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      if (nebulaTimer === 2000 && soundInitialized) nebulaSound.play();
      nebulaTimer -= deltaTime;
    }

    if (combo >= 20) logoAngle += 0.03;
    else logoAngle += 0.01;

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(0, 255, 0, 0.5)";
    imageMode(CENTER);
    push();
    translate(logoX, logoY);
    rotate(logoAngle);
    let isRedPulse = random(1) < 0.01;
    if (isRedPulse && !isReadyToClick) {
      tint(255, 0, 0, 200);
    } else if (isReadyToClick) {
      tint(seedColor.r, seedColor.g, seedColor.b, 200);
    } else if (activeEvent === "overload") {
      if (eventColor === 0) tint(0, 255, 0, 200);
      else if (eventColor === 1) tint(147, 112, 219, 200);
      else tint(255, 215, 0, 200);
    } else {
      noTint();
    }
    image(logo, 0, 0, circleSize, circleSize);
    pop();
    drawingContext.shadowBlur = 0;

    if (isReadyToClick) {
      fill(255, 200);
      textSize(28);
      textStyle(BOLD);
      text("Sync!", logoX, logoY + 70);
    }

    if (chainPoint && chainPoint.timer > 0) {
      stroke(seedColor.r, seedColor.g, seedColor.b, 200);
      strokeWeight(2);
      line(logoX, logoY, chainPoint.x, chainPoint.y);
      noStroke();
      fill(seedColor.r, seedColor.g, seedColor.b, 200);
      ellipse(chainPoint.x, chainPoint.y, 20);
      chainPoint.timer -= deltaTime;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    powerUpTimer -= deltaTime;
    if (powerUpTimer <= 0 && random(1) < 0.003 && level > 2) {
      powerUps.push(new PowerUp());
      powerUpTimer = 15000;
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].update();
      powerUps[i].show();
      if (powerUps[i].isExpired()) {
        powerUps.splice(i, 1);
      }
    }

    obstacleTimer -= deltaTime;
    if (obstacleTimer <= 0) {
      let obstacleChance = level <= 2 ? 0.002 : (meteorShowerActive ? 0.01 : 0.005 + level * 0.001);
      if (random(1) < obstacleChance) {
        obstacles.push(new Obstacle());
        obstacleTimer = meteorShowerActive ? 500 : (level <= 2 ? 15000 : 10000);
      }
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].show();
      if (obstacles[i].isExpired()) {
        obstacles.splice(i, 1);
      }
    }

    for (let i = seeds.length - 1; i >= 0; i--) {
      seeds[i].show();
      if (seeds[i].update()) seeds.splice(i, 1);
    }

    if (powerUpEffect) {
      powerUpEffectTime -= deltaTime;
      if (powerUpEffectTime <= 0) {
        if (powerUpEffect === "pulse") pulseSpeed -= 500;
        if (powerUpEffect === "orbit") shieldActive = false;
        if (powerUpEffect === "nova") freezeActive = false;
        if (powerUpEffect === "meteor") meteorShowerActive = false;
        if (powerUpEffect === "star") starBoostActive = false;
        powerUpEffect = null;
        powerUpCombo = null;
      } else if (powerUpCombo === "gas+star") {
        fill(255, 215, 0, 100);
        rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
    }

    if (shieldActive) {
      noFill();
      stroke(255, 215, 0, 200);
      strokeWeight(4);
      ellipse(logoX, logoY, circleSize + 20);
      noStroke();
    }
    if (freezeActive) {
      noFill();
      stroke(0, 255, 255, 200);
      strokeWeight(4);
      ellipse(logoX, logoY, circleSize + 20);
      noStroke();
    }
    if (meteorShowerActive) {
      fill(255, 100, 0, 50);
      rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    if (starBoostActive) {
      noFill();
      stroke(seedColor.r, seedColor.g, seedColor.b, 200);
      strokeWeight(4);
      star(logoX, logoY, circleSize / 2, circleSize / 1.5, 5);
      noStroke();
    }

    let progress = map(score, 0, goal, 0, GAME_WIDTH - 100);
    for (let x = 50; x < 50 + progress; x++) {
      let inter = map(x, 50, GAME_WIDTH - 50, 0, 1);
      let c = lerpColor(color(93, 208, 207), color(seedColor.r, seedColor.g, seedColor.b), inter);
      stroke(c);
      line(x, 30, x, 50);
    }
    noStroke();

    let lifeProgress = map(lifeBar, 0, 100, 0, GAME_WIDTH - 100);
    for (let x = 50; x < 50 + lifeProgress; x++) {
      let inter = map(x, 50, GAME_WIDTH - 50, 0, 1);
      let c = lerpColor(color(255, 0, 0), color(0, 255, 0), inter);
      stroke(c);
      line(x, GAME_HEIGHT - 40, x, GAME_HEIGHT - 20);
    }
    noStroke();

    if (warpTimer > 0) {
      for (let i = 0; i < 20; i++) {
        stroke(255, 215, 0, map(warpTimer, 0, 1000, 0, 255));
        strokeWeight(2);
        let x = map(i, 0, 20, 0, GAME_WIDTH);
        line(x, GAME_HEIGHT / 2, GAME_WIDTH / 2, GAME_HEIGHT / 2);
      }
      noStroke();
      if (warpTimer === 1000 && soundInitialized) warpSound.play();
      warpTimer -= deltaTime;
    }

    fill(255, 200);
    textSize(20);
    text(`Orbit: ${level}`, GAME_WIDTH / 2, 70);
    if (combo > 0) {
      if (combo >= 15) fill(seedColor.r, seedColor.g, seedColor.b);
      text(`Sync x${combo}`, GAME_WIDTH / 2, 100);
      if (playerNick) text(`${playerNick}'s Network`, GAME_WIDTH / 2, 130);
    }
    noFill();
    stroke(seedColor.r, seedColor.g, seedColor.b);
    strokeWeight(4);
    rect(GAME_WIDTH / 2 - 50, GAME_HEIGHT - 60, 100, 10);
    noStroke();
    fill(seedColor.r, seedColor.g, seedColor.b);
    rect(GAME_WIDTH / 2 - 50, GAME_HEIGHT - 60, map(comboBar, 0, 10, 0, 100), 10);

    fill(255, 100);
    textSize(12);
    text("#SuperseedGrok3", GAME_WIDTH - 80, GAME_HEIGHT - 10);

    fill(93, 208, 207);
    rect(GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH - 10, 10, HOW_TO_PLAY_BUTTON_WIDTH, HOW_TO_PLAY_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(18);
    text("How to Play", GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH / 2 - 10, 30);

    if (level === 1) {
      pulseSpeed = max(1800, 2000 - score * 5);
    } else if (level === 2) {
      pulseSpeed = max(1700, 1900 - score * 5 - level * 5);
    } else if (level === 3) {
      pulseSpeed = max(1600, 1800 - score * 8 - level * 10);
    } else {
      pulseSpeed = max(600, 1500 - score * 5 - level * 15);
    }

    if (combo >= 15 && lives < 5) {
      lives += 1;
      lifeBar = min(lifeBar + 20, 100);
      combo = 0;
      comboBar = 0;
      shakeTimer = 500;
      nebulaTimer = 2000;
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
      }
    }
    if (combo >= 5 && !chainPoint) {
      chainPoint = { x: random(100, GAME_WIDTH - 100), y: random(100, GAME_HEIGHT - 100), timer: 5000 };
    }
    if (score >= goal) {
      level += 1;
      if (soundInitialized) {
        if (level === 5) {
          console.log("Level 5 reached, switching music");
          backgroundMusic.stop();
          backgroundMusic2.stop(); // Zatrzymaj, jeśli gra
          backgroundMusic2.loop(); // Uruchom od nowa
          musicSwitched = true;
        } else if (level > 5) {
          console.log(`Level ${level} reached, restarting backgroundMusic2`);
          backgroundMusic2.stop(); // Zatrzymaj bieżącą muzykę
          backgroundMusic2.loop(); // Uruchom od nowa
        }
      }
      goal = level <= 2 ? 50 : (level === 3 ? 70 : goal + 30);
      lives += 1;
      lifeBar = min(lifeBar + 20, 100);
      score = 0;
      combo = 0;
      comboBar = 0;
      gameState = level >= 10 ? "endgame" : "win";
      warpTimer = 1000;
      if (soundInitialized) levelSound.play();
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: 255, g: 255, b: 255 }));
      }
    } else if (lives <= 0 || lifeBar <= 0) {
      leaderboard.push({ nick: playerNick || "Anonymous", score: score });
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 5);
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
      gameState = "gameOver";
      shakeTimer = 500;
    }

    if (combo === 50) {
      fill(seedColor.r, seedColor.g, seedColor.b);
      textSize(40);
      text("To the Moon!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
  } // Zamknięcie bloku if (gameState === "playing" || gameState === "supernova") – poprawne miejsce

  else if (gameState === "gameOver") { // Usunięto dodatkowe } przed tym else if
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "rgb(14, 39, 59)");
    gradient.addColorStop(1, "rgb(93, 208, 207)");
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);

    let logoWidth = 300;
    let logoHeight = 150;
    image(whiteLogo, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 200, logoWidth, logoHeight);

    fill(255, 200);
    textSize(40);
    textStyle(BOLD);
    text(`Network Down!\nScore: ${score.toFixed(1)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

    textSize(24);
    text("Top Synced Networks", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    textSize(18);
    for (let i = 0; i < leaderboard.length; i++) {
      text(`${i + 1}. ${leaderboard[i].nick}: ${leaderboard[i].score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20 + i * 30);
    }

    if (mainnetBadgeEarned) {
      drawMainnetBadge(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 100);
      fill(255, 215, 0);
      textSize(20);
      text("Mainnet Badge Earned!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
      let buttonX = GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2;
      let buttonY = GAME_HEIGHT / 2 + 270;
      let gradient = drawingContext.createLinearGradient(buttonX, buttonY, buttonX + RESTART_BUTTON_WIDTH, buttonY);
      gradient.addColorStop(0, "rgb(93, 208, 207)");
      gradient.addColorStop(1, "rgb(255, 215, 0)");
      drawingContext.fillStyle = gradient;
      rect(buttonX, buttonY, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
      fill(255, 215, 0);
      textSize(20);
      text("SHARE BADGE", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 295);
    }

    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2, GAME_HEIGHT / 2 + 150, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(30);
    text("RELAUNCH", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 175);

    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2, GAME_HEIGHT / 2 + 210, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(20);
    text("SHARE SCORE", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 235);

  } else if (gameState === "win") {
    fill(seedColor.r, seedColor.g, seedColor.b);
    textSize(48);
    textStyle(BOLD);
    text(`Mainnet Orbit Achieved!\nOrbit ${level} - Press Space or Click`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
    }
  } else if (gameState === "endgame") {
    fill(seedColor.r, seedColor.g, seedColor.b);
    textSize(48);
    textStyle(BOLD);
    text(`Mainnet Fully Synced!\nEnter to Win a Tesla! (virtual:) #SuperseedGrok3`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }
  pop();
}

function startGame() {
  if (gameState === "start" || gameState === "gameOver" || gameState === "endgame" || gameState === "tutorial") {
    score = 0;
    combo = 0;
    comboBar = 0;
    level = 1;
    pulseSpeed = 2000;
    basePulseSpeed = 2000;
    goal = 50;
    lives = 5;
    lifeBar = 100;
    misses = 0;
    particles = [];
    logoAngle = 0;
    lastPulse = millis();
    powerUps = [];
    obstacles = [];
    seeds = [];
    chainPoint = null;
    activeEvent = null;
    powerUpEffect = null;
    powerUpCombo = null;
    shieldActive = false;
    freezeActive = false;
    meteorShowerActive = false;
    starBoostActive = false;
    logoTrail = [];
    shakeTimer = 0;
    nebulaTimer = 0;
    warpTimer = 0;
    eventTimer = 0;
    powerUpTimer = 0;
    obstacleTimer = 15000;
    supernovaTimer = 0;
    orbitShiftTimer = 0;
    lastPulse = millis();
    challengeActive = false;
    challengeTimer = 0;
    challengeClicks = 0;
    lastClickTime = millis();
    inactivityWarning = false;
    inactivityTimer = 0;
    gameStartTime = millis();
    mainnetChallengeTriggered = false;
    mainnetChallengeActive = false;
    mainnetChallengeScore = 0;
    mainnetBadgeEarned = false;
    musicSwitched = false; // Reset flagi przy nowej grze
  }
  gameState = "playing";
  if (!soundInitialized) {
    soundInitialized = true;
  }
}

function pauseGame() {
  savedGameState = {
    score,
    combo,
    comboBar,
    level,
    pulseSpeed,
    basePulseSpeed,
    goal,
    lives,
    lifeBar,
    misses,
    particles: [...particles],
    powerUps: [...powerUps],
    obstacles: [...obstacles],
    seeds: [...seeds],
    chainPoint,
    activeEvent,
    powerUpEffect,
    powerUpCombo,
    shieldActive,
    freezeActive,
    meteorShowerActive,
    starBoostActive,
    logoTrail: [...logoTrail],
    shakeTimer,
    nebulaTimer,
    warpTimer,
    eventTimer,
    powerUpTimer,
    obstacleTimer,
    supernovaTimer,
    orbitShiftTimer,
    lastPulse,
    gameState,
    challengeActive,
    challengeTimer,
    challengeClicks,
    lastClickTime,
    inactivityWarning,
    inactivityTimer,
    mainnetChallengeActive,
    mainnetChallengeTimer,
    mainnetChallengeGoal,
    mainnetChallengeScore,
    mainnetBadgeEarned,
    mainnetChallengeTriggered,
    gameStartTime
  };
  gameState = "howToPlay";
  if (soundInitialized) backgroundMusic.pause();
}

function resumeGame() {
  if (savedGameState) {
    score = savedGameState.score;
    combo = savedGameState.combo;
    comboBar = savedGameState.comboBar;
    level = savedGameState.level;
    pulseSpeed = savedGameState.pulseSpeed;
    basePulseSpeed = savedGameState.basePulseSpeed;
    goal = savedGameState.goal;
    lives = savedGameState.lives;
    lifeBar = savedGameState.lifeBar;
    misses = savedGameState.misses;
    particles = [...savedGameState.particles];
    powerUps = [...savedGameState.powerUps];
    obstacles = [...savedGameState.obstacles];
    seeds = [...savedGameState.seeds];
    chainPoint = savedGameState.chainPoint;
    activeEvent = savedGameState.activeEvent;
    powerUpEffect = savedGameState.powerUpEffect;
    powerUpCombo = savedGameState.powerUpCombo;
    shieldActive = savedGameState.shieldActive;
    freezeActive = savedGameState.freezeActive;
    meteorShowerActive = savedGameState.meteorShowerActive;
    starBoostActive = savedGameState.starBoostActive;
    logoTrail = [...savedGameState.logoTrail];
    shakeTimer = savedGameState.shakeTimer;
    nebulaTimer = savedGameState.nebulaTimer;
    warpTimer = savedGameState.warpTimer;
    eventTimer = savedGameState.eventTimer;
    powerUpTimer = savedGameState.powerUpTimer;
    obstacleTimer = savedGameState.obstacleTimer;
    supernovaTimer = savedGameState.supernovaTimer;
    orbitShiftTimer = savedGameState.orbitShiftTimer;
    lastPulse = savedGameState.lastPulse;
    gameState = savedGameState.gameState;
    challengeActive = savedGameState.challengeActive;
    challengeTimer = savedGameState.challengeTimer;
    challengeClicks = savedGameState.challengeClicks;
    lastClickTime = savedGameState.lastClickTime;
    inactivityWarning = savedGameState.inactivityWarning;
    inactivityTimer = savedGameState.inactivityTimer;
    mainnetChallengeActive = savedGameState.mainnetChallengeActive;
    mainnetChallengeTimer = savedGameState.mainnetChallengeTimer;
    mainnetChallengeGoal = savedGameState.mainnetChallengeGoal;
    mainnetChallengeScore = savedGameState.mainnetChallengeScore;
    mainnetBadgeEarned = savedGameState.mainnetBadgeEarned;
    mainnetChallengeTriggered = savedGameState.mainnetChallengeTriggered;
    gameStartTime = savedGameState.gameStartTime;
    savedGameState = null;
    if (soundInitialized) backgroundMusic.play();
  } else {
    startGame();
  }
}

function mousePressed() {
  let offsetX = (width - GAME_WIDTH) / 2;
  let offsetY = (height - GAME_HEIGHT) / 2;
  let adjustedMouseX = mouseX - offsetX;
  let adjustedMouseY = mouseY - offsetY;

  if (gameState === "howToPlay") {
    let buttonX = GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2;
    let buttonY = GAME_HEIGHT - 140;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= buttonY &&
      adjustedMouseY <= buttonY + RESTART_BUTTON_HEIGHT
    ) {
      if (savedGameState) {
        resumeGame();
      } else {
        startGame();
      }
    }

    let tutorialButtonX = GAME_WIDTH / 2 - TUTORIAL_MENU_BUTTON_WIDTH / 2;
    let tutorialButtonY = GAME_HEIGHT - 80;
    if (
      adjustedMouseX >= tutorialButtonX &&
      adjustedMouseX <= tutorialButtonX + TUTORIAL_MENU_BUTTON_WIDTH &&
      adjustedMouseY >= tutorialButtonY &&
      adjustedMouseY <= tutorialButtonY + TUTORIAL_MENU_BUTTON_HEIGHT
    ) {
      gameState = "tutorial";
    }

    let colorBoxSize = 50;
    let colorBoxSpacing = 40;
    let totalWidth = (colorBoxSize * 3) + (colorBoxSpacing * 2);
    let startX = (GAME_WIDTH - totalWidth) / 2;
    if (adjustedMouseY >= 120 && adjustedMouseY <= 170) {
      if (adjustedMouseX >= startX && adjustedMouseX <= startX + colorBoxSize) {
        seedColor = { r: 0, g: 255, b: 0 };
      } else if (adjustedMouseX >= startX + colorBoxSize + colorBoxSpacing && 
                 adjustedMouseX <= startX + colorBoxSize * 2 + colorBoxSpacing) {
        seedColor = { r: 0, g: 0, b: 255 };
      } else if (adjustedMouseX >= startX + (colorBoxSize + colorBoxSpacing) * 2 && 
                 adjustedMouseX <= startX + (colorBoxSize + colorBoxSpacing) * 2 + colorBoxSize) {
        seedColor = { r: 255, g: 215, b: 0 };
      }
    }

    if (adjustedMouseY >= 180 && adjustedMouseY <= 230 && adjustedMouseX >= GAME_WIDTH / 2 - 100 && adjustedMouseX <= GAME_WIDTH / 2 + 100) {
      playerNick = "";
      isTypingNick = true;
    } else {
      isTypingNick = false;
    }

  } else if (gameState === "tutorial") {
    let buttonX = GAME_WIDTH / 2 - TUTORIAL_BUTTON_WIDTH / 2;
    let buttonY = GAME_HEIGHT - 80;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + TUTORIAL_BUTTON_WIDTH &&
      adjustedMouseY >= buttonY &&
      adjustedMouseY <= buttonY + TUTORIAL_BUTTON_HEIGHT
    ) {
      startGame();
    }

    if (adjustedMouseX >= 10 && adjustedMouseX <= 110 && adjustedMouseY >= 10 && adjustedMouseY <= 50) {
      gameState = "howToPlay";
    }

  } else if (gameState === "start" || gameState === "win" || gameState === "endgame") {
    if (adjustedMouseX >= 0 && adjustedMouseX <= GAME_WIDTH && adjustedMouseY >= 0 && adjustedMouseY <= GAME_HEIGHT) {
      startGame();
    }
  } else if (gameState === "gameOver") {
    let buttonX = GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2;
    let buttonY = GAME_HEIGHT / 2 + 150;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= buttonY &&
      adjustedMouseY <= buttonY + RESTART_BUTTON_HEIGHT
    ) {
      startGame();
    }
    buttonY = GAME_HEIGHT / 2 + 210;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= buttonY &&
      adjustedMouseY <= buttonY + RESTART_BUTTON_HEIGHT
    ) {
      let shareText = `I synced ${score.toFixed(1)} points in Superseed Cosmic Network! #SuperseedGrok3`;
      navigator.clipboard.writeText(shareText);
      alert("Score copied to clipboard: " + shareText);
    }
    if (mainnetBadgeEarned) {
      let badgeButtonY = GAME_HEIGHT / 2 + 270;
      if (
        adjustedMouseX >= buttonX &&
        adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
        adjustedMouseY >= badgeButtonY &&
        adjustedMouseY <= badgeButtonY + RESTART_BUTTON_HEIGHT
      ) {
        let shareText = `I just unlocked the Superseed Mainnet in the Grok3 Game Contest! Join the challenge and win a Tesla! (virtual:) #SuperseedGrok3 [game link]`;
        navigator.clipboard.writeText(shareText);
        alert("Badge share text copied to clipboard: " + shareText);
      }
    }
  } else if (gameState === "playing" || gameState === "supernova") {
    lastClickTime = millis();
    if (inactivityWarning) inactivityWarning = false;

    let howToX = GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH - 10;
    let howToY = 10;
    if (
      adjustedMouseX >= howToX &&
      adjustedMouseX <= howToX + HOW_TO_PLAY_BUTTON_WIDTH &&
      adjustedMouseY >= howToY &&
      adjustedMouseY <= howToY + HOW_TO_PLAY_BUTTON_HEIGHT
    ) {
      pauseGame();
      return;
    }

    let d = dist(adjustedMouseX, adjustedMouseY, logoX, logoY);
    if (d < circleSize / 2 && isReadyToClick) {
      // Sprawdzamy, czy logo jest zbyt blisko czarnej dziury
      if (activeEvent === "blackHole" && dist(logoX, logoY, eventX, eventY) < 300) {
        // Jeśli logo jest w zasięgu czarnej dziury (300 pikseli), ignorujemy synchronizację
        return;
      }

      // Jeśli logo nie jest w zasięgu czarnej dziury, kontynuujemy synchronizację
      combo += 1;
      comboBar = min(comboBar + 2, 10);
      let multiplier = (powerUpEffect === "gas" || meteorShowerActive || gameState === "supernova") ? 3 : 1;
      if (powerUpCombo === "gas+star") multiplier = 4;
      let basePoints = level <= 2 ? 2 : 1;
      let points = combo * basePoints * multiplier;
      if (activeEvent === "overload") {
        if (eventColor === 2) points += 10;
        else if (eventColor === 1) points -= 5;
        activeEvent = null;
      }
      score += points;
      if (soundInitialized) clickSound.rate(1 + combo * 0.1);
      if (soundInitialized) clickSound.play();
      shakeTimer = 100;
      for (let i = 0; i < 15 + combo * 2; i++) {
        particles.push(new Particle(logoX, logoY, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
      }
      seeds.push(new Seed(random(100, GAME_WIDTH - 100), random(100, GAME_HEIGHT - 100)));
      if (challengeActive) {
        challengeClicks += 1;
      }
      if (mainnetChallengeActive) {
        mainnetChallengeScore += points;
      }
    } else if (d < circleSize / 2) {
      combo = 0;
      comboBar = 0;
      misses += 1;
      if (misses >= (level <= 2 ? 5 : 3) && !shieldActive) {
        lives -= 1;
        lifeBar -= 20;
        misses = 0;
        shakeTimer = 500;
      }
      score -= 5;
      if (score < 0) score = 0;
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(logoX, logoY, { r: 255, g: 0, b: 0 }));
      }
    }

    if (chainPoint && chainPoint.timer > 0) {
      let cd = dist(adjustedMouseX, adjustedMouseY, chainPoint.x, chainPoint.y);
      if (cd < 20) {
        powerUps.push(new PowerUp(chainPoint.x, chainPoint.y));
        chainPoint = null;
        if (soundInitialized) powerUpSound.play();
      }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
      let pd = dist(adjustedMouseX, adjustedMouseY, powerUps[i].x, powerUps[i].y);
      if (pd < powerUps[i].size) {
        if (powerUpEffect && powerUpEffectTime > 0) {
          if (powerUpEffect === "gas" && powerUps[i].type === "star") {
            powerUpCombo = "gas+star";
            powerUpEffectTime = 5000 * (1 + level * 0.1); // Skalowanie dla combo Gas+Star
          }
        }
        if (powerUps[i].type === "life" && lives < 5) {
          lives += 1;
          lifeBar = min(lifeBar + 20, 100);
        } else if (powerUps[i].type === "gas") {
          powerUpEffect = "gas";
          powerUpEffectTime = powerUpDurations.gas * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "pulse" && isReadyToClick) {
          pulseSpeed += 500;
          powerUpEffect = "pulse";
          powerUpEffectTime = powerUpDurations.pulse * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "orbit") {
          powerUpEffect = "orbit";
          shieldActive = true;
          powerUpEffectTime = powerUpDurations.orbit * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "nova" && isReadyToClick) {
          powerUpEffect = "nova";
          freezeActive = true;
          powerUpEffectTime = powerUpDurations.nova * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "meteor") {
          powerUpEffect = "meteor";
          meteorShowerActive = true;
          powerUpEffectTime = powerUpDurations.meteor * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "star") {
          powerUpEffect = "star";
          starBoostActive = true;
          powerUpEffectTime = powerUpDurations.star * (1 + level * 0.1); // Skalowanie z poziomem
        } else if (powerUps[i].type === "wave") {
          obstacles = [];
          for (let j = 0; j < 20; j++) {
            particles.push(new Particle(logoX, logoY, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
          }
        }
        if (powerUps[i].type !== "wave" && powerUps[i].type !== "life") {
          for (let j = 0; j < 20; j++) {
            particles.push(new Particle(powerUps[i].x, powerUps[i].y, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
          }
          if (soundInitialized) powerUpSound.play();
        }
        powerUps.splice(i, 1);
      }
    }
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let od = dist(adjustedMouseX, adjustedMouseY, obstacles[i].x, obstacles[i].y);
      if (od < obstacles[i].size) {
        if (!shieldActive) {
          lives -= 1;
          lifeBar -= 20;
        }
        let obstacleX = obstacles[i].x;
        let obstacleY = obstacles[i].y;
        obstacles.splice(i, 1);
        for (let j = 0; j < 10; j++) {
          particles.push(new Particle(obstacleX, obstacleY, { r: 255, g: 0, b: 0 }));
        }
        if (soundInitialized) meteorSound.play();
      }
    }
  }
}
function keyPressed() {
  if (gameState === "howToPlay") {
    if (isTypingNick) {
      if (key === 'Enter') {
        isTypingNick = false;
      } else if (key === 'Backspace') {
        playerNick = playerNick.slice(0, -1);
      } else if (key.length === 1 && playerNick.length < 15) {
        playerNick += key;
      }
    } else if (key === ' ') {
      if (savedGameState) {
        resumeGame();
      } else {
        startGame();
      }
    }
  } else if (key === ' ' && (gameState === "start" || gameState === "gameOver" || gameState === "win" || gameState === "endgame")) {
    startGame();
  }
  if (key === 'r' || key === 'R') {
    console.log("Record 30s manually – no GIF library available!");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}