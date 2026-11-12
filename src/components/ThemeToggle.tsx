'use client';
import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
export default function ThemeToggle() {
  const [d, setD] = useState(false);
  useEffect(() => setD(document.documentElement.classList.contains('dark')), []);
  const toggle = () => {
    const n = !d; setD(n); document.documentElement.classList.toggle('dark', n);
    try { localStorage.setItem('theme', n ? 'dark' : 'light'); } catch {}
  };
  return <button type="button" onClick={toggle} aria-label="Ganti tema gelap atau terang" className="rounded-lg p-2 hover:bg-ink/10">{d ? <FiSun /> : <FiMoon />}</button>;
}
