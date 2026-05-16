# 🎬 Mootion – EvolveAI

> **An AI-powered STEM learning platform** that unifies visual understanding, structured navigation, and interactive retention in one seamless flow.

![Mootion Banner](https://via.placeholder.com/1200x300?text=Mootion+EvolveAI+STEM+Learning+Platform)

---

## 📖 Project Description

**Mootion** was built for the **AI4India** hackathon by **Evolve AI** — a team targeting the 250+ million STEM learners in India who have access to content but lack a unified system to understand, navigate, and retain it.

### The Problem
STEM education is **fragmented and passive**:
- Spatial concepts trapped in text
- Dynamic phenomena frozen in static diagrams
- No single platform integrating explanation, visualization, and active recall
- Students waste hours switching between videos, PDFs, and broken simulations

### The Solution
Mootion bridges the gap across **three core modules**:

| Module | Purpose |
|--------|---------|
| **🎥 ASK** | Generate concept-specific Manim videos, physics simulations, and immersive 3D visualizations on demand |
| **🗺️ PLAN** | Convert syllabuses into navigable visual roadmaps with topic dependencies |
| **🎮 PLAY** | Reinforce retention through adaptive games: Prove It, Find the Mistake, Listen, Flashcards |

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOOTION PLATFORM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │   Frontend   │   │   Backend    │   │  AI Models   │         │
│  │  (React)     │   │  (FastAPI)   │   │  (LLM, TTS)  │         │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                 ┌──────────┼──────────┐                           │
│                 │          │          │                           │
│            ┌────▼────┐ ┌───▼────┐ ┌──▼────┐                      │
│            │  Video  │ │  Sim   │ │ Games │                      │
│            │  Gen    │ │ Engine │ │ Modes │                      │
│            └─────────┘ └────────┘ └───────┘                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Video Generation Pipeline

```
INPUT (Concept / Query)
  ▼
┌────────────────────────────────────────────────┐
│  1. LLM – Scene Generator                      │
│     → Produces JSON scene structure + category │
├────────────────────────────────────────────────┤
│  2. LLM – Manim Video Code Generator           │
│     → Generates Manim Python code + timestamps │
├────────────────────────────────────────────────┤
│  3. LLM – Script Writer (Optional)             │
│     → Creates narration/dialogue script        │
├────────────────────────────────────────────────┤
│  4. TTS / SadTalker                            │
│     ├─ If persona mode → SadTalker (with face) │
│     └─ Else → Azure TTS (voiceover)            │
├────────────────────────────────────────────────┤
│  5. Video Stitcher                             │
│     → Merges Manim video + audio               │
└────────────────────────────────────────────────┘
  ▼
OUTPUT (MP4 Video)
```

### Simulation Engine Pipeline

```
INPUT (Physics Concept + Equations)
  ▼
┌────────────────────────────────────────────────┐
│  1. LLM – Simulation Planner                   │
│     → Outputs solver type, time range, params │
├────────────────────────────────────────────────┤
│  2. Numerical Solver                           │
│     ├─ Runge-Kutta (ODE)                       │
│     ├─ PDE Solver                              │
│     └─ Particle Physics Engine                 │
├────────────────────────────────────────────────┤
│  3. LLM – Scene Mapper                         │
│     → Maps variables to visual properties      │
│        (color, size, camera path, etc.)        │
├────────────────────────────────────────────────┤
│  4. Renderer (Three.js / WebGL)                │
│     → Real-time interactive visualization      │
└────────────────────────────────────────────────┘
  ▼
OUTPUT (Interactive Simulation)
```

### Interactive Games Pipeline

```
INPUT (Topic + Concept)
  ▼
┌────────────────────────────────────────────────┐
│  1. LLM – Question Generator                   │
│     → Creates tailored Q&A / challenges        │
├────────────────────────────────────────────────┤
│  2. Game Engine                                │
│     ├─ Prove It (explanation validation)       │
│     ├─ Find the Mistake (error identification) │
│     ├─ Listen (audio comprehension)            │
│     ├─ Flashcards (spaced repetition)          │
│     └─ Wrong One (odd-one-out)                 │
├────────────────────────────────────────────────┤
│  3. Scoring & Feedback                         │
│     → Real-time progress tracking              │
└────────────────────────────────────────────────┘
  ▼
OUTPUT (Adaptive Learning)
```

---

## 🔄 Data Flow & User Journey

```
┌──────────────────┐
│   User Selects   │
│   Topic/Concept  │
└────────┬─────────┘
         ▼
┌──────────────────────────────────────┐
│  EXPLORE (Visual Understanding)      │
├──────────────────────────────────────┤
│  ├─ 📺 Storyboard (Manim video)      │  (10s generation)
│  ├─ 🎲 Playground (Interactive sim)  │  (10s generation)
│  └─ 🌌 Universe (3D visualization)   │
└────────┬─────────────────────────────┘
         ▼
┌──────────────────────────────────────┐
│  LEARN (Structured Navigation)       │
├──────────────────────────────────────┤
│  ├─ 🗺️ Concept Roadmap               │
│  ├─ 📚 Syllabus Breakdown            │
│  └─ 📖 Related Topics                │
└────────┬─────────────────────────────┘
         ▼
┌──────────────────────────────────────┐
│  REINFORCE (Active Recall)           │
├──────────────────────────────────────┤
│  ├─ 💬 Prove It (Chat mode)          │
│  ├─ 🎯 Challenge (MCQ)               │
│  ├─ 🎧 Listen (Comprehension)        │
│  ├─ 🃏 Flashcards (Spaced recall)    │
│  └─ ❌ Wrong One (Identification)    │
└────────┬─────────────────────────────┘
         ▼
┌──────────────────────────────────────┐
│  📊 Progress & Analytics             │
│  (Retention metrics & recommendations)
└──────────────────────────────────────┘
```

---

## 🎬 Demo & Screenshots

### Demo Video

[Insert Demo Video Here]

```
📺 Full Platform Walk-through (3min)
   Click above to watch Mootion in action
```

### Key Screenshots

#### 1. **Concept Selection & Exploration**
![Concept Selection Screenshot](https://via.placeholder.com/600x400?text=Concept+Selection+Interface)
*Select a concept and instantly see multiple visualizations*

#### 2. **Video Generation (Storyboard)**
![Video Generation Screenshot](https://via.placeholder.com/600x400?text=Storyboard+View)
*AI-generated Manim videos explaining complex concepts*

#### 3. **Interactive Simulation (Playground)**
![Simulation Screenshot](https://via.placeholder.com/600x400?text=Interactive+Simulation)
*Real-time physics simulations with parameter controls*

#### 4. **3D Visualization (Universe)**
![3D Viz Screenshot](https://via.placeholder.com/600x400?text=3D+Universe+View)
*Immersive Gaussian splat 3D visualizations*

#### 5. **Interactive Games (Prove It, Challenge, etc.)**
![Games Screenshot](https://via.placeholder.com/600x400?text=Learning+Games)
*Adaptive learning games for retention*

#### 6. **Syllabus Roadmap**
![Roadmap Screenshot](https://via.placeholder.com/600x400?text=Concept+Roadmap)
*Visual dependency graph of topics*

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion port)
- **State Management**: React Hooks
- **Flow Diagrams**: XYFlow
- **3D Graphics**: Three.js / WebGL

### Backend
- **Server**: FastAPI 0.124
- **Async**: AsyncIO, Uvicorn
- **Video Generation**: Manim 0.19.1
- **LLM Integration**: Google GenAI, OpenAI API
- **TTS**: Azure Cognitive Services Speech
- **Face Animation**: SadTalker
- **Physics**: NumPy, SciPy (ODE/PDE solvers)

### AI & ML
- **LLM**: GPT-4 / Gemini (via API)
- **Text-to-Speech**: Azure TTS, ElevenLabs (optional)
- **Video Synthesis**: SadTalker, Manim
- **3D Rendering**: Gaussian Splatting

### Database & Storage
- **SQLAlchemy** (ORM)
- **Vector Store** (for embeddings & retrieval)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **Python** >= 3.10
- **FFmpeg** (for video processing)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/evolve-ai/mootion-evolveai.git
cd mootion-EvolveAI
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```

### Running Locally

#### Start Backend Server
```bash
cd backend
python app/main.py
# Server runs on http://localhost:8000
```

#### Start Frontend Dev Server
```bash
cd Frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### Build for Production
```bash
# Frontend
cd Frontend
npm run build
npm run start

# Backend (with gunicorn)
cd backend
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

---

## 📁 Project Structure

```
mootion-EvolveAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/                 # API routes
│   │   ├── core/                # Core business logic
│   │   ├── services/            # Service layer
│   │   ├── stages/              # Pipeline stages
│   │   │   ├── stage1_scenes.py      # Scene generation
│   │   │   ├── stage2_manim.py       # Video rendering
│   │   │   ├── stage3_script.py      # Script writing
│   │   │   ├── stage4_tts.py         # Audio synthesis
│   │   │   ├── stage5_stitch.py      # Video stitching
│   │   │   ├── gaussian/             # 3D visualization
│   │   │   └── simulation/           # Physics solver
│   │   ├── utils/               # Helper functions
│   │   └── vectorstore/         # Vector DB integration
│   ├── ai_models/
│   │   └── SadTalker/           # Face animation model
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── main.tsx             # React entry point
│   │   ├── App.tsx              # Root component
│   │   ├── ConceptWorkspace.tsx # Main learning interface
│   │   ├── Onboarding.tsx       # Onboarding flow
│   │   ├── Roadmap.tsx          # Syllabus visualization
│   │   └── ...                  # Other components
│   ├── public/
│   │   ├── assets/              # Static assets
│   │   ├── playground/          # Simulation HTMLs
│   │   └── universe/            # 3D viz
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── assets/
│   ├── images/
│   └── gifs/
│
└── README.md
```

---

## 🎯 Key Features

### ✨ Instant Content Generation
- **Manim Videos**: AI-generated explanatory videos with animations
- **Interactive Simulations**: Physics-based interactive visualizations
- **3D Gaussian Splats**: Immersive spatial understanding

### 🧠 Adaptive Learning Modes
- **Prove It**: Chat-based explanation validation
- **Challenge**: Multiple-choice questions with instant feedback
- **Listen**: Audio comprehension and recall
- **Flashcards**: Spaced repetition algorithm
- **Wrong One**: Odd-one-out identification game

### 📚 Structured Knowledge Navigation
- **Concept Roadmap**: Visual dependency graph
- **Syllabus Breakdown**: Topic-by-topic organization
- **Cross-linking**: Related concepts and prerequisites

### 📊 Analytics & Progress
- Real-time performance tracking
- Adaptive difficulty scaling
- Retention metrics
- Personalized recommendations

---

## 🔌 API Endpoints

### Video Generation
```
POST /api/video/generate
Body: { topic, subtopic, style?, persona? }
Response: { video_url, generation_time, metadata }
```

### Simulation
```
POST /api/simulation/generate
Body: { concept, equations, solver_type }
Response: { simulation_config, initial_data }
```

### Games & Practice
```
POST /api/practice/challenge    # MCQ generation
POST /api/practice/flashcards   # Flashcard deck
POST /api/practice/listen       # Audio comprehension
POST /api/practice/wrong-one    # Odd-one-out game
```

### Chat (Prove It)
```
POST /api/chat/prove-it
Body: { topic, message, conversation_history }
Response: { feedback, score, suggestions }
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m "Add amazing feature"`
4. **Push**: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Write clean, well-documented code
- Follow existing code style (Prettier for JS, Black for Python)
- Add tests for new features
- Update documentation

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👥 Team

**Evolve AI** — AI4India Hackathon Participant

- **Mission**: Making STEM education accessible, engaging, and effective for millions of learners

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/evolve-ai/mootion-evolveai/issues)
- **Email**: contact@evolveai.com
- **Discord**: [Join our community](https://discord.gg/evolveai)

---

## 🙏 Acknowledgments

- **Manim Community** for the animation library
- **OpenAI / Google** for LLM APIs
- **Three.js Community** for 3D rendering
- **All STEM educators** inspiring this platform

---

## 📈 Roadmap

- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Collaborative learning features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Teacher portal
- [ ] API for third-party integrations

---

<div align="center">

**Made with ❤️ for STEM learners everywhere**

[⭐ Star this repo](https://github.com/evolve-ai/mootion-evolveai) if you find it helpful!

</div>
