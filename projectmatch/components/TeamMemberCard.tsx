"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, Briefcase, Clock, Star, Brain } from "lucide-react";
import type { Candidate, ProjectRequirement, Skill } from "@/types";

interface TeamMemberCardProps {
  member: Candidate;
  index: number;
  requirements: ProjectRequirement;
  teamSkills: string[];
}

export function TeamMemberCard({ member, index, requirements, teamSkills }: TeamMemberCardProps) {
  // Calculate unique contributions
  const requiredSkills = requirements.requiredSkills;
  const memberSkillNames = member.skills.map((s) => s.name.toLowerCase());

  // Skills this member uniquely covers (no one else on team has)
  const uniqueCoveredSkills = requiredSkills.filter(
    (skill) =>
      memberSkillNames.includes(skill.toLowerCase()) &&
      teamSkills.filter((s) => s.toLowerCase() === skill.toLowerCase()).length === 1
  );

  // Skills this member covers (shared with others)
  const sharedCoveredSkills = requiredSkills.filter(
    (skill) =>
      memberSkillNames.includes(skill.toLowerCase()) &&
      teamSkills.filter((s) => s.toLowerCase() === skill.toLowerCase()).length > 1
  );

  // Nice-to-have skills covered
  const niceToHaveCovered = requirements.niceToHaveSkills.filter(
    (skill) => memberSkillNames.includes(skill.toLowerCase())
  );

  // Total required skills this member contributes to
  const totalContributed = uniqueCoveredSkills.length + sharedCoveredSkills.length;

  // Availability overlap
  const memberDays = member.availability.days;
  const projectDays = requirements.schedule?.meetingDays || [];
  const dayOverlap = memberDays.filter((d) => projectDays.includes(d)).length;
  const maxDays = Math.max(projectDays.length, 1);
  const availabilityScore = dayOverlap / maxDays;

  // Experience level numeric
  const expLevel = member.experience.level === "senior" ? 3 : member.experience.level === "mid" ? 2 : 1;

  return (
    <Card className="border-neutral-200 dark:border-neutral-700">
      <CardContent className="pt-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {index + 1}
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-50">{member.name}</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{member.experience.primaryRole}</p>
            </div>
          </div>
          <Badge variant="success" className="capitalize">{member.experience.level}</Badge>
        </div>

        {/* Unique Contributions */}
        {uniqueCoveredSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Unique Contributions ({uniqueCoveredSkills.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {uniqueCoveredSkills.map((skill) => (
                <Badge key={skill} variant="success" className="text-xs gap-1">
                  {skill}
                  <CheckCircle className="h-2.5 w-2.5" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Shared Contributions */}
        {sharedCoveredSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Shared Skills ({sharedCoveredSkills.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {sharedCoveredSkills.map((skill) => (
                <Badge key={skill} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Nice-to-Have */}
        {niceToHaveCovered.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Nice-to-Have ({niceToHaveCovered.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {niceToHaveCovered.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* All Skills Summary */}
        <div className="mb-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">All Skills</p>
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 8).map((skill) => (
              <Badge key={skill.name} variant="outline" className="text-xs">
                {skill.name} ({skill.level}/5)
              </Badge>
            ))}
            {member.skills.length > 8 && (
              <Badge variant="outline" className="text-xs text-neutral-500">
                +{member.skills.length - 8} more
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{uniqueCoveredSkills.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Unique</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalContributed}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Required</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(availabilityScore * 100)}%
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Avail</p>
          </div>
        </div>

        {/* Availability Detail */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Available: {formatDays(member.availability.days)} {formatHours(member.availability.hours)} {member.availability.timezone}
          </p>
          <Progress value={Math.round(availabilityScore * 100)} className="h-1.5" />
        </div>

        {/* Experience */}
        <div className="mt-2">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {member.experience.projectsShipped} projects shipped • {member.experience.level} ({expLevel}/3)
          </p>
          <Progress value={Math.round((expLevel / 3) * 100)} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatDays(days: string[]): string {
  const dayNames: Record<string, string> = {
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  };
  return days.map((d) => dayNames[d] || d).join(", ");
}

function formatHours(hours: string): string {
  const [start, end] = hours.split("-").map(Number);
  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return "12 AM";
    if (h === 12) return "12 PM";
    if (h > 12) return `${h - 12} PM`;
    return `${h} AM`;
  };
  return `${formatHour(start)} - ${formatHour(end)}`;
}