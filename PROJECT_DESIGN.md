# Fullstack Interview OS — Learning Experience Design (v5.2)

## Iteration 6 — implementation contract

The actual product is one connected journey; it is **not** a replacement repository or a cut-down course.

### Primary information architecture
- **Today** `#dashboard`: the exact next incomplete lesson for the selected path, one dominant action, and a five-stage journey preview.
- **Learning Path** `#learn`: five real-data milestones, backend/AI/foundations focus selection, and the full topic library. AWS `#aws` is a post-core-backend two-sprint extension.
- **Build & Prove** `#practice`: exact-topic active recall, related hands-on mission, project/capstone defense. `#projects`, `#interviews`, `#labs`, `#mocks`, `#flashcards`, `#diagrams` and the old path routes remain valid.

### Non-destructive integration
The learner journey metadata lives in `journey-v6.js`, and all real lesson IDs continue to originate from existing `course-*.js` files. One new `aws` track adds ten distinct lessons via `course-aws-architect.js`; deep chapters, exact interview questions and self-verified workshops are separate modules. The four-week backend schedule is unchanged; AWS is additional.

The localStorage key remains `fullstack-os-course-v2`. All old state fields and IDs survive; `awsLabDone` is optional and normalized to an array. Progress is computed from source lessons. Site remains static with no account, cloud provisioning or hosted code grader.

### Visual rules
Maintain the existing editorial light/dark design layers in `learner-journey.css` and `lesson-journey.css`. Warm reading canvas, one action accent, whitespace and dividers; no competing card dashboards. Three nav choices, one strong next action, progressive disclosure, keyboard-visible focus and mobile flow.

### Verification & release gate
`node --test tests/course-integrity.test.cjs` verifies legacy content, exact topic mappings, AWS chapters, and progress fixtures. Playwright CI covers real browser navigation, state persistence and 375px/768px/1440px screenshots, including dark mode. Those checks must pass and screenshots be reviewed before merging into `main`. A green deployment alone is insufficient. Optional learner-run AWS workshops do not demonstrate provisioned infrastructure.

---

## Product intent
One focused learning workspace for an experienced frontend engineer strengthening **backend engineering, GenAI, RAG and agentic AI** for senior fullstack and AI architecture interviews.

The interface should answer three questions without requiring the learner to search through features:
1. **What should I do right now?** The next unfinished lesson from the currently selected path.
2. **Why does it matter?** A short goal, current stage and a visible progression toward practice.
3. **What happens next?** Recall/implement the concept, then use the result in a project or interview.

The site contains **18 tracks, 69 lessons, 173 interview questions, 12 browser coding challenges, 8 local backend missions and 8 local AI missions**. These are learning resources, not 11 separate products.

## Information architecture

Four items in the only primary sidebar navigation:

| Primary section | Job | What moved here |
| --- | --- | --- |
| **Today** `#dashboard` | Show next action and current path progress | One lesson CTA and a three-step learning loop |
| **Learn** `#learn` | Select one direction and progress through it | Backend `#backend`, AI `#ai-path`, Fullstack `#plan`, 18-track library `#curriculum` |
| **Practice** `#practice` | Apply what was just studied | Topic-scoped interviews, coding lab, mock interviews; revision cards as secondary tool |
| **Projects** `#projects` | Prove skills with real deliverables | Three capstones with expandable acceptance criteria |

Architecture diagrams move under Learn as contextual technical reference. Original routes (`#interviews`, `#labs`, `#mocks`, `#flashcards`, `#diagrams`) remain reachable through contextual links and direct URLs, **not** from first-level nav. No content or capabilities are deleted.

### Default and personalization
Backend Engineering is the default study focus (because the learner is already experienced with frontend). The selected path is saved in the existing `fullstack-os-course-v2` localStorage object as `activePath` without resetting completed lessons, notes, check answers, bookmarked questions or lab state.

Path choices: Backend Engineering (four weeks), AI Engineering (four weeks), Fullstack Foundations (eight-day refresher). Switching a path changes **what is recommended next**, not what the learner has completed. Directly navigating to a path synchronizes the selected focus. Deep links to individual lessons remain valid.

## Iteration 2 — teaching as a connected journey

**Key observation:** v5.1 had the right navigation but still treated lessons as long standalone essays and practice as a broad tool collection. The title, lesson material, checkpoint and next action competed for attention.

**Interface decisions**
- Put the next **real lesson title** at the top of Today; remove the generic headline and repeated course/path names.
- Make the reader's three steps unambiguous: **Understand → Apply → Check**. Each step scrolls to the correct source section, with the full content retained rather than cut for visual minimalism.
- Reduce repeated boilerplate headings inside deeply authored lessons. Keep first-principles chapters, source diagrams, code, production examples, scenario analysis, citations and private notes.
- Completion presents one dominant **Practice this lesson** action. The next lesson is secondary because recall is the immediate learning follow-up.
- A lesson-specific practice screen begins with one aligned question and an optional reveal; rating confidence persists without resetting the answer or scroll. Below it, suggest the lab aligned with that lesson's study week.
- Light-first reading UI with saved appearance honored; keep path colors as subtle identity markers only.

**Acceptance criteria:** exact-lesson practice works for every lesson, UI section anchors remain present, no missing course content, after-checkpoint handoff works, cross-path labs do not appear for AI content, original routes and saved state are retained, and both themes work.

**Verified in simulated app checks:** 171 of 171 routes plus direct recall, rating persistence, matching lab links and theme changes. Actual rendered screenshots and viewport checks are a separate task, not claimed as complete.

---

## Learning flow

```
Today
  ↓ start/continue a specific concept
Lesson → explain mechanism → inspect source/diagram → worked example
  ↓ pass checkpoint; optional notes
Practice → recall question(s) in the same track
  ↓
Build → path-specific local mission or browser coding challenge
  ↓
Projects → interview-defensible capstone with explicit acceptance criteria
```

One clearly styled primary action per page. Links to alternate activity types appear only after the user has context. No duplicated recommended-next-lesson cards or redundant tool lists.

### Progressive disclosure
- The active week is expanded by default; future weeks remain collapsible. Do not render four complete weeks as a wall of visible links.
- Full lesson library groups 18 tracks into **Backend and architecture**, **AI Engineering**, and **Fullstack / interview foundations**. It is a reference, not an additional mandatory path.
- Practice begins with a current-topic question and reveals the answer only when the learner chooses. Interview bank, coding lab and mocks form a coherent sequence. Revision cards and architecture maps are inside a small extra-tools disclosure.
- Projects use editorial rows. Deliverables, acceptance criteria and interview defense are in an expandable detail panel. No large stacked cards or promotional illustration banners.

## Visual system

**Look and feel:** focused editorial learning space—clean type, calm neutrals and one meaningful action accent. Avoid overly decorated dashboards, colorful KPI tiles, icon soup, redundant all-caps metadata, shadows and boxes inside boxes.

- Dark: neutral deep charcoal-green canvas `#10191b`; readable off-white `#ebf2ee`; secondary text `#9eb0aa`; hairline `#2d4140`; action color `#a3d5b6`.
- Light: warm near-white canvas `#fafaf7`; dark ink `#20332c`; secondary `#61736b`; hairline `#dce5de`; accessible deep-green action `#286d50`.
- **Path identity**, not general decoration: Backend uses the primary emerald; AI uses muted iris; Fullstack uses a quiet ochre. These appear on tiny path markers only and do not create competing button colors.
- Font hierarchy uses existing Space Grotesk for short page/lesson titles and DM Sans for reading/actions; code retains monospace. Page introduction first, one action second, learning material third, links to reference last.
- Use spacing and horizontal rules instead of panels. Borders stay where editor, forms, source diagrams or user choice warrant them.
- Desktop sidebar 212px; main content capped near 1120px; readable line lengths; responsive one-column flow on mobile.
- Focus-visible styles, reduced motion, keyboard-supported native `details` and coherent active nav state.

## Implementation ownership
- `index.html` — four nav destinations and simplified topbar; existing JS assets remain loaded in order.
- `app.js` — learning-path selection, current lesson, progressive roadmaps, practice hub, concise curriculum index, contextual lesson links, project detail, route highlighting, saved `activePath`.
- `learner-journey.css` — loaded after all previous styles; design tokens, shared learner components, dark/light integration and responsive layout.
- Previous course data JS, deep lesson modules, sourced illustrations, testing exercises and associated local starters are preserved.
- Existing saved progress remains in `fullstack-os-course-v2`.

## Quality bar
1. Fewer than five primary navigation choices; learner can always tell the next step.
2. One prominent primary action and one recommended lesson per entry screen.
3. Today → lesson → practice → project has contextual links with no dead ends.
4. Path switching persists without erasing notes or progress.
5. Every existing route is still functional and sections carry proper nav selection.
6. Dark and light backgrounds, text and action colors stay legible and consistent.
7. Browser/mobile screenshots are required for final visual acceptance when a connected browser is available; simulated DOM checks alone do not prove layout fidelity.

### Regression check
Application route/markup and interaction tests were run against GitHub source with mocked DOM and localStorage. Runtime browser screenshots and local Docker/Node exercises are separate verification tasks. Do not confuse a READY static Vercel deployment with a full integration test of backend/AI workshop code.
