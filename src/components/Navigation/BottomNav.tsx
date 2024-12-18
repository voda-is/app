'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IoHome, IoPersonCircle } from 'react-icons/io5';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pt-4">
      <nav className="flex items-center justify-around p-4 backdrop-blur-md bg-gray-800/30">
        <button
        onClick={() => router.push('/')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors
            ${isActive('/') 
            ? 'bg-emerald-400 text-gray-900' 
            : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
            }`}
        >
        <IoHome className="w-5 h-5" />
        <span className="text-sm">Home</span>
        </button>
        <button
        onClick={() => router.push('/profile')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors
            ${isActive('/profile') 
            ? 'bg-emerald-400 text-gray-900' 
            : 'bg-white/25 text-gray-200'
            }`}
        >
        <IoPersonCircle className="w-5 h-5" />
        <span className="text-sm">Profile</span>
        </button>
      </nav>
    </div>
  );
} 