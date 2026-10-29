/**
 * Atmospheric Background with Moonlight, Candlelight Glow, and Floating Particles
 * Pure CSS & Canvas implementation - lightweight, responsive, and adheres to prefers-reduced-motion.
 */

import React, { useEffect, useRef } from 'react';

export const AtmosphericBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system: embers, soft mist motes, and distant fireflies
    const particleCount = Math.min(width > 768 ? 45 : 22, 60);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.45 - 0.1, // gently float upward like candle embers
      alpha: Math.random() * 0.6 + 0.15,
      alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      isAmber: Math.random() > 0.35, // amber ember or cool mist particle
    }));

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha += p.alphaSpeed;

          if (p.alpha <= 0.05 || p.alpha >= 0.75) {
            p.alphaSpeed = -p.alphaSpeed;
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.isAmber) {
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha * 0.7})`;
          ctx.shadowColor = 'rgba(196, 181, 253, 0.3)';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep midnight ambient gradient */}
      <div className="absolute inset-0 bg-radial from-[#121420]/70 via-[#0a0b11]/90 to-[#06070a]" />

      {/* Moon glow top-right */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-amber-100/5 blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-purple-900/10 blur-3xl pointer-events-none" />

      {/* Candlelight glow bottom-left */}
      <div className="absolute -bottom-32 left-10 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Subtle misty layer */}
      <div className="mist-drift-layer absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />

      {/* Canvas for floating embers and mist motes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
