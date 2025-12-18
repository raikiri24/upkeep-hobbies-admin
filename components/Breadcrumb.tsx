import React from 'react';
import { useLocation } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbTitle = (pathname: string) => {
    const routeMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/inventory': 'Inventory Management',
      '/pos': 'Point of Sale',
      '/sales': 'Sales Management',
      '/newsletter': 'Newsletter',
      '/users': 'User Management',
      '/tournaments': 'Tournaments',
      '/404': 'Page Not Found'
    };
    
    return routeMap[pathname] || 'Unknown Page';
  };

  const getTitle = () => {
    return getBreadcrumbTitle(location.pathname);
  };

  const getSubtitle = () => {
    const subtitleMap: Record<string, string> = {
      '/dashboard': 'Overview of your business metrics and activities',
      '/inventory': 'Manage your products, stock levels, and inventory',
      '/pos': 'Process sales transactions and manage customer purchases',
      '/sales': 'View and manage all sales transactions and reports',
      '/newsletter': 'Create and send email newsletters to customers',
      '/users': 'Manage user accounts and permissions',
      '/tournaments': 'Organize and manage gaming tournaments',
      '/404': 'The requested page could not be found'
    };
    
    return subtitleMap[location.pathname] || '';
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
      {getSubtitle() && (
        <p className="text-slate-400">{getSubtitle()}</p>
      )}
    </div>
  );
};

export default Breadcrumb;