import { NavLink, useNavigate } from 'react-router-dom';
import { Film, Briefcase, MessageSquare, Users, Settings, LogOut, Image as ImageIcon, BookOpen, Camera, BriefcaseBusiness, Newspaper, Banknote } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  disabled?: boolean;
};

const NAV: NavItem[] = [
  { to: '/ashtaar-admin/hero',        label: 'Hero',         icon: Film },
  { to: '/ashtaar-admin/portfolio',   label: 'Portfolio',    icon: Briefcase },
  { to: '/ashtaar-admin/testimonials',label: 'Testimonials', icon: MessageSquare },
  { to: '/ashtaar-admin/story',       label: 'The Story',    icon: BookOpen },
  { to: '/ashtaar-admin/team',        label: 'Team',         icon: Users },
  { to: '/ashtaar-admin/bts',         label: 'Behind the Scenes',icon: Camera },
  { to: '/ashtaar-admin/careers',     label: 'Careers',      icon: BriefcaseBusiness },
  { to: '/ashtaar-admin/blog',        label: 'Journal',      icon: Newspaper },
  { to: '/ashtaar-admin/investment',  label: 'Investment',   icon: Banknote },
  { to: '/ashtaar-admin/media',       label: 'Media Library',icon: ImageIcon,    disabled: true },
];

export default function Sidebar() {
  const { signOut, session } = useAdminAuth();
  const navigate = useNavigate();
  const username = (session?.user?.user_metadata as { username?: string } | undefined)?.username ?? 'admin-ashtaar';

  return (
    <aside className="w-[240px] shrink-0 border-r border-[var(--color-line)] bg-[var(--color-ink)] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-[var(--color-line)]">
        <div className="flex items-baseline gap-2">
          <h1
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: 'Cinzel, serif', color: '#b20710', letterSpacing: '0.04em' }}
          >
            ASHTAAR
          </h1>
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#525252]">Admin</span>
        </div>
        <p className="mt-1.5 text-[10px] font-sans uppercase tracking-[0.3em] text-[#525252]">Production House</p>
      </div>

      {/* Section header */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#525252]">
          Sections
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                {item.disabled ? (
                  <div
                    aria-disabled
                    className="flex items-center gap-3 px-3 h-11 rounded-md text-sm text-[#3f3f3f] cursor-not-allowed select-none"
                    title="Coming soon"
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span className="font-sans">{item.label}</span>
                    <span className="ml-auto text-[9px] font-sans uppercase tracking-[0.2em]">soon</span>
                  </div>
                ) : (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'group flex items-center gap-3 px-3 h-11 rounded-md text-sm transition-all duration-200 relative',
                        isActive
                          ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                          : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.03]',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[var(--color-gold)]" />
                        )}
                        <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                        <span className="font-sans">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-line)] p-3 space-y-1">
        <div className="px-3 py-2">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#525252]">Signed in</p>
          <p className="text-sm font-mono text-white truncate">{username}</p>
        </div>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex w-full items-center gap-3 px-3 h-11 rounded-md text-sm text-[#3f3f3f] cursor-not-allowed"
        >
          <Settings size={16} strokeWidth={1.5} />
          <span className="font-sans">Settings</span>
        </button>
        <button
          type="button"
          onClick={async () => { await signOut(); navigate('/ashtaar-admin', { replace: true }); }}
          className="flex w-full items-center gap-3 px-3 h-11 rounded-md text-sm text-[#A3A3A3] hover:text-red-300 hover:bg-red-500/5 transition-colors duration-200"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="font-sans">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
