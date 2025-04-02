// Global Variables
let logo;
let whiteLogo;
let smallSuperseedIntro;
let clickSound;
let backgroundMusic;
let backgroundMusic3;
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
let mainnetChallengeGoal = 400;
let mainnetChallengeScore = 0;
let mainnetBadgeEarned = false;
let mainnetChallengeTriggered = false;
let gameStartTime = 0;
let stateStartTime;
let tutorialClicks = 0;
let tutorialPulseProgress = 0;
let tutorialLastPulse = 0;
let musicSwitched = false;
let upadekBg;
let synchronizacjaBg;
let nagrodaBg;
let isConnecting = false;

let hasCompletedGame = localStorage.getItem('hasCompletedGame') === 'true';

let blackHoleSoundPlayed = false;

let baseRotationSpeed = 0.01;
let slowdownActive = false;
let slowdownTimer = 0;
let slowdownCooldown = 0;
const SLOWDOWN_DURATION = 10000;
const SLOWDOWN_COOLDOWN = 30000;
const SLOWDOWN_FACTOR = 1.5;

let animationTime = 0;

let introClicked = false;
let hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
let introState = 0;
let introTimer = 0;
let introDuration = 30000;
let teslaImage;

// Zmienne dla bossa (usuwamy cosmicCoreGuardian i integrujemy nowe)
let bossImage; // Sprite sheet bossa (2000x200 px, 10 klatek 200x200 px)
let bossFrameWidth = 200; // Szerokość jednej klatki
let bossHealth = 0;
let bossPhase = 1; // Nowa logika faz oparta na zdrowiu
let bossActive = false;
let bossSize = 200;
let cosmicNodes = []; // Tablica na Cosmic Nodes (do usunięcia w nowej mechanice, jeśli niepotrzebne)
let bossMusic;
let bossIntroImage;
let nodesCollected = 0; // Licznik zebranych węzłów (do usunięcia w nowej mechanice, jeśli niepotrzebne)
let bossAttackTimer = 0; // Nowy timer ataku bossa
let bossAttackType = null; // Do usunięcia w nowej mechanice, jeśli niepotrzebne
let yellowRingActive = false; // Do usunięcia w nowej mechanice, jeśli niepotrzebne
let syncTimer = 0; // Timer dla pasywnego SYNC (do usunięcia w nowej mechanice, jeśli niepotrzebne)
let bossDefeatTimer = 0;
let zoomLevel = 1;

const ethersLib = window.ethers;

const SYNC_INTERVAL = 2000; // Do usunięcia w nowej mechanice, jeśli niepotrzebne

// Nowe zmienne dla gracza (SuperSeed)
let playerImage; // Ikona SuperSeed (później Final Form)
let player; // Obiekt gracza

// Pociski
let playerBullets = []; // Pociski gracza
let bossBullets = []; // Pociski bossa
let lastFireTime = 0; // Ostatni czas strzału gracza
let fireRate = 400; // Częstotliwość strzelania (ms)

let powerUpDurations = {
  gas: 5000,
  pulse: 4000,
  orbit: 6000,
  nova: 10000, // Zmień z 5000 na 10000
  meteor: 6000,
  star: 6000 // Zmień z 5000 na 6000 dla spójności
};

console.log("ethers object:", ethers);
console.log("ethers keys:", Object.keys(ethers));

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

    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();
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
// Tutaj dodajemy klasę CosmicNode
class CosmicNode {
  constructor() {
    this.x = random(100, GAME_WIDTH - 100);
    this.y = random(100, GAME_HEIGHT - 100);
    this.size = 30;
    this.timer = 7000; // 7 sekund życia
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

// Tutaj wstawiamy nowe klasy
class Player {
  constructor() {
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT - 50;
    this.size = 60; // Z 40 na 60
    this.speed = 5;
  }
  show() {
    image(playerImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  update() {
    let targetX = mouseX - (width - GAME_WIDTH) / 2;
    let targetY = mouseY - (height - GAME_HEIGHT) / 2;
    this.x = lerp(this.x, targetX, 0.2); // Z 0.1 na 0.2
    this.y = lerp(this.y, targetY, 0.2); // Z 0.1 na 0.2
    this.x = constrain(this.x, 0, GAME_WIDTH);
    this.y = constrain(this.y, 0, GAME_HEIGHT);
  }
  show() {
    image(playerImage, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
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
  cosmicMenuBg = loadImage('assets/cosmicMenuBg.png');
  mainLogo = loadImage('assets/superseedcosmicnet-gamelogo.png');
  clickSound = loadSound('assets/background-beat.wav');
  backgroundMusic = loadSound('assets/background-music.mp3');
  backgroundMusic2 = loadSound('assets/background-music2.mp3');
  backgroundMusic3 = loadSound('assets/background-music3.mp3');
  introMusic = loadSound('assets/intro1.mp3');
  powerUpSound = loadSound('assets/power-up.mp3');
  meteorSound = loadSound('assets/meteor-hit.mp3');
  levelSound = loadSound('assets/level-up.mp3');
  warpSound = loadSound('assets/warp-transition.mp3');
  nebulaSound = loadSound('assets/nebula-burst.mp3');
  holeSound = loadSound('assets/hole.mp3');
  upadekBg = loadImage('assets/upadek-background.png');
  synchronizacjaBg = loadImage('assets/synchronizacja-background.png');
  nagrodaBg = loadImage('assets/nagroda-background.png');
  bossImage = loadImage('assets/boss_sprite_sheet.png'); // Nowy sprite sheet bossa
  playerImage = loadImage('assets/superseed-final-form.png'); // Final Form SuperSeed
  bossMusic = loadSound("assets/boss_music.mp3");
  bossIntroImage = loadImage('assets/boss_intro.png');
}
// Poprawiony setup() – bez async, wywołanie asynchroniczne w tle
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, { willReadFrequently: true });
  GAME_WIDTH = windowWidth;
  GAME_HEIGHT = windowHeight;
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
  backgroundMusic3.setVolume(0.5); // Ustawienie głośności dla nowej muzyki
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

  isConnected = false;
  userAddress = null;
  provider = null;
  signer = null;
  connectionError = null;

  waitForScripts().then(() => {
    initializeWeb3Modal();
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
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
  // Rysuj tło na całym oknie (windowWidth x windowHeight)
  let bgColor = lerpColor(color(14, 39, 59), color(40 + level * 10, 70 + level * 10, 100), sin(pulseProgress * TWO_PI) * 0.5 + 0.5);
  background(bgColor); // Wypełnia cały canvas
  let c1 = color(14, 39, 59);
  let c2 = color(10, 30, 60);
  for (let y = 0; y < windowHeight; y++) {
    let inter = map(y, 0, windowHeight, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, windowWidth, y); // Linie na całej szerokości okna
  }
}

function draw() {

  let deltaTime = 1000 / frameRate(); // Przybliżona wartość w ms na klatkę
  
  let currentTime = millis();
  let pulseProgress = (currentTime - lastPulse) / pulseSpeed;

  

  // Rysuj tło na całym oknie jako pierwsze
  drawBackground(pulseProgress);

  // Centruj grę w oknie z letterboxingiem
  let offsetX = (windowWidth - GAME_WIDTH) / 2;
  let offsetY = (windowHeight - GAME_HEIGHT) / 2;
  push();
  translate(offsetX, offsetY);

  // Istniejący stan intro
  if (gameState === "intro") {
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
    let originalWidth = 1200; // Rzeczywista szerokość obrazów
    let originalHeight = 1000; // Rzeczywista wysokość obrazów
    let aspectRatio = originalWidth / originalHeight;

    // Scene 1: "The Fall"
    if (introState === 0) {
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
        image(upadekBg, bgX, bgY, bgWidth, bgHeight);
      } else {
        image(upadekBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
      let logoPulse = lerp(50, 100, sin(currentTime * 0.002));
      tint(255, 200);
      image(logo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoPulse, logoPulse);
      fill(255, 200);
      textSize(isMobile ? 18 : 24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "In a galaxy bound by centralized chains,\nthe old networks fell silent.\nOne seed remained – a spark of hope.",
        GAME_WIDTH / 2,
        GAME_HEIGHT - (isMobile ? 100 : 150)
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
      stroke(14, 39, 59);
      strokeWeight(2);
      fill(93, 208, 207);
      textSize(isMobile ? 18 : 24);
      textStyle(BOLD);
      text(
        "You’ve been chosen to awaken the Superseed Mainnet.\nSync cosmic nodes, harness power-ups,\nand forge a decentralized future – orbit by orbit.",
        GAME_WIDTH / 2,
        GAME_HEIGHT - (isMobile ? 100 : 150)
      );
      noStroke();
    }
    // Scene 3: "The Reward Awaits"
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

      if (random(1) < 0.2) {
        particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].isDead()) particles.splice(i, 1);
      }

      let logoWidth = isMobile ? min(200, GAME_WIDTH * 0.4) : 300;
      let logoHeight = logoWidth / 2;
      image(whiteLogo, GAME_WIDTH / 2 - logoWidth / 2, isMobile ? 30 : 50, logoWidth, logoHeight);

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

      stroke(14, 39, 59, 200);
      strokeWeight(3);
      fill(255, 245, 102);
      textSize(isMobile ? 18 : 24);
      textStyle(BOLD);
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

  // Reszta kodu – ramka gry i particles
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

  // Winietka i overlay gradientu – bez zmian
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

  // Większe pulsujące logo na górze – bez zmian
  let logoScale = 1 + sin(millis() * 0.002) * 0.05;
  let logoSize = 400 * logoScale;
  image(mainLogo, GAME_WIDTH / 2 - logoSize / 2, 30, logoSize, logoSize);

  // Przesunięcie wszystkich elementów w dół o 100 pikseli
  let verticalOffset = 100;

  // Choose Your Seed Color – bez zmian
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

  // Enter Your Nick – bez zmian
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

  // Start Button – bez zmian
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

  // Login/Logout Button – ZAKTUALIZOWANE POZYCJE
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
    text(`Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`, GAME_WIDTH / 2, 610 + verticalOffset); // Przesunięte z 620 na 610
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 120, 640 + verticalOffset, GAME_WIDTH / 2 + 120, 640 + verticalOffset); // Przesunięte z 660 na 640
    gradient.addColorStop(0, "#FF4500");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(3);
    rect(GAME_WIDTH / 2 - 120, 640 + verticalOffset, 240, 60, 15); // Przesunięte z 660–720 na 640–700
    noStroke();
    fill(249, 249, 242);
    textSize(28);
    text("LOGOUT", GAME_WIDTH / 2, 670 + verticalOffset); // Przesunięte z 690 na 670
  }

  // *** DODANY PRZYCISK "Claim Your NFT" – ZAKTUALIZOWANA POZYCJA ***
  if (hasCompletedGame) {
    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - 120, 720 + verticalOffset, 240, 60, 10); // Przesunięte z 700–760 na 720–780
    fill(255);
    textSize(24);
    text("Claim Your NFT", GAME_WIDTH / 2, 750 + verticalOffset); // Przesunięte z 730 na 750
  }

  // Komunikat o wersji desktopowej – bez zmian
  fill(255, 50, 50, 255);
  textSize(32);
  textStyle(BOLD);
  drawingContext.shadowBlur = 0;
  text("NOTICE: Desktop only for now", GAME_WIDTH / 2, 820 + verticalOffset);
  fill(255, 215, 0, 200);
  textSize(16);
  text("Mobile version coming soon!", GAME_WIDTH / 2, 850 + verticalOffset);

  // Wyświetlanie komunikatu o błędzie lub prośbie o zalogowanie – bez zmian
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

  // Przyciski boczne (INFO, TUTORIAL, VIEW INTRO, ACHIEVEMENTS) – bez zmian
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
  textSize(16);
  textAlign(CENTER, CENTER);
  text("INFO", sideButtonX + sideButtonWidth / 2, 200 + sideButtonHeight / 2);

  gradient = drawingContext.createLinearGradient(sideButtonX, 260, sideButtonX + sideButtonWidth, 260);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  stroke(147, 208, 207);
  strokeWeight(2);
  rect(sideButtonX, 260, sideButtonWidth, sideButtonHeight, 10);
  noStroke();
  fill(14, 39, 59);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("TUTORIAL", sideButtonX + sideButtonWidth / 2, 260 + sideButtonHeight / 2);

  gradient = drawingContext.createLinearGradient(sideButtonX, 320, sideButtonX + sideButtonWidth, 320);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  stroke(147, 208, 207);
  strokeWeight(2);
  rect(sideButtonX, 320, sideButtonWidth, sideButtonHeight, 10);
  noStroke();
  fill(14, 39, 59);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("VIEW INTRO", sideButtonX + sideButtonWidth / 2, 320 + sideButtonHeight / 2);

  gradient = drawingContext.createLinearGradient(sideButtonX, 380, sideButtonX + sideButtonWidth, 380);
  gradient.addColorStop(0, "#93D0CF");
  gradient.addColorStop(1, "#FFD700");
  drawingContext.fillStyle = gradient;
  stroke(147, 208, 207);
  strokeWeight(2);
  rect(sideButtonX, 380, sideButtonWidth, sideButtonHeight, 10);
  noStroke();
  fill(14, 39, 59);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("ACHIEVEMENTS", sideButtonX + sideButtonWidth / 2, 380 + sideButtonHeight / 2);

  // WhiteLogo w lewym dolnym rogu z miganiem i napisem – bez zmian
  let whiteLogoScale = 1 + sin(millis() * 0.003) * 0.05;
  let whiteLogoWidth = 100 * whiteLogoScale;
  let whiteLogoHeight = 50 * whiteLogoScale;
  let whiteLogoX = 20;
  let whiteLogoY = GAME_HEIGHT - 100;
  image(whiteLogo, whiteLogoX, whiteLogoY, whiteLogoWidth, whiteLogoHeight);

  fill(147, 208, 207, 200);
  textSize(12);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  text("Powered by Superseed", whiteLogoX, whiteLogoY + whiteLogoHeight + 5);

  textAlign(CENTER, BASELINE);

  // Informacja o twórcy w prawym dolnym rogu z efektem hover – bez zmian
  let adjustedMouseX = mouseX - (width - GAME_WIDTH) / 2;
  let adjustedMouseY = mouseY - (height - GAME_HEIGHT) / 2;
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
    fill(255, 215, 0, 200);
  } else {
    fill(147, 208, 207, 200);
  }
  textSize(12);
  textStyle(NORMAL);
  textAlign(RIGHT, BOTTOM);
  text("Created by CratosPL", GAME_WIDTH - 20, GAME_HEIGHT - 10);
}

  else if (gameState === "achievements") {
    // Tło modala
    fill(14, 39, 59, 230);
    rect(GAME_WIDTH / 2 - 300, GAME_HEIGHT / 2 - 400, 600, 800, 20);
    
    // Nagłówek
    fill(255, 215, 0);
    textSize(32);
    textStyle(BOLD);
    text("Achievements", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 350);
  
    // Lista osiągnięć
    let yOffset = -300;
    if (mainnetBadgeEarned) {
      drawMainnetBadge(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 + yOffset, 40);
      fill(255, 215, 0);
      textSize(16);
      text("Mainnet Badge Earned!", GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + yOffset + 50);
    } else {
      fill(128, 131, 134);
      textSize(16);
      text("Mainnet Badge: Locked", GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 + yOffset + 50);
    }
    // Miejsce na przyszłe odznaki
    yOffset += 100;
  
    // Przycisk zamknięcia
    fill(93, 208, 207);
    rect(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 350, 120, 50, 10);
    fill(255);
    textSize(20);
    text("CLOSE", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 375);
  }

  else if (gameState === "info") {
    // Gradient Background z trzema kolorami
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "#0E273B"); // Tangaroa
    gradient.addColorStop(0.5, "#93D0CF"); // Morning Glory
    gradient.addColorStop(1, "#808386"); // Aluminium
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Pulsująca ramka
    let pulseProgress = sin(millis() * 0.002) * 0.5 + 0.5;
    stroke(93, 208, 207, map(pulseProgress, 0, 1, 100, 255)); // Superseed Light Green
    strokeWeight(5 + pulseProgress * 2);
    noFill();
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
    noStroke();
  
    // Dynamiczne tło z gwiazdkami
    for (let i = bgParticles.length - 1; i >= 0; i--) {
      bgParticles[i].update();
      bgParticles[i].show(pulseProgress);
    }
  
    // Nagłówek
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 200, 50, GAME_WIDTH / 2 + 200, 50);
    gradient.addColorStop(0, "#93D0CF"); // Morning Glory
    gradient.addColorStop(1, "#FFD700"); // Gold
    drawingContext.fillStyle = gradient;
    textSize(48);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Game Info", GAME_WIDTH / 2, 80);
  
    // Sekcje z informacjami
    let sectionY = 180;
  
    // Scoring
    fill(93, 208, 207); // Morning Glory
    textSize(32);
    textStyle(BOLD);
    text("Scoring", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242); // White (#F9F9F2)
    textSize(18);
    textStyle(NORMAL);
    text("Sync the Cosmic Seed when it pulses green!\nStart is easy – sync nodes slowly on Orbit 1 & 2!", GAME_WIDTH / 2, sectionY + 50);
    sectionY += 120;
  
    // Combos
    fill(93, 208, 207);
    textSize(32);
    textStyle(BOLD);
    text("Combos", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(18);
    textStyle(NORMAL);
    text("Chain syncs for multipliers (x1, x2, ...).\n15+ syncs grants +1 life.", GAME_WIDTH / 2, sectionY + 50);
    sectionY += 120;
  
    // Power-Ups & Boosts
fill(93, 208, 207);
textSize(32);
textStyle(BOLD);
text("Power-Ups & Boosts", GAME_WIDTH / 2, sectionY);
fill(249, 249, 242);
textSize(18);
textStyle(NORMAL);
let powerUpY = sectionY + 40;
let iconX = GAME_WIDTH / 2 - 300;

// 1. Life
push();
translate(iconX, powerUpY);
let lifeGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 20);
lifeGradient.addColorStop(0, "rgb(255, 255, 255)");
lifeGradient.addColorStop(1, "rgb(0, 255, 0)");
drawingContext.fillStyle = lifeGradient;
star(0, 0, 10, 20 + sin(millis() * 0.005) * 5, 8);
pop();
text("Life: +1 Life", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 2. Gas Nebula
noFill();
stroke(0, 191, 255, 200);
strokeWeight(2);
for (let i = 0; i < 3; i++) {
  arc(iconX, powerUpY, 20 * (i + 1) / 3, 20 * (i + 1) / 3, 0, PI + i * HALF_PI + millis() * 0.001);
}
noStroke();
fill(249, 249, 242);
text("Gas Nebula: x2 Points (5s+)", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 3. Pulse Wave
noFill();
let pulse = (millis() % 1000) / 1000;
stroke(147, 208, 207, 200);
strokeWeight(2);
ellipse(iconX, powerUpY, 35 * pulse);
noStroke();
fill(249, 249, 242);
text("Pulse Wave: Boost Pulse (4s+)", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 4. Orbit Shield
fill(255, 215, 0, 150);
ellipse(iconX, powerUpY, 35 + sin(millis() * 0.005) * 5);
stroke(255, 255, 255, 200);
strokeWeight(1);
for (let i = -1; i <= 1; i++) {
  line(iconX + i * 11, powerUpY - 15, iconX + i * 11, powerUpY + 15);
}
noStroke();
fill(249, 249, 242);
text("Orbit Shield: Blocks Damage (6s+) [Lv3+]", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 5. Freeze Nova
fill(0, 255, 255, 200 + sin(millis() * 0.01) * 55);
star(iconX, powerUpY, 15, 20, 6);
fill(249, 249, 242);
text("Freeze Nova: Freezes Pulse (10s+) [Lv3+]", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 6. Meteor Strike
fill(255, 100, 0, 200);
ellipse(iconX, powerUpY, 35);
fill(255, 0, 0, 150);
let tailLength = 15 + sin(millis() * 0.01) * 5;
triangle(iconX, powerUpY - 15, iconX - tailLength, powerUpY - 25, iconX + tailLength, powerUpY - 25);
fill(249, 249, 242);
text("Meteor Strike: More Traps, x2 Points (6s+) [Lv5+]", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 7. Star Seed
fill(147, 208, 207, 200);
ellipse(iconX, powerUpY, 35, 20 + sin(millis() * 0.005) * 5);
fill(249, 249, 242);
text("Star Seed: Bigger Seed (6s+) [Lv5+]", GAME_WIDTH / 2, powerUpY);
powerUpY += 50;

// 8. Mainnet Wave
gradient = drawingContext.createLinearGradient(iconX - 15, powerUpY, iconX + 15, powerUpY);
gradient.addColorStop(0, "#93D0CF");
gradient.addColorStop(1, "#FFD700");
drawingContext.fillStyle = gradient;
beginShape();
for (let i = 0; i < 6; i++) {
  let a = TWO_PI / 6 * i;
  vertex(iconX + cos(a) * (15 + sin(millis() * 0.005) * 3), powerUpY + sin(a) * 15);
}
endShape(CLOSE);
fill(249, 249, 242);
text("Mainnet Wave: Clears Traps [Lv7+]", GAME_WIDTH / 2, powerUpY);
sectionY += 440;
  
    // Traps
    fill(93, 208, 207);
    textSize(32);
    textStyle(BOLD);
    text("Traps", GAME_WIDTH / 2, sectionY);
    fill(249, 249, 242);
    textSize(18);
    textStyle(NORMAL);
    let trapY = sectionY + 40;
  
    // 1. Avoid Meteor Strikes
    fill(255, 0, 0, 200);
    ellipse(iconX, trapY, 35 + sin(millis() * 0.005) * 5); // Zmniejszono z 40/6 na 35/5
    stroke(255, 100);
    strokeWeight(2); // Zmniejszono z 3 na 2
    line(iconX - 15, trapY - 15, iconX + 15, trapY + 15); // Zmniejszono z 18 na 15
    noStroke();
    fill(249, 249, 242);
    text("Avoid Meteor Strikes: 5 misses = -1 life", GAME_WIDTH / 2, trapY);
    trapY += 50;
  
    // 2. Meteor Strike
    fill(255, 100, 0, 200);
    ellipse(iconX, trapY, 35); // Zmniejszono z 40 na 35
    fill(255, 0, 0, 150);
    tailLength = 15 + sin(millis() * 0.01) * 5; // Zmniejszono z 18/6 na 15/5
    triangle(iconX, trapY - 15, iconX - tailLength, trapY - 25, iconX + tailLength, trapY - 25); // Dostosowano z 18/30 na 15/25
    fill(249, 249, 242);
    text("Meteor Strike: Spawns Traps, x2 Points (3s) [Lv5+]", GAME_WIDTH / 2, trapY);
    sectionY += 140;
  
    // Przycisk BACK
    let backX = 20;
let backY = 20;
let mx = mouseX - (width - GAME_WIDTH) / 2;
let my = mouseY - (height - GAME_HEIGHT) / 2;
let isBackHovering = mx > backX && mx < backX + 120 && my > backY && my < backY + 50;
fill(93, 208, 207, isBackHovering ? 255 : 200);
rect(backX, backY, 120, 50, 10);
fill(249, 249, 242);
textSize(20);
textAlign(CENTER, CENTER);
text("BACK", backX + 60, backY + 25);
  
    // Stopka
    fill(128, 131, 134, 150); // Aluminium z przezroczystością
    textSize(16);
    text("#SuperseedGrok3 – Powered by xAI", GAME_WIDTH / 2, GAME_HEIGHT - 30);
  
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
      // Slowdown mechanic – bez zmian
      if (slowdownActive) {
        slowdownTimer -= deltaTime;
        if (slowdownTimer <= 0) {
          slowdownActive = false;
          pulseSpeed = basePulseSpeed;
          obstacles.forEach(o => {
            o.speedX /= SLOWDOWN_FACTOR;
            o.speedY /= SLOWDOWN_FACTOR;
          });
          baseRotationSpeed = 0.01;
        }
      }
  
      if (slowdownCooldown > 0) {
        slowdownCooldown -= deltaTime;
      }
  
      if (slowdownActive) {
        fill(100, 150, 200, 50);
        rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        noFill();
        stroke(100, 150, 200, 200);
        strokeWeight(4);
        ellipse(logoX, logoY, circleSize + 20);
        noStroke();
        fill(255, 200);
        textSize(20);
        text(`Tłumik Pulsu: ${floor(slowdownTimer / 1000)}s`, GAME_WIDTH / 2, GAME_HEIGHT - 120);
      }
  
      fill(93, 208, 207);
      rect(GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH - 10, 10, HOW_TO_PLAY_BUTTON_WIDTH, HOW_TO_PLAY_BUTTON_HEIGHT, 10);
      fill(255);
      textSize(18);
      textAlign(CENTER, CENTER);
      text("How to Play", GAME_WIDTH - HOW_TO_PLAY_BUTTON_WIDTH / 2 - 10, 10 + HOW_TO_PLAY_BUTTON_HEIGHT / 2);
  
      let buttonX = GAME_WIDTH - 120 - 10;
      let buttonY = 100;
      let buttonWidth = 120;
      let buttonHeight = 50;
      let SLOWDOWN_COST = level >= 10 ? 20 : 15;
      if (level >= 7 && !slowdownActive && slowdownCooldown <= 0 && score >= SLOWDOWN_COST) {
        let gradient = drawingContext.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY);
        gradient.addColorStop(0, "#93D0CF");
        gradient.addColorStop(1, "#FFD700");
        drawingContext.fillStyle = gradient;
        stroke(147, 208, 207);
        strokeWeight(2);
        rect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        noStroke();
        fill(14, 39, 59);
        textSize(16);
        textAlign(CENTER, CENTER);
        text(`Pulse Dampener\n-${SLOWDOWN_COST} pkt`, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
      }
  
      // Zatrzymaj introMusic, jeśli nadal gra
      if (introMusic.isPlaying()) {
        introMusic.stop();
        console.log("introMusic stopped in playing state");
      }
  
      // Nowa logika przełączania muzyki
      if (level === 10 && musicSwitched !== "level10") {
        console.log("Switching to backgroundMusic3 at level 10");
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.loop();
        musicSwitched = "level10"; // Nowa wartość dla poziomu 10
      } else if (level >= 5 && level <= 9 && musicSwitched !== "level5-9") {
        console.log("Switching to backgroundMusic2 at level 5-9");
        backgroundMusic.stop();
        backgroundMusic3.stop();
        backgroundMusic2.loop();
        musicSwitched = "level5-9"; // Wartość dla poziomów 5-9
      } else if (level < 5 && musicSwitched !== "level1-4") {
        console.log("Switching to backgroundMusic at level 1-4");
        backgroundMusic2.stop();
        backgroundMusic3.stop();
        backgroundMusic.loop();
        musicSwitched = "level1-4"; // Wartość dla poziomów 1-4
      }
  
      // Upewnij się, że odpowiednia muzyka gra
      if (level === 10 && !backgroundMusic3.isPlaying()) {
        console.log("Restarting backgroundMusic3 as it stopped unexpectedly");
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.loop();
      } else if (level >= 5 && level <= 9 && !backgroundMusic2.isPlaying()) {
        console.log("Restarting backgroundMusic2 as it stopped unexpectedly");
        backgroundMusic.stop();
        backgroundMusic3.stop();
        backgroundMusic2.loop();
      } else if (level < 5 && !backgroundMusic.isPlaying()) {
        console.log("Restarting backgroundMusic as it stopped unexpectedly");
        backgroundMusic2.stop();
        backgroundMusic3.stop();
        backgroundMusic.loop();
      }
    }

    // Aktualizacja obrotu logo z uwzględnieniem spowolnienia
    if (slowdownActive) {
      if (combo >= 20) logoAngle += baseRotationSpeed * 0.03 / SLOWDOWN_FACTOR;
      else logoAngle += baseRotationSpeed / SLOWDOWN_FACTOR;
    } else {
      if (combo >= 20) logoAngle += 0.03;
      else logoAngle += 0.01;
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
    fill(0, 0, 0, 200);
    let blackHoleSize = 200 + sin(millis() * 0.005) * 20;
    ellipse(eventX, eventY, blackHoleSize, blackHoleSize);
    if (!blackHoleSoundPlayed && soundInitialized) {
      holeSound.play();
      blackHoleSoundPlayed = true;
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
        badgeMessageTimer = 3000; // Reset timera przy każdym zdobyciu
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
      text(`Supernova Rush: ${floor(supernovaTimer / 1000)}s`, GAME_WIDTH / 2, 190); // Nowa pozycja y = 190
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
      challengeTimer = 12000;
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
          lifeBar -= 10;
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

    if (slowdownActive) {
      if (combo >= 20) logoAngle += baseRotationSpeed * 0.03 / SLOWDOWN_FACTOR;
      else logoAngle += baseRotationSpeed / SLOWDOWN_FACTOR;
    } else {
      if (combo >= 20) logoAngle += 0.03;
      else logoAngle += 0.01;
    }

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

  // TUTAJ ODZNAKA
  if (mainnetBadgeEarned) {
    drawMainnetBadge(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 60);
    fill(255, 215, 0, 200);
    textSize(16);
    text("Mainnet Badge", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200);
  }

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

// "Supernova Rush" – przeniesiony na środek, poniżej innych napisów
if (gameState === "supernova") {
  supernovaTimer -= deltaTime;
  fill(255, 100, 0, 50);
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  fill(255);
  textSize(20);
  text(`Supernova Rush: ${floor(supernovaTimer / 1000)}s`, GAME_WIDTH / 2, 190); // Nowa pozycja y = 190
  if (supernovaTimer <= 0) {
    gameState = "playing";
    pulseSpeed *= 2;
    obstacleTimer *= 2;
  }
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
        if (level === 5 && !musicSwitched) {
          console.log("Level 5 reached, switching to backgroundMusic2");
          backgroundMusic.stop();
          backgroundMusic2.loop();
          musicSwitched = "level5-9";
        }
      }
      goal = level <= 2 ? 50 : (level === 3 ? 70 : goal + 30);
      lives += 1;
      lifeBar = min(lifeBar + 20, 100);
      score = 0;
      combo = 0;
      comboBar = 0;
      if (level >= 10) {
        gameState = "bossIntro"; // Zmień na bossIntro
        stateStartTime = millis(); // Ustaw czas rozpoczęcia
        introClicked = false; // Reset zmiennej introClicked
        bossHealth = 1000;
        bossPhase = 1;
        bossActive = true;
        bossAttackTimer = 4000;
        cosmicNodes = [];
        nodesCollected = 0;
        powerUps = [];
        obstacles = [];
        if (soundInitialized) {
          backgroundMusic.stop();
          backgroundMusic2.stop();
          backgroundMusic3.stop();
          bossMusic.loop();
        }
      } else {
        gameState = "win";
        warpTimer = 1000;
      }
      if (soundInitialized) levelSound.play();
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: 255, g: 255, b: 255 }));
      }
    }else if (lives <= 0 || lifeBar <= 0) {
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

  else if (gameState === "gameOver") {
    // Zatrzymanie muzyki bossa i powrót do tła
    if (bossMusic.isPlaying()) {
      bossMusic.stop();
      backgroundMusic.loop(); // Wróć do muzyki tła
    }
  
    // Gradient background (Twój istniejący kod)
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "rgb(14, 39, 59)");
    gradient.addColorStop(1, "rgb(93, 208, 207)");
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Main game logo (superseedcosmicnet-gamelogo.png) at the top
    let mainLogoWidth = 400;
    let mainLogoHeight = 400;
    image(mainLogo, GAME_WIDTH / 2 - mainLogoWidth / 2, 50, mainLogoWidth, mainLogoHeight);
  
    // Game Over message and score
    fill(255, 200);
    textSize(40);
    textStyle(BOLD);
    text(`Network Down!\nScore: ${score.toFixed(1)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
  
    // Leaderboard title
    textSize(24);
    text("Top Synced Networks", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
  
    // Leaderboard entries
    textSize(18);
    for (let i = 0; i < leaderboard.length; i++) {
      text(`${i + 1}. ${leaderboard[i].nick}: ${leaderboard[i].score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20 + i * 30);
    }
  
    // Mainnet Badge (if earned)
    if (mainnetBadgeEarned) {
      drawMainnetBadge(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 60); // Środek, pod komunikatami
      fill(255, 215, 0, 200);
      textSize(16);
      text("Mainnet Badge", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200); // Tekst pod odznaką
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
  
    // Buttons: Relaunch, Share Score, and Menu
    let buttonX = GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2;
    
    // Relaunch Button
    fill(93, 208, 207);
    rect(buttonX, GAME_HEIGHT / 2 + 180, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("RELAUNCH", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180 + RESTART_BUTTON_HEIGHT / 2);
  
    // Share Score Button
    fill(93, 208, 207);
    rect(buttonX, GAME_HEIGHT / 2 + 260, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("SHARE SCORE", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 260 + RESTART_BUTTON_HEIGHT / 2);
  
    // Menu Button (NEW)
    fill(147, 208, 207); // Lekko jaśniejszy odcień dla wyróżnienia
    rect(buttonX, GAME_HEIGHT / 2 + 340, RESTART_BUTTON_WIDTH, RESTART_BUTTON_HEIGHT, 10);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("MENU", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 340 + RESTART_BUTTON_HEIGHT / 2);
  
    // Small White logo at the bottom
    let whiteLogoWidth = 100;
    let whiteLogoHeight = 50;
    image(whiteLogo, GAME_WIDTH / 2 - whiteLogoWidth / 2, GAME_HEIGHT - whiteLogoHeight - 20, whiteLogoWidth, whiteLogoHeight);
  }
   else if (gameState === "win") {
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
  if (!hasCompletedGame) {
    localStorage.setItem('hasCompletedGame', 'true');
    hasCompletedGame = true;
  }
  // Zatrzymanie muzyki bossa i powrót do tła
  if (bossMusic.isPlaying()) {
    bossMusic.stop();
    backgroundMusic.loop(); // Wróć do muzyki tła
  }
  // Tło z gradientem – bez zmian
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

  // Główne logo superseedcosmicnet-gamelogo.png – WRÓCONO NA POPRZEDNIĄ POZYCJĘ
  push();
  translate(0, -cardHeight / 4); // Przesunięcie na ~112 pikseli w górę od środka
  let mainLogoWidth = cardWidth * 0.9; // 90% szerokości karty (~270 pikseli)
  let mainLogoHeight = mainLogoWidth; // Kwadratowe proporcje
  tint(255, 215, 0, 220); // Lekko jaśniejszy złoty odcień
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = `rgba(255, 215, 0, 0.7)`; // Subtelny złoty cień
  imageMode(CENTER);
  image(mainLogo, 0, 0, mainLogoWidth, mainLogoHeight); // Główne logo
  drawingContext.shadowBlur = 0;
  pop();

  // Małe logo smallSuperseedIntro – PRZESUNIĘTE NIŻEJ
  push();
  translate(0, cardHeight / 6); // Przesunięcie ~75 pikseli w dół od środka
  rotate(millis() * 0.001); // Subtelna rotacja dla efektu
  let smallLogoWidth = cardWidth * 0.4; // 40% szerokości karty (~120 pikseli)
  let smallLogoHeight = smallLogoWidth; // Kwadratowe proporcje
  tint(255, 255, 255, 180); // Biały odcień z lekką przezroczystością dla kontrastu
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = `rgba(147, 208, 207, 0.5)`; // Subtelny cień w kolorze seedColor
  imageMode(CENTER);
  image(smallSuperseedIntro, 0, 0, smallLogoWidth, smallLogoHeight); // Małe logo
  drawingContext.shadowBlur = 0;
  pop();

  // Linie obwodów blockchain (dekoracja) – dostosowane do nowego układu
  noFill();
  stroke(93, 208, 207, 100);
  strokeWeight(1);
  for (let i = 0; i < 5; i++) {
    let y = map(i, 0, 4, cardHeight / 2 - 80, cardHeight / 2 - 20); // Przesunięte w dół, aby nie nachodziły na loga
    line(-cardWidth / 2 + 20, y, cardWidth / 2 - 20, y);
  }

  // Nazwa gry nad tytułem NFT
  stroke(14, 39, 59, 200);
  strokeWeight(1);
  fill(147, 208, 207);
  textSize(16);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  text("Superseed Cosmic Network", 0, cardHeight / 2 - 90);

  // Nazwa NFT na dole karty
  stroke(14, 39, 59, 200);
  strokeWeight(1);
  fill(255, 215, 0);
  textSize(24);
  textStyle(BOLD);
  text("Superseed Cosmic Core", 0, cardHeight / 2 - 60);

  // Subtelny napis "NFT"
  stroke(14, 39, 59, 200);
  strokeWeight(1);
  fill(255, 255, 255, 150);
  textSize(16);
  text("NFT", 0, cardHeight / 2 - 30);

  drawingContext.shadowBlur = 0;
  noStroke();
  pop();

  // Tekst poniżej karty – bez zmian
  stroke(14, 39, 59, 200);
  strokeWeight(1);
  fill(147, 208, 207);
  textSize(36);
  textStyle(BOLD);
  text("Superseed Cosmic Core Unlocked!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 250);
  textSize(20);
  text("Claim your NFT on Supersync Network soon! #SuperseedGrok3", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 290);

  // Przycisk "Claim NFT" – bez zmian
  fill(93, 208, 207);
  rect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 320, 200, 50, 10);
  fill(255);
  textSize(24);
  text("Claim NFT", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 345);

  // Przycisk "Back to Menu" – bez zmian
  fill(147, 208, 207);
  rect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 400, 200, 50, 10);
  fill(255);
  textSize(24);
  text("Back to Menu", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 425);
}

else if (gameState === "bossIntro") {
  // Wyświetl grafikę z poprawionym tekstem
  image(bossIntroImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Przejście do walki po 5 sekundach lub kliknięciu
  if (millis() - stateStartTime > 30000 || introClicked) {
    gameState = "bossFight";
    stateStartTime = millis();
    introClicked = false; // Reset po przejściu
  }
}
// Końcówka sekcji "bossFight" w draw() – pełna implementacja z kroku 3
else if (gameState === "bossFight") {
  if (!bossMusic.isPlaying()) {
    backgroundMusic.stop();
    backgroundMusic2.stop();
    backgroundMusic3.stop();
    bossMusic.loop();
  }

  // Tło
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B");
  gradient.addColorStop(1, "#93D0CF");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Inicjalizacja gracza
  if (!player) player = new Player();

  // Aktualizacja i rysowanie gracza
  player.update();
  player.show();

  // Automatyczne strzelanie gracza
  if (millis() - lastFireTime > fireRate) {
    playerBullets.push(new Bullet(player.x, player.y, GAME_WIDTH / 2, GAME_HEIGHT / 2));
    lastFireTime = millis();
    if (soundInitialized) clickSound.play();
  }

  // Pociski gracza
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    playerBullets[i].update();
    playerBullets[i].show();
    let d = dist(playerBullets[i].x, playerBullets[i].y, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    if (d < bossSize / 2) {
      bossHealth -= 5;
      score += 10;
      for (let j = 0; j < 5; j++) {
        particles.push(new Particle(playerBullets[i].x, playerBullets[i].y, { r: 0, g: 255, b: 255 }));
      }
      playerBullets.splice(i, 1);
    } else if (playerBullets[i].isOffScreen()) {
      playerBullets.splice(i, 1);
    }
  }

  // Timer dla apteczek
  if (!window.hasOwnProperty('lifePowerUpTimer')) lifePowerUpTimer = 0;
  lifePowerUpTimer -= deltaTime;
  if (lifePowerUpTimer <= 0 && random(1) < 0.005) {
    let lifePowerUp = new PowerUp(random(100, GAME_WIDTH - 100), random(100, GAME_HEIGHT - 100));
    lifePowerUp.type = "life";
    powerUps.push(lifePowerUp);
    lifePowerUpTimer = random(10000, 15000);
  }

  // Rysowanie i aktualizacja power-upów
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].update();
    powerUps[i].show();
    if (powerUps[i].isExpired()) {
      powerUps.splice(i, 1);
    }
  }

  // Boss – zmiana fazy na podstawie zdrowia
  bossPhase = floor(map(bossHealth, 0, 1000, 9, 0));
  bossPhase = constrain(bossPhase, 0, 9);
  bossSize = 200;
  image(
    bossImage,
    GAME_WIDTH / 2 - bossSize / 2, GAME_HEIGHT / 2 - bossSize / 2,
    bossSize, bossSize,
    bossPhase * bossFrameWidth, 0,
    bossFrameWidth, bossFrameWidth
  );

  // Ataki bossa – wspólny timer
  bossAttackTimer -= deltaTime;

  // Laser – aktywny od fazy 1, częstotliwość zależy od fazy
  if (random(1) < (0.01 + bossPhase * 0.005) && bossAttackTimer <= 0) { // 1% na fazę 0, rośnie do 5.5% na fazę 9
    bossAttackType = "laser";
    bossAttackTimer = 3000 + bossPhase * 500; // 3s na fazę 0, do 7.5s na fazę 9
  }
  if (bossAttackType === "laser" && bossAttackTimer > 0) {
    // Ostrzeżenie przed laserem
    if (bossAttackTimer > bossAttackTimer - 1000) { // Ostatnie 1000ms jako ostrzeżenie
      noFill();
      stroke(255, 0, 0, map(bossAttackTimer, bossAttackTimer - 1000, bossAttackTimer, 255, 0));
      strokeWeight(4);
      push();
      translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      rotate(millis() * 0.002); // Szybszy obrót dla dynamiki
      line(0, 0, 600, 0); // Dłuższy laser
      pop();
      noStroke();
    }
    // Laser
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    rotate(millis() * 0.002); // Szybszy obrót
    stroke(255, 0, 0, 200);
    strokeWeight(12); // Grubszy laser
    line(0, 0, 600, 0); // Dłuższy laser
    noStroke();
    pop();
    // Obrażenia – większy zasięg, sprawdzane wzdłuż linii lasera
    let laserAngle = millis() * 0.002;
    for (let i = 0; i < 600; i += 10) { // Sprawdzaj punkty wzdłuż lasera
      let laserX = GAME_WIDTH / 2 + cos(laserAngle) * i;
      let laserY = GAME_HEIGHT / 2 + sin(laserAngle) * i;
      if (dist(player.x, player.y, laserX, laserY) < 20 && !shieldActive) {
        lifeBar -= 5 * deltaTime / 16.67;
        break; // Jedno trafienie na klatkę
      }
    }
    if (bossAttackTimer <= 0) bossAttackType = null; // Reset po zakończeniu
  }

  // Pociski – fala i spirala jednocześnie z laserem
  if (bossAttackTimer <= 0) {
    // Fala – losowe odstępy i prędkości
    let numBullets = 8 + bossPhase * 2; // 8-26 pocisków w zależności od fazy
    for (let i = 0; i < numBullets; i++) {
      let angle = random(TWO_PI); // Losowy kąt zamiast równomiernego
      let bulletSpeed = random(5, 9 + bossPhase); // Losowa prędkość (5-18 w zależności od fazy)
      let bullet = new Bullet(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH / 2 + cos(angle) * 1000, GAME_HEIGHT / 2 + sin(angle) * 1000, false);
      bullet.speed = bulletSpeed;
      bossBullets.push(bullet);
    }

    // Spirala – bardziej chaotyczna
    if (bossPhase >= 3) { // Od fazy 3
      let spiralBullets = 6 + bossPhase; // 6-15 pocisków
      for (let i = 0; i < spiralBullets; i++) {
        let angle = millis() * 0.001 + random(-0.5, 0.5); // Losowe odchylenie
        let bulletSpeed = random(4, 8 + bossPhase * 0.5); // Losowa prędkość (4-12.5)
        let bullet = new Bullet(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH / 2 + cos(angle) * 1000, GAME_HEIGHT / 2 + sin(angle) * 1000, false);
        bullet.speed = bulletSpeed;
        bossBullets.push(bullet);
      }
    }

    bossAttackTimer = max(400, 1200 - bossPhase * 100); // 1200ms na fazę 0, do 400ms na fazę 9
    if (soundInitialized) nebulaSound.play();
  }

  // Pociski bossa – aktualizacja i kolizja
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    bossBullets[i].update();
    bossBullets[i].show();
    if (dist(bossBullets[i].x, bossBullets[i].y, player.x, player.y) < bossBullets[i].size / 2 + player.size / 2) {
      if (!shieldActive) lifeBar -= 15;
      else shieldActive = false;
      shakeTimer = 500;
      bossBullets.splice(i, 1);
      if (soundInitialized) meteorSound.play();
    } else if (bossBullets[i].isOffScreen()) {
      bossBullets.splice(i, 1);
    }
  }

  // Paski zdrowia
  fill(255, 0, 0, 200);
  rect(50, 20, map(bossHealth, 0, 1000, 0, GAME_WIDTH - 100), 20);
  stroke(255, 215, 0);
  strokeWeight(2);
  noFill();
  rect(50, 20, GAME_WIDTH - 100, 20);
  noStroke();

  fill(0, 255, 0, 200);
  rect(50, GAME_HEIGHT - 40, map(lifeBar, 0, 100, 0, GAME_WIDTH - 100), 20);
  stroke(255, 215, 0);
  strokeWeight(2);
  noFill();
  rect(50, GAME_HEIGHT - 40, GAME_WIDTH - 100, 20);
  noStroke();

  // Tekst fazy
  fill(255, 215, 0);
  textSize(24);
  text(`Phase ${bossPhase + 1}: Cosmic Core Guardian`, GAME_WIDTH / 2, 70);

  // Cząstki
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  // Zwycięstwo
  if (bossHealth <= 0) {
    gameState = "bossDefeated";
    bossDefeatTimer = 7500;
    zoomLevel = 1;
    playerBullets = [];
    bossBullets = [];
    if (soundInitialized) {
      bossMusic.stop();
      levelSound.play();
    }
  }
  if (lifeBar <= 0) {
    gameState = "gameOver";
    shakeTimer = 500;
  }
} else if (gameState === "bossDefeated") {
  introClicked = true; // Skip to endgame on click
  // Background
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B");
  gradient.addColorStop(1, "#93D0CF");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Animation
  bossDefeatTimer -= deltaTime;
  if (bossDefeatTimer > 3000) { // First 4.5 seconds: stage 9 + zoom
    zoomLevel = lerp(zoomLevel, 2, 0.05);
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    scale(zoomLevel);
    image(bossImage, -bossSize / 2, -bossSize / 2, bossSize, bossSize, 9 * bossFrameWidth, 0, bossFrameWidth, bossFrameWidth);
    pop();
  } else { // Last 3 seconds: stage 10 + new text
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    scale(zoomLevel);
    image(bossImage, -bossSize / 2, -bossSize / 2, bossSize, bossSize, 10 * bossFrameWidth, 0, bossFrameWidth, bossFrameWidth);
    pop();
    fill(255, 215, 0, 200);
    textSize(32);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Centralized Overseer defeated.\nSuperseed Testnet lives...\nThe true network (MAINNET) awakens...", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
  }

  // Decay particles
  if (random(1) < 0.2) {
    particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: 255, g: 215, b: 0 }));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  // Transition to endgame
  if (bossDefeatTimer <= -27000 || introClicked) { // -27000 = 3000 - 30000 (30s after initial 3s)
    gameState = "endgame";
    mainnetBadgeEarned = true;
    bossActive = false;
    if (soundInitialized) backgroundMusic.loop();
  }
}
pop(); // Zamknięcie push() z początku draw()
} // Zamknięcie funkcji draw()

// Zaktualizowana funkcja startGame() – krok 5
function startGame() {
  if (gameState === "start" || gameState === "gameOver" || gameState === "endgame" || gameState === "tutorial") {
    // Istniejące zmienne
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
    lastClickTime = millis();
    inactivityWarning = false;
    inactivityTimer = 0;
    gameStartTime = millis();
    mainnetChallengeTriggered = false;
    mainnetChallengeActive = false;
    mainnetChallengeScore = 0;
    mainnetBadgeEarned = false;
    musicSwitched = "level1-4"; // Reset do poziomu 1-4
    stateStartTime = 0;

    // Nowe zmienne dla mechaniki strzelanki (wstawione tutaj)
    player = null;
    playerBullets = [];
    bossBullets = [];
    lastFireTime = 0;
    fireRate = 200;
    bossHealth = 0;
    bossPhase = 1;
    bossActive = false;
    bossAttackTimer = 0; // Dodano, bo jest używane w draw()

    // Resetowanie i uruchamianie muzyki
    if (soundInitialized) {
      introMusic.stop();
      backgroundMusic2.stop();
      backgroundMusic3.stop();
      backgroundMusic.loop(); // Zawsze startuj z backgroundMusic na poziomie 1
      console.log("Music reset: backgroundMusic started for new game");
    }
  }
  gameState = "playing";
  if (!soundInitialized) {
    soundInitialized = true;
    backgroundMusic.loop(); // Inicjalizacja muzyki przy pierwszym dźwięku
  }
}

// Funkcja pauseGame() – zaktualizowana o nowe zmienne
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
    gameStartTime,
    stateStartTime, // Dodane: zapis stateStartTime
    musicSwitched,
    // Nowe zmienne dla mechaniki strzelanki
    player,
    playerBullets: [...playerBullets],
    bossBullets: [...bossBullets],
    lastFireTime,
    fireRate,
    bossHealth,
    bossPhase,
    bossActive,
    bossAttackTimer
  };
  gameState = "howToPlay";
  if (soundInitialized) {
    // Pauzuj aktualną muzykę tła w zależności od poziomu
    if (level === 10) {
      backgroundMusic3.pause();
    } else if (level >= 5 && musicSwitched === "level5-9") {
      backgroundMusic2.pause();
    } else {
      backgroundMusic.pause();
    }
    if (gameState === "bossFight") {
      bossMusic.pause();
    }
    // Włącz muzykę z intra
    introMusic.loop();
  }
}

// Funkcja resumeGame() – zaktualizowana o nowe zmienne
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
    stateStartTime = savedGameState.stateStartTime; // Dodane: wczytywanie stateStartTime
    musicSwitched = savedGameState.musicSwitched;
    // Nowe zmienne dla mechaniki strzelanki
    player = savedGameState.player;
    playerBullets = [...savedGameState.playerBullets];
    bossBullets = [...savedGameState.bossBullets];
    lastFireTime = savedGameState.lastFireTime;
    fireRate = savedGameState.fireRate;
    bossHealth = savedGameState.bossHealth;
    bossPhase = savedGameState.bossPhase;
    bossActive = savedGameState.bossActive;
    bossAttackTimer = savedGameState.bossAttackTimer;

    savedGameState = null;
    if (soundInitialized) {
      introMusic.stop(); // Zatrzymaj muzykę intro
      // Wznów odpowiednią muzykę tła w zależności od poziomu lub stanu
      if (gameState === "bossFight") {
        bossMusic.play();
      } else if (level === 10) {
        backgroundMusic3.play();
      } else if (level >= 5 && musicSwitched === "level5-9") {
        backgroundMusic2.play();
      } else {
        backgroundMusic.play();
      }
    }
  } else {
    startGame();
  }
}

// Zaktualizowana funkcja mousePressed() – krok 4 + poprawki
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

    // Choose Your Seed Color – bez zmian
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

    // Enter Your Nick – bez zmian
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

    // Start/Resume Button – bez zmian
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

    // Login/Logout Button – bez zmian
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
      adjustedMouseY >= 640 + verticalOffset &&
      adjustedMouseY <= 700 + verticalOffset
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

    // OBSŁUGA KLIKNIĘCIA W "Claim Your NFT" – bez zmian
    if (
      hasCompletedGame &&
      adjustedMouseX >= GAME_WIDTH / 2 - 120 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 120 &&
      adjustedMouseY >= 720 + verticalOffset &&
      adjustedMouseY <= 780 + verticalOffset
    ) {
      gameState = "endgame";
      console.log("Returning to claim NFT!");
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

    // ACHIEVEMENTS – bez zmian
    if (
      adjustedMouseX >= sideButtonX &&
      adjustedMouseX <= sideButtonX + 120 &&
      adjustedMouseY >= 380 &&
      adjustedMouseY <= 430
    ) {
      gameState = "achievements";
    }
  } else if (gameState === "achievements") {
    // CLOSE
    if (
      adjustedMouseX >= GAME_WIDTH / 2 - 60 &&
      adjustedMouseX <= GAME_WIDTH / 2 + 60 &&
      adjustedMouseY >= GAME_HEIGHT / 2 + 350 &&
      adjustedMouseY <= GAME_HEIGHT / 2 + 400
    ) {
      gameState = "howToPlay";
    }
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
    // Wybór koloru – bez zmian
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
    if (gameState === "endgame") {
      let claimButtonX = GAME_WIDTH / 2 - 100;
      let claimButtonY = GAME_HEIGHT / 2 + 320;
      if (
        adjustedMouseX >= claimButtonX &&
        adjustedMouseX <= claimButtonX + 200 &&
        adjustedMouseY >= claimButtonY &&
        adjustedMouseY <= claimButtonY + 50
      ) {
        console.log("Claim NFT clicked!");
        alert("NFT claim functionality coming soon on Supersync Network!");
      }
      let backButtonX = GAME_WIDTH / 2 - 100;
      let backButtonY = GAME_HEIGHT / 2 + 400;
      if (
        adjustedMouseX >= backButtonX &&
        adjustedMouseX <= backButtonX + 200 &&
        adjustedMouseY >= backButtonY &&
        adjustedMouseY <= backButtonY + 50
      ) {
        gameState = "howToPlay";
        console.log("Back to menu clicked from endgame!");
        if (soundInitialized) {
          backgroundMusic.stop();
          backgroundMusic2.stop();
          backgroundMusic3.stop();
          if (!introMusic.isPlaying()) {
            introMusic.loop();
          }
        }
      }
    } else if (gameState === "start") {
      startGame();
    } else if (gameState === "win") {
      gameState = "playing";
      score = 0;
      combo = 0;
      comboBar = 0;
      warpTimer = 0;
      lastPulse = millis();
      console.log(`Continuing to Orbit ${level}`);
    }
  } else if (gameState === "gameOver") {
    let buttonX = GAME_WIDTH / 2 - RESTART_BUTTON_WIDTH / 2;
    let relaunchButtonY = GAME_HEIGHT / 2 + 180;
    let shareScoreButtonY = GAME_HEIGHT / 2 + 260;
    let menuButtonY = GAME_HEIGHT / 2 + 340;

    // "RELAUNCH" Button
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= relaunchButtonY &&
      adjustedMouseY <= relaunchButtonY + RESTART_BUTTON_HEIGHT
    ) {
      console.log("Relaunch clicked!");
      startGame();
    }

    // "SHARE SCORE" Button
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= shareScoreButtonY &&
      adjustedMouseY <= shareScoreButtonY + RESTART_BUTTON_HEIGHT
    ) {
      console.log("Share Score clicked!");
      let shareText = `I synced ${score.toFixed(1)} points in Superseed Cosmic Network! #SuperseedGrok3`;
      navigator.clipboard.writeText(shareText);
      alert("Score copied to clipboard: " + shareText);
    }

    // "MENU" Button
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
      adjustedMouseY >= menuButtonY &&
      adjustedMouseY <= menuButtonY + RESTART_BUTTON_HEIGHT
    ) {
      console.log("Menu clicked!");
      gameState = "howToPlay";
      if (soundInitialized) {
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.stop();
        introMusic.loop();
      }
    }

    // "SHARE BADGE" Button (jeśli zdobyto odznakę)
    if (mainnetBadgeEarned) {
      let badgeButtonY = GAME_HEIGHT / 2 + 270; // Dostosuj pozycję, jeśli różni się od "SHARE SCORE"
      if (
        adjustedMouseX >= buttonX &&
        adjustedMouseX <= buttonX + RESTART_BUTTON_WIDTH &&
        adjustedMouseY >= badgeButtonY &&
        adjustedMouseY <= badgeButtonY + RESTART_BUTTON_HEIGHT
      ) {
        console.log("Share Badge clicked!");
        let shareText = `I just unlocked the Superseed Mainnet in the Grok3 Game Contest! Join the challenge and win a Tesla! (virtual:) #SuperseedGrok3 [game link]`;
        navigator.clipboard.writeText(shareText);
        alert("Badge share text copied to clipboard: " + shareText);
      }
    }
  }
 else if (gameState === "playing" || gameState === "supernova" || gameState === "bossFight") {
    lastClickTime = millis();
    if (inactivityWarning) inactivityWarning = false;

    // Aktywacja Pulse Dampener
    let buttonX = GAME_WIDTH - 120 - 10;
    let buttonY = 100;
    let buttonWidth = 120;
    let buttonHeight = 50;
    let SLOWDOWN_COST = level >= 10 ? 20 : 15;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + buttonWidth &&
      adjustedMouseY >= buttonY &&
      adjustedMouseY <= buttonY + buttonHeight &&
      level >= 7 &&
      !slowdownActive &&
      slowdownCooldown <= 0 &&
      score >= SLOWDOWN_COST
    ) {
      slowdownActive = true;
      slowdownTimer = SLOWDOWN_DURATION;
      slowdownCooldown = SLOWDOWN_COOLDOWN;
      score -= SLOWDOWN_COST;
      pulseSpeed *= SLOWDOWN_FACTOR;
      basePulseSpeed = pulseSpeed / SLOWDOWN_FACTOR;
      obstacles.forEach(o => {
        o.speedX *= SLOWDOWN_FACTOR;
        o.speedY *= SLOWDOWN_FACTOR;
      });
      baseRotationSpeed = 0.01 / SLOWDOWN_FACTOR;
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(logoX, logoY, { r: 255, g: 215, b: 0 }));
      }
      if (soundInitialized) powerUpSound.play();
    }

    // Przycisk pauzy
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

    // Logika klikania zależna od stanu gry
    if (gameState === "playing" || gameState === "supernova") {
      let d = dist(adjustedMouseX, adjustedMouseY, logoX, logoY);
      if (d < circleSize / 2 && isReadyToClick) {
        if (activeEvent === "blackHole" && dist(logoX, logoY, eventX, eventY) < 300) {
          return;
        }
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
    }

    // Power-upy i przeszkody
    for (let i = powerUps.length - 1; i >= 0; i--) {
      let pd = dist(adjustedMouseX, adjustedMouseY, powerUps[i].x, powerUps[i].y);
      if (pd < powerUps[i].size) {
        if (powerUps[i].type === "life") {
          lifeBar = min(lifeBar + 30, 100); // Przywraca 30 HP, max 100
          for (let j = 0; j < 10; j++) {
            particles.push(new Particle(powerUps[i].x, powerUps[i].y, { r: 0, g: 255, b: 0 }));
          }
          if (soundInitialized) powerUpSound.play();
        } else if (powerUps[i].type === "gas") {
          powerUpEffect = "gas";
          powerUpEffectTime = powerUpDurations.gas * (1 + level * 0.1);
        } else if (powerUps[i].type === "pulse") {
          fireRate = max(fireRate - 50, 100); // Przyspieszenie strzelania w bossFight
          powerUpEffect = "pulse";
          powerUpEffectTime = powerUpDurations.pulse * (1 + level * 0.1);
        } else if (powerUps[i].type === "orbit") {
          powerUpEffect = "orbit";
          shieldActive = true;
          powerUpEffectTime = powerUpDurations.orbit * (1 + level * 0.1);
        } else if (powerUps[i].type === "meteor") {
          powerUpEffect = "meteor";
          meteorShowerActive = true;
          powerUpEffectTime = powerUpDurations.meteor * (1 + level * 0.1);
        } else if (powerUps[i].type === "star") {
          powerUpEffect = "star";
          starBoostActive = true;
          powerUpEffectTime = powerUpDurations.star * (1 + level * 0.1);
        } else if (powerUps[i].type === "wave") {
          if (gameState === "bossFight") {
            bossBullets = []; // Czyści pociski bossa
            for (let j = 0; j < 20; j++) {
              particles.push(new Particle(player.x, player.y, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
            }
          }
        }
        if (powerUps[i].type !== "wave") { // "Wave" nie wymaga dodatkowych cząstek
          for (let j = 0; j < 20; j++) {
            particles.push(new Particle(powerUps[i].x, powerUps[i].y, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
          }
          if (soundInitialized) powerUpSound.play();
        }
        powerUps.splice(i, 1);
      }
    }

    // Przeszkody – scalona i poprawiona logika
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let od = dist(adjustedMouseX, adjustedMouseY, obstacles[i].x, obstacles[i].y);
      if (od < obstacles[i].size / 2) { // Ujednolicono warunek
        if (!shieldActive) {
          lives -= 1;
          lifeBar -= 20; // Ujednolicono obrażenia
          shakeTimer = 500; // Dodano z Twojego fragmentu
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

// Pozostałe funkcje bez zmian
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