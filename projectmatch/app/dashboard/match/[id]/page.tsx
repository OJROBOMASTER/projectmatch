"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Brain, Users, Clock, Briefcase, Heart, Target, Sparkles, AlertTriangle } from "lucide-react";
import { cn, formatScore, getScoreColor } from "@/lib/utils";
import { SEEDED_PROJECTS } from "@/lib/seed";
import { computeFactors, scoreMatch, type MatchFactors } from "@/lib/matching";
import { getActiveProfile } from "@/lib/storage";
import type { Candidate } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MatchDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [project, setProject] = useState<typeof SEEDED_PROJECTS[0] | null>(null);
  const [factors, setFactors] = useState<MatchFactors | null>(null);
  const [score, setScore] = useState(0);
  const [reasoning, setReasoning] = useState<{ reasons: string[]; gap?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reasoningLoading, setReasoningLoading] = useState(false);

  useEffect(() => {
    const activeProfile = getActiveProfile();
    const foundProject = SEEDED_PROJECTS.find((p) => p.id === projectId);

    if (activeProfile && foundProject) {
      setProfile(activeProfile);
      setProject(foundProject);
      const computedFactors = computeFactors(activeProfile, foundProject);
      setFactors(computedFactors);
      setScore(scoreMatch(computedFactors));
      fetchReasoning(activeProfile, foundProject, computedFactors);
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchReasoning = async (userProfile: Candidate, proj: typeof SEEDED_PROJECTS[0], matchFactors: MatchFactors) => {
    setReasoningLoading(true);
    try {
      const response = await fetch("/api/explain-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          project: proj,
          factors: matchFactors,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReasoning(data.data);
      } else {
        // Fallback
        setReasoning({
          reasons: [
            `You have ${Math.round(matchFactors.skillCoverage * 100)}% skill coverage for this project`,
            `Availability overlap: ${Math.round(matchFactors.availabilityOverlap * 100)}%`,
            `Experience fit: ${Math.round(matchFactors.experienceFit * 100)}%`,
            `Interest alignment: ${Math.round(matchFactors.interestAlignment * 100)}%`,
          ],
          gap: matchFactors.skillCoverage < 1 ? "Some required skills not in your profile" : undefined,
        });
      }
    } catch (error) {
      console.error("Failed to get reasoning:", error);
    } finally {
      setReasoningLoading(false);
      setIsLoading(false);
    }
  };

  if (isLoading || !project || !profile || !factors) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const brief = project.brief;
  const requiredSkills = brief.neededRoles.flatMap((r) => r.requiredSkills);
  const userSkillNames = profile.skills.map((s) => s.name.toLowerCase());
  const matchedSkills = requiredSkills.filter((s) => userSkillNames.includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !userSkillNames.includes(s.toLowerCase()));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back Button */}
      <Link href="/dashboard/find" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{brief.title}</CardTitle>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">{brief.description}</p>
            </div>
            <div className={cn("text-4xl font-bold", getScoreColor(score))}>{score}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <FactorBadge label="Skills" value={Math.round(factors.skillCoverage * 100)} color="blue" icon={Brain} />
            <FactorBadge label="Availability" value={Math.round(factors.availabilityOverlap * 100)} color="purple" icon={Clock} />
            <FactorBadge label="Experience" value={Math.round(factors.experienceFit * 100)} color="orange" icon={Briefcase} />
            <FactorBadge label="Interests" value={Math.round(factors.interestAlignment * 100)} color="pink" icon={Heart} />
          </div>
        </CardContent>
      </Card>

      {/* Factor Breakdown */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Match Factor Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <FactorDetail label="Skill Coverage" value={factors.skillCoverage} weight="40%" detail={`${matchedSkills.length} of ${requiredSkills.length} required skills matched`} />
          <FactorDetail label="Availability Overlap" value={factors.availabilityOverlap} weight="25%" detail={`${Math.round(factors.availabilityOverlap * 20)} hrs/week shared`} />
          <FactorDetail label="Experience Fit" value={factors.experienceFit} weight="20%" detail={`Your level: ${profile.experience.level} • Projects: ${profile.experience.projectsShipped}`} />
          <FactorDetail label="Interest Alignment" value={factors.interestAlignment} weight="15%" detail={`${Math.round(factors.interestAlignment * 100)}% overlap with project domain`} />
        </CardContent>
      </Card>

      {/* Skills Detail */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Skills Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {matchedSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Matching Skills ({matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Missing Required Skills ({missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">All Your Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill.name} variant="outline" className="text-xs">
                  {skill.name} ({skill.level}/5)
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Requirements */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Project Requirements</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Team Size</p>
              <p className="text-lg font-semibold">{brief.desiredTeamSize} people</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Timeline</p>
              <p className="text-lg font-semibold">{brief.timeline.weeks} weeks</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Commitment</p>
              <p className="text-lg font-semibold capitalize">{brief.commitment}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Domain</p>
              <p className="text-lg font-semibold">{brief.domain.join(", ")}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Required Roles</p>
            <div className="space-y-2">
              {brief.neededRoles.map((role, i) => (
                <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="font-medium">{role.title} ×{role.count}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Required: {role.requiredSkills.join(", ")}
                    {role.niceToHaveSkills.length > 0 && ` • Nice: ${role.niceToHaveSkills.join(", ")}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Reasoning */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Why This Match?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {reasoningLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reasoning ? (
            <div className="space-y-3">
              {reasoning.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-800 dark:text-green-200">{reason}</p>
                </div>
              ))}
              {reasoning.gap && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span><strong>Watch out:</strong> {reasoning.gap}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">No reasoning available</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button className="flex-1 gap-2">
          <CheckCircle className="h-4 w-4" />
          Express Interest
        </Button>
      </div>
    </div>
  );
}

interface FactorBadgeProps {
  label: string;
  value: number;
  color: "blue" | "purple" | "orange" | "pink";
  icon: React.ElementType;
}

const badgeColors = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
};

function FactorBadge({ label, value, color, icon: Icon }: FactorBadgeProps) {
  return (
    <div className={cn("p-3 rounded-lg text-center", badgeColors[color])}>
      <Icon className="h-5 w-5 mx-auto mb-1" />
      <p className="text-2xl font-bold">{value}%</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

interface FactorDetailProps {
  label: string;
  value: number;
  weight: string;
  detail: string;
}

function FactorDetail({ label, value, weight, detail }: FactorDetailProps) {
  return (
    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Weight: {weight}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{Math.round(value * 100)}%</p>
        </div>
      </div>
      <Progress value={Math.round(value * 100)} className="h-1.5 mt-2" />
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{detail}</p>
    </div>
  );
}

