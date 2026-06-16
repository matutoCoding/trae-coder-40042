import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { menuConfig } from './menuConfig';

function Layout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    
    for (const item of menuConfig) {
      if (item.path === path) {
        return { title: item.label, subtitle: '' };
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return { title: child.label, subtitle: item.label };
          }
        }
      }
    }
    return { title: '工作台', subtitle: '' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
