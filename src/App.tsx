/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense, useCallback, useRef, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import AmbientBackground from './components/AmbientBackground';
import { usePreloadAssets } from './hooks/usePreloadAssets';
import { useContentProtection } from './hooks/useContentProtection';

// Eager load fold components
import Hero from './components/Hero';

// Lazy load components
const Portfolio = lazy(() => import('./components/Portfolio'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Team = lazy(() => import('./components/Team'));
const BehindTheScenes = lazy(() => import('./components/BehindTheScenes'));
const Investment = lazy(() => import('./components/Investment'));
const Careers = lazy(() => import('./components/Careers'));
const Blog = lazy(() => import('./components/Blog'));
const About = lazy(() => import('./components/About'));
const Footer = lazy(() => import('./components/Footer'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

const SEO = () => (
  <Helmet>
    <title>Ashtaar Films | Vision Beyond The Lens</title>
    <meta name="description" content="Official portfolio of Ashtaar Films. We produce high-quality cinematic content, music, and corporate films." />
    <meta name="keywords" content="film production, ashtaar films, cinematography, music videos, production house, Indian cinema" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#000000" />
    <meta name="author" content="Ashtaar Films" />

    {/* Open Graph / Facebook / Instagram */}
    <meta property="og:site_name" content="Ashtaar Films" />
    <meta property="og:title" content="Ashtaar Films | Vision Beyond The Lens" />
    <meta property="og:description" content="A premier film production and cinematic powerhouse dedicated to crafting unforgettable stories." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ashtaarfilms.com" />
    <meta property="og:image" content="https://ashtaarfilms.com/og-image.jpg" />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ashtaarfilms" />
    <meta name="twitter:title" content="Ashtaar Films | Vision Beyond The Lens" />
    <meta name="twitter:description" content="A premier film production and cinematic powerhouse dedicated to crafting unforgettable stories." />
    <meta name="twitter:image" content="https://ashtaarfilms.com/og-image.jpg" />
    <meta name="twitter:url" content="https://ashtaarfilms.com" />

    {/* Basic Security Meta Tags */}
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  </Helmet>
);

const LoadingFallback = () => (
  <div className="w-full h-screen bg-black flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function DeferredSection({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount) return;
    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMount]);

  if (shouldMount) {
    return <>{children}</>;
  }

  return <div id={id} ref={ref} className={className} aria-hidden="true" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage({
  onHeroReady,
  onBelowFoldReady,
}: {
  onHeroReady: () => void;
  onBelowFoldReady: () => void;
}) {
  const [showBelowFold, setShowBelowFold] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const reveal = () => {
      if (cancelled) return;
      setShowBelowFold(true);
      onBelowFoldReady();
    };

    timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(reveal, { timeout: 1200 });
      } else {
        reveal();
      }
    }, 350);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
    };
  }, [onBelowFoldReady]);

  return (
    <>
      <Hero onReady={onHeroReady} />
      {showBelowFold ? (
        <>
          <DeferredSection id="portfolio" className="relative md:h-[400vh] h-[100dvh] bg-black">
            <Suspense fallback={<div className="relative md:h-[400vh] h-[100dvh] bg-black" />}>
              <Portfolio />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="testimonials" className="min-h-screen bg-[#fafaf9]">
            <Suspense fallback={<div className="min-h-screen bg-[#fafaf9]" />}>
              <Testimonials />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="about" className="h-screen bg-black">
            <Suspense fallback={<div className="h-screen bg-black" />}>
              <About />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="team" className="md:min-h-screen min-h-screen bg-black">
            <Suspense fallback={<div className="md:min-h-screen min-h-screen bg-black" />}>
              <Team />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="bts" className="h-screen bg-black">
            <Suspense fallback={<div className="h-screen bg-black" />}>
              <BehindTheScenes />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="investment" className="min-h-screen bg-[#fafaf9]">
            <Suspense fallback={<div className="min-h-screen bg-[#fafaf9]" />}>
              <Investment />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="careers" className="min-h-screen bg-black">
            <Suspense fallback={<div className="min-h-screen bg-black" />}>
              <Careers />
            </Suspense>
          </DeferredSection>
          <DeferredSection id="blog" className="min-h-screen bg-[#fafaf9]">
            <Suspense fallback={<div className="min-h-screen bg-[#fafaf9]" />}>
              <Blog />
            </Suspense>
          </DeferredSection>
        </>
      ) : (
        <div className="min-h-screen bg-black" aria-hidden="true" />
      )}
    </>
  );
}

function PublicSite() {
  const { pathname } = useLocation();
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [heroReady, setHeroReady] = useState(pathname !== '/');
  const [belowFoldReady, setBelowFoldReady] = useState(pathname !== '/');
  const loading = !preloaderComplete || !heroReady;

  // Kick off asset preloading into cache so useAsset() hooks find data instantly.
  // The preloader UI runs its own animation independently.
  usePreloadAssets();
  useContentProtection();

  const handleHeroReady = useCallback(() => {
    setHeroReady(true);
  }, []);

  const handleBelowFoldReady = useCallback(() => {
    setBelowFoldReady(true);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderComplete(true);
  }, []);

  useEffect(() => {
    setHeroReady(pathname !== '/');
    setBelowFoldReady(pathname !== '/');
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    let cancelled = false;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let rafId: number;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <SEO />
      <ScrollToTop />
      <div className="bg-black min-h-screen text-white selection:bg-[#D4AF37] selection:text-black font-sans">
        {!loading ? <AmbientBackground /> : null}
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={
              <HomePage
                onHeroReady={handleHeroReady}
                onBelowFoldReady={handleBelowFoldReady}
              />
            } />
            <Route path="/story" element={
                <Suspense fallback={<LoadingFallback />}>
                  <About />
                </Suspense>
            } />
          </Routes>
        </main>
        {belowFoldReady ? (
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        ) : null}
        {loading ? (
          <Preloader onComplete={handlePreloaderComplete} />
        ) : null}
      </div>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/admin@ashtaar/*" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminApp />
            </Suspense>
          } />
          <Route path="/ashtaar-admin/*" element={<Navigate to="/admin@ashtaar" replace />} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}
