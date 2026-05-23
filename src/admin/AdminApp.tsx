import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import Sidebar from './Sidebar';
import Login from './Login';
import HeroEditor from './pages/HeroEditor';
import PortfolioEditor from './pages/PortfolioEditor';
import TestimonialsEditor from './pages/TestimonialsEditor';
import StoryEditor from './pages/StoryEditor';
import TeamEditor from './pages/TeamEditor';
import BtsEditor from './pages/BtsEditor';
import CareersEditor from './pages/CareersEditor';
import BlogEditor from './pages/BlogEditor';
import InvestmentEditor from './pages/InvestmentEditor';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[var(--color-ink)] flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-[var(--color-gold)] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAdmin) return <Login />;
  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[var(--color-ink)] text-white flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthGate>
      <AdminLayout>
        <Routes>
          <Route index element={<Navigate to="hero" replace />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="portfolio" element={<PortfolioEditor />} />
          <Route path="testimonials" element={<TestimonialsEditor />} />
          <Route path="story" element={<StoryEditor />} />
          <Route path="team" element={<TeamEditor />} />
          <Route path="careers" element={<CareersEditor />} />
          <Route path="bts" element={<BtsEditor />} />
          <Route path="blog" element={<BlogEditor />} />
          <Route path="investment" element={<InvestmentEditor />} />
          <Route path="*" element={<Navigate to="hero" replace />} />
        </Routes>
      </AdminLayout>
    </AuthGate>
  );
}
