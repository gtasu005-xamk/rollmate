import type { CreateThemeInput } from "./types";

export function isScore0to10(n: number) {
  return Number.isInteger(n) && n >= 0 && n <= 10;
}

export function validateCreateSessionScores(input: {
  feeling: number;
  performance: number;
  rating: number;
}) {
  return (
    isScore0to10(input.feeling) &&
    isScore0to10(input.performance) &&
    isScore0to10(input.rating)
  );
}

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
