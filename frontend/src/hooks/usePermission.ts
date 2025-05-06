import { useAuth, UserRole } from '../contexts/AuthContext';

interface PermissionHook {
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  isKyndlyTeam: boolean;
  isTpaAdmin: boolean;
  isTpaUser: boolean;
  isAdmin: boolean;
}

/**
 * Custom hook for checking user permissions and roles
 * @returns Object with permission/role check functions and role status flags
 */
export const usePermission = (): PermissionHook => {
  const { user, hasRole, hasPermission } = useAuth();
  
  // Check if user belongs to Kyndly team
  const isKyndlyTeam = user?.organization?.type === 'kyndly';
  
  // Check if user is a TPA administrator
  const isTpaAdmin = hasRole('tpa_admin');
  
  // Check if user is a regular TPA user
  const isTpaUser = hasRole('tpa_user');
  
  // Check if user is a system administrator
  const isAdmin = hasRole('admin');
  
  return {
    hasRole,
    hasPermission,
    isKyndlyTeam,
    isTpaAdmin,
    isTpaUser,
    isAdmin
  };
}; 