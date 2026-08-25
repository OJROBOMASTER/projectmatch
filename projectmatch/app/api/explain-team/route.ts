// POST /api/explain-team - Generate team explanation from deterministic metrics

import { NextRequest, NextResponse } from "next/server";
import { generateTeamExplanation } from "@/lib/ai";
import { composeOptimalTeam } from "@/lib/teamComposition";
import { SEEDED_CANDIDATES } from "@/lib/seed";
import { briefToRequirement } from "@/lib/seed";
import type { TeamExplanationInput } from "@/lib/ai";
import type { TeamComposition, ProjectRequirement } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brief, team, runnerUp, requirements } = body;

    if (!brief) {
      return NextResponse.json(
        { success: false, error: "Brief is required" },
        { status: 400 }
      );
    }

    // Use provided team data if available, otherwise compose from brief
    let bestTeam: TeamComposition;
    let runnerUpTeam: TeamComposition | null = runnerUp || null;
    let requirement: ProjectRequirement;

    if (team && requirements) {
      // Use pre-computed team from client (faster, more consistent)
      bestTeam = team as TeamComposition;
      requirement = requirements as ProjectRequirement;
    } else {
      // Fallback: compose from brief (backward compatibility)
      requirement = briefToRequirement(brief);
      const result = composeOptimalTeam(SEEDED_CANDIDATES, requirement);
      bestTeam = result.bestTeam;
      runnerUpTeam = result.runnerUp;
    }

    // Prepare input for AI explanation
    const input: TeamExplanationInput = {
      requiredSkillCoverage: bestTeam.metrics.requiredSkillCoverage,
      coveredRequiredSkills: bestTeam.metrics.coveredRequiredSkills,
      totalRequired: requirement.requiredSkills.length,
      sharedAvailability: bestTeam.metrics.sharedAvailability,
      sharedHours: Math.round(bestTeam.metrics.sharedAvailability * (requirement.commitment === "high" ? 20 : requirement.commitment === "medium" ? 10 : 5)),
      skillComplementarity: bestTeam.metrics.skillComplementarity,
      redundantPairs: Math.round((1 - bestTeam.metrics.skillComplementarity) * (bestTeam.members.length * (bestTeam.members.length - 1)) / 2),
      totalPairs: (bestTeam.members.length * (bestTeam.members.length - 1)) / 2,
      experienceFit: bestTeam.metrics.experienceFit,
      interestAlignment: bestTeam.metrics.interestAlignment,
      sizeFit: bestTeam.metrics.sizeFit,
      teamScore: bestTeam.metrics.teamScore,
      uncoveredRequiredSkills: bestTeam.metrics.uncoveredRequiredSkills,
      runnerUpScore: runnerUpTeam?.metrics.teamScore,
      runnerUpCoverage: runnerUpTeam?.metrics.requiredSkillCoverage,
      runnerUpUncovered: runnerUpTeam?.metrics.uncoveredRequiredSkills,
    };

    const explanation = await generateTeamExplanation(input);

    if (!explanation.success) {
      return NextResponse.json(
        { success: false, error: explanation.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        explanation: explanation.data,
        teamMetrics: bestTeam.metrics,
        runnerUpMetrics: runnerUpTeam?.metrics || null,
      },
    });
  } catch (error) {
    console.error("explain-team API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}