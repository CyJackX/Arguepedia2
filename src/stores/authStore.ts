import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import { supabase } from 'src/utils/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../components/models';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const userProfile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getUser() {
    try {
      console.log('Fetching user');
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        user.value = null;
        userProfile.value = null;
      } else {
        user.value = currentUser;
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      }
      return user.value;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async function fetchProfile(userId: string) {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      userProfile.value = data;
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }

  async function signInWithGoogle() {
    loading.value = true;
    error.value = null;
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign in';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function signInWithPassword(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      console.log('Signing in with password:', email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
    } catch (e) {
      console.error('Error signing in with password:', e);
      error.value = e instanceof Error ? e.message : 'Failed to sign in';
      throw e;
    } finally {
      console.log('Signing in with password:', email, 'done');
      loading.value = false;
    }
  }

  async function signInWithOTP(email: string) {
    loading.value = true;
    error.value = null;
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to send magic link';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    loading.value = true;
    error.value = null;
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      user.value = null;
      userProfile.value = null;
      await router.push('/');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to sign out';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(newPassword: string) {
    loading.value = true;
    error.value = null;
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update password';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null;
      if (user.value) {
        void fetchProfile(user.value.id);
      }
      callback?.(event, session);
    });
  }

  // Initialize auth state
  void getUser();

  return {
    user,
    userProfile,
    loading,
    error,
    getUser,
    fetchProfile,
    signInWithGoogle,
    signInWithPassword,
    signInWithOTP,
    signOut,
    updatePassword,
    onAuthStateChange,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
