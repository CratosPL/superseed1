// Global Variables
let logo;
let whiteLogo;
let smallSuperseedIntro; 
let clickSound;
let backgroundMusic;
let introMusic;
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
let upadekBg; // Przeniesione tutaj
let synchronizacjaBg; // Przeniesione tutaj
let nagrodaBg; // Przeniesione tutaj
let isConnecting = false;


let hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true'; // Czy intro już widziane
let introState = 0; // Aktualny ekran intro (0, 1, 2)
let introTimer = 0; // Timer do przechodzenia między ekranami
let introDuration = 30000;
let teslaImage; // Opcjonalna sylwetka Tesli dla sceny 3

let powerUpDurations = {
  gas: 5000,
  pulse: 4000,
  orbit: 6000,
  nova: 5000,
  meteor: 6000,
  star: 5000
};

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


// Globalne zmienne dla Web3Modal i ethers.js
let provider;
let signer;
let userAddress;
let isConnected = false;
let connectionError = null;
let web3Modal;

// Konfiguracja sieci Superseed Sepolia Testnet
const superseedSepolia = {
  chainId: "0xD036", // Poprawiono na 53302 w hex (było 0xD05E, czyli 53342)
  chainName: "Superseed Sepolia Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia.superseed.xyz"],
  blockExplorerUrls: ["https://sepolia-explorer.superseed.xyz"],
};

// Funkcja czekająca na załadowanie skryptów z debugowaniem
function waitForScripts() {
  return new Promise((resolve) => {
    console.log("Checking scripts for mobile...");
    console.log("ethers:", typeof window.ethers, window.ethers);
    console.log("Web3Modal:", typeof window.Web3Modal, window.Web3Modal);
    console.log("WalletConnectProvider:", typeof window.WalletConnectProvider, window.WalletConnectProvider);

    if (!window.ethers) console.warn("ethers.js not loaded");
    if (!window.Web3Modal) console.warn("Web3Modal not loaded");
    if (!window.WalletConnectProvider) console.warn("WalletConnectProvider not loaded");

    if (window.Web3Modal && window.WalletConnectProvider && window.ethers) {
      console.log("All scripts loaded");
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.Web3Modal && window.WalletConnectProvider && window.ethers) {
          console.log("Scripts loaded after interval");
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        console.error("Scripts failed to load after 10s");
        connectionError = "Required scripts failed to load";
        resolve();
      }, 10000);
    }
  });
}

// Inicjalizacja Web3Modal
function initializeWeb3Modal() {
  if (!window.Web3Modal || !window.WalletConnectProvider) {
    console.error("Web3Modal or WalletConnectProvider missing");
    connectionError = "Wallet libraries not loaded";
    return;
  }

  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider,
      options: {
        rpc: {
          53302: "https://sepolia.superseed.xyz",
        },
        qrcode: true, // Explicitly enable QR code for mobile
        qrcodeModalOptions: {
          mobileLinks: ["metamask", "trust", "rainbow"], // Popular mobile wallets
        },
      },
    },
  };
  // Sprawdzamy, czy Web3Modal jest konstruktorem, czy obiektem
  if (typeof window.Web3Modal === "function") {
    try {
      web3Modal = new window.Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
      });
      console.log("Web3Modal initialized for mobile");
    } catch (error) {
      console.error("Web3Modal init failed:", error);
      connectionError = "Web3Modal failed: " + error.message;
    }
  } else if (typeof window.Web3Modal === "object" && window.Web3Modal.default) {
    // Jeśli Web3Modal jest obiektem z domyślnym eksportem (np. w nowszych wersjach)
    try {
      web3Modal = new window.Web3Modal.default({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
      });
      console.log("Web3Modal initialized successfully using default export");
    } catch (error) {
      console.error("Failed to initialize Web3Modal with default export:", error);
    }
  } else {
    console.error("Web3Modal is neither a constructor nor has a default export, type:", typeof window.Web3Modal, "value:", window.Web3Modal);
    return;
  }
}

// Funkcja do połączenia z portfelem
async function connectWallet(forceReconnect = false) {
  if (isConnecting) {
    console.log("Connection already in progress, please wait...");
    return;
  }
  isConnecting = true;
  try {
    console.log("Starting wallet connection...");

    if (!web3Modal) {
      console.log("Web3Modal not initialized, initializing now...");
      await initializeWeb3Modal();
    }
    if (!web3Modal) throw new Error("Web3Modal failed to initialize");

    if (forceReconnect) {
      console.log("Clearing cached provider...");
      web3Modal.clearCachedProvider();
      localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      localStorage.removeItem("walletconnect");
      isConnected = false;
      userAddress = null;
      provider = null;
      signer = null;
    }

    console.log("Attempting to connect with Web3Modal...");
    const instance = await Promise.race([
      web3Modal.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timed out after 20s")), 20000)),
    ]);

    console.log("Connected instance:", instance);

    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log("Accounts:", await provider.listAccounts());
    isConnected = true;

    const network = await provider.getNetwork();
    console.log("Current network chainId:", network.chainId);
    if (network.chainId !== 53302) {
      console.log("Switching to Superseed Sepolia Testnet...");
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0xD036" }]);
    }

    console.log("Connected to wallet:", userAddress);
    connectionError = null;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    isConnected = false;
    userAddress = null;
    provider = null;
    signer = null;
    connectionError = "Failed to connect wallet: " + error.message;
  } finally {
    isConnecting = false;
  }
}

// Poprawiona inicjalizacja Web3Modal
async function initializeWeb3Modal() {
  await waitForScripts();
  if (!window.Web3Modal || !window.WalletConnectProvider) {
    console.error("Web3Modal or WalletConnectProvider missing");
    connectionError = "Wallet libraries not loaded";
    return;
  }

  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default, // Używamy default jako konstruktora
      options: {
        rpc: {
          53302: "https://sepolia.superseed.xyz",
        },
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: ["metamask", "trust", "rainbow"],
        },
      },
    },
    injected: {
      package: null, // Dla MetaMask
    },
  };

  try {
    if (typeof window.Web3Modal === "function") {
      web3Modal = new window.Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
      });
      console.log("Web3Modal initialized as constructor");
    } else if (window.Web3Modal && typeof window.Web3Modal.default === "function") {
      web3Modal = new window.Web3Modal.default({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
      });
      console.log("Web3Modal initialized using default export");
    } else {
      throw new Error("Web3Modal is not a constructor or has no default export");
    }

    // Sprawdzenie, czy WalletConnectProvider.default jest funkcją
    if (typeof window.WalletConnectProvider.default !== "function") {
      throw new Error("WalletConnectProvider.default is not a constructor");
    }
  } catch (error) {
    console.error("Web3Modal initialization failed:", error);
    connectionError = "Web3Modal init failed: " + error.message;
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
  smallSuperseedIntro = loadImage('assets/smallsuperseedintro.png');
  cosmicMenuBg = loadImage('assets/cosmicMenuBg.png'); // Nowe tło
  mainLogo = loadImage('assets/superseedcosmicnet-gamelogo.png'); // Nowe główne logo
  clickSound = loadSound('assets/background-beat.wav');
  backgroundMusic = loadSound('assets/background-music.mp3');
  backgroundMusic2 = loadSound('assets/background-music2.mp3');
  introMusic = loadSound('assets/intro1.mp3'); // Nowa muzyka intro
  powerUpSound = loadSound('assets/power-up.mp3');
  meteorSound = loadSound('assets/meteor-hit.mp3');
  levelSound = loadSound('assets/level-up.mp3');
  warpSound = loadSound('assets/warp-transition.mp3');
  nebulaSound = loadSound('assets/nebula-burst.mp3');
  holeSound = loadSound('assets/hole.mp3');
  upadekBg = loadImage('assets/upadek-background.png');
  synchronizacjaBg = loadImage('assets/synchronizacja-background.png');
  nagrodaBg = loadImage('assets/nagroda-background.png');
}

// Poprawiony setup() – bez async, wywołanie asynchroniczne w tle
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, { willReadFrequently: true });
  let scaleFactor = min(windowWidth / 1200, windowHeight / 1000);
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
  backgroundMusic.setVolume(0.5);
  backgroundMusic2.setVolume(0.5);
  introMusic.setVolume(0.6);
  powerUpSound.setVolume(0.5);
  meteorSound.setVolume(0.5);
  levelSound.setVolume(0.5);
  warpSound.setVolume(0.5);
  nebulaSound.setVolume(0.5);
  let savedLeaderboard = localStorage.getItem('leaderboard');
  leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
  lastClickTime = millis();

  hasSeenIntro = false;
  gameState = "intro";
  introTimer = millis();
  if (!soundInitialized) {
    introMusic.loop();
    soundInitialized = true;
  }

  // Resetowanie stanu Web3Modal
  isConnected = false;
  userAddress = null;
  provider = null;
  signer = null;
  connectionError = null;

  // Inicjalizacja Web3Modal w tle
  waitForScripts().then(() => {
    initializeWeb3Modal();
    if (web3Modal && web3Modal.cachedProvider) {
      
    }
  });
}

async function initWeb3() {
  try {
    await waitForScripts();
    initializeWeb3Modal();
    if (web3Modal && web3Modal.cachedProvider) {
      await connectWallet();
    } else {
      console.log("No cached provider, waiting for user login");
    }
  } catch (error) {
    console.error("Web3 initialization failed:", error);
    connectionError = "Web3 initialization failed: " + error.message;
  }
}



function touchStarted() {
  if (!soundInitialized) {
    soundInitialized = true;
    backgroundMusic.loop();
  }
  let adjustedTouchX = mouseX - (width - GAME_WIDTH) / 2; // mouseX is updated by p5.js for touch
  let adjustedTouchY = mouseY - (height - GAME_HEIGHT) / 2;

  if (gameState === "howToPlay" && !isConnected) {
    if (
      adjustedTouchX >= GAME_WIDTH / 2 - 100 &&
      adjustedTouchX <= GAME_WIDTH / 2 + 100 &&
      adjustedTouchY >= 480 &&
      adjustedTouchY <= 530
    ) {
      console.log("Touch login initiated on mobile");
      connectWallet(true).then(() => {
        if (isConnected) {
          console.log("Wallet connected successfully via touch");
        } else {
          console.log("Wallet connection failed via touch");
        }
      }).catch((error) => {
        console.error("Touch connectWallet error:", error);
        connectionError = "Touch connection failed: " + error.message;
      });
    }
  }
  mousePressed(); // Keep existing mouse logic
  return false; // Prevent default touch behavior
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


  
  // Nowy stan preIntro
  if (gameState === "preIntro") {
    drawBackground(0);
    fill(255);
    textSize(40);
    textStyle(BOLD);
    text("Witaj w Superseed Cosmic Network", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    textSize(24);
    text("Kliknij gdziekolwiek, aby rozpocząć", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
    return;
  }

  // Istniejący stan intro
  if (gameState === "intro") {
    drawBackground(0);

    for (let i = bgParticles.length - 1; i >= 0; i--) {
      bgParticles[i].update();
      bgParticles[i].show(0);
    }

    push();
    translate((width - GAME_WIDTH) / 2, (height - GAME_HEIGHT) / 2);

    // Zarządzanie dźwiękiem
  if (soundInitialized) {
    if (!introMusic.isPlaying()) {
      introMusic.loop();
    }
  }

    // Odtwarzaj muzykę intro, gdy dźwięk jest zainicjalizowany
    if (!introMusic.isPlaying() && soundInitialized) {
      introMusic.loop();
    }

// Wykrywanie urządzenia na podstawie szerokości ekranu
let isMobile = GAME_WIDTH < 768; // Próg dla urządzeń mobilnych (możesz dostosować)
let originalWidth = 1200; // Rzeczywista szerokość obrazów (dostosuj)
let originalHeight = 1000; // Rzeczywista wysokość obrazów (dostosuj)
let aspectRatio = originalWidth / originalHeight;

    // Scene 1: "The Fall"
  if (introState === 0) {
    if (isMobile) {
      // Na telefonie: zachowaj proporcje i przytnij
      let bgWidth, bgHeight, bgX, bgY;
      if (GAME_WIDTH / GAME_HEIGHT > aspectRatio) {
        bgHeight = GAME_HEIGHT;
        bgWidth = bgHeight * aspectRatio;
        bgX = (GAME_WIDTH - bgWidth) / 2;
        bgY = 0;
      } else {
        bgWidth = GAME_WIDTH;
        bgHeight = bgWidth / aspectRatio;
        bgX = 0;
        bgY = (GAME_HEIGHT - bgHeight) / 2;
      }
      image(upadekBg, bgX, bgY, bgWidth, bgHeight);
    } else {
      // Na komputerze: pełne rozciąganie
      image(upadekBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    let logoPulse = lerp(50, 100, sin(currentTime * 0.002));
    tint(255, 200);
    image(logo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoPulse, logoPulse);
    fill(255, 200);
    textSize(isMobile ? 18 : 24); // Mniejszy tekst na telefonie
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(
      "In a galaxy bound by centralized chains,\nthe old networks fell silent.\nOne seed remained – a spark of hope.",
      GAME_WIDTH / 2,
      GAME_HEIGHT - (isMobile ? 100 : 150) // Mniejszy odstęp na telefonie
    );
  }
  // Scene 2: "Call to Sync"
  else if (introState === 1) {
    if (isMobile) {
      let bgWidth, bgHeight, bgX, bgY;
      if (GAME_WIDTH / GAME_HEIGHT > aspectRatio) {
        bgHeight = GAME_HEIGHT;
        bgWidth = bgHeight * aspectRatio;
        bgX = (GAME_WIDTH - bgWidth) / 2;
        bgY = 0;
      } else {
        bgWidth = GAME_WIDTH;
        bgHeight = bgWidth / aspectRatio;
        bgX = 0;
        bgY = (GAME_HEIGHT - bgHeight) / 2;
      }
      image(synchronizacjaBg, bgX, bgY, bgWidth, bgHeight);
    } else {
      image(synchronizacjaBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    let logoPulse = lerp(minSize, maxSize, sin(currentTime * 0.002));
    tint(seedColor.r, seedColor.g, seedColor.b, 200);
    image(logo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoPulse, logoPulse);
    for (let i = 0; i < 4; i++) {
      let angle = TWO_PI / 4 * i + currentTime * 0.001;
      let orbitRadius = isMobile ? min(100, GAME_WIDTH * 0.15) : 150;
      let px = GAME_WIDTH / 2 + cos(angle) * orbitRadius;
      let py = GAME_HEIGHT / 2 + sin(angle) * orbitRadius;
      let p = new PowerUp(px, py);
      p.type = ["life", "gas", "pulse", "orbit"][i];
      p.show();
    }
    // Dodajemy obrys dla lepszej widoczności
    stroke(14, 39, 59); // Ciemny kolor Tangaroa (#0E273B) dla obrysu
    strokeWeight(2);    // Subtelny obrys o grubości 1 piksel
    fill(93, 208, 207); // Wypełnienie pozostaje bez zmian
    textSize(isMobile ? 18 : 24);
    textStyle(BOLD);    // Opcjonalnie: pogrubienie dla dodatkowego kontrastu
    text(
      "You’ve been chosen to awaken the Superseed Mainnet.\nSync cosmic nodes, harness power-ups,\nand forge a decentralized future – orbit by orbit.",
      GAME_WIDTH / 2,
      GAME_HEIGHT - (isMobile ? 100 : 150)
    );
    noStroke(); // Wyłączamy obrys po tekście, aby nie wpływał na inne elementy
  }
  // Scene 3: "The Reward Awaits" – NFT jako karta z obracającym się logo i nazwą gry
  else if (introState === 2) {
    if (isMobile) {
      let bgWidth, bgHeight, bgX, bgY;
      if (GAME_WIDTH / GAME_HEIGHT > aspectRatio) {
        bgHeight = GAME_HEIGHT;
        bgWidth = bgHeight * aspectRatio;
        bgX = (GAME_WIDTH - bgWidth) / 2;
        bgY = 0;
      } else {
        bgWidth = GAME_WIDTH;
        bgHeight = bgWidth / aspectRatio;
        bgX = 0;
        bgY = (GAME_HEIGHT - bgHeight) / 2;
      }
      image(nagrodaBg, bgX, bgY, bgWidth, bgHeight);
    } else {
      image(nagrodaBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Cząsteczki wokół karty
    if (random(1) < 0.2) {
      particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();
      if (particles[i].isDead()) particles.splice(i, 1);
    }

    // Logo Superseed (whiteLogo) na górze
    let logoWidth = isMobile ? min(200, GAME_WIDTH * 0.4) : 300;
    let logoHeight = logoWidth / 2;
    image(whiteLogo, GAME_WIDTH / 2 - logoWidth / 2, isMobile ? 30 : 50, logoWidth, logoHeight);

    // Karta NFT – Superseed Cosmic Core
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    rotate(sin(currentTime * 0.001) * 0.1);
    let pulseScale = 1 + sin(currentTime * 0.005) * 0.05;

    let cardWidth = (isMobile ? min(200, GAME_WIDTH * 0.5) : 300) * pulseScale;
    let cardHeight = cardWidth * 1.5;

    let gradient = drawingContext.createLinearGradient(-cardWidth / 2, -cardHeight / 2, cardWidth / 2, cardHeight / 2);
    gradient.addColorStop(0, `rgba(${seedColor.r}, ${seedColor.g}, ${seedColor.b}, 0.8)`);
    gradient.addColorStop(1, "rgba(14, 39, 59, 0.9)");
    drawingContext.fillStyle = gradient;
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = `rgba(255, 215, 0, 0.5)`;
    rect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);

    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(4);
    rect(-cardWidth / 2 + 5, -cardHeight / 2 + 5, cardWidth - 10, cardHeight - 10, 15);
    stroke(seedColor.r, seedColor.g, seedColor.b, 150);
    strokeWeight(2);
    rect(-cardWidth / 2 + 10, -cardHeight / 2 + 10, cardWidth - 20, cardHeight - 20, 10);

    push();
    translate(0, -50);
    rotate(currentTime * 0.001);
    tint(255, 215, 0, 200);
    imageMode(CENTER);
    image(smallSuperseedIntro, 0, 0, cardWidth * 0.7, cardWidth * 0.7);
    pop();

    noFill();
    stroke(93, 208, 207, 100);
    strokeWeight(1);
    for (let i = 0; i < 5; i++) {
      let y = map(i, 0, 4, -cardHeight / 2 + 20, cardHeight / 2 - 20);
      line(-cardWidth / 2 + 20, y, cardWidth / 2 - 20, y);
    }

    stroke(14, 39, 59, 200);
    strokeWeight(1);
    fill(147, 208, 207);
    textSize(isMobile ? 12 : 16);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text("Superseed Cosmic Network", 0, cardHeight / 2 - 90);

    stroke(14, 39, 59, 200);
    strokeWeight(1);
    fill(255, 215, 0);
    textSize(isMobile ? 18 : 24);
    textStyle(BOLD);
    text("Superseed Cosmic Core", 0, cardHeight / 2 - 60);

    stroke(14, 39, 59, 200);
    strokeWeight(1);
    fill(255, 255, 255, 150);
    textSize(isMobile ? 12 : 16);
    text("NFT", 0, cardHeight / 2 - 30);

    drawingContext.shadowBlur = 0;
    noStroke();
    pop();

    stroke(14, 39, 59, 200); // Obrys w kolorze Tangaroa dla kontrastu
  strokeWeight(3);         // Grubszy obrys (z 1.5 na 2) dla lepszej widoczności
  fill(255, 245, 102);     // Jasny żółty (#FFF566) bez zmian
  textSize(isMobile ? 18 : 24);
  textStyle(BOLD);         // Pogrubienie dla lepszej widoczności
  textAlign(CENTER, CENTER);
  text(
    "Reach Orbit 10, sync the Mainnet,\nand claim your Superseed Cosmic Core NFT\non the Supersync Network!",
    GAME_WIDTH / 2,
    GAME_HEIGHT - (isMobile ? 100 : 150)
  );
  noStroke();

    stroke(14, 39, 59, 200);
    strokeWeight(1);
    fill(147, 208, 207);
    textSize(isMobile ? 12 : 16);
    text("#SuperseedGrok3", GAME_WIDTH / 2, GAME_HEIGHT - (isMobile ? 30 : 50));
    noStroke();
  }

  // Add "NEXT" button
  let nextButtonX = GAME_WIDTH - 100;
  let nextButtonY = GAME_HEIGHT - 50;
  fill(93, 208, 207);
  rect(nextButtonX, nextButtonY, 80, 30, 5);
  fill(255);
  textSize(16);
  text("NEXT", nextButtonX + 40, nextButtonY + 15);

  // Display remaining time
  let timeLeft = introDuration - (currentTime - introTimer);
  fill(255, 200);
  textSize(16);
  text(`${floor(timeLeft / 1000)}s`, GAME_WIDTH / 2, 50);

  pop();

  // Automatyczne przejście
  if (currentTime - introTimer > introDuration) {
    introState++;
    introTimer = currentTime;
    if (introState > 2) {
      gameState = "howToPlay";
      introState = 0;
      if (soundInitialized) {
        introMusic.stop();
        backgroundMusic.loop();
      }
      if (!hasSeenIntro) {
        localStorage.setItem('hasSeenIntro', 'true');
        hasSeenIntro = true;
      }
    }
    if (soundInitialized && introState <= 2) warpSound.play();
  }
  return;
}

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
  // Wczytanie tła z subtelnym rozmyciem
  drawingContext.filter = 'blur(5px)';
  image(cosmicMenuBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawingContext.filter = 'none';

  // Winietka i overlay gradientu (bez zmian)
  let vignette = drawingContext.createRadialGradient(
    GAME_WIDTH / 2, 
    GAME_HEIGHT / 2, 
    0, 
    GAME_WIDTH / 2, 
    GAME_HEIGHT / 2, 
    Math.max(GAME_WIDTH, GAME_HEIGHT) / 2
  );
  vignette.addColorStop(0, "rgba(14, 39, 59, 0)");
  vignette.addColorStop(1, "rgba(14, 39, 59, 0.7)");
  drawingContext.fillStyle = vignette;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);

  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "rgba(14, 39, 59, 0.6)");
  gradient.addColorStop(1, "rgba(93, 208, 207, 0.4)");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);

  // Większe pulsujące logo na górze
  let logoScale = 1 + sin(millis() * 0.002) * 0.05; // Subtelne pulsowanie
  let logoSize = 400 * logoScale; // Zwiększono z 300 do 400
  image(mainLogo, GAME_WIDTH / 2 - logoSize / 2, 30, logoSize, logoSize); // Pozycja Y bez zmian

  // Przesunięcie wszystkich elementów w dół o 100 pikseli (możesz dostosować wartość)
  let verticalOffset = 100;

  // Choose Your Seed Color
  fill(249, 249, 242);
  textSize(24);
  text("Choose Your Seed Color", GAME_WIDTH / 2, 320 + verticalOffset);
  let colorBoxSize = 60;
  let colorBoxSpacing = 30;
  let startX = GAME_WIDTH / 2 - (colorBoxSize * 3 + colorBoxSpacing * 2) / 2;
  let pulse = 1 + sin(millis() * 0.005) * 0.1;

  fill(0, 255, 0);
  rect(startX, 350 + verticalOffset, colorBoxSize, colorBoxSize, 15);
  fill(0, 0, 255);
  rect(startX + colorBoxSize + colorBoxSpacing, 350 + verticalOffset, colorBoxSize, colorBoxSize, 15);
  fill(255, 215, 0);
  rect(startX + (colorBoxSize + colorBoxSpacing) * 2, 350 + verticalOffset, colorBoxSize, colorBoxSize, 15);

  stroke(147, 208, 207);
  strokeWeight(3);
  noFill();
  if (seedColor.r === 0 && seedColor.g === 255 && seedColor.b === 0) {
    rect(startX, 350 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  } else if (seedColor.r === 0 && seedColor.g === 0 && seedColor.b === 255) {
    rect(startX + colorBoxSize + colorBoxSpacing, 350 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  } else if (seedColor.r === 255 && seedColor.g === 215 && seedColor.b === 0) {
    rect(startX + (colorBoxSize + colorBoxSpacing) * 2, 350 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  }
  noStroke();

  // Enter Your Nick
  fill(249, 249, 242);
  textSize(24);
  text("Enter Your Nick", GAME_WIDTH / 2, 450 + verticalOffset);
  fill(128, 131, 134, 180);
  stroke(147, 208, 207);
  strokeWeight(3);
  rect(GAME_WIDTH / 2 - 120, 470 + verticalOffset, 240, 50, 10);
  fill(249, 249, 242);
  textSize(20);
  textAlign(CENTER, CENTER);
  if (isTypingNick) {
    let cursor = (floor(millis() / 500) % 2 === 0) ? "|" : "";
    text(playerNick + cursor, GAME_WIDTH / 2, 495 + verticalOffset);
  } else {
    text(playerNick || "Click to type", GAME_WIDTH / 2, 495 + verticalOffset);
  }
  noStroke();

  // Start Button
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 120, 540 + verticalOffset, GAME_WIDTH / 2 + 120, 540 + verticalOffset);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  stroke(147, 208, 207);
  strokeWeight(3);
  rect(GAME_WIDTH / 2 - 120, 540 + verticalOffset, 240, 60, 15);
  noStroke();
  fill(14, 39, 59);
  textSize(28);
  let buttonText = savedGameState ? "RESUME" : "START";
  text(buttonText, GAME_WIDTH / 2, 570 + verticalOffset);

  // Login/Logout Button
  if (!isConnected) {
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 120, 620 + verticalOffset, GAME_WIDTH / 2 + 120, 620 + verticalOffset);
    gradient.addColorStop(0, "#0E273B");
    gradient.addColorStop(1, "#808386");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(3);
    rect(GAME_WIDTH / 2 - 120, 620 + verticalOffset, 240, 60, 15);
    noStroke();
    fill(249, 249, 242);
    textSize(28);
    text("LOGIN", GAME_WIDTH / 2, 650 + verticalOffset);
  } else {
    fill(93, 208, 207);
    textSize(18);
    text(`Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`, GAME_WIDTH / 2, 620 + verticalOffset);
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 120, 660 + verticalOffset, GAME_WIDTH / 2 + 120, 660 + verticalOffset);
    gradient.addColorStop(0, "#FF4500");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(3);
    rect(GAME_WIDTH / 2 - 120, 660 + verticalOffset, 240, 60, 15);
    noStroke();
    fill(249, 249, 242);
    textSize(28);
    text("LOGOUT", GAME_WIDTH / 2, 690 + verticalOffset);
  }

  // Komunikat o wersji desktopowej
  fill(255, 50, 50, 255); // Brighter red, fully opaque
textSize(32); // Larger text for readability
textStyle(BOLD);
drawingContext.shadowBlur = 0; // Disable blur for this text
text("NOTICE: Desktop only for now", GAME_WIDTH / 2, 770 + verticalOffset);
  fill(255, 215, 0, 200);
  textSize(16);
  text("Mobile version coming soon!", GAME_WIDTH / 2, 800 + verticalOffset);
  
    // Wyświetlanie komunikatu o błędzie lub prośbie o zalogowanie
    if (showLoginMessage) {
      let elapsed = millis() - loginMessageStartTime;
      if (elapsed < loginMessageDuration) {
        fill(255, 0, 0, 220);
        textSize(20);
        text("Please log in to start the game", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 170);
      } else {
        showLoginMessage = false;
      }
    }
  
    // Przyciski boczne (INFO, TUTORIAL, VIEW INTRO) – bardziej nowoczesne
    let sideButtonWidth = 120;
    let sideButtonHeight = 50;
    let sideButtonX = GAME_WIDTH - sideButtonWidth - 20;
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 200, sideButtonX + sideButtonWidth, 200);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 200, sideButtonWidth, sideButtonHeight, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(20);
    text("INFO", sideButtonX + sideButtonWidth / 2, 225);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 260, sideButtonX + sideButtonWidth, 260);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 260, sideButtonWidth, sideButtonHeight, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(20);
    text("TUTORIAL", sideButtonX + sideButtonWidth / 2, 285);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 320, sideButtonX + sideButtonWidth, 320);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 320, sideButtonWidth, sideButtonHeight, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(20);
    text("VIEW INTRO", sideButtonX + sideButtonWidth / 2, 345);
  
    /// WhiteLogo w lewym dolnym rogu z miganiem i napisem
    let whiteLogoScale = 1 + sin(millis() * 0.003) * 0.05;
    let whiteLogoWidth = 100 * whiteLogoScale;
    let whiteLogoHeight = 50 * whiteLogoScale;
    let whiteLogoX = 20;
    let whiteLogoY = GAME_HEIGHT - 100; // Przesunięte z -60 na -100 dla większego odstępu
    image(whiteLogo, whiteLogoX, whiteLogoY, whiteLogoWidth, whiteLogoHeight);
  
    // Mały napis pod logo – dostosowany do nowej pozycji
    fill(147, 208, 207, 200); // Superseed Light Green z lekką przezroczystością
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    text("Powered by Superseed", whiteLogoX, whiteLogoY + whiteLogoHeight + 5);
  
    textAlign(CENTER, BASELINE); // Reset wyrównania tekstu

// Informacja o twórcy w prawym dolnym rogu z efektem hover
let adjustedMouseX = mouseX - (width - GAME_WIDTH) / 2;
let adjustedMouseY = mouseY - (height - GAME_HEIGHT) / 2;
let creatorTextX = GAME_WIDTH - 140; // Początek tekstu
let creatorTextY = GAME_HEIGHT - 30; // Góra obszaru tekstu
let creatorTextWidth = 120; // Przybliżona szerokość tekstu
let creatorTextHeight = 20; // Wysokość obszaru klikalnego
if (
  adjustedMouseX >= creatorTextX &&
  adjustedMouseX <= creatorTextX + creatorTextWidth &&
  adjustedMouseY >= creatorTextY &&
  adjustedMouseY <= creatorTextY + creatorTextHeight
) {
  fill(255, 215, 0, 200); // Złoty kolor przy najechaniu (#FFD700)
} else {
  fill(147, 208, 207, 200); // Standardowy Superseed Light Green
}
textSize(12);
textStyle(NORMAL);
textAlign(RIGHT, BOTTOM);
text("Created by CratosPL", GAME_WIDTH - 20, GAME_HEIGHT - 10);

  }

else if (gameState === "info") {
  // Gradient tła z trzema kolorami i zaokrąglonymi rogami (spójny z tutorialem)
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B"); // Tangaroa
  gradient.addColorStop(0.5, "#93D0CF"); // Morning Glory
  gradient.addColorStop(1, "#808386"); // Aluminium
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);

  // Pulsujące obramowanie (jak w tutorialu)
  let pulseProgress = sin(millis() * 0.002) * 0.5 + 0.5;
  stroke(93, 208, 207, map(pulseProgress, 0, 1, 100, 255));
  strokeWeight(5 + pulseProgress * 2);
  noFill();
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  noStroke();

  // Gwiazdki w tle (dynamiczne tło jak w tutorialu)
  for (let i = bgParticles.length - 1; i >= 0; i--) {
    bgParticles[i].update();
    bgParticles[i].show(pulseProgress); // Użycie pulseProgress dla spójności
  }

  // Nagłówek (mniejszy i bardziej elegancki)
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 150, 50, GAME_WIDTH / 2 + 150, 50);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  textSize(36); // Zmniejszono z 48 dla harmonii
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Game Info", GAME_WIDTH / 2, 70);

  // Sekcja Scoring
  let sectionY = 120;
  fill(14, 39, 59, 230); // Tangaroa z lekką przezroczystością
  stroke(147, 208, 207); // Superseed Light Green
  strokeWeight(3);
  rect(100, sectionY, GAME_WIDTH - 200, 120, 20); // Zmniejszona wysokość
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 100, sectionY + 20, GAME_WIDTH / 2 + 100, sectionY + 20);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  textSize(24);
  textStyle(BOLD);
  text("Scoring", GAME_WIDTH / 2, sectionY + 30);
  fill(249, 249, 242); // White (#F9F9F2)
  textSize(14); // Zmniejszono z 18 dla elegancji
  textStyle(NORMAL);
  text("Sync the Cosmic Seed when it pulses green!\nStart is easy – sync nodes slowly on Orbit 1 & 2!", GAME_WIDTH / 2, sectionY + 70);
  noStroke();

  // Sekcja Combos
  sectionY += 150; // Większy odstęp
  fill(14, 39, 59, 230);
  stroke(147, 208, 207);
  strokeWeight(3);
  rect(100, sectionY, GAME_WIDTH - 200, 120, 20);
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 100, sectionY + 20, GAME_WIDTH / 2 + 100, sectionY + 20);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  textSize(24);
  textStyle(BOLD);
  text("Combos", GAME_WIDTH / 2, sectionY + 30);
  fill(249, 249, 242);
  textSize(14);
  textStyle(NORMAL);
  text("Chain syncs for multipliers (x1, x2, ...).\n15+ syncs grants +1 life.", GAME_WIDTH / 2, sectionY + 70);
  noStroke();

  // Sekcja Power-Ups (jedna kolumna z animacjami)
  sectionY += 150;
  fill(14, 39, 59, 230);
  stroke(147, 208, 207);
  strokeWeight(3);
  rect(100, sectionY, GAME_WIDTH - 200, 400, 20); // Zwiększona wysokość dla jednej kolumny
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 200, sectionY + 20, GAME_WIDTH / 2 + 200, sectionY + 20);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  textSize(24);
  textStyle(BOLD);
  text("Power-Ups (click to activate)", GAME_WIDTH / 2, sectionY + 30);
  textSize(14);
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);

  let mx = mouseX - (width - GAME_WIDTH) / 2;
  let my = mouseY - (height - GAME_HEIGHT) / 2;

  // Ikony Power-Ups z animacjami
  let iconY = sectionY + 70;
  let iconSpacing = 50;

  // 1. Life
  push();
  translate(150, iconY);
  let gradientLife = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 20);
  gradientLife.addColorStop(0, "rgb(255, 255, 255)");
  gradientLife.addColorStop(1, "rgb(0, 255, 0)");
  drawingContext.fillStyle = gradientLife;
  star(0, 0, 15, 25 + sin(millis() * 0.005) * 5, 8); // Pulsująca animacja
  pop();
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Life: +1 Life", 220, iconY);

  // 2. Gas Nebula
  iconY += iconSpacing;
  noFill();
  stroke(0, 191, 255, 200);
  strokeWeight(3);
  for (let i = 0; i < 4; i++) {
    arc(150, iconY, 25 * (i + 1) / 4, 25 * (i + 1) / 4, 0, PI + i * HALF_PI + millis() * 0.001); // Lekka rotacja
  }
  noStroke();
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Gas Nebula: x2 Points (3s)", 220, iconY);

  // 3. Pulse Wave
  iconY += iconSpacing;
  noFill();
  let pulse = (millis() % 1000) / 1000;
  stroke(147, 208, 207, 200);
  strokeWeight(3);
  ellipse(150, iconY, 40 * pulse); // Pulsująca fala
  noStroke();
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Pulse Wave: Boost Pulse (3s)", 220, iconY);

  // 4. Orbit Shield
  iconY += iconSpacing;
  fill(255, 215, 0, 150);
  ellipse(150, iconY, 40 + sin(millis() * 0.005) * 5); // Pulsowanie
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  for (let i = -1; i <= 1; i++) {
    line(150 + i * 15, iconY - 20, 150 + i * 15, iconY + 20);
  }
  noStroke();
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Orbit Shield: Blocks Damage (3s) [Lv3+]", 220, iconY);

  // 5. Freeze Nova
  iconY += iconSpacing;
  fill(0, 255, 255, 200 + sin(millis() * 0.01) * 55);
  star(150, iconY, 20, 30, 6); // Pulsujący kryształ
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Freeze Nova: Freezes Pulse (3s) [Lv3+]", 220, iconY);

  // 6. Star Seed
  iconY += iconSpacing;
  fill(147, 208, 207, 200);
  ellipse(150, iconY, 40, 25 + sin(millis() * 0.005) * 5); // Pulsowanie
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Star Seed: Bigger Seed (3s) [Lv5+]", 220, iconY);

  // 7. Mainnet Wave
  iconY += iconSpacing;
  gradient = drawingContext.createLinearGradient(135, iconY, 165, iconY);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  beginShape();
  for (let i = 0; i < 6; i++) {
    let a = TWO_PI / 6 * i;
    vertex(150 + cos(a) * (20 + sin(millis() * 0.005) * 5), iconY + sin(a) * 20); // Pulsowanie
  }
  endShape(CLOSE);
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Mainnet Wave: Clears Traps [Lv7+]", 220, iconY);

  // Sekcja Traps
  sectionY += 450; // Większy odstęp
  fill(14, 39, 59, 230);
  stroke(147, 208, 207);
  strokeWeight(3);
  rect(100, sectionY, GAME_WIDTH - 200, 150, 20); // Zwiększona wysokość dla dwóch elementów
  gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 100, sectionY + 20, GAME_WIDTH / 2 + 100, sectionY + 20);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  textSize(24);
  textStyle(BOLD);
  text("Traps", GAME_WIDTH / 2, sectionY + 30);
  textSize(14);
  textStyle(NORMAL);

  // 1. Avoid Meteor Strikes
  iconY = sectionY + 70;
  fill(255, 0, 0, 200);
  ellipse(150, iconY, 30 + sin(millis() * 0.005) * 5); // Pulsowanie
  stroke(255, 100);
  strokeWeight(2);
  line(135, iconY - 15, 165, iconY + 15);
  noStroke();
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Avoid Meteor Strikes: 5 misses = -1 life", 220, iconY);

  // 2. Meteor Strike
  iconY += iconSpacing;
  fill(255, 100, 0, 200);
  ellipse(150, iconY, 40); // Stały rozmiar dla kontrastu
  fill(255, 0, 0, 150);
  let tailLength = 20 + sin(millis() * 0.01) * 5;
  triangle(150, iconY - 20, 150 - tailLength, iconY - 30, 150 + tailLength, iconY - 30); // Pulsujący ogon
  if (mx >= 150 && mx <= 200 && my >= iconY - 20 && my <= iconY + 20) {
    noFill();
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    ellipse(150, iconY, 50);
    noStroke();
  }
  fill(249, 249, 242);
  text("Meteor Strike: More Traps, x2 Points (3s) [Lv5+]", 220, iconY);

  // Przycisk BACK (spójny z tutorialem)
  let backX = 20;
  let backY = 20;
  let isBackHovering = mx >= backX && mx <= backX + 120 && my >= backY && my <= backY + 50;
  fill(93, 208, 207, isBackHovering ? 255 : 200);
  rect(backX, backY, 120, 50, 10);
  fill(249, 249, 242);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("BACK", backX + 60, backY + 25);

  textAlign(CENTER, BASELINE); // Reset wyrównania
}

  else if (gameState === "tutorial") {
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
  
    // Title with Logo (whiteLogo zostaje na górze)
    fill(249, 249, 242); // White (#F9F9F2)
    textSize(36);
    textStyle(BOLD);
    text("Superseed Cosmic Network", GAME_WIDTH / 2, 60);
    let logoScale = 1 + sin(millis() * 0.003) * 0.1;
    image(whiteLogo, GAME_WIDTH / 2 - 100, 70, 200 * logoScale, 100 * logoScale); // Przywrócone logo na górze
  
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
    // Mini-demo logo usunięte stąd
  
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
    push();
    translate(iconX, sectionY + 40);
    let lifeGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 20);
    lifeGradient.addColorStop(0, "rgb(255, 255, 255)");
    lifeGradient.addColorStop(1, "rgb(0, 255, 0)");
    drawingContext.fillStyle = lifeGradient;
    star(0, 0, 10, 20 + sin(millis() * 0.005) * 5, 8);
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
  
    // Pozycja ostatniego tekstu "a cosmic collaboration"
    let lastTextY = sectionY + 20 + (whyPlayLines.length - 1) * 20; // Y ostatniej linii

    // Migające logo superseed-logo.png między tekstem a przyciskiem
    push();
    let logoY = lastTextY + 30; // 30 pikseli pod tekstem
    let demoPulse = lerp(80, 120, sin(millis() * 0.002));
    tint(seedColor.r, seedColor.g, seedColor.b, 200);
    image(logo, GAME_WIDTH / 2, logoY, demoPulse, demoPulse);
    pop();

    // Start Game Button
    // Start Game Button
let buttonX = GAME_WIDTH / 2 - TUTORIAL_BUTTON_WIDTH / 2;
let buttonY = GAME_HEIGHT - 190;
let isHovering = mouseX > buttonX && mouseX < buttonX + TUTORIAL_BUTTON_WIDTH && 
                 mouseY > buttonY && mouseY < buttonY + TUTORIAL_BUTTON_HEIGHT;
fill(93, 208, 207, isHovering ? 255 : 200);
rect(buttonX, buttonY, TUTORIAL_BUTTON_WIDTH, TUTORIAL_BUTTON_HEIGHT, 15);
fill(249, 249, 242);
textSize(26);
textStyle(BOLD);
textAlign(CENTER, CENTER);
text(savedGameState ? "RESUME SYNC" : "START SYNC", GAME_WIDTH / 2, buttonY + TUTORIAL_BUTTON_HEIGHT / 2);
  
    // Back Button
    let backX = 20;
    let backY = 20;
    let isBackHovering = mouseX > backX && mouseX < backX + 120 && 
                         mouseY > backY && mouseY < backY + 50;
    fill(93, 208, 207, isBackHovering ? 255 : 200);
    rect(backX, backY, 120, 50, 10);
    fill(249, 249, 242);
    textSize(20);
    textAlign(CENTER, CENTER); // Wyśrodkowanie w poziomie i pionie
    text("BACK", backX + 60, backY + 25); // Środek przycisku w pionie (50 / 2 = 25)
  
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
      // Zatrzymaj introMusic, jeśli nadal gra
      if (introMusic.isPlaying()) {
        introMusic.stop();
        console.log("introMusic stopped in playing state");
      }
      
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
  logoX = GAME_WIDTH / 2 + sin(millis() * 0.001) * min(40 * level, GAME_WIDTH * 0.3);
  logoY = GAME_HEIGHT / 2 + cos(millis() * 0.001) * min(30 * level, GAME_HEIGHT * 0.25);
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
        fill(255, 0, 0, 200); // Czerwony kolor
        textSize(20);
        text(`Click anywhere! ${floor(inactivityTimer / 1000) + 1}s`, GAME_WIDTH / 2, GAME_HEIGHT - 130); // Przesunięte z -100 na -50
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
    // Dodaj adres portfela, jeśli podłączony
if (isConnected && userAddress) {
  fill(93, 208, 207);
  textSize(16);
  text(`Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`, GAME_WIDTH / 2, 160);
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
    textAlign(CENTER, CENTER); // Wyśrodkowanie w poziomie i pionie
    text("How to Play", GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH / 2 - 10, 10 + HOW_TO_PLAY_BUTTON_HEIGHT / 2);

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
  rect(GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2, GAME_HEIGHT / 2 + 180, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10); // Z 150 na 180
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER); // Ustawienie wyśrodkowania
  text("RELAUNCH", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180 + RESTART_BUTTON_HEIGHT / 2); // Wyśrodkowany w przycisku

  // Przycisk Share Score
  fill(93, 208, 207);
  rect(GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2, GAME_HEIGHT / 2 + 260, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10); // Z 210 na 260
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER); // Ustawienie wyśrodkowania
  text("SHARE SCORE", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 260 + RESTART_BUTTON_HEIGHT / 2);

} else if (gameState === "win") {
  // Tło z gradientem dla spójności
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B");
  gradient.addColorStop(1, "#93D0CF");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Tekst główny
  fill(seedColor.r, seedColor.g, seedColor.b);
  textSize(48);
  textStyle(BOLD);
  text(`Mainnet Orbit Achieved!\nOrbit ${level} - Press Space or Click`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

  // Mini podgląd Cosmic Core
  push();
  translate(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
  rotate(millis() * 0.001);
  let pulseScale = 1 + sin(millis() * 0.005) * 0.1;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = `rgba(${seedColor.r}, ${seedColor.g}, ${seedColor.b}, 0.5)`;
  fill(seedColor.r, seedColor.g, seedColor.b, 150);
  ellipse(0, 0, 150 * pulseScale, 150 * pulseScale);
  tint(255, 215, 0, 200);
  image(smallSuperseedIntro, 0, 0, 120 * pulseScale, 120 * pulseScale);
  drawingContext.shadowBlur = 0;
  pop();

  // Cząsteczki
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
  }
} else if (gameState === "endgame") {
  // Tło z gradientem
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B");
  gradient.addColorStop(1, "#93D0CF");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Karta NFT – Superseed Cosmic Core
  push();
  translate(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50); // Przesunięcie w górę, aby zmieścić przyciski
  rotate(sin(millis() * 0.001) * 0.1); // Lekka rotacja całej karty
  let pulseScale = 1 + sin(millis() * 0.005) * 0.05; // Subtelne pulsowanie

  // Rozmiar karty (proporcje 2:3)
  let cardWidth = 300 * pulseScale;
  let cardHeight = 450 * pulseScale;

  // Tło karty z gradientem
  let cardGradient = drawingContext.createLinearGradient(-cardWidth / 2, -cardHeight / 2, cardWidth / 2, cardHeight / 2);
  cardGradient.addColorStop(0, `rgba(${seedColor.r}, ${seedColor.g}, ${seedColor.b}, 0.8)`);
  cardGradient.addColorStop(1, "rgba(14, 39, 59, 0.9)");
  drawingContext.fillStyle = cardGradient;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = `rgba(255, 215, 0, 0.5)`;
  rect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20); // Zaokrąglone rogi

  // Ramka karty
  noFill();
  stroke(255, 215, 0, 200); // Złoty kolor
  strokeWeight(4);
  rect(-cardWidth / 2 + 5, -cardHeight / 2 + 5, cardWidth - 10, cardHeight - 10, 15);
  stroke(seedColor.r, seedColor.g, seedColor.b, 150);
  strokeWeight(2);
  rect(-cardWidth / 2 + 10, -cardHeight / 2 + 10, cardWidth - 20, cardHeight - 20, 10);

  // Logo smallsuperseedintro z rotacją
  push();
  translate(0, -50); // Przesunięcie logo w górę karty
  rotate(millis() * 0.001); // Rotacja logo
  tint(255, 215, 0, 200); // Złoty odcień holograficzny
  imageMode(CENTER);
  image(smallSuperseedIntro, 0, 0, cardWidth * 0.7, cardWidth * 0.7); // Logo w górnej części karty
  pop();

  // Linie obwodów blockchain (dekoracja)
  noFill();
  stroke(93, 208, 207, 100);
  strokeWeight(1);
  for (let i = 0; i < 5; i++) {
    let y = map(i, 0, 4, -cardHeight / 2 + 20, cardHeight / 2 - 20);
    line(-cardWidth / 2 + 20, y, cardWidth / 2 - 20, y);
  }

  // Nazwa gry nad tytułem NFT
  stroke(14, 39, 59, 200); // Tangaroa (#0E273B) jako obwódka
  strokeWeight(1);
  fill(147, 208, 207); // Superseed Light Green (#93D0CF)
  textSize(16);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text("Superseed Cosmic Network", 0, cardHeight / 2 - 90);

  // Nazwa NFT na dole karty
  stroke(14, 39, 59, 200); // Tangaroa (#0E273B) jako obwódka
  strokeWeight(1);
  fill(255, 215, 0); // Złoty kolor
  textSize(24);
  textStyle(BOLD);
  text("Superseed Cosmic Core", 0, cardHeight / 2 - 60);

  // Subtelny napis "NFT"
  stroke(14, 39, 59, 200); // Tangaroa (#0E273B) jako obwódka
  strokeWeight(1);
  fill(255, 255, 255, 150);
  textSize(16);
  text("NFT", 0, cardHeight / 2 - 30);

  drawingContext.shadowBlur = 0;
  noStroke();
  pop();

  // Tekst poniżej karty
  stroke(14, 39, 59, 200); // Tangaroa (#0E273B) jako obwódka
  strokeWeight(1);
  fill(147, 208, 207); // Superseed Light Green (#93D0CF)
  textSize(36);
  textStyle(BOLD);
  text("Superseed Cosmic Core Unlocked!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250);
  textSize(20);
  text("Claim your NFT on Supersync Network soon! #SuperseedGrok3", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 290);

  // Przyciski
  // Claim NFT
  fill(93, 208, 207);
  rect(GAME_WIDTH / 2 - 220, GAME_HEIGHT / 2 + 320, 200, 50, 10);
  fill(255);
  textSize(24);
  text("Claim NFT", GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 345);

  // Mint NFT
  fill(255, 215, 0); // Złoty kolor dla wyróżnienia
  rect(GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 + 320, 200, 50, 10);
  fill(14, 39, 59); // Tangaroa dla tekstu w przycisku
  textSize(24);
  text("Mint NFT", GAME_WIDTH / 2 + 120, GAME_HEIGHT / 2 + 345);
}
pop(); // Zamknięcie push() z początku draw()
} // Zamknięcie funkcji draw()

// Jeśli to koniec pliku, upewnij się, że nie ma nic po tym

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

    // Resetowanie muzyki
    if (soundInitialized) {
      introMusic.stop(); // Zatrzymaj muzykę intro
      backgroundMusic2.stop(); // Zatrzymaj drugą muzykę, jeśli gra
      backgroundMusic.stop();  // Zatrzymaj pierwszą muzykę
      backgroundMusic.loop();  // Uruchom pierwszą muzykę od nowa
      console.log("Music reset: backgroundMusic restarted");
    }
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
    gameState = savedGameState.gameState; // Przywraca np. "playing" lub "supernova"
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
    savedGameState = null; // Czyści zapisany stan
    if (soundInitialized) {
      if (level >= 5 && musicSwitched) {
        backgroundMusic2.play(); // Wznawia odpowiednią muzykę
      } else {
        backgroundMusic.play();
      }
    }
  } else {
    startGame(); // Nowa gra, jeśli brak zapisu
  }
}


let showLoginMessage = false;
let loginMessageStartTime = 0;
const loginMessageDuration = 3000;
function mousePressed() {
  let adjustedMouseX = mouseX - (width - GAME_WIDTH) / 2;
  let adjustedMouseY = mouseY - (height - GAME_HEIGHT) / 2;

  if (gameState === "howToPlay") {
    // Kliknięcie na whiteLogo w lewym dolnym rogu – bez zmian
    let whiteLogoX = 20;
    let whiteLogoY = GAME_HEIGHT - 100;
    let whiteLogoWidth = 100;
    let whiteLogoHeight = 50;
    if (
      adjustedMouseX >= whiteLogoX &&
      adjustedMouseX <= whiteLogoX + whiteLogoWidth &&
      adjustedMouseY >= whiteLogoY &&
      adjustedMouseY <= whiteLogoY + whiteLogoHeight
    ) {
      window.open("https://www.superseed.xyz/", "_blank");
    }

    // Kliknięcie na "Created by CratosPL" w prawym dolnym rogu – bez zmian
    let creatorTextX = GAME_WIDTH - 140;
    let creatorTextY = GAME_HEIGHT - 30;
    let creatorTextWidth = 120;
    let creatorTextHeight = 20;
    if (
      adjustedMouseX >= creatorTextX &&
      adjustedMouseX <= creatorTextX + creatorTextWidth &&
      adjustedMouseY >= creatorTextY &&
      adjustedMouseY <= creatorTextY + creatorTextHeight
    ) {
      window.open("https://x.com/sebbtgk", "_blank");
    }

    // Przesunięcie dla wszystkich elementów menu o verticalOffset
    let verticalOffset = 100;

    // Choose Your Seed Color – zaktualizowane współrzędne Y
    let colorBoxSize = 60;
    let colorBoxSpacing = 30;
    let startX = GAME_WIDTH / 2 - (colorBoxSize * 3 + colorBoxSpacing * 2) / 2;
    if (adjustedMouseY >= 350 + verticalOffset && adjustedMouseY <= 350 + verticalOffset + colorBoxSize) {
      if (adjustedMouseX >= startX && adjustedMouseX <= startX + colorBoxSize) {
        seedColor = { r: 0, g: 255, b: 0 }; // Zielony
      } else if (
        adjustedMouseX >= startX + colorBoxSize + colorBoxSpacing &&
        adjustedMouseX <= startX + colorBoxSize * 2 + colorBoxSpacing
      ) {
        seedColor = { r: 0, g: 0, b: 255 }; // Niebieski
      } else if (
        adjustedMouseX >= startX + (colorBoxSize + colorBoxSpacing) * 2 &&
        adjustedMouseX <= startX + (colorBoxSize + colorBoxSpacing) * 2 + colorBoxSize
      ) {
        seedColor = { r: 255, g: 215, b: 0 }; // Złoty
      }
    }

    // Enter Your Nick – zaktualizowane współrzędne Y
    if (
      adjustedMouseY >= 470 + verticalOffset &&
      adjustedMouseY <= 520 + verticalOffset &&
      adjustedMouseX >= GAME_WIDTH / 2 - 120 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 120
    ) {
      isTypingNick = true;
    } else {
      isTypingNick = false;
    }

    // Start/Resume Button – zaktualizowane współrzędne Y
    if (
      adjustedMouseX >= GAME_WIDTH / 2 - 120 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 120 &&
      adjustedMouseY >= 540 + verticalOffset &&
      adjustedMouseY <= 600 + verticalOffset
    ) {
      if (!isConnected) {
        console.log("Please log in first");
        showLoginMessage = true;
        loginMessageStartTime = millis();
      } else if (savedGameState) {
        resumeGame();
      } else {
        startGame();
      }
    }

    // Login/Logout Button – zaktualizowane współrzędne Y
    if (
      !isConnected &&
      adjustedMouseX >= GAME_WIDTH / 2 - 120 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 120 &&
      adjustedMouseY >= 620 + verticalOffset &&
      adjustedMouseY <= 680 + verticalOffset
    ) {
      console.log("Login clicked - initiating wallet connection");
      connectWallet(true)
        .then(() => {
          if (isConnected) {
            console.log("Wallet connected successfully");
            if (savedGameState) resumeGame();
            else startGame();
          } else {
            console.log("Wallet connection failed");
          }
        })
        .catch((error) => {
          console.error("Wallet connection error:", error);
          connectionError = "Connection failed: " + error.message;
        });
    } else if (
      isConnected &&
      adjustedMouseX >= GAME_WIDTH / 2 - 120 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 120 &&
      adjustedMouseY >= 660 + verticalOffset &&
      adjustedMouseY <= 720 + verticalOffset
    ) {
      console.log("Logout clicked - disconnecting wallet");
      if (web3Modal) {
        web3Modal.clearCachedProvider();
        localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
        localStorage.removeItem("walletconnect");
      }
      isConnected = false;
      userAddress = null;
      provider = null;
      signer = null;
      connectionError = null;
    }

    // INFO Button – bez zmian
    let sideButtonX = GAME_WIDTH - 120 - 20;
    if (
      adjustedMouseX >= sideButtonX &&
      adjustedMouseX <= sideButtonX + 120 &&
      adjustedMouseY >= 200 &&
      adjustedMouseY <= 250
    ) {
      gameState = "info";
    }

    // Tutorial Button – bez zmian
    if (
      adjustedMouseX >= sideButtonX &&
      adjustedMouseX <= sideButtonX + 120 &&
      adjustedMouseY >= 260 &&
      adjustedMouseY <= 310
    ) {
      gameState = "tutorial";
    }

    // View Intro Button – bez zmian
    if (
      adjustedMouseX >= sideButtonX &&
      adjustedMouseX <= sideButtonX + 120 &&
      adjustedMouseY >= 320 &&
      adjustedMouseY <= 370
    ) {
      gameState = "intro";
      introState = 0;
      introTimer = millis();
      if (soundInitialized) {
        introMusic.stop();
        introMusic.loop();
      }
    }

    // Usunięto redundantny kod rysujący gradient dla Logout – przeniesiono do draw()
  } else if (gameState === "info") {
    let offsetX = (width - GAME_WIDTH) / 2;
    let offsetY = (height - GAME_HEIGHT) / 2;
    let adjustedMouseX = mouseX - offsetX;
    let adjustedMouseY = mouseY - offsetY;

    // BACK Button – bez zmian
    if (adjustedMouseX >= 20 && adjustedMouseX <= 120 &&
        adjustedMouseY >= 20 && adjustedMouseY <= 60) {
      gameState = "howToPlay";
    }
  } else if (gameState === "intro") {
    // "NEXT" button handling – bez zmian
    let nextButtonX = GAME_WIDTH - 100;
    let nextButtonY = GAME_HEIGHT - 50;
    if (adjustedMouseX >= nextButtonX && adjustedMouseX <= nextButtonX + 80 &&
        adjustedMouseY >= nextButtonY && adjustedMouseY <= nextButtonY + 30) {
      introState++;
      introTimer = millis();
      if (introState > 2) {
        gameState = "howToPlay";
        introState = 0;
        if (!hasSeenIntro) {
          localStorage.setItem('hasSeenIntro', 'true');
          hasSeenIntro = true;
        }
      }
      if (soundInitialized && introState <= 2) warpSound.play();
    }
  } else if (gameState === "tutorial") {
    // Wybór koloru – bez zmian (z Twojego kodu)
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

    // Wpisywanie nicku – bez zmian
    if (adjustedMouseY >= 180 && adjustedMouseY <= 230 &&
        adjustedMouseX >= GAME_WIDTH / 2 - 100 && adjustedMouseX <= GAME_WIDTH / 2 + 100) {
      playerNick = "";
      isTypingNick = true;
    } else {
      isTypingNick = false;
    }

    // Przycisk "Start Sync" – bez zmian
    let buttonX = GAME_WIDTH / 2 - TUTORIAL_BUTTON_WIDTH / 2;
    let buttonY = GAME_HEIGHT - 190;
    if (adjustedMouseX >= buttonX && adjustedMouseX <= buttonX + TUTORIAL_BUTTON_WIDTH &&
        adjustedMouseY >= buttonY && adjustedMouseY <= buttonY + TUTORIAL_BUTTON_HEIGHT) {
      console.log("Start Sync clicked!");
      if (savedGameState) {
        resumeGame();
      } else {
        startGame();
      }
    }

    // Przycisk "Back" – bez zmian
    let backX = 20;
    let backY = 20;
    if (adjustedMouseX >= backX && adjustedMouseX <= backX + 120 &&
        adjustedMouseY >= backY && adjustedMouseY <= backY + 50) {
      console.log("Back clicked!");
      gameState = "howToPlay";
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
    let relaunchButtonY = GAME_HEIGHT / 2 + 180;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= relaunchButtonY &&
      adjustedMouseY <= relaunchButtonY + RESTART_BUTTON_HEIGHT
    ) {
      startGame();
    }
    let shareScoreButtonY = GAME_HEIGHT / 2 + 260;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= shareScoreButtonY &&
      adjustedMouseY <= shareScoreButtonY + RESTART_BUTTON_HEIGHT
    ) {
      let shareText = `I synced ${score.toFixed(1)} points in Superseed Cosmic Network! #SuperseedGrok3`;
      navigator.clipboard.writeText(shareText);
      alert("Score copied to clipboard: " + shareText);
    }
    if (mainnetBadgeEarned) {
      let badgeButtonY = GAME_HEIGHT / 2 + 340; // Poprawiono z 270 na 340
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
      let basePoints = level === 1 ? 2 : 1;
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
  let scaleFactor = min(windowWidth / 1200, windowHeight / 1000);
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
}