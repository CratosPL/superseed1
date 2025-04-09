
const contractAddress = "0x2847ed1F9b57014Ac016aECf88267181572CB0E0"; // Nowy kontrakt z getTopScores
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ScoreUpdated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_player", "type": "address" }
    ],
    "name": "getScore",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopScores",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "score", "type": "uint256" }
        ],
        "internalType": "struct SuperseedGameScores.Score[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "playerScores",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_score", "type": "uint256" }
    ],
    "name": "saveScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Klasy przeniesione do classes.js

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
// Połączenie z portfelem (zaktualizowane o fetchBlockchainLeaderboard)
async function connectWallet(forceReconnect = false) {
  if (isConnecting) {
    console.log("Połączenie w toku, proszę czekać...");
    return;
  }
  isConnecting = true;
  try {
    console.log("Rozpoczynanie połączenia z portfelem...");
    if (!web3Modal) {
      console.log("Web3Modal nie zainicjalizowany, inicjalizuję teraz...");
      await initializeWeb3Modal();
    }
    if (!web3Modal) throw new Error("Inicjalizacja Web3Modal nie powiodła się");

    if (forceReconnect) {
      web3Modal.clearCachedProvider();
      localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
      localStorage.removeItem("walletconnect");
      isConnected = false;
      userAddress = null;
      provider = null;
      signer = null;
    }

    const instance = await Promise.race([
      web3Modal.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Przekroczono czas połączenia po 20s")), 20000)),
    ]);

    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    gameContract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Kontrakt gry zainicjalizowany:", gameContract);

    console.log("Accounts:", await provider.listAccounts());
    isConnected = true;

    const network = await provider.getNetwork();
    console.log("Aktualna sieć chainId:", network.chainId);
    if (network.chainId !== 53302n) { // Używam 53302n, bo network.chainId jest BigInt
      console.log("Przełączanie na Superseed Sepolia Testnet...");
      await Promise.race([
        provider.send("wallet_switchEthereumChain", [{ chainId: "0xD036" }]),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Switch chain timeout")), 10000)),
      ]);
    }

    console.log("Połączono z portfelem:", userAddress);
    connectionError = null;

    await fetchBlockchainLeaderboard(); // Pobierz leaderboard po połączeniu
  } catch (error) {
    console.error("Połączenie z portfelem nie powiodło się:", error);
    isConnected = false;
    userAddress = null;
    provider = null;
    signer = null;
    connectionError = "Nie udało się połączyć z portfelem: " + error.message;
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

// Pobieranie leaderboardu
async function fetchBlockchainLeaderboard() {
  console.log("Fetching leaderboard, called from:", new Error().stack.split("\n")[2]); // Pokazuje miejsce wywołania
  if (!gameContract) {
    console.warn("Contract not initialized, cannot fetch leaderboard");
    blockchainLeaderboard = [];
    return;
  }
  try {
    const scores = await gameContract.getTopScores();
    blockchainLeaderboard = scores
      .map((entry) => ({
        nick: entry.player.slice(0, 6) + "..." + entry.player.slice(-4),
        score: parseInt(entry.score),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    console.log("Blockchain leaderboard updated:", blockchainLeaderboard);
    leaderboardFetched = true;
  } catch (error) {
    console.error("Failed to fetch blockchain leaderboard:", error);
    blockchainLeaderboard = [];
    leaderboardFetched = false;
  }
}

// Zapis wyniku (zaktualizowany o odświeżenie leaderboardu)
async function saveScoreToBlockchain(score) {
  if (!isConnected || !gameContract || !signer) {
    console.warn("Cannot save score: Wallet not connected or contract not initialized");
    saveMessage = "Connect wallet to save score!";
    saveMessageTimer = 5000;
    return;
  }
  try {
    console.log(`Saving score ${score} for ${userAddress} to Superseed Testnet...`);
    const tx = await gameContract.saveScore(Math.floor(score));
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Score saved to blockchain:", receipt);
    await fetchBlockchainLeaderboard(); // Odśwież leaderboard
    saveMessage = "Score saved to Superseed Testnet!";
    saveMessageTimer = 5000; 
    return true;
  } catch (error) {
    console.error("Failed to save score:", error);
    saveMessage = "Failed to save score: " + error.message;
    saveMessageTimer = 5000;
    throw error;
  }
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
  lifeRestoreSound = loadSound('assets/lifeRestoreSound.mp3');
  pulseBoostSound = loadSound('assets/pulseBoostSound.mp3');
  shieldOnSound = loadSound('assets/shieldOnSound.mp3');
  freezeSound = loadSound('assets/freezeSound.mp3');
  growSound = loadSound('assets/growSound.mp3');
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
  createCanvas(windowWidth, windowHeight);
  GAME_WIDTH = windowWidth;
  GAME_HEIGHT = windowHeight;
  textAlign(CENTER, CENTER);
  textFont("Open Sans");
  logoX = GAME_WIDTH / 2;
  logoY = GAME_HEIGHT / 2;

  for (let i = 0; i < 20; i++) {
    bgParticles.push(new BgParticle());
  }
  for (let i = 0; i < 5; i++) {
    miningPreviewProbes.push(new MiningProbe());
  }
  
  // Inicjalizacja sond
  for (let i = 0; i < probes; i++) {
    miningProbes.push(new Probe());
  }

  // Inicjalizacja gwiazdek w tle
  for (let i = 0; i < 50; i++) {
    bgStars.push({
      x: random(GAME_WIDTH),
      y: random(GAME_HEIGHT),
      size: random(1, 3),
      alpha: random(100, 255)
    });
  }

  clickSound.setVolume(1.0);
  backgroundMusic.setVolume(0.5);
  backgroundMusic2.setVolume(0.5);
  backgroundMusic3.setVolume(0.5);
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
    initializeWeb3Modal().then(() => {
      
    });
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
  
    let aspectRatio = 2912 / 1632; // ≈ 1.78
    let bgX, bgY, bgWidth, bgHeight;
  
    // Calculate dimensions to fill the screen while preserving aspect ratio
    if (GAME_WIDTH / GAME_HEIGHT > aspectRatio) {
      // Screen wider than image -> fit width, crop height
      bgWidth = GAME_WIDTH;
      bgHeight = bgWidth / aspectRatio;
      bgX = 0;
      bgY = (GAME_HEIGHT - bgHeight) / 2; // Center vertically
    } else {
      // Screen narrower than image -> fit height, crop width
      bgHeight = GAME_HEIGHT;
      bgWidth = bgHeight * aspectRatio;
      bgX = (GAME_WIDTH - bgWidth) / 2; // Center horizontally
      bgY = 0;
    }
  
    // Scene 1: "The Fall"
    if (introState === 0) {
      image(upadekBg, bgX, bgY, bgWidth, bgHeight);
      let logoPulse = lerp(50, 100, sin(currentTime * 0.002));
      tint(255, 200);
      imageMode(CENTER);
      image(logo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoPulse, logoPulse);
      fill(255, 200);
      textSize(GAME_WIDTH < 768 ? 18 : 24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "In a galaxy bound by centralized chains\nthe old networks fell silent.\nOne seed remained – a spark of hope.",
        GAME_WIDTH / 2,
        GAME_HEIGHT - (GAME_WIDTH < 768 ? 100 : 150)
      );
    }
    // Scene 2: "Call to Sync"
    else if (introState === 1) {
      image(synchronizacjaBg, bgX, bgY, bgWidth, bgHeight);
      let logoPulse = lerp(minSize, maxSize, sin(currentTime * 0.002));
      tint(seedColor.r, seedColor.g, seedColor.b, 200);
      imageMode(CENTER);
      image(logo, GAME_WIDTH / 2, GAME_HEIGHT / 2, logoPulse, logoPulse);
      for (let i = 0; i < 4; i++) {
        let angle = TWO_PI / 4 * i + currentTime * 0.001;
        let orbitRadius = GAME_WIDTH < 768 ? min(100, GAME_WIDTH * 0.15) : 150;
        let px = GAME_WIDTH / 2 + cos(angle) * orbitRadius;
        let py = GAME_HEIGHT / 2 + sin(angle) * orbitRadius;
        let p = new PowerUp(px, py);
        p.type = ["life", "gas", "pulse", "orbit"][i];
        p.show();
      }
      stroke(14, 39, 59);
      strokeWeight(2);
      fill(93, 208, 207);
      textSize(GAME_WIDTH < 768 ? 18 : 24);
      textStyle(BOLD);
      text(
        "You’ve been chosen to awaken the Superseed Mainnet.\nSync cosmic nodes, harness power-ups,\nand forge a decentralized future – orbit by orbit.",
        GAME_WIDTH / 2,
        GAME_HEIGHT - (GAME_WIDTH < 768 ? 100 : 150)
      );
      noStroke();
    }
    // Scene 3: "The Reward Awaits"
    else if (introState === 2) {
      image(nagrodaBg, bgX, bgY, bgWidth, bgHeight);
      if (random(1) < 0.2) {
        particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].isDead()) particles.splice(i, 1);
      }
  
      let logoWidth = GAME_WIDTH < 768 ? min(200, GAME_WIDTH * 0.4) : 300;
      let logoHeight = logoWidth / 2;
      image(whiteLogo, GAME_WIDTH / 2 - logoWidth / 2, GAME_WIDTH < 768 ? 30 : 50, logoWidth, logoHeight);
  
      // NFT Card – Superseed Cosmic Core
      push();
      translate(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
      rotate(sin(currentTime * 0.001) * 0.1);
      let pulseScale = 1 + sin(currentTime * 0.005) * 0.05;
  
      let cardWidth = 300 * pulseScale;
      let cardHeight = 450 * pulseScale;
  
      let cardGradient = drawingContext.createLinearGradient(-cardWidth / 2, -cardHeight / 2, cardWidth / 2, cardHeight / 2);
      cardGradient.addColorStop(0, `rgba(${seedColor.r}, ${seedColor.g}, ${seedColor.b}, 0.8)`);
      cardGradient.addColorStop(1, "rgba(14, 39, 59, 0.9)");
      drawingContext.fillStyle = cardGradient;
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
      translate(0, -cardHeight / 4);
      let mainLogoWidth = cardWidth * 0.9;
      let mainLogoHeight = mainLogoWidth;
      tint(255, 215, 0, 220);
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = `rgba(255, 215, 0, 0.7)`;
      imageMode(CENTER);
      image(mainLogo, 0, 0, mainLogoWidth, mainLogoHeight);
      drawingContext.shadowBlur = 0;
      pop();
  
      push();
      translate(0, cardHeight / 6);
      rotate(currentTime * 0.001);
      let smallLogoWidth = cardWidth * 0.4;
      let smallLogoHeight = smallLogoWidth;
      tint(255, 255, 255, 180);
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = `rgba(147, 208, 207, 0.5)`;
      imageMode(CENTER);
      image(smallSuperseedIntro, 0, 0, smallLogoWidth, smallLogoHeight);
      drawingContext.shadowBlur = 0;
      pop();
  
      noFill();
      stroke(93, 208, 207, 100);
      strokeWeight(1);
      for (let i = 0; i < 5; i++) {
        let y = map(i, 0, 4, cardHeight / 2 - 80, cardHeight / 2 - 20);
        line(-cardWidth / 2 + 20, y, cardWidth / 2 - 20, y);
      }
  
      stroke(14, 39, 59, 200);
      strokeWeight(1);
      fill(147, 208, 207);
      textSize(16);
      textStyle(NORMAL);
      text("Superseed Cosmic Network", 0, cardHeight / 2 - 90);
  
      stroke(14, 39, 59, 200);
      strokeWeight(1);
      fill(255, 215, 0);
      textSize(24);
      textStyle(BOLD);
      text("Superseed Cosmic Core", 0, cardHeight / 2 - 60);
  
      stroke(14, 39, 59, 200);
      strokeWeight(1);
      fill(255, 255, 255, 150);
      textSize(16);
      text("NFT", 0, cardHeight / 2 - 30);
  
      drawingContext.shadowBlur = 0;
      noStroke();
      pop();
  
      stroke(14, 39, 59, 200);
      strokeWeight(3);
      fill(255, 245, 102);
      textSize(GAME_WIDTH < 768 ? 18 : 24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "Reach Orbit 10, sync the Mainnet,\nand claim your Superseed Cosmic Core NFT\non the Supersync Network!",
        GAME_WIDTH / 2,
        GAME_HEIGHT - (GAME_WIDTH < 768 ? 100 : 150)
      );
      noStroke();
  
      stroke(14, 39, 59, 200);
      strokeWeight(1);
      fill(147, 208, 207);
      textSize(GAME_WIDTH < 768 ? 12 : 16);
      text("#SuperseedGrok3", GAME_WIDTH / 2, GAME_HEIGHT - (GAME_WIDTH < 768 ? 30 : 50));
      noStroke();
    }
  
    // NEXT Button and remaining logic
    let nextButtonX = GAME_WIDTH - 100;
    let nextButtonY = GAME_HEIGHT - 50;
    fill(93, 208, 207);
    rect(nextButtonX, nextButtonY, 80, 30, 5);
    fill(255);
    textSize(16);
    text("NEXT", nextButtonX + 40, nextButtonY + 15);
  
    let timeLeft = introDuration - (currentTime - introTimer);
    fill(255, 200);
    textSize(16);
    text(`${floor(timeLeft / 1000)}s`, GAME_WIDTH / 2, 50);
  
    pop();
  
    // Automatic transition
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
    push();
    translate((width - GAME_WIDTH) / 2, (height - GAME_HEIGHT) / 2);
  
    let aspectRatio = 1536 / 1024;
    let bgX, bgY, bgWidth, bgHeight;
    let scaleX = GAME_WIDTH / 1536;
    let scaleY = GAME_HEIGHT / 1024;
    let scale = Math.max(scaleX, scaleY);
    bgWidth = 1536 * scale;
    bgHeight = 1024 * scale;
    bgX = (GAME_WIDTH - bgWidth) / 2;
    bgY = GAME_HEIGHT - bgHeight;
    if (bgHeight < GAME_HEIGHT) bgY = 0;
    drawingContext.filter = 'blur(5px)';
    image(cosmicMenuBg, bgX, bgY, bgWidth, bgHeight);
    drawingContext.filter = 'none';
  
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
  
    // === System newsów ===
    // Tło paska newsów
    fill(14, 39, 59, 200); // Ciemne tło z lekką przezroczystością
    rect(0, 0, GAME_WIDTH, 40); // Pasek na górze ekranu, wysokość 40px
  
    // Tekst newsów
    fill(255, 215, 0); // Złoty kolor dla widoczności
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
  
    let currentNews = newsMessages[currentNewsIndex];
    let textWidth = drawingContext.measureText(currentNews).width; // Poprawnie mierzona szerokość tekstu
  

    
    // Przewijanie tekstu
    text(currentNews, newsOffset, 20); // Pozycja y=20 (środek paska)
    newsOffset -= newsSpeed; // Przesuwaj w lewo
  
    // Jeśli tekst całkowicie przewinął się poza ekran, zmień na kolejny
    if (newsOffset < -textWidth) {
      newsOffset = GAME_WIDTH; // Resetuj pozycję na prawo
      currentNewsIndex = (currentNewsIndex + 1) % newsMessages.length; // Przejdź do następnej wiadomości
    }
    // === Koniec systemu newsów ===
  
    // Logo przesunięte w dół o 40px, aby zrobić miejsce na pasek newsów
    let logoScale = 1 + sin(millis() * 0.002) * 0.05;
    let logoSize = 280 * logoScale; // Zmniejszone z 320
    image(mainLogo, GAME_WIDTH / 2 - logoSize / 2, 20 + 40, logoSize, logoSize); // Przesunięte z 20 na 60
  
    let verticalOffset = 60;
  
    // "Choose Your Seed Color" – z wyraźnym wyśrodkowaniem
  fill(249, 249, 242);
  textSize(18);
  textAlign(CENTER, BASELINE); // Upewniamy się, że jest wyśrodkowane
  text("Choose Your Seed Color", GAME_WIDTH / 2, 260 + verticalOffset);
  let colorBoxSize = 45;
  let colorBoxSpacing = 20;
  let startX = GAME_WIDTH / 2 - (colorBoxSize * 3 + colorBoxSpacing * 2) / 2;
  let pulse = 1 + sin(millis() * 0.005) * 0.1;
  fill(0, 255, 0);
  rect(startX, 280 + verticalOffset, colorBoxSize, colorBoxSize, 15);
  fill(0, 0, 255);
  rect(startX + colorBoxSize + colorBoxSpacing, 280 + verticalOffset, colorBoxSize, colorBoxSize, 15);
  fill(255, 215, 0);
  rect(startX + (colorBoxSize + colorBoxSpacing) * 2, 280 + verticalOffset, colorBoxSize, colorBoxSize, 15);
  stroke(147, 208, 207);
  strokeWeight(3);
  noFill();
  if (seedColor.r === 0 && seedColor.g === 255 && seedColor.b === 0) {
    rect(startX, 280 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  } else if (seedColor.r === 0 && seedColor.g === 0 && seedColor.b === 255) {
    rect(startX + colorBoxSize + colorBoxSpacing, 280 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  } else if (seedColor.r === 255 && seedColor.g === 215 && seedColor.b === 0) {
    rect(startX + (colorBoxSize + colorBoxSpacing) * 2, 280 + verticalOffset, colorBoxSize * pulse, colorBoxSize * pulse, 15);
  }
  noStroke();
  
    fill(249, 249, 242);
    textSize(18);
    text("Enter Your Nick", GAME_WIDTH / 2, 350 + verticalOffset);
    fill(128, 131, 134, 180);
    stroke(147, 208, 207);
    strokeWeight(3);
    rect(GAME_WIDTH / 2 - 90, 370 + verticalOffset, 180, 35, 10);
    fill(249, 249, 242);
    textSize(16);
    textAlign(CENTER, CENTER);
    if (isTypingNick) {
      let cursor = (floor(millis() / 500) % 2 === 0) ? "|" : "";
      text(playerNick + cursor, GAME_WIDTH / 2, 387 + verticalOffset);
    } else {
      text(playerNick || "Click to type", GAME_WIDTH / 2, 387 + verticalOffset);
    }
    noStroke();
  
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 90, 420 + verticalOffset, GAME_WIDTH / 2 + 90, 420 + verticalOffset);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(3);
    rect(GAME_WIDTH / 2 - 90, 420 + verticalOffset, 180, 45, 15);
    noStroke();
    fill(14, 39, 59);
    textSize(22);
    let buttonText = savedGameState ? "RESUME" : "START";
    text(buttonText, GAME_WIDTH / 2, 442 + verticalOffset);
  
    if (!isConnected) {
      gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 90, 475 + verticalOffset, GAME_WIDTH / 2 + 90, 475 + verticalOffset);
      gradient.addColorStop(0, "#0E273B");
      gradient.addColorStop(1, "#808386");
      drawingContext.fillStyle = gradient;
      stroke(147, 208, 207);
      strokeWeight(3);
      rect(GAME_WIDTH / 2 - 90, 475 + verticalOffset, 180, 45, 15);
      noStroke();
      fill(249, 249, 242);
      textSize(22);
      text("LOGIN (Opt.)", GAME_WIDTH / 2, 497 + verticalOffset);
    } else {
      fill(93, 208, 207);
      textSize(14);
      text(`Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`, GAME_WIDTH / 2, 475 + verticalOffset);
      gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 90, 485 + verticalOffset, GAME_WIDTH / 2 + 90, 485 + verticalOffset);
      gradient.addColorStop(0, "#FF4500");
      gradient.addColorStop(1, "#FFD700");
      drawingContext.fillStyle = gradient;
      stroke(147, 208, 207);
      strokeWeight(3);
      rect(GAME_WIDTH / 2 - 90, 485 + verticalOffset, 180, 45, 15);
      noStroke();
      fill(249, 249, 242);
      textSize(22);
      text("LOGOUT", GAME_WIDTH / 2, 507 + verticalOffset);
    }
  
    fill(147, 208, 207, 200);
    textSize(12);
    textStyle(NORMAL);
    text("Login optional – save scores and claim NFT on Superseed Testnet", GAME_WIDTH / 2, 540 + verticalOffset);
    text("after completing 10 orbits and defeating the boss!", GAME_WIDTH / 2, 555 + verticalOffset);
  
    if (hasCompletedGame) {
      fill(93, 208, 207);
      rect(GAME_WIDTH / 2 - 90, 580 + verticalOffset, 180, 45, 10);
      fill(255);
      textSize(18);
      text("Claim Your NFT", GAME_WIDTH / 2, 602 + verticalOffset);
    }
  
    let noticeX = GAME_WIDTH / 2;
    let noticeY = 640 + verticalOffset;
    let mobileY = 670 + verticalOffset;
    let pulseScale = 1 + sin(millis() * 0.005) * 0.1;
  
    let noticeTextSize = GAME_WIDTH < 768 ? 16 : 24;
    let mobileTextSize = GAME_WIDTH < 768 ? 12 : 18;
  
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "rgba(255, 50, 50, 1)";
    fill(255, 50, 50, 255);
    textStyle(BOLD);
    textSize(noticeTextSize);
    text("NOTICE: Desktop Only For Now", noticeX, noticeY);
  
    drawingContext.shadowBlur = 5;
    drawingContext.shadowColor = "rgba(255, 215, 0, 0.8)";
    fill(255, 215, 0, 255);
    textSize(mobileTextSize);
    text("Mobile Version Coming Soon!", noticeX, mobileY);
    drawingContext.shadowBlur = 0;
  
    let sideButtonWidth = 120;
    let sideButtonX = GAME_WIDTH - sideButtonWidth - 20;
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 200, sideButtonX + sideButtonWidth, 200);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 200, sideButtonWidth, 50, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("INFO", sideButtonX + sideButtonWidth / 2, 225);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 260, sideButtonX + sideButtonWidth, 260);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 260, sideButtonWidth, 50, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(16);
    text("TUTORIAL", sideButtonX + sideButtonWidth / 2, 285);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 320, sideButtonX + sideButtonWidth, 320);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 320, sideButtonWidth, 50, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(16);
    text("VIEW INTRO", sideButtonX + sideButtonWidth / 2, 345);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 380, sideButtonX + sideButtonWidth, 380);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 380, sideButtonWidth, 50, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(16);
    text("ACHIEVEMENTS", sideButtonX + sideButtonWidth / 2, 405);
  
    gradient = drawingContext.createLinearGradient(sideButtonX, 440, sideButtonX + sideButtonWidth, 440);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    stroke(147, 208, 207);
    strokeWeight(2);
    rect(sideButtonX, 440, sideButtonWidth, 50, 10);
    noStroke();
    fill(14, 39, 59);
    textSize(16);
    text("MINING HUB", sideButtonX + sideButtonWidth / 2, 465);
  
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
  
    pop();
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
    // Gradient Background (bez zmian)
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "#081A2A");
    gradient.addColorStop(0.5, "#5A8A8F");
    gradient.addColorStop(1, "#4A4D50");
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Modal
    let modalWidth = GAME_WIDTH * 0.8;
    let modalHeight = GAME_HEIGHT * 0.8;
    let modalX = (GAME_WIDTH - modalWidth) / 2;
    let modalY = (GAME_HEIGHT - modalHeight) / 2;
    fill(14, 39, 59, 230);
    rect(modalX, modalY, modalWidth, modalHeight, 20);
  
    // Pulsująca ramka
    let pulseProgress = sin(millis() * 0.002) * 0.5 + 0.5;
    stroke(93, 208, 207, map(pulseProgress, 0, 1, 100, 255));
    strokeWeight(5 + pulseProgress * 2);
    noFill();
    rect(modalX, modalY, modalWidth, modalHeight, 20);
    noStroke();
  
    // Obszar przewijania
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(modalX, modalY, modalWidth, modalHeight);
    drawingContext.clip();
    translate(0, -scrollOffset);
  
    let contentY = modalY + 20;
    textAlign(CENTER, BASELINE);
  
    // Nagłówek
    gradient = drawingContext.createLinearGradient(GAME_WIDTH / 2 - 200, contentY, GAME_WIDTH / 2 + 200, contentY);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    textSize(36); // Bez zmian, ale można zwiększyć do 40, jeśli chcesz
    textStyle(BOLD);
    text("Game Info", GAME_WIDTH / 2, contentY + 20);
    contentY += 60;
  
    // Dynamiczne tło z gwiazdkami
    for (let i = bgParticles.length - 1; i >= 0; i--) {
      bgParticles[i].update();
      bgParticles[i].show(pulseProgress);
    }
  
    // Scoring Section
    fill(93, 208, 207);
    textSize(28); // Zwiększone z 24 na 28
    textStyle(BOLD);
    text("Scoring", GAME_WIDTH / 2, contentY);
    fill(249, 249, 242);
    textSize(16); // Zwiększone z 14 na 16
    textStyle(NORMAL);
    text("Sync the Cosmic Seed when it pulses green!\nStart is easy – sync nodes slowly on Orbit 1 & 2!", GAME_WIDTH / 2, contentY + 35);
    contentY += 100;
  
    // Combos Section
    fill(93, 208, 207);
    textSize(28); // Zwiększone z 24 na 28
    textStyle(BOLD);
    text("Combos", GAME_WIDTH / 2, contentY);
    fill(249, 249, 242);
    textSize(16); // Zwiększone z 14 na 16
    textStyle(NORMAL);
    text("Chain syncs for multipliers (x1, x2, ...).\n15+ syncs grants +1 life.", GAME_WIDTH / 2, contentY + 35);
    
    contentY += 100;


  
   // Power-Ups & Boosts Section
    fill(93, 208, 207);
    textSize(28); // Zwiększone z 24 na 28
    textStyle(BOLD);
    text("Power-Ups & Boosts", GAME_WIDTH / 2, contentY);
    fill(249, 249, 242);
    textSize(14); // Zwiększone z 12 na 14
    textStyle(NORMAL);
    let powerUpY = contentY + 30;
    let iconX = GAME_WIDTH / 2 - 250;
  
    // Life
    push();
    translate(iconX, powerUpY);
    let lifeGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 15);
    lifeGradient.addColorStop(0, "rgb(255, 255, 255)");
    lifeGradient.addColorStop(1, "rgb(0, 255, 0)");
    drawingContext.fillStyle = lifeGradient;
    star(0, 0, 8, 15 + sin(millis() * 0.005) * 3, 8);
    pop();
    text("Life: +1 Life", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Gas Nebula
    noFill();
    stroke(0, 191, 255, 200);
    strokeWeight(2);
    for (let i = 0; i < 3; i++) {
      arc(iconX, powerUpY, 15 * (i + 1) / 3, 15 * (i + 1) / 3, 0, PI + i * HALF_PI);
    }
    noStroke();
    fill(249, 249, 242);
    text("Gas Nebula: x2 Points (5s+)", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Pulse Wave
    noFill();
    let pulse = (millis() % 1000) / 1000;
    stroke(147, 208, 207, 200);
    strokeWeight(2);
    ellipse(iconX, powerUpY, 25 * pulse);
    noStroke();
    fill(249, 249, 242);
    text("Pulse Wave: Boost Pulse (4s+)", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Orbit Shield
    fill(255, 215, 0, 150);
    ellipse(iconX, powerUpY, 25 + sin(millis() * 0.005) * 3);
    stroke(255, 255, 255, 200);
    strokeWeight(1);
    for (let i = -1; i <= 1; i++) {
      line(iconX + i * 8, powerUpY - 10, iconX + i * 8, powerUpY + 10);
    }
    noStroke();
    fill(249, 249, 242);
    text("Orbit Shield: Blocks Damage (6s+) [Lv3+]", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Freeze Nova
    fill(0, 255, 255, 200 + sin(millis() * 0.01) * 55);
    star(iconX, powerUpY, 10, 15, 6);
    fill(249, 249, 242);
    text("Freeze Nova: Freezes Pulse (10s+) [Lv3+]", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Star Seed
    fill(147, 208, 207, 200);
    ellipse(iconX, powerUpY, 25, 15 + sin(millis() * 0.005) * 3);
    fill(249, 249, 242);
    text("Star Seed: Bigger Seed (6s+) [Lv5+]", GAME_WIDTH / 2, powerUpY);
    powerUpY += 40;
  
    // Mainnet Wave
    gradient = drawingContext.createLinearGradient(iconX - 10, powerUpY, iconX + 10, powerUpY);
    gradient.addColorStop(0, "#93D0CF");
    gradient.addColorStop(1, "#FFD700");
    drawingContext.fillStyle = gradient;
    beginShape();
    for (let i = 0; i < 6; i++) {
      let a = TWO_PI / 6 * i;
      vertex(iconX + cos(a) * (10 + sin(millis() * 0.005) * 2), powerUpY + sin(a) * 10);
    }
    endShape(CLOSE);
    fill(249, 249, 242);
    text("Mainnet Wave: Clears Traps [Lv7+]", GAME_WIDTH / 2, powerUpY);
    contentY += 350;
  
    // Traps Section
    fill(93, 208, 207);
    textSize(28); // Zwiększone z 24 na 28
    textStyle(BOLD);
    text("Traps", GAME_WIDTH / 2, contentY);
    fill(249, 249, 242);
    textSize(14); // Zwiększone z 12 na 14
    textStyle(NORMAL);
    let trapY = contentY + 30;
  
    // Avoid Meteor Strikes
    fill(255, 0, 0, 200);
    ellipse(iconX, trapY, 25 + sin(millis() * 0.005) * 3);
    stroke(255, 100);
    strokeWeight(1);
    line(iconX - 10, trapY - 10, iconX + 10, trapY + 10);
    noStroke();
    fill(249, 249, 242);
    text("Avoid Meteor Strikes: 5 misses = -1 life", GAME_WIDTH / 2, trapY);
    trapY += 40;
  
    // Meteor Strike
    fill(255, 100, 0, 200);
    ellipse(iconX, trapY, 25);
    fill(255, 0, 0, 150);
    tailLength = 10 + sin(millis() * 0.01) * 3;
    triangle(iconX, trapY - 10, iconX - tailLength, trapY - 20, iconX + tailLength, trapY - 20);
    fill(249, 249, 242);
    text("Meteor Strike: Spawns Traps, x2 Points (3s) [Lv5+]", GAME_WIDTH / 2, trapY);
    contentY += 110;

    contentY += 50;

    // NOWA SEKCJA: Mainnet Challenge
  fill(93, 208, 207);
  textSize(28);
  textStyle(BOLD);
  text("Mainnet Challenge", GAME_WIDTH / 2, contentY);
  fill(249, 249, 242);
  textSize(14);
  textStyle(NORMAL);
  let challengeY = contentY + 30;
  text(
    "Reach Orbit 5+ and chain 10+ syncs after 2 minutes.\n" +
    "Score 400 points in 60 seconds to earn the Mainnet Badge!\n" +
    "Boosts like Gas Nebula (x2) or Gas+Star (x4) help a lot.",
    GAME_WIDTH / 2,
    challengeY
  );
  contentY += 90;
  
    // Stopka
    fill(128, 131, 134, 150);
    textSize(14); // Zwiększone z 12 na 14
    text("#SuperseedGrok3 – Powered by xAI", GAME_WIDTH / 2, contentY + 20);
  
    // Oblicz maxScrollOffset
    maxScrollOffset = max(0, contentY + 40 - modalHeight - modalY);
  
    drawingContext.restore();
    pop();
  
    // Pasek przewijania
    let scrollBarHeight = modalHeight * (modalHeight / (contentY + 40 - modalY));
    let scrollBarY = map(scrollOffset, 0, maxScrollOffset, modalY, modalY + modalHeight - scrollBarHeight);
    fill(93, 208, 207, 150);
    rect(modalX + modalWidth - 20, scrollBarY, 10, scrollBarHeight, 5);
  
    // Back Button
    let backX = modalX + 20;
    let backY = modalY + modalHeight - 60;
    let isBackHovering = mouseX > backX && mouseX < backX + 100 && mouseY > backY && mouseY < backY + 40;
    fill(93, 208, 207, isBackHovering ? 255 : 200);
    rect(backX, backY, 100, 40, 10);
    fill(249, 249, 242);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("BACK", backX + 50, backY + 20);
  }

  else if (gameState === "tutorial") {
    // Gradient Background
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "#0E273B");
    gradient.addColorStop(0.5, "#93D0CF");
    gradient.addColorStop(1, "#808386");
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Modal
    let modalWidth = GAME_WIDTH * 0.8;
    let modalHeight = GAME_HEIGHT * 0.8;
    let modalX = (GAME_WIDTH - modalWidth) / 2;
    let modalY = (GAME_HEIGHT - modalHeight) / 2;
    fill(14, 39, 59, 230);
    rect(modalX, modalY, modalWidth, modalHeight, 20);
  
    // Pulsująca ramka
    let pulseProgress = sin(millis() * 0.002) * 0.5 + 0.5;
    stroke(93, 208, 207, map(pulseProgress, 0, 1, 100, 255));
    strokeWeight(5 + pulseProgress * 2);
    noFill();
    rect(modalX, modalY, modalWidth, modalHeight, 20);
    noStroke();
  
    // Obszar przewijania z clippingiem
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(modalX, modalY, modalWidth, modalHeight);
    drawingContext.clip();
    translate(0, -scrollOffset);
  
    let contentY = modalY + 20;
    textAlign(CENTER, BASELINE);
  
    // Tytuł z logo
    fill(249, 249, 242);
    textSize(32);
    textStyle(BOLD);
    text("Superseed Cosmic Network", modalX + modalWidth / 2, contentY + 10);
    contentY += 50;
    let logoScale = 1 + sin(millis() * 0.003) * 0.1;
    image(whiteLogo, modalX + modalWidth / 2 - 90, contentY, 180 * logoScale, 90 * logoScale);
    contentY += 100;
  
    // Objective Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Objective", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(15);
    textStyle(NORMAL);
    let objectiveLines = [
      "Sync your way through 10 Orbits to fully activate the Superseed Mainnet.",
      "Defeat the Cosmic Core Guardian to claim your Superseed Cosmic Core NFT!",
      "Test your reflexes and strategy in this decentralized challenge."
    ];
    for (let i = 0; i < objectiveLines.length; i++) {
      text(objectiveLines[i], modalX + modalWidth / 2, contentY + 20 + i * 20);
    }
    contentY += 90;
  
    // Gameplay Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Gameplay Mechanics", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(13);
    textStyle(NORMAL);
    let gameplayLines = [
      "Click the pulsing Superseed logo when it glows green to score points.",
      "Chain consecutive syncs to build combos – hit 15+ for an extra life!",
      "Dodge meteors and traps; 5 misses deduct a life unless shielded.",
      "Adapt to shifting orbits and escalating speeds as you progress."
    ];
    for (let i = 0; i < gameplayLines.length; i++) {
      text(gameplayLines[i], modalX + modalWidth / 2, contentY + 18 + i * 20);
    }
    contentY += 110;
  
    // Power-Ups Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Power-Ups & Boosts", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(13);
    textStyle(NORMAL);
    let powerUpLines = [
      "Life (+1 life) – Restore vitality to keep syncing.",
      "Gas Nebula (x2 points, 5s+) – Double your score in a cosmic cloud.",
      "Pulse Wave (faster pulse, 4s+) – Speed up sync opportunities.",
      "Orbit Shield (blocks damage, 6s+) – Protection from meteor strikes [Lv3+].",
      "Freeze Nova (freezes pulse, 10s+) – Lock the rhythm for precision [Lv3+].",
      "Meteor Strike (more traps, x2 points, 6s+) – High risk, high reward [Lv5+].",
      "Star Seed (bigger logo, 6s+) – Easier clicks, bigger wins [Lv5+].",
      "Mainnet Wave (clears traps) – Reset the field for a fresh start [Lv7+]."
    ];
    for (let i = 0; i < powerUpLines.length; i++) {
      text(powerUpLines[i], modalX + modalWidth / 2, contentY + 18 + i * 20);
    }
    let iconX = modalX + modalWidth / 2 - 230;
    push();
    translate(iconX, contentY + 35);
    let lifeGradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 15);
    lifeGradient.addColorStop(0, "rgb(255, 255, 255)");
    lifeGradient.addColorStop(1, "rgb(0, 255, 0)");
    drawingContext.fillStyle = lifeGradient;
    star(0, 0, 8, 15 + sin(millis() * 0.005) * 3, 8);
    pop();
    contentY += 180;
  
    // Progression Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Orbit Progression", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(13);
    textStyle(NORMAL);
    let progressionLines = [
      "Begin at Orbit 1 – earn 50 points to advance.",
      "Each orbit increases difficulty: faster pulses, more traps.",
      "Reach Orbit 10 and defeat the boss to unlock your NFT reward!",
      "Track your progress with the orbit bar at the top."
    ];
    for (let i = 0; i < progressionLines.length; i++) {
      text(progressionLines[i], modalX + modalWidth / 2, contentY + 18 + i * 20);
    }
    contentY += 110;
  
    // Challenges Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Special Challenges", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(13);
    textStyle(NORMAL);
    let challengeLines = [
      "Supernova Rush (Lv5+) – 30s of intensified gameplay with doubled rewards.",
      "Mainnet Challenge (Lv5+, 2min+) – Sync 400 points in 60s for a badge.",
      "Overload Events (Lv7+) – Random boosts or penalties for 5s.",
      "Quick Click Challenges – Hit 5 syncs in 12s for bonus points."
    ];
    for (let i = 0; i < challengeLines.length; i++) {
      text(challengeLines[i], modalX + modalWidth / 2, contentY + 18 + i * 20);
    }
    contentY += 110;
  
    // Why Play Section
    fill(93, 208, 207);
    textSize(22);
    textStyle(BOLD);
    text("Why Join the Network?", modalX + modalWidth / 2, contentY);
    fill(249, 249, 242);
    textSize(13);
    textStyle(NORMAL);
    let whyPlayLines = [
      "Experience Superseed’s vision of a decentralized future.",
      "Master escalating challenges with strategic power-ups.",
      "Compete for leaderboard glory and an exclusive NFT reward!",
      "Built with xAI’s Grok 3 – a cosmic collaboration."
    ];
    for (let i = 0; i < whyPlayLines.length; i++) {
      text(whyPlayLines[i], modalX + modalWidth / 2, contentY + 18 + i * 20);
    }
    contentY += 80;
  
    // Logo i podsumowanie
    push();
    let logoY = contentY + 25;
    let demoPulse = lerp(70, 100, sin(millis() * 0.002));
    tint(seedColor.r, seedColor.g, seedColor.b, 200);
    image(logo, modalX + modalWidth / 2, logoY, demoPulse, demoPulse);
    pop();
    fill(255, 215, 0);
    textSize(16);
    textStyle(BOLD);
    text("Sync, Survive, Claim Your NFT!", modalX + modalWidth / 2, logoY + 70);
    contentY += 120;
  
    // Poprawione obliczenie maxScrollOffset
    let totalContentHeight = contentY - modalY + 20; // Dodatkowy margines
    maxScrollOffset = max(0, totalContentHeight - modalHeight);
  
    drawingContext.restore();
    pop();
  
    // Poprawiony pasek przewijania
    if (totalContentHeight > modalHeight) {
      let scrollBarHeight = (modalHeight / totalContentHeight) * modalHeight;
      scrollBarHeight = constrain(scrollBarHeight, 20, modalHeight); // Minimalna wysokość paska
      let scrollBarY = map(scrollOffset, 0, maxScrollOffset, modalY, modalY + modalHeight - scrollBarHeight);
      fill(93, 208, 207, 150);
      rect(modalX + modalWidth - 20, scrollBarY, 10, scrollBarHeight, 5);
    }
  
    // Back Button
    let backX = modalX + 20;
    let backY = modalY + modalHeight - 60;
    let isBackHovering = mouseX > backX && mouseX < backX + 100 && mouseY > backY && mouseY < backY + 40;
    fill(93, 208, 207, isBackHovering ? 255 : 200);
    rect(backX, backY, 100, 40, 10);
    fill(249, 249, 242);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("BACK", backX + 50, backY + 20);
  
    // Start/Resume Button
    let buttonX = modalX + modalWidth - 200;
    let buttonY = modalY + modalHeight - 60;
    let isHovering = mouseX > buttonX && mouseX < buttonX + 180 && mouseY > buttonY && mouseY < buttonY + 40;
    fill(93, 208, 207, isHovering ? 255 : 200);
    rect(buttonX, buttonY, 180, 40, 15);
    fill(249, 249, 242);
    textSize(22);
    textStyle(BOLD);
    text(savedGameState ? "RESUME SYNC" : "START SYNC", buttonX + 90, buttonY + 20);
  
    // Footer Branding
    fill(128, 131, 134, 150);
    textSize(10);
    textAlign(CENTER, BASELINE);
    text("#SuperseedGrok3 – Powered by xAI", GAME_WIDTH / 2, GAME_HEIGHT - 15);
  }
  
  else if (gameState === "start") {
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
        musicSwitched = "level10";
      } else if (level === 9 && musicSwitched !== "level9") {
        console.log("Switching to backgroundMusic3 at level 9");
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.loop();
        musicSwitched = "level9";
      } else if (level >= 5 && level <= 8 && musicSwitched !== "level5-8") {
        console.log("Switching to backgroundMusic2 at level 5-8");
        backgroundMusic.stop();
        backgroundMusic3.stop();
        backgroundMusic2.loop();
        musicSwitched = "level5-8";
      } else if (level < 5 && musicSwitched !== "level1-4") {
        console.log("Switching to backgroundMusic at level 1-4");
        backgroundMusic2.stop();
        backgroundMusic3.stop();
        backgroundMusic.loop();
        musicSwitched = "level1-4";
      }
    
      // Upewnij się, że odpowiednia muzyka gra
      if (level === 10 && !backgroundMusic3.isPlaying()) {
        console.log("Restarting backgroundMusic3 as it stopped unexpectedly");
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.loop();
      } else if (level === 9 && !backgroundMusic3.isPlaying()) {
        console.log("Restarting backgroundMusic3 as it stopped unexpectedly");
        backgroundMusic.stop();
        backgroundMusic2.stop();
        backgroundMusic3.loop();
      } else if (level >= 5 && level <= 8 && !backgroundMusic2.isPlaying()) {
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
      holeSound.setVolume(0.45); // Ustawienie na 0.45 zamiast domyślnego 0.5
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
  text(`Black Hole! ${floor(eventTimeLeft / 1000)}s`, GAME_WIDTH / 2, 50);

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
      combo >= 10 && // Zmieniono z combo >= 15
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
    // Zatrzymaj muzykę
    if (bossMusic.isPlaying()) {
      bossMusic.stop();
    }
    if (backgroundMusic.isPlaying()) {
      backgroundMusic.stop();
    }
    if (backgroundMusic2.isPlaying()) {
      backgroundMusic2.stop();
    }
    if (backgroundMusic3.isPlaying()) {
      backgroundMusic3.stop();
    }
  
    // Gradientowe tło
    let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, "rgb(14, 39, 59)");
    gradient.addColorStop(1, "rgb(93, 208, 207)");
    drawingContext.fillStyle = gradient;
    rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);
  
    // Główne logo gry
    let mainLogoWidth = 280;
    let mainLogoHeight = 280;
    image(mainLogo, GAME_WIDTH / 2 - mainLogoWidth / 2, 20, mainLogoWidth, mainLogoHeight);
  
    // Wiadomość "Game Over" i wynik
    fill(255, 200);
    textSize(32);
    textStyle(BOLD);
    text(`Network Down!\nScore: ${score.toFixed(1)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150);
  
    // Tytuł leaderboardu blockchainowego
    textSize(20);
    text("Blockchain Leaderboard", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);
  
  
    // Wyświetlanie wyników z blockchaina
    textSize(16);
    if (blockchainLeaderboard.length > 0) {
      for (let i = 0; i < Math.min(blockchainLeaderboard.length, 5); i++) {
        text(`${i + 1}. ${blockchainLeaderboard[i].nick}: ${blockchainLeaderboard[i].score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60 + i * 25);
      }
    } else if (!isConnected) {
      text("Connect wallet to see blockchain scores", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    } else if (!leaderboardFetched) {
      text("Loading blockchain scores...", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    } else {
      text("No scores available yet", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    }
  
    // Reszta Twojego kodu dla gameOver (np. przyciski, odznaka Mainnet)
    if (mainnetBadgeEarned) {
      drawMainnetBadge(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 50);
      fill(255, 215, 0, 200);
      textSize(14);
      text("Mainnet Badge", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130);
    }
  
    let buttonX = GAME_WIDTH / 2 - 90;
    let baseButtonY = mainnetBadgeEarned ? GAME_HEIGHT / 2 + 180 : GAME_HEIGHT / 2 + 120;
  
    if (isConnected && !scoreSaved && showSaveButton) {
      fill(93, 208, 207);
      rect(buttonX, baseButtonY, 180, 40, 10);
      fill(255);
      textSize(18);
      text("Save to Blockchain", GAME_WIDTH / 2, baseButtonY + 20);
    }
  
    fill(93, 208, 207);
    rect(buttonX, baseButtonY + 50, 180, 40, 10);
    fill(255);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("RELAUNCH", GAME_WIDTH / 2, baseButtonY + 70);
  
    fill(93, 208, 207);
    rect(buttonX, baseButtonY + 100, 180, 40, 10);
    fill(255);
    textSize(18);
    text("SHARE SCORE", GAME_WIDTH / 2, baseButtonY + 120);
  
    fill(147, 208, 207);
    rect(buttonX, baseButtonY + 150, 180, 40, 10);
    fill(255);
    textSize(18);
    text("MENU", GAME_WIDTH / 2, baseButtonY + 170);
  
    if (mainnetBadgeEarned) {
      let badgeButtonY = baseButtonY + 200;
      let gradient = drawingContext.createLinearGradient(buttonX, badgeButtonY, buttonX + 180, badgeButtonY);
      gradient.addColorStop(0, "rgb(93, 208, 207)");
      gradient.addColorStop(1, "rgb(255, 215, 0)");
      drawingContext.fillStyle = gradient;
      rect(buttonX, badgeButtonY, 180, 40, 10);
      fill(255, 215, 0);
      textSize(18);
      text("SHARE BADGE", GAME_WIDTH / 2, badgeButtonY + 20);
    }
  
// Komunikat pod przyciskami
if (saveMessageTimer > 0) {
  saveMessageTimer -= deltaTime;
  let alpha = map(saveMessageTimer, 0, 3000, 0, 200); // Zanikanie
  fill(saveMessage.includes("Failed") ? [255, 0, 0] : [0, 255, 0], alpha);
  textSize(16 + sin(millis() * 0.005) * 2); // Subtelne pulsowanie
  textStyle(BOLD);
  text(saveMessage, GAME_WIDTH / 2, baseButtonY + (mainnetBadgeEarned ? 250 : 200));
}

    let whiteLogoWidth = 100;
    let whiteLogoHeight = 50;
    image(whiteLogo, GAME_WIDTH / 2 - whiteLogoWidth / 2, GAME_HEIGHT - whiteLogoHeight - 10, whiteLogoWidth, whiteLogoHeight);
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

  // Warunkowa obsługa muzyki
  if (!bossDefeatedSuccessfully) {
      // Jeśli nie pokonano bossa, zatrzymaj bossMusic i uruchom backgroundMusic
      if (bossMusic.isPlaying()) {
          bossMusic.stop();
          backgroundMusic.loop();
      }
  } else {
      // Jeśli pokonano bossa, pozwól bossMusic grać dalej
      if (soundInitialized && !bossMusic.isPlaying()) {
          bossMusic.loop();
      }
  }

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

// Status zapisu wyniku
if (isConnected) {
  fill(scoreSaved ? [0, 255, 0] : [255, 215, 0], 200); // Zielony jeśli zapisany, żółty jeśli nie
  textSize(16);
  text(scoreSaved ? "Score Saved to Blockchain!" : "Score Not Saved Yet", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 320);
} else {
  fill(128, 131, 134, 200); // Szary dla niepodłączonego portfela
  textSize(16);
  text("Connect Wallet to Save Score", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 320);
}

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
  // Wyświetl grafikę
  image(bossIntroImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Dodaj tekst "Click to skip" i timer
  fill(255, 215, 0, 200); // Złoty kolor
  textSize(20);
  textAlign(CENTER, CENTER);
  let timeLeft = 30 - floor((millis() - stateStartTime) / 1000);
  text(`Click to skip (${timeLeft}s)`, GAME_WIDTH / 2, GAME_HEIGHT - 50);

  // Przejście do walki po 30 sekundach lub kliknięciu
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
    bossDefeatTimer = 30000;
    zoomLevel = 1;
    playerBullets = [];
    bossBullets = [];
    bossDefeatedSuccessfully = true; // Ustaw znacznik na true
    if (soundInitialized) {
        levelSound.play();
    }
}
  if (lifeBar <= 0) {
    gameState = "gameOver";
    shakeTimer = 500;
  }
} else if (gameState === "bossDefeated") {
  let gradient = drawingContext.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
  gradient.addColorStop(0, "#0E273B");
  gradient.addColorStop(1, "#93D0CF");
  drawingContext.fillStyle = gradient;
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (soundInitialized && !bossMusic.isPlaying()) {
      bossMusic.loop(); // Upewnij się, że bossMusic gra
  }

  // Animation
  bossDefeatTimer -= deltaTime;
  
  // Pierwsze 10 sekund: Zoom na bossa w fazie 9 (przed zniszczeniem)
  if (bossDefeatTimer > 20000) { // 30s - 20s = 10s na zoom
    zoomLevel = lerp(zoomLevel, 2, 0.05);
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    scale(zoomLevel);
    image(bossImage, -bossSize / 2, -bossSize / 2, bossSize, bossSize, 9 * bossFrameWidth, 0, bossFrameWidth, bossFrameWidth);
    pop();
    fill(255, 215, 0, 200); // Złoty kolor
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Click to skip to message", GAME_WIDTH / 2, GAME_HEIGHT - 50); // Zaktualizowana wskazówka
  } 
  // Ostatnie 20 sekund: Zniszczony boss (faza 10) z komunikatem
  else if (bossDefeatTimer > 0) {
    push();
    translate(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    scale(zoomLevel);
    image(bossImage, -bossSize / 2, -bossSize / 2, bossSize, bossSize, 10 * bossFrameWidth, 0, bossFrameWidth, bossFrameWidth);
    pop();
    fill(255, 215, 0, 200); // Złoty kolor dla wyróżnienia
    let pulseScale = 1 + sin(millis() * 0.005) * 0.1; // Subtelne pulsowanie tekstu
    textSize(32 * pulseScale);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(
      "The Centralized Overseer lies shattered!\n" +
      "Superseed Testnet blazes as the cosmic spark ignites,\n" +
      "a triumph over control, a beacon of freedom.\n" +
      "Yet the true war for Superseed Mainnet looms ahead—\n" +
      "new missions await to forge an unshackled future.\n" +
      "Claim your reward and rise for the battles to come!",
      GAME_WIDTH / 2, 
      GAME_HEIGHT / 2
    );
    // Wskazówka o pominięciu na dole
    textSize(20);
    text("Click to claim your NFT now", GAME_WIDTH / 2, GAME_HEIGHT - 50);
  }

  // Decay particles dla efektu
  if (random(1) < 0.2) {
    particles.push(new Particle(GAME_WIDTH / 2, GAME_HEIGHT / 2, { r: 255, g: 215, b: 0 }));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  // Przejście do endgame po zakończeniu animacji lub kliknięciu w fazie tekstu
  if (bossDefeatTimer <= 0 || introClicked) {
    gameState = "endgame";
    mainnetBadgeEarned = true;
    bossActive = false;
    // Nie zmieniaj muzyki tutaj – bossMusic gra dalej
}

}



// W funkcji draw(), po bloku dla "bossDefeated":
else if (gameState === "miningHubPreview") {
  background(14, 39, 59, 200); // Tangaroa z przezroczystością
  
  // Gradientowy prostokąt
  for (let y = 50; y < GAME_HEIGHT - 50; y++) {
    let inter = map(y, 50, GAME_HEIGHT - 50, 0, 1);
    let c = lerpColor(color(14, 39, 59), color(93, 208, 207), inter);
    stroke(c);
    line(50, y, GAME_WIDTH - 50, y);
  }
  noStroke();
  fill(10, 20, 30, 230); // Lekka nakładka

  fill(93, 208, 207); // Superseed Light Green
  textSize(28);
  textAlign(CENTER, CENTER);
  text("Decentralized Mining Probes", GAME_WIDTH / 2, 100);

  fill(249, 249, 242); // White (#F9F9F2)
  textSize(14);
  textAlign(LEFT, TOP);
  let description = "Decentralized Mining Probes – Upcoming Idle Game Add-On!\n\n" +
                   "A new idle game add-on fully tied to the Superseed Network is coming soon! Deploy Decentralized Mining Probes into space, collect Cosmic Fragments, and sync them to Superseed Testnet as TEST_FRAG tokens.\n\n" +
                   "What’s in store:\n" +
                   "- Passive Production: Probes generate 0.5 fragments every 5s per probe, with a 24h offline cap.\n" +
                   "- Active Rewards: Log in daily for bonuses (50-200 fragments), activate production boosts (+50% for 1h), and hit milestones (e.g., 500 fragments for rewards).\n" +
                   "- Superseed Blockchain: Sync fragments to Superseed Testnet as TEST_FRAG tokens, redeemable for future airdrop benefits!\n" +
                   "- Customization: Spend fragments on skins (e.g., golden probes), in-game power-ups, or Superseed campaign XP.\n\n" +
                   "This mode is being built with a Node.js backend for security and blockchain integration with Superseed Network. Check back soon to launch your probes and join the cosmic revolution!";
  text(description, 70, 150, GAME_WIDTH - 140, GAME_HEIGHT - 200);

  // Rysowanie i aktualizacja sond
  for (let probe of miningPreviewProbes) {
    probe.update();
    probe.show();
  }

  // Aktualizacja i rysowanie cząstek
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  // Przycisk powrotu
  let backButtonX = GAME_WIDTH / 2 - 100;
  let backButtonY = GAME_HEIGHT / 2 + 220;
  fill(93, 208, 207); // Superseed Light Green as base color
  rect(backButtonX, backButtonY, 200, 50, 10);
  fill(14, 39, 59); // Dark Tangaroa for text
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Back to Menu", GAME_WIDTH / 2, backButtonY + 25);

  // Nowy przycisk "DEMO"
  let demoButtonX = GAME_WIDTH / 2 + 120; // Obok "Back to Menu" z odstępem 20px
  let demoButtonY = GAME_HEIGHT / 2 + 220;
  fill(255, 215, 0); // Żółty kolor dla wyróżnienia
  rect(demoButtonX, demoButtonY, 200, 50, 10);
  fill(14, 39, 59); // Ciemny tekst dla kontrastu
  textSize(18);
  text("DEMO", demoButtonX + 100, demoButtonY + 25);

}

else if (gameState === "miningDemo") {
  background(14, 39, 59); // Ciemne tło

  // Gwiazdki w tle
  for (let star of bgStars) {
    noStroke();
    fill(255, 255, 255, star.alpha);
    ellipse(star.x, star.y, star.size, star.size);
    star.alpha = 100 + sin(frameCount * 0.02 + star.x) * 155;
  }

  // Gradient tła
  for (let y = 0; y < GAME_HEIGHT; y++) {
    let inter = map(y, 0, GAME_HEIGHT, 0, 1);
    let c = lerpColor(color(14, 39, 59), color(93, 208, 207), inter);
    stroke(c);
    line(0, y, GAME_WIDTH, y);
  }
  noStroke();

  // Nagłówek
  fill(93, 208, 207);
  textSize(36);
  textStyle(BOLD);
  text("Decentralized Mining Probes", GAME_WIDTH / 2, 80);

  // Logo w centrum
  let logoSize = 100 + sin(frameCount * 0.05) * 10;
  fill(seedColor.r, seedColor.g, seedColor.b);
  ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, logoSize, logoSize);

  // Aktualizacja i rysowanie sond
  for (let probe of miningProbes) {
    probe.update();
    probe.draw();
    noFill();
    stroke(93, 208, 207, 50);
    ellipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, probe.radius * 2, probe.radius * 2);
  }

  // Aktualizacja i rysowanie fragmentów
  for (let i = fragmentsCollected.length - 1; i >= 0; i--) {
    fragmentsCollected[i].update();
    fragmentsCollected[i].draw();
    if (fragmentsCollected[i].life <= 0) fragmentsCollected.splice(i, 1);
  }

// W funkcji draw(), przed rysowaniem statystyk w miningDemo
let nowTime = millis();
let productionRate = productionBoost ? 0.75 : 0.5;
if (nowTime - lastUpdate >= 5000) {
  fragments += probes * productionRate;
  lastUpdate = nowTime;
}

if (productionBoost) {
  boostTimer -= deltaTime;
  if (boostTimer <= 0) {
    productionBoost = false;
  }
}

  // Statystyki
  fill(249, 249, 242);
  textSize(20);
  text(`Probes: ${probes}`, GAME_WIDTH / 2 - 200, 150);
  text(`Fragments: ${fragments.toFixed(1)}`, GAME_WIDTH / 2 + 200, 150);
  if (productionBoost) {
    text(`Boost: ${floor(boostTimer / 1000)}s`, GAME_WIDTH / 2, 180);
  }

  // Przyciski
  let buttonWidth = 180;
  let buttonHeight = 50;
  let buttonY = GAME_HEIGHT - 150;
  let pulseScale = 1 + sin(frameCount * 0.05) * 0.05;

  // Daily Bonus Button
  fill(93, 208, 207);
  rect(GAME_WIDTH / 2 - buttonWidth - 20, buttonY, buttonWidth * pulseScale, buttonHeight * pulseScale, 10);
  fill(249, 249, 242);
  textSize(18);
  text("Claim Daily Bonus", GAME_WIDTH / 2 - buttonWidth / 2 - 20, buttonY + buttonHeight / 2);

  // Activate Boost Button
  fill(productionBoost ? 128 : 93, 208, 207);
  rect(GAME_WIDTH / 2 + 20, buttonY, buttonWidth * pulseScale, buttonHeight * pulseScale, 10);
  fill(249, 249, 242);
  text(productionBoost ? "Boost Active" : "Activate Boost (50)", GAME_WIDTH / 2 + buttonWidth / 2 + 20, buttonY + buttonHeight / 2);

  // Buy Probe Button
  fill(fragments >= 100 ? 93 : 128, 208, 207);
  rect(GAME_WIDTH / 2 - buttonWidth / 2, buttonY + 70, buttonWidth * pulseScale, buttonHeight * pulseScale, 10);
  fill(249, 249, 242);
  text(`Buy Probe (100)`, GAME_WIDTH / 2, buttonY + 95);

  // Back Button
  fill(93, 208, 207);
  rect(GAME_WIDTH - 120, 20, 100, 40, 10);
  fill(249, 249, 242);
  text("Back", GAME_WIDTH - 70, 40);

  // Efekt daily bonus
  if (showDailyBonus) {
    fill(255, 215, 0, 200);
    textSize(24);
    text(`Daily Bonus: +${dailyBonusAmount} Fragments!`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    if (millis() - showDailyBonus > 2000) showDailyBonus = false;
  }

  // Ramka
  noFill();
  stroke(93, 208, 207);
  strokeWeight(5);
  rect(0, 0, GAME_WIDTH, GAME_HEIGHT, 20);


  // Aktualizacja i rysowanie fragmentów
  for (let i = demoFragments.length - 1; i >= 0; i--) {
    demoFragments[i].update();
    demoFragments[i].draw();
    if (dist(demoFragments[i].x, demoFragments[i].y, demoFragments[i].targetX, demoFragments[i].targetY) < 5) {
      fragmentsCollected.push(demoFragments[i]);
      demoFragments.splice(i, 1);
      if (soundInitialized) clickSound.play();
    } else if (demoFragments[i].life <= 0) {
      demoFragments.splice(i, 1);
    }
  }
  if (demoFragments.length > 100) demoFragments.shift(); // Limit fragmentów

  // Licznik zebranych fragmentów
  fill(255, 215, 0); // Złoty kolor
  textSize(18);
  text(`Fragments Collected: ${fragmentsCollected.length}`, GAME_WIDTH / 2, GAME_HEIGHT - 30);

  // Przycisk powrotu
  fill(93, 208, 207);
  rect(GAME_WIDTH - 120, 20, 100, 40, 10);
  fill(249, 249, 242);
  textSize(18);
  text("Back", GAME_WIDTH - 70, 40);
}

pop(); // Zamknięcie push() z początku draw()
} // Zamknięcie funkcji draw()

// Zaktualizowana funkcja startGame() – krok 5
function startGame() {
  // Resetowanie wszystkich zmiennych gry
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
  musicSwitched = "level1-4";
  stateStartTime = 0;
  scoreSaved = false; // Resetowanie flagi zapisu
  showSaveButton = true; // Pokazanie przycisku przy nowej grze
  leaderboardFetched = false;

  // Zmienne dla mechaniki strzelanki
  player = null;
  playerBullets = [];
  bossBullets = [];
  lastFireTime = 0;
  fireRate = 200;
  bossHealth = 0;
  bossPhase = 1;
  bossActive = false;
  bossAttackTimer = 0;

  // Resetowanie muzyki
  if (soundInitialized) {
    introMusic.stop();
    backgroundMusic2.stop();
    backgroundMusic3.stop();
    bossMusic.stop();
    backgroundMusic.loop();
    console.log("Music reset: backgroundMusic started for new game");
  }

  gameState = "playing";
  savedGameState = null;
  console.log("New game started – gameState: 'playing', lives:", lives, "lifeBar:", lifeBar);
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
  if (savedGameState && savedGameState.gameState === "playing") {
    // Wznów tylko jeśli stan był "playing"
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
    stateStartTime = savedGameState.stateStartTime;
    musicSwitched = savedGameState.musicSwitched;
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
      introMusic.stop();
      if (level === 10) {
        backgroundMusic3.play();
      } else if (level >= 5 && musicSwitched === "level5-9") {
        backgroundMusic2.play();
      } else {
        backgroundMusic.play();
      }
    }
  } else {
    console.log("No valid saved game state or not in 'playing' – starting new game");
    startGame(); // Zamiast przywracać "gameOver", zacznij nową grę
  }
}


    let verticalOffset = 60; // Zaktualizowane z 80