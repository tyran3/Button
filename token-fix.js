(() => {
  const SAVE_KEY = 'click-counter-save';
  const status = document.getElementById('event-status');
  const tokenDisplay = document.getElementById('token-count');
  const chanceDisplay = document.getElementById('chance-display');
  if (!status || !tokenDisplay) return;

  let foundEvent = false;
  let foundTokenLimit = null;
  let sawShutdown = false;
  let resetTriggered = false;

  function readSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeSave(update) {
    const save = readSave();
    Object.assign(save, update);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (error) {
      console.warn('Could not update token progress.', error);
    }
  }

  // Keep the game’s save consistent if another timer attempts to save more than
  // one token during the same token-found celebration.
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key === SAVE_KEY && foundEvent && foundTokenLimit !== null) {
      try {
        const save = JSON.parse(value);
        if (Number.isFinite(save.pirateTokens)) {
          save.pirateTokens = Math.min(save.pirateTokens, foundTokenLimit);
          value = JSON.stringify(save);
        }
      } catch {
        // Leave malformed values untouched; the game handles its own save errors.
      }
    }
    return originalSetItem.call(this, key, value);
  };

  function clampTokenDisplay() {
    if (!foundEvent || foundTokenLimit === null) return;
    const displayed = Number((tokenDisplay.textContent || '').replaceAll(',', ''));
    if (Number.isFinite(displayed) && displayed > foundTokenLimit) {
      tokenDisplay.textContent = foundTokenLimit.toLocaleString();
      writeSave({ pirateTokens: foundTokenLimit });
    }
  }

  function handleStatus() {
    const text = status.textContent || '';
    const found = /Pirate Shop Token found!/i.test(text);
    const shuttingDown = /Seconds Until Shutdown/i.test(text);
    const reconstructing = /Reconstructing/i.test(text);
    const normalTimer = /Seconds\s*\|\s*Pirate Shop Token Chance:/i.test(text);

    if (found && !foundEvent) {
      // The game awards the token immediately before displaying this message.
      const current = Number((tokenDisplay.textContent || '0').replaceAll(',', '')) || 0;
      foundTokenLimit = current;
      foundEvent = true;
      const save = readSave();
      if (Number.isFinite(save.pirateTokens) && save.pirateTokens > foundTokenLimit) {
        writeSave({ pirateTokens: foundTokenLimit });
      }
    } else if (!found) {
      foundEvent = false;
      foundTokenLimit = null;
    }

    if (shuttingDown || reconstructing) sawShutdown = true;

    // At shutdown completion, clear the rebirth multiplier but preserve the
    // permanent token balance. Reloading synchronizes the game's in-memory odds.
    if (sawShutdown && normalTimer && !resetTriggered) {
      const save = readSave();
      const currentRebirths = Number(save.rebirths) || 0;
      if (currentRebirths !== 0) {
        resetTriggered = true;
        writeSave({ rebirths: 0, clicks: 0, autoRebirth: false, autoclicker: false });
        window.location.reload();
      } else {
        resetTriggered = true;
      }
    }

    clampTokenDisplay();
  }

  const observer = new MutationObserver(handleStatus);
  observer.observe(status, { childList: true, characterData: true, subtree: true });
  observer.observe(tokenDisplay, { childList: true, characterData: true, subtree: true });
  if (chanceDisplay) observer.observe(chanceDisplay, { childList: true, characterData: true, subtree: true });
  handleStatus();
})();
