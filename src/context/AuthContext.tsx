import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Profile load error:', error.message);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  }

  async function refreshProfile() {
    if (!user?.id) return;
    await loadProfile(user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;

      if (!currentSession?.user?.id) {
        if (!mounted) return;

        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        await supabase.auth.signOut();

        if (!mounted) return;

        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!mounted) return;

      setSession(currentSession);
      await loadProfile(currentSession.user.id);

      if (!mounted) return;
      setLoading(false);
    }

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setLoading(true);

        if (!nextSession?.user?.id) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(nextSession);
        await loadProfile(nextSession.user.id);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      refreshProfile,
      signOut
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
}