# CarbonLoop — Agent Instructions

## Project

CarbonLoop is a GIS-powered Waste-to-Carbon-Value Chain Tracker for the Circular Carbon Ecosystem theme.

The core product flow is:

Waste Generator
→ Smart Matching
→ Route Optimization
→ Conversion Facility
→ Carbon Calculation
→ Carbon Ledger
→ Economic Value

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- PostgreSQL
- PostGIS
- Leaflet
- OpenStreetMap
- OSRM
- Zod
- Recharts

## MVP

The MVP consists of:

1. Add waste lot
2. Find compatible facilities
3. Rank facilities
4. Display facilities on GIS map
5. Calculate route
6. Calculate carbon impact
7. Create Carbon Ledger record
8. Show economic value

## Engineering Rules

- Use TypeScript throughout the application.
- Prefer small, modular components and functions.
- Keep business logic separate from UI components.
- Do not introduce dependencies without a clear reason.
- Do not modify unrelated files when implementing a feature.
- Do not silently change API contracts.
- Do not hard-code secrets.
- Use environment variables for external services.
- Validate external/user input with Zod.
- Add tests for non-trivial business logic.
- Keep calculations deterministic and explainable.
- Keep carbon coefficients configurable.
- Clearly distinguish demonstration assumptions from verified real-world values.
- Maintain backwards compatibility where practical.

## Architecture

Business logic should live under:

- `lib/matching`
- `lib/routing`
- `lib/carbon`
- `lib/economics`

Database-related code should remain isolated from UI code.

API routes should act as interfaces between the frontend and business logic.

## GIS

Use Leaflet + OpenStreetMap for the MVP.

Use OSRM for road routing.

Provide a graceful fallback when an external routing service is unavailable.

## Carbon Model

The core equation is:

Net CO2e Benefit =
Avoided Landfill Emissions
+ Carbon Stored
- Process Emissions
- Transport Emissions

Carbon coefficients must be configurable rather than scattered throughout the codebase.

## Collaboration

Never rewrite or delete another developer's work unless explicitly instructed.

Keep commits focused.

Before modifying an existing module, inspect how it is currently being used.

Do not implement features outside the current task.

## Priority

When trade-offs are necessary, prioritize:

1. Working end-to-end demo
2. Smart matching
3. GIS
4. Carbon Ledger
5. Facility dashboard
6. Economic value
7. Visual polish
8. Future/experimental features