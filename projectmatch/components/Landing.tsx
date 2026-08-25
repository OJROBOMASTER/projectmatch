"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, Brain, Target, ArrowRight, CheckCircle } from "lucide-react";
import { SEEDED_CANDIDATES } from "@/lib/seed";
import { selectDemoProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function Landing() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const handleDemoSelect = (candidateId: string) => {
    const profile = selectDemoProfile(candidateId);
    if (profile) {
      window.location.href = "/dashboard/build";
    }
  };

  const handleCustomProfile = () => {
    window.location.href = "/profile/wizard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="h-4 w-4" />
              <span>Prompt Wars 2026 — ProjectMatch</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
              Build the right team,<br />
              <span className="text-primary">not just find the right person</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-10">
              Describe your project in plain English. Our deterministic AI composes the optimal team
              from a candidate pool — maximizing skill coverage, minimizing redundancy, and ensuring
              real availability overlap. Transparent scoring. Explainable results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={handleCustomProfile} className="w-full sm:w-auto">
                Create My Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => window.location.href = "/dashboard/build"} className="w-full sm:w-auto">
                Try Demo Mode
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">8</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Pre-seeded Candidates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">4</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Sample Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">210</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Team Combinations Evaluated</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-50 mb-12">
            How ProjectMatch Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">1. Describe Your Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  Paste a natural language description. AI extracts roles, required skills, timeline,
                  commitment level, and desired team size.
                </p>
              </CardContent>
            </Card>
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">2. Compose Optimal Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  Deterministic algorithm evaluates all combinations (210 for team of 4 from 8 candidates).
                  Scores based on coverage, complementarity, availability, experience, and interest fit.
                </p>
              </CardContent>
            </Card>
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">3. Understand Why</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400 text-center">
                  Get factual AI explanations: team coverage %, shared availability hours, why this team
                  beats the runner-up, and any remaining skill gaps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Candidates */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Try with a Pre-seeded Candidate
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Pick a persona to instantly access the Team Composer. Each has realistic skills,
              availability, and experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEEDED_CANDIDATES.map((candidate) => (
              <Card
                key={candidate.id}
                className={cn(
                  "border-neutral-200 dark:border-neutral-700 hover:border-primary/50 transition-colors cursor-pointer",
                  selectedCandidate === candidate.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => {
                  setSelectedCandidate(candidate.id);
                  handleDemoSelect(candidate.id);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {candidate.experience.primaryRole}
                      </p>
                    </div>
                    <Badge variant="success">{candidate.experience.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500 mb-1">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill.name} variant="outline" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Available {formatDays(candidate.availability.days)} {formatHours(candidate.availability.hours)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={handleCustomProfile} className="w-full sm:w-auto">
              Or Create Your Own Profile
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>ProjectMatch — Built for Prompt Wars 2026</p>
          <p className="mt-1">No auth • No database • Deterministic matching • Explainable AI</p>
        </div>
      </footer>
    </div>
  );
}

// Helper functions (duplicate from utils to avoid client/server issues)
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

function formatDays(days: string[]): string {
  const dayNames: Record<string, string> = {
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  };
  return days.map((d) => dayNames[d] || d).join(", ");
}