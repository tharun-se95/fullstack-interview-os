# Fullstack Interview OS — Complete Senior Fullstack Crash Course

## Generative AI · RAG · Agentic AI expansion (v5.0)

**Three full engineering courses are now integrated into the site** at [#ai-path](https://fullstack-interview-os.vercel.app/#ai-path). They build on the user's frontend-heavy fullstack background, emphasizing Node services, trusted boundaries, datasets, SQL/pgvector, source citations, tool orchestration and deployed reliability rather than general prompt tips.

**New content:** 3 tracks, **20 lessons**, **60 full-length deep chapters**, **40 new senior interview questions**, **8 local AI workshop missions**, and a **four-week / approximately 80-hour** progressive path.

- **Generative AI Engineering** (6 lessons, 11h): transformer/tokens/attention, model API design, prompt contracts and injection, structured outputs vs business validation, streaming and conversation state, model selection/evals/fine-tuning/cost.
- **Retrieval-Augmented Generation (RAG)** (7 lessons, 12h): index/query architecture, PDF/OCR/chunk provenance, embeddings/pgvector, hybrid keyword+semantic search with RRF/reranking, citations and contradictions, multi-tenant ACL/injection/deletion, RAG evaluations and observability.
- **Agentic AI & LangGraph Systems** (7 lessons, 14h): tool-call execution loops, typed graphs/nodes/edges, checkpoint memory and recovery, human-in-the-loop approval, bounded multi-agent delegation, agentic RAG, trajectory/security evaluation and production operations.

The existing 3-lesson AI overview is retained as **Applied AI Architecture Cases**. Backend-first tracks and the original frontend/interview content are unchanged. The global course now has **18 tracks, 69 lessons and 173 questions**. This release does not modify existing localStorage progress; it adds the `aiLabDone` key for self-reported workshop completion.

### Hands-on roadmap

The new `#ai-path` route organizes fundamentals → RAG → evidence/evaluation → safe agents. Eight workshop missions culminate in an auditable SOP review copilot with versioned document retrieval, citation validation, explicit no-evidence outcomes, LangGraph approvals and retry-safe actions.

The [AI practice starter](./ai-lab-starter) is an intentionally small **zero-dependency local Node.js project**. It includes two fictional tenants, current/retired policy fixtures, an offline lexical retrieval baseline, recall@k evaluation, a strictly read-only bounded fake agent executor, and Node's built-in automated tests. Execute locally with:

```sh
cd ai-lab-starter
npm test
npm run demo
```

Live embeddings, OpenAI model inference, pgvector and LangGraph runtime/checkpointing are **guided upgrade exercises**, not features falsely claimed to be provided by this static frontend. The demo cannot run an external LLM and it does not certify production quality. A no-secret [AI practice CI workflow](./.github/workflows/ai-lab-tests.yml) is included.

### Visual design, sources and limitations

The minimal Tasteful UI editorial design is preserved. Every new AI lesson has a topic-specific vector mechanism diagram; several LangGraph/agentic lessons additionally link original third-party technical diagrams with publisher credit and usage note (hosted by the originals). Official OpenAI, LangChain/LangGraph, pgvector, Hugging Face, Microsoft architecture and OWASP documentation are linked by lesson.

The website's checkpoints, saved course progress, interview bank and theme system are retained. Route and interaction simulations do not substitute for real browser screenshot inspection or execution of the user's local Docker/AI environment. Version-specific provider SDK snippets should be checked against the installed version before integration, and all model calls/tools need auth, budgets and safety evaluation.

---

## Backend-first expansion (v4.0)

**Why:** The learner already has substantial React/Next.js frontend experience but wants confidence implementing and operating Node backends independently. The default dashboard, curriculum track order and dedicated sidebar route now prioritize backend development. The original frontend, system design and AI lessons remain available, and saved progress uses the same storage key.

**Current totals:** 15 tracks, 49 lessons, 133 interview questions, 12 original browser JavaScript labs, **8 additional local backend engineering workshop missions**, and a four-week backend path at roughly 20 hours per week. The 16 newly authored lessons include deep chapters, code walkthroughs, failure-analysis case studies, checkpoints and interview answers. Existing lessons remain as authored.

### Newly added tracks
- **Backend API Engineering** (4 lessons): HTTP contracts/keyset pagination, controller/service/repository boundaries, runtime validation/DTO sanitization, streaming upload/export with backpressure.
- **MongoDB, Redis & Data Design** (4 lessons): document modeling, Mongo queries/aggregation/indexes, Redis caching and stampedes, Postgres vs MongoDB decisions and safe migrations.
- **Queues, Events & Reliable Systems** (4 lessons): durable BullMQ jobs, idempotency and transactional outbox, verified webhooks, distributed rate limits and WebSockets.
- **Backend Deployment & Operations** (4 lessons): Docker/Compose, DB integration tests, cloud networking/IAM/storage, tracing and incident debugging.

### Practical program
`#backend` is the dedicated backend-first roadmap. It organizes the highest-value original and new topics into **four learning weeks** with eight implementation missions:

1. Boot a local Express/TypeScript/Postgres service and inspect request flow.
2. Validate request schemas, implement safe DTOs and prove HTTP error contracts.
3. Implement cursor pagination and test duplicate requests against real Postgres.
4. Implement signed/revocable sessions and two-tenant authorization tests.
5. Add safe Redis cache-aside plus stampede/failure controls.
6. Implement a BullMQ export worker, durable outbox and replay idempotency.
7. Build a production-shaped Docker + CI workflow and a safe sandbox deployment.
8. Present an architecture defense and operational incident review.

The supplied [backend-starter](./backend-starter) contains a small learning-only Express/TypeScript/PostgreSQL service, sample Compose/Postgres initialization, example health routes, demo idempotent POST and initial automated tests. **It deliberately uses a local demo token and fixed demo tenant and refuses production mode; never deploy it publicly without replacing demo security.** The browser merely displays the workshop instructions and saves self-reported completion—it cannot execute local Docker or attest backend tests.

New content: `backend-track-{api,data,async,ops}.js`, `backend-workshop.js`, `backend-focus.css`, `backend-starter/`. The new backend lesson art uses conceptual SVG flows; curated third-party imagery from the existing 33 lessons is preserved.

### Verification limits
New content was syntax-tested and tested through simulated route rendering, checkpoint mastery, and workshop toggle behavior. The full local Node dependency installation, Docker Compose, Postgres integration tests, browser visual screenshots and remote end-to-end workshop completion were **not** executed in this environment; they remain hands-on tasks with explicit acceptance criteria. A deployment marked READY proves Vercel served the static files, not that the local backend starter has passed production tests.

---



Live website: https://fullstack-interview-os.vercel.app

A practical, structured interview-preparation application tailored to a senior frontend-heavy fullstack developer with experience in React, Next.js, Node.js, PostgreSQL, healthcare microfrontends, WebSockets and LangGraph.

## Source illustration carousel (v3.3)

The lesson's curated visual references now appear in a **single, manually controlled carousel**, instead of a main diagram followed by an expandable grid. The data in `lesson-media.js` is unchanged: 41 external image references across 33 lessons, including 8 lessons with multiple sources.

- When two or more diagrams exist, display exactly one at a time with **Previous / Next** buttons, position counter, clickable pagination dots, keyboard arrow navigation, and horizontal touch swipes.
- When one diagram exists, display it directly without redundant navigation.
- Keep original image aspect ratio, full-resolution asset link, publisher/source credit, usage terms and “what to notice” explanatory text associated with each slide.
- Navigation wraps around; no autoplay. Inactive slides are hidden from the visual layout and assistive-technology tree. Counters announce position changes, pagination buttons expose their selected state, and reduced-motion users receive no entrance animation.
- Implementation lives in `app.js` and the final-loaded `tasteful-refinement.css`. There are no added dependencies and saved course progress remains unchanged.

Validation: 33/33 lesson media render checks, correct source/credit associations, and simulated Previous, Next, wraparound, direct selection, keyboard and touch behavior all passed. Remote hosts may still block image embedding; original source URLs remain accessible.

## Tasteful UI editorial redesign (v3.2)

This release rethinks the interface as a **calm engineering field guide**, following the process and anti-generic design principles in [Tasteful UI](https://github.com/DonkeyKing01/tasteful-ui-skill). The project-specific decisions are documented in [PROJECT_DESIGN.md](./PROJECT_DESIGN.md).

**Primary change: no more box-inside-box visual structure.** Large promotional panels, repeating track-card tiles, heavy gradient/blur chrome, deeply framed reader sections, and stacked navigation cards have been replaced with an open, reading-first hierarchy:

- Dashboard focuses on the next lesson; progress is an unboxed summary, and practice tools are quiet links.
- Curriculum uses an ordered index with illustrations, names, descriptions, estimated time and completion progress.
- Deep lessons begin with the mental model, followed by the real source diagram, structured chapters, code, production case, practice, and interview answer. One slim rail replaces three stacked cards; a responsive section-jump menu preserves quick navigation on mobile.
- Interview questions, mocks, roadmap, projects and architecture diagrams use divider-based sections and restrained interactive surfaces.
- Both light and dark schemes use corresponding neutral canvases and a readable green-teal action accent; intentionally dark code and illustration panels remain.

The design references are Mintlify-style reading proportions and Notion-style open content, **not copies of their brand styling**. Existing content, source attributions, bookmarked notes, quizzes, code execution and local progress remain.

Implementation: `app.js` changes the markup for the high-priority user journeys and adds page-specific class hooks; `tasteful-refinement.css` is loaded last to simplify the full application with responsive variants. Content is unmodified.

Verification: 53 route-render cases passed, including 33 lessons and all 11 track pages; mock checks confirmed checkpoint/mastery and theme switching. CSS import ordering and balanced syntax delimiters were checked. Live browser visual screenshots were not available to the static checks and should be reviewed separately after deployment.

## Light-theme repair (v3.1)

Light appearance now has a complete high-contrast palette rather than the older partial overrides. The last-loaded `light-theme.css` supplies consistent styling across sidebar/header, all dashboard and course cards, the deep lesson reader, source-image galleries, knowledge checks, interview answers, flashcards, architecture diagrams, forms and mobile navigation. Dark illustrations, image-led banners and code/terminal surfaces remain intentional visual islands with readable text.

Theme switching retains the user's selection in localStorage, labels the next switch action accessibly, updates the browser theme-color and restores light mode before first paint on a new page load. The dark theme retains its existing styling. Route/state and static contrast checks cover the major screens; individual remote image hotlink behavior is outside the local CSS checks.

## In-depth senior course edition (v3.0)

The prior ~120–170-word lesson summaries were too thin. **All 33 lessons now contain extended teaching modules** across 11 tracks. The course contains **105 new deep-reading chapters**, about **20,800 additional words** of authored instruction (about 25,500 words including the older concept summaries, excluding source code), plus the original coding exercises, test runner, diagrams and interview bank.

Each expanded lesson now presents:

1. An opening mental model and curated explanatory diagram.
2. Three or four structured chapters unpacking mechanisms and execution ordering, with runnable/annotated examples where relevant.
3. A worked production code example and explicit pitfalls.
4. A **realistic production failure case** (situation, investigation, solution, design trade-off and testable assignment).
5. A hands-on task with worked solution, and a clear senior-level verbal interview answer to rehearse.
6. A knowledge checkpoint required for marking the lesson mastered, personal notes and official documentation/reference links.

The reader has chapter navigation, section jump controls, redesigned long-form typography and consistent supporting source credits. Content is stored in the ten `depth-*.js` files; `deep-course.css` styles the reader. Existing locally saved progress remains under the original storage key, so it is preserved across the upgrade.

These lessons emphasize understanding production mechanisms and debugging decisions, not memorizing a glossary. Course content is educational; version-specific framework behavior must be verified against the linked primary references.

## Curated third-party lesson diagrams (v2.2)

The original SVG concept sketches in the lessons were replaced by **41 existing technical diagrams across all 33 lessons** (33 main visuals + 8 supplementary diagrams). The collection is defined in `lesson-media.js`, and the viewer is styled in `lesson-media.css`.

- Every lesson shows the original diagram, an explanatory “what to notice” prompt, the author/publisher credit, a link to its publication and a full-resolution media link.
- Lessons with several curated diagrams show a navigable illustration carousel with Previous/Next controls; single-source lessons retain one direct visual.
- **Rights & availability:** Third-party diagrams are **linked from their original hosts, not copied into this repository**. Many are covered by CC BY, CC BY-SA, CC0 or documentation terms; others are copyright of their publishers and are included as offsite references with visible attribution. Linking is **not** a blanket license to reproduce, sublicense, or redistribute these images. Confirm each source's permissions before commercial use. Hosts may block hotlinking or change media URLs, so the website includes a source-link fallback.
- Prefer official docs and Commons vector illustrations where possible. Original files may be higher resolution than their preview; the UI preserves aspect ratio and offers a “full-size” link.

### Media credits by lesson

| Lesson | Referenced visual | Author / publisher (source) | Rights note |
|---|---|---|---|
| `js-closures` | Lexical scope and function closure | [Varshini P. S. / Medium](https://medium.com/@psvarshini34/understanding-closures-in-javascript-45c43938821a) | Original source · externally linked |
| `js-event-loop` | JavaScript agent with call stacks, heaps and queues | [MDN contributors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) | CC BY-SA |
| `js-async` | Sequential versus parallel asynchronous execution | [CodeMiner42](https://blog.codeminer42.com/async-code-demystified-promises-fetch-and-reacts-useeffect/) | Original source · externally linked |
| `ts-unions` | Discriminated union type narrowing example | [Amit Digga / Medium](https://medium.com/@diggaamitoo7/typescript-vs-javascript-the-non-benchmarkable-stuff-5575b845e766) | Original source · externally linked |
| `ts-generics` | TypeScript generics explained visually | [The Syntax Diaries / Medium](https://medium.com/the-syntax-diaries/typescript-generics-are-not-that-hard-youre-just-learning-them-backward-3ab098cd7f18) | Original source · externally linked |
| `ts-utils` | Generic types and TypeScript utility patterns | [Web Tech Journals / Medium](https://medium.com/web-tech-journals/think-you-know-generics-these-typescript-tricks-will-surprise-you-ea4ee22129a2) | Original source · externally linked |
| `react-render` | React rendering illustration | [React documentation contributors](https://react.dev/learn/render-and-commit) | CC BY 4.0 |
| `react-effects` | React component lifecycle diagram | [CCSW tutorials](https://ccsw-csd.github.io/tutorial/site/cleancode/react/) | Original source · externally linked |
| `react-state` | React component state tree diagram | [React documentation contributors](https://react.dev/learn/preserving-and-resetting-state) | CC BY 4.0 |
| `next-modes` | Next.js browser and server execution environments | [Next.js / Vercel documentation](https://nextjs.org/learn/react-foundations/server-and-client-components) | Official docs · externally linked |
| `next-lcp` | LCP breakdown showing the loading phases | [Google Chrome Developers / web.dev](https://web.dev/articles/optimize-lcp) | Official docs · externally linked |
| `next-cache` | Read-through search service with in-memory cache | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| `node-runtime` | Reactor pattern component architecture | [Zar2gar1 / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Reactor_Pattern_-_UML_2_Component_Diagram.svg) | See source license · Wikimedia Commons |
| `node-http` | Web-server request path and service architecture | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| `node-reliability` | Queue, worker, cache and database layout in a scaled web system | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| `sql-joins` | SQL joins with set-intersection illustrations | [Arbeck / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:SQL_Joins.svg) | CC BY 3.0 |
| `sql-index` | PostgreSQL B-tree index structure | [Kelti / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:PostgreSQL_B-tree.svg) | CC BY-SA 4.0 |
| `sql-tx` | Concurrent transaction ordering example | [Shivam Bhadani / Medium](https://medium.com/@shivambhadani_/acid-properties-explained-a-complete-guide-with-postgresql-implementation-071afa6aaf8a) | Original source · externally linked |
| `auth-flow` | Browser-to-backend authentication and token flow | [Auth0 / Okta](https://auth0.com/blog/the-backend-for-frontend-pattern-bff/) | Official article · externally linked |
| `auth-threats` | Web security: XSS, CSRF and HTTPS infographic | [Egghead.io](https://egghead.io/courses/web-security-essentials-mitm-csrf-and-xss) | Original source · externally linked |
| `auth-authorization` | Identity and authentication decision tree | [Nata831 / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Flowchart_-_User_authentication.svg) | See source license · Wikimedia Commons |
| `test-pyramid` | Automated testing pyramid | [Abbe98 / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Testing_Pyramid.svg) | CC BY-SA 4.0 |
| `test-ci` | Continuous delivery versus continuous deployment | [Joe2026 / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Continuous_Delivery_Vs._Continuous_Deployment.svg) | CC0 |
| `test-observability` | Distributed tracing: parent and child span waterfall | [OpenTelemetry contributors](https://opentelemetry.io/docs/concepts/observability-primer/) | Official docs · externally linked |
| `sys-estimation` | Production-scale web system architecture | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| `sys-caching` | A searchable system using an in-memory cache | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |
| `sys-realtime` | GPS location streaming using REST and WebSockets | [Piotr Radziszewski](https://radd.github.io/) | Original source · externally linked |
| `ai-graphs` | LangGraph human approval node and tool execution workflow | [LangChain / LangGraph documentation](https://github.com/langchain-ai/langgraphjs/blob/main/docs/docs/agents/human-in-the-loop.md) | Official project docs · externally linked |
| `ai-rag` | Retrieval-augmented generation pipeline | [Parnchananchida / Medium](https://medium.com/@parnchananchida/langchain-chat-with-your-data-a0f98a7b6a9b) | Original source · externally linked |
| `ai-evals` | Production agent workflow example | [LangChain / Lyft engineering](https://www.langchain.com/blog/lyft-built-a-self-serve-ai-agent-platform-for-customer-support-with-langgraph-and-langsmith) | Original source · externally linked |
| `resume-stories` | Architecture trade-offs triangle: performance, cost and complexity | [Jitendra Rautela / Medium](https://medium.com/@jitukot2000/every-architecture-is-a-compromise-0930d9b587d1) | Original source · externally linked |
| `resume-leadership` | Production incident-response lifecycle | [ShadowHQ](https://www.shadowhq.io/blog/the-incident-response-life-cycle-what-you-need-to-know) | Original source · externally linked |
| `resume-interview-plan` | System-design study roadmap illustration | [Donne Martin / System Design Primer](https://github.com/donnemartin/system-design-primer) | CC BY 4.0 |

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
