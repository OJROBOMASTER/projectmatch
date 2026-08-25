"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Target,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Award,
  Heart,
} from "lucide-react";
import { cn, getScoreColorName, formatScore } from "@/lib/utils";
import type { TeamComposition, ProjectRequirement, ProjectBriefSchema } from "@/types";
import { TeamMemberCard } from "./TeamMemberCard";
import { TeamExplanation } from "./TeamExplanation";

interface TeamResultProps {
  team: TeamComposition;
  runnerUp: TeamComposition | null;
  requirements: ProjectRequirement;
  brief: ProjectBriefSchema;
  onBack: () => void;
  onViewIndividuals: () => void;
}

export function TeamResult({ team, runnerUp, requirements, brief, onBack, onViewIndividuals }: TeamResultProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const metrics = team.metrics;
  const uncoveredSkills = metrics.uncoveredRequiredSkills;
  const coveredSkills = metrics.coveredRequiredSkills;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-sm gap-1">
            <CheckCircle className="h-3 w-3" />
            Team Composed
          </Badge>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Score: {formatScore(metrics.teamScore)}
          </span>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Target}
          label="Required Skill Coverage"
          value={`${coveredSkills.length}/${requirements.requiredSkills.length}`}
          subtitle={`${Math.round(metrics.requiredSkillCoverage * 100)}% covered`}
          color="green"
        />
        <MetricCard
          icon={Users}
          label="Skill Complementarity"
          value={`${Math.round(metrics.skillComplementarity * 100)}%`}
          subtitle="Non-redundant skills"
          color="blue"
        />
        <MetricCard
          icon={Clock}
          label="Shared Availability"
          value={`${Math.round(metrics.sharedAvailability * requirements.schedule?.requiredHours || 20)} hrs/week`}
          subtitle={`${Math.round(metrics.sharedAvailability * 100)}% overlap`}
          color="purple"
        />
        <MetricCard
          icon={TrendingUp}
          label="Team Match Score"
          value={formatScore(metrics.teamScore)}
          subtitle="Collective metrics"
          color={getScoreColorName(metrics.teamScore)}
        />
      </div>

      {/* Skill Coverage Detail */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Required Skills Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {requirements.requiredSkills.map((skill, i) => {
              const isCovered = coveredSkills.includes(skill);
              return (
                <div
                  key={`req-${i}-${skill}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    isCovered ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        isCovered ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      {isCovered ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <XCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{skill}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {isCovered ? (
                      <span>Covered</span>
                    ) : (
                      <span className="text-red-500">Missing</span>
                    )}
                  </div>
                </div>
              );
            })}
            {requirements.niceToHaveSkills.length > 0 && (
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Nice-to-Have Skills</p>
                <div className="flex flex-wrap gap-2">
                  {requirements.niceToHaveSkills.map((skill, i) => {
                    const isCovered = team.members.some((m) =>
                      m.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
                    );
                    return (
                      <Badge
                        key={`nice-${i}-${skill}`}
                        variant={isCovered ? "success" : "outline"}
                        className="text-xs"
                      >
                        {skill} {isCovered && <CheckCircle className="h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({team.members.length}/{requirements.desiredTeamSize})
          </CardTitle>
          <CardDescription>
            Each member&apos;s unique contribution to required skills and team dynamics
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            {team.members.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                requirements={requirements}
                teamSkills={team.members.flatMap((m) => m.skills.map((s) => s.name))}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Explanations */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="why-this">Why This Team?</TabsTrigger>
          <TabsTrigger value="why-not-runner">Why Not Runner-Up?</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {/* Shared Availability */}
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Shared Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Project Required</span>
                    <span className="font-medium">{requirements.schedule?.requiredHours || 20} hrs/week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Team Overlap</span>
                    <span className="font-medium">
                      {Math.round(metrics.sharedAvailability * (requirements.schedule?.requiredHours || 20))} hrs/week
                    </span>
                  </div>
                  <Progress
                    value={Math.round(metrics.sharedAvailability * 100)}
                    className="h-2"
                  />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {metrics.sharedAvailability === 1
                      ? "Perfect availability alignment"
                      : metrics.sharedAvailability > 0.7
                      ? "Good availability overlap"
                      : "Limited shared hours — may need schedule adjustment"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Experience & Interest Fit */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Experience Fit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={Math.round(metrics.experienceFit * 100)} className="h-2 mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {metrics.experienceFit > 0.8
                      ? "Strong experience match for project complexity"
                      : metrics.experienceFit > 0.5
                      ? "Moderate experience fit"
                      : "Consider more experienced members for project complexity"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Interest Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={Math.round(metrics.interestAlignment * 100)} className="h-2 mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {metrics.interestAlignment > 0.6
                      ? "High interest alignment with project domain"
                      : metrics.interestAlignment > 0.3
                      ? "Moderate interest overlap"
                      : "Limited interest alignment — may affect motivation"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Skill Gap */}
            {uncoveredSkills.length > 0 && (
              <Card className="border-neutral-200 dark:border-neutral-700 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <AlertTriangle className="h-5 w-5" />
                    Skill Gap
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-yellow-700 dark:text-yellow-300 mb-3">
                    The following required skills are not covered by this team:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uncoveredSkills.map((skill) => (
                      <Badge key={skill} variant="warning" className="text-xs">
                        {skill} <XCircle className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={onViewIndividuals} className="mt-3">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    View Individual Matches for Missing Skills
                  </Button>
                </CardContent>
              </Card>
            )}

            {uncoveredSkills.length === 0 && (
              <Card className="border-neutral-200 dark:border-neutral-700 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    No Skill Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-green-700 dark:text-green-300">
                    All required skills are fully covered by this team composition.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="why-this">
          <TeamExplanation
            team={team}
            runnerUp={runnerUp}
            requirements={requirements}
            brief={brief}
            type="why-this"
          />
        </TabsContent>

        <TabsContent value="why-not-runner">
          {runnerUp ? (
            <TeamExplanation
              team={team}
              runnerUp={runnerUp}
              requirements={requirements}
              brief={brief}
              type="why-not-runner"
            />
          ) : (
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardContent className="pt-0 text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400">No runner-up team available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Button variant="outline" onClick={onViewIndividuals} className="flex-1 gap-2">
          <Users className="h-4 w-4" />
          View Individual Matches
        </Button>
        <Button onClick={onBack} className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Refine Brief & Re-compose
        </Button>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  color: "green" | "blue" | "purple" | "orange" | "red";
}

const colorClasses = {
  green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
  blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
  orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
  red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
};

function MetricCard({ icon: Icon, label, value, subtitle, color }: MetricCardProps) {
  return (
    <Card className="border-neutral-200 dark:border-neutral-700">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className={cn("text-2xl font-bold", colorClasses[color].replace("bg-", "text-"))}>{value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Award and Heart are already imported above