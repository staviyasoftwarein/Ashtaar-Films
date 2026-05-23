import { useRef } from 'react';
import { motion } from 'motion/react';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  const text = "the story of ASHTAAR begins with vision. we believe creators who've proven their artistry deserve better: better production, better storytelling, better cinema. this is the status quo we're building. make it to the screen, and experience the ascension yourself.";

  return (
    <div id="about" ref={containerRef} className="h-screen bg-transparent text-white flex items-center justify-center px-6 md:px-24 relative z-20 overflow-hidden">
      
      {/* Rich Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden bg-black/80 backdrop-blur-md">
        
        {/* Breathing Base Glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#b20710] rounded-full blur-[150px] mix-blend-screen opacity-50"></div>
        </motion.div>

        {/* Glow Layer (Blurred Solid Logo) */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute flex items-center justify-center select-none mix-blend-screen blur-[20px] md:blur-[30px]"
        >
          <svg viewBox="600 0 400 820" className="h-[60vh] md:h-[80vh] w-auto">
            <polygon points="796.38 2.93 606.08 528.69 987.84 528.69 796.38 2.93" fill="#80050b" />
            <polygon points="634.3 188.34 957.38 188.34 795.84 528.29 634.3 188.34" fill="#80050b" />
            <polygon points="604.5 272.73 986.65 272.73 796.38 798.89 604.5 272.73" fill="#a0a0a0" />
            <polygon points="673.07 272.71 917.82 272.71 796.38 530.12 673.07 272.71" fill="#a0a0a0" />
            <circle cx="795.88" cy="358.97" r="31.51" fill="#a0a0a0" />
          </svg>
        </motion.div>

        {/* Sharp Structure Layer */}
        <div className="absolute flex items-center justify-center select-none opacity-[0.35] mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          <svg viewBox="600 0 400 820" className="h-[60vh] md:h-[80vh] w-auto">
            <polygon points="796.38 2.93 606.08 528.69 987.84 528.69 796.38 2.93" fill="none" stroke="#b20710" strokeWidth="4" strokeMiterlimit="10"/>
            <polygon points="634.3 188.34 957.38 188.34 795.84 528.29 634.3 188.34" fill="none" stroke="#ffffff" strokeWidth="4" strokeMiterlimit="10" />
            <polygon points="604.5 272.73 986.65 272.73 796.38 798.89 604.5 272.73" fill="none" stroke="#ffffff" strokeWidth="6" strokeMiterlimit="10"/>
            <polygon points="673.07 272.71 917.82 272.71 796.38 530.12 673.07 272.71" fill="none" stroke="#b20710" strokeWidth="4" strokeMiterlimit="10"/>
            <circle cx="795.88" cy="358.97" r="31.51" fill="none" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
        
        {/* Subtle Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/50"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] mix-blend-overlay" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-screen" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10 py-12 md:py-32">
        <h3 className="text-[#D4AF37] uppercase tracking-[0.2em] text-xs md:text-sm mb-8 md:mb-12 font-sans font-bold flex items-center gap-4">
          <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
          THE GENESIS OF GREAT CINEMA.
        </h3>
        <p className="font-serif text-3xl md:text-5xl lg:text-[3.5rem] leading-[1.3] tracking-tight">
          {text}
        </p>
      </div>
    </div>
  );
}
