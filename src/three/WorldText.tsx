import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../store/scroll';
import { profile } from '../data/profile';
import { services, skillGroups, brandTraits, growthPath } from '../data/content';
import { ANCHORS, textPresence } from './timeline';

// اندازهٔ متن با distanceFactor تنظیم می‌شود: هرچه دوربین نزدیک‌تر باشد، متن بزرگ‌تر دیده می‌شود.
// عرض هر پنل همان عرض CSS (px) آن است. اگر متن‌ها خیلی کوچک یا بزرگ بودند، فقط distanceFactor را تغییر بده.

const processSteps = [
  'شناخت هدف و نیاز',
  'طراحی ساختار و تجربه کاربری',
  'پیاده‌سازی',
  'آزمایش و اصلاح',
  'آماده‌سازی برای انتشار',
];

interface WorldPanelProps {
  id: string; // کلید در ANCHORS
  width?: number;
  children: ReactNode;
}

// پنل متن: HTML واقعی با موقعیت جهانی ثابت و مقیاس وابسته به فاصله.
// نمایانی آن از سهم کلیدفریم‌های مرتبط خوانده می‌شود، نه از اسکرول خام.
function WorldPanel({ id, width = 440, children }: WorldPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = ANCHORS[id];

  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const p = Math.min(1, textPresence(scrollState.sectionPos, id) * 2);
    el.style.opacity = p.toFixed(3);
    el.style.visibility = p > 0.01 ? 'visible' : 'hidden';
  });

  return (
    <group position={pos}>
      <Html center distanceFactor={2.5} zIndexRange={[10, 0]}>
        <div
          ref={ref}
          className="world-panel"
          dir="rtl"
          style={{ ['--w' as string]: `${width}px`, visibility: 'hidden' } as CSSProperties}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

export default function WorldTexts() {
  return (
    <>
      <WorldPanel id="hero-text" width={520}>
        <p className="eyebrow">
          {profile.titleFa} · {profile.nameFa}
        </p>
        <h1>سینا میرهادی</h1>
        <p className="lead">Python Developer - FrontEnd Developer - Tea Developer</p>
        <div className="actions">
          <a className="btn" href="#work">
            دیدن پروژه‌ها
          </a>
          <a className="btn btn-ghost" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            ارتباط تو تلگرام
          </a>
        </div>
      </WorldPanel>

      <WorldPanel id="about-text" width={460}>
        <h2>به اسکرول ادامه بده . . .</h2>
        <p>
        
        </p>
      </WorldPanel>

      <WorldPanel id="services-text" width={520}>
        <h2></h2>
        <div className="plain-grid">
          {services.map((s) => (
            <div key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </WorldPanel>

      <WorldPanel id="skills-text" width={460}>
        <h2>تک استک ها</h2>
        <div className="plain-grid">
          {skillGroups.map((g) => (
            <div key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.items.join('، ')}</p>
            </div>
          ))}
        </div>
      </WorldPanel>

      <WorldPanel id="process-text" width={440}>
        <h2>نحوه انجام پروژه</h2>
        <ol className="steps">
          {processSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </WorldPanel>

      <WorldPanel id="resume-text" width={460}>
        <h2>درحال توسعه...</h2>
        {growthPath.map((item) => (
          <div className="path-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
        <p className="status">فایل رزومه PDF به‌زودی اضافه می‌شود.</p>
      </WorldPanel>

      <WorldPanel id="identity-text" width={460}>
        <h2>گواهی نامه ها</h2>
        <p>
          بزودی آپلود میشه
        </p>
        <ul className="traits">
          {brandTraits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </WorldPanel>

      <WorldPanel id="contact-text" width={460}>
        <h2>پروژه‌ای در ذهن داری؟ از همین‌جا شروع کنیم.</h2>
        <p>ارتباط فقط از طریق تلگرام ...</p>
        <div className="actions">
          <a className="btn" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            رفتن به تلگرام ({profile.telegramHandle})
          </a>
        </div>
      </WorldPanel>
    </>
  );
}
