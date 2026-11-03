import { useMutation } from "@tanstack/react-query";
import { login } from "./loginApi";

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}
