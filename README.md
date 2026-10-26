# Fullstack Interview OS — Complete Senior Fullstack Crash Course

Live website: https://fullstack-interview-os.vercel.app

A practical, structured interview-preparation application tailored to a senior frontend-heavy fullstack developer with experience in React, Next.js, Node.js, PostgreSQL, healthcare microfrontends, WebSockets and LangGraph.

## Curated third-party lesson diagrams (v2.2)

The original SVG concept sketches in the lessons were replaced by **41 existing technical diagrams across all 33 lessons** (33 main visuals + 8 supplementary diagrams). The collection is defined in `lesson-media.js`, and the viewer is styled in `lesson-media.css`.

- Every lesson shows the original diagram, an explanatory “what to notice” prompt, the author/publisher credit, a link to its publication and a full-resolution media link.
- Some lessons offer an expandable additional-diagram gallery.
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
