(() => {
  const drawer = document.getElementById('access-drawer');
  const toggle = document.getElementById('access-toggle');
  const content = document.getElementById('access-content');
  const passwordBox = document.getElementById('password-box');
  const passwordDisplay = document.getElementById('password-display');
  const passwordSubmit = document.getElementById('password-submit');
  const passwordError = document.getElementById('password-error');
  const privateTools = document.getElementById('private-tools');
  if (!drawer || !toggle || !content || !passwordBox || !passwordDisplay || !passwordSubmit || !passwordError || !privateTools) return;

  const CORRECT_PASSWORD = '3516';
  let authenticated = false;

  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? "Close tyran's panel" : "Open tyran's panel only");
    content.setAttribute('aria-hidden', String(!open));
    if (open && !authenticated) passwordDisplay.focus();
  };

  // Start locked every page load, regardless of classes/styles left by the game script.
  privateTools.classList.remove('unlocked');
  privateTools.style.setProperty('display', 'none', 'important');
  passwordBox.style.setProperty('display', 'grid', 'important');
  passwordDisplay.value = '';
  passwordError.textContent = '';
  setOpen(false);

  // Capture events before the game's original handlers so its drawer and password
  // handlers cannot reveal private tools without this page-session check.
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;

    if (target.closest('#access-toggle')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(!drawer.classList.contains('open'));
      return;
    }

    if (target.closest('#password-submit')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (passwordDisplay.value === CORRECT_PASSWORD) {
        authenticated = true;
        passwordBox.style.setProperty('display', 'none', 'important');
        privateTools.classList.add('unlocked');
        privateTools.style.setProperty('display', 'grid', 'important');
        passwordError.textContent = '';
        setOpen(true);
      } else {
        passwordError.textContent = 'Incorrect code.';
        passwordDisplay.value = '';
        passwordDisplay.focus();
      }
      return;
    }

    if (!authenticated && target.closest('#private-tools')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (!authenticated && event.target instanceof Element && event.target.closest('#private-tools')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
