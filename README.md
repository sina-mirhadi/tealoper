# TEALOPER — وب‌سایت پورتفولیو

وب‌سایت شخصی سینا میرهادی با صحنه سه‌بعدی (Three.js و React Three Fiber). محتوای اصلی بدون WebGL هم نمایش داده می‌شود.

## اجرا

```bash
npm install
npm run dev
```

## ساخت نسخه تولید

```bash
npm run build
```

خروجی در پوشه `dist` ساخته می‌شود.

## انتشار روی Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
- بعد از ساخت پروژه، دامنه `tealoper.ir` را در بخش Custom domains همان پروژه اضافه کنید و رکورد DNS را طبق راهنمای Cloudflare تنظیم کنید.

## ویرایش محتوا

- اطلاعات تماس و لینک تلگرام: `src/data/profile.ts`
- پروژه‌ها: `src/data/projects.ts` (برای افزودن پروژه، یک شیء جدید اضافه کنید)
- خدمات و مهارت‌ها: `src/data/content.ts`
- تنظیمات صحنه سه‌بعدی: `src/three/Scene.tsx`

## موارد باز

- لینک صفحه رسمی اپلیکیشن «سررشته» در مایکت هنوز تأیید نشده است. تا تأیید، لینک در `projects.ts` خالی است.
- شرح قابلیت‌ها و تصاویر واقعی سررشته به‌زودی اضافه می‌شود.
- فایل فونت Vazirmatn باید در `public/fonts` قرار بگیرد و با `@font-face` بارگذاری شود تا سایت به فونت خارجی وابسته نباشد.
- فایل رزومه PDF هنوز اضافه نشده است.
