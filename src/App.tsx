/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Lenis from 'lenis';

import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import AmbientBackground from './components/AmbientBackground';
import AdminApp from './admin/AdminApp';
import { usePreloadAssets } from './hooks/usePreloadAssets';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <Portfolio />
        <Testimonials />
        <About />
        <Team />
        <BehindTheScenes />
        <Investment />
        <Careers />
        <Blog />
      </Suspense>
    </>
  );
}

function PublicSite() {
  const [loading, setLoading] = useState(true);

  // Kick off asset preloading into cache so useAsset() hooks find data instantly.
  // The preloader UI runs its own animation independently.
  usePreloadAssets();

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <SEO />
      <ScrollToTop />
      <div className="bg-black min-h-screen text-white selection:bg-[#D4AF37] selection:text-black font-sans">
        <AmbientBackground />
        {loading ? (
          <Preloader onComplete={() => setLoading(false)} />
        ) : (
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/story" element={
                   <Suspense fallback={<LoadingFallback />}>
                     <About />
                   </Suspense>
                } />
              </Routes>
            </main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/ashtaar-admin/*" element={<AdminApp />} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}
