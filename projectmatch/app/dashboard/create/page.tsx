"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Save, ArrowRight, XCircle, CheckCircle } from "lucide-react";
import { addProject } from "@/lib/storage";
import type { ProjectBriefSchema } from "@/types";

const defaultDescription = `Building an autonomous drone delivery system. Need Computer Vision for obstacle detection, Embedded Systems for flight control, Backend for fleet management, UI/UX for operator dashboard. 12 weeks, 20hrs/week, team meets Mon/Wed/Fri 7pm PST. Team of 4.`;

export default function CreateProjectPage() {
  const [description, setDescription] = useState(defaultDescription);
  const [extractedBrief, setExtractedBrief] = useState<ProjectBriefSchema | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

      const data = await response.json();

      if (data.success) {
        setExtractedBrief(data.data);
      } else {
        setExtractError(data.error || "Failed to extract brief");
      }
    } catch (error) {
      setExtractError("Network error. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!extractedBrief) return;

    setIsSaving(true);
    try {
      addProject({
        id: `proj-${Date.now()}`,
        ownerId: "custom-user",
        title: extractedBrief.title,
        description,
        brief: extractedBrief,
        status: "recruiting",
        createdAt: Date.now(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.href = "/dashboard/build";
      }, 1500);
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateBrief = (updates: Partial<ProjectBriefSchema>) => {
    if (extractedBrief) {
      setExtractedBrief({ ...extractedBrief, ...updates });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Create Project</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Describe your project in plain English. AI extracts structured requirements you can review and publish.
        </p>
      </div>

      {/* Step 1: Natural Language Input */}
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Describe Your Project</CardTitle>
          <CardDescription>
            Write in plain English. AI will extract roles, skills, timeline, and team size.
          </CardDescription>
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
              <XCircle className="h-4 w-4" />
              {extractError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Extracted Brief Preview & Edit */}
      {extractedBrief && (
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>
              Verify the AI extraction. Edit any fields before publishing your project.
            </CardDescription>
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
                <Label htmlFor="brief-domain">Domain (comma-separated)</Label>
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

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setExtractedBrief(null)}>
                Back to Description
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Published!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Publish Project
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}