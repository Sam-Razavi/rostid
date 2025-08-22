export interface PasswordStrength {
  score: number; // 0-4
  label: 'Too short' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (!checks.minLength) return { score: 0, label: 'Too short', color: 'bg-red-400', checks };

  const passed = Object.values(checks).filter(Boolean).length;
  if (passed <= 2) return { score: 1, label: 'Weak', color: 'bg-red-400', checks };
  if (passed === 3) return { score: 2, label: 'Fair', color: 'bg-amber-400', checks };
  if (passed === 4) return { score: 3, label: 'Strong', color: 'bg-emerald-400', checks };
  return { score: 4, label: 'Very strong', color: 'bg-emerald-600', checks };
}
