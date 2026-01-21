import type { TrainingSession } from "../features/types";

export type ChartDataPoint = {
  date: string; // YYYY-MM-DD
  feeling: number;
  performance: number;
  rating: number;
  count: number; // sessions per day
};

/**
 * Aggregates training sessions by date, calculating average metrics
 * if multiple sessions exist on the same day
 */
export function aggregateSessionsByDay(sessions: TrainingSession[]): ChartDataPoint[] {
  const grouped = new Map<string, TrainingSession[]>();

  // Group sessions by date (YYYY-MM-DD)
  sessions.forEach((session) => {
    const date = session.date.split("T")[0]; // Extract date part
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(session);
  });

  // Calculate averages and create chart data
  const chartData: ChartDataPoint[] = Array.from(grouped.entries())
    .map(([date, daySessions]) => {
      const count = daySessions.length;
      const feeling =
        daySessions.reduce((sum, s) => sum + s.feeling, 0) / count;
      const performance =
        daySessions.reduce((sum, s) => sum + s.performance, 0) / count;
      const rating =
        daySessions.reduce((sum, s) => sum + s.rating, 0) / count;

      return {
        date,
        feeling: Math.round(feeling * 10) / 10, // Round to 1 decimal
        performance: Math.round(performance * 10) / 10,
        rating: Math.round(rating * 10) / 10,
        count,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

  return chartData;
}
