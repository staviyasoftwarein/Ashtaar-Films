import { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useAsset } from '../hooks/useAsset';
import { useSetting } from '../hooks/useSetting';
import { DEFAULT_HERO_FONT, fontFamilyCss } from '../lib/fonts';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { value: font } = useSetting('hero.font', DEFAULT_HERO_FONT);
  const { url: videoUrl } = useAsset('preloader', '/preloader.mp4');

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Browsers often block autoplay if not muted, but here it is muted.
      // We wrap it in a promise check to avoid "interrupted by pause" errors.
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.log("Autoplay prevented:", e);
          }
        });
      }
    }
    
    const ctx = gsap.context(() => {
      // Use fromTo to strictly enforce the scale values and prevent state corruption
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 1,
          pin: true,
          start: "top top",
          end: "+=1500" // Slightly longer scroll for smoother zoom
        }
      });
      
      tl.to(textRef.current, {
        scale: 300,
        force3D: false, // CRITICAL: Prevents the browser from crashing due to massive GPU texture limits
        ease: "none",
      }, 0);

      const scrollIndicator = containerRef.current?.querySelector('.scroll-indicator');
      if (scrollIndicator) {
        tl.to(scrollIndicator, {
          opacity: 0,
          ease: "none",
          duration: 0.1 // Fade out quickly at the start of scroll
        }, 0);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    // Moved overflow-hidden to the parent container to prevent page stretch
    <div id="hero" ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      <video 
        key={videoUrl ?? '/preloader.mp4'}
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        // Changed to absolute so it stays inside the Hero section and doesn't break other sections
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl ?? '/preloader.mp4'} type="video/mp4" />
      </video>
      
      {/* Removed overflow-hidden from here to fix the Safari/WebKit clipping bug */}
      <div className="absolute inset-0 w-full h-full bg-white flex flex-col justify-center items-center mix-blend-screen z-10">
        <h2 
          ref={textRef}
          className="text-[18vw] sm:text-[80px] md:text-[120px] font-hero text-black m-0 p-0 origin-center whitespace-nowrap"
          style={{
            fontFamily: fontFamilyCss(font),
            fontWeight: font.weight,
            fontStyle: font.style,
            letterSpacing: font.letterSpacing,
            textTransform: font.textTransform ?? 'uppercase',
          }}
        >
          ASHTAAR
        </h2>
      </div>

      <div className="scroll-indicator absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 pointer-events-none">
        <span className="text-black text-[11px] md:text-sm tracking-[0.2em] font-serif uppercase font-semibold text-center">
          Scroll to explore
        </span>
        <div className="w-[22px] h-[36px] md:w-[26px] md:h-[42px] border-[1.5px] border-black rounded-full flex justify-center items-start pt-[6px]">
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[3px] h-[6px] md:w-1 md:h-[8px] bg-black rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
