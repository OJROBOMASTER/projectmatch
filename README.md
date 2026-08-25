# ProjectMatch

### AI-Assisted Team Formation Platform

ProjectMatch is a team formation platform designed to help people build effective project teams based on **skills, availability, experience, interests, and project requirements**.

Instead of simply finding the best individual candidate, ProjectMatch evaluates possible team combinations and identifies the team that provides the strongest overall fit for a project.

---

## Problem

When people form teams for hackathons, competitions, research, startups, or academic projects, they often depend on their existing social network.

This creates a common problem:

- A developer may need a designer.
- A researcher may need a data engineer.
- A hardware project may need someone with embedded systems experience.
- Team members may have conflicting availability.
- People may have complementary skills but never discover each other.

ProjectMatch aims to make team formation more structured and data-driven.

---

## Solution

ProjectMatch allows a user to describe their project requirements in natural language.

The platform then converts those requirements into a structured project brief and evaluates potential team combinations.

The matching process considers:

- Required skill coverage
- Skill complementarity
- Availability
- Experience
- Interest alignment
- Team size

The system also provides explanations for why a team was selected and how it compares with alternative teams.

---

## Core Differentiator

Most matching systems focus on:

> **"Who is the best person for this project?"**

ProjectMatch focuses on:

> **"Which combination of people makes the strongest team for this project?"**

For the competition demo, the system evaluates possible 4-person teams from 8 candidates:

**C(8,4) = 70 possible combinations**

Each team is evaluated collectively rather than simply averaging individual candidate scores.

---

## Matching Algorithm

The team scoring model uses six factors:

| Factor | Weight |
|---|---:|
| Skill Coverage | 35% |
| Availability | 20% |
| Skill Complementarity | 20% |
| Experience Fit | 10% |
| Interest Alignment | 10% |
| Team Size Fit | 5% |

This produces a transparent team score that can be inspected and explained.

The core team-composition engine is deterministic, allowing the recommendation to remain predictable and reproducible.

---

## AI Usage

AI is used where it provides meaningful value rather than controlling the entire recommendation process.

### 1. Project Requirement Extraction

Users can describe their project in natural language.

AI converts the description into a structured project brief containing information such as:

- Project requirements
- Required roles
- Required skills
- Team size
- Project context

The structured output is validated using Zod schemas.

### 2. Recommendation Explanation

AI can generate explanations based on metrics calculated by the matching engine.

For example:

- Why the selected team has strong skill coverage
- Why the team's availability is suitable
- Why the team is complementary
- Why a runner-up team scored lower
- Which skills remain uncovered

The AI does not arbitrarily select the final team.

---

## Architecture

```text
User Project Description
          │
          ▼
AI Requirement Extraction
          │
          ▼
Structured Project Brief
          │
          ▼
Deterministic Team Composition Engine
          │
          ▼
Evaluate Candidate Combinations
          │
          ▼
Team Score + Metrics
          │
          ▼
Recommended Team
          │
          ▼
AI-Assisted Explanation
