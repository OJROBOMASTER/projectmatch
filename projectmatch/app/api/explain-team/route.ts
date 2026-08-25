// POST /api/explain-team - Generate team explanation from deterministic metrics

import { NextRequest, NextResponse } from "next/server";
import { generateTeamExplanation } from "@/lib/ai";
import { composeOptimalTeam, evaluateTeam } from "@/lib/teamComposition";
import { SEEDED_CANDIDATES } from "@/lib/seed";
import { briefToRequirement } from "@/lib/seed";
import type { TeamExplanationInput } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brief, projectId } = body;

    if (!brief) {
      return NextResponse.json(
        { success: false, error: "Brief is required" },
        { status: 400 }
      );
    }

    // Convert brief to requirement
    const requirement = briefToRequirement(brief);

    // Compose optimal team to get metrics
    const result = composeOptimalTeam(SEEDED_CANDIDATES, requirement);
    const bestTeam = result.bestTeam;
    const runnerUp = result.runnerUp;

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
      runnerUpScore: runnerUp?.metrics.teamScore,
      runnerUpCoverage: runnerUp?.metrics.requiredSkillCoverage,
      runnerUpUncovered: runnerUp?.metrics.uncoveredRequiredSkills,
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
        runnerUpMetrics: runnerUp?.metrics || null,
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