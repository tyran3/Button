(() => {
  const SAVE_KEY = 'click-counter-save';
  const status = document.getElementById('event-status');
  const tokenDisplay = document.getElementById('token-count');
  if (!status || !tokenDisplay) return;

  function readSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  let savedTokens = Number(readSave().pirateTokens) || 0;
  let tokenCeiling = savedTokens + 1;
  let tokenAwardedThisCycle = false;
  let shutdownSeen = false;
  let shutdownFinished = false;
  let reloadAfterShutdown = false;
  let correcting = false;

  function formatCount(value) {
    return Math.max(0, Math.floor(value)).toLocaleString();
  }

  function correctStoredCount(value) {
    if (!Number.isFinite(value)) return value;
    const corrected = Math.min(Math.max(0, Math.floor(value)), tokenCeiling);
    if (corrected > savedTokens) tokenAwardedThisCycle = true;
    return corrected;
  }

  function correctSaveValue(value) {
    try {
      const save = JSON.parse(value);
      if (Number.isFinite(save.pirateTokens)) {
        save.pirateTokens = correctStoredCount(save.pirateTokens);
        value = JSON.stringify(save);
      }
    } catch {
      // Preserve values the game itself may handle.
    }
    return value;
  }

  // Cap the stored total to one new token between completed shutdowns. This
  // blocks repeated awards even if multiple roll timers are accidentally active.
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key === SAVE_KEY) value = correctSaveValue(value);
    return originalSetItem.call(this, key, value);
  };

  function updateTokenDisplay() {
    if (correcting) return;
    const shown = Number((tokenDisplay.textContent || '').replaceAll(',', ''));
    if (!Number.isFinite(shown)) return;
    const corrected = Math.min(Math.max(0, Math.floor(shown)), tokenCeiling);
    if (corrected !== shown) {
      correcting = true;
      tokenDisplay.textContent = formatCount(corrected);
      correcting = false;
    }
    if (corrected > savedTokens) tokenAwardedThisCycle = true;
  }

  function handleStatus() {
    const text = status.textContent || '';
    if (/Seconds Until Shutdown/i.test(text) || /Reconstructing/i.test(text)) {
      shutdownSeen = true;
      return;
    }

    if (!shutdownSeen || !/Seconds\s*\|\s*Pirate Shop Token Chance:/i.test(text)) return;

    shutdownSeen = false;
    shutdownFinished = true;
    const save = readSave();
    const currentTokens = Math.max(0, Number(save.pirateTokens) || savedTokens);
    savedTokens = currentTokens;
    tokenCeiling = savedTokens + 1;
    tokenAwardedThisCycle = false;

    // Rebirths must not leave the chance at 1/1 after a shutdown. Reload only
    // when needed so the running game's in-memory odds read the reset value.
    if (!reloadAfterShutdown && Number(save.rebirths) > 0) {
      reloadAfterShutdown = true;
      save.rebirths = 0;
      save.clicks = 0;
      save.autoRebirth = false;
      save.autoclicker = false;
      try {
        originalSetItem.call(localStorage, SAVE_KEY, JSON.stringify(save));
        window.location.reload();
      } catch (error) {
        console.warn('Could not reset rebirth odds after shutdown.', error);
      }
    }
    shutdownFinished = false;
  }

  const observer = new MutationObserver(() => {
    updateTokenDisplay();
    handleStatus();
  });
  observer.observe(status, { childList: true, characterData: true, subtree: true });
  observer.observe(tokenDisplay, { childList: true, characterData: true, subtree: true });
  updateTokenDisplay();
  handleStatus();
})();
