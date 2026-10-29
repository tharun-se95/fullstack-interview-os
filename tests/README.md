# Iteration 6 verification

Run structural checks with `node --test tests/course-integrity.test.cjs`. Browser tests live in `tests/browser.spec.cjs` and are run in CI with Playwright (Chromium).

Baseline invariants from v5.2: at least 18 tracks, 69 lessons, 173 interview questions, 12 browser coding labs, 8 backend missions, 8 AI missions, and three capstone projects. These numbers represent minimum preserved content, not a fixed ceiling.

Fixture `fixtures/returning-learner.json` models an existing user's v5.2 localStorage value. The key remains `fullstack-os-course-v2` and existing entries must never be reset.

The browser tests must cover desktop 1440px, tablet 768px and mobile 375px, light and dark themes, navigation, lesson-to-practice links and preserved localStorage values. CI browser results are different from running learners' local Docker/AI/AWS exercises.
