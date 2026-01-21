export type Theme = {
  id: string;
  name: string;
  startAt: string; // ISO
  endAt: string;   // ISO
};

export type CreateThemeInput = {
  name: string;
  startAt: string; // ISO
  endAt: string;   // ISO
};
