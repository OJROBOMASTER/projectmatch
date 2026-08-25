// ProjectMatch Type Definitions

// ====================
// Core Domain Types
// ====================

export type ExperienceLevel = "junior" | "mid" | "senior";
export type CommitmentLevel = "low" | "medium" | "high";
export type ProjectStatus = "recruiting" | "formed";

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  years: number;
}

export interface Availability {
  days: string[];       // ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  hours: string;        // "19-22" (24hr format)
  timezone: string;     // "America/Los_Angeles"
}

export interface Experience {
  level: ExperienceLevel;
  projectsShipped: number;
  primaryRole: string;
}

// ====================
// Profile Types
// ====================

export interface StoredProfile {
  id: string;
  name: string;
  email: string;
  discord?: string;
  skills: Skill[];
  interests: string[];
  availability: Availability;
  experience: Experience;
  lookingFor: "project" | "cofounder" | "both";
  createdAt: number;
}

// ====================
// Project/Brief Types
// ====================

export interface NeededRole {
  title: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  count: number;
}

export interface ProjectBriefSchema {
  title: string;
  description: string;
  neededRoles: NeededRole[];
  timeline: { weeks: number; startDate?: string };
  commitment: CommitmentLevel;
  domain: string[];
  desiredTeamSize: number;
}

export interface StoredProject {
  id: string;
  ownerId: string;
  title: string;
  description: string;        // original NL text
  brief: ProjectBriefSchema;  // AI-extracted structure
  status: ProjectStatus;
  createdAt: number;
}

// ====================
// Team Composition Types
// ====================

export interface Candidate {
  id: string;
  name: string;
  skills: Skill[];
  availability: Availability;
  experience: Experience;
  interests: string[];
}

export interface ProjectRequirement {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  desiredTeamSize: number;
  timeline: { weeks: number };
  commitment: CommitmentLevel;
  domain: string[];
  schedule: { meetingDays: string[]; meetingHours: string; timezone: string; requiredHours: number };
}

export interface TeamMetrics {
  requiredSkillCoverage: number;
  skillComplementarity: number;
  sharedAvailability: number;
  experienceFit: number;
  interestAlignment: number;
  sizeFit: number;
  teamScore: number;
  uncoveredRequiredSkills: string[];
  coveredRequiredSkills: string[];
}

export interface TeamComposition {
  members: Candidate[];
  metrics: TeamMetrics;
}

export interface TeamCompositionResult {
  bestTeam: TeamComposition;
  runnerUp: TeamComposition | null;
  allTeams: TeamComposition[];
}

// ====================
// AI Output Schemas
// ====================

export interface ExplanationOutput {
  reasons: string[];
  gap?: string;
}

export interface TeamExplanationOutput {
  whyThisTeam: string[];
  whyNotRunnerUp: string;
  skillGap?: string;
}

// ====================
// Match Types (Secondary)
// ====================

export interface MatchFactors {
  skillCoverage: number;
  availabilityOverlap: number;
  experienceFit: number;
  interestAlignment: number;
}

export interface MatchRecord {
  userId: string;
  projectId: string;
  score: number;
  factors: MatchFactors;
  reasoning: string[];
  status: "pending" | "liked" | "passed" | "matched";
  createdAt: number;
}

// ====================
// Storage Keys
// ====================

export const STORAGE_KEYS = {
  PROFILE: "pm:profile",
  PROJECTS: "pm:projects",
  MATCHES: "pm:matches",
  DEMO_MODE: "pm:demoMode",
} as const;