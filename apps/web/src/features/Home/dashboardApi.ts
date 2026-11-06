import { getJson } from "../../lib/apiClient";

export interface DashboardResponse {
  data: {
    tasks: unknown[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await getJson("/api/dashboard");

  if (
    !isRecord(response) ||
    !isRecord(response.data) ||
    !Array.isArray(response.data.tasks)
  ) {
    throw new Error("The server returned an invalid dashboard response.");
  }

  return {
    data: {
      tasks: response.data.tasks,
    },
  };
}
