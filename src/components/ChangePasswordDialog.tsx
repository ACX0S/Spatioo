
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * @interface ChangePasswordDialogProps
 * @description Propriedades para o componente ChangePasswordDialog.
 * @param trigger - Elemento React que aciona a abertura do diálogo.
 */
interface ChangePasswordDialogProps {
  trigger: React.ReactNode;
}

/**
 * @component ChangePasswordDialog
 * @description Um diálogo que permite ao usuário alterar sua senha.
 */
const ChangePasswordDialog = ({ trigger }: ChangePasswordDialogProps) => {
  // Estados para controlar o diálogo e os campos do formulário.
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { changePassword } = useAuth(); // Hook para acessar a função de alterar senha.
  
  /**
   * @function resetForm
   * @description Reseta todos os campos do formulário para o estado inicial.
   */
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };
  
  /**
   * @function handleOpenChange
   * @description Controla a abertura e o fechamento do diálogo, resetando o formulário ao fechar.
   * @param newOpen - O novo estado de abertura.
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };
  
  /**
   * @function handleSubmit
   * @description Lida com a submissão do formulário, validando os dados e chamando a função de alterar senha.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação da nova senha.
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    
    try {
      setIsLoading(true);
      await changePassword(newPassword); // Chama a função do contexto de autenticação.
      handleOpenChange(false); // Fecha o diálogo em caso de sucesso.
      
      toast({ title: "Senha alterada", description: "Sua senha foi alterada com sucesso" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível alterar a senha", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>Defina uma nova senha para sua conta</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Campo Senha Atual */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Senha Atual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Sua senha atual"
                className="pl-10 pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          
          {/* Campo Nova Senha */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Sua nova senha"
                className="pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          
          {/* Campo Confirmar Nova Senha */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" className="bg-spatioo-green hover:bg-spatioo-green-dark text-black font-medium" disabled={isLoading || !newPassword || !confirmPassword}>
              {isLoading ? "Salvando..." : "Salvar Nova Senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
