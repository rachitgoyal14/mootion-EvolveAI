<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">

# Mootion — Frontend

**An AI-powered STEM learning experience, built with Antigravity.**

[![React](https://img.shields.io/badge/React-19-black?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-black?style=flat-square)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-black?style=flat-square)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-black?style=flat-square)](https://tailwindcss.com)

</div>

---

## Overview

This is the frontend for **Mootion** — an AI-powered STEM learning platform built for the **AI4India** hackathon by **Evolve AI**. The frontend is a full-stack React + Express app that connects learners to dynamic AI-generated video explanations, interactive physics simulations, and visual concept roadmaps.

Designed to feel premium from the very first frame, the interface features a fully animated pixel-art hero logo, scroll-driven concept illustrations, and a clean editorial aesthetic — built entirely using **Antigravity**.

---

## Design Philosophy

The UI is built around a minimal black-and-white editorial palette (`#fafaf8` base), with deliberate use of motion to make the product feel alive:

- **Pixel-art MOOTION logo** — Each letter is individually constructed from SVG pixel blocks that animate in with spring physics on load, powered by `motion/react`.
- **Scroll-driven illustrations** — A `GhostSection` uses `useScroll` + `useTransform` to morph a pixel-art Potion → Pi symbol → Atom as the user scrolls, communicating the transformation of raw content into structured knowledge.
- **Animated grid background** — The onboarding and workspace screens feature a living dot-grid where cells randomly illuminate and fade using `AnimatePresence`, giving every screen depth and texture.
- **24px grid system** — The entire layout uses a consistent `24px` grid for background patterns and spacing, giving the design a structured, architectural feel.

---

## Screens & Routes

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | **Home** | Animated hero with pixel MOOTION logo, scroll illustrations, and newsletter footer |
| `/onboarding` | **Onboarding** | 5-step personalisation flow (name, email, topics, learning style, pace) |
| `/roadmap` | **Roadmap** | AI-generated visual concept dependency graph using `@xyflow/react` + `dagre` |
| `/workspace` | **Workspace Selection** | Choose between Free Study or Syllabus Upload modes |
| `/workspace/study` | **Free Study** | Enter a topic and generate AI content on demand |
| `/workspace/syllabus` | **Syllabus Upload** | Upload a PDF/image and auto-generate a concept roadmap |
| `/concept/:nodeId` | **Concept Workspace** | Deep-dive into a concept — videos, simulations, and 3D visualisations |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Server** | Express 4 (via `server.ts`, run with `tsx`) |
| **Styling** | TailwindCSS 4 |
| **Animation** | Motion (Framer Motion) |
| **Graph / Roadmap** | `@xyflow/react` + `dagre` layout |
| **AI** | `@google/genai` SDK (Gemini API) |
| **File Uploads** | `multer` + `react-dropzone` |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **WebSockets** | `ws` (for streaming AI responses) |

---

## Run Locally

**Prerequisites:** Node.js v18+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API key** — copy `.env.example` to `.env` and set your key:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in:
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   This runs both the Express backend (`server.ts`) and the Vite frontend together via `tsx`.

4. **Open in browser:** [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
Frontend/
├── src/
│   ├── App.tsx                # Root router, Home page, animated hero & footer
│   ├── Onboarding.tsx         # 5-step onboarding flow with animated grid bg
│   ├── Roadmap.tsx            # AI-generated concept dependency graph
│   ├── WorkspaceSelection.tsx # Mode selection screen
│   ├── WorkspaceStudy.tsx     # Free study topic input
│   ├── WorkspaceSyllabus.tsx  # Syllabus PDF upload screen
│   ├── ConceptWorkspace.tsx   # Full concept deep-dive workspace
│   ├── LoadingOverlay.tsx     # Animated loading states
│   ├── index.css              # Global styles
│   └── main.tsx               # React entry point
├── public/
│   └── assests/               # Static assets (logo, images)
├── server.ts                  # Express server + API routes
├── index.html                 # HTML shell with Mootion favicon
├── vite.config.ts             # Vite configuration
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite + Express via tsx) |
| `npm run build` | Build for production (Vite + esbuild for server) |
| `npm run start` | Run the production build |
| `npm run lint` | TypeScript type-check |

---

> Built using **Antigravity** — for Evolve AI
