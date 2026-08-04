(function () {
  window.graffitiInit = function (canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // background animated noise (subtle)
    let noiseOffset = 0;
    function drawBackground() {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      const g = ctx.createLinearGradient(0, 0, canvas.width / dpr, canvas.height / dpr);
      g.addColorStop(0, 'rgba(40,10,50,0.06)');
      g.addColorStop(0.5, 'rgba(10,30,60,0.06)');
      g.addColorStop(1, 'rgba(5,5,5,0.06)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      noiseOffset += 0.3;
    }

    let painting = false;
    let last = { x: 0, y: 0 };

    function randRange(a, b) { return a + Math.random() * (b - a); }

    function spray(x, y, color) {
      const density = 40;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 20;
        const sx = x + Math.cos(angle) * r;
        const sy = y + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.random() * 0.9;
        ctx.arc(sx, sy, Math.random() * 1.8 + 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function pointerDown(e) {
      painting = true;
      const p = getPos(e);
      last = p;
      spawnSplat(p.x, p.y);
      const c = pickColor();
      spray(p.x, p.y, c);
    }
    function pointerUp() { painting = false; }
    function pointerMove(e) {
      if (!painting) return;
      const p = getPos(e);
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      const steps = Math.ceil(dist / 6);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const ix = last.x + (p.x - last.x) * t;
        const iy = last.y + (p.y - last.y) * t;
        spray(ix, iy, pickColor());
      }
      last = p;
    }
    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
      return { x: (clientX - r.left), y: (clientY - r.top) };
    }

    function pickColor() {
      const palettes = [
        ['#ff3b3b','#ff9f1c','#ffd600','#9af764'],
        ['#ff6bcb','#7c4dff','#39c0ff','#ffde59'],
        ['#39ff14','#ff2d95','#ffd36e','#4df0ff']
      ];
      const p = palettes[Math.floor(Math.random() * palettes.length)];
      return p[Math.floor(Math.random() * p.length)];
    }

    function spawnSplat(x, y) {
      const s = document.createElement('div');
      s.className = 'spray-splat';
      const size = Math.floor(randRange(12, 48));
      s.style.width = s.style.height = size + 'px';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.background = pickColor();
      s.style.opacity = 0.95;
      document.getElementById(canvasId).parentElement.appendChild(s);
      setTimeout(()=> s.remove(), 950);
    }

    setInterval(() => {
      const x = randRange(30, canvas.width / dpr - 30);
      const y = randRange(30, canvas.height / dpr - 30);
      spray(x, y, pickColor());
      spawnSplat(x, y);
    }, 1200);

    canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('touchstart', pointerDown, {passive:true});
    canvas.addEventListener('touchmove', pointerMove, {passive:true});
    canvas.addEventListener('touchend', pointerUp);

    function loop() {
      drawBackground();
      requestAnimationFrame(loop);
    }
    loop();
  };
})();
