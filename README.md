# Mootion 

> An AI-powered STEM learning platform that unifies visual understanding, structured navigation, and interactive retention in one seamless flow.

Mootion was built for the **AI4India** hackathon by **Evolve AI** — a team of four students targeting the 250 million STEM learners in India who have access to content but lack a connected system to understand, navigate, and retain it.

---

## The Problem

STEM education is fragmented and passive. Spatial concepts are trapped in text, dynamic phenomena are frozen in static diagrams, and no single platform integrates explanation, visualization, and active recall. Students waste hours switching between videos, PDFs, and broken simulations — especially on exam night.

---

## The Solution

Mootion is built across three core endpoints:

| Endpoint | What it does |
|----------|-------------|
| **ASK** | Generates concept-specific Manim videos, interactive physics simulations, and immersive 3D Gaussian splat visualizations on demand |
| **PLAN** | Converts any uploaded syllabus into a navigable visual roadmap with topic dependencies |
| **PLAY** | Reinforces retention through adaptive games: Teach AI, Find the Mistake, and Drag & Drop |

---

## System Architecture

### Video Generation Pipeline

```
INPUT (Image / Audio / Text)
  └─► LLM – Scene Gen        → Scenes JSON + Category
  └─► LLM – Video Gen        → Manim Code + Scene Timestamps
  └─► LLM – TTS              → Output Script
        ├─ if persona        → SadTalker → VIDEO
        └─ else              → TTS → VIDEO
```

### Simulation Engine Pipeline

```
INPUT (Concept Graph + Equations)
  └─► LLM – Sim Planner      → SIM Config JSON (solver type, time range)
  └─► Solver Engine          → Timeseries data (Runge-Kutta / ODE / PDE / Particle)
  └─► LLM – Scene Mapper     → Visual Mapping JSON (variable → color/size/camera path)
  └─► Renderer (Three.js / WebGL / Cannon.js)
        └─► Interactive Simulation View
```

### 3D Gaussian Splat Pipeline

```
INPUT (Concept / Field Data / Multi-view Images)
  └─► LLM – Splat Planner    → Splat Config JSON (point density, bounding volume, color map)
  └─► Field Sampler          → Point Cloud (xyz + rgba + scale)
  └─► Gaussian Parameterizer → Gaussian params (position, opacity, covariance, SH)
  └─► Rasterizer (WebGL / CUDA) → Volumetric frames + LOD control
  └─► LLM – Annotation       → Label overlays, camera waypoints, narration cues
        └─► Interactive 3D Splat View
```

---

## AI Usage Summary

| System Feature | AI Role | Input → Output |
|----------------|---------|----------------|
| Video Generation | Scene Logic, Scripting & Manim Code Generation | Raw Image/Text/Audio → JSON Scene Schema + Script + Manim |
| Interactive Simulation | Simulation Planning | Concept Graphs + Equations → Solver Configs (ODE/PDE) |
| Adaptive Tutor | Narrative Persona | Scene Context → SadTalker / TTS Persona Cues |
| Gaussian Splatting | Splat Planning & Annotation | Field Data / Multi-view Images → Bounding Volumes + Labels |
| Visual Mapping | Auto-Styling | Solver Data → Visual Mapping (Color/Size/Camera Path) |

---

## Tech Stack & Unit Economics

- **LLM:** `gpt-4.1-mini` at $1.6 per 1M tokens
- **Tokens per generation:** 3K–5K

| Operation | Cost |
|-----------|------|
| Token cost per generation | $0.008 |
| Per simulation | $0.11 |
| Per video generation | $0.02 |

---

## Revenue Model

| | Basic | Standard | Premium |
|---|---|---|---|
| **Price** | Free | $5/month | $10/month |
| **Features** | Manim Animations, 5 Simulations/month, Basic AI Tutor | Manim + Simulation Engine, 1080p, Adaptive AI Tutor | Manim + Simulation + 3D Gaussian Splats, 4K, Full AI Tutor + Persona |
| **Storage** | 1 GB | 5 GB | Unlimited |
| **Extras** | — | SadTalker Persona & add-ons | Premium support + Gaussian Splat |

---

## Target Users

- **Arjun** — B.Tech student who struggles with passive, text-based learning and needs instant visual explanations
- **Riya** — B.Sc student with access to content but no structured study path or topic dependency map
- **Kabir** — JEE aspirant who understands concepts during study but cannot retain them without active practice

**Primary market:** 250 million STEM students in India, with particular focus on tier 2 and tier 3 cities where Mootion represents first-time access to a conceptually deep learning tool.

---

## Anticipated Impact

- 2–3x faster concept understanding
- 40–60% improvement in retention through interactive practice
- Elimination of platform-switching overhead

---

## Challenges & Risks

- **High Computational Demand** — GPU-based rendering may limit accessibility on lower-end devices
- **Real-Time Performance** — System latency under concurrent load can degrade UX
- **System Integration Complexity** — Orchestrating multiple heterogeneous pipelines (LLM, physics solver, WebGL renderer, Gaussian rasterizer) into a single unified flow is non-trivial
- **Device-Dependent Variability** — Rendering quality and performance will differ across user hardware

---

## Team — Evolve AI

| Name | Role |
|------|------|
| **Rachit Goyal** | Systems Architect & Backend — core framework design and backend orchestration |
| **Poorvika Grover** | Design & UX Lead — end-to-end visual identity and user journey |
| **Goyam Jain** | Lead ML Engineer — AI development and model optimisation |
| **Sartaj Kaur** | Product Lead & Strategy — product vision, roadmap, and user-centric execution |

---

## Scalability

- Subject-agnostic: works across all STEM disciplines
- Expandable to schools, colleges, and independent learners
- Infrastructure designed for thousands of concurrent users