# SoFlo UnderPressure — Session Handoff

**For a new Cowork/Code session with zero prior context. Read this first.**
Last updated: 2026-10-02

---

## 0. What this is

Production website for **SoFlo UnderPressure** — a Miami pressure-washing company
(owner Saul Leon). Agency client of Saul's digital marketing agency.

- Business: pressure washing + soft washing, Miami-Dade & Broward
- Phone: (305) 894-6336 · Email: SoFlo.Underpressure@gmail.com
- Live domain: **sofloup.com** (print also says soflounderpressure.com — unresolved, see Open items)

---

## 1. Paths (exact)

- **Live-site repo (this folder) = the site:** `/Users/saullen/Documents/Claude/Projects/Soflo Underpressure/_UPLOAD/`
  - This is a git repo. Treat it like production. Confirm before destructive ops.
- Brand assets + docs: `/Users/saullen/Documents/Claude/Projects/Soflo Underpressure/_BRAND/`
- Images: `_UPLOAD/Pictures/`
- Shared stylesheet (the design system): `_UPLOAD/quoti.css`
- Legacy stylesheet still linked on some core pages: `_UPLOAD/style.css`
- Agency client folder (briefs, audits, action plan):
  `/Users/saullen/Documents/Claude/Projects/digital marketing agency/clients/sofloup.com/`
  - Latest audit: `.../clients/sofloup.com/audits/2026-10/` (FULL-AUDIT-REPORT.md, ACTION-PLAN.md, audit-data.json)
- Agency cross-session memory: `/Users/saullen/Documents/Claude/Projects/digital marketing agency/claude-memory/CURRENT-STATE.md`

## 2. Stack + hard constraints

- **Static HTML + vanilla CSS/JS. No frameworks, no build tools, no Tailwind/React.** Files go straight to the browser.
- 54 HTML pages: `index, services, about, membership, quote, contract, contact, resources, faq,
  service-areas, hoa-property-managers, 404, gallery(redirect stub), blog` + `services/*` (7) + `areas/*` (27) + `blog/*` (26).
- Never write API keys/secrets to any file.
- **No em-dashes (— or –) anywhere** — they read as AI-written. Use spaced hyphens; tight hyphen for number ranges. (Whole site was purged; keep it that way.)
- American spelling (color, tire, aluminum), not British.
- Client-facing copy = honest. **No fabricated reviews, no fake before/after, no invented stats.** AI/stock imagery OK on the website but NEVER on Google Business Profile and NEVER for before/after.
- `caveman` mode governs how Claude talks to Saul (terse), NEVER client-facing copy (that uses full sentences / brand voice).

## 3. Git + deploy workflow

- Repo: `_UPLOAD/`, branch `main`. Remote: **github.com/soflounderpressure/SOFLOWEBSITE**.
- **Claude commits but does NOT push.** Saul pushes manually via **GitHub Desktop**.
- Commit message convention: end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Deploy: push to GitHub → **Cloudflare Pages** auto-builds and serves sofloup.com.
- **As of 2026-10-02 there are ~8 unpushed commits.** Live site is STALE until Saul pushes. First thing to tell Saul: push to deploy.

## 4. Local preview (how to see changes)

- `.claude/launch.json` has a `soflo-site` entry: `python3 -m http.server 8788 --directory <scratchpad>/soflo/site`.
- The preview serves a **mirror**, not `_UPLOAD` directly. After editing `_UPLOAD`, re-sync:
  `rsync -a --delete "<_UPLOAD>/" "<scratchpad>/soflo/site/"` then reload `http://localhost:8788/...?v=N` (cache-bust).
- Known gotcha: if the Browser pane is hidden, scrolling/animation won't render; `navigate` + screenshot still renders top-of-page. Front the tab or deploy to review scrolled sections live.

## 5. Design system (quoti.css)

- Tokens: `--navy #1C2B3A, --sky #C6E8F7, --periwinkle #6475D0, --peri-dk #4454B0, --yellow #FFD84D, --coral #FF7055, --paper #F4FAFE`. Fonts: Barlow Condensed (display `--fd`) + Barlow (body `--fb`). Radii `--r/--r-lg/--r-xl/--pill`.
- Floating pill nav, giant display hero, soft-rounded cards, dark footer + water-drop mascot.
- **Animated background (2026-10): pure CSS on html/body pseudo-elements** — drifting aqua mesh (`body::before`) + two parallax bubble layers (`html::before/::after`). Frozen under `prefers-reduced-motion`. All pages get it free.
- H1 pattern: small keyword eyebrow (`.h1-lead`, styled as eyebrow, inside `<h1>` for SEO) + big display headline. Generic eyebrows hidden in heroes.
- Scroll-reveal via CSS `animation-timeline:view()` (no JS), reduced-motion safe.
- Mascot files: `Pictures/mascot-*.png` (wave/spray/thumbsup/relaxed/peek/sleepy), transparent.

## 6. Blog system

- 26 posts in `blog/`. 20 added 2026-10 targeting competitor SEO/GEO gaps (pricing transparency, soft-wash education, material-specific, seasonal Miami, HOA, DIY-vs-pro).
- Each post: Article + FAQPage + BreadcrumbList JSON-LD, visible Q&A (for AI answers), `author = Person "Saul Leon"`, internal links to service pages.
- **blog.html index is hardcoded** (no auto-discovery): every new post must be added as a card in `blog.html` AND a `<url>` in `sitemap.xml`.
- Generator used for the 20: `scratchpad/gen_blog.py` + `posts_a/b/c.py` (template matches existing post structure). Reusable if writing more.

## 7. SEO/GEO state

- Site health 88/100 (2026-10 audit). Clean: unique titles ≤62, descriptions ~148-165, one keyword H1/page, canonicals, valid JSON-LD, no broken internal links, `robots.txt` (AI crawlers allowed, scrapers blocked), `sitemap.xml` (72 URLs), `llms.txt`.
- OpenSEO MCP available. Project used for keyword research: "Default" id `95860473-e1a5-457b-8198-a9d6574d451d` (no dedicated sofloup project yet). **~120 credits left** — ask Saul before spending >2000.
- The real ceiling is OFF-PAGE: no Google Business Profile, no reviews, no backlinks. All blocked on Saul.

## 8. Open items / blocked

- **Deploy**: push the ~8 unpushed commits (Saul, GitHub Desktop).
- Blocked on Saul: create + verify **GBP**, create **GA4** + **GSC**, enable **Gemini billing** (~$8 for AI photos), resolve soflounderpressure.com domain, decide palette.
- Not done: image WebP conversion (needs `cwebp`, not installed; `sips` made files bigger — reverted). Image width/height already added for CLS.
- Real photography pending (many slots use stock/placeholder until Gemini billing on).
- Design: Saul wants it to feel "9.5/10, not AI-coded." Big levers done (animated bg, de-AI copy). A true visual iteration loop needs the Browser pane visible or the live deployed URL.

## 9. How to resume in a new session

Open this project folder, then first message:
> "Read SESSION-HANDOFF.md in the repo root and
> `digital marketing agency/claude-memory/CURRENT-STATE.md`, then continue the SoFlo site work."
