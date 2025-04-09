function touchStarted() {
    if (touches.length >= 2) {
      // Jeśli są dwa palce, pozwól na domyślne zachowanie (zoomowanie)
      return true;
    }
    if (!soundInitialized) {
      soundInitialized = true;
      backgroundMusic.loop();
    }
  
    let adjustedTouchX = mouseX - (width - GAME_WIDTH) / 2; // mouseX is updated by p5.js for touch
    let adjustedTouchY = mouseY - (height - GAME_HEIGHT) / 2;
  
    if (gameState === "howToPlay" && !isConnected) {
      let verticalOffset = 100; // Przesunięcie z draw()
      if (
        adjustedTouchX >= GAME_WIDTH / 2 - 120 && // Poprawiona szerokość z 100 na 120, zgodnie z draw()
        adjustedTouchX <= GAME_WIDTH / 2 + 120 &&
        adjustedTouchY >= 620 + verticalOffset &&
        adjustedTouchY <= 680 + verticalOffset
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
  
  function mousePressed() {
    let adjustedMouseX = mouseX - (width - GAME_WIDTH) / 2;
    let adjustedMouseY = mouseY - (height - GAME_HEIGHT) / 2;
  
    if (gameState === "howToPlay") {
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
  
      let verticalOffset = 60; // Zaktualizowane z 80
  
      // Choose Your Seed Color
      let colorBoxSize = 45; // Zaktualizowane z 50
      let colorBoxSpacing = 20; // Zaktualizowane z 25
      let startX = GAME_WIDTH / 2 - (colorBoxSize * 3 + colorBoxSpacing * 2) / 2;
      if (adjustedMouseY >= 280 + verticalOffset && adjustedMouseY <= 280 + verticalOffset + colorBoxSize) { // Zaktualizowane z 330
        if (adjustedMouseX >= startX && adjustedMouseX <= startX + colorBoxSize) {
          seedColor = { r: 0, g: 255, b: 0 };
        } else if (
          adjustedMouseX >= startX + colorBoxSize + colorBoxSpacing &&
          adjustedMouseX <= startX + colorBoxSize * 2 + colorBoxSpacing
        ) {
          seedColor = { r: 0, g: 0, b: 255 };
        } else if (
          adjustedMouseX >= startX + (colorBoxSize + colorBoxSpacing) * 2 &&
          adjustedMouseX <= startX + (colorBoxSize + colorBoxSpacing) * 2 + colorBoxSize
        ) {
          seedColor = { r: 255, g: 215, b: 0 };
        }
      }
  
      // Enter Your Nick
      if (
        adjustedMouseY >= 370 + verticalOffset && // Zaktualizowane z 440
        adjustedMouseY <= 405 + verticalOffset && // Zaktualizowane z 480
        adjustedMouseX >= GAME_WIDTH / 2 - 90 && // Zaktualizowane z 100
        adjustedMouseX <= GAME_WIDTH / 2 + 90 // Zaktualizowane z 100
      ) {
        isTypingNick = true;
      } else {
        isTypingNick = false;
      }
  
      // Start/Resume Button
      if (
        adjustedMouseX >= GAME_WIDTH / 2 - 90 && // Zaktualizowane z 100
        adjustedMouseX <= GAME_WIDTH / 2 + 90 && // Zaktualizowane z 100
        adjustedMouseY >= 420 + verticalOffset && // Zaktualizowane z 500
        adjustedMouseY <= 465 + verticalOffset // Zaktualizowane z 550
      ) {
        if (savedGameState) {
          console.log("Resuming paused game...");
          resumeGame();
        } else {
          console.log("Starting new game from howToPlay...");
          startGame();
        }
      }
  
      // Login/Logout Button
      if (
        !isConnected &&
        adjustedMouseX >= GAME_WIDTH / 2 - 90 && // Zaktualizowane z 100
        adjustedMouseX <= GAME_WIDTH / 2 + 90 && // Zaktualizowane z 100
        adjustedMouseY >= 475 + verticalOffset && // Zaktualizowane z 570
        adjustedMouseY <= 520 + verticalOffset // Zaktualizowane z 620
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
        adjustedMouseX >= GAME_WIDTH / 2 - 90 && // Zaktualizowane z 100
        adjustedMouseX <= GAME_WIDTH / 2 + 90 && // Zaktualizowane z 100
        adjustedMouseY >= 485 + verticalOffset && // Zaktualizowane z 590
        adjustedMouseY <= 530 + verticalOffset // Zaktualizowane z 640
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
  
      // OBSŁUGA KLIKNIĘCIA W "Claim Your NFT"
      if (
        hasCompletedGame &&
        adjustedMouseX >= GAME_WIDTH / 2 - 90 && // Zaktualizowane z 100
        adjustedMouseX <= GAME_WIDTH / 2 + 90 && // Zaktualizowane z 100
        adjustedMouseY >= 580 + verticalOffset && // Zaktualizowane z 700
        adjustedMouseY <= 625 + verticalOffset // Zaktualizowane z 750
      ) {
        gameState = "endgame";
        console.log("Returning to claim NFT!");
      }
  
      // Przyciski boczne – bez zmian
      let sideButtonX = GAME_WIDTH - 120 - 20;
      if (
        adjustedMouseX >= sideButtonX &&
        adjustedMouseX <= sideButtonX + 120 &&
        adjustedMouseY >= 200 &&
        adjustedMouseY <= 250
      ) {
        gameState = "info";
      }
      if (
        adjustedMouseX >= sideButtonX &&
        adjustedMouseX <= sideButtonX + 120 &&
        adjustedMouseY >= 260 &&
        adjustedMouseY <= 310
      ) {
        gameState = "tutorial";
      }
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
      if (
        adjustedMouseX >= sideButtonX &&
        adjustedMouseX <= sideButtonX + 120 &&
        adjustedMouseY >= 380 &&
        adjustedMouseY <= 430
      ) {
        gameState = "achievements";
      }
  
      if (
        adjustedMouseX >= sideButtonX &&
        adjustedMouseX <= sideButtonX + 120 &&
        adjustedMouseY >= 440 &&
        adjustedMouseY <= 490
      ) {
        gameState = "miningHubPreview";
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
      let modalWidth = GAME_WIDTH * 0.8;
      let modalHeight = GAME_HEIGHT * 0.8;
      let modalX = (GAME_WIDTH - modalWidth) / 2;
      let modalY = (GAME_HEIGHT - modalHeight) / 2;
      let backX = modalX + 20;
      let backY = modalY + modalHeight - 60;
  
      if (
        adjustedMouseX > backX &&
        adjustedMouseX < backX + 100 &&
        adjustedMouseY > backY &&
        adjustedMouseY < backY + 40
      ) {
        gameState = "howToPlay"; // Powrót do "How to Play"
        scrollOffset = 0; // Reset przewijania
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
      let modalWidth = GAME_WIDTH * 0.8;
      let modalHeight = GAME_HEIGHT * 0.8;
      let modalX = (GAME_WIDTH - modalWidth) / 2;
      let modalY = (GAME_HEIGHT - modalHeight) / 2;
  
      // Back Button
      let backX = modalX + 20;
      let backY = modalY + modalHeight - 60;
      if (
        adjustedMouseX >= backX && adjustedMouseX <= backX + 100 &&
        adjustedMouseY >= backY && adjustedMouseY <= backY + 40
      ) {
        gameState = "howToPlay";
        scrollOffset = 0; // Reset przewijania
        console.log("Back clicked from tutorial – returning to howToPlay");
      }
  
      // Start/Resume Button
      let buttonX = modalX + modalWidth - 200;
      let buttonY = modalY + modalHeight - 60;
      if (
        adjustedMouseX >= buttonX && adjustedMouseX <= buttonX + 180 &&
        adjustedMouseY >= buttonY && adjustedMouseY <= buttonY + 40
      ) {
        if (savedGameState) {
          resumeGame();
          console.log("Resume Sync clicked from tutorial – resuming game");
        } else {
          startGame();
          console.log("Start Sync clicked from tutorial – starting new game");
        }
      }
    } else if (gameState === "miningHubPreview") {
      // Definicja pozycji i rozmiarów przycisków
      let backButtonX = GAME_WIDTH / 2 - 100;
      let backButtonY = GAME_HEIGHT / 2 + 220;
      let backButtonWidth = 200;
      let backButtonHeight = 50;
  
      let demoButtonX = GAME_WIDTH / 2 + 120;
      let demoButtonY = GAME_HEIGHT / 2 + 220;
      let demoButtonWidth = 200;
      let demoButtonHeight = 50;
  
      // Przycisk "Back to Menu"
      if (
        adjustedMouseX >= backButtonX &&
        adjustedMouseX <= backButtonX + backButtonWidth &&
        adjustedMouseY >= backButtonY &&
        adjustedMouseY <= backButtonY + backButtonHeight
      ) {
        gameState = "howToPlay";
        console.log("Przełączono na howToPlay z miningHubPreview"); // Debug
      }
      // Przycisk "DEMO"
      else if (
        adjustedMouseX >= demoButtonX &&
        adjustedMouseX <= demoButtonX + demoButtonWidth &&
        adjustedMouseY >= demoButtonY &&
        adjustedMouseY <= demoButtonY + demoButtonHeight
      ) {
        gameState = "miningDemo";
        // Reinicjalizacja elementów animacji dla miningDemo
        demoProbes = [];
        for (let i = 0; i < 5; i++) {
          demoProbes.push(new Probe());
        }
        demoParticles = [];
        demoFragments = [];
        fragmentsCollected = [];
        demoTransitionTimer = 0;
        console.log("Przełączono na miningDemo i zresetowano elementy animacji"); // Debug
      }
    } else if (gameState === "miningDemo") {
      // Definicja pozycji i rozmiaru przycisku "Back"
      let backButtonX = GAME_WIDTH - 120;
      let backButtonY = 20;
      let backButtonWidth = 100;
      let backButtonHeight = 40;
  
      // Daily Bonus
      if (adjustedMouseX >= GAME_WIDTH / 2 - 200 && adjustedMouseX <= GAME_WIDTH / 2 - 20 &&
        adjustedMouseY >= GAME_HEIGHT - 150 && adjustedMouseY <= GAME_HEIGHT - 100) {
        dailyBonusAmount = floor(random(50, 201));
        fragments += dailyBonusAmount;
        showDailyBonus = millis();
      }
  
      // Activate Boost
      if (adjustedMouseX >= GAME_WIDTH / 2 + 20 && adjustedMouseX <= GAME_WIDTH / 2 + 200 &&
          adjustedMouseY >= GAME_HEIGHT - 150 && adjustedMouseY <= GAME_HEIGHT - 100 &&
          !productionBoost && fragments >= 50) {
        fragments -= 50;
        productionBoost = true;
        boostTimer = 600000; // 10 minut
      }
  
      // Buy Probe
      if (adjustedMouseX >= GAME_WIDTH / 2 - 90 && adjustedMouseX <= GAME_WIDTH / 2 + 90 && // Poprawiono #pragma once
          adjustedMouseY >= GAME_HEIGHT - 80 && adjustedMouseY <= GAME_HEIGHT - 30 &&
          fragments >= 100) {
        fragments -= 100;
        probes += 1;
        miningProbes.push(new Probe());
      }
  
      // Powrót z demo do miningHubPreview
      if (
        adjustedMouseX >= backButtonX &&
        adjustedMouseX <= backButtonX + backButtonWidth &&
        adjustedMouseY >= backButtonY &&
        adjustedMouseY <= backButtonY + backButtonHeight
      ) {
        gameState = "miningHubPreview";
        console.log("Powrócono do miningHubPreview z miningDemo"); // Debug
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
          alert("NFT claim functionality coming soon on Superseed Network!");
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
            bossMusic.stop();
            introMusic.stop();
            introMusic.loop();
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
      let buttonX = GAME_WIDTH / 2 - 90;
      let baseButtonY = mainnetBadgeEarned ? GAME_HEIGHT / 2 + 200 : GAME_HEIGHT / 2 + 100;
      let saveButtonY = baseButtonY - 60; // Pozycja przycisku "Save to Blockchain"
      let relaunchButtonY = baseButtonY;
      let shareScoreButtonY = baseButtonY + 50;
      let menuButtonY = baseButtonY + 100;
      let badgeButtonY = baseButtonY + 150;
    
      // "Save Score to Blockchain" Button
      if (
        isConnected &&
        !scoreSaved &&
        showSaveButton &&
        adjustedMouseX >= buttonX &&
        adjustedMouseX <= buttonX + 180 &&
        adjustedMouseY >= baseButtonY &&
        adjustedMouseY <= baseButtonY + 40
      ) {
        console.log("Save Score to Blockchain clicked!");
        saveScoreToBlockchain(score).then(() => {
          scoreSaved = true;
          showSaveButton = false;
        }).catch((error) => {
          console.error("Error saving score:", error);
        });
      }

  // "Relaunch" Button
  if (
    adjustedMouseX >= buttonX &&
    adjustedMouseX <= buttonX + 180 &&
    adjustedMouseY >= baseButtonY + 50 &&
    adjustedMouseY <= baseButtonY + 90
  ) {
    console.log("Relaunch clicked!");
    startGame();
  }

  // "Share Score" Button
  if (
    adjustedMouseX >= buttonX &&
    adjustedMouseX <= buttonX + 180 &&
    adjustedMouseY >= baseButtonY + 100 &&
    adjustedMouseY <= baseButtonY + 140
  ) {
    console.log("Share Score clicked!");
    let shareText = `I synced ${score.toFixed(1)} points in Superseed Cosmic Network! #SuperseedGrok3`;
    navigator.clipboard.writeText(shareText);
    alert("Score copied to clipboard: " + shareText);
  }

  // "Menu" Button
  if (
    adjustedMouseX >= buttonX &&
    adjustedMouseX <= buttonX + 180 &&
    adjustedMouseY >= baseButtonY + 150 &&
    adjustedMouseY <= baseButtonY + 190
  ) {
    console.log("Menu clicked!");
    gameState = "howToPlay";
    savedGameState = null;
    if (soundInitialized) {
      backgroundMusic.stop();
      backgroundMusic2.stop();
      backgroundMusic3.stop();
      bossMusic.stop();
      introMusic.stop();
      introMusic.loop();
    }
  }

  // "Share Badge" Button (jeśli zdobyta odznaka)
  if (mainnetBadgeEarned) {
    let badgeButtonY = baseButtonY + 200;
    if (
      adjustedMouseX >= buttonX &&
      adjustedMouseX <= buttonX + 180 &&
      adjustedMouseY >= badgeButtonY &&
      adjustedMouseY <= badgeButtonY + 40
    ) {
      console.log("Share Badge clicked!");
      let shareText = `I just unlocked the Superseed Mainnet in the Grok3 Game Contest! Join the challenge and win a Tesla! (virtual:) #SuperseedGrok3 [game link]`;
      navigator.clipboard.writeText(shareText);
      alert("Badge share text copied to clipboard: " + shareText);
    }
  }



      
    } else if (gameState === "playing" || gameState === "supernova" || gameState === "bossFight") {
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
            if (soundInitialized) lifeRestoreSound.play();
          } else if (powerUps[i].type === "gas") {
            powerUpEffect = "gas";
            powerUpEffectTime = powerUpDurations.gas * (1 + level * 0.1);
            if (soundInitialized) powerUpSound.play();
          } else if (powerUps[i].type === "pulse") {
            fireRate = max(fireRate - 50, 100); // Przyspieszenie strzelania w bossFight
            powerUpEffect = "pulse";
            powerUpEffectTime = powerUpDurations.pulse * (1 + level * 0.1);
            if (soundInitialized) pulseBoostSound.play();
          } else if (powerUps[i].type === "orbit") {
            powerUpEffect = "orbit";
            shieldActive = true;
            powerUpEffectTime = powerUpDurations.orbit * (1 + level * 0.1);
            if (soundInitialized) shieldOnSound.play();
          } else if (powerUps[i].type === "meteor") {
            powerUpEffect = "meteor";
            meteorShowerActive = true;
            powerUpEffectTime = powerUpDurations.meteor * (1 + level * 0.1);
            if (soundInitialized) powerUpSound.play();
          } else if (powerUps[i].type === "star") {
            powerUpEffect = "star";
            starBoostActive = true;
            powerUpEffectTime = powerUpDurations.star * (1 + level * 0.1);
            if (soundInitialized) growSound.play(); // Nowy dedykowany dźwięk
          } else if (powerUps[i].type === "wave") {
            if (gameState === "bossFight") {
              bossBullets = []; // Czyści pociski bossa
              for (let j = 0; j < 20; j++) {
                particles.push(new Particle(player.x, player.y, { r: seedColor.r, g: seedColor.g, b: seedColor.b }));
              }
            }
          } else if (powerUps[i].type === "nova") {
            powerUpEffect = "nova";
            freezeActive = true;
            powerUpEffectTime = powerUpDurations.nova * (1 + level * 0.1);
            if (soundInitialized) freezeSound.play();
          }
          powerUps.splice(i, 1); // Usunięcie zebranego power-upu
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
    } else if (gameState === "bossIntro") {
      introClicked = true;
      console.log("Boss intro clicked – skipping to bossFight");
    } else if (gameState === "bossDefeated") {
      if (bossDefeatTimer > 20000) {
        bossDefeatTimer = 20000; // Pomija zoom i przechodzi do fazy tekstu
        console.log("Zoom phase skipped – showing defeat message");
      } else {
        introClicked = true; // Przechodzi do endgame z fazy tekstu
        console.log("Defeat message skipped – moving to endgame");
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
    GAME_WIDTH = windowWidth;
    GAME_HEIGHT = windowHeight;
    logoX = GAME_WIDTH / 2;
    logoY = GAME_HEIGHT / 2;
    RESTART_BUTTON_WIDTH = 200 * scaleFactor;
    RESTART_BUTTON_HEIGHT = 50 * scaleFactor;
    SYMBOL_SIZE = 18 * scaleFactor;
    GAME_SYMBOL_SIZE = 40 * scaleFactor;
    TABLE_CELL_WIDTH = 500 * scaleFactor;
    TABLE_CELL_HEIGHT = 50 * scaleFactor;
    TABLE_START_X = (GAME_WIDTH - TABLE_CELL_WIDTH * 2) / 2;
    TABLE_START_Y = 300 * scaleFactor;
  }