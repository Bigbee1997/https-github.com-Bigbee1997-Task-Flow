import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200, // burst range
        y: (Math.random() - 0.5) * 200 - 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.1,
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-center items-center z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.2, 0.8, 0],
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0.5, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
