import { useEffect, useRef } from 'react';
import { projects, type Project } from '../data/projects';
import { prefersReducedMotion } from '../utils/webgl';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// نمونه‌کارها به‌صورت کارت‌های روی‌هم. تعداد کارت‌ها از آرایهٔ projects خوانده می‌شود:
// ارتفاع بخش = تعداد کارت × ۱۰۰vh و هر کارت تقریباً یک صفحه اسکرول برای ورود دارد.
// افزودن نمونه‌کار جدید فقط با اضافه‌کردن یک شیء به projects انجام می‌شود.
export default function WorkStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const count = projects.length;

  useEffect(() => {
    if (count === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const H = window.innerHeight;
      const range = section.offsetHeight - H;
      const top = section.getBoundingClientRect().top;
      const t = range > 0 ? clamp01(-top / range) : 0;
      const steps = count - 1;
      const reduce = prefersReducedMotion();

      // ورود هر کارت: کارت اول همیشه حاضر است، بقیه به ترتیب وارد می‌شوند.
      const entry: number[] = projects.map((_, i) => {
        if (i === 0) return 1;
        const raw = clamp01(t * steps - (i - 1));
        return reduce ? (raw > 0.5 ? 1 : 0) : raw;
      });

      projects.forEach((_, j) => {
        const el = cardRefs.current[j];
        if (!el) return;

        // کارت‌هایی که بعد از j آمده‌اند، کارت j را پوشانده‌اند.
        let covered = 0;
        for (let i = j + 1; i < count; i++) covered += entry[i];

        const e = entry[j];
        const y = (1 - e) * H * 0.55 - covered * 14;
        const s = (1 - 0.05 * covered) * (0.94 + 0.06 * e);
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        el.style.opacity = String(j === 0 ? 1 : 0.35 + 0.65 * e);
        el.style.zIndex = String(j + 1);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  if (count === 0) {
    return <section id="work" className="marker" aria-hidden="true" />;
  }

  return (
    <section
      id="work"
      ref={sectionRef}
      className="work-stack"
      style={{ height: `${count * 100}vh` }}
      aria-labelledby="work-stack-title"
    >
      <div className="work-stack-sticky">
        <h2 id="work-stack-title" className="work-stack-title">
          نمونه‌کارها
        </h2>
        <div className="work-stack-deck">
          {projects.map((p, i) => (
            <WorkCard
              key={p.id}
              project={p}
              index={i}
              register={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkCard({
  project: p,
  index,
  register,
}: {
  project: Project;
  index: number;
  register: (el: HTMLElement | null) => void;
}) {
  const titleId = `work-card-title-${index}`;
  return (
    <article
      className={`work-card layout-${p.layout ?? 'vertical'}`}
      ref={register}
      aria-labelledby={titleId}
    >
      <div className="work-card-media">
        {p.images && p.images[0] ? (
          <img src={p.images[0]} alt={`${p.name} — تصویر پروژه`} loading="lazy" />
        ) : (
          <div className="work-card-frame" aria-hidden="true">
            {p.name}
          </div>
        )}
      </div>
      <div className="work-card-body">
        <p className="category">{p.category}</p>
        <h3 id={titleId}>{p.name}</h3>
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
      </div>
    </article>
  );
}
