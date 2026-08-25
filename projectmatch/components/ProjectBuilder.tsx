"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, Edit, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectBriefSchema, NeededRole } from "@/types";

interface ProjectBuilderProps {
  onComposeTeam: (brief: ProjectBriefSchema) => void;
}

interface ExtractBriefResponse {
  success: boolean;
  data?: ProjectBriefSchema;
  error?: string;
  isDemo?: boolean;
}

export function ProjectBuilder({ onComposeTeam }: ProjectBuilderProps) {
  const [description, setDescription] = useState("");
  const [extractedBrief, setExtractedBrief] = useState<ProjectBriefSchema | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const defaultDescription = `Building an autonomous drone delivery system. Need Computer Vision for obstacle detection, Embedded Systems for flight control, Backend for fleet management, UI/UX for operator dashboard. 12 weeks, 20hrs/week, team meets Mon/Wed/Fri 7pm PST. Team of 4.`;

  const [isDemoExtraction, setIsDemoExtraction] = useState(false);

  const handleExtract = async () => {
    if (!description.trim()) return;

    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch("/api/extract-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data: ExtractBriefResponse = await response.json();

      if (data.success && data.data) {
        setExtractedBrief(data.data);
        setIsEditing(true);
        setIsDemoExtraction(data.isDemo || false);
      } else {
        setExtractError(data.error || "Failed to extract brief");
      }
    } catch (error) {
      setExtractError("Network error. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleComposeTeam = () => {
    if (extractedBrief) {
      onComposeTeam(extractedBrief);
    }
  };

  const updateBrief = (updates: Partial<ProjectBriefSchema>) => {
    if (extractedBrief) {
      setExtractedBrief({ ...extractedBrief, ...updates });
    }
  };

  const updateRole = (index: number, updates: Partial<NeededRole>) => {
    if (extractedBrief) {
      const newRoles = [...extractedBrief.neededRoles];
      newRoles[index] = { ...newRoles[index], ...updates };
      setExtractedBrief({ ...extractedBrief, neededRoles: newRoles });
    }
  };

  const addRole = () => {
    if (extractedBrief) {
      setExtractedBrief({
        ...extractedBrief,
        neededRoles: [
          ...extractedBrief.neededRoles,
          { title: "", requiredSkills: [], niceToHaveSkills: [], count: 1 },
        ],
      });
    }
  };

  const removeRole = (index: number) => {
    if (extractedBrief) {
      setExtractedBrief({
        ...extractedBrief,
        neededRoles: extractedBrief.neededRoles.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Natural Language Input */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Describe Your Project</CardTitle>
              <CardDescription>
                Write in plain English. AI will extract roles, skills, timeline, and team size.
              </CardDescription>
            </div>
            {extractedBrief && (
              <div className="flex items-center gap-2">
                {isDemoExtraction && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    Demo extraction
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Extracted
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={defaultDescription}
            className="min-h-[120px] mb-4"
            disabled={isExtracting}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !description.trim()}
              className="gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract with AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setDescription(defaultDescription)}>
              Use Example
            </Button>
          </div>
          {extractError && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
              <X className="h-4 w-4" />
              {extractError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Extracted Brief Preview & Edit */}
      {extractedBrief && (
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Review & Refine Extracted Brief</CardTitle>
                <CardDescription>
                  Verify the AI extraction. Edit any fields before composing your team.
                </CardDescription>
              </div>
              {isDemoExtraction && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Demo extraction
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="brief-title">Project Title</Label>
                <input
                  id="brief-title"
                  type="text"
                  value={extractedBrief.title}
                  onChange={(e) => updateBrief({ title: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="brief-team-size">Desired Team Size</Label>
                <select
                  id="brief-team-size"
                  value={extractedBrief.desiredTeamSize}
                  onChange={(e) => updateBrief({ desiredTeamSize: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} people
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="brief-description">Description</Label>
              <Textarea
                id="brief-description"
                value={extractedBrief.description}
                onChange={(e) => updateBrief({ description: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="brief-commitment">Commitment Level</Label>
                <select
                  id="brief-commitment"
                  value={extractedBrief.commitment}
                  onChange={(e) => updateBrief({ commitment: e.target.value as "low" | "medium" | "high" })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low (5 hrs/week)</option>
                  <option value="medium">Medium (10 hrs/week)</option>
                  <option value="high">High (20+ hrs/week)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="brief-timeline">Timeline (weeks)</Label>
                <input
                  id="brief-timeline"
                  type="number"
                  min="1"
                  max="52"
                  value={extractedBrief.timeline.weeks}
                  onChange={(e) => updateBrief({ timeline: { ...extractedBrief.timeline, weeks: parseInt(e.target.value) } })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="brief-domain">Domain</Label>
                <input
                  id="brief-domain"
                  type="text"
                  value={extractedBrief.domain.join(", ")}
                  onChange={(e) => updateBrief({ domain: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., robotics, autonomous systems, drones"
                />
              </div>
            </div>

            <Separator />

            {/* Roles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="mb-0">Required Roles & Skills</Label>
                <Button variant="outline" size="sm" onClick={addRole}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-4">
                {extractedBrief.neededRoles.map((role, roleIndex) => (
                  <div key={roleIndex} className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <Label htmlFor={`role-title-${roleIndex}`}>Role Title</Label>
                        <input
                          id={`role-title-${roleIndex}`}
                          type="text"
                          value={role.title}
                          onChange={(e) => updateRole(roleIndex, { title: e.target.value })}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="e.g., Computer Vision Engineer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`role-count-${roleIndex}`} className="mb-0">Count</Label>
                        <input
                          id={`role-count-${roleIndex}`}
                          type="number"
                          min="1"
                          max="5"
                          value={role.count}
                          onChange={(e) => updateRole(roleIndex, { count: parseInt(e.target.value) || 1 })}
                          className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm"
                        />
                        {extractedBrief.neededRoles.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={() => removeRole(roleIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`role-req-${roleIndex}`}>Required Skills (comma-separated)</Label>
                        <input
                          id={`role-req-${roleIndex}`}
                          type="text"
                          value={role.requiredSkills.join(", ")}
                          onChange={(e) => updateRole(roleIndex, { requiredSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Python, OpenCV, Computer Vision"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`role-nice-${roleIndex}`}>Nice-to-Have Skills</Label>
                        <input
                          id={`role-nice-${roleIndex}`}
                          type="text"
                          value={role.niceToHaveSkills.join(", ")}
                          onChange={(e) => updateRole(roleIndex, { niceToHaveSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Object Detection, PyTorch"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose Team Button */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                size="xl"
                className="w-full gap-2"
                onClick={handleComposeTeam}
              >
                <CheckCircle className="h-5 w-5" />
                Compose Optimal Team
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-center text-sm text-neutral-500 mt-2">
                Evaluates all {extractedBrief.desiredTeamSize === 4 ? "210" : extractedBrief.desiredTeamSize === 3 ? "56" : "combinations"} candidate combinations instantly
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}