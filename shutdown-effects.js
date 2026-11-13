(() => {
  const status = document.getElementById('event-status');
  if (!status || !document.body) return;

  const shutdownLayer = document.createElement('div');
  shutdownLayer.className = 'shutdown-message-layer';
  shutdownLayer.setAttribute('aria-hidden', 'true');
  shutdownLayer.innerHTML = '<span>SHUTDOWN</span>';

  const reconstructLayer = document.createElement('div');
  reconstructLayer.className = 'reconstruct-message-layer';
  reconstructLayer.setAttribute('aria-hidden', 'true');
  reconstructLayer.textContent = 'Reconstructing';

  let shutdownActive = false;
  let reconstructionTimer = null;
  let effectTimer = null;
  let soundTimer = null;
  let audioContext = null;
  let previousSecond = null;

  function playRandomEffect() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioContext ||= new AudioContext();
      audioContext.resume().catch(() => {});

      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const frequencies = [110, 165, 220, 330, 440, 587, 740, 880, 1047];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const duration = 0.12 + Math.random() * 0.28;

      oscillator.type = ['sawtooth', 'square', 'triangle'][Math.floor(Math.random() * 3)];
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * (0.45 + Math.random())), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch (error) {
      // Sound is optional; the visual shutdown continues if audio is blocked.
    }
  }

  function beginReconstruction() {
    shutdownActive = false;
    clearInterval(soundTimer);
    clearInterval(effectTimer);
    soundTimer = null;
    effectTimer = null;
    previousSecond = null;
    document.body.classList.remove('shutdown-chaos', 'shutdown');
    shutdownLayer.remove();

    if (reconstructionTimer !== null) clearTimeout(reconstructionTimer);
    document.body.classList.add('reconstructing');
    document.body.appendChild(reconstructLayer);
    reconstructionTimer = setTimeout(() => {
      reconstructLayer.remove();
      document.body.classList.remove('reconstructing');
      reconstructionTimer = null;
    }, 5000);
  }

  function updateEffects() {
    const text = status.textContent || '';
    const match = text.match(/(\d+)\s+Seconds Until Shutdown/i);

    if (match) {
      const secondsLeft = Number(match[1]);
      if (!shutdownActive) {
        shutdownActive = true;
        document.body.classList.remove('reconstructing');
        if (reconstructionTimer !== null) clearTimeout(reconstructionTimer);
        reconstructionTimer = null;
        reconstructLayer.remove();
        document.body.appendChild(shutdownLayer);
      }

      if (secondsLeft <= 10) {
        document.body.classList.add('shutdown-chaos');
        if (soundTimer === null) soundTimer = setInterval(playRandomEffect, 700 + Math.random() * 500);
        if (secondsLeft !== previousSecond) {
          previousSecond = secondsLeft;
          playRandomEffect();
        }
      } else {
        document.body.classList.remove('shutdown-chaos');
      }
    } else if (shutdownActive) {
      beginReconstruction();
    }
  }

  const observer = new MutationObserver(updateEffects);
  observer.observe(status, { childList: true, characterData: true, subtree: true });
  updateEffects();
  effectTimer = setInterval(updateEffects, 100);
})();
