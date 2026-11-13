(() => {
  const status = document.getElementById('event-status');
  if (!status) return;

  const style = document.createElement('style');
  style.textContent = `
    #shutdown-visual-layer {
      position: fixed;
      z-index: 7;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      background: #070816;
      opacity: 0;
      transition: opacity .35s ease;
    }
    #shutdown-visual-layer.active { opacity: 1; }
    #shutdown-visual-layer .shutdown-stars {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: radial-gradient(ellipse at center, #17132a 0%, #080914 70%, #03040a 100%);
    }
    #shutdown-visual-layer .shutdown-star {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: var(--size);
      height: var(--size);
      border-radius: 50%;
      background: #ffd76a;
      box-shadow: 0 0 8px 2px #ffc83d99;
      animation: shutdown-star-flight var(--duration) linear var(--delay) infinite,
                 shutdown-star-glow 1.1s ease-in-out var(--delay) infinite alternate;
    }
    @keyframes shutdown-star-flight {
      from { transform: translate3d(0,0,0) scale(.5); opacity:.25 }
      to { transform: translate3d(var(--tx),var(--ty),0) scale(1.7); opacity:1 }
    }
    @keyframes shutdown-star-glow { to { filter: brightness(1.9); opacity:.5 } }
    #shutdown-visual-layer .reset-black-hole {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(13vmin,120px);
      aspect-ratio: 1;
      border-radius: 50%;
      transform: translate(-50%,-50%) scale(.05);
      opacity: 0;
      background: radial-gradient(circle,#000 0 38%,#07050e 42% 52%,#6b35a4 58%,#f4bd55 64%,#8c4ac2 70%,transparent 77%);
      filter: drop-shadow(0 0 18px #f4bd5588) drop-shadow(0 0 48px #873fd288);
      animation: shutdown-hole-open 1.4s cubic-bezier(.15,.75,.2,1) forwards,
                 shutdown-hole-spin 5s linear 1.4s infinite;
    }
    @keyframes shutdown-hole-open {
      0% { opacity:0; transform:translate(-50%,-50%) scale(.05) }
      35% { opacity:1; transform:translate(-50%,-50%) scale(1.5) }
      100% { opacity:1; transform:translate(-50%,-50%) scale(1) }
    }
    @keyframes shutdown-hole-spin { to { rotate:360deg } }
    #shutdown-visual-layer #reset-warp {
      position:absolute;
      inset:-20%;
      opacity:0;
      background:repeating-conic-gradient(from 0deg at 50% 50%,transparent 0deg 5deg,#ffd76a66 5.2deg 5.7deg,transparent 6deg 12deg);
      mask-image:radial-gradient(ellipse at center,transparent 0 7%,#000 26%,transparent 72%);
      animation:shutdown-warp .9s ease-out .25s forwards;
    }
    @keyframes shutdown-warp {
      0% { opacity:0; transform:scale(.15) rotate(0deg) }
      55% { opacity:.9 }
      100% { opacity:.25; transform:scale(1.3) rotate(35deg) }
    }
    @media(prefers-reduced-motion:reduce) {
      #shutdown-visual-layer .shutdown-star,
      #shutdown-visual-layer .reset-black-hole,
      #shutdown-visual-layer #reset-warp { animation-duration:2s }
    }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.id = 'shutdown-visual-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  let shutdownStarted = false;
  let starsTimer = null;

  function createStars() {
    const stars = document.createElement('div');
    stars.className = 'shutdown-stars';
    for (let i = 0; i < 180; i++) {
      const star = document.createElement('i');
      star.className = 'shutdown-star';
      star.style.setProperty('--x', `${Math.random() * 100}%`);
      star.style.setProperty('--y', `${Math.random() * 100}%`);
      star.style.setProperty('--size', `${Math.random() * 4 + 1}px`);
      star.style.setProperty('--tx', `${(Math.random() - .5) * 260}px`);
      star.style.setProperty('--ty', `${(Math.random() - .5) * 260}px`);
      star.style.setProperty('--duration', `${Math.random() * 1.8 + 1.1}s`);
      star.style.setProperty('--delay', `${Math.random() * .6}s`);
      stars.appendChild(star);
    }
    return stars;
  }

  function beginBlackHole() {
    if (!shutdownStarted) return;
    layer.replaceChildren();
    layer.style.background = 'radial-gradient(ellipse at center,#17132a 0%,#080914 65%,#020207 100%)';
    const hole = document.createElement('div');
    hole.className = 'reset-black-hole';
    layer.appendChild(hole);
    const warp = document.createElement('div');
    warp.id = 'reset-warp';
    layer.appendChild(warp);
  }

  function endShutdownVisual() {
    shutdownStarted = false;
    if (starsTimer !== null) clearTimeout(starsTimer);
    starsTimer = null;
    layer.classList.remove('active');
    layer.replaceChildren();
    layer.style.background = '';
  }

  function sync() {
    const text = status.textContent || '';
    if (/\d+\s+Seconds Until Shutdown/i.test(text)) {
      if (!shutdownStarted) {
        shutdownStarted = true;
        layer.replaceChildren(createStars());
        layer.style.background = '';
        layer.classList.add('active');
        starsTimer = setTimeout(beginBlackHole, 5000);
      }
      return;
    }
    if (shutdownStarted && /Reconstructing|Seconds\s*\|\s*Pirate Shop Token Chance:/i.test(text)) {
      endShutdownVisual();
    }
  }

  const observer = new MutationObserver(sync);
  observer.observe(status, { childList: true, characterData: true, subtree: true });
  sync();
})();
