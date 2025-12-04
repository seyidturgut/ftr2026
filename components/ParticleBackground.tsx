import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate static particles on client side to avoid hydration mismatch
    const particleCount = 30;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100, // %
        bottom: -10, // start below screen
        size: Math.random() * 3 + 1, // 1px to 4px
        duration: Math.random() * 15 + 10, // 10s to 25s
        delay: Math.random() * 10, // 0s to 10s delay
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-sky-200"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            bottom: '-20px',
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px rgba(186, 230, 253, 0.5)`
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity, 0.5);
          }
          90% {
            opacity: var(--opacity, 0.5);
          }
          100% {
            transform: translateY(-120vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleBackground;