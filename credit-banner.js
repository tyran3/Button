(() => {
  const button = document.getElementById('action-button');
  if (!button || document.getElementById('credit-banner')) return;

  const style = document.createElement('style');
  style.textContent = `
    #credit-banner {
      margin: 0 0 2px;
      text-align: center;
      font-size: .95rem;
      font-weight: 800;
      line-height: 1.35;
      background: linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7,#ec4899,#ef4444);
      background-size: 300% 100%;
      color: transparent;
      background-clip: text;
      -webkit-background-clip: text;
      animation: credit-rainbow 4s linear infinite;
    }
    @keyframes credit-rainbow { to { background-position: 300% 0; } }
    @media (prefers-reduced-motion: reduce) { #credit-banner { animation: none; } }
  `;
  document.head.appendChild(style);

  const credit = document.createElement('p');
  credit.id = 'credit-banner';
  credit.textContent = 'Made By tyran, WAWA, cart';
  credit.setAttribute('aria-label', 'Made By tyran, WAWA, cart');
  button.before(credit);
})();
