export type HealthResponse = {
  status: string;
};

export type TrainingSession = {
  id: string;
  date: string; // ISO
  feeling: number; // 0-10
  performance: number; // 0-10
  rating: number; // 0-10
  feedback: string | null;
};

export type CreateTrainingSessionInput = Omit<TrainingSession, "id">;

export type Theme = {
  id: string;
  name: string;
  startAt: string; // ISO
  endAt: string; // ISO
};

export type CreateThemeInput = {
  name: string;
  startAt: string; // ISO
  endAt: string; // ISO
};

export type Note = {
  id: string;
  sessionId: string;
  text: string;
  createdAt: string; // ISO
};

export type CreateNoteInput = {
  text: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO
  completedAt: string | null; // ISO
};

export type CreateTaskInput = {
  title: string;
};
