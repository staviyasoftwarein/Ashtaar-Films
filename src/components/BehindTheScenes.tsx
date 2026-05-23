import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const images = [
  '/bts1.webp',
  '/bts2.webp',
  '/bts3.webp',
  '/bts4.webp',
  '/bts5.webp',
  '/bts6.webp',
  '/bts7.webp',
  '/bts8.webp',
];

const positions = [
  { x: -0.8, y: -0.6},
  { x: 0.7, y: 0.4 },
  { x: -0.5, y: 0.7 },
  { x: 0.6, y: -0.5 },
  { x: -0.8, y: 0.2 },
  { x: 0.8, y: -0.3 },
  { x: -0.6, y: -0.8 },
  { x: 0.4, y: 0.6 },
  { x: -0.7, y: 0.5 },
  { x: 0.5, y: -0.7 },
  { x: -0.4, y: -0.4 },
  { x: 0.3, y: 0.8 },
  { x: -0.8, y: 0.3 },
  { x: 0.6, y: 0.2 },
  { x: -0.2, y: -0.7 },
  { x: 0.7, y: -0.6 },
  { x: -0.5, y: 0.4 },
  { x: 0.4, y: -0.4 },
  { x: -0.6, y: 0.6 },
  { x: 0.8, y: 0.5 },
  { x: -0.3, y: -0.5 },
  { x: 0.5, y: 0.3 },
  { x: -0.7, y: -0.2 },
  { x: 0.2, y: 0.7 },
  { x: -0.4, y: 0.8 },
  { x: 0.6, y: -0.8 },
  { x: -0.8, y: 0.1 },
  { x: 0, y: 0 }
];

export default function BehindTheScenes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedGalleryIndex !== null && galleryScrollRef.current) {
      document.body.style.overflow = 'hidden';
      // Automatically scroll to the selected image when gallery opens
      const child = galleryScrollRef.current.children[selectedGalleryIndex] as HTMLElement;
      if (child) {
        galleryScrollRef.current.scrollTo({ left: child.offsetLeft, behavior: 'instant' });
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedGalleryIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const flow = containerRef.current;
      const imgs = imagesRef.current.filter(Boolean);

      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 800;
      const spread = isMobile ? 1.4 : 1.2;

      // Set initial state
      imgs.forEach((img) => {
        gsap.set(img, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          z: -1500,
          scale: 0,
          autoAlpha: 0,
          pointerEvents: 'none',
          force3D: true,
          willChange: 'transform, opacity'
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: flow,
          start: "top top",
          end: `+=${screenHeight * 4}px`,
          pin: true,
          scrub: 1.8,
        }
      });

      imgs.forEach((img, index) => {
        const pos = positions[index % positions.length];
        const isLast = index === imgs.length - 1;
        
        let targetX = pos.x * screenWidth * spread;
        let targetY = pos.y * screenHeight * spread;
        let targetZ = 2200; 
        let targetScale = 1.2;

        if (isLast) {
          targetX = 0;
          targetY = 0;
          targetZ = 1200; 
          targetScale = 1.1;
        }

        // Main transform animation
        tl.to(img, {
          x: targetX,
          y: targetY,
          z: targetZ,
          scale: targetScale,
          ease: "power2.inOut", 
          duration: 1,
          onUpdate: function() {
            const currentZ = gsap.getProperty(img, "z") as number;
            (img as any)._currentZ = currentZ;
            
            // Make clickable once it comes 30-40% into the screen (z > -500 roughly)
            if (currentZ > -600) {
              (img as HTMLElement).style.pointerEvents = 'auto';
            } else {
              (img as HTMLElement).style.pointerEvents = 'none';
            }
          }
        }, index * 0.08);

        // Fade in much faster at the start so they appear from the exact center
        tl.to(img, {
          autoAlpha: 1,
          duration: 0.2,
          ease: "power1.inOut"
        }, index * 0.08);
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="bts" ref={containerRef} className="h-screen bg-black relative overflow-hidden z-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/bts1.webp')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#000_100%)]"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center w-full pointer-events-none">
        <h3 className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm mb-4 font-sans drop-shadow-md">Behind The Scenes</h3>
        <p className="font-serif text-white text-4xl md:text-6xl lg:text-7xl leading-tight opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          Vision beyond the lens.
        </p>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full" style={{ transformStyle: 'preserve-3d', perspective: '2000px' }}>
        {images.map((src, i) => (
          <div
            key={i}
            ref={el => { imagesRef.current[i] = el; }}
            onClick={() => {
              const z = (imagesRef.current[i] as any)?._currentZ || -1500;
              // Only allow clicking if the image has moved forward enough (30-40% into screen feel)
              if (z > -600) {
                setSelectedGalleryIndex(i);
              }
            }}
            className={`absolute top-1/2 left-1/2 w-[90vw] h-[60vw] md:w-[75vw] md:h-[42vw] max-w-[1400px] max-h-[800px] cursor-pointer group ${i === images.length - 1 ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/30' : ''}`}
          >
            <img 
              src={src} 
              alt="BTS" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:brightness-125 transition-[filter] duration-300"
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Horizontal Lightbox Gallery */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedGalleryIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overscroll-none"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              <button 
                onClick={() => setSelectedGalleryIndex(null)}
                className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-[#D4AF37] transition-colors p-4 rounded-full z-[110] bg-white/5 hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase font-mono z-[110]">
                Scroll to explore
              </div>

              <div 
                ref={galleryScrollRef}
                className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar overscroll-x-contain"
                data-lenis-prevent="true"
              >
                {images.map((src, i) => (
                  <div 
                    key={`gallery-${i}`} 
                    className="min-w-full h-full snap-center flex items-center justify-center py-28 px-4 md:p-12 lg:p-24 shrink-0"
                  >
                    <motion.img
                      initial={{ scale: 0.95, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      src={src} 
                      loading="lazy"
                      decoding="async"
                      className="max-w-[90vw] max-h-[75vh] md:max-w-full md:max-h-full object-contain pointer-events-none drop-shadow-2xl"
                    />
                  </div>
                ))}
              </div>
              
              <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
