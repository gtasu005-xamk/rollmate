import { api } from "../lib/apiClient";
import type { Theme, CreateThemeInput } from "./types";

export async function getThemes(): Promise<Theme[]> {
	return api.getThemes();
}

export async function createTheme(payload: CreateThemeInput): Promise<Theme> {
	return api.createTheme(payload);
}

export async function updateTheme(id: string, payload: CreateThemeInput): Promise<Theme> {
	return api.updateTheme(id, payload);
}

export async function deleteTheme(id: string): Promise<void> {
	return api.deleteTheme(id);
}
