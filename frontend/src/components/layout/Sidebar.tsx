'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Flame,
  Map,
  BarChart3,
  Settings,
  History,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Flame,
    description: 'Fire predictions',
  },
  {
    name: 'Live Map',
    href: '/map',
    icon: Map,
    description: 'Interactive map',
  },
  {
    name: 'Simulation',
    href: '/simulation',
    icon: Zap,
    description: 'Fire spread model',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Data insights',
  },
  {
    name: 'Historical',
    href: '/historical',
    icon: History,
    description: 'Past incidents',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      className="relative h-screen bg-gray-900/95 border-r border-white/10 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
          <Flame className="w-6 h-6 text-white" />
        </div>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-white">FireWatch</h1>
            <p className="text-xs text-gray-500">Almora Region</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'
                )}
              />
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <span className="font-medium">{item.name}</span>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description}
                  </p>
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="font-medium">Settings</span>}
        </Link>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
