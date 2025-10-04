
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';
import { z } from 'zod';

// Schema de validação de senha conforme Supabase
const passwordSchema = z.string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um dígito')
  .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um símbolo');

// Tradução de erros do Supabase
const translateSupabaseError = (error: any): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Email ou senha incorretos';
  }
  if (message.includes('email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada';
  }
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'Este email já está cadastrado';
  }
  if (message.includes('password should be at least')) {
    return 'A senha deve ter no mínimo 8 caracteres';
  }
  if (message.includes('password must contain')) {
    return 'A senha não atende aos requisitos de segurança';
  }
  if (message.includes('invalid email')) {
    return 'Email inválido';
  }
  if (message.includes('email rate limit exceeded')) {
    return 'Muitas tentativas. Aguarde alguns minutos';
  }
  if (message.includes('network')) {
    return 'Erro de conexão. Verifique sua internet';
  }
  if (message.includes('too many requests')) {
    return 'Muitas tentativas. Tente novamente mais tarde';
  }
  
  return error.message;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, apelido: string, phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
        // Se não existe perfil, cria um com os metadados do usuário
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
            const userApelido = user.user_metadata?.apelido || null;
            const userPhone = user.user_metadata?.phone || null;
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ 
                id: userId, 
                name: userName,
                apelido: userApelido,
                phone: userPhone
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('Erro ao criar perfil:', insertError);
            } else {
              setProfile(newProfile as Profile);
            }
          }
        } catch (createError: any) {
          console.error('Erro ao criar perfil:', createError.message);
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
      // Validar senha antes de enviar
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        throw new Error(passwordValidation.error.errors[0].message);
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
        duration: 2000
      });
      
      navigate('/home');
    } catch (error: any) {
      const errorMessage = translateSupabaseError(error);
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
      throw error;
    }
  };

  // Cadastro com email e senha
  const signUp = async (email: string, password: string, name: string, apelido: string, phone: string) => {
    try {
      // Validar senha antes de criar conta
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        throw new Error(passwordValidation.error.errors[0].message);
      }

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
            apelido: apelido,
            phone: phone
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
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
          duration: 5000
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
      const errorMessage = translateSupabaseError(error);
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
      throw error;
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      const errorMessage = translateSupabaseError(error);
      toast({
        title: "Erro ao fazer login com Google",
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
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
      // Validar nova senha
      const passwordValidation = passwordSchema.safeParse(newPassword);
      if (!passwordValidation.success) {
        throw new Error(passwordValidation.error.errors[0].message);
      }

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
      const errorMessage = translateSupabaseError(error);
      toast({
        title: "Erro ao atualizar senha",
        description: errorMessage,
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
    signInWithGoogle,
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
