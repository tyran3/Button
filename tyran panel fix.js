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

  // Do not trust a stale `.unlocked` class or inline style from the game script.
  privateTools.classList.remove('unlocked');
  privateTools.style.setProperty('display', 'none', 'important');
  passwordBox.style.display = 'grid';
  drawer.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  content.setAttribute('aria-hidden', 'true');

  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    content.setAttribute('aria-hidden', String(!open));
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;

    if (target.closest('#access-toggle')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const open = !drawer.classList.contains('open');
      setOpen(open);
      if (open && !authenticated) passwordDisplay.focus();
      return;
    }

    if (target.closest('#password-submit')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (passwordDisplay.value === CORRECT_PASSWORD) {
        authenticated = true;
        passwordBox.style.display = 'none';
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

    // Defense in depth: no private controls are usable before this page session unlocks.
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
