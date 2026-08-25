"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Plus, Trash2, User, Briefcase, Clock, Award } from "lucide-react";
import { createCustomProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Skill, Availability, Experience } from "@/types";

const SKILL_OPTIONS = [
  "React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker",
  "Figma", "UI/UX Design", "User Research", "Computer Vision", "Machine Learning",
  "PyTorch", "TensorFlow", "C++", "C", "Embedded Systems", "RTOS", "STM32",
  "Backend Development", "API Design", "DevOps", "Kubernetes", "Terraform",
  "Go", "Rust", "GraphQL", "Redis", "Next.js", "Mobile Development", "React Native",
  "Data Visualization", "D3.js", "Data Engineering", "ETL", "Hardware Design", "Firmware",
  "OpenCV", "Object Detection", "FreeRTOS", "Flight Control", "PCB Design", "Altium",
  "Design Systems", "Accessibility", "Speech Recognition", "Expo"
];

const INTEREST_OPTIONS = [
  "fintech", "edtech", "healthcare", "climate", "robotics", "autonomous systems",
  "drones", "AI", "machine learning", "computer vision", "backend", "frontend",
  "mobile", "devops", "cloud", "data visualization", "data engineering",
  "developer tools", "payments", "security", "human-robot interaction",
  "operator interfaces", "accessibility", "design systems", "scalable systems",
  "real-time systems", "hardware", "fleet management", "logistics"
];

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = [
  "06-09", "09-12", "12-15", "15-18", "18-21", "19-22", "20-23", "21-00"
];

const TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Toronto", "America/Vancouver", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Australia/Sydney"
];

export function ProfileWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    discord: "",
    skills: [] as Skill[],
    interests: [] as string[],
    availability: {
      days: [] as string[],
      hours: "19-22",
      timezone: "America/Los_Angeles",
    } as Availability,
    experience: {
      level: "mid" as "junior" | "mid" | "senior",
      projectsShipped: 0,
      primaryRole: "",
    } as Experience,
    lookingFor: "project" as "project" | "cofounder" | "both",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = <T extends object>(parent: keyof typeof formData, field: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent] as T, [field]: value },
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.some((s) => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, { name: newSkill.trim(), level: 3, years: 1 }],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== skillName),
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d) => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.email.trim() && formData.skills.length > 0;
      case 2:
        return formData.interests.length > 0;
      case 3:
        return formData.availability.days.length > 0;
      case 4:
        return formData.experience.primaryRole.trim() && formData.experience.projectsShipped >= 0;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    const profile = {
      id: `custom-${Date.now()}`,
      ...formData,
      createdAt: Date.now(),
    };
    createCustomProfile(profile);
    window.location.href = "/dashboard/build";
  };

  const steps = [
    { number: 1, title: "Skills", icon: Briefcase, desc: "What you know" },
    { number: 2, title: "Interests", icon: Award, desc: "What you like" },
    { number: 3, title: "Availability", icon: Clock, desc: "When you're free" },
    { number: 4, title: "Experience", icon: User, desc: "Your background" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Create Your Profile</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">4 steps • ~2 minutes</p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              {steps.map((s, i) => (
                <div key={s.number} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      i < step - 1
                        ? "bg-green-500 text-white"
                        : i === step - 1
                        ? "bg-primary text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                    )}
                  >
                    {i < step - 1 ? <CheckCircle className="h-5 w-5" /> : s.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-16 h-1 mx-2",
                        i < step - 1 ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-700"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="sm:hidden flex items-center justify-between mb-6">
            {steps.map((s, i) => (
              <div key={s.number} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    i < step - 1
                      ? "bg-green-500 text-white"
                      : i === step - 1
                      ? "bg-primary text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                  )}
                >
                  {i < step - 1 ? <CheckCircle className="h-5 w-5" /> : s.number}
                </div>
                <span className="text-xs text-neutral-500">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].desc}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Alex Chen"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="discord">Discord (optional)</Label>
                  <Input
                    id="discord"
                    value={formData.discord}
                    onChange={(e) => updateField("discord", e.target.value)}
                    placeholder="alex#1234"
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Your Skills *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        placeholder="Add skill (e.g., React, Python, Figma)..."
                        className="w-64"
                      />
                      <Button variant="outline" size="sm" onClick={addSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Skill suggestions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SKILL_OPTIONS.filter((s) => !formData.skills.some((fs) => fs.name.toLowerCase() === s.toLowerCase())).slice(0, 12).map((skill) => (
                      <Button
                        key={skill}
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            skills: [...prev.skills, { name: skill, level: 3, years: 1 }],
                          }));
                        }}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>

                  {/* Added skills */}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill.name} variant="secondary" className="gap-1">
                        {skill.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0"
                          onClick={() => removeSkill(skill.name)}
                          aria-label={`Remove skill ${skill.name}`}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {formData.skills.length === 0 && (
                    <p className="text-sm text-neutral-500">Add at least one skill to continue</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Your Interests *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                        placeholder="Add interest (e.g., fintech, robotics, climate)..."
                        className="w-64"
                      />
                      <Button variant="outline" size="sm" onClick={addInterest}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {INTEREST_OPTIONS.filter((i) => !formData.interests.includes(i)).slice(0, 15).map((interest) => (
                      <Button
                        key={interest}
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            interests: [...prev.interests, interest],
                          }));
                        }}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="gap-1">
                        {interest}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0"
                          onClick={() => removeInterest(interest)}
                          aria-label={`Remove interest ${interest}`}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {formData.interests.length === 0 && (
                    <p className="text-sm text-neutral-500">Add at least one interest to continue</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Available Days *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS.map((day, i) => (
                      <Button
                        key={day}
                        variant={formData.availability.days.includes(day) ? "default" : "outline"}
                        size="sm"
                        className="h-10 w-12"
                        onClick={() => toggleDay(day)}
                      >
                        {DAY_LABELS[i]}
                      </Button>
                    ))}
                  </div>
                  {formData.availability.days.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Select at least one day</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="hours">Available Hours *</Label>
                    <Select value={formData.availability.hours} onValueChange={(v) => updateNestedField("availability", "hours", v)}>
                      <SelectTrigger id="hours">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot.replace("-", " - ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone *</Label>
                    <Select value={formData.availability.timezone} onValueChange={(v) => updateNestedField("availability", "timezone", v)}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="primaryRole">Primary Role *</Label>
                    <Input
                      id="primaryRole"
                      value={formData.experience.primaryRole}
                      onChange={(e) => updateNestedField("experience", "primaryRole", e.target.value)}
                      placeholder="e.g., Frontend Developer, ML Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectsShipped">Projects Shipped</Label>
                    <Input
                      id="projectsShipped"
                      type="number"
                      min="0"
                      value={formData.experience.projectsShipped}
                      onChange={(e) => updateNestedField("experience", "projectsShipped", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Experience Level *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(["junior", "mid", "senior"] as const).map((level) => (
                      <Button
                        key={level}
                        variant={formData.experience.level === level ? "default" : "outline"}
                        className="h-20 flex flex-col gap-2"
                        onClick={() => updateNestedField("experience", "level", level)}
                      >
                        <span className="font-medium capitalize">{level}</span>
                        <span className="text-xs text-muted-foreground">
                          {level === "junior" ? "0-2 years" : level === "mid" ? "3-5 years" : "5+ years"}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed()}>
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}