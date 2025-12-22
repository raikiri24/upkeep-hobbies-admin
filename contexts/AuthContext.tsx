import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { RBAC_CONFIG, Role, Permission } from '../config/rbac';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permissionId: string) => boolean;
  hasRole: (roleId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  getUserRole: () => Role | null;
  getUserPermissions: () => Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount and validate token
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    const initializeAuth = async () => {
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Validate token with local server if enabled
          const isValid = await apiService.validateToken(storedToken);
            
          if (!isValid) {
            console.log('Token expired or invalid, logging out...');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsLoading(false);
            return;
          }
          
          console.log('Setting user data:', userData);
          console.log('User role:', userData.role);
          console.log('User permissions check - dashboard.view:', RBAC_CONFIG.roles.find(role => role.id === userData.role)?.permissions.includes('dashboard.view'));
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: AuthUser, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('currentView');
  };

  const getUserRole = (): Role | null => {
    if (!user?.role) return null;
    return RBAC_CONFIG.roles.find(role => role.id === user.role) || null;
  };

  const getUserPermissions = (): Permission[] => {
    const userRole = getUserRole();
    if (!userRole) return [];
    
    return RBAC_CONFIG.permissions.filter(permission => 
      userRole.permissions.includes(permission.id)
    );
  };

  const hasPermission = (permissionId: string): boolean => {
    const userRole = getUserRole();
    console.log('hasPermission Debug - permissionId:', permissionId);
    console.log('hasPermission Debug - user:', user);
    console.log('hasPermission Debug - userRole:', userRole);
    console.log('hasPermission Debug - userRole.permissions:', userRole?.permissions);
    if (!userRole) {
      console.log('hasPermission Debug - no userRole found');
      return false;
    }
    const hasPermission = userRole.permissions.includes(permissionId);
    console.log('hasPermission Debug - result:', hasPermission);
    return hasPermission;
  };

  const hasRole = (roleId: string): boolean => {
    return user?.role === roleId;
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(permissionId => hasPermission(permissionId));
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(permissionId => hasPermission(permissionId));
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    getUserPermissions
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};