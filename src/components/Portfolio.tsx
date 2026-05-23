import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Youtube, BarChart2, Sparkles, ArrowUpRight, Cpu, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

/* ======================================================================
   REUSABLE UI COMPONENTS
   ====================================================================== */

const TextContainerAmbient = ({ watermark, glowColor }: { watermark: string, glowColor: string }) => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
    {/* Soft Technical Architectural Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
    
    {/* Slow moving ambient cinematic orbs */}
    <motion.div 
      animate={{ x: [-20, 20, -20], y: [-20, 20, -20], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute -left-20 -top-20 w-[60vh] h-[60vh] rounded-full blur-[120px] ${glowColor} mix-blend-screen`}
    />
    <motion.div 
      animate={{ x: [20, -20, 20], y: [20, -20, 20], opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className={`absolute -right-32 bottom-0 w-[50vh] h-[50vh] rounded-full blur-[100px] ${glowColor} mix-blend-screen`}
    />

    {/* Digital Film Grain Noise */}
    <div className="absolute inset-0 opacity-[0.06] mix-blend-difference" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')" }}></div>

    {/* Massive Editorial Watermark */}
    <div className="absolute -left-8 -bottom-16 md:-left-16 md:-bottom-24 text-[12rem] md:text-[22rem] font-black text-white/[0.02] tracking-tighter leading-none pointer-events-none">
      {watermark}
    </div>
  </div>
);

const SectionTitle = ({ num, text }: { num: string, text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="mb-4 md:mb-6 shrink-0 flex flex-col"
  >
    <div className="font-serif italic text-2xl md:text-4xl lg:text-5xl text-[#D4AF37] mb-1 md:mb-2 leading-none">{num}</div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl uppercase">
      {text}
    </h2>
  </motion.div>
);

const SectionSubhead = ({ text }: { text: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5 }}
    className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 shrink-0"
  >
    <div className="w-6 md:w-10 h-[2px] bg-white/30"></div>
    <h3 className="font-mono text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase text-white/70 font-bold whitespace-pre-line leading-snug">{text}</h3>
  </motion.div>
);

const SectionDesc = ({ children }: { children: React.ReactNode }) => (
  <motion.p 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ delay: 0.2, duration: 0.6 }}
    className="text-white/50 text-xs md:text-base lg:text-lg max-w-md font-light leading-relaxed mb-6 md:mb-10 shrink-0"
  >
    {children}
  </motion.p>
);

/* ======================================================================
   SLIDE 1: DUSSEHRA (FEATURE FILM)
   ====================================================================== */
function Slide1_FeatureFilm() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-screen h-[100dvh] shrink-0 flex flex-col md:flex-row bg-[#080808]">
      {/* Left Intro */}
      <div className="relative w-full md:w-[45%] lg:w-[40%] h-1/2 md:h-full flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 overflow-hidden shrink-0 bg-[#080808]">
         <TextContainerAmbient watermark="01" glowColor="bg-[#b20710]" />
         
         <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 py-6 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar">
           <SectionTitle num="01" text="Theatrical Release" />
            <SectionSubhead text="DUSSEHRA" />
            <SectionDesc>
              An epic cinematic journey captured flawlessly. A visual masterpiece that redefines storytelling for the modern era. Experience the intensity and grandeur of our latest theatrical release.
            </SectionDesc>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="shrink-0 flex items-center gap-8"
            >
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 uppercase font-mono text-xs tracking-widest font-bold text-white hover:text-[#D4AF37] transition-colors bg-transparent border-none outline-none"
              >
                <Play className="w-5 h-5 fill-current" />
                {isPlaying ? "Close Video" : "Watch Video"}
              </button>
            </motion.div>
         </div>
      </div>

      {/* Right Media */}
      <div className="w-full md:w-[55%] lg:w-[60%] h-1/2 md:h-full relative overflow-hidden bg-[#111] flex items-center justify-center p-4 md:p-12 lg:p-24">
         {/* Subtle overlay ambient underneath the video */}
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#080808]/80 via-transparent to-transparent pointer-events-none" />
         
         {/* Dynamic Video / Poster Box */}
         <div className="w-full max-w-4xl aspect-video relative z-10 rounded-xl md:rounded-[1rem] lg:rounded-[2rem] overflow-hidden bg-black shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group/player">
           {isPlaying ? (
              <iframe 
                src="https://www.youtube.com/embed/oJ2SpQQdzJE?autoplay=1&mute=0&controls=1&rel=0" 
                title="DUSSEHRA Trailer"
                className="w-full h-full border-0 absolute inset-0 text-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
           ) : (
              <>
                 <img 
                   src="https://img.youtube.com/vi/oJ2SpQQdzJE/maxresdefault.jpg" 
                   alt="Dussehra"
                   className="w-full h-full object-cover opacity-80 group-hover/player:scale-105 transition-transform duration-[2s] ease-out" 
                 />
                 <div 
                   className="absolute inset-0 bg-black/20 group-hover/player:bg-black/10 transition-colors duration-500 flex items-center justify-center cursor-pointer"
                   onClick={() => setIsPlaying(true)}
                 >
                   <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center group-hover/player:bg-white group-hover/player:text-black transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover/player:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                     <Play className="w-6 h-6 md:w-10 md:h-10 ml-1 text-white group-hover/player:text-[#b20710] fill-current opacity-90 transition-colors" />
                   </div>
                 </div>
              </>
           )}
         </div>
      </div>
    </div>
  );
}

/* ======================================================================
   SLIDE 2: VFX & ANIME 
   ====================================================================== */
const vfxData = [
  { id: 'vfx', tag: 'VFX Production', title: 'DEFYING\nREALITY', desc: 'Industry-leading composite structures and CGI pipelines. We manipulate reality at the pixel level to build environments that defy physics.', img: '/bts5.jpeg', videoId: 'TB5TRy8MO48' },
  { id: 'anime', tag: 'Anime 2D/3D', title: 'BOUNDLESS\nWORLDS', desc: 'Striking cel-shaded aesthetics blending traditional art with next-gen rigging. Bringing vibrant, culturally rich stories to life.', img: '/bts6.jpeg' }
];

function Slide2_VFXAnime() {
  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-screen h-[100dvh] shrink-0 flex flex-col md:flex-row bg-[#080808]">
      {/* Left Intro */}
      <div className="relative w-full md:w-[45%] lg:w-[40%] h-1/2 md:h-full flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 overflow-hidden shrink-0 bg-[#080808]">
         <TextContainerAmbient watermark="02" glowColor="bg-white" />
         
         <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 py-4 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar">
          <SectionTitle num="02" text="Visual Effects" />
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-10 shrink-0"
          >
            {vfxData.map((d, i) => (
              <button 
                key={d.id} onClick={() => { setActive(i); setIsPlaying(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs tracking-[0.2em] font-mono uppercase transition-all duration-300 border ${active === i ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-[#D4AF37]/5 text-[#D4AF37]/70 border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
              >
                {active === i && <Sparkles className="w-3 h-3" />}
                {d.tag}
              </button>
            ))}
          </motion.div>

          <div className="min-h-[140px] md:min-h-[220px] shrink-0 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <SectionSubhead text={vfxData[active].title} />
                <p className="text-white/50 text-xs md:text-base lg:text-lg max-w-md font-light leading-relaxed mb-6 md:mb-8">
                  {vfxData[active].desc}
                </p>
                
                {vfxData[active].videoId ? (
                  <div className="shrink-0 flex flex-wrap items-center gap-8">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-2 uppercase font-mono text-xs tracking-widest font-bold text-white hover:text-[#D4AF37] transition-colors bg-transparent border-none outline-none"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      {isPlaying ? "Close Video" : "Watch Video"}
                    </button>
                    <button 
                      className="flex items-center gap-2 uppercase font-mono text-xs tracking-widest font-bold text-white hover:text-[#D4AF37] transition-colors bg-transparent border-none outline-none"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      VFX Showcase
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
         </div>
      </div>

      {/* Right Media */}
      <div className="w-full md:w-[55%] lg:w-[60%] h-1/2 md:h-full relative overflow-hidden bg-[#111] flex items-center justify-center p-4 md:p-12 lg:p-24">
         {/* Subtle overlay ambient underneath the media */}
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#080808]/80 via-transparent to-transparent pointer-events-none" />
         
         <AnimatePresence mode="wait">
           <motion.div
             key={active}
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6 }}
             className="w-full max-w-4xl aspect-video relative z-10 rounded-xl md:rounded-[1rem] lg:rounded-[2rem] overflow-hidden bg-black shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group/player"
           >
             {vfxData[active].videoId ? (
               isPlaying ? (
                 <iframe 
                   src={`https://www.youtube.com/embed/${vfxData[active].videoId}?autoplay=1&mute=0&controls=1&rel=0`}
                   className="w-full h-full border-0 absolute inset-0 text-white"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : (
                 <>
                   <img 
                     src={`https://img.youtube.com/vi/${vfxData[active].videoId}/maxresdefault.jpg`}
                     alt={vfxData[active].title}
                     className="w-full h-full object-cover opacity-80 group-hover/player:scale-105 transition-transform duration-[2s] ease-out" 
                   />
                   <div 
                     className="absolute inset-0 bg-black/20 group-hover/player:bg-black/10 transition-colors duration-500 flex items-center justify-center cursor-pointer"
                     onClick={() => setIsPlaying(true)}
                   >
                     <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center group-hover/player:bg-white group-hover/player:text-black transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover/player:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                       <Play className="w-6 h-6 md:w-10 md:h-10 ml-1 text-white fill-current opacity-90 transition-colors" />
                     </div>
                   </div>
                 </>
               )
             ) : (
               <img 
                 src={vfxData[active].img}
                 alt={vfxData[active].title}
                 className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[2s] ease-out" 
               />
             )}
           </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}

/* ======================================================================
   SLIDE 3: YT MUSIC 
   ====================================================================== */
const ytTracks = [
  { id: 'TB5TRy8MO48', title: 'Cinematic Score', artist: 'Ashtaar Music Production', time: '-', startMs: 45 },
  { id: '3NEVXvl9its', title: 'Ashtaar Live Mix', artist: 'Ashtaar Music Production', time: '-', startMs: 30 },
  { id: 'USD0lx8BTK8', title: 'Epic Trailer Music', artist: 'Ashtaar Music Production', time: '-', startMs: 40 },
  { id: 'uJCY9donaQs', title: 'New Year Party 2026', artist: 'Ashtaar Music Production', time: '-', startMs: 0 }
];

const Equalizer = () => (
  <div className="flex items-end gap-[2px] h-3">
    <motion.div animate={{ height: ["20%", "100%", "40%"] }} transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }} className="w-0.5 md:w-1 bg-[#FF0000] rounded-sm" />
    <motion.div animate={{ height: ["60%", "30%", "100%"] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} className="w-0.5 md:w-1 bg-[#FF0000] rounded-sm" />
    <motion.div animate={{ height: ["100%", "50%", "80%"] }} transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }} className="w-0.5 md:w-1 bg-[#FF0000] rounded-sm" />
  </div>
);

function Slide3_Music() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [player, setPlayer] = useState<any>(null);
  const track = ytTracks[activeIdx];
  const thumb = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.1 });

  // Auto pause when out of view
  useEffect(() => {
    if (!isInView && isPlaying) {
      setIsPlaying(false);
      if (player && player.pauseVideo) player.pauseVideo();
    }
  }, [isInView, isPlaying, player]);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.hasOwnProperty('YT')) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      createPlayer(ytTracks[activeIdx].id, ytTracks[activeIdx].startMs);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer(ytTracks[activeIdx].id, ytTracks[activeIdx].startMs);
    }

    return () => {
      if (player) player.destroy();
    };
  }, []);

  const createPlayer = (videoId: string, startMs: number) => {
    if ((window as any).YT && (window as any).YT.Player) {
       // clear previous if exists
      if (player) player.destroy();
      
      const newPlayer = new (window as any).YT.Player('yt-player-instance', {
        height: '300',
        width: '300',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          start: startMs,
          modestbranding: 1
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            else event.target.unMute();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === (window as any).YT.PlayerState.PAUSED) setIsPlaying(false);
          }
        }
      });
      setPlayer(newPlayer);
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (player && player.playVideo) player.playVideo();
    } else {
      setIsPlaying(false);
      if (player && player.pauseVideo) player.pauseVideo();
    }
  };

  // Sync Video ID
  useEffect(() => {
    if (player && player.loadVideoById) {
      player.loadVideoById({ videoId: track.id, startSeconds: track.startMs });
      if (isPlaying) player.playVideo();
      else player.pauseVideo();
    }
  }, [activeIdx]);

  // Sync Mute state
  useEffect(() => {
    if (player && player.mute) {
      if (isMuted) player.mute();
      else player.unMute();
    }
  }, [isMuted, player]);

  // Sync Volume
  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(volume);
    }
  }, [volume, player]);

  return (
    <div ref={containerRef} className="w-screen h-[100dvh] shrink-0 flex flex-col md:flex-row bg-[#080808]">
      {/* Hidden ReactPlayer instance replaced by Iframe API for better audio pass-through */}
      <div className="absolute -left-[9999px] -top-[9999px] w-[300px] h-[300px] overflow-hidden pointer-events-none z-[-1]">
         <div id="yt-player-instance"></div>
      </div>

      {/* Left Intro */}
      <div className="relative w-full md:w-[45%] lg:w-[40%] h-1/2 md:h-full flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 shrink-0 overflow-hidden bg-[#0a0a0a]">
         <TextContainerAmbient watermark="03" glowColor="bg-[#FF0000]/20" />
         
         <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 py-6 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar">
           <SectionTitle num="03" text="Music Production" />
           
            <div className="flex flex-col items-start gap-2 md:gap-6 mb-4 mt-2 shrink-0 w-full max-w-sm md:max-w-md">
              <motion.button 
                onClick={handlePlayPause}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-64 md:h-64 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[3px] md:border-[6px] border-[#050505] overflow-hidden shrink-0 relative cursor-pointer group outline-none"
                animate={{ rotate: isPlaying ? 360 : 0 }} 
                transition={{ duration: 15, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              >
                 <img src={thumb} className="w-full h-full object-cover scale-125" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    {!isPlaying ? <div className="w-8 h-8 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"><Play className="w-3 h-3 md:w-6 md:h-6 text-white ml-0.5 md:ml-1 fill-current" /></div> : <div className="w-8 h-8 md:w-16 md:h-16 bg-black/30 backdrop-blur-sm border border-transparent hover:border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><div className="w-3 h-3 md:w-5 md:h-5 border-l-2 md:border-l-[3px] border-r-2 md:border-r-[3px] border-white gap-1 md:gap-1.5 flex h-4 md:h-5"></div></div>}
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-[#080808] rounded-full border border-white/20 z-10 flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full"></div>
                 </div>
              </motion.button>
              <div className="min-w-0 text-left w-full mt-2 md:mt-0">
                <h4 className="text-white font-bold text-xl md:text-2xl mb-1 truncate">{track.title}</h4>
                <p className="text-[#FF0000] font-mono text-[10px] md:text-xs uppercase tracking-widest truncate">{track.artist}</p>
              </div>
           </div>

           <div className="flex flex-col gap-3 md:gap-4 shrink-0 items-start w-full max-w-sm">
              <div className="flex items-center justify-start gap-2 sm:gap-3 w-full">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.open('https://www.youtube.com/watch?v=YAzJrwi5ByU&list=PLTx6Zln7upb6wpl-suxaFK_S_-DARlGIj', '_blank');
                  }}
                  className="flex items-center justify-center gap-2 bg-[#FF0000] text-white py-2.5 px-4 sm:px-5 md:py-4 md:px-8 rounded-full transition-all font-bold text-[10px] sm:text-xs md:text-sm tracking-wide shadow-xl shrink-0 group border-none outline-none cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Full Playlist
                </motion.button>
                
                <div className="group relative flex items-center justify-center shrink-0">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all bg-transparent cursor-pointer z-10"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/60" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-[#FF0000]" />}
                  </button>
                  
                  {/* Vertical Volume Slider on Hover */}
                  <div className="absolute bottom-full mb-2 bg-[#0a0a0a]/90 backdrop-blur-md rounded-full w-10 sm:w-12 h-32 flex justify-center items-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/10 z-20">
                     <div className="relative w-full h-full flex justify-center items-center">
                        <input 
                          type="range" min="0" max="100" value={isMuted ? 0 : volume} 
                          onChange={(e) => {
                            setVolume(parseInt(e.target.value));
                            if (parseInt(e.target.value) > 0) setIsMuted(false);
                          }}
                          className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#FF0000] -rotate-90 absolute"
                        />
                     </div>
                  </div>
                </div>
              </div>
           </div>
         </div>
      </div>

      {/* Right Media (Playlist) */}
      <div className="w-full md:w-[55%] lg:w-[60%] h-1/2 md:h-full flex flex-col p-6 md:p-12 lg:p-24 z-10 bg-[#000000]/60 backdrop-blur-md overflow-hidden">
         <motion.div 
           initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
           className="flex justify-between items-center mb-3 md:mb-10 shrink-0"
         >
           <div className="flex items-center gap-3">
             <div className="w-1 h-4 md:h-6 bg-[#FF0000]"></div>
             <div className="text-white/40 text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase">Queue • {ytTracks.length} Tracks</div>
           </div>
           <BarChart2 className="w-5 h-5 md:w-8 md:h-8 text-white/20" />
         </motion.div>


          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex-1 flex flex-col gap-1 md:gap-2 overflow-y-auto custom-scrollbar pr-1 md:pr-4 min-h-[0px]"
          >
            {ytTracks.map((t, i) => (
              <div 
                key={t.id} onClick={() => { 
                  if (activeIdx !== i) {
                    setIsPlaying(false);
                    setTimeout(() => {
                      setActiveIdx(i); 
                      setIsPlaying(true); 
                    }, 50);
                  } else {
                    setIsPlaying(!isPlaying);
                  }
                }}
                className={`flex items-center gap-3 md:gap-5 p-2 md:p-4 rounded-xl cursor-pointer transition-all duration-300 group hover:bg-white/5 ${activeIdx === i ? 'bg-white/5 shadow-lg' : ''}`}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden relative shrink-0">
                   <img src={`https://img.youtube.com/vi/${t.id}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {activeIdx === i ? <Equalizer /> : <Play className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-current" />}
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className={`text-xs md:text-lg font-bold truncate ${activeIdx === i ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{t.title}</h4>
                   <p className="text-[10px] md:text-sm text-white/40 truncate">{t.artist}</p>
                </div>
                <div className="text-white/30 text-[10px] md:text-xs font-mono mr-2 hidden md:block">
                   {t.time}
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors hidden md:block" />
             </div>
           ))}
         </motion.div>
      </div>
    </div>
  );
}

/* ======================================================================
   SLIDE 4: AI ANIMATION
   ====================================================================== */
function Slide4_AI() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-screen h-[100dvh] shrink-0 flex flex-col md:flex-row bg-[#080808]">
      {/* Left Intro */}
      <div className="relative w-full md:w-[45%] lg:w-[40%] h-1/2 md:h-full flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 overflow-hidden shrink-0 bg-[#0a0a0a]">
         <TextContainerAmbient watermark="04" glowColor="bg-white" />
         
         <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 py-6 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar">
           <SectionTitle num="04" text="AI Animation" />
           <SectionSubhead text="Advanced Tech" />
           <SectionDesc>
              Harnessing generative latent diffusion and custom computational pipelines. We synthesize impossible visual architectures to pioneer the absolute cutting edge of digital storytelling.
           </SectionDesc>
           
           <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="shrink-0 flex flex-wrap items-center gap-8">
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="flex items-center gap-2 uppercase font-mono text-xs tracking-widest font-bold text-white hover:text-[#D4AF37] transition-colors bg-transparent border-none outline-none"
             >
               <Play className="w-5 h-5 fill-current" />
               {isPlaying ? "Close Video" : "Watch Video"}
             </button>
             <button 
               className="flex items-center gap-2 uppercase font-mono text-xs tracking-widest font-bold text-white hover:text-[#D4AF37] transition-colors bg-transparent border-none outline-none"
             >
               <Play className="w-5 h-5 fill-current" />
               AI Animation
             </button>
           </motion.div>
         </div>
      </div>

      {/* Right Media (Video Simulation) */}
      <div className="w-full md:w-[55%] lg:w-[60%] h-1/2 md:h-full relative overflow-hidden bg-[#000] flex items-center justify-center p-4 md:p-12">
         {/* Background generative feel */}
         <img 
           src="https://img.youtube.com/vi/CQiuxa2T9Ts/maxresdefault.jpg" 
           className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110" 
         />
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#030303] via-transparent to-[#030303]/80" />
         
         {/* Fake Video Player Container */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
           className="relative w-full z-10 aspect-video md:aspect-auto md:h-[70%] max-w-4xl bg-black rounded-lg md:rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden group/player"
         >
            {isPlaying ? (
              <iframe 
                src="https://www.youtube.com/embed/CQiuxa2T9Ts?autoplay=1&mute=0&controls=1&rel=0&showinfo=0"
                className="absolute inset-0 w-full h-full text-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img src="https://img.youtube.com/vi/CQiuxa2T9Ts/maxresdefault.jpg" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/player:scale-105 transition-transform duration-[3s] ease-out" />
                
                {/* Play Button Overlay */}
                <div onClick={() => setIsPlaying(true)} className="absolute inset-0 bg-black/40 group-hover/player:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                   <div className="w-12 h-12 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center group-hover/player:bg-white group-hover/player:text-black transition-all duration-500 cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.1)] group-hover/player:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                      <Play className="w-5 h-5 md:w-10 md:h-10 ml-1 text-white group-hover/player:text-black fill-current transition-colors" />
                   </div>
                </div>

                {/* Video Player UI Scaffolding removed as requested */}
              </>
            )}
         </motion.div>
      </div>
    </div>
  );
}

/* ======================================================================
   MAIN PORTFOLIO EXPORT
   ====================================================================== */
export default function Portfolio() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Slide across 4 sections vertically
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]); 
  const springX = useSpring(x, { stiffness: 45, damping: 15, restDelta: 0.001 });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const [isMobile, setIsMobile] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hasShownHint, setHasShownHint] = useState(false);
  const isInView = useInView(targetRef, { amount: 0.1, once: true });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show the hint only when in view and hasn't been shown yet, then auto-hide after 5 seconds
  useEffect(() => {
    if (isMobile && isInView && !hasShownHint) {
      setShowSwipeHint(true);
      setHasShownHint(true);
      const timer = setTimeout(() => setShowSwipeHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isInView, hasShownHint]);

  return (
    <section id="portfolio" ref={targetRef} className="relative md:h-[400vh] h-[100dvh] bg-black font-sans selection:bg-[#D4AF37]/30">
      <div 
        onScroll={() => showSwipeHint && setShowSwipeHint(false)}
        className="md:sticky md:top-0 h-[100dvh] md:flex md:items-center overflow-x-auto overflow-y-hidden md:overflow-hidden snap-x snap-mandatory bg-black text-white hide-scrollbar" 
        style={{ overscrollBehaviorX: 'contain' }}
      >
        
        {/* Global Horizontal Scroller */}
        <motion.div 
          style={isMobile ? undefined : { x: springX }} 
          className="flex w-[400vw] h-[100dvh] relative z-10 flex-nowrap"
        >
            <div className="w-screen h-full shrink-0 snap-center md:snap-none"><Slide1_FeatureFilm /></div>
            <div className="w-screen h-full shrink-0 snap-center md:snap-none"><Slide2_VFXAnime /></div>
            <div className="w-screen h-full shrink-0 snap-center md:snap-none"><Slide3_Music /></div>
            <div className="w-screen h-full shrink-0 snap-center md:snap-none"><Slide4_AI /></div>
        </motion.div>
        
        {/* Minimal Scroll Progress Bottom Bar - Hidden on mobile */}
        {!isMobile && (
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 z-50 pointer-events-none">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FF0000] origin-left"
              style={{ scaleX: progressWidth }}
            />
          </div>
        )}

        {/* Elegant Mobile Swipe Popup */}
        <AnimatePresence>
          {isMobile && showSwipeHint && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
              className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]"
            >
              <div className="bg-black/90 border border-[#D4AF37]/30 px-10 py-8 rounded-3xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                <motion.div
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/5 p-4 rounded-full border border-white/10"
                >
                  <Hand size={32} className="text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-sans tracking-[0.2em] font-bold text-white mb-2">SWIPE TO EXPLORE</p>
                  <p className="text-[10px] uppercase font-mono text-gray-400">Discover our portfolio</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
