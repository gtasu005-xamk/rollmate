export function isScore0to10(n: number) {
  return Number.isInteger(n) && n >= 0 && n <= 10;
}

export function validateCreateSessionScores(input: { feeling: number; performance: number; rating: number }) {
  return isScore0to10(input.feeling) && isScore0to10(input.performance) && isScore0to10(input.rating);
}
