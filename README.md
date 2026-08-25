ProjectMatch
Build the Right Team, Not Just a List of People.

ProjectMatch is an AI-assisted team formation platform that helps people create effective teams for hackathons, competitions, research, startups, and academic projects.

Instead of relying only on existing social connections, ProjectMatch evaluates people based on skills, skill complementarity, availability, experience, interests, project requirements, and team size.

The goal is simple:

Find the team combination that is the best fit for the project.

🚀 Live Demo

Production:
https://projectmatch-beta.vercel.app

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

Every valid combination can be evaluated against the same project requirements.

The engine then ranks the teams based on multiple factors.

Scoring Model
Factor	Weight
Required Skill Coverage	35%
Availability	20%
Skill Complementarity	20%
Experience Fit	10%
Interest Alignment	10%
Team Size Fit	5%

The weights are intentionally transparent.

The system does not simply average individual scores.

It evaluates collective properties such as:

Whether required skills are covered
Whether team members complement each other
Whether their schedules overlap
Whether the team's experience fits the project
Whether members are interested in the project
Whether the team satisfies the required size
🤖 AI Architecture

AI is used where language understanding provides value.

1. Natural-Language Project Understanding

A user can enter a project description such as:

"We are building an autonomous medical drone delivery system using computer vision and robotics. We need a team of four with experience in embedded systems, machine learning, telemetry and backend monitoring."

The AI converts this into a structured project brief.

The structured output contains information such as:

Project title
Project description
Required roles
Required skills
Nice-to-have skills
Team size
Project requirements

The result is validated before being used by the application.

2. Explainable Recommendations

After the deterministic engine selects a team, the system can generate explanations based on the computed metrics.

For example:

Why the selected team has strong skill coverage
Why their availability works
Which members provide complementary skills
Why the selected team beats the runner-up
Which required skills remain uncovered

The AI receives calculated metrics rather than being allowed to invent the recommendation.

Deterministic + AI Architecture

The architecture deliberately separates AI responsibilities from core decision-making.

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

This provides:

Predictability
Explainability
Reproducibility
Clear separation of concerns
Reduced dependence on external AI availability
Core Features
Project Brief Builder

Users can describe their project naturally and receive a structured project brief.

Team Composition

The system evaluates candidate combinations and recommends the strongest team.

Skill Coverage

The system identifies:

Covered required skills
Uncovered required skills
Nice-to-have skills
Availability Matching

Candidate schedules are compared to determine shared working availability.

Skill Complementarity

The engine considers whether members bring distinct capabilities instead of unnecessary skill duplication.

Experience Fit

Candidate experience is compared with project requirements.

Interest Alignment

The system considers whether candidates are interested in the project's domain.

Explainable Results

Users can understand why a team was recommended rather than receiving an unexplained score.

Runner-Up Comparison

The system can compare the selected team with the next-best candidate combination.

Skill Gap Detection

If important project requirements remain uncovered, ProjectMatch identifies the missing capabilities.

Individual Matching

A secondary matching flow can find individual people who fit existing projects.

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

The competition constraint was to prioritize:

Working functionality > reliability > meaningful AI > UX > visual polish > extra features

The MVP therefore uses browser localStorage for demo profiles and project data.

This avoids spending valuable development time on:

Authentication
Database schemas
API authorization
User management
Deployment infrastructure

The architecture can later be extended to a persistent backend.

Reliability Strategy

The core matching engine does not depend on an LLM.

This is intentional.

External AI services can experience:

Rate limits
API failures
Credit limitations
Network failures

The deterministic team-selection engine continues to provide predictable recommendations independently.

During competition development, an external AI credit limitation was encountered.

A clearly labelled demo fallback was implemented for the project requirement extraction flow so that the product could remain demonstrable without pretending that an unavailable API request had succeeded.

Error Handling

The application includes handling for several classes of failure:

Missing AI configuration
AI API failures
Invalid AI responses
Invalid structured output
Missing project briefs
Missing candidate data
Duplicate UI list keys
Deployment/build errors

Structured outputs are validated before being used by the matching system.

Development & Debugging Journey

ProjectMatch was developed under a strict competition time constraint.

The development workflow was:

Problem Analysis
      ↓
Product Architecture
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
Bug Fixing
      ↓
Production Deployment

Several issues were encountered during development.

React Duplicate Key Errors

Repeated skills such as Python and Backend Development produced duplicate React key warnings.

The rendering logic was updated to generate unique keys while preserving the underlying skill data.

Hydration Warning

A hydration mismatch appeared during local development.

The warning was traced to attributes injected into the page by a browser extension rather than the ProjectMatch application itself.

TypeScript and Build Issues

Several type and configuration issues were discovered during development.

They were resolved and the final production build successfully compiled.

AI API Credit Limitation

The Anthropic API returned an insufficient-credit error during testing.

Instead of making the entire product dependent on the external API, a clearly labelled demo fallback was used for the extraction flow.

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
AI utility

The brief was then passed correctly through the component/API chain.

Build Status

The application successfully builds using the Next.js production build process.

Current validation includes:

TypeScript compilation
Next.js production build
Route generation
Local functional testing
Production deployment validation
Security Considerations

No API credentials are intended to be committed to the repository.

External API keys are handled through environment variables.

The application does not expose provider credentials to the client.

The competition MVP also avoids unnecessary authentication and backend infrastructure, reducing the attack surface.

Accessibility

ProjectMatch uses semantic interface components and responsive layouts designed for desktop and mobile use.

The interface uses:

Form labels
Standard interactive controls
Semantic headings
Responsive layouts
Icon + text combinations
Clear status indicators

Accessibility remains an area for future improvement as the product evolves.

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

Show the structured project requirements generated from the natural-language description.

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

The MVP intentionally excludes infrastructure-heavy features.

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

These features were excluded from the competition MVP to maintain reliability and delivery speed.

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

Working functionality → Reliability → Meaningful AI → UX → Visual polish → Extra features

Live Product

https://projectmatch-beta.vercel.app

Repository

The complete source code for the competition MVP is available in this repository.
