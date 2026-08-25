// ProjectMatch AI Utilities - Anthropic SDK Integration

import Anthropic from "@anthropic-ai/sdk";
import { ProjectBriefSchema, TeamExplanationSchema, ExplanationSchema } from "./schemas";
import type { ProjectBriefOutput, TeamExplanationOutput, ExplanationOutput } from "./schemas";

// ====================
// Anthropic Client
// ====================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ====================
// Demo Project Brief (Drone Delivery - 3-min demo scenario)
// ====================

function getDemoProjectBrief(): ProjectBriefOutput {
  return {
    title: "Autonomous Medical Drone Delivery System",
    description: "Building an autonomous medical drone delivery system for remote areas. Need Computer Vision for obstacle detection and landing zone identification, Embedded Systems for flight control and fail-safe mechanisms, Machine Learning for route optimization and weather adaptation, IoT/Telemetry for real-time monitoring and fleet management, Backend for mission coordination and medical inventory tracking. 12 weeks, 20hrs/week, team meets Mon/Wed/Fri 7pm PST. Team of 4.",
    neededRoles: [
      {
        title: "Computer Vision Engineer",
        requiredSkills: ["Computer Vision", "Python", "OpenCV", "Object Detection"],
        niceToHaveSkills: ["PyTorch", "TensorFlow", "YOLO", "Depth Estimation"],
        count: 1,
      },
      {
        title: "Embedded Systems Engineer",
        requiredSkills: ["Embedded Systems", "C++", "RTOS", "Flight Control"],
        niceToHaveSkills: ["STM32", "FreeRTOS", "Sensor Fusion", "PX4/ArduPilot"],
        count: 1,
      },
      {
        title: "ML/Backend Engineer",
        requiredSkills: ["Machine Learning", "Backend Development", "API Design", "Node.js"],
        niceToHaveSkills: ["Route Optimization", "PostgreSQL", "Redis", "WebSocket"],
        count: 1,
      },
      {
        title: "IoT/Fleet Engineer",
        requiredSkills: ["IoT", "Telemetry", "Backend Development", "TypeScript"],
        niceToHaveSkills: ["MQTT", "InfluxDB", "Grafana", "Kubernetes"],
        count: 1,
      },
    ],
    timeline: { weeks: 12 },
    commitment: "high",
    domain: ["robotics", "healthcare", "autonomous systems", "drones", "logistics"],
    desiredTeamSize: 4,
  };
}

// ====================
// Extract Project Brief from Natural Language
// ====================

export interface ExtractBriefResult {
  success: boolean;
  data?: ProjectBriefOutput;
  error?: string;
  isDemo?: boolean;
}

export async function extractProjectBrief(
  description: string
): Promise<ExtractBriefResult> {
  // Try real Anthropic API first
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1500,
        temperature: 0.1,
        system: "You are a project analyst. Extract structured requirements from natural language. Return ONLY valid JSON.",
        messages: [
          {
            role: "user",
            content: `${await import("./schemas").then((m) => m.EXTRACT_BRIEF_PROMPT)}\n\n${description}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      // Parse and validate JSON
      const parsed = JSON.parse(content.text);
      const validated = ProjectBriefSchema.parse(parsed);

      return { success: true, data: validated, isDemo: false };
    } catch (error) {
      console.error("extractProjectBrief Anthropic error:", error);
      // Check if it's a credit/quota error
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isCreditError =
        errorMsg.includes("credit") ||
        errorMsg.includes("quota") ||
        errorMsg.includes("billing") ||
        errorMsg.includes("insufficient") ||
        errorMsg.includes("429") ||
        errorMsg.includes("402");

      if (isCreditError) {
        console.log("Anthropic credit error detected, falling back to demo extraction");
        return { success: true, data: getDemoProjectBrief(), isDemo: true };
      }
      // For other errors, fall through to demo fallback
    }
  }

  // Demo fallback: return drone-delivery scenario
  console.log("Using demo project brief extraction fallback");
  return { success: true, data: getDemoProjectBrief(), isDemo: true };
}

// ====================
// Generate Team Explanation
// ====================

export interface TeamExplanationInput {
  requiredSkillCoverage: number;
  coveredRequiredSkills: string[];
  totalRequired: number;
  sharedAvailability: number;
  sharedHours: number;
  skillComplementarity: number;
  redundantPairs: number;
  totalPairs: number;
  experienceFit: number;
  interestAlignment: number;
  sizeFit: number;
  teamScore: number;
  uncoveredRequiredSkills: string[];
  runnerUpScore?: number;
  runnerUpCoverage?: number;
  runnerUpUncovered?: string[];
}

export async function generateTeamExplanation(
  input: TeamExplanationInput
): Promise<{ success: boolean; data?: TeamExplanationOutput; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Return mock explanation for demo
    return generateMockTeamExplanation(input);
  }

  try {
    const prompt = `Team Coverage: ${Math.round(input.requiredSkillCoverage * 100)}% (${input.coveredRequiredSkills.join(", ")} of ${input.totalRequired} required skills)
Shared Availability: ${Math.round(input.sharedAvailability * 100)}% (${input.sharedHours} hrs/week overlap)
Skill Complementarity: ${Math.round(input.skillComplementarity * 100)}% (redundancy penalty: ${input.redundantPairs}/${input.totalPairs} pairs)
Experience Fit: ${Math.round(input.experienceFit * 100)}%
Interest Alignment: ${Math.round(input.interestAlignment * 100)}%
Team Size Fit: ${Math.round(input.sizeFit * 100)}%
Team Score: ${input.teamScore}/100
Uncovered Skills: ${input.uncoveredRequiredSkills.length > 0 ? input.uncoveredRequiredSkills.join(", ") : "none"}
Runner-up Score: ${input.runnerUpScore ?? "N/A"}/100
Runner-up Coverage: ${input.runnerUpCoverage ? Math.round(input.runnerUpCoverage * 100) + "%" : "N/A"}
Runner-up Uncovered: ${input.runnerUpUncovered?.join(", ") ?? "N/A"}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      temperature: 0.1,
      system: "You are a team composition analyst. Generate factual explanations from metrics. Return ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: `${await import("./schemas").then((m) => m.TEAM_EXPLANATION_PROMPT)}\n\n${prompt}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return { success: false, error: "Unexpected response type" };
    }

    const parsed = JSON.parse(content.text);
    const validated = TeamExplanationSchema.parse(parsed);

    return { success: true, data: validated };
  } catch (error) {
    console.error("generateTeamExplanation error:", error);
    // Fallback to mock
    return generateMockTeamExplanation(input);
  }
}

// ====================
// Generate Individual Match Explanation
// ====================

interface MatchExplanationInput {
  skillCoverage: number;
  availabilityOverlap: number;
  experienceFit: number;
  interestAlignment: number;
  userName: string;
  projectTitle: string;
}

export async function generateMatchExplanation(
  input: MatchExplanationInput
): Promise<{ success: boolean; data?: ExplanationOutput; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateMockMatchExplanation(input);
  }

  try {
    const prompt = `User: ${input.userName}
Project: ${input.projectTitle}
Skill Coverage: ${Math.round(input.skillCoverage * 100)}%
Availability Overlap: ${Math.round(input.availabilityOverlap * 100)}%
Experience Fit: ${Math.round(input.experienceFit * 100)}%
Interest Alignment: ${Math.round(input.interestAlignment * 100)}%`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 500,
      temperature: 0.2,
      system: "You are a match analyst. Generate brief explanations from factors. Return ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: `${await import("./schemas").then((m) => m.MATCH_EXPLANATION_PROMPT)}\n\n${prompt}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return { success: false, error: "Unexpected response type" };
    }

    const parsed = JSON.parse(content.text);
    const validated = ExplanationSchema.parse(parsed);

    return { success: true, data: validated };
  } catch (error) {
    console.error("generateMatchExplanation error:", error);
    return generateMockMatchExplanation(input);
  }
}

// ====================
// Mock Explanations (Fallback for Demo)
// ====================

function generateMockTeamExplanation(input: TeamExplanationInput): { success: true; data: TeamExplanationOutput } {
  const coveragePct = Math.round(input.requiredSkillCoverage * 100);
  const availPct = Math.round(input.sharedAvailability * 100);
  const compPct = Math.round(input.skillComplementarity * 100);

  const whyThisTeam = [
    `Team covers ${coveragePct}% of required skills (${input.coveredRequiredSkills.join(", ")} of ${input.totalRequired}) with zero redundancy`,
    `${availPct}% shared availability (${input.sharedHours} hrs/week overlap across meeting days)`,
    `Skill complementarity: ${compPct}% — each member brings unique required capabilities`,
  ];

  let whyNotRunnerUp = "Runner-up had lower overall team score";
  if (input.runnerUpScore !== undefined && input.runnerUpUncovered && input.runnerUpUncovered.length > 0) {
    whyNotRunnerUp = `Runner-up (score ${input.runnerUpScore}/100) had ${Math.round((input.runnerUpCoverage || 0) * 100)}% coverage but lacked: ${input.runnerUpUncovered.join(", ")}`;
  }

  const skillGap = input.uncoveredRequiredSkills.length > 0
    ? `Missing required skills: ${input.uncoveredRequiredSkills.join(", ")} — consider adding a specialist`
    : undefined;

  return {
    success: true,
    data: { whyThisTeam, whyNotRunnerUp, skillGap },
  };
}

function generateMockMatchExplanation(input: MatchExplanationInput): { success: true; data: ExplanationOutput } {
  const reasons: string[] = [];

  if (input.skillCoverage > 0.7) {
    reasons.push(`${input.userName} covers ${Math.round(input.skillCoverage * 100)}% of required skills for ${input.projectTitle}`);
  }
  if (input.availabilityOverlap > 0.7) {
    reasons.push(`${Math.round(input.availabilityOverlap * 100)}% availability overlap with project schedule`);
  }
  if (input.experienceFit > 0.7) {
    reasons.push("Experience level matches project complexity");
  }
  if (input.interestAlignment > 0.5) {
    reasons.push("Strong interest alignment with project domain");
  }

  const gap = input.skillCoverage < 0.5
    ? `Only ${Math.round(input.skillCoverage * 100)}% skill coverage — significant gaps in required skills`
    : input.availabilityOverlap < 0.5
    ? `Low availability overlap (${Math.round(input.availabilityOverlap * 100)}%) — may not meet team schedule`
    : undefined;

  return {
    success: true,
    data: { reasons: reasons.slice(0, 2), gap },
  };
}