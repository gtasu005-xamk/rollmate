import type { CreateThemeInput } from "./model";

export function isValidThemeName(name: string) {
  return !!name.trim();
}

export function isValidThemeRange(startAtIso: string, endAtIso: string) {
  const start = new Date(startAtIso).getTime();
  const end = new Date(endAtIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return end > start;
}

export function validateCreateTheme(input: CreateThemeInput) {
  if (!isValidThemeName(input.name)) return false;
  return isValidThemeRange(input.startAt, input.endAt);
}
