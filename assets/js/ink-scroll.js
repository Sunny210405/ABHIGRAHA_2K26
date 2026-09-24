/**
 * Imperial Calligraphy Ink Animation Engine for Abhigraha 2K26
 * Dynamically renders "WELCOME" and "FRESHERS" on the imperial scroll with
 * authentic oriental dry-brush ink erase and ink write effects.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('scroll-ink-canvas');
  const stage = document.getElementById('hero-scroll-stage');
  const heroSection = document.getElementById('home');

  if (!canvas || !stage || !heroSection) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Base internal resolution matching the scroll aspect ratio
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 220;
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  // Load the two word images
  const imgWelcome = new Image();
  imgWelcome.src = './assets/images/scroll_welcome_canvas.webp?v=3';

  const imgFreshers = new Image();
  imgFreshers.src = './assets/images/scroll_freshers_canvas.webp?v=3';

  let imagesLoaded = 0;
  function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
      startAnimation();
    }
  }
  imgWelcome.onload = onImageLoad;
  imgFreshers.onload = onImageLoad;

  // Animation States
  const STATE_SHOW = 0;
  const STATE_ERASE = 1;
  const STATE_PAUSE = 2;
  const STATE_WRITE = 3;

  let currentState = STATE_SHOW;
  let currentWordIndex = 0; // 0 = WELCOME, 1 = FRESHERS
  const words = [imgWelcome, imgFreshers];

  let stateStartTime = performance.now();
  const DURATION_SHOW = 1900;   // Display duration in ms (reduced by 1.5s from 3400ms)
  const DURATION_ERASE = 1100;  // Erase wipe duration
  const DURATION_PAUSE = 280;   // Blank scroll pause
  const DURATION_WRITE = 1200;  // Ink write sweep duration

  // Particles for ink mist / ink splatter dissipation
  const particles = [];

  function addParticles(x, y, count, isWriting) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 70,
        vx: (Math.random() - 0.5) * 2.5 + (isWriting ? 1.2 : -0.8),
        vy: (Math.random() - 0.5) * 2.2 - 0.8,
        size: Math.random() * 4 + 1.5,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.3 ? '#fcd34d' : '#f59e0b',
        decay: Math.random() * 0.025 + 0.015
      });
    }
  }

  // Pre-generate ragged dry-brush bristle offsets for natural organic calligraphy edges
  const BRISTLE_COUNT = 120;
  const bristleOffsets = [];
  for (let i = 0; i < BRISTLE_COUNT; i++) {
    bristleOffsets.push((Math.sin(i * 0.3) * 0.4 + Math.cos(i * 0.8) * 0.3 + (Math.random() - 0.5) * 0.3) * 55);
  }

  function getBristleOffset(normalizedY) {
    const idx = Math.min(Math.floor(normalizedY * BRISTLE_COUNT), BRISTLE_COUNT - 1);
    return bristleOffsets[Math.max(0, idx)];
  }

  // Stage positioning is handled seamlessly via CSS percentage coordinates inside .hero-welcome-wrapper
  function updateScrollStagePosition() {
    stage.style.left = '';
    stage.style.top = '';
    stage.style.width = '';
    stage.style.height = '';
    stage.style.transform = '';

    const interactiveContent = document.querySelector('.hero-interactive-content');
    if (interactiveContent) {
      interactiveContent.style.marginTop = '';
    }
  }

  updateScrollStagePosition();
  window.addEventListener('resize', updateScrollStagePosition);
  window.addEventListener('orientationchange', updateScrollStagePosition);

  let isRunning = false;
  let rafId = null;
  let pausedElapsed = 0;

  function scheduleRender() {
    if (!isRunning) {
      isRunning = true;
      stateStartTime = performance.now() - pausedElapsed;
      rafId = requestAnimationFrame(render);
    }
  }

  function pauseRender() {
    if (isRunning) {
      isRunning = false;
      pausedElapsed = performance.now() - stateStartTime;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }

  // Animation Loop
  function render(now) {
    if (!isRunning) return;
    rafId = requestAnimationFrame(render);

    const elapsed = now - stateStartTime;
    ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    const currImg = words[currentWordIndex];

    if (currentState === STATE_SHOW) {
      // 1. Fully visible with static golden calligraphy ink glow (NO zoom/scale effect)
      ctx.save();
      ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
      ctx.shadowBlur = 12;
      ctx.drawImage(currImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);
      ctx.restore();

      if (elapsed >= DURATION_SHOW) {
        currentState = STATE_ERASE;
        stateStartTime = now;
      }
    } else if (currentState === STATE_ERASE) {
      // 2. Ink Erase: Organic brush sweep dissolves text from left to right
      const progress = Math.min(elapsed / DURATION_ERASE, 1.0);
      const sweepX = progress * (BASE_WIDTH + 140) - 70;

      ctx.save();
      ctx.drawImage(currImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

      // Erase mask using destination-out
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.max(0, sweepX + getBristleOffset(0)), 0);

      const STEPS = 30;
      for (let s = 0; s <= STEPS; s++) {
        const ny = s / STEPS;
        const py = ny * BASE_HEIGHT;
        const px = sweepX + getBristleOffset(ny);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(0, BASE_HEIGHT);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      // Emit dissipating ink smoke particles along active brush edge
      if (progress < 0.95) {
        const sampleY = Math.random() * BASE_HEIGHT;
        const brushFrontX = sweepX + getBristleOffset(sampleY / BASE_HEIGHT);
        addParticles(brushFrontX, sampleY, 3, false);
      }

      if (elapsed >= DURATION_ERASE) {
        currentState = STATE_PAUSE;
        stateStartTime = now;
      }
    } else if (currentState === STATE_PAUSE) {
      // 3. Clean blank red scroll pause
      if (elapsed >= DURATION_PAUSE) {
        currentState = STATE_WRITE;
        stateStartTime = now;
        currentWordIndex = (currentWordIndex + 1) % words.length;
      }
    } else if (currentState === STATE_WRITE) {
      // 4. Ink Write: Calligraphy brush sweeps across, revealing next word with golden ink
      const progress = Math.min(elapsed / DURATION_WRITE, 1.0);
      const sweepX = progress * (BASE_WIDTH + 140) - 70;

      ctx.save();
      // Clip reveal path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.max(0, sweepX + getBristleOffset(0)), 0);

      const STEPS = 30;
      for (let s = 0; s <= STEPS; s++) {
        const ny = s / STEPS;
        const py = ny * BASE_HEIGHT;
        const px = sweepX + getBristleOffset(ny);
        ctx.lineTo(px, py);
      }
      ctx.lineTo(0, BASE_HEIGHT);
      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
      ctx.shadowBlur = 14;
      ctx.drawImage(currImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);
      ctx.restore();

      // Golden ink splatter on leading edge of brush
      if (progress < 0.95) {
        const sampleY = Math.random() * BASE_HEIGHT;
        const brushFrontX = sweepX + getBristleOffset(sampleY / BASE_HEIGHT);
        addParticles(brushFrontX, sampleY, 3, true);
      }

      if (elapsed >= DURATION_WRITE) {
        currentState = STATE_SHOW;
        stateStartTime = now;
      }
    }

    // Render & update active ink particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function startAnimation() {
    updateScrollStagePosition();
    setTimeout(updateScrollStagePosition, 100);
    setTimeout(updateScrollStagePosition, 500);
    stateStartTime = performance.now();
    scheduleRender();
  }

  // IntersectionObserver to pause rendering when scroll canvas is out of viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && document.visibilityState !== 'hidden') {
          scheduleRender();
        } else {
          pauseRender();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseRender();
    } else {
      scheduleRender();
    }
  });

  // Initial trigger
  document.addEventListener('DOMContentLoaded', () => {
    updateScrollStagePosition();
  });
})();
