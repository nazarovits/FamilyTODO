export const PASSWORD_MIN_CODE_POINTS = 12;
export const PASSWORD_MAX_CODE_POINTS = 128;

export type PasswordValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason: "too-short" | "too-long" | "whitespace";
    };

export function validatePassword(password: string): PasswordValidationResult {
  const codePointLength = Array.from(password).length;

  if (codePointLength < PASSWORD_MIN_CODE_POINTS) {
    return { valid: false, reason: "too-short" };
  }
  if (codePointLength > PASSWORD_MAX_CODE_POINTS) {
    return { valid: false, reason: "too-long" };
  }
  if (/\p{White_Space}/u.test(password)) {
    return { valid: false, reason: "whitespace" };
  }

  return { valid: true };
}
