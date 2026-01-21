export type TrainingSession = {
  id: string;
  date: string; // ISO
  feeling: number;      // 0-10
  performance: number;  // 0-10
  rating: number;       // 0-10
  feedback: string | null;
};

export type CreateTrainingSessionInput = Omit<TrainingSession, "id">;
