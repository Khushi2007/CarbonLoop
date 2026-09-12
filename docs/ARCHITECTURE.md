# CarbonLoop Architecture

## High-Level Architecture

Frontend
    ↓
Next.js Application
    ↓
API / Server Actions
    ↓
Business Logic
    ├── Matching Engine
    ├── Routing Engine
    ├── Carbon Engine
    └── Economic Engine
    ↓
PostgreSQL + PostGIS

External Services:

Next.js
    ├── OSRM
    └── OpenStreetMap

---

## Core Domain Flow

Waste Lot
    ↓
Matching Engine
    ↓
Ranked Facilities
    ↓
Selected Facility
    ↓
Routing Engine
    ↓
Shipment
    ↓
Carbon Engine
    ↓
Carbon Record
    ↓
Economic Value

---

## Main Modules

### Matching Engine

Responsible for:

- compatibility filtering
- capacity filtering
- distance filtering
- match scoring
- ranking
- recommendation explanation

### Routing Engine

Responsible for:

- road distance
- route geometry
- route duration
- transport cost
- transport emissions

### Carbon Engine

Responsible for:

- landfill baseline
- conversion pathway
- carbon storage
- process emissions
- transport emissions
- net CO2e benefit

### Economic Engine

Responsible for:

- transport cost
- avoided landfill cost
- conversion product value
- carbon-related value
- estimated total economic value

---

## Database

PostgreSQL + PostGIS.

Core entities:

- users
- waste_lots
- facilities
- matches
- shipments
- carbon_records

---

## Frontend Areas

- Generator Dashboard
- Matching / GIS Map
- Facility Dashboard
- Carbon Ledger
- Transaction Details

---

## External Services

### OpenStreetMap

Used for map tiles.

### OSRM

Used for road routing.

External services must not be treated as guaranteed dependencies. The application should have sensible fallbacks where practical.