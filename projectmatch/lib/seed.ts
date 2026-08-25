// ProjectMatch Seed Data - 8 Candidates with Complementary Skill Clusters

import type { Candidate, StoredProfile, StoredProject, ProjectBriefSchema, Skill, Availability, Experience, NeededRole } from "@/types";

const skill = (name: string, level: 1 | 2 | 3 | 4 | 5, years: number): Skill => ({ name, level, years });

const availability = (days: string[], hours: string, timezone: string): Availability => ({ days, hours, timezone });

const experience = (level: "junior" | "mid" | "senior", projectsShipped: number, primaryRole: string): Experience => ({ level, projectsShipped, primaryRole });

// ====================
// 8 Seeded Candidates with Complementary Skills
// ====================

export const SEEDED_CANDIDATES: Candidate[] = [
  {
    id: "alex",
    name: "Alex Chen",
    skills: [
      skill("Computer Vision", 5, 4),
      skill("Embedded Systems", 4, 3),
      skill("Python", 5, 5),
      skill("C++", 4, 4),
      skill("OpenCV", 5, 3),
    ],
    availability: availability(["mon", "wed", "fri"], "19-22", "America/Los_Angeles"),
    experience: experience("senior", 8, "Computer Vision Engineer"),
    interests: ["robotics", "autonomous systems", "edge AI", "drones"],
  },
  {
    id: "sam",
    name: "Sam Rodriguez",
    skills: [
      skill("Backend Development", 5, 5),
      skill("API Design", 5, 4),
      skill("PostgreSQL", 5, 5),
      skill("Node.js", 5, 5),
      skill("TypeScript", 5, 4),
      skill("Redis", 4, 3),
      skill("Docker", 4, 3),
    ],
    availability: availability(["mon", "wed", "fri"], "18-21", "America/Los_Angeles"),
    experience: experience("mid", 5, "Backend Engineer"),
    interests: ["scalable systems", "fleet management", "devops", "cloud"],
  },
  {
    id: "maya",
    name: "Maya Patel",
    skills: [
      skill("UI/UX Design", 5, 5),
      skill("Frontend Development", 4, 4),
      skill("React", 4, 3),
      skill("TypeScript", 4, 3),
      skill("Figma", 5, 4),
      skill("User Research", 5, 4),
      skill("Design Systems", 4, 3),
    ],
    availability: availability(["mon", "wed", "fri"], "19-21", "America/Los_Angeles"),
    experience: experience("senior", 7, "Product Designer"),
    interests: ["operator interfaces", "dashboard design", "human-robot interaction", "accessibility"],
  },
  {
    id: "jordan",
    name: "Jordan Kim",
    skills: [
      skill("Embedded Systems", 5, 4),
      skill("RTOS", 5, 4),
      skill("C++", 5, 5),
      skill("C", 5, 5),
      skill("FreeRTOS", 4, 3),
      skill("STM32", 4, 3),
      skill("Flight Control", 3, 2),
    ],
    availability: availability(["mon", "wed", "fri"], "19-22", "America/Los_Angeles"),
    experience: experience("mid", 4, "Embedded Engineer"),
    interests: ["flight control", "real-time systems", "hardware", "drones"],
  },
  {
    id: "priya",
    name: "Priya Sharma",
    skills: [
      skill("Computer Vision", 4, 3),
      skill("Machine Learning", 4, 3),
      skill("PyTorch", 4, 2),
      skill("Python", 4, 3),
      skill("Object Detection", 3, 2),
      skill("TensorFlow", 3, 2),
    ],
    availability: availability(["tue", "thu", "sat"], "10-14", "America/Los_Angeles"),
    experience: experience("junior", 2, "ML Engineer"),
    interests: ["computer vision", "deep learning", "autonomous vehicles", "robotics"],
  },
  {
    id: "carlos",
    name: "Carlos Mendes",
    skills: [
      skill("Backend Development", 5, 6),
      skill("DevOps", 5, 4),
      skill("AWS", 5, 5),
      skill("Kubernetes", 4, 3),
      skill("Go", 4, 3),
      skill("PostgreSQL", 5, 5),
      skill("Terraform", 4, 3),
    ],
    availability: availability(["mon", "tue", "wed", "thu"], "18-21", "America/Los_Angeles"),
    experience: experience("senior", 10, "Platform Engineer"),
    interests: ["cloud infrastructure", "scalable systems", "automation", "fleet management"],
  },
  {
    id: "lin",
    name: "Lin Wei",
    skills: [
      skill("UI/UX Design", 4, 3),
      skill("User Research", 5, 4),
      skill("Frontend Development", 4, 3),
      skill("React", 4, 3),
      skill("TypeScript", 3, 2),
      skill("Figma", 4, 3),
      skill("Accessibility", 4, 3),
    ],
    availability: availability(["mon", "wed", "fri"], "18-20", "America/Los_Angeles"),
    experience: experience("mid", 4, "UX Researcher"),
    interests: ["human-robot interaction", "operator interfaces", "accessibility", "design systems"],
  },
  {
    id: "raj",
    name: "Raj Singh",
    skills: [
      skill("Embedded Systems", 4, 3),
      skill("Hardware Design", 4, 3),
      skill("Firmware", 4, 3),
      skill("C", 4, 3),
      skill("C++", 3, 2),
      skill("PCB Design", 3, 2),
      skill("Altium", 3, 2),
    ],
    availability: availability(["tue", "thu", "sat"], "09-13", "America/Los_Angeles"),
    experience: experience("junior", 2, "Hardware Engineer"),
    interests: ["hardware", "embedded systems", "drones", "robotics"],
  },
];

// ====================
// Seeded Profiles (for localStorage)
// ====================

export const SEEDED_PROFILES: StoredProfile[] = SEEDED_CANDIDATES.map((c) => ({
  id: `demo-${c.id}`,
  name: c.name,
  email: `${c.id}@projectmatch.demo`,
  discord: `${c.id}#${Math.floor(1000 + Math.random() * 9000)}`,
  skills: c.skills,
  interests: c.interests,
  availability: c.availability,
  experience: c.experience,
  lookingFor: "project",
  createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
}));

// ====================
// Seeded Projects
// ====================

const neededRolesForDrone: NeededRole[] = [
  {
    title: "Computer Vision Engineer",
    requiredSkills: ["Computer Vision", "Python", "OpenCV"],
    niceToHaveSkills: ["Object Detection", "PyTorch", "TensorFlow"],
    count: 1,
  },
  {
    title: "Embedded Systems Engineer",
    requiredSkills: ["Embedded Systems", "C++", "RTOS"],
    niceToHaveSkills: ["Flight Control", "STM32", "FreeRTOS"],
    count: 1,
  },
  {
    title: "Backend Engineer",
    requiredSkills: ["Backend Development", "API Design", "Node.js", "TypeScript"],
    niceToHaveSkills: ["PostgreSQL", "Redis", "Docker", "Fleet Management"],
    count: 1,
  },
  {
    title: "UI/UX Designer",
    requiredSkills: ["UI/UX Design", "Figma", "User Research"],
    niceToHaveSkills: ["Frontend Development", "React", "Design Systems", "Accessibility"],
    count: 1,
  },
];

export const SEEDED_PROJECTS: StoredProject[] = [
  {
    id: "project-drone-delivery",
    ownerId: "demo-alex",
    title: "Autonomous Drone Delivery System",
    description: `Building an autonomous drone delivery system. Need Computer Vision for obstacle detection, Embedded Systems for flight control, Backend for fleet management, UI/UX for operator dashboard. 12 weeks, 20hrs/week, team meets Mon/Wed/Fri 7pm PST. Team of 4.`,
    brief: {
      title: "Autonomous Drone Delivery System",
      description: `Building an autonomous drone delivery system. Need Computer Vision for obstacle detection, Embedded Systems for flight control, Backend for fleet management, UI/UX for operator dashboard. 12 weeks, 20hrs/week, team meets Mon/Wed/Fri 7pm PST. Team of 4.`,
      neededRoles: neededRolesForDrone,
      timeline: { weeks: 12 },
      commitment: "high",
      domain: ["robotics", "autonomous systems", "drones", "logistics"],
      desiredTeamSize: 4,
    },
    status: "recruiting",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "project-edtech",
    ownerId: "demo-maya",
    title: "Language Learning Mobile App",
    description: `Building a language learning mobile app with speech recognition and personalized lessons. Need React Native for mobile, Backend for user progress tracking, UI/UX for engaging lessons. 10 weeks, 15hrs/week. Team of 3.`,
    brief: {
      title: "Language Learning Mobile App",
      description: `Building a language learning mobile app with speech recognition and personalized lessons. Need React Native for mobile, Backend for user progress tracking, UI/UX for engaging lessons. 10 weeks, 15hrs/week. Team of 3.`,
      neededRoles: [
        {
          title: "Mobile Developer",
          requiredSkills: ["React Native", "TypeScript", "Mobile Development"],
          niceToHaveSkills: ["Speech Recognition", "Expo"],
          count: 1,
        },
        {
          title: "Backend Engineer",
          requiredSkills: ["Backend Development", "Node.js", "PostgreSQL"],
          niceToHaveSkills: ["Redis", "GraphQL"],
          count: 1,
        },
        {
          title: "UI/UX Designer",
          requiredSkills: ["UI/UX Design", "Figma", "Mobile Design"],
          niceToHaveSkills: ["User Research", "Design Systems"],
          count: 1,
        },
      ],
      timeline: { weeks: 10 },
      commitment: "medium",
      domain: ["edtech", "mobile", "language learning"],
      desiredTeamSize: 3,
    },
    status: "recruiting",
    createdAt: Date.now() - 172800000,
  },
  {
    id: "project-fintech-api",
    ownerId: "demo-sam",
    title: "Real-time Payment Processing API",
    description: `Building a high-throughput payment processing API. Need strong backend skills, database optimization, API design, security. 8 weeks, 20hrs/week. Team of 3.`,
    brief: {
      title: "Real-time Payment Processing API",
      description: `Building a high-throughput payment processing API. Need strong backend skills, database optimization, API design, security. 8 weeks, 20hrs/week. Team of 3.`,
      neededRoles: [
        {
          title: "Backend Engineer",
          requiredSkills: ["Backend Development", "Go", "PostgreSQL", "API Design"],
          niceToHaveSkills: ["Redis", "Kafka", "Docker"],
          count: 2,
        },
        {
          title: "DevOps Engineer",
          requiredSkills: ["DevOps", "AWS", "Kubernetes", "Terraform"],
          niceToHaveSkills: ["CI/CD", "Monitoring"],
          count: 1,
        },
      ],
      timeline: { weeks: 8 },
      commitment: "high",
      domain: ["fintech", "payments", "backend", "security"],
      desiredTeamSize: 3,
    },
    status: "recruiting",
    createdAt: Date.now() - 259200000,
  },
  {
    id: "project-climate-dashboard",
    ownerId: "demo-lin",
    title: "Climate Data Visualization Dashboard",
    description: `Building an interactive climate data dashboard for researchers. Need data visualization, frontend, backend for data processing, UI/UX for researcher workflows. 12 weeks, 15hrs/week. Team of 4.`,
    brief: {
      title: "Climate Data Visualization Dashboard",
      description: `Building an interactive climate data visualization dashboard for researchers. Need data visualization, frontend, backend for data processing, UI/UX for researcher workflows. 12 weeks, 15hrs/week. Team of 4.`,
      neededRoles: [
        {
          title: "Frontend Developer",
          requiredSkills: ["Frontend Development", "React", "TypeScript", "D3.js"],
          niceToHaveSkills: ["Data Visualization", "WebGL"],
          count: 1,
        },
        {
          title: "Backend Engineer",
          requiredSkills: ["Backend Development", "Python", "PostgreSQL", "Data Processing"],
          niceToHaveSkills: ["Time-series DB", "ETL"],
          count: 1,
        },
        {
          title: "UI/UX Designer",
          requiredSkills: ["UI/UX Design", "Figma", "User Research", "Data Visualization"],
          niceToHaveSkills: ["Scientific Visualization", "Accessibility"],
          count: 1,
        },
        {
          title: "Data Engineer",
          requiredSkills: ["Data Engineering", "Python", "SQL", "ETL"],
          niceToHaveSkills: ["Airflow", "BigQuery"],
          count: 1,
        },
      ],
      timeline: { weeks: 12 },
      commitment: "medium",
      domain: ["climate", "data visualization", "research", "frontend"],
      desiredTeamSize: 4,
    },
    status: "recruiting",
    createdAt: Date.now() - 345600000,
  },
];

// ====================
// Helper: Convert Brief to ProjectRequirement
// ====================

export function briefToRequirement(brief: ProjectBriefSchema): import("@/types").ProjectRequirement {
  // Extract all required skills from neededRoles
  const requiredSkills = brief.neededRoles.flatMap((r) => r.requiredSkills);
  const niceToHaveSkills = brief.neededRoles.flatMap((r) => r.niceToHaveSkills);

  // Parse schedule from description or use defaults
  const commitmentHours = { low: 5, medium: 10, high: 20 };

  const schedule = {
    meetingDays: ["mon", "wed", "fri"] as string[],
    meetingHours: "19-22",
    timezone: "America/Los_Angeles",
    requiredHours: commitmentHours[brief.commitment] || 10,
  };

  return {
    requiredSkills,
    niceToHaveSkills,
    desiredTeamSize: brief.desiredTeamSize,
    timeline: brief.timeline,
    commitment: brief.commitment,
    domain: brief.domain,
    schedule,
  };
}