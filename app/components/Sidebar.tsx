'use client';

import { useState } from 'react';
import { Settings, Home } from 'lucide-react';

const navigation = [
  { name: 'Weather', icon: Home, current: true },
  { name: 'Settings', icon: Settings, current: false },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('Weather');

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-accent">BizLink</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = activeItem === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#F0F0F0] text-accent'
                  : 'text-muted hover:bg-[#F7F7F2] hover:text-accent'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-accent">John Doe</p>
            <p className="text-xs text-muted">Sales Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}