// ================================================================
// 花里胡哨特效合集：樱花、粒子、3D卡片、渐入、打字机、光标拖尾
// ================================================================

const isHome = () => window.location.pathname === '/' || window.location.pathname === '/page/1/';

// ==================== Canvas: 樱花飘落 + 粒子连线 ====================
function initCanvasEffects(): void {
  if (!isHome()) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'sakura-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d')!;

  let W = 0, H = 0;
  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = document.documentElement.scrollHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // --- 樱花粒子 ---
  interface Petal {
    x: number; y: number; r: number; vx: number; vy: number;
    rot: number; vRot: number; alpha: number; color: string;
  }
  const petals: Petal[] = [];
  const petalColors = ['#f8a0b8', '#f8b8c8', '#f8c8d8', '#e890a8', '#f8d0d8'];

  for (let i = 0; i < 40; i++) {
    petals.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 4 + Math.random() * 8,
      vx: -0.3 + Math.random() * 0.6,
      vy: 0.4 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.03,
      alpha: 0.4 + Math.random() * 0.4,
      color: petalColors[Math.floor(Math.random() * petalColors.length)]
    });
  }

  // --- 粒子星图 ---
  interface Star {
    x: number; y: number; r: number; vx: number; vy: number;
  }
  const stars: Star[] = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    });
  }

  let mouseX = -1000, mouseY = -1000;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function drawPetal(p: Petal, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    // 画花瓣形状
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 花瓣尖
    ctx.beginPath();
    ctx.moveTo(p.r * 0.6, 0);
    ctx.lineTo(p.r, -p.r * 0.15);
    ctx.lineTo(p.r, p.r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // 樱花
    for (const p of petals) {
      p.x += p.vx + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.3;
      p.y += p.vy;
      p.rot += p.vRot;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      drawPetal(p, ctx);
    }

    // 粒子连线
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
    }

    // 画粒子
    ctx.fillStyle = 'rgba(180, 130, 220, 0.5)';
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 鼠标附近连线
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(180, 130, 220, ${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
      // 粒子与鼠标连线
      const dmx = stars[i].x - mouseX;
      const dmy = stars[i].y - mouseY;
      const dm = Math.sqrt(dmx * dmx + dmy * dmy);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(228, 113, 138, ${0.25 * (1 - dm / 180)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}


// ==================== 卡片 3D 倾斜 ====================
function initCard3D(): void {
  const cards = document.querySelectorAll('.article-preview');
  cards.forEach(card => {
    const el = card as HTMLElement;
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    // 添加光泽层
    const glare = document.createElement('div');
    glare.className = 'glare';
    el.appendChild(glare);

    el.addEventListener('mousemove', (e: Event) => {
      const me = e as MouseEvent;
      const rect = el.getBoundingClientRect();
      const x = me.clientX - rect.left;
      const y = me.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      // 光泽跟随鼠标
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.1) 0%, transparent 60%)`;
      glare.style.opacity = '1';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      glare.style.opacity = '0';
    });
  });

  // 3D 卡片只在大屏幕启用
  if (window.innerWidth < 768) return;
}


// ==================== 滚动渐入 ====================
function initScrollReveal(): void {
  const targets = document.querySelectorAll('.article-preview, .widget, .article-content > *, .archive.article-list .archives-date');
  targets.forEach(el => el.classList.add('fade-in-up'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}


// ==================== 自定义光标 + 拖尾 ====================
function initCustomCursor(): void {
  if (window.innerWidth < 768) return; // 移动端不用

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const trails: HTMLElement[] = [];
  const maxTrails = 12;

  // 交互元素变大
  const interactive = 'a, button, input, textarea, .article-preview, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactive)) cursor.classList.add('hovering');
  });
  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactive)) cursor.classList.remove('hovering');
  });

  let lastX = 0, lastY = 0;
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // 拖尾粒子
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 5) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      dot.style.width = (3 + Math.random() * 3) + 'px';
      dot.style.height = dot.style.width;
      dot.style.background = Math.random() > 0.5 ? 'var(--neon-pink)' : 'var(--neon-purple)';
      document.body.appendChild(dot);
      trails.push(dot);
      if (trails.length > maxTrails) {
        const old = trails.shift()!;
        old.remove();
      }
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // 清理：每 200ms 清理旧拖尾
  setInterval(() => {
    const now = Date.now();
    for (let i = trails.length - 1; i >= 0; i--) {
      const opacity = parseFloat(trails[i].style.opacity || '1');
      if (opacity <= 0.05) {
        trails[i].remove();
        trails.splice(i, 1);
      }
    }
  }, 200);
}


// ==================== 打字机效果 ====================
function initTypewriter(): void {
  if (!isHome()) return;

  const title = document.querySelector('.site-title');
  if (!title) return;

  const text = title.textContent || '';
  title.textContent = '';

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  title.parentElement?.appendChild(cursor);

  let i = 0;
  const type = () => {
    if (i < text.length) {
      title.textContent += text[i];
      i++;
      setTimeout(type, 100 + Math.random() * 80);
    } else {
      // 打完保留光标闪烁
      cursor.style.animation = 'blink-caret 0.8s step-end infinite';
    }
  };
  setTimeout(type, 400);
}


// ==================== 启动 ====================
document.addEventListener('DOMContentLoaded', () => {
  initCanvasEffects();
  initCard3D();
  initScrollReveal();
  initCustomCursor();
  initTypewriter();
});
