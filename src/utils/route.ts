// مسیریابی ساده با hash: آدرس #work/<id> صفحه جزئیات پروژه را باز می‌کند.
export function getProjectRoute(): string | null {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/^#work\/([a-z0-9-]+)$/i);
  return m ? m[1] : null;
}
