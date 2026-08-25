// ProjectMatch Zod Schemas for AI Structured Outputs

import { z } from "zod";

// ====================
// Project Brief Extraction Schema
// ====================

export const NeededRoleSchema = z.object({
  title: z.string().min(1),
  requiredSkills: z.array(z.string()).min(1),
  niceToHaveSkills: z.array(z.string()).default([]),
  count: z.number().int().positive().default(1),
});

export const ProjectBriefSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  neededRoles: z.array(NeededRoleSchema).min(1),
  timeline: z.object({
    weeks: z.number().int().positive(),
    startDate: z.string().optional(),
  }),
  commitment: z.enum(["low", "medium", "high"]),
  domain: z.array(z.string()).min(1),
  desiredTeamSize: z.number().int().min(2).max(6),
});

export type ProjectBriefOutput = z.infer<typeof ProjectBriefSchema>;

// ====================
// Team Explanation Schema
// ====================

export const TeamExplanationSchema = z.object({
  whyThisTeam: z.array(z.string()).min(1).max(4),
  whyNotRunnerUp: z.string().min(1),
  skillGap: z.string().optional(),
});

export type TeamExplanationOutput = z.infer<typeof TeamExplanationSchema>;

// ====================
// Individual Match Explanation Schema
// ====================

export const ExplanationSchema = z.object({
  reasons: z.array(z.string()).min(1).max(3),
  gap: z.string().optional(),
});

export type ExplanationOutput = z.infer<typeof ExplanationSchema>;

// ====================
// Prompt Templates
// ====================

export const EXTRACT_BRIEF_PROMPT = `You are a project analyst. Extract structured requirements from a natural language project description.

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string",
  "neededRoles": [
    {
      "title": "string",
      "requiredSkills": ["string"],
      "niceToHaveSkills": ["string"],
      "count": number
    }
  ],
  "timeline": { "weeks": number, "startDate?: string" },
  "commitment": "low" | "medium" | "high",
  "domain": ["string"],
  "desiredTeamSize": number
}

Guidelines:
- Infer roles from the description. Typical roles: "Frontend Developer", "Backend Engineer", "UI/UX Designer", "ML Engineer", "DevOps Engineer", "Mobile Developer", "Data Engineer", "Embedded Engineer"
- requiredSkills: concrete technical skills explicitly needed (e.g., "React", "Python", "PostgreSQL", "Figma", "C++", "RTOS")
- niceToHaveSkills: bonus skills mentioned or implied
- commitment: "low" (5hrs/wk), "medium" (10hrs/wk), "high" (20+ hrs/wk) - infer from description
- domain: project categories (e.g., "fintech", "edtech", "robotics", "climate", "healthcare")
- desiredTeamSize: explicit number mentioned, or infer from role count (sum of count)

Examples:

Input: "Building a language learning mobile app with speech recognition. Need React Native for mobile, Backend for user progress tracking, UI/UX for engaging lessons. 10 weeks, 15hrs/week. Team of 3."
Output: {
  "title": "Language Learning Mobile App",
  "description": "Building a language learning mobile app with speech recognition. Need React Native for mobile, Backend for user progress tracking, UI/UX for engaging lessons. 10 weeks, 15hrs/week. Team of 3.",
  "neededRoles": [
    {"title": "Mobile Developer", "requiredSkills": ["React Native", "TypeScript", "Mobile Development"], "niceToHaveSkills": ["Speech Recognition", "Expo"], "count": 1},
    {"title": "Backend Engineer", "requiredSkills": ["Backend Development", "Node.js", "PostgreSQL"], "niceToHaveSkills": ["Redis", "GraphQL"], "count": 1},
    {"title": "UI/UX Designer", "requiredSkills": ["UI/UX Design", "Figma", "Mobile Design"], "niceToHaveSkills": ["User Research", "Design Systems"], "count": 1}
  ],
  "timeline": {"weeks": 10},
  "commitment": "medium",
  "domain": ["edtech", "mobile", "language learning"],
  "desiredTeamSize": 3
}

Input: "Building an AI code review tool. Need someone strong in AST parsing, TypeScript, and GitHub Actions. 10 weeks, 15hrs/week, team meets Mon/Wed 8pm EST."
Output: {
  "title": "AI Code Review Tool",
  "description": "Building an AI code review tool. Need someone strong in AST parsing, TypeScript, and GitHub Actions. 10 weeks, 15hrs/week, team meets Mon/Wed 8pm EST.",
  "neededRoles": [
    {"title": "Fullstack Engineer", "requiredSkills": ["TypeScript", "AST Parsing", "GitHub Actions", "Node.js"], "niceToHaveSkills": ["OpenAI API", "VS Code Extension"], "count": 2}
  ],
  "timeline": {"weeks": 10},
  "commitment": "medium",
  "domain": ["developer tools", "AI", "code analysis"],
  "desiredTeamSize": 2
}

Now extract from this input:`;

export const TEAM_EXPLANATION_PROMPT = `You are a team composition analyst. Generate a factual explanation for why a specific team was selected.

You will receive deterministic metrics about the team. Output ONLY valid JSON matching this schema:
{
  "whyThisTeam": ["string", "string", "string"],
  "whyNotRunnerUp": "string",
  "skillGap?: string
}

Rules:
- ONLY state facts present in the provided metrics. DO NOT invent skills, experience, or reasons.
- Use concrete numbers from the metrics (percentages, hours, counts).
- whyThisTeam: 2-3 bullets highlighting the team's strengths based on metrics
- whyNotRunnerUp: 1 sentence comparing to runner-up using their metrics
- skillGap: only if uncoveredRequiredSkills is non-empty

Metrics provided:
- Team Coverage: {requiredSkillCoverage}% ({coveredRequiredSkills} of {totalRequired} required skills)
- Shared Availability: {sharedAvailability}% ({sharedHours} hrs/week overlap)
- Skill Complementarity: {skillComplementarity}% (redundancy penalty: {redundantPairs}/{totalPairs} pairs)
- Experience Fit: {experienceFit}%
- Interest Alignment: {interestAlignment}%
- Team Size Fit: {sizeFit}%
- Team Score: {teamScore}/100
- Uncovered Skills: {uncoveredRequiredSkills}
- Runner-up Score: {runnerUpScore}/100
- Runner-up Coverage: {runnerUpCoverage}%
- Runner-up Uncovered: {runnerUpUncovered}

Generate explanation now.`;

export const MATCH_EXPLANATION_PROMPT = `You are a match analyst. Generate a brief explanation for why a person matches a project.

Input: match factors (0-1 each) and context.
Output ONLY valid JSON:
{
  "reasons": ["string", "string"],
  "gap?: string
}

Rules:
- Only state facts from the factors provided.
- reasons: 2 bullets referencing specific factor scores
- gap: only if a factor is notably low (<0.5)

Factor meanings:
- skillCoverage: fraction of required skills the person has
- availabilityOverlap: fraction of project hours the person can attend
- experienceFit: 1.0=perfect match, 0.7=adjacent level, 0.3=mismatch
- interestAlignment: Jaccard similarity of interests vs project domain`;