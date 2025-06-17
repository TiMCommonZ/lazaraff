'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string; // UserRole enum
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // When the component mounts, try to fetch user data from a protected API route
  // This assumes the API route will read the HTTP-only cookie and return user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me'); // Create this API route later
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If response is not ok (e.g., 401 Unauthorized), means no valid cookie/user
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user on mount", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    console.log('AuthContext: User logged in, isAdmin:', newUser.role === 'ADMIN', 'User:', newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Make an API call to clear the HTTP-only cookie on the server
      await fetch('/api/auth/logout', { method: 'POST' }); // Create this API route later
    } catch (error) {
      console.error("Failed to logout on server", error);
    } finally {
      setUser(null);
      router.push('/login'); // Redirect to login page after logout
    }
  }, [router]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'ADMIN';

  console.log('AuthContext Render: loading=', loading, ', isLoggedIn=', isLoggedIn, ', isAdmin=', isAdmin, ', user=', user);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 