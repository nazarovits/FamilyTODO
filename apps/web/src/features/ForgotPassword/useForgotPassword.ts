import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "./forgotPasswordApi";

export function useForgotPassword() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}
