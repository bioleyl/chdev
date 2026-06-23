import { AuthService } from '@/services/auth.service';
import type { Role } from '@chdev/common';
import type { Directive } from 'vue';

export const permission: Directive = {
  mounted(el, binding) {
    const requiredRole = binding.value as Role;
    if (!AuthService.hasPermission(requiredRole)) {
      el.style.display = 'none';
    }
  },
};
