
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user profile (otimizado com menos logs)
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // If no profile exists, create one with the user's metadata
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
            const userPhone = user.user_metadata?.phone || null;
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ 
                id: userId, 
                name: userName,
                phone: userPhone
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              setProfile(newProfile as Profile);
            }
          }
        } catch (createError: any) {
          console.error('Error creating profile:', createError.message);
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    }
  };

  // Check current session and set up auth listener
  useEffect(() => {
    let mounted = true;

    // Configure auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle profile loading based on session
        if (newSession?.user) {
          // Wait a bit for the database trigger to create the profile
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(newSession.user.id);
            }
          }, event === 'SIGNED_IN' ? 100 : 500);
        } else {
          setProfile(null);
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (!mounted) return;
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        loadUserProfile(existingSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password (otimizado com menos logs)
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
        duration: 2000
      });
      
      navigate('/home');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
        duration: 2000
      });
      throw error;
    }
  };

  // Sign up with email and password (otimizado com menos logs)
  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (existingUser?.user) {
        // Usuário já existe e as credenciais estão corretas
        toast({
          title: "Você já tem uma conta",
          description: "Fazendo login automaticamente...",
          duration: 2000
        });
        navigate('/home');
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name,
            phone: phone
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        // Verificar se é erro de usuário já existente
        if (error.message.includes('already') || error.message.includes('User already registered')) {
          toast({
            title: "Conta já existe",
            description: "Este email já está cadastrado. Por favor, faça login ou recupere sua senha.",
            variant: "destructive",
            duration: 4000
          });
          throw new Error('Usuário já cadastrado');
        }
        throw error;
      }
      
      // Verificar se o usuário já existe mas não confirmou email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Conta já existe",
          description: "Este email já está cadastrado. Verifique seu email para confirmar a conta ou faça login se já confirmou.",
          variant: "default",
          duration: 5000
        });
        return;
      }
      
      if (data.user && !data.session) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Verifique seu email para confirmar a conta.",
          duration: 4000
        });
      } else if (data.session) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Bem-vindo ao Spatioo!",
          duration: 2000
        });
        navigate('/home');
      }
    } catch (error: any) {
      if (error.message !== 'Usuário já cadastrado') {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
          duration: 3000
        });
      }
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update profile (otimizado com menos logs)
  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Change password
  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
