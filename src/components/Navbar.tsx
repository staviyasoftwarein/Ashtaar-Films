import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AshtaarLogo = ({ className = "h-8 w-auto" }) => (
  <svg viewBox="600 0 400 820" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="796.38 2.93 606.08 528.69 987.84 528.69 796.38 2.93" fill="#b20710" stroke="#231f20" strokeWidth="2" strokeMiterlimit="10"/>
    <polygon points="634.3 188.34 957.38 188.34 795.84 528.29 634.3 188.34" fill="#424242" stroke="#231f20" strokeWidth="2" strokeMiterlimit="10" />
    <polygon points="604.5 272.73 986.65 272.73 796.38 798.89 604.5 272.73" fill="#fff" stroke="#231f20" strokeWidth="2" strokeMiterlimit="10"/>
    <polygon points="673.07 272.71 917.82 272.71 796.38 530.12 673.07 272.71" fill="#9e9e9e" stroke="#231f20" strokeWidth="2" strokeMiterlimit="10"/>
    <circle cx="795.88" cy="358.97" r="31.51" fill="#b20710" />
  </svg>
);

const navItems: { name: string; id: string; subtitle: string; isRoute?: boolean }[] = [
  { name: 'Our Portfolio', id: 'portfolio', subtitle: 'Our Legacy' },
  { name: 'Behind the Scenes', id: 'bts', subtitle: 'The Process' },
  { name: 'Investment', id: 'investment', subtitle: 'Work With Us' },
  { name: 'Careers', id: 'careers', subtitle: 'Join The Cult' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      // Hide logo after scrolling past 80% of viewport height
      if (window.scrollY > window.innerHeight * 0.8) {
        setIsPastHero(true);
      } else {
        setIsPastHero(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize on mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id: string, isRoute?: boolean) => {
    setIsOpen(false);
    
    if (isRoute) {
      setTimeout(() => navigate(`/${id}`), 600);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 700);
      return;
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -100 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          y: 0 
        }}
        transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center text-white drop-shadow-xl transition-all duration-500 pointer-events-none`}
      >
        <div 
          onClick={() => {
            if (location.pathname !== '/') navigate('/');
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-3 font-serif text-base sm:text-xl md:text-2xl tracking-wider hover:brightness-125 transition-all duration-500 cursor-pointer pointer-events-auto group ${
            isPastHero ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <AshtaarLogo className="h-8 md:h-10 w-auto group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all opacity-80 md:opacity-100" />
          <span className="drop-shadow-md text-[#D4AF37] opacity-90 md:opacity-100">ASHTAAR FILMS</span>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:brightness-125 transition-all drop-shadow-md ml-auto group"
        >
          {!isPastHero && <span className="hidden md:inline font-bold animate-in fade-in slide-in-from-right-2 duration-500">Menu</span>}
          <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors backdrop-blur-sm bg-black/20">
            <Menu size={18} />
          </div>
        </button>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            exit={{ opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] bg-[#030303] text-white flex flex-col overflow-hidden"
          >
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="absolute inset-0 bg-[url('/bts3.jpeg')] bg-cover bg-center mix-blend-screen grayscale"></div>
               <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-[#050505]"></div>
               <div className="absolute top-1/4 right-1/4 w-[40vw] h-[40vh] bg-[#D4AF37]/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 px-6 py-6 md:px-12 flex justify-between items-center">
              <div 
                onClick={() => {
                  setIsOpen(false);
                  if (location.pathname !== '/') navigate('/');
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-3 font-serif text-xl md:text-2xl tracking-wider text-[#D4AF37] cursor-pointer hover:brightness-125 transition-all"
              >
                <AshtaarLogo className="h-8 md:h-10 w-auto" />
                <span>ASHTAAR FILMS</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:brightness-125 transition-all group cursor-pointer"
              >
                <span className="hidden md:inline font-bold">Close</span>
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors backdrop-blur-sm">
                  <X size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </div>
              </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-start md:justify-center w-full max-w-5xl mx-auto px-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-2 md:gap-4 w-full my-auto py-8 lg:py-0">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => scrollTo(item.id, item.isRoute)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="group relative w-full flex flex-col md:flex-row md:items-center justify-between text-left py-3 md:py-4 border-b border-white/5 hover:border-white/20 transition-colors shrink-0"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-8 transition-transform duration-500 group-hover:translate-x-4">
                      <span className="font-mono text-[10px] md:text-xs text-[#D4AF37] tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                        0{i + 1}
                      </span>
                      <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-white/50 group-hover:text-white group-hover:italic transition-all duration-500">
                        {item.name}
                      </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-20px] group-hover:translate-x-0">
                      <span className="font-sans text-xs tracking-[0.2em] uppercase text-white/30">{item.subtitle}</span>
                      <div className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center bg-[#D4AF37] text-black">
                        <ArrowRight size={18} className="-rotate-45" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="relative z-10 px-6 py-8 md:px-12 flex flex-col xl:flex-row justify-between items-center text-[10px] md:text-xs text-white/30 font-mono uppercase tracking-[0.2em] border-t border-white/5 mt-auto gap-8 xl:gap-0">
               <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
                 <a href="mailto:contact@ashtaarfilms.com" className="hover:text-[#D4AF37] transition-colors">contact@ashtaarfilms.com</a>
               </div>
               
               <div className="flex items-center gap-8 text-white/50">
                 <a href="https://www.instagram.com/ashtaarfilms/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors"><Instagram size={18} /></a>
                 <a href="https://www.youtube.com/@Ashtaarproduction" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors"><Youtube size={18} /></a>
                 <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors"><Twitter size={18} /></a>
                 <a href="https://www.linkedin.com/company/ashtaar-films" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors"><Linkedin size={18} /></a>
               </div>
               
               <p className="text-center xl:text-right">© {new Date().getFullYear()} Ashtaar Films</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
