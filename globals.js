// Global Variables

const SLOWDOWN_DURATION = 10000;
const SLOWDOWN_COOLDOWN = 30000;
const SLOWDOWN_FACTOR = 1.5;

const ethersLib = window.ethers;

const SYNC_INTERVAL = 2000; // Do usunięcia w nowej mechanice, jeśli niepotrzebne

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
let lifeRestoreSound;
let pulseBoostSound;
let freezeSound;
let growSound;
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
let bossDefeatedSuccessfully = false; 

let scrollOffset = 0; // Przesunięcie w pionie
let maxScrollOffset = 0; // Maksymalne przesunięcie (obliczone na podstawie treści)

let demoProbes = [];
let demoParticles = [];
let demoFragments = [];
let fragmentsCollected = [];
let bgStars = [];
let demoTransitionTimer = 0;
// Dodaj te zmienne do sekcji zmiennych globalnych
let miningProbes = [];
let fragments = 0;
let probes = 1;
let productionBoost = false;
let boostTimer = 0;
let lastUpdate = 0;
let showDailyBonus = false;
let dailyBonusAmount = 0;

let scaleFactor = 1; 

let miningPreviewProbes = []; // Tablica na sondy w trybie podglądu

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

let superseedSepolia = {
    chainId: "0xD036",
    chainName: "Superseed Sepolia Testnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.superseed.xyz"],
    blockExplorerUrls: ["https://sepolia-explorer.superseed.xyz"],
  };

  // globals.js
let newsMessages = [
  "Superseed Testnet live now! Sync to earn rewards.",
  "Mobile version coming soon – stay tuned!",
  "Reach Orbit 10 to claim your Cosmic Core NFT!",
  "New Mining Hub preview available – check it out!"
]; // Lista wiadomości
let currentNewsIndex = 0; // Indeks aktualnej wiadomości
let newsOffset = 0; // Przesunięcie tekstu dla efektu przewijania
let newsSpeed = 5; // Prędkość przewijania (piksele na klatkę)
