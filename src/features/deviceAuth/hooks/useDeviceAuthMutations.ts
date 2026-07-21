import { useMutation } from "@tanstack/react-query";
import { approveDevice } from "../api/deviceAuthApi";

export function useApproveDevice() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (userCode) => approveDevice(userCode),
  });
}
