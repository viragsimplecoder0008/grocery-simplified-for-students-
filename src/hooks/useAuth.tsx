import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/grocery';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  isCategoryManager: boolean;
  isStudent: boolean;
  isBrand: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Start with false, set to true only during auth operations

  useEffect(() => {
    let isCancelled = false;
    
    const setupAuth = async () => {
      try {
        console.log('🔧 Setting up auth...');
        setLoading(true); // Only set loading true when we start auth setup
        
        // Add a more aggressive failsafe timeout - if auth doesn't resolve in 6 seconds, continue
        const loadingTimeout = setTimeout(() => {
          if (!isCancelled) {
            console.warn('Auth loading timeout - continuing without authentication');
            setLoading(false);
          }
        }, 6000);

        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (isCancelled) return;
            
            console.log('🔄 Auth state change:', event, session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Defer profile fetching to prevent deadlocks
              setTimeout(() => {
                if (!isCancelled) {
                  fetchUserProfile(session.user.id);
                }
              }, 100);
            } else {
              setProfile(null);
            }
            
            clearTimeout(loadingTimeout);
            setLoading(false);
          }
        );

        // Check for existing session with shorter timeout
        const sessionTimeout = setTimeout(() => {
          if (!isCancelled) {
            console.warn('Session check timeout - continuing');
            clearTimeout(loadingTimeout);
            setLoading(false);
          }
        }, 3000);

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          clearTimeout(sessionTimeout);
          
          if (!isCancelled) {
            if (error) {
              console.warn('Error getting session:', error);
            }
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              fetchUserProfile(session.user.id);
            }
            clearTimeout(loadingTimeout);
            setLoading(false);
          }
        } catch (sessionError) {
          clearTimeout(sessionTimeout);
          console.warn('Failed to get session, continuing with guest access:', sessionError);
          if (!isCancelled) {
            clearTimeout(loadingTimeout);
            setLoading(false);
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (setupError) {
        console.error('Auth setup failed:', setupError);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for userId:', userId);
      
      // First try localStorage fallback
      const localProfile = localStorage.getItem(`profile_${userId}`);
      if (localProfile) {
        try {
          const parsedProfile = JSON.parse(localProfile);
          console.log('✅ Profile loaded from localStorage:', parsedProfile);
          setProfile(parsedProfile);
          return;
        } catch (e) {
          console.warn('Failed to parse localStorage profile, trying database...');
        }
      }
      
      // Try database with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 3000);
      });
      
      const dbPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      try {
        const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('❌ Error fetching profile:', error);
          throw error;
        }

        console.log('✅ Profile fetched successfully:', data);
        if (data) {
          setProfile(data as UserProfile);
          // Also save to localStorage for future offline use
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
        }
      } catch (dbError) {
        console.warn('Database query failed or timed out:', dbError);
        // Create a basic profile if database fails
        const basicProfile: UserProfile = {
          id: userId,
          full_name: null,
          email: '',
          role: 'student',
          currency: 'USD',
          budget: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          birth_day: null,
          birth_month: null,
          favorite_cake: null,
          favorite_snacks: null,
          hobbies: null
        };
        setProfile(basicProfile);
        localStorage.setItem(`profile_${userId}`, JSON.stringify(basicProfile));
      }
      
    } catch (error) {
      console.error('❌ Exception in fetchUserProfile:', error);
      // Always create a basic profile to prevent loading loops
      const basicProfile: UserProfile = {
        id: userId,
        full_name: null,
        email: '',
        role: 'student',
        currency: 'USD',
        budget: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        birth_day: null,
        birth_month: null,
        favorite_cake: null,
        favorite_snacks: null,
        hobbies: null
      };
      setProfile(basicProfile);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      throw new Error('No user or profile found');
    }

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Always save to localStorage first
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      
      // Update local state immediately
      setProfile(updatedProfile);

      // Try to update database (but don't fail if it doesn't work)
      try {
        // Create update object with only the fields that exist in the database
        const dbUpdates: any = {};
        if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
        if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
        if (updates.role && ['admin', 'category_manager', 'student'].includes(updates.role)) {
          dbUpdates.role = updates.role;
        }
        
        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', user.id);

        if (error) {
          console.warn('Database update failed, but localStorage updated:', error);
        } else {
          console.log('✅ Profile updated in both localStorage and database');
        }
      } catch (dbError) {
        console.warn('Database unavailable, using localStorage only:', dbError);
      }
      
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up any existing auth state
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined
        }
      });

      return { error };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isCategoryManager = profile?.role === 'category_manager';
  const isStudent = profile?.role === 'student';
  const isBrand = profile?.role === 'brand';

  // Debug logging for role calculations
  if (profile) {
    console.log('🔍 Role calculation debug:', {
      profileRole: profile.role,
      isAdmin,
      isCategoryManager,
      isStudent,
      isBrand,
      roleType: typeof profile.role,
    });
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isCategoryManager,
    isStudent,
    isBrand,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}