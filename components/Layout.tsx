import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, Menu, Mail, Users as UsersIcon, Trophy, ShoppingCart, LogOut, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    // Check if user has permission to view this item
    const permissionMap: Record<string, string> = {
      '/dashboard': 'dashboard.view',
      '/inventory': 'inventory.view',
      '/newsletter': 'newsletter.view',
      '/users': 'users.view',
      '/tournaments': 'tournaments.view',
      '/pos': 'pos.view',
      '/sales': 'sales.view'
    };
    
    const requiredPermission = permissionMap[to];
    if (!hasPermission(requiredPermission)) {
      return null;
    }
    
    const isActive = location.pathname === to;
    
    return (
      <NavLink
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title={label}
      >
        <Icon size={20} className="flex-shrink-0" />
        <span className="truncate">{label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold font-display text-white flex-shrink-0">
              UH
            </div>
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-wide text-white text-left">UPKEEP<span className="text-indigo-500">ADMIN</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/inventory" icon={Package} label="Inventory" />
            <NavItem to="/pos" icon={ShoppingCart} label="POS Terminal" />
            <NavItem to="/sales" icon={Receipt} label="Sales" />
            <NavItem to="/newsletter" icon={Mail} label="Newsletter" />
            <NavItem to="/users" icon={UsersIcon} label="Users" />
            <NavItem to="/tournaments" icon={Trophy} label="Tournaments" />
          </nav>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-medium text-left">
              <Settings size={20} className="flex-shrink-0" />
              <span className="truncate">Settings</span>
            </button>
            
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col items-end text-right min-w-0">
              <span className="text-sm font-bold text-white truncate max-w-[120px] lg:max-w-none" title={user?.name || 'User'}>{user?.name || 'User'}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role || 'User'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-500 font-bold flex-shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex-shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

export default Layout;