'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Smartphone, Bot, GraduationCap, LogOut, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, clearAuth } from '../lib/auth';

const navigation = [
  { name: 'Weather', icon: Home, href: '/' },
  { name: 'Chat', icon: MessageSquare, href: '/chat' },
  { name: 'TutorMind AI', icon: GraduationCap, href: '/tutor/chat' },
  { name: 'Phone Search', icon: Smartphone, href: '/phone-search' },
  { name: 'Automata', icon: Bot, href: '/automata' },
  { name: 'AI Tools', icon: Wrench, href: '/ai-tools' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  async function logout() {
    try {
      const { getToken } = await import('../lib/auth');
      const token = getToken();
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      });
    } catch {}
    clearAuth();
    router.push('/tutor/login');
  }

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-accent">BizLink</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#F0F0F0] text-accent'
                  : 'text-muted hover:bg-[#F7F7F2] hover:text-accent'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent truncate">
              {user?.username ?? 'Guest'}
            </p>
            <p className="text-xs text-muted truncate">{user?.email ?? ''}</p>
          </div>
          {user && (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-muted hover:text-red-500 transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
