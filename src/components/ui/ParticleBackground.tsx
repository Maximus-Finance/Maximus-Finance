'use client';

import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  isDarkMode: boolean;
}

class Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseSize: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  rotationX: number;
  rotationY: number;
  rotationSpeed: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = (Math.random() - 0.5) * canvasWidth * 2 + canvasWidth / 2;
    this.y = (Math.random() - 0.5) * canvasHeight * 2 + canvasHeight / 2;
    this.z = Math.random() * 800 + 200;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.vz = (Math.random() - 0.5) * 3;
    this.baseSize = Math.random() * 4 + 2;
    this.size = this.baseSize;
    this.baseOpacity = Math.random() * 0.6 + 0.2;
    this.opacity = this.baseOpacity;
    this.rotationX = Math.random() * Math.PI * 2;
    this.rotationY = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    
    this.rotationX += this.rotationSpeed;
    this.rotationY += this.rotationSpeed * 0.7;

    // Wrap around screen
    if (this.x < -200) this.x = canvasWidth + 200;
    if (this.x > canvasWidth + 200) this.x = -200;
    if (this.y < -200) this.y = canvasHeight + 200;
    if (this.y > canvasHeight + 200) this.y = -200;
    if (this.z < 50) this.z = 1000;
    if (this.z > 1000) this.z = 50;

    // 3D perspective
    const perspective = 400;
    const scale = perspective / (perspective + this.z);
    this.size = this.baseSize * scale;
    this.opacity = Math.max(0.05, this.baseOpacity * scale);
  }

  draw(ctx: CanvasRenderingContext2D, isDarkMode: boolean) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotationX);
    
    // Main particle
    ctx.fillStyle = isDarkMode 
      ? `rgba(147, 197, 253, ${this.opacity})` 
      : `rgba(59, 130, 246, ${this.opacity})`;
    
    const size = this.size;
    ctx.fillRect(-size/2, -size/2, size, size);
    
    // Add glow effect
    ctx.shadowColor = isDarkMode ? '#93c5fd' : '#3b82f6';
    ctx.shadowBlur = size * 2;
    ctx.fillRect(-size/2, -size/2, size, size);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Add inner highlight
    ctx.fillStyle = isDarkMode 
      ? `rgba(219, 234, 254, ${this.opacity * 0.8})` 
      : `rgba(30, 64, 175, ${this.opacity * 0.8})`;
    ctx.fillRect(-size/2 + 1, -size/2 + 1, size - 2, size - 2);
    
    ctx.restore();
  }
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort particles by z-index for proper depth rendering
      particlesRef.current.sort((a, b) => b.z - a.z);

      // Draw connections between nearby particles
      ctx.lineWidth = 1;
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1, i + 6).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = 0.15 * (1 - distance / 120);
            ctx.strokeStyle = isDarkMode 
              ? `rgba(147, 197, 253, ${opacity})` 
              : `rgba(59, 130, 246, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, isDarkMode);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: isDarkMode 
          ? '#1f2937'
          : '#ffffff'
      }}
    />
  );
};

export default ParticleBackground;