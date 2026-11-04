import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "./resetPasswordApi";

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
