import { BoxFillInputs, SavedJob } from '../types/nec';

const JOBS_STORAGE_KEY = 'nec_box_fill_jobs_v1';

export function loadSavedJobs(): SavedJob[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedJobs(jobs: SavedJob[]): void {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs to localStorage:', e);
  }
}

export function createSavedJob(label: string, inputs: BoxFillInputs): SavedJob {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
    label: label.trim() || 'Untitled Box',
    savedAt: new Date().toISOString(),
    inputs: JSON.parse(JSON.stringify(inputs))
  };
}

export function formatSavedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}
