import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  total_scans: number;
  co2_saved: number;
  points: number;
}

interface AuthContextType {
  user: UserRecord | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  rank: number | null;
  refreshProfile: () => Promise<void>;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  const createDefaultProfile = useCallback(async (userId: string) => {
    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !authUser) {
        console.error('Error getting auth user:', userError);
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: 'user',
          total_scans: 0,
          co2_saved: 0,
          points: 0,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Profile not found
          return await createDefaultProfile(userId);
        }
        throw error;
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      throw error;
    }
  }, [createDefaultProfile]);

  const fetchRank = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_rank', { user_id: userId });
      if (error) {
        console.error('Error fetching rank:', error);
        return;
      }
      setRank(data);
    } catch (error) {
      console.error('Error fetching rank:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
      await fetchRank(user.id);
    }
  }, [user?.id, fetchUserProfile, fetchRank]);

  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state change:', event);
    
    // Prevent duplicate processing during initial load
    if (event === 'SIGNED_IN' && !isInitialized) {
      return;
    }
    
    setSession(session);
    
    if (session?.user) {
      // Only fetch profile if we don't already have user data or if the user ID changed
      if (!user || user.id !== session.user.id) {
        await fetchUserProfile(session.user.id);
        await fetchRank(session.user.id);
      }
    } else {
      setUser(null);
      setRank(null);
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    setIsLoading(false);
  }, [fetchUserProfile, fetchRank, user, isInitialized]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        if (!mounted) return;
        console.error('Error initializing auth:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) {
        console.error('Registration error:', error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { success: true };
    } catch (error) {
      console.error('Unexpected registration error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error logging out:', error);
        setIsLoading(false);
      }
      // Don't manually clear state here - let the auth state change handler do it
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        login, 
        register, 
        logout, 
        isLoading, 
        rank, 
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};