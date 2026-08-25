ProjectMatch
Build the Right Team, Not Just a List of People.

ProjectMatch is an AI-assisted team formation platform that helps people create effective teams for hackathons, competitions, research, startups, and academic projects.

Instead of relying only on existing social connections, ProjectMatch evaluates people based on:

Skills
Skill complementarity
Availability
Experience
Interests
Project requirements
Team size

Find the team combination that is the best fit for the project.

🚀 Live Demo

Latest Production Deployment:
https://projectmatch-7iurf5jj0-oj-robomaster.vercel.app/

ProjectMatch is deployed on Vercel. Each Vercel deployment receives a unique generated URL, while production domains can point to the latest production deployment.

The Problem

Forming a project team is often based on who you already know.

This creates several problems:

People may not know who has the skills they need.
Complementary skills can be difficult to discover.
Team members may have incompatible schedules.
A collection of individually strong people does not necessarily create a strong team.
Project requirements are often described informally rather than as structured requirements.

For example, a robotics project may require:

Computer Vision + Robotics + Embedded Systems + Machine Learning + Backend/Telemetry

Finding those skills across different people is difficult when team formation depends only on social connections.

The ProjectMatch Approach

ProjectMatch converts an unstructured project description into structured requirements and then evaluates possible team combinations.

Project Description
        ↓
AI Requirement Extraction
        ↓
Structured Project Brief
        ↓
Candidate Pool
        ↓
Team Combination Evaluation
        ↓
Multi-Factor Scoring
        ↓
Best Team
        ↓
Explainable Recommendation

The important architectural decision is that AI does not make the final team-selection decision.

AI understands the project.

The deterministic matching engine evaluates the teams.

AI then helps explain the result.

What Makes ProjectMatch Different?

Traditional matching asks:

"Which person matches this project?"

ProjectMatch asks:

"Which combination of people creates the strongest team for this project?"

This distinction is the core of the product.

A team can be better than another team even when none of its individual members is the single highest-scoring candidate.

The system therefore evaluates the team as a collective unit.

Team Composition Engine

For the competition demo, ProjectMatch works with 8 candidates and searches for a 4-person team.

That creates:

C(8,4) = 70 possible team combinations

Every valid combination is evaluated against the same project requirements.

Scoring Model
Factor	Weight
Required Skill Coverage	35%
Availability	20%
Skill Complementarity	20%
Experience Fit	10%
Interest Alignment	10%
Team Size Fit	5%

The system does not simply average individual scores.

It evaluates collective properties such as:

Required skill coverage
Team availability
Skill complementarity
Experience fit
Interest alignment
Team size
🤖 AI Architecture

AI is used where language understanding provides value.

1. Natural-Language Project Understanding

A user can describe their project naturally.

For example:

"We are building an autonomous medical drone delivery system using computer vision and robotics. We need a team of four with experience in embedded systems, machine learning, telemetry and backend monitoring."

AI converts this description into a structured project brief containing:

Project title
Project description
Required roles
Required skills
Nice-to-have skills
Team size
Project requirements

The structured output is validated before entering the matching engine.

2. Explainable Recommendations

After the deterministic engine selects a team, AI can generate explanations based on computed metrics.

These explanations can cover:

Why the selected team has strong skill coverage
Why their availability works
Which members provide complementary skills
Why the selected team beats the runner-up
Which required skills remain uncovered

The AI does not independently select the winning team.

Deterministic + AI Architecture
                  ┌──────────────────────┐
                  │  Natural Language    │
                  │  Project Description │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     AI Extraction    │
                  │  Project Requirements│
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Structured Project   │
                  │       Brief          │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Deterministic Team   │
                  │ Composition Engine   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Team Metrics & Score │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ AI Explanation Layer │
                  └──────────────────────┘

This separation provides:

Predictability
Explainability
Reproducibility
Clear separation of concerns
Reduced dependence on external AI availability
Core Features
Project Brief Builder

Natural-language project descriptions can be converted into structured project requirements.

Team Composition

Evaluates candidate combinations and recommends the strongest team.

Skill Coverage

Identifies covered and uncovered project requirements.

Availability Matching

Compares candidate schedules to determine shared working availability.

Skill Complementarity

Rewards teams where members bring distinct and useful capabilities.

Experience Fit

Compares candidate experience with project requirements.

Interest Alignment

Considers candidate interest in the project's domain.

Explainable Results

Provides reasoning behind the recommendation instead of only displaying a score.

Runner-Up Comparison

Allows comparison between the selected team and the next-best combination.

Skill Gap Detection

Identifies important requirements that remain uncovered.

Individual Matching

Provides a secondary project-to-person matching flow.

Technology Stack
Frontend
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
AI
Anthropic SDK integration
Natural-language requirement extraction
AI-generated metric-based explanations
Validation
Zod
Storage
Browser localStorage for the competition MVP
Deployment
Vercel
Development
Claude Code
Ubuntu WSL
GitHub
Vercel
Why No Database?

A database was intentionally excluded from the competition MVP.

The goal was to prioritize:

Working functionality → Reliability → Meaningful AI → UX → Visual polish → Extra features

The MVP therefore uses browser localStorage for demo profiles and project data.

This allowed development to focus on the core problem rather than spending the competition time on:

Authentication
Database schemas
User management
API authorization
Deployment infrastructure

The architecture can later be extended to a persistent backend.

Reliability Strategy

The core matching engine does not depend on an LLM.

External AI services can experience:

Rate limits
API failures
Credit limitations
Network failures

The deterministic team-selection engine remains predictable and reproducible independently.

During development, the Anthropic API encountered a credit limitation. A clearly labelled demo fallback was implemented for project requirement extraction so the product could remain demonstrable without pretending an unavailable API request succeeded.

Error Handling & Debugging

Several real development issues were identified and resolved during implementation.

React Duplicate Key Errors

Repeated skills such as Python and Backend Development caused duplicate React key warnings.

The affected rendering logic was updated to generate unique keys while preserving the displayed data.

Browser Hydration Warning

A hydration mismatch appeared during local development.

The warning was traced to attributes injected by a browser extension rather than the ProjectMatch application.

TypeScript and Build Issues

Multiple TypeScript and configuration issues were identified during development and resolved.

The production build was successfully validated.

AI API Credit Limitation

The Anthropic API returned an insufficient-credit error.

Rather than making the entire product dependent on the external service, a transparent demo fallback was implemented.

Explanation Data Flow

The explanation system initially received no project brief after team composition.

The data flow was traced through:

BuildTeamPage
      ↓
TeamResult
      ↓
TeamExplanation
      ↓
Explanation API
      ↓
AI Utility

The brief was then correctly passed through the component and API chain.

Accessibility

The interface uses accessible interaction patterns including:

Keyboard-accessible candidate selection
Accessible names for icon-only buttons
Form labels
Semantic headings
Responsive layouts
Accessible status information
Decorative icons marked appropriately for assistive technology

Accessibility was specifically reviewed during the final development stage, with targeted fixes applied to interactive components.

Security
API credentials are handled through environment variables.
Secrets are not intended to be committed to the repository.
Provider credentials are not exposed to the browser.
The MVP avoids unnecessary authentication and backend infrastructure.
The deterministic core engine does not require external credentials to perform team scoring.
Development Workflow

ProjectMatch was developed using an AI-assisted rapid-development workflow.

Problem Analysis
      ↓
Architecture Planning
      ↓
MVP Definition
      ↓
AI-Assisted Implementation
      ↓
Local Development
      ↓
Build Validation
      ↓
Feature Testing
      ↓
Debugging
      ↓
Accessibility Improvements
      ↓
Production Deployment

Claude Code was used as the primary coding assistant, while product decisions, architecture, feature prioritization, testing, debugging, and final validation were reviewed manually.

Build & Validation

The application was validated through:

TypeScript compilation
Next.js production builds
Route generation
Local functional testing
UI debugging
Accessibility review
Production deployment testing

The production application successfully builds and runs on Vercel.

Demo Flow

The recommended competition demonstration takes approximately three minutes.

1. Start Demo

Open ProjectMatch and select:

Try Demo Mode

2. Build Team

Open the team-building workflow.

3. Describe Project

Enter the autonomous medical/drone delivery project.

4. Extract Requirements

Show the structured project requirements generated from the project description.

5. Compose Team

Run the team composition engine.

The system evaluates:

70 possible 4-person combinations

6. Inspect Recommendation

Show:

Team score
Skill coverage
Availability
Complementarity
Members
Skill gaps
7. Explain Recommendation

Show:

Why This Team?

Then compare against:

Why Not Runner-Up?

Future Roadmap

Potential future versions could add:

Persistent user accounts
Authentication
Database-backed profiles
Real-time availability
Team invitations
Notifications
Semantic skill embeddings
Larger candidate pools
Advanced project discovery
Team collaboration
Learning from successful team formations

These features were intentionally excluded from the competition MVP to maintain reliability and delivery speed.

Product Philosophy

ProjectMatch follows one core principle:

Use AI where understanding language is valuable, and use deterministic systems where reliability and explainability matter.

The goal is not to replace human team-building decisions with a black-box AI model.

The goal is to make discovering and forming complementary teams:

faster, more structured, more transparent, and more effective.

Competition

Built for Prompt Wars 2026.

ProjectMatch was developed as a rapid AI-assisted product prototype under a strict competition time constraint.

The project prioritizes:

Working Functionality → Reliability → Meaningful AI → UX → Visual Polish → Extra Features

Live Product

https://projectmatch-7iurf5jj0-oj-robomaster.vercel.app/

Repository

The complete source code for the ProjectMatch competition MVP is available in this repository.
