import { useMutation, useQuery } from "@tanstack/react-query";
import { createTask, getTaskAssignees } from "./tasksApi";

export function useTaskAssignees() {
  return useQuery({
    queryKey: ["task-assignees"],
    queryFn: getTaskAssignees,
    retry: false,
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: createTask,
  });
}
