/* ============================================================
   MAIN.JS — Abdul Hanan AI/ML Portfolio
   GSAP-powered animations, particles, interactive effects
   ============================================================ */

/* ============================================================
   LOADER
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('done');
    document.body.style.overflow = '';
    initAllAnimations();
  }, 2400);
  document.body.style.overflow = 'hidden';
});

function initAllAnimations() {
  initCursor();
  initNavbar();
  initHeroTyping();
  initParticleCanvas();
  initOrbParticles();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initSkillFilter();
  initMagneticButtons();
  initProjectGraphAnim();
  initWaveBars();
  initContactForm();
  initMobileMenu();
  initHeroParallax();
  initStatsCounters();
  initExpSection();
}

/* ============================================================
   CURSOR
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let fx = mx, fy = my;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .skill-card, .project-card, .contact-link, .ach-card, [data-reveal]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    });
  });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.add('show');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ============================================================
   HERO TYPING EFFECT
   ============================================================ */
window.heroPhrases = [
  'RAG Pipelines',
  'AI Agents',
  'Multimodal AI',
  'Backend Engineering',
  'Cloud Infrastructure',
  'Recommendation Systems',
  'Vector Databases',
  'LangChain Expert',
];

function initHeroTyping() {
  const el = document.getElementById('typedText');
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = window.heroPhrases[phraseIdx % window.heroPhrases.length];
    if (!current) {
       setTimeout(type, 100);
       return;
    }
    
    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % window.heroPhrases.length;
      }
    }
    setTimeout(type, deleting ? 40 : 75);
  }
  setTimeout(type, 1000);
}

/* ============================================================
   PARTICLE CANVAS BACKGROUND
   ============================================================ */
function initParticleCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], connections = [];
  const NUM = window.innerWidth < 768 ? 40 : 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      const c = Math.random();
      if (c < 0.4) this.color = `rgba(0, 168, 255, ${this.alpha})`;
      else if (c < 0.7) this.color = `rgba(124, 58, 237, ${this.alpha})`;
      else this.color = `rgba(6, 182, 212, ${this.alpha})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < NUM; i++) particles.push(new Particle());

  let mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function drawGrid() {
    const size = 80;
    ctx.strokeStyle = 'rgba(0, 168, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    // Mouse glow
    const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200);
    grad.addColorStop(0, 'rgba(0, 168, 255, 0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => { p.update(); p.draw(); });

    // Connect nearby
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 168, 255, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   ORB PARTICLES (Hero Visual)
   ============================================================ */
function initOrbParticles() {
  const container = document.getElementById('orbParticles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const angle = Math.random() * 360;
    const radius = 40 + Math.random() * 60;
    const duration = 3 + Math.random() * 4;
    const delay = Math.random() * -duration;
    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: `hsl(${200 + Math.random() * 60}, 100%, 70%)`,
      boxShadow: `0 0 ${size * 2}px currentColor`,
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`,
      animation: `orbRot ${duration}s linear ${delay}s infinite`,
      opacity: 0.7,
    });
    container.appendChild(p);
  }
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, 80 * (entry.target.dataset.revealDelay || 0));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el, i) => {
    el.dataset.revealDelay = i % 4;
    observer.observe(el);
  });
}

/* ============================================================
   COUNTERS (Hero Stats)
   ============================================================ */
function initStatsCounters() {
  const statNums = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => observer.observe(el));
}

function initCounters() {
  const achNums = document.querySelectorAll('.ach-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  achNums.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* ============================================================
   SKILL BARS
   ============================================================ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.dataset.width;
        setTimeout(() => {
          entry.target.style.width = target + '%';
        }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   SKILL FILTER
   ============================================================ */
function initSkillFilter() {
  const btns = document.querySelectorAll('.skill-cat-btn');
  const cards = document.querySelectorAll('.skill-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeScaleIn 0.4s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagneticButtons() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.2;
      const dy = (e.clientY - cy) * 0.2;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

/* ============================================================
   PROJECT GRAPH ANIMATION (Doctor Path AI)
   ============================================================ */
function initProjectGraphAnim() {
  const container = document.getElementById('graphAnim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = container.offsetWidth || 600;
  canvas.height = 80;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const nodes = [
    { x: 0.1, y: 0.5, label: 'Query' },
    { x: 0.3, y: 0.25, label: 'FAISS' },
    { x: 0.3, y: 0.75, label: 'Neo4j' },
    { x: 0.55, y: 0.5, label: 'RAG' },
    { x: 0.75, y: 0.3, label: 'MedGemma' },
    { x: 0.9, y: 0.5, label: 'Rx' },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[3,5]];

  let t = 0;
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    edges.forEach(([a, b]) => {
      const na = nodes[a], nb = nodes[b];
      const ax = na.x * W, ay = na.y * H;
      const bx = nb.x * W, by = nb.y * H;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(0, 168, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Animated pulse along edge
      const pulse = (t * 0.4 + edges.indexOf([a, b]) * 0.3) % 1;
      const px = ax + (bx - ax) * pulse;
      const py = ay + (by - ay) * pulse;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 168, 255, 0.8)';
      ctx.fill();
    });

    nodes.forEach((n, i) => {
      const x = n.x * W, y = n.y * H;
      const glow = Math.sin(t * 2 + i) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 168, 255, ${glow})`;
      ctx.shadowColor = 'rgba(0, 168, 255, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '8px Space Grotesk, sans-serif';
      ctx.fillStyle = 'rgba(136, 153, 187, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, x, y - 9);
    });
    t += 0.01;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   WAVEFORM BARS (APD Listener)
   ============================================================ */
function initWaveBars() {
  const container = document.getElementById('waveBars');
  if (!container) return;
  const numBars = 40;
  for (let i = 0; i < numBars; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    const delay = (i / numBars) * 1.2;
    const height = 20 + Math.random() * 80;
    bar.style.cssText = `
      animation-delay: ${delay}s;
      animation-duration: ${0.8 + Math.random() * 0.8}s;
      max-height: ${height}%;
    `;
    container.appendChild(bar);
  }
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    
    const name = document.getElementById('fname').value;
    const email = document.getElementById('femail').value;
    const subject = document.getElementById('fsubject').value || "No Subject";
    const message = document.getElementById('fmessage').value;
    const honeypot = document.getElementById('website_honeypot').value;

    if (!name || !email || !message) {
      alert("Please fill in the required fields (Name, Email, Message).");
      return;
    }

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    try {
      const response = await fetch('http://localhost:8000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
          website_honeypot: honeypot
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      // Success
      btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
      btn.disabled = false;
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 5000);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again later or email me directly.");
      btn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
      btn.disabled = false;
    }
  });
}

/* ============================================================
   HERO PARALLAX
   ============================================================ */
function initHeroParallax() {
  const orbs = document.querySelectorAll('.orb');
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 8;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });

    const floatIcons = document.querySelectorAll('.float-icon');
    floatIcons.forEach((icon, i) => {
      const factor = (i % 3 + 1) * 5;
      const baseAnim = icon.style.animation;
      icon.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });
}

/* ============================================================
   EXPERIENCE SECTION — TRACK FILTER + ANIMATIONS
   ============================================================ */
function initExpSection() {
  /* ---- Track Filter ---- */
  const trackBtns = document.querySelectorAll('.exp-track-btn');
  const expItems = document.querySelectorAll('.exp-item');

  trackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      trackBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const track = btn.dataset.track;

      expItems.forEach((item, i) => {
        const itemTracks = item.dataset.track || '';
        const matches = track === 'all' || itemTracks.includes(track);
        if (matches) {
          item.classList.remove('exp-hidden');
          item.style.animation = `expCardReveal 0.5s ${i * 0.08}s var(--ease) both`;
        } else {
          item.classList.add('exp-hidden');
        }
      });
    });
  });

  /* ---- Rail Fill on Scroll ---- */
  const rail = document.getElementById('expRailFill');
  const timeline = document.getElementById('expTimeline');
  if (rail && timeline) {
    const railObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => { rail.style.height = '100%'; }, 300);
          railObserver.unobserve(timeline);
        }
      });
    }, { threshold: 0.1 });
    railObserver.observe(timeline);
  }

  /* ---- Card hover scan-line effect ---- */
  document.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ---- Terminal typewriter animation ---- */
  const termBodies = document.querySelectorAll('.exp-terminal-body');
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll('.term-line');
        lines.forEach((line, i) => {
          line.style.opacity = '0';
          line.style.transform = 'translateX(-8px)';
          setTimeout(() => {
            line.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            line.style.opacity = '1';
            line.style.transform = 'translateX(0)';
          }, 200 + i * 180);
        });
        termObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  termBodies.forEach(tb => termObserver.observe(tb));

  /* ---- Curriculum pill stagger on scroll ---- */
  const currGrids = document.querySelectorAll('.exp-curriculum-grid');
  const currObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pills = entry.target.querySelectorAll('.curr-pill');
        pills.forEach((pill, i) => {
          pill.style.opacity = '0';
          pill.style.transform = 'scale(0.85)';
          setTimeout(() => {
            pill.style.transition = 'opacity 0.4s ease, transform 0.4s var(--ease)';
            pill.style.opacity = '1';
            pill.style.transform = 'scale(1)';
          }, 100 + i * 70);
        });
        currObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  currGrids.forEach(g => currObserver.observe(g));
}

// Add CSS for skill card animation & experience card reveal
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes expCardReveal {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .nav-link.active {
    color: var(--white) !important;
    background: rgba(0, 168, 255, 0.1);
  }
  @keyframes growLine {
    from { transform: scaleY(0); transform-origin: top; }
    to { transform: scaleY(1); transform-origin: top; }
  }
  /* Mouse spotlight on exp cards */
  .exp-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      250px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(0, 168, 255, 0.05),
      transparent 70%
    );
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .exp-card:hover::after { opacity: 1; }
`;
document.head.appendChild(style);


/* ============================================================
   ROLE MANAGER (Dynamic 3-in-1 Portfolio)
   ============================================================ */
const ROLE_DATA = {
  ai: {
    theme: 'ai',
    title: 'AI/ML Engineer',
    desc: 'Designing intelligent AI systems. Specializing in RAG pipelines, vector databases, multimodal retrieval, and shipping applied ML to production.',
    phrases: ['RAG Pipelines', 'Vector Databases', 'LangChain', 'Multimodal AI', 'Recommendation Systems'],
    ctaText: 'Hire Me for AI Engineering',
    resumeLink: 'files (1)/AbdulHanan_CV_AIMLEngineer.pdf',
    projectsOrder: ['proj-doctorpath', 'proj-tradie', 'proj-apd'],
    skillsOrder: ['skill-langchain', 'skill-vectordb', 'skill-python', 'skill-aws', 'skill-docker', 'skill-fastapi']
  },
  fs: {
    theme: 'fs',
    title: 'Full Stack AI Engineer',
    desc: 'Shipping end-to-end AI SaaS applications. Connecting modern React frontends with powerful FastAPI backends and intelligent LLM workflows.',
    phrases: ['React + FastAPI', 'Full Stack AI', 'AI SaaS Products', 'Cloud Deployment', 'Frontend/Backend'],
    ctaText: 'Build AI Products With Me',
    resumeLink: 'files (1)/AbdulHanan_CV_FullStackAIEngineer.pdf',
    projectsOrder: ['proj-tradie', 'proj-apd', 'proj-doctorpath'],
    skillsOrder: ['skill-react', 'skill-fastapi', 'skill-python', 'skill-aws', 'skill-docker', 'skill-langchain']
  },
  se: {
    theme: 'se',
    title: 'Associate Software Engineer',
    desc: 'Building scalable backend systems, robust APIs, and automated cloud workflows. Focused on clean architecture, performance, and reliability.',
    phrases: ['Backend Engineering', 'APIs & Microservices', 'Docker & AWS', 'PostgreSQL', 'System Design'],
    ctaText: 'Hire Me as a Software Engineer',
    resumeLink: 'files (1)/AbdulHanan_CV_AssociateSoftwareEngineer.pdf',
    projectsOrder: ['proj-tradie', 'proj-apd', 'proj-doctorpath'],
    skillsOrder: ['skill-python', 'skill-fastapi', 'skill-docker', 'skill-aws', 'skill-postgres', 'skill-cicd']
  }
};

function initRoleManager() {
  const roleTitle = document.getElementById('roleCycler');
  const roleDesc = document.querySelector('.hero-desc');
  const ctaBtn = document.querySelector('#viewProjectsBtn span');
  const resumeBtns = document.querySelectorAll('a[download]');
  const projectsGrid = document.querySelector('.projects-grid');
  const skillsGrid = document.querySelector('.skills-grid');

  // Create transition overlay
  const overlay = document.createElement('div');
  overlay.className = 'role-transition-overlay';
  document.body.appendChild(overlay);

  const roles = ['ai', 'fs', 'se'];
  let currentRoleIdx = 0;

  if (roleTitle) {
    roleTitle.addEventListener('dblclick', () => {
      // Cycle to next role
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      const role = roles[currentRoleIdx];
      const data = ROLE_DATA[role];
      
      // Trigger Transition Wipe
      overlay.classList.add('active');
      
      setTimeout(() => {
        // 1. Theme Change
        document.body.setAttribute('data-theme', data.theme);
        
        // 2. Text Updates
        roleTitle.textContent = data.title;
        if (roleDesc) roleDesc.textContent = data.desc;
        if (ctaBtn) ctaBtn.textContent = data.ctaText;
        
        // 3. Resume Links
        resumeBtns.forEach(rBtn => {
          rBtn.href = data.resumeLink;
          rBtn.setAttribute('download', data.resumeLink.split('/').pop());
        });
        
        // 4. Typing Phrases Update
        window.heroPhrases = data.phrases;
        
        // 5. Projects Reorder
        if (projectsGrid) {
          data.projectsOrder.forEach((id, index) => {
            const proj = document.getElementById(id);
            if (proj) proj.style.order = index;
          });
        }
        
        // 6. Skills Reorder
        if (skillsGrid) {
          data.skillsOrder.forEach((id, index) => {
            const skill = document.getElementById(id);
            if (skill) skill.style.order = index;
          });
        }
        
      }, 400); // Wait for screen wipe halfway
      
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 800);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initRoleManager, 500); // Initialize after main load
});
