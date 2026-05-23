import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function AmbientBackground() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Avoid rendering until we have the window size to prevent hydration mismatch or weird initial states
  if (windowSize.width === 0) return null;

  const particles = Array.from({ length: 15 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Slow-moving gradient orbs */}
      <motion.div 
        animate={{ 
          x: [0, windowSize.width * 0.1, -windowSize.width * 0.1, 0],
          y: [0, windowSize.height * 0.1, -windowSize.height * 0.1, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-[#D4AF37] rounded-full blur-[150px] mix-blend-screen opacity-10"
      />
      <motion.div 
        animate={{ 
          x: [0, -windowSize.width * 0.1, windowSize.width * 0.1, 0],
          y: [0, -windowSize.height * 0.1, windowSize.height * 0.1, 0],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[1000px] max-h-[1000px] bg-[#8B0000] rounded-full blur-[150px] mix-blend-screen opacity-10"
      />

      {/* Floating ambient particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
            opacity: Math.random() * 0.3 + 0.1,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            x: [null, (Math.random() - 0.5) * 100],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
          className="absolute w-1 h-1 bg-[#D4AF37] rounded-full blur-[1px]"
        />
      ))}
      
      {/* Noise filter for raw cinematic texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
}
