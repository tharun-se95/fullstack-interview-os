# PROJECT_DESIGN — Fullstack Interview OS v3.2

## Product and implementation context
- Product: self-paced senior fullstack learning and interview-preparation website, 11 tracks, 33 lessons, 110 interview questions, coding labs, architecture maps, mocks, notes and saved progress.
- Audience: experienced frontend engineer becoming an interview-ready senior fullstack / AI architect.
- Primary job: find the next useful learning step; study one topic deeply; practice and verify understanding.
- Stack: existing static HTML, vanilla JS data-driven client router, CSS, localStorage. Preserve hashes, handlers, content and stored progress.
- Surfaces: overview, curriculum, tracks, lesson reader, labs, bank, revision, mocks, projects, maps, responsive navigation.

## Audit of original
- Positive cue to preserve: clear course track terminology, custom technology illustrations, real source diagrams, completion states and labs.
- Failures: dark oversized marketing hero for an operational learning tool; excessive decorative gradients and category cards; card inside card inside card in lessons, plans, labs and diagrams; numerous all-caps labels; noisy heavy shadows and tight reading line height; sidebar uses too much real estate.
- Critical user directive: **avoid box inside boxes; implement proper visual hierarchy**.

## Taste direction
**Calm, editorial engineering field guide.** A technical reading/productivity workspace with a quietly capable nav, large confident page headings, compact metadata, uncluttered reading column and a restrained accent for real actions.
- Product-fit reasons: study sessions are long; visual hierarchy should serve comprehension and practice, not sell a product the user already uses.
- Explicitly reject: glassmorphism, fake SaaS KPI cards, decorative glows, nested card grids, graphic ornaments without information, dramatic homepage marketing, dark by default.
- References: Mintlify's reading-first documentation proportions; Notion's spare canvas, lightweight navigation, divider-based grouping. Transfer whitespace, typescale, TOCs, focus states; **do not copy brand colors, logos or exact patterns**.
- The skill's confirmation gates are interpreted through the user's explicit directive to implement this structural taste in the existing app without waiting for further selection.

## Visual hierarchy
1. Page title + clear task or progress.
2. One dominant next action.
3. The primary reading, practice or selection surface.
4. Inline progress/status and relevant utilities.
5. Context, references and secondary links.
Typography: 36–44px h1 on desktop; 26–30px h2; 19–22px h3; 16–17px body at ~1.7 line height; micro-labels only for actual status. Reading measure ~72ch, monospace exclusively for code, numbers, step captions.
Use DM Sans / Space Grotesk existing assets; no new third-party fonts.

## Color and structure
- Light: #fafbf9 canvas; #202d34 body ink; #607178 secondary; #dfe5e2 dividers; #35594f green-teal accent; #f0f5f2 soft interaction, neutral white reading.
- Dark: #10191d canvas; #e5edec ink; #a9bbb7 secondary; #2b393c dividers; #82bead accent; #182522 soft interaction.
- Keep image-led/media and code areas dark only where meaningful. Never place contrast-sensitive text over a generated glow.
- Flat sections separated by whitespace/one line, not stacked cards. Borders on forms and editor only; almost no shadows.
- Content width: 1120–1200px overall; reader center 700–750px plus 220px slim TOC; minimal side navigation 212–228px. Mobile 100% without nested scroll panels.
- Spacing increments 8/12/16/24/32/48/64. One divider between neighboring content sections.
- Buttons: one primary per region, understated text actions for others. 40–44px touch targets and visible focus.

## Component guidance
- Dashboard: compact editorial intro, learning continuity with next lesson as primary action, unobtrusive unboxed progress stats, compact track list; one curated feature image at most if beneficial.
- Curriculum: sequential editorial track rows with short descriptions, progress indication, small illustration; no grid of identical boxes.
- Track: open header and overview, linked ordered lesson rows.
- Lesson: remove duplicated objective card; introduce concept first, then media; chapter directory as typographic list; continuous prose; isolated code and case blocks with accent rule but no extra framing; single right-rail TOC with a top-level list and in-page outline; checkpoint and notes as quiet flat sections.
- Interviews: filter bar then numbered questions with divider rows; answers reveal inline instead of within another nested card.
- Labs: documentation-style instructions followed directly by editor, results, and a compact library navigation rail.
- Plans/mocks/maps/projects: editorial sections; no background-card plus background-card nesting.
- Preserve source attribution and image fallback links.

## Responsive and interaction
- Desktop ≥1100: slim side nav, 1120 content max, reader + right TOC; tablet collapses rail; mobile nav becomes toggle and content is single column.
- Hover states subtle; focus visible; selected states semantic; no animation except gentle color transition, reduced-motion respected.
- Never hide the completion, notes, code-run or reveal controls.

## Implementation mapping
- Update `app.js` templates to remove duplicate objective, reduce dashboard promo, convert curriculum and projects to rows/columns, simplify TOC nesting.
- Add `tasteful-refinement.css` loaded after previous styles (including light-theme) so both appearances are consistently simplified.
- Add explicit route classes to #app via render for targeted layout, without changing URL routing.
- Keep all lesson and quiz data untouched.

## Verification and design critique
- Check source import and syntax; route rendering for 33 lessons and all major screens.
- Check saved theme and progress, quiz answers, section jump, sample solution, code editor and notes interactions with possible local mocks.
- Inspect contrast, navigation states, 375px mobile conditions and reading width through CSS analysis where browser capture is unavailable.
- Judge against previous product: faster entry to next lesson, fewer container layers and less visual competition. Reject regressions that hide useful content.
- Caveat: live-browser screenshot inspection requires network/browser access to the deployed site and should not be claimed if unavailable.
