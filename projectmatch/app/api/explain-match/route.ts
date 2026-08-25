// POST /api/explain-match - Generate individual match explanation from factors

import { NextRequest, NextResponse } from "next/server";
import { generateMatchExplanation } from "@/lib/ai";

interface MatchExplanationRequest {
  userName: string;
  projectTitle: string;
  skillCoverage: number;
  availabilityOverlap: number;
  experienceFit: number;
  interestAlignment: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MatchExplanationRequest;
    const { userName, projectTitle, skillCoverage, availabilityOverlap, experienceFit, interestAlignment } = body;

    if (!userName || !projectTitle) {
      return NextResponse.json(
        { success: false, error: "userName and projectTitle are required" },
        { status: 400 }
      );
    }

    const explanation = await generateMatchExplanation({
      userName,
      projectTitle,
      skillCoverage,
      availabilityOverlap,
      experienceFit,
      interestAlignment,
    });

    if (!explanation.success) {
      return NextResponse.json(
        { success: false, error: explanation.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: explanation.data });
  } catch (error) {
    console.error("explain-match API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}