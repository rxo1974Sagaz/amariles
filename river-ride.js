(() => {
  const canvas = document.getElementById('river-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best-score');
  const restartBtn = document.getElementById('restart-game');
  const leftBtn = document.getElementById('move-left');
  const rightBtn = document.getElementById('move-right');

  const W = canvas.width;
  const H = canvas.height;
  const bestKey = 'riverRideBest';

  let player;
  let obstacles;
  let score;
  let running;
  let frame;
  let speed;
  let moveLeft = false;
  let moveRight = false;

  const lanePadding = 30;

  function reset() {
    player = { x: W / 2, y: H - 70, w: 30, h: 46, speed: 5 };
    obstacles = [];
    score = 0;
    running = true;
    frame = 0;
    speed = 2.8;
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = Math.floor(score);
    bestEl.textContent = localStorage.getItem(bestKey) || '0';
  }

  function spawnObstacle() {
    const width = 38 + Math.random() * 30;
    obstacles.push({
      x: lanePadding + Math.random() * (W - width - lanePadding * 2),
      y: -40,
      w: width,
      h: 20 + Math.random() * 24,
    });
  }

  function collide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function drawRiver() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1da1d6');
    grad.addColorStop(1, '#0b4f7b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#0b7f3f';
    ctx.fillRect(0, 0, lanePadding, H);
    ctx.fillRect(W - lanePadding, 0, lanePadding, H);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 8; i++) {
      const y = (frame * speed * 1.2 + i * 90) % (H + 50) - 50;
      ctx.fillRect(W / 2 - 2, y, 4, 40);
    }
  }

  function drawPlayer() {
    ctx.fillStyle = '#ffef5d';
    ctx.beginPath();
    ctx.moveTo(player.x + player.w / 2, player.y);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.lineTo(player.x, player.y + player.h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(player.x + player.w / 2 - 3, player.y + 18, 6, 20);
  }

  function drawObstacles() {
    ctx.fillStyle = '#7b4a1e';
    obstacles.forEach((o) => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });
  }

  function drawOverlay(text) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '700 26px system-ui';
    ctx.fillText(text, W / 2, H / 2 - 6);
    ctx.font = '500 16px system-ui';
    ctx.fillText('Pressione Reiniciar para tentar de novo', W / 2, H / 2 + 25);
  }

  function gameOver() {
    running = false;
    const best = Math.max(Number(localStorage.getItem(bestKey) || 0), Math.floor(score));
    localStorage.setItem(bestKey, String(best));
    updateHud();
  }

  function loop() {
    frame += 1;

    if (running) {
      if (moveLeft) player.x -= player.speed;
      if (moveRight) player.x += player.speed;
      player.x = Math.max(lanePadding, Math.min(W - lanePadding - player.w, player.x));

      if (frame % Math.max(24, 55 - Math.floor(score / 5)) === 0) {
        spawnObstacle();
      }

      speed += 0.0004;
      score += 0.05 + speed * 0.02;

      obstacles.forEach((o) => {
        o.y += speed;
        if (collide(player, o)) gameOver();
      });
      obstacles = obstacles.filter((o) => o.y < H + 50);
    }

    drawRiver();
    drawObstacles();
    drawPlayer();
    if (!running) drawOverlay('Game Over');

    updateHud();
    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveRight = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveRight = false;
  });

  function bindTouch(btn, setter) {
    if (!btn) return;
    const on = (ev) => { ev.preventDefault(); setter(true); };
    const off = (ev) => { ev.preventDefault(); setter(false); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  }

  bindTouch(leftBtn, (v) => { moveLeft = v; });
  bindTouch(rightBtn, (v) => { moveRight = v; });

  restartBtn.addEventListener('click', reset);

  reset();
  loop();
})();
