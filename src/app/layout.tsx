import './globals.css';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display' });
export const metadata = { title: 'TodoFlow: tugas pribadi dan tim dalam satu tempat', description: 'Papan, timeline, kalender, timer, dan checklist. Kerja sendiri atau bersama tim, real-time.' };
const init = "try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}";
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: init }} /></head>
      <body>{children}</body>
    </html>
  );
}
