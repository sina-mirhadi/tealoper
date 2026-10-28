import { useEffect, useState } from 'react';
import Scene from './three/Scene';
import { scrollState } from './store/scroll';
import { profile } from './data/profile';
import { sectionIds, computeSectionPos, checkTimeline, isIncreasing } from './three/timeline';
import { getProjectRoute } from './utils/route';
import ProjectDetail from './components/ProjectDetail';

const navItems = [
  { id: 'about', label: 'درباره من' },
  { id: 'services', label: 'خدمات' },
  { id: 'work', label: 'نمونه‌کارها' },
  { id: 'skills', label: 'مهارت‌ها' },
  { id: 'resume', label: 'رزومه' },
  { id: 'contact', label: 'تماس' },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(() => getProjectRoute());

  useEffect(() => {
    const onHash = () => setProjectId(getProjectRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ترتیب بخش‌ها در DOM باید با sectionIds یکی باشد.
  useEffect(() => {
    const domIds = Array.from(document.querySelectorAll('main > section[id]')).map((el) => el.id);
    checkTimeline(domIds);
  }, []);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const mid = window.innerHeight / 2;
      const centers = sectionIds.map((id) => {
        const el = document.getElementById(id);
        if (!el) return mid;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      // اگر مراکز یکنواخت نباشند، موقعیت قبلی حفظ می‌شود تا صحنه نپرد.
      if (isIncreasing(centers)) {
        scrollState.sectionPos = computeSectionPos(centers, mid);
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <Scene />
      {projectId !== null && <ProjectDetail id={projectId} />}
      <div className="page">
        <header className="header">
          <a href="#top" className="logo">
            TEALOPER
          </a>
          <button
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            منو
          </button>
          <nav id="main-nav" className={`nav ${menuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="btn btn-small" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            تلگرام
          </a>
        </header>

        {/* مارکرهای اسکرول: فقط طول مسیر و شناسهٔ بخش‌ها را نگه می‌دارند.
            تمام متن‌های قابل مشاهده در فضای سه‌بعدی (WorldText) نمایش داده می‌شوند. */}
        <main id="top">
          {sectionIds.map((id) => (
            <section key={id} id={id} className="marker" aria-hidden="true" />
          ))}
        </main>

        <footer className="footer">
          <span>
            {profile.brand} · {profile.nameFa}
          </span>
          <a href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            تلگرام
          </a>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </div>
    </>
  );
}
