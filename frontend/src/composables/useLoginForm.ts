import { AuthService } from '../services/auth.service';
import { useAction } from './useAction';
import type { LoginInput } from '@chdev/common';

export function useLoginForm() {
  function defaultLoginInput(): LoginInput {
    return {
      email: '',
      password: '',
    };
  }

  const login = useAction(AuthService.login);

  return {
    defaultLoginInput,
    login,
  };
}
