import { api } from "../lib/apiClient";
import type { WeeklySummary } from "./types";

export async function getWeeklySummary(): Promise<WeeklySummary[]> {
	return api.getWeeklySummary();
}
