import { Dispatch, SetStateAction } from 'react';
import { GameState } from '../../types';
import { REAL_USERS } from '../../data/seed';

interface LoginActionsParams {
  loginName: string;
  loginCpf: string;
  setGameState: Dispatch<SetStateAction<GameState>>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const createLoginActions = ({
  loginName,
  loginCpf,
  setGameState,
  showToast
}: LoginActionsParams) => {
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginCpf.trim()) {
      showToast('Preencha Nome e CPF.', 'error');
      return;
    }

    // Verify Credentials
    const foundUser = REAL_USERS.find(
      (u) => u.name.toLowerCase() === loginName.trim().toLowerCase() && u.cpf === loginCpf.trim()
    );

    if (foundUser) {
      setGameState((prev) => ({
        ...prev,
        currentUser: foundUser,
        // RESET COINS TO 0 for NON-MASTER on Login
        resources: foundUser.role === 'Master' ? { coins: 15000 } : { coins: 1200 }
      }));
      showToast(`Bem-vindo de volta, ${foundUser.name}!`, 'success');
    } else {
      showToast('Usuário não encontrado ou CPF incorreto.', 'error');
    }
  };

  const handleLogout = () => {
    window.location.reload();
  };

  return { handleLoginSubmit, handleLogout };
};
