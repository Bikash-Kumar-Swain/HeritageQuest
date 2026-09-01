/* ==========================================================================
   GeoQuest Atmospheric Particle System
   Floating golden embers & ancient dust particles
   ========================================================================== */

export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 45;
    this.animationFrame = null;
    this.width = 0;
    this.height = 0;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initParticles();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width || 390;
    this.height = this.canvas.height = rect.height || 844;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const isEmber = Math.random() > 0.45;
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      radius: isEmber ? (Math.random() * 2.2 + 1) : (Math.random() * 1.2 + 0.4),
      speedY: -(Math.random() * 0.75 + 0.25),
      speedX: (Math.random() - 0.5) * 0.45,
      opacity: Math.random() * 0.6 + 0.2,
      maxOpacity: Math.random() * 0.8 + 0.2,
      fadeSpeed: Math.random() * 0.008 + 0.003,
      isEmber: isEmber,
      // Gold to warm amber hues
      color: isEmber
        ? `hsla(${Math.floor(Math.random() * 20 + 38)}, 85%, 65%, `
        : `hsla(${Math.floor(Math.random() * 15 + 45)}, 90%, 75%, `,
      pulse: Math.random() * Math.PI,
      pulseSpeed: Math.random() * 0.04 + 0.02
    };
  }

  start() {
    if (!this.animationFrame) {
      this.animate();
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.pulse) * 0.25;
      p.pulse += p.pulseSpeed;

      // Glow pulsation
      const currentOpacity = Math.sin(p.pulse) * 0.3 + p.opacity;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.max(0, Math.min(1, currentOpacity)) + ')';
      
      // Soft radial glow for larger embers
      if (p.isEmber && p.radius > 1.5) {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = 'rgba(235, 208, 123, 0.6)';
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fill();

      // Reset when exiting top or sides
      if (p.y < -10 || p.x < -10 || p.x > this.width + 10) {
        this.particles[i] = this.createParticle(false);
      }
    }

    this.animationFrame = requestAnimationFrame(this.animate);
  }
}
