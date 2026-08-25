// ProjectMatch Individual Matching Engine
// Used for secondary "Find Project" tab - individual Project↔Person matching

import type { Candidate, StoredProject, MatchFactors } from "@/types";

export type { MatchFactors };

const commitmentHours = { low: 5, medium: 10, high: 20 };

function parseHours(hoursStr: string): { start: number; end: number } {
  const [start, end] = hoursStr.split("-").map(Number);
  return { start, end };
}

function hoursOverlap(hours1: string, hours2: string): number {
  const { start: s1, end: e1 } = parseHours(hours1);
  const { start: s2, end: e2 } = parseHours(hours2);
  const overlap = Math.max(0, Math.min(e1, e2) - Math.max(s1, s2));
  return overlap;
}

function daysOverlap(days1: string[], days2: string[]): string[] {
  return days1.filter((d) => days2.includes(d));
}

function jaccardSimilarity(setA: string[], setB: string[]): number {
  if (setA.length === 0 && setB.length === 0) return 1;
  const intersection = setA.filter((x) => setB.includes(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function computeExperienceFit(candidate: Candidate, projectComplexity: "beginner" | "intermediate" | "advanced"): number {
  const levelOrder: Record<string, number> = { junior: 0, mid: 1, senior: 2 };
  const complexityOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

  const candidateLevel = levelOrder[candidate.experience.level] ?? 1;
  const projectLevel = complexityOrder[projectComplexity] ?? 1;
  const diff = Math.abs(candidateLevel - projectLevel);

  if (diff === 0) return 1.0;
  if (diff === 1) return 0.7;
  return 0.3;
}

function computeSkillCoverage(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;
  const candidateSkillNames = candidateSkills.map((s) => s.toLowerCase());
  const requiredLower = requiredSkills.map((s) => s.toLowerCase());
  const covered = requiredLower.filter((s) => candidateSkillNames.includes(s)).length;
  return covered / requiredSkills.length;
}

function computeAvailabilityOverlap(candidate: Candidate, project: StoredProject): number {
  // Get project schedule from brief or defaults
  const schedule = project.brief.neededRoles.length > 0
    ? { meetingDays: ["mon", "wed", "fri"], meetingHours: "19-22", timezone: "America/Los_Angeles" }
    : { meetingDays: ["mon", "wed", "fri"], meetingHours: "19-22", timezone: "America/Los_Angeles" };

  const commonDays = daysOverlap(candidate.availability.days, schedule.meetingDays);
  if (commonDays.length === 0) return 0;

  const overlapHours = hoursOverlap(candidate.availability.hours, schedule.meetingHours);
  const projectRequiredHours = commitmentHours[project.brief.commitment] || 10;

  const sharedHoursPerWeek = overlapHours * commonDays.length;
  return Math.min(1, sharedHoursPerWeek / projectRequiredHours);
}

export function computeFactors(userProfile: Candidate, project: StoredProject): MatchFactors {
  const requiredSkills = project.brief.neededRoles.flatMap((r) => r.requiredSkills);
  const candidateSkills = userProfile.skills.map((s) => s.name);

  // Determine project complexity from timeline
  const projectComplexity = project.brief.timeline.weeks > 10 ? "advanced" :
    project.brief.timeline.weeks > 6 ? "intermediate" : "beginner";

  const skillCoverage = computeSkillCoverage(candidateSkills, requiredSkills);
  const availabilityOverlap = computeAvailabilityOverlap(userProfile, project);
  const experienceFit = computeExperienceFit(userProfile, projectComplexity);

  const userInterests = userProfile.interests.map((i) => i.toLowerCase());
  const projectDomain = project.brief.domain.map((d) => d.toLowerCase());
  const interestAlignment = jaccardSimilarity(userInterests, projectDomain);

  return {
    skillCoverage,
    availabilityOverlap,
    experienceFit,
    interestAlignment,
  };
}

export function scoreMatch(factors: MatchFactors): number {
  return Math.round(
    (0.40 * factors.skillCoverage +
      0.25 * factors.availabilityOverlap +
      0.20 * factors.experienceFit +
      0.15 * factors.interestAlignment) * 100
  );
}