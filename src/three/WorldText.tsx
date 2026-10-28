import { useRef, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../store/scroll';
import { projects } from '../data/projects';
import { profile } from '../data/profile';
import { services, skillGroups, brandTraits, growthPath } from '../data/content';
import { ANCHORS, textPresence } from './timeline';

// توجه: Html در حالت transform خودش اندازهٔ DOM را از روی ماتریس جهانی تبدیل می‌کند.
// هیچ scale اضافی روی گروه والد گذاشته نمی‌شود، چون در غیر این صورت متن چند پیکسلی و نامرئی می‌شود.
// عرض واقعی هر پنل همان عرض CSS آن (برحسب px) است.

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

// پنل متن: HTML واقعی در حالت transform، با موقعیت جهانی ثابت.
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
      <Html center distanceFactor={2} zIndexRange={[10, 0]}>
        <div ref={ref} className="world-panel" dir="rtl" style={{ width, visibility: 'hidden' }}>
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
        <h1>ایده‌ها را به تجربه‌های دیجیتال تبدیل می‌کنم.</h1>
        <p className="lead">طراحی و توسعه وب با تمرکز بر تجربه کاربری، کیفیت فنی و هویت بصری متمایز.</p>
        <div className="actions">
          <a className="btn" href="#work">
            مشاهده پروژه‌ها
          </a>
          <a className="btn btn-ghost" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            ارتباط در تلگرام
          </a>
        </div>
      </WorldPanel>

      <WorldPanel id="about-text" width={460}>
        <h2>فناوری، وقتی ارزش دارد که مسئله‌ای را حل کند.</h2>
        <p>
          من در حال یادگیری و توسعه مهارت‌های طراحی وب و برنامه‌نویسی هستم و روی پروژه‌های واقعی کار می‌کنم. تمرکزم
          بر ساختن محصول‌هایی است که هم خوب دیده شوند و هم درست کار کنند.
        </p>
      </WorldPanel>

      <WorldPanel id="services-text" width={520}>
        <h2>خدمات</h2>
        <div className="grid">
          {services.map((s) => (
            <article className="card" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </WorldPanel>

      <WorldPanel id="work-text" width={480}>
        <h2>نمونه‌کارها</h2>
        <p>هر پروژه جایگاه مستقل خودش را در این فضا دارد.</p>
      </WorldPanel>

      {projects.map((p) => (
        <WorldPanel key={p.id} id={`work-${p.id}-text`} width={420}>
          <p className="category">{p.category}</p>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
          {p.tech.length > 0 && (
            <ul className="tags">
              {p.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {p.status && <p className="status">{p.status}</p>}
          <div className="actions">
            <a className="btn btn-ghost btn-small" href={`#work/${p.id}`}>
              جزئیات پروژه
            </a>
            {p.url && (
              <a className="btn btn-small" href={p.url} target="_blank" rel="noopener noreferrer">
                مشاهده وب‌سایت
              </a>
            )}
          </div>
        </WorldPanel>
      ))}

      <WorldPanel id="skills-text" width={460}>
        <h2>مهارت‌ها</h2>
        <div className="grid">
          {skillGroups.map((g) => (
            <article className="card" key={g.title}>
              <h3>{g.title}</h3>
              <ul className="tags">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </WorldPanel>

      <WorldPanel id="process-text" width={440}>
        <h2>فرایند کار</h2>
        <ol className="steps">
          {processSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </WorldPanel>

      <WorldPanel id="resume-text" width={460}>
        <h2>در حال ساختن، یادگرفتن و بهترشدن.</h2>
        {growthPath.map((item) => (
          <div className="path-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
        <p className="status">فایل رزومه PDF به‌زودی اضافه می‌شود.</p>
      </WorldPanel>

      <WorldPanel id="identity-text" width={460}>
        <h2>ساختن تجربه‌هایی که فقط دیده نمی‌شوند، بلکه حس می‌شوند.</h2>
        <p>
          TEALOPER نام برند شخصی من برای طراحی و توسعه وب است. هدفم ساختن تجربه‌هایی است که هم از نظر بصری متمایز
          باشند و هم از نظر فنی درست کار کنند.
        </p>
        <ul className="traits">
          {brandTraits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </WorldPanel>

      <WorldPanel id="contact-text" width={460}>
        <h2>پروژه‌ای در ذهن داری؟ از همین‌جا شروع کنیم.</h2>
        <p>برای همکاری در طراحی و توسعه وب، درباره ایده‌ات صحبت کنیم.</p>
        <div className="actions">
          <a className="btn" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
            گفت‌وگو در تلگرام ({profile.telegramHandle})
          </a>
        </div>
      </WorldPanel>
    </>
  );
}
