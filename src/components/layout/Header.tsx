import { Bell, Search, Settings, Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function Header({ title, subtitle }: HeaderProps) {
  const [hasNotification, setHasNotification] = useState(true);

  return (
    <header className="h-16 bg-dark-900/60 backdrop-blur-md border-b border-dark-700/50 flex items-center justify-between px-6">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-white font-display tracking-wide">{title}</h1>
        {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
          placeholder="搜索批次号、工件名称..."
            className="w-64 pl-9 pr-3 py-1.5 bg-dark-800/50 border border-dark-600/50 rounded-lg text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
          <Bell size={20} />
          {hasNotification && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-pulse" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>

        <button className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
          <Maximize2 size={20} />
        </button>

        <div className="h-6 w-px bg-dark-600/50" />

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-white">张管理员</p>
            <p className="text-xs text-dark-400">车间主任</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
