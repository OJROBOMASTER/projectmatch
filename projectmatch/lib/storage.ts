// ProjectMatch Storage Utilities - localStorage only

import type { StoredProfile, StoredProject, MatchRecord, ProjectBriefSchema } from "@/types";
import { SEEDED_PROFILES, SEEDED_PROJECTS } from "./seed";
import { STORAGE_KEYS } from "@/types";

// ====================
// Generic Helpers
// ====================

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage set failed:", e);
  }
}

// ====================
// Profile Storage
// ====================

export function getActiveProfile(): StoredProfile | null {
  return safeGet<StoredProfile | null>(STORAGE_KEYS.PROFILE, null);
}

export function setActiveProfile(profile: StoredProfile): void {
  safeSet(STORAGE_KEYS.PROFILE, profile);
}

export function clearActiveProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

// ====================
// Project Storage
// ====================

export function getProjects(): StoredProject[] {
  const projects = safeGet<StoredProject[]>(STORAGE_KEYS.PROJECTS, []);
  // Merge with seeded projects (avoid duplicates by ID)
  const seededIds = new Set(SEEDED_PROJECTS.map((p) => p.id));
  const userProjects = projects.filter((p) => !seededIds.has(p.id));
  return [...SEEDED_PROJECTS, ...userProjects];
}

export function addProject(project: StoredProject): void {
  const projects = safeGet<StoredProject[]>(STORAGE_KEYS.PROJECTS, []);
  projects.push(project);
  safeSet(STORAGE_KEYS.PROJECTS, projects);
}

export function getProjectById(id: string): StoredProject | undefined {
  const projects = getProjects();
  return projects.find((p) => p.id === id);
}

// ====================
// Match Storage
// ====================

export function getMatches(): MatchRecord[] {
  return safeGet<MatchRecord[]>(STORAGE_KEYS.MATCHES, []);
}

export function addMatch(match: MatchRecord): void {
  const matches = getMatches();
  matches.push(match);
  safeSet(STORAGE_KEYS.MATCHES, matches);
}

export function updateMatch(userId: string, projectId: string, updates: Partial<MatchRecord>): void {
  const matches = getMatches();
  const idx = matches.findIndex((m) => m.userId === userId && m.projectId === projectId);
  if (idx !== -1) {
    matches[idx] = { ...matches[idx], ...updates };
    safeSet(STORAGE_KEYS.MATCHES, matches);
  }
}

// ====================
// Demo Mode
// ====================

export function getDemoMode(): boolean {
  return safeGet<boolean>(STORAGE_KEYS.DEMO_MODE, false);
}

export function setDemoMode(value: boolean): void {
  safeSet(STORAGE_KEYS.DEMO_MODE, value);
}

// ====================
// Initialization
// ====================

export function initializeDemoData(): void {
  if (typeof window === "undefined") return;

  // Only seed if no profile exists
  const existingProfile = getActiveProfile();
  if (!existingProfile) {
    // Don't auto-select a profile - let user choose on landing page
  }

  // Projects are merged dynamically in getProjects()
}

// ====================
// Demo Profile Selection
// ====================

export function selectDemoProfile(candidateId: string): StoredProfile | null {
  const profile = SEEDED_PROFILES.find((p) => p.id === `demo-${candidateId}`);
  if (profile) {
    setActiveProfile(profile);
    setDemoMode(true);
    return profile;
  }
  return null;
}

export function createCustomProfile(profile: StoredProfile): void {
  setActiveProfile(profile);
  setDemoMode(false);
}