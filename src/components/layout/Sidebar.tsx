import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, menuConfig, useSidebarStore } from './menuConfig';
import { ChevronLeft, ChevronLeftCircle } from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, expandedKeys, toggleCollapsed, toggleExpand } = useSidebarStore();

  const handleMenuClick = (item: { path?: string; key: string }) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasActiveChild = (children?: { path?: string }[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  return (
    <aside
      className={`h-screen bg-dark-900/80 backdrop-blur-md border-r border-dark-700/50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
              <span className="text-white font-bold font-display text-sm">PT</span>
            </div>
            <span className="text-white font-display font-semibold text-lg tracking-wider">涂装管理</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
              <span className="text-white font-bold font-display text-sm">PT</span>
            </div>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className={`p-1 rounded hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors ${
            collapsed ? 'absolute -right-3 top-5 bg-dark-800 border border-dark-600 rounded-full' : ''
          }`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuConfig.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedKeys.includes(item.key);
            const isCurrentActive = isActive(item.path);
            const childActive = hasActiveChild(item.children);

            return (
              <li key={item.key}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        childActive
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && item.children && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childIsActive = isActive(child.path);
                          return (
                            <li key={child.key}>
                              <button
                                onClick={() => handleMenuClick(child)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                  childIsActive
                                    ? 'bg-accent-500/20 text-accent-400 border-l-2 border-accent-500'
                                    : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
                                }`}
                              >
                                <ChildIcon size={16} className="flex-shrink-0" />
                                <span>{child.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isCurrentActive
                        ? 'bg-accent-500/20 text-accent-400 shadow-glow-accent'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">管</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">管理员</p>
              <p className="text-xs text-dark-400 truncate">admin@coating.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
