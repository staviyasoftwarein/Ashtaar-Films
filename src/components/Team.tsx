import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const team = [
  { name: "Chinmay Naik", role: "Director", img: "/Director.jpeg" },
  { name: "Viraj Dave", role: "Producer", img: "/Producer.jpeg" },
];

export default function Team() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

  return (
    <div id="team" ref={containerRef} className="md:min-h-screen py-16 md:py-32 px-6 md:px-12 flex flex-col justify-center relative z-20 overflow-hidden bg-transparent">
      {/* Rich Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/bts4.jpeg')] bg-cover bg-center opacity-10 mix-blend-screen grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vh] bg-[#D4AF37]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full perspective-[1200px]">
        <motion.div 
          style={{
            rotateX,
            scale,
            y,
            opacity,
            transformStyle: "preserve-3d"
          }}
          className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-16 shadow-2xl relative z-10"
        >
          <div className="text-center mb-16">
            <h3 className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-sans font-bold">The Visionaries</h3>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white">Faces Behind The Lens</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div
                key={i}
                className="group relative cursor-pointer bg-white p-4 pb-8 shadow-2xl transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)]"
                style={{
                  transform: `rotate(${i === 0 ? -2 : 2}deg)`
                }}
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-200 mb-6 relative">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale-0 group-hover:grayscale-[60%] transition-all duration-700 scale-100 group-hover:scale-105" />
                  {/* Subtle inner shadow for depth */}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                </div>
                <div className="text-center">
                  <h4 className="font-serif text-2xl md:text-3xl mb-2 text-black">{member.name}</h4>
                  <p className="text-gray-500 tracking-widest uppercase text-xs font-extrabold font-sans">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
