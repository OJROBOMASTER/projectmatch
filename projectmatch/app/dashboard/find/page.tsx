"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Target, CheckCircle, XCircle, ArrowRight, Brain, Users, Clock, Briefcase, Heart, AlertTriangle } from "lucide-react";
import { cn, formatScore, getScoreColor } from "@/lib/utils";
import { SEEDED_CANDIDATES, SEEDED_PROJECTS } from "@/lib/seed";
import { scoreMatch, computeFactors, type MatchFactors } from "@/lib/matching";
import type { Candidate, StoredProject } from "@/types";
import { getActiveProfile } from "@/lib/storage";

interface MatchCardProps {
  project: StoredProject;
  score: number;
  factors: MatchFactors;
  profile: Candidate;
  onMatch: (project: StoredProject) => void;
  onPass: (project: StoredProject) => void;
  onViewReasoning: (project: StoredProject) => void;
}

function MatchCard({ project, score, factors, profile, onMatch, onPass, onViewReasoning }: MatchCardProps) {
  const brief = project.brief;
  const requiredSkills = brief.neededRoles.flatMap((r) => r.requiredSkills);

  // Find which of user's skills match
  const userSkillNames = profile.skills.map((s) => s.name.toLowerCase());
  const matchedSkills = requiredSkills.filter((s) => userSkillNames.includes(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !userSkillNames.includes(s.toLowerCase()));

  return (
    <Card className="border-neutral-200 dark:border-neutral-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{brief.title}</CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{brief.description.slice(0, 100)}...</p>
          </div>
          <div className={cn("text-2xl font-bold", getScoreColor(score))}>{score}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Factor Breakdown */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{Math.round(factors.skillCoverage * 100)}%</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Skills</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{Math.round(factors.availabilityOverlap * 100)}%</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Availability</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{Math.round(factors.experienceFit * 100)}%</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Experience</p>
          </div>
          <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
            <p className="text-lg font-bold text-pink-600 dark:text-pink-400">{Math.round(factors.interestAlignment * 100)}%</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Interests</p>
          </div>
        </div>

        <Separator />

        {/* Matched/Missing Skills */}
        <div className="space-y-3">
          {matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Your Matching Skills ({matchedSkills.length}/{requiredSkills.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.slice(0, 6).map((skill) => (
                  <Badge key={skill} variant="success" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {matchedSkills.length > 6 && (
                  <Badge variant="outline" className="text-xs">+{matchedSkills.length - 6} more</Badge>
                )}
              </div>
            </div>
          )}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Missing Required Skills ({missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {missingSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="destructive" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {missingSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{missingSkills.length - 4} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Project Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {brief.desiredTeamSize} person team
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {brief.timeline.weeks} weeks
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {brief.commitment}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => onPass(project)} className="flex-1 gap-1">
            <XCircle className="h-4 w-4" />
            Pass
          </Button>
          <Button onClick={() => onMatch(project)} className="flex-1 gap-1">
            <CheckCircle className="h-4 w-4" />
            Match
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onViewReasoning(project)} className="h-10 w-10">
            <Brain className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FindProjectPage() {
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [matches, setMatches] = useState<Array<{ project: StoredProject; score: number; factors: MatchFactors }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showReasoning, setShowReasoning] = useState<StoredProject | null>(null);
  const [reasoning, setReasoning] = useState<{ reasons: string[]; gap?: string } | null>(null);
  const [reasoningLoading, setReasoningLoading] = useState(false);

  useEffect(() => {
    const activeProfile = getActiveProfile();
    if (activeProfile) {
      setProfile(activeProfile);
      computeMatches(activeProfile);
    }
  }, []);

  const computeMatches = (userProfile: Candidate) => {
    const scoredMatches = SEEDED_PROJECTS.map((project) => {
      const factors = computeFactors(userProfile, project);
      const score = scoreMatch(factors);
      return { project, score, factors };
    });

    // Sort by score descending
    scoredMatches.sort((a, b) => b.score - a.score);
    setMatches(scoredMatches);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  const handleMatch = (project: StoredProject) => {
    // In a real app, this would save to localStorage
    alert(`Matched with "${project.brief.title}"! In a full app, this would notify the project owner.`);
    nextCard();
  };

  const handlePass = (project: StoredProject) => {
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleViewReasoning = async (project: StoredProject) => {
    setShowReasoning(project);
    setReasoningLoading(true);

    try {
      const matchData = matches.find((m) => m.project.id === project.id);
      if (!matchData) return;

      const response = await fetch("/api/explain-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          project,
          factors: matchData.factors,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReasoning(data.data);
      } else {
        // Fallback
        setReasoning({
          reasons: [
            `You have ${matchData.factors.skillCoverage * 100}% skill coverage for this project`,
            `Availability overlap: ${matchData.factors.availabilityOverlap * 100}%`,
            `Experience fit: ${matchData.factors.experienceFit * 100}%`,
          ],
          gap: matchData.factors.skillCoverage < 1 ? "Some required skills not in your profile" : undefined,
        });
      }
    } catch (error) {
      console.error("Failed to get reasoning:", error);
    } finally {
      setReasoningLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Find Project</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Swipe through projects that match your skills. {matches.length} projects found.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span>{currentIndex + 1} / {matches.length}</span>
        </div>
      </div>

      {/* Profile Summary */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {profile.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{profile.name}</p>
                <p className="text-sm text-neutral-500">{profile.experience.primaryRole} • {profile.experience.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" />
                {profile.skills.length} skills
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Cards Stack */}
      {matches.length === 0 ? (
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardContent className="pt-0 py-12 text-center">
            <Target className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">No Projects Found</h3>
            <p className="text-neutral-500 dark:text-neutral-400">No projects match your profile at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Stack of cards (show next 2 behind) */}
          {[currentIndex + 1, currentIndex + 2].filter((i) => i < matches.length).map((i, idx) => (
            <div
              key={matches[i].project.id}
              className="absolute inset-0 -z-10 opacity-0 transition-opacity"
              style={{
                transform: `translateY(${-(idx + 1) * 8}px) scale(${1 - (idx + 1) * 0.02})`,
                opacity: 0.3 - idx * 0.1,
              }}
            >
              <MatchCard
                project={matches[i].project}
                score={matches[i].score}
                factors={matches[i].factors}
                profile={profile}
                onMatch={handleMatch}
                onPass={handlePass}
                onViewReasoning={handleViewReasoning}
              />
            </div>
          ))}

          {/* Current Card */}
          <MatchCard
            project={currentMatch.project}
            score={currentMatch.score}
            factors={currentMatch.factors}
            profile={profile}
            onMatch={handleMatch}
            onPass={handlePass}
            onViewReasoning={handleViewReasoning}
          />
        </div>
      )}

      {/* End of Stack */}
      {currentIndex >= matches.length - 1 && matches.length > 0 && (
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardContent className="pt-0 py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">You've seen all projects!</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Check back later for new opportunities.</p>
            <Button variant="outline" onClick={() => setCurrentIndex(0)}>
              <ArrowRight className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reasoning Modal */}
      {showReasoning && reasoning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Why This Match?</CardTitle>
              <CardDescription>{showReasoning.brief.title}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {reasoningLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {reasoning.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800 dark:text-green-200">{reason}</p>
                      </div>
                    ))}
                  </div>
                  {reasoning.gap && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span><strong>Watch out:</strong> {reasoning.gap}</span>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowReasoning(null)} className="flex-1">
                      Close
                    </Button>
                    <Button onClick={() => { handleMatch(showReasoning!); setShowReasoning(null); }} className="flex-1">
                      Match
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}