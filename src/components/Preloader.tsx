import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [assembled, setAssembled] = useState(false);
  const [showWordmark, setShowWordmark] = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const progressRef = useRef(0);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Logo assembly sequence
  useEffect(() => {
    const t1 = setTimeout(() => setAssembled(true), 300);
    const t2 = setTimeout(() => setShowWordmark(true), 1500);
    const t3 = setTimeout(() => setShowDivider(true), 2400);
    const t4 = setTimeout(() => setShowProgress(true), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Progress bar — starts after logo assembles
  useEffect(() => {
    if (!showProgress) return;
    let p = progressRef.current;
    
    const timer = setInterval(() => {
      if (p >= 100) {
        clearInterval(timer);
        if (numRef.current) numRef.current.style.color = '#ffffff';
        setTimeout(onComplete, 800);
      } else {
        const step =
          p < 25 ? Math.random() * 0.7 + 0.4
          : p < 60 ? Math.random() * 1.2 + 0.9
          : p < 85 ? Math.random() * 1.8 + 1.6
          : Math.random() * 3 + 2.8;
        p = Math.min(100, p + step);
        progressRef.current = p;
        
        if (numRef.current) numRef.current.innerText = `${Math.floor(p)}%`;
        if (barRef.current) barRef.current.style.width = `${p}%`;
        if (tipRef.current) tipRef.current.style.left = `calc(${p}% - 1px)`;
      }
    }, 25);
    return () => clearInterval(timer);
  }, [showProgress, onComplete]);

  const ease = [0.16, 1, 0.3, 1] as const;

  // Piece transition helper
  const piece = (delay: number, hidden: object, visible: object) => ({
    initial: { opacity: 0, ...hidden },
    animate: assembled ? { opacity: 1, ...visible } : { opacity: 0, ...hidden },
    transition: { duration: 0.8, delay, ease },
  });

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0, y: '-100%' }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, #000 100%)',
        }}
      >
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.82) 100%)',
            zIndex: 1,
          }}
        />

        <div className="relative z-10 flex flex-col items-center">

          {/* ── LOGO SVG — exact match from user's drive link, cropped to mark ── */}
          <svg
            width="120"
            height="246"
            viewBox="600 0 400 820"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-8"
          >
            {/* Red upward triangle (cls-4) */}
            <motion.polygon
              points="796.38 2.93 606.08 528.69 987.84 528.69 796.38 2.93"
              fill="#b20710"
              stroke="#231f20"
              strokeWidth="2"
              strokeMiterlimit="10"
              {...piece(0.3, { y: -150 }, { y: 0 })}
            />

            {/* Dark grey downward triangle (cls-5) */}
            <motion.polygon
              points="634.3 188.34 957.38 188.34 795.84 528.29 634.3 188.34"
              fill="#424242"
              stroke="#231f20"
              strokeWidth="2"
              strokeMiterlimit="10"
              {...piece(0.5, { scaleX: 0.1 }, { scaleX: 1 })}
              style={{ transformOrigin: '796px 358px' }}
            />

            {/* White downward triangle (cls-3) */}
            <motion.polygon
              points="604.5 272.73 986.65 272.73 796.38 798.89 604.5 272.73"
              fill="#fff"
              stroke="#231f20"
              strokeWidth="2"
              strokeMiterlimit="10"
              {...piece(0.1, { scale: 0.45 }, { scale: 1 })}
              style={{ transformOrigin: '796px 535px' }}
            />

            {/* Light grey downward triangle (cls-2) */}
            <motion.polygon
              points="673.07 272.71 917.82 272.71 796.38 530.12 673.07 272.71"
              fill="#9e9e9e"
              stroke="#231f20"
              strokeWidth="2"
              strokeMiterlimit="10"
              {...piece(0.65, { y: 100, scale: 0.55 }, { y: 0, scale: 1 })}
              style={{ transformOrigin: '796px 401px' }}
            />

            {/* Red circle (cls-9) */}
            <motion.circle
              cx="795.88"
              cy="358.97"
              r="31.51"
              fill="#b20710"
              {...piece(1.1, { scale: 0 }, { scale: 1 })}
              style={{ transformOrigin: '796px 359px' }}
            />

            {/* Bindu pulse ring */}
            {assembled && (
              <motion.circle
                cx="795.88"
                cy="358.97"
                r="31.51"
                fill="none"
                stroke="#b20710"
                strokeWidth="4"
                initial={{ r: 31.51, opacity: 0.65 }}
                animate={{ r: 100, opacity: 0 }}
                transition={{
                  delay: 1.7,
                  duration: 1.9,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: 0.1,
                }}
              />
            )}
          </svg>

          {/* ── WORDMARK ── */}
          <motion.div
            className="text-center flex flex-col items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={showWordmark ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 1, ease }}
          >
            <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
              <motion.h1
                animate={showWordmark ? {
                  x: [0, -1, 2, -2, 0, 0, 0, 0, 0, 0],
                  opacity: [1, 0.8, 1, 0.9, 1, 1, 1, 1, 1, 1],
                  filter: [
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(-2px 0px 0px rgba(0,255,255,0.4)) drop-shadow(2px 0px 0px rgba(178,7,16,0.4))",
                    "drop-shadow(2px 0px 0px rgba(0,255,255,0.4)) drop-shadow(-2px 0px 0px rgba(178,7,16,0.4))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))",
                    "drop-shadow(0px 0px 0px rgba(178,7,16,0))"
                  ]
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  color: '#b20710',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                ASHTAAR
              </motion.h1>
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 'clamp(28px, 4.5vw, 42px)',
                  fontWeight: 400,
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                FILMS
              </span>
            </div>
            <p
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 'clamp(10px, 1.5vw, 14px)',
                fontWeight: 700,
                letterSpacing: '0.4em',
                color: '#ffffff',
                textTransform: 'uppercase',
                marginTop: '12px',
                marginRight: '-0.4em'
              }}
            >
              Production House
            </p>
          </motion.div>

          {/* ── DIVIDER ── */}
          <motion.div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.07)',
              marginTop: '28px',
            }}
            initial={{ width: 0 }}
            animate={showDivider ? { width: 440 } : { width: 0 }}
            transition={{ duration: 1, ease }}
          />

          {/* ── PROGRESS AREA ── */}
          <motion.div
            style={{ width: 440, maxWidth: '90vw', marginTop: 18 }}
            initial={{ opacity: 0 }}
            animate={showProgress ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Labels */}
            <div className="flex justify-between items-center mb-3">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(7px, 2.5vw, 11px)',
                  fontWeight: 800,
                  letterSpacing: 'clamp(1px, 0.6vw, 3px)',
                  color: '#c8a84b',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Preparing the cinematic experience
              </motion.span>
              <span
                ref={numRef}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(14px, 4vw, 20px)',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: '#c8a84b',
                  minWidth: 'clamp(40px, 10vw, 60px)',
                  textAlign: 'right',
                  transition: 'color 0.3s',
                }}
              >
                0%
              </span>
            </div>

            {/* Track */}
            <div
              className="relative overflow-hidden rounded-full"
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Fill */}
              <motion.div
                ref={barRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '0%',
                  background: 'linear-gradient(90deg, rgba(200,168,75,0.25), #c8a84b)',
                }}
                transition={{ ease: 'linear' }}
              />
              {/* Glowing tip */}
              <motion.div
                ref={tipRef}
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '-1px',
                  width: '4px',
                  height: '10px',
                  background: '#c8a84b',
                  boxShadow:
                    '0 0 12px rgba(200,168,75,1), 0 0 30px rgba(200,168,75,0.5)',
                  transition: 'left 0.07s linear',
                }}
              />
            </div>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}