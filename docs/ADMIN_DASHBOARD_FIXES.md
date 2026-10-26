# Admin Dashboard Fixes and Placeholder Audit

## Fixes applied

- Declared the missing React state for programme editing, Site Content JSON, event drafts, Knowledge Centre resource drafts, and membership drafts. These missing declarations caused runtime reference errors when the related dashboard pages rendered.
- Corrected the Content & Knowledge navigation label to **Knowledge Centre**.
- Removed the newsletter-subscriber table from the Knowledge Centre page. That page loads knowledge resources, not newsletter subscribers; newsletter subscribers remain available from the separate Newsletter section.
- Added the public content-management migration (`005_public_content_management.sql`) and a follow-up cleanup migration (`006_homepage_content_cleanup.sql`) to the migration runner.
- Added a migration that removes only unchanged starter statistic values (for example, `10`, `24/7`, and `01`) while preserving values staff have changed.
- Made the homepage eyebrow, hero heading and intro, hero CTA labels, panel label, principles, experience title, membership/corporate/knowledge/events headings, and footer description read from the API-managed homepage content.
- Removed the stale `V3 FOUNDATION` label and removed the public footer control that announced privacy/governance documentation as planned but did not lead to a real policy page.

## Placeholder audit

- The remaining HTML `placeholder` attributes are input hints for forms (for example, email address, credential ID, and course slug). They are not seeded public records.
- Messages such as “No published events” and “Membership options will appear here when published” are conditional empty states shown when the API returns no published records.
- No hardcoded credential ID is used to validate credentials; verification still goes through the API.
- The public site still contains static explanatory and navigation copy that is part of the current design, but the homepage fields intended to be managed in Site Content no longer fall back to hardcoded marketing text or unverified starter statistics.

## Validation

- Automated test suite: **14/14 passed** in the patch workspace.
- A production build could not be run in the isolated patch workspace because Vite was not installed there and dependency installation did not complete. After extracting this ZIP, run `npm install` and then `npm run check` in the project root to install dependencies, run tests, and build the frontend.
