// وضعیت مشترک بین DOM و صحنهٔ سه‌بعدی.
// progress: پیشرفت کل اسکرول بین 0 و 1.
// sectionPos: موقعیت پیوسته بخش فعال (0 تا تعداد بخش‌ها منهای 1).
// mouse: موقعیت نشانگر به‌صورت مختصات نرمال‌شده بین -1 و 1.
export const scrollState = {
  progress: 0,
  sectionPos: 0,
  mouse: { x: 0, y: 0 },
};
