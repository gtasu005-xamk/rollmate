import { api } from "../lib/apiClient";
import type {
	TrainingSession,
	CreateTrainingSessionInput,
	Note,
	CreateNoteInput,
} from "./types";

export async function getSessions(): Promise<TrainingSession[]> {
	return api.getSessions();
}

export async function createSession(payload: CreateTrainingSessionInput): Promise<TrainingSession> {
	return api.createSession(payload);
}

export async function getSession(id: string): Promise<TrainingSession> {
	return api.getSession(id);
}

export async function updateSession(id: string, payload: CreateTrainingSessionInput): Promise<TrainingSession> {
	return api.updateSession(id, payload);
}

export async function deleteSession(id: string): Promise<void> {
	return api.deleteSession(id);
}

export async function getSessionNotes(sessionId: string): Promise<Note[]> {
	return api.getSessionNotes(sessionId);
}

export async function createSessionNote(sessionId: string, payload: CreateNoteInput): Promise<Note> {
	return api.createSessionNote(sessionId, payload);
}

export async function updateSessionNote(sessionId: string, noteId: string, payload: CreateNoteInput): Promise<Note> {
	return api.updateSessionNote(sessionId, noteId, payload);
}

export async function deleteSessionNote(sessionId: string, noteId: string): Promise<void> {
	return api.deleteSessionNote(sessionId, noteId);
}

