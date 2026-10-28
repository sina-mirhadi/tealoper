import { useEffect } from 'react';
import { projects } from '../data/projects';
import { profile } from '../data/profile';

interface Props {
  id: string;
}

export default function ProjectDetail({ id }: Props) {
  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.location.hash = '#work';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label="جزئیات پروژه">
      <div className="detail">
        <a className="back" href="#work">بازگشت به نمونه‌کارها</a>

        {!project ? (
          <h1>پروژه پیدا نشد</h1>
        ) : (
          <>
            <p className="category">{project.category}</p>
            <h1>{project.name}</h1>
            <p className="lead">{project.longDescription}</p>

            {project.images && project.images.length > 0 ? (
              <div className="detail-gallery">
                {project.images.map((src, i) => (
                  <img key={src} src={src} alt={`${project.name} — تصویر ${i + 1}`} loading="lazy" />
                ))}
              </div>
            ) : (
              <div className="frame detail-frame" aria-hidden="true">{project.name}</div>
            )}

            {project.tech.length > 0 && (
              <>
                <h2>فناوری‌ها</h2>
                <ul className="tags">
                  {project.tech.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </>
            )}

            {project.status && <p className="status">{project.status}</p>}

            <div className="actions">
              {project.url && (
                <a className="btn" href={project.url} target="_blank" rel="noopener noreferrer">
                  مشاهده وب‌سایت
                </a>
              )}
              <a className="btn btn-ghost" href={profile.telegramUrl} target="_blank" rel="noopener noreferrer">
                پرسش درباره این پروژه در تلگرام
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
