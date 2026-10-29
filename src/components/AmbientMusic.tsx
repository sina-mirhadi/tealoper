import { useEffect, useRef, useState } from 'react';

// فایل موسیقی باید مجوز استفاده داشته باشد و در این مسیر قرار گیرد:
// public/audio/ambient.mp3
// اگر فایل وجود نداشته باشد، هیچ کنترلی نمایش داده نمی‌شود.
const SRC = '/audio/ambient.mp3';
const VOLUME = 0.22;

export default function AmbientMusic() {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // بررسی وجود فایل واقعی: پاسخ باید صدا باشد؛ صفحهٔ HTML جایگزین (SPA fallback) پذیرفته نیست.
  useEffect(() => {
    let cancelled = false;
    fetch(SRC, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? '';
        if (!cancelled && r.ok && type.startsWith('audio/')) setAvailable(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!available) return;
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audioRef.current = audio;

    const onVisibility = () => {
      if (document.hidden) audio.pause();
      else if (playing) audio.play().catch(() => setPlaying(false));
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
    // playing عمداً در وابستگی نیست؛ وضعیت فعلی از طریق setPlaying مدیریت می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available]);

  // پخش خودکار معمولاً توسط مرورگر مسدود می‌شود؛ پس اولین تعامل کاربر را هم امتحان می‌کنیم.
  useEffect(() => {
    if (!available) return;
    const start = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused === false) return;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    };
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [available]);

  if (!available) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      className="music-toggle"
      aria-pressed={playing}
      onClick={toggle}
    >
      {playing ? 'خاموش کردن موسیقی' : 'روشن کردن موسیقی'}
    </button>
  );
}
