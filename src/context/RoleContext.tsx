
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DeveloperRole, checkDeveloperAccess, checkAdminAccess, getUserRoles } from '@/services/developerService';

interface RoleContextType {
  isLoading: boolean;
  isDeveloper: boolean;
  isAdmin: boolean;
  roles: DeveloperRole[];
  refreshRoles: () => Promise<void>;
  hasRole: (role: DeveloperRole) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<DeveloperRole[]>([]);

  const loadRoles = async () => {
    if (!isAuthenticated || !user) {
      setIsDeveloper(false);
      setIsAdmin(false);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch roles from the service
      const userRoles = await getUserRoles(user.id);
      setRoles(userRoles);
      
      // Check for specific access levels
      const hasDeveloperAccess = await checkDeveloperAccess(user.id);
      const hasAdminAccess = await checkAdminAccess(user.id);
      
      setIsDeveloper(hasDeveloperAccess);
      setIsAdmin(hasAdminAccess);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load roles when authentication state changes
  useEffect(() => {
    loadRoles();
  }, [isAuthenticated, user]);

  // Check if user has a specific role
  const hasRole = (role: DeveloperRole) => {
    return roles.includes(role);
  };

  const value = {
    isLoading,
    isDeveloper,
    isAdmin,
    roles,
    refreshRoles: loadRoles,
    hasRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
