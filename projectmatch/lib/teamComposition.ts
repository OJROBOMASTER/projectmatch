// ProjectMatch Team Composition Engine
// Deterministic algorithm - no embeddings, no ML, just transparent math

import type { Candidate, ProjectRequirement, TeamComposition, TeamMetrics, TeamCompositionResult } from "@/types";

// ====================
// Utility Functions
// ====================

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  if (arr.length === k) return [arr];

  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((combo) => [first, ...combo]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

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

// ====================
// Individual Factor Computations
// ====================

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

// ====================
// Team Metrics Evaluation
// ====================

function evaluateTeam(members: Candidate[], requirements: ProjectRequirement): TeamMetrics {
  const teamSize = members.length;
  const desiredSize = requirements.desiredTeamSize;

  // 1. Required Skill Coverage (PRIMARY)
  const allTeamSkills = new Set(members.flatMap((m) => m.skills.map((s) => s.name.toLowerCase())));
  const requiredLower = requirements.requiredSkills.map((s) => s.toLowerCase());
  const coveredRequired = requiredLower.filter((s) => allTeamSkills.has(s));
  const requiredSkillCoverage = requiredLower.length > 0 ? coveredRequired.length / requiredLower.length : 1;

  // 2. Skill Complementarity (Non-redundancy)
  // Penalty for multiple people having the same required skill that only needs 1 person
  let redundantPairs = 0;
  let totalPossiblePairs = 0;

  for (let i = 0; i < teamSize; i++) {
    for (let j = i + 1; j < teamSize; j++) {
      totalPossiblePairs++;
      const skillsI = new Set(members[i].skills.map((s) => s.name.toLowerCase()));
      const skillsJ = new Set(members[j].skills.map((s) => s.name.toLowerCase()));

      // Check if they share any required skill
      const sharedRequired = requiredLower.filter((s) => skillsI.has(s) && skillsJ.has(s));
      if (sharedRequired.length > 0) {
        redundantPairs++;
      }
    }
  }

  const skillComplementarity = totalPossiblePairs > 0 ? 1 - redundantPairs / totalPossiblePairs : 1;

  // 3. Shared Availability (Hard Feasibility)
  // Find hours where ALL members can meet
  if (teamSize === 0) {
    return {
      requiredSkillCoverage: 0,
      skillComplementarity: 0,
      sharedAvailability: 0,
      experienceFit: 0,
      interestAlignment: 0,
      sizeFit: 0,
      teamScore: 0,
      uncoveredRequiredSkills: requirements.requiredSkills,
      coveredRequiredSkills: [],
    };
  }

  // Start with first member's availability as baseline
  let commonDays = members[0].availability.days;
  let commonHours = members[0].availability.hours;

  for (let i = 1; i < teamSize; i++) {
    commonDays = daysOverlap(commonDays, members[i].availability.days);
    if (commonDays.length === 0) break;

    // For hours, find overlap across all common days
    // Simplified: use the minimum overlap hours across the pair
    const overlap = hoursOverlap(commonHours, members[i].availability.hours);
    if (overlap > 0) {
      const { start: s1, end: e1 } = parseHours(commonHours);
      const { start: s2, end: e2 } = parseHours(members[i].availability.hours);
      const newStart = Math.max(s1, s2);
      const newEnd = Math.min(e1, e2);
      commonHours = `${newStart}-${newEnd}`;
    } else {
      commonHours = "0-0";
      break;
    }
  }

  const { start, end } = parseHours(commonHours);
  const sharedHoursPerDay = Math.max(0, end - start);
  const sharedHoursPerWeek = sharedHoursPerDay * commonDays.length;

  // Project required hours per week based on commitment
  const commitmentHours = { low: 5, medium: 10, high: 20 };
  const projectRequiredHours = commitmentHours[requirements.commitment] || 10;

  const sharedAvailability = Math.min(1, sharedHoursPerWeek / projectRequiredHours);

  // 4. Experience Fit
  const projectComplexity = requirements.timeline.weeks > 10 ? "advanced" : requirements.timeline.weeks > 6 ? "intermediate" : "beginner";
  const experienceFits = members.map((m) => computeExperienceFit(m, projectComplexity));
  const experienceFit = experienceFits.reduce((a, b) => a + b, 0) / experienceFits.length;

  // 5. Interest Alignment
  const teamInterests = new Set(members.flatMap((m) => m.interests.map((i) => i.toLowerCase())));
  const domainLower = requirements.domain.map((d) => d.toLowerCase());
  const interestAlignment = jaccardSimilarity(Array.from(teamInterests), domainLower);

  // 6. Team Size Fit
  let sizeFit = 0;
  if (teamSize === desiredSize) sizeFit = 1.0;
  else if (Math.abs(teamSize - desiredSize) === 1) sizeFit = 0.8;
  else if (Math.abs(teamSize - desiredSize) === 2) sizeFit = 0.5;

  // Composite Team Score
  const teamScore = Math.round(
    (0.35 * requiredSkillCoverage +
      0.20 * skillComplementarity +
      0.20 * sharedAvailability +
      0.10 * experienceFit +
      0.10 * interestAlignment +
      0.05 * sizeFit) * 100
  );

  return {
    requiredSkillCoverage,
    skillComplementarity,
    sharedAvailability,
    experienceFit,
    interestAlignment,
    sizeFit,
    teamScore,
    uncoveredRequiredSkills: requiredLower.filter((s) => !allTeamSkills.has(s)),
    coveredRequiredSkills: coveredRequired,
  };
}

// ====================
// Main Team Composition Function
// ====================

export function composeOptimalTeam(
  candidates: Candidate[],
  requirements: ProjectRequirement
): TeamCompositionResult {
  const teamSize = requirements.desiredTeamSize;
  const allCombinations = combinations(candidates, teamSize);

  const scoredTeams = allCombinations.map((combo) => ({
    members: combo,
    metrics: evaluateTeam(combo, requirements),
  }));

  // Sort by teamScore descending
  scoredTeams.sort((a, b) => b.metrics.teamScore - a.metrics.teamScore);

  return {
    bestTeam: scoredTeams[0],
    runnerUp: scoredTeams[1] || null,
    allTeams: scoredTeams,
  };
}

// ====================
// Export utilities for testing
// ====================

export { evaluateTeam, combinations, jaccardSimilarity, hoursOverlap, daysOverlap, parseHours };