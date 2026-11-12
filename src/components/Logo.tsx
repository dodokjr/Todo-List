import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className={`grid h-8 w-8 place-items-center rounded-xl text-white ${light ? 'bg-white/20' : 'bg-moss'}`}><FiCheck strokeWidth={3} /></span>
      <b className={`font-display text-xl ${light ? 'text-white' : ''}`}>TodoFlow</b>
    </Link>
  );
}
