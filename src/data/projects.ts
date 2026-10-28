// هر پروژه یک شیء داده است. برای افزودن پروژه، فقط یک مورد به این آرایه اضافه کنید.
// url و images اختیاری‌اند. فقط اطلاعات تأییدشده را وارد کنید.
export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  tech: string[];
  url?: string;
  status?: string;
  images?: string[];
}

export const projects: Project[] = [
  {
    id: 'serreshteh',
    name: 'سررشته',
    category: 'اپلیکیشن اندروید',
    description: 'محصول نرم‌افزاری منتشرشده در بازار مایکت.',
    longDescription:
      'سررشته یک اپلیکیشن اندروید است که توسط سینا میرهادی توسعه داده شده و در بازار مایکت منتشر شده است. شرح کامل قابلیت‌ها و تصاویر واقعی اپلیکیشن به‌زودی اضافه می‌شود.',
    tech: [],
    status: 'منتشرشده در مایکت',
    // url: 'https://...' — پس از تأیید صفحه رسمی مایکت اضافه شود.
    // images: ['/images/serreshteh-1.png'],
  },
  {
    id: 'arya-safir',
    name: 'آریا سفیر پاسارگاد',
    category: 'وب‌سایت',
    description: 'پروژه وب با فرانت‌اند React، سمت سرور Node.js و Express و پایگاه داده SQLite.',
    longDescription:
      'وب‌سایت آریا سفیر پاسارگاد با React در فرانت‌اند، Node.js و Express در سمت سرور و SQLite برای پایگاه داده ساخته شده است.',
    tech: ['React', 'Node.js', 'Express', 'SQLite'],
    url: 'https://aryasafirpasargad.ir',
    // images: ['/images/arya-1.png'],
  },
];
