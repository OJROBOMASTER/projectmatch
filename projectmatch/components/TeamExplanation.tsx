"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Brain, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamComposition, ProjectRequirement, ProjectBriefSchema } from "@/types";

interface TeamExplanationProps {
  team: TeamComposition;
  runnerUp: TeamComposition | null;
  requirements: ProjectRequirement;
  brief: ProjectBriefSchema;
  type: "why-this" | "why-not-runner";
}

export function TeamExplanation({ team, runnerUp, requirements, brief, type }: TeamExplanationProps) {
  const [explanation, setExplanation] = useState<{
    whyThisTeam: string[];
    whyNotRunnerUp: string;
    skillGap?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateFallbackExplanation = useCallback(() => {
    const metrics = team.metrics;
    const uncoveredSkills = metrics.uncoveredRequiredSkills;
    const coveredSkills = metrics.coveredRequiredSkills;

    if (type === "why-this") {
      const reasons: string[] = [];

      if (metrics.requiredSkillCoverage === 1) {
        reasons.push(`Team covers all ${requirements.requiredSkills.length} required skills with zero gaps.`);
      } else {
        reasons.push(`Team covers ${coveredSkills.length} of ${requirements.requiredSkills.length} required skills (${Math.round(metrics.requiredSkillCoverage * 100)}%).`);
      }

      if (metrics.skillComplementarity > 0.8) {
        reasons.push("Excellent skill complementarity — minimal redundancy across team members.");
      } else if (metrics.skillComplementarity > 0.5) {
        reasons.push("Good skill complementarity with some overlapping capabilities.");
      }

      if (metrics.sharedAvailability > 0.7) {
        const overlapHours = Math.round(metrics.sharedAvailability * (requirements.schedule?.requiredHours || 20));
        reasons.push(`${overlapHours} hrs/week shared availability across ${requirements.schedule?.meetingDays?.join(", ") || "meeting days"}.`);
      }

      if (metrics.experienceFit > 0.7) {
        reasons.push("Strong experience fit for project complexity.");
      }

      if (metrics.interestAlignment > 0.5) {
        reasons.push("Good interest alignment with project domain.");
      }

      return {
        whyThisTeam: reasons,
        whyNotRunnerUp: "",
        skillGap: uncoveredSkills.length > 0 ? `Missing: ${uncoveredSkills.join(", ")}` : undefined,
      };
    } else {
      if (!runnerUp) {
        return {
          whyThisTeam: [],
          whyNotRunnerUp: "No runner-up team available for comparison.",
        };
      }

      const runnerMetrics = runnerUp.metrics;
      const scoreDiff = metrics.teamScore - runnerMetrics.teamScore;
      const reasons: string[] = [];

      if (runnerMetrics.requiredSkillCoverage < metrics.requiredSkillCoverage) {
        const missing = requirements.requiredSkills.length - Math.round(runnerMetrics.requiredSkillCoverage * requirements.requiredSkills.length);
        reasons.push(`Runner-up covers ${missing} fewer required skills.`);
      }

      if (runnerMetrics.skillComplementarity < metrics.skillComplementarity) {
        reasons.push("Runner-up has more redundant skills — less complementary team composition.");
      }

      if (runnerMetrics.sharedAvailability < metrics.sharedAvailability) {
        reasons.push("Runner-up has significantly less shared availability.");
      }

      if (runnerMetrics.experienceFit < metrics.experienceFit) {
        reasons.push("Runner-up experience level less suited to project complexity.");
      }

      return {
        whyThisTeam: [],
        whyNotRunnerUp: reasons.join(" ") || `Runner-up scored ${Math.round(scoreDiff)} points lower on team metrics.`,
      };
    }
  }, [team, runnerUp, requirements, type]);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);

      // Gracefully handle missing brief
      if (!brief) {
        setError("Project brief not available. Using fallback explanation.");
        setExplanation(generateFallbackExplanation());
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/explain-team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brief,
            team,
            runnerUp,
            requirements,
            type,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setExplanation(data.data);
        } else {
          setError(data.error || "Failed to generate explanation");
        }
      } catch {
        setError("Network error. Using fallback explanation.");
        setExplanation(generateFallbackExplanation());
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [team, runnerUp, requirements, brief, type, generateFallbackExplanation]);

  if (isLoading) {
    return (
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardContent className="pt-0 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-neutral-500 dark:text-neutral-400">Generating explanation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !explanation) {
    return (
      <Card className="border-neutral-200 dark:border-neutral-700 border-red-200 dark:border-red-800">
        <CardContent className="pt-0 py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!explanation) {
    return null;
  }

  if (type === "why-this") {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 dark:border-neutral-700 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Sparkles className="h-5 w-5" />
              Why This Team?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {explanation.whyThisTeam.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-800 dark:text-green-200">{reason}</p>
                </div>
              ))}
            </div>
            {explanation.skillGap && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span><strong>Skill Gap:</strong> {explanation.skillGap}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Team Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <MetricBreakdown
                label="Required Skills"
                score={Math.round(team.metrics.requiredSkillCoverage * 100)}
                weight="35%"
                color="green"
              />
              <MetricBreakdown
                label="Complementarity"
                score={Math.round(team.metrics.skillComplementarity * 100)}
                weight="20%"
                color="blue"
              />
              <MetricBreakdown
                label="Availability"
                score={Math.round(team.metrics.sharedAvailability * 100)}
                weight="20%"
                color="purple"
              />
              <MetricBreakdown
                label="Experience Fit"
                score={Math.round(team.metrics.experienceFit * 100)}
                weight="10%"
                color="orange"
              />
              <MetricBreakdown
                label="Interest Alignment"
                score={Math.round(team.metrics.interestAlignment * 100)}
                weight="10%"
                color="pink"
              />
              <MetricBreakdown
                label="Size Fit"
                score={Math.round(team.metrics.sizeFit * 100)}
                weight="5%"
                color="gray"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-lg font-bold">
                Composite Score: <span className="text-primary">{team.metrics.teamScore}/100</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return (
      <Card className="border-neutral-200 dark:border-neutral-700 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <TrendingDown className="h-5 w-5" />
            Why Not Runner-Up?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {explanation.whyNotRunnerUp.split(". ").filter(Boolean).map((reason, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200">{reason}.</p>
              </div>
            ))}
          </div>

          {runnerUp && (
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <h5 className="font-medium mb-3">Runner-Up Team Score: {runnerUp.metrics.teamScore}/100</h5>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MetricComparison
                  label="Required Skills"
                  best={Math.round(team.metrics.requiredSkillCoverage * 100)}
                  runner={Math.round(runnerUp.metrics.requiredSkillCoverage * 100)}
                />
                <MetricComparison
                  label="Complementarity"
                  best={Math.round(team.metrics.skillComplementarity * 100)}
                  runner={Math.round(runnerUp.metrics.skillComplementarity * 100)}
                />
                <MetricComparison
                  label="Availability"
                  best={Math.round(team.metrics.sharedAvailability * 100)}
                  runner={Math.round(runnerUp.metrics.sharedAvailability * 100)}
                />
                <MetricComparison
                  label="Experience Fit"
                  best={Math.round(team.metrics.experienceFit * 100)}
                  runner={Math.round(runnerUp.metrics.experienceFit * 100)}
                />
                <MetricComparison
                  label="Interest Alignment"
                  best={Math.round(team.metrics.interestAlignment * 100)}
                  runner={Math.round(runnerUp.metrics.interestAlignment * 100)}
                />
                <MetricComparison
                  label="Size Fit"
                  best={Math.round(team.metrics.sizeFit * 100)}
                  runner={Math.round(runnerUp.metrics.sizeFit * 100)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

interface MetricBreakdownProps {
  label: string;
  score: number;
  weight: string;
  color: "green" | "blue" | "purple" | "orange" | "pink" | "gray";
}

const colorMap = {
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  gray: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

function MetricBreakdown({ label, score, weight, color }: MetricBreakdownProps) {
  return (
    <div className={cn("p-3 rounded-lg", colorMap[color])}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold">{score}%</span>
        <span className="text-xs opacity-70">({weight} weight)</span>
      </div>
    </div>
  );
}

interface MetricComparisonProps {
  label: string;
  best: number;
  runner: number;
}

function MetricComparison({ label, best, runner }: MetricComparisonProps) {
  const diff = best - runner;
  return (
    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-lg font-bold text-green-600 dark:text-green-400">{best}%</span>
        <span className="text-neutral-400">vs</span>
        <span className="text-lg font-medium text-red-600 dark:text-red-400">{runner}%</span>
        {diff > 0 && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">(+{diff}%)</span>
        )}
      </div>
    </div>
  );
}