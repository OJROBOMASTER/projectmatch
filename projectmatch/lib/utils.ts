// ProjectMatch Utility Functions

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ====================
// Formatting Helpers
// ====================

export function formatHours(hours: string): string {
  const [start, end] = hours.split("-").map(Number);
  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return "12 AM";
    if (h === 12) return "12 PM";
    if (h > 12) return `${h - 12} PM`;
    return `${h} AM`;
  };
  return `${formatHour(start)} - ${formatHour(end)}`;
}

export function formatDays(days: string[]): string {
  const dayNames: Record<string, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };
  return days.map((d) => dayNames[d] || d).join(", ");
}

export function formatCommitment(commitment: "low" | "medium" | "high"): string {
  const hours = { low: "5 hrs/week", medium: "10 hrs/week", high: "20+ hrs/week" };
  return hours[commitment];
}

export function formatExperienceLevel(level: "junior" | "mid" | "senior"): string {
  const labels = { junior: "Junior (0-2 yrs)", mid: "Mid (3-5 yrs)", senior: "Senior (5+ yrs)" };
  return labels[level];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getScoreColorName(score: number): "green" | "blue" | "purple" | "orange" | "red" {
  if (score >= 80) return "green";
  if (score >= 60) return "orange";
  return "red";
}

export function getScoreVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

export function formatScore(score: number): string {
  return `${score}`;
}

// ====================
// Skill Matching Helpers
// ====================

export function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

export function skillMatches(skillA: string, skillB: string): boolean {
  return normalizeSkill(skillA) === normalizeSkill(skillB);
}

// ====================
// ID Generation
// ====================

export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ====================
// Debounce
// ====================

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}