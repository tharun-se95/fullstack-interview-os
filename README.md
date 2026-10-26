# Fullstack Interview OS — Complete Senior Fullstack Crash Course

Live website: https://fullstack-interview-os.vercel.app

A practical, structured interview-preparation application tailored to a senior frontend-heavy fullstack developer with experience in React, Next.js, Node.js, PostgreSQL, healthcare microfrontends, WebSockets and LangGraph.

## Visual edition (v2.1)

The site now includes a custom no-framework SVG artwork engine (`visuals.js`), including:

- A layered isometric engineering dashboard illustration on the homepage
- Eleven distinct vector illustrations for the course-track gallery
- Thirty-three concept-specific visual flow diagrams inside the full lessons
- Six illustrated interactive architecture maps
- SVG progress rings, graphic learning-path banners, illustrated coding/mock sections and image-backed practice and portfolio feature cards
- Responsive visual styling, subtle movement and reduced-motion handling (`visual-theme.css`)

Two remote Unsplash photos are loaded lazily: the developer workspace photo on the dashboard and the infrastructure photograph on the projects page. The vectors are authored directly in the repository; the photos require an internet connection and fall back visually to dark gradients if blocked.

## What is actually in the course

- **11 progressive tracks and 33 complete lessons** — every lesson has a skill objective, a substantial explanation, annotated production-oriented code, common trap, hands-on task, worked answer and multiple-choice comprehension check.
- **110 answered interview questions** — categorized by topic and difficulty, with a model answer, interviewer follow-up and self-assessed confidence state.
- **12 runnable JavaScript coding challenges** — starter code, requirements, progressive hints, reference solution, and 32 automated tests evaluated locally inside a short-lived Web Worker.
- **Six interactive visual architecture maps** — request lifecycle, event loop, microfrontend shell, database transaction/idempotency, real-time fleet tracking, and LangGraph compliance review. Click each boundary to read its responsibility and failure risks.
- **Six guided mock interviews** — fullstack system design, React performance, Node/SQL signup, WebSocket architecture, LangGraph SOP review and senior behavioral stories, each with a structured rubric and sample answer outline.
- **An eight-day crash plan** — daily lesson assignments, coding practice, interview prompts and day completion.
- **Three serious capstone briefs** — private diagnostics portal, live fleet tracking and auditable SOP review, each with deliverables, acceptance checks and interview defense topics.
- Browser-local lesson notes, completion, interview revision flags, bookmarks, coding drafts, mock answers and progress.

### Curriculum

1. JavaScript Internals
2. TypeScript Architecture
3. React Deep Dive
4. Next.js & Core Web Vitals
5. Node.js & Express APIs
6. SQL & PostgreSQL
7. Authentication & App Security
8. Testing, CI/CD & Observability
9. Fullstack System Design
10. AI Engineering & LangGraph
11. Resume Defense & Interview Strategy

## Local development

Dependency-free static website. Clone the repository and serve from a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

The data is stored in the course-*.js, interview-*.js and coding-labs.js files. The player is implemented in app.js, and styles in styles.css.

## Deployment

Connect this GitHub repository to the Vercel project `fullstack-interview-os` and deploy the `main` branch. The project uses a static framework preset (no build command).

## Limitations and privacy

- The mock interviewer uses **self-assessment rubrics, not LLM grading**.
- JavaScript code runs **only in a local browser Web Worker** and is stopped after a short deadline. The editor is **not a secure multi-tenant sandbox**. Do not paste secrets.
- TypeScript and SQL examples are teaching material, not executed in the JS coding runner.
- Notes and progress live in **localStorage on the current browser/device**; there is no account sync or backend.
- Course explanations are educational and may vary with framework/library versions; verify version-specific behavior against official documentation.

## Learning model

Read → explain aloud without notes → solve the practice exercise → compare solution → pass checkpoint → answer interview questions → revisit weak areas.
