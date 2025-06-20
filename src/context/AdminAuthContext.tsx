import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Admin user types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'legal' | 'compliance' | 'business' | 'technical' | 'partnership';
  department: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  fullName: string;
  role: AdminUser['role'];
  department: string;
  password: string;
}

// Auth state
interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Context type
interface AdminAuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string; user?: AdminUser }>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => AdminUser[];
  resetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string) => boolean;
  canAccessRole: (role: string) => boolean;
}

// Create context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Storage keys
const AUTH_STORAGE_KEY = 'admin_auth_state';
const USERS_STORAGE_KEY = 'admin_users';

// Default permissions by role
const ROLE_PERMISSIONS = {
  super_admin: [
    'user.create', 'user.read', 'user.update', 'user.delete',
    'onboarding.read', 'onboarding.approve', 'onboarding.reject',
    'documents.read', 'documents.approve', 'documents.reject',
    'system.admin', 'reports.view'
  ],
  legal: [
    'onboarding.read', 'onboarding.approve.legal', 'onboarding.reject.legal',
    'documents.read', 'documents.approve.legal', 'documents.reject.legal',
    'reports.view.legal'
  ],
  compliance: [
    'onboarding.read', 'onboarding.approve.compliance', 'onboarding.reject.compliance',
    'documents.read', 'documents.approve.compliance', 'documents.reject.compliance',
    'reports.view.compliance'
  ],
  business: [
    'onboarding.read', 'onboarding.approve.business', 'onboarding.reject.business',
    'documents.read', 'reports.view.business'
  ],
  technical: [
    'onboarding.read', 'onboarding.approve.technical', 'onboarding.reject.technical',
    'documents.read', 'reports.view.technical'
  ],
  partnership: [
    'onboarding.read', 'onboarding.approve.partnership', 'onboarding.reject.partnership',
    'documents.read', 'documents.approve.partnership', 'documents.reject.partnership',
    'reports.view.partnership', 'partner.manage'
  ]
};

// Default admin user (for demo purposes)
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin_001',
  username: 'admin',
  email: 'admin@worldapi.com',
  fullName: 'System Administrator',
  role: 'super_admin',
  department: 'IT',
  permissions: ROLE_PERMISSIONS.super_admin,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  createdBy: 'system'
};

// Provider component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth state and default users
  useEffect(() => {
    const initializeAuth = async () => {
    try {
      // Load auth state
      const savedAuthState = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuthState) {
        const parsed = JSON.parse(savedAuthState);
        if (parsed.user) {
          parsed.user.lastLogin = parsed.user.lastLogin ? new Date(parsed.user.lastLogin) : undefined;
          parsed.user.createdAt = new Date(parsed.user.createdAt);
        }
        setAuthState({ ...parsed, isLoading: false });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }

      // Initialize default users if not exists
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!savedUsers) {
        const defaultUsers = [
          DEFAULT_ADMIN,
          {
            id: 'legal_001',
            username: 'legal.team',
            email: 'legal@worldapi.com',
            fullName: 'Legal Team Lead',
            role: 'legal' as const,
            department: 'Legal',
            permissions: ROLE_PERMISSIONS.legal,
            isActive: true,
            createdAt: new Date('2024-01-01'),
            createdBy: 'admin_001'
          },
          {
            id: 'compliance_001',
            username: 'compliance.team',
            email: 'compliance@worldapi.com',
            fullName: 'Compliance Manager',
            role: 'compliance' as const,
            department: 'Compliance',
            permissions: ROLE_PERMISSIONS.compliance,
            isActive: true,
            createdAt: new Date('2024-01-01'),
            createdBy: 'admin_001'
            },
            {
              id: 'partnership_001',
              username: 'partnership.team',
              email: 'partnerships@worldapi.com',
              fullName: 'Partnership Manager',
              role: 'partnership' as const,
              department: 'Partnerships',
              permissions: ROLE_PERMISSIONS.partnership,
              isActive: true,
              createdAt: new Date('2024-01-01'),
              createdBy: 'admin_001'
          }
        ];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USERS_STORAGE_KEY);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();

    // Fallback timeout to ensure loading state is cleared
    const timeoutId = setTimeout(() => {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (!authState.isLoading) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: authState.user,
          isAuthenticated: authState.isAuthenticated
        }));
      } catch (error) {
        console.error('Error saving auth state:', error);
      }
    }
  }, [authState]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Get users from storage
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      if (!usersData) {
        return { success: false, error: 'No users found. Please contact system administrator.' };
      }

      const users: AdminUser[] = JSON.parse(usersData);
      
      // Find user by username
      const user = users.find(u => u.username === credentials.username && u.isActive);
      
      if (!user) {
        return { success: false, error: 'Invalid username or password.' };
      }

      // Simple password check (in production, use proper hashing)
      const validPasswords: Record<string, string> = {
        'admin': 'admin123',
        'legal.team': 'legal123',
        'compliance.team': 'compliance123',
        'partnership.team': 'partnership123'
      };

      if (validPasswords[credentials.username] !== credentials.password) {
        return { success: false, error: 'Invalid username or password.' };
      }

      // Update last login
      const updatedUser = { ...user, lastLogin: new Date() };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      // Set authenticated state
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Create user function
  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string; user?: AdminUser }> => {
    try {
      if (!authState.user || !hasPermission('user.create')) {
        return { success: false, error: 'Insufficient permissions to create users.' };
      }

      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users: AdminUser[] = usersData ? JSON.parse(usersData) : [];

      // Check if username or email already exists
      if (users.some(u => u.username === userData.username)) {
        return { success: false, error: 'Username already exists.' };
      }
      if (users.some(u => u.email === userData.email)) {
        return { success: false, error: 'Email already exists.' };
      }

      // Create new user
      const newUser: AdminUser = {
        id: `user_${Date.now()}`,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        department: userData.department,
        permissions: ROLE_PERMISSIONS[userData.role],
        isActive: true,
        createdAt: new Date(),
        createdBy: authState.user.id
      };

      // Save to storage
      const updatedUsers = [...users, newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'Failed to create user. Please try again.' };
    }
  };

  // Update user function
  const updateUser = async (userId: string, updates: Partial<AdminUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user || !hasPermission('user.update')) {
        return { success: false, error: 'Insufficient permissions to update users.' };
      }

      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users: AdminUser[] = usersData ? JSON.parse(usersData) : [];

      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return { success: false, error: 'User not found.' };
      }

      // Update user
      const updatedUser = { ...users[userIndex], ...updates };
      if (updates.role) {
        updatedUser.permissions = ROLE_PERMISSIONS[updates.role];
      }

      users[userIndex] = updatedUser;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user. Please try again.' };
    }
  };

  // Delete user function
  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user || !hasPermission('user.delete')) {
        return { success: false, error: 'Insufficient permissions to delete users.' };
      }

      if (userId === authState.user.id) {
        return { success: false, error: 'Cannot delete your own account.' };
      }

      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users: AdminUser[] = usersData ? JSON.parse(usersData) : [];

      const filteredUsers = users.filter(u => u.id !== userId);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));

      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'Failed to delete user. Please try again.' };
    }
  };

  // Get all users function
  const getAllUsers = (): AdminUser[] => {
    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  };

  // Reset password function
  const resetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!authState.user || !hasPermission('user.update')) {
        return { success: false, error: 'Insufficient permissions to reset passwords.' };
      }

      // In a real implementation, you would hash the password and update it
      // For demo purposes, we'll just return success
      console.log(`Password reset for user ${userId}: ${newPassword}`);
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password. Please try again.' };
    }
  };

  // Check permission function
  const hasPermission = (permission: string): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  // Check role access function
  const canAccessRole = (role: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.role === 'super_admin') return true;
    return authState.user.role === role;
  };

  const value = {
    authState,
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    resetPassword,
    hasPermission,
    canAccessRole
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook for using admin auth context
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 