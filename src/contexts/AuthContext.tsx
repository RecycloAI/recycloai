import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  total_scans: number;  // Changed to snake_case to match database
  co2_saved: number;    // Changed to snake_case to match database
  points: number;
}

interface AuthContextType {
  user: UserRecord | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      // Add a timeout for the fetch
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      clearTimeout(timeout);
      console.log('Fetch result:', data, error);
      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
        }
      } else if (data) {
        console.log('User profile fetched:', data);
        setUser(data);
      } else {
        console.error('No data and no error returned from user profile fetch');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      console.log('Creating default profile for user:', userId);
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      console.log('getUser result:', authUser, userError);
      if (userError) {
        console.error('Error getting auth user:', userError);
        return;
      }
      if (!authUser) {
        console.error('No authenticated user found');
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            role: 'user',
            total_scans: 0,
            co2_saved: 0,
            points: 0,
          }
        ])
        .select()
        .single();
      console.log('Insert result:', data, error);
      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Default profile created:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting to login with email:', email);
      console.log('Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Supabase login response:', data, error);
      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (data.user) {
        try {
          const profilePromise = fetchUserProfile(data.user.id);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 7000));
          await Promise.race([profilePromise, timeoutPromise]);
        } catch (e) {
          console.error('Profile fetch or timeout error:', e);
        }
      }
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting to register with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      if (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
      }
      // Fetch or create the user profile after registration
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      console.log('Registration successful:', data.user?.id);
      return { success: true };
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};