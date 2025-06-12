import { describe, it, expect } from 'vitest';
import { checkPasswordStrength } from '../passwordStrength';

describe('checkPasswordStrength', () => {
  it('returns score 0 and "Too short" for passwords under 8 characters', () => {
    const result = checkPasswordStrength('abc');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Too short');
    expect(result.checks.minLength).toBe(false);
  });

  it('returns score 1 and "Weak" for 8-char lowercase-only password', () => {
    const result = checkPasswordStrength('abcdefgh');
    expect(result.score).toBe(1);
    expect(result.label).toBe('Weak');
    expect(result.checks.minLength).toBe(true);
    expect(result.checks.hasLowercase).toBe(true);
    expect(result.checks.hasUppercase).toBe(false);
    expect(result.checks.hasNumber).toBe(false);
    expect(result.checks.hasSpecial).toBe(false);
  });

  it('returns score 2 and "Fair" for password with lowercase + uppercase + length', () => {
    const result = checkPasswordStrength('Abcdefgh');
    expect(result.score).toBe(2);
    expect(result.label).toBe('Fair');
    expect(result.checks.hasUppercase).toBe(true);
    expect(result.checks.hasLowercase).toBe(true);
  });

  it('returns score 3 and "Strong" for password with lowercase + uppercase + number', () => {
    const result = checkPasswordStrength('Abcdefg1');
    expect(result.score).toBe(3);
    expect(result.label).toBe('Strong');
    expect(result.checks.hasNumber).toBe(true);
  });

  it('returns score 4 and "Very strong" for password satisfying all checks', () => {
    const result = checkPasswordStrength('Abcdef1!');
    expect(result.score).toBe(4);
    expect(result.label).toBe('Very strong');
    expect(result.checks.hasSpecial).toBe(true);
    expect(result.checks.hasUppercase).toBe(true);
    expect(result.checks.hasLowercase).toBe(true);
    expect(result.checks.hasNumber).toBe(true);
    expect(result.checks.minLength).toBe(true);
  });

  it('detects special characters including @, #, $', () => {
    expect(checkPasswordStrength('Passw0rd@').checks.hasSpecial).toBe(true);
    expect(checkPasswordStrength('Passw0rd#').checks.hasSpecial).toBe(true);
    expect(checkPasswordStrength('Passw0rd$').checks.hasSpecial).toBe(true);
  });

  it('does not count special chars for purely alphanumeric passwords', () => {
    expect(checkPasswordStrength('Password1').checks.hasSpecial).toBe(false);
  });

  it('returns a color string for each score level', () => {
    const scores = ['', 'Abc', 'Abcdefg1', 'Abcdefg1!'];
    for (const pw of scores) {
      const result = checkPasswordStrength(pw);
      expect(typeof result.color).toBe('string');
      expect(result.color.length).toBeGreaterThan(0);
    }
  });
});
