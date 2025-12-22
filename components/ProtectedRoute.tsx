import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRole?: string;
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requireAll = false,
  fallback = <div className="flex items-center justify-center min-h-64">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-slate-400 mb-2">Access Denied</h3>
      <p className="text-slate-500">You don't have permission to access this resource.</p>
    </div>
  </div>
}) => {
  const { isAuthenticated, hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = useAuth();

  console.log('ProtectedRoute Debug - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute Debug - requiredPermission:', requiredPermission);
  console.log('ProtectedRoute Debug - hasPermission result:', hasPermission(requiredPermission || ''));

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, returning fallback');
    return fallback;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return fallback;
    }
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

interface RoleGuardProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  children,
  fallback = null
}) => {
  const { hasRole } = useAuth();
  
  if (!hasRole(role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};