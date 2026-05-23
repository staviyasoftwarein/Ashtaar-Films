import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

const tiers = [
  { 
    num: "01",
    title: "ASSOCIATE PRODUCER", 
    price: "₹10 Lakh+", 
    subtitle: "Your first step into cinema ownership.",
    benefits: [
      "Screen credit as Associate Producer", 
      "Net profit revenue share", 
      "Ashtaar Films investor community access",
      "Production updates and previews"
    ],
    btnText: "BUILD TOMORROW, TODAY!",
    isDark: false
  },
  { 
    num: "02",
    title: "CO-PRODUCER", 
    price: "₹50 Lakh+", 
    subtitle: "The filmmaker's chair. Your name. Your legacy.",
    benefits: [
      "Screen credit as Co-Producer", 
      "Multi-window revenue share (theatrical + OTT + satellite)", 
      "On-set access during principal photography", 
      "Brand integration opportunities",
      "Priority access on future projects"
    ],
    btnText: "BUILD TOMORROW, TODAY!",
    isDark: true,
    badge: "MOST POPULAR"
  },
  { 
    num: "03",
    title: "EXECUTIVE PRODUCER", 
    price: "₹1.5 Crore+", 
    subtitle: "Own the story. Define the future.",
    benefits: [
      "Screen credit as Executive Producer", 
      "Primary revenue share across all windows", 
      "IP co-ownership rights", 
      "First right of refusal on sequels", 
      "Dedicated relationship manager",
      "On-set access + brand integration",
      "Exclusive premiere invitations"
    ],
    btnText: "BUILD TOMORROW, TODAY!",
    isDark: false
  },
];

export default function Investment() {
  const [showTiers, setShowTiers] = useState(false);

  return (
    <section id="investment" className="relative w-full bg-[#fcfbf9] min-h-[100dvh]">
      {/* Premium Texture & Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-multiply"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-[#D4AF37]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[100dvh] relative z-10 text-black">
        
        {/* Left Side: Sticky Hero */}
        <div className="lg:w-1/2 relative lg:sticky lg:top-0 h-[70vh] lg:h-[100dvh] flex flex-col justify-center p-8 md:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-black/10">
          <div className="relative z-10 max-w-xl">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
               className="flex items-center gap-3 mb-6 md:mb-8"
            >
               <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
               <h2 className="text-[10px] md:text-xs text-black/50 font-sans tracking-[0.4em] uppercase font-bold">Investment</h2>
            </motion.div>
            
            <motion.h1 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
               className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium uppercase tracking-tight leading-[1] mb-8"
            >
              Don't watch the future,<br />
              <span className="text-[#D4AF37] italic font-serif normal-case block mt-2">Shape it!</span>
            </motion.h1>

            <motion.blockquote 
               initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
               className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-md border-l border-black/10 pl-4 italic"
            >
              "Three investment tiers. One shared vision. Join us and take an active stake in creating the stories of tomorrow."
            </motion.blockquote>
          </div>
        </div>

        {/* Right Side: Scrollable Area */}
        <div className="lg:w-1/2 flex flex-col justify-center p-6 md:p-16 py-12 lg:py-32 z-20 md:min-h-screen h-auto relative">
          {!showTiers ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-8"
            >
              <h3 className="text-3xl md:text-5xl font-serif text-black tracking-tight">
                Your legacy begins behind the camera.
              </h3>
              <button 
                onClick={() => setShowTiers(true)}
                className="group relative px-8 py-5 bg-[#D4AF37] text-white tracking-widest uppercase font-bold text-xs rounded-full overflow-hidden transition-all hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Ready to build tomorrow, today?
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-180" />
                </span>
                <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
              className="flex flex-col w-full max-w-2xl mx-auto space-y-8 relative"
            >
               <div className="mb-4 lg:mb-8 flex justify-between items-center px-2">
                  <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-gray-400 uppercase">Investment Tiers [{tiers.length}]</span>
                  <button 
                    onClick={() => setShowTiers(false)}
                    className="font-mono text-[10px] tracking-[0.2em] text-gray-400 hover:text-[#D4AF37] uppercase transition-colors flex items-center gap-2"
                  >
                    Hide Tiers
                  </button>
               </div>

              {tiers.map((tier, i) => (
                <div 
                  key={i} 
                  className={`rounded-2xl p-6 md:p-10 flex flex-col relative overflow-hidden shadow-xl transition-transform duration-500 hover:-translate-y-2 ${tier.isDark ? 'bg-[#0a0a0a] text-white z-10 scale-[1.02]' : 'bg-white text-black border border-black/5'}`}
                >
                  {tier.badge && (
                    <div className="absolute top-0 right-8 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-b-lg">
                      {tier.badge}
                    </div>
                  )}
                  
                  <div className={`text-xs font-sans mb-4 ${tier.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tier.num}</div>
                  <h4 className="font-sans text-sm tracking-[0.2em] uppercase font-bold mb-6">{tier.title}</h4>
                  <div className="font-serif text-3xl md:text-4xl mb-4">
                    {tier.price}
                  </div>
                  <p className={`font-sans italic font-light text-sm mb-8 ${tier.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tier.subtitle}</p>
                  
                  <div className={`w-full h-px mb-8 ${tier.isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>
                  
                  <ul className="space-y-4 mb-10 flex-grow">
                    {tier.benefits.map((b, j) => (
                      <li key={j} className={`text-sm flex items-start gap-3 font-sans ${tier.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="text-[#D4AF37] mt-0.5 text-xs">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                  
                  <a 
                    href={`mailto:staviyasoftware.in@gmail.com?subject=Investment Inquiry&body=hey i want to inquire about ${encodeURIComponent(tier.title)}`}
                    className={`flex justify-center items-center gap-2 w-full py-4 rounded-lg uppercase tracking-widest text-xs font-bold transition-all duration-300 text-center ${tier.isDark ? 'bg-[#D4AF37] text-black hover:bg-white' : 'bg-transparent border border-black/20 text-black hover:bg-black hover:text-white'}`}
                  >
                    BUILD TOMORROW, TODAY!
                  </a>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

