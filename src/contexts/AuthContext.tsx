
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { UserMetadata } from "@/types/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, options?: { data: UserMetadata }) => Promise<{ success: boolean, error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean, error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ success: boolean, error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  userMetadata: UserMetadata | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          setUserMetadata(data.session.user.user_metadata as UserMetadata || null);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        setUserMetadata(session.user.user_metadata as UserMetadata || null);
      } else {
        setUserMetadata(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, options?: { data: UserMetadata }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.data
        }
      });
      
      return { success: !!data.user && !error, error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { success: !!data.user && !error, error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'email profile openid'
        }
      });

      if (error) throw error;
      
      // The data object doesn't contain a session property directly
      // So we'll just check if the OAuth flow started successfully
      return { success: !!data, error: null };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { success: false, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
    userMetadata
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
