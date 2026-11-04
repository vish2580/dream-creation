# Emotion Design — static visual clone

Offline HTML/CSS/JS recreation of the public [emotion.design](https://emotion.design/) marketing site. Built by reverse-engineering the live pages with **REA 6.7.0** (CDP inspect + screenshots) plus Chrome DevTools captures. This is **not** a vendored copy of their React/Vite bundle.

## How to open

From this folder:

```bash
cd /cursor/stores/self/docs/emotion-clone
python3 -m http.server 8766
```

Then visit **http://127.0.0.1:8766/** (or `index.html` via any static file server).

A server may already be running on this VM at that URL.

## Pages cloned

| Page | Path | Notes |
| --- | --- | --- |
| Home | `index.html` | Hero collage, manifesto, services, featured + recent projects, impact/awards, trusted-by, process, contact |
| About | `about-us.html` | House of Tagglabs story, expertises, impression stats, awards |
| Impact | `impact.html` | Impact stats + contact |
| Projects index | `project-details.html` | Links to public case studies |
| Case · Mahakumbh | `case-study/mahakumbh-2025.html` | Full public case narrative + gallery/process stills |
| Case · Invest MP | `case-study/invest-mp.html` | Public case summary |
| Case · Supreme Court / NJMA | `case-study/supreme-court.html` | Public case summary |
| Case · Chapekar Wada | `case-study/chapekar-wada.html` | Public case summary |

Skipped: login/checkout (none on the public marketing surface), Osaka detail route (no dedicated public case-study slug beyond the homepage listing).

## Fonts

Hero display type uses the **same SVG path lockups** extracted from the live homepage (Stories / YOU CAN / Step / INTO), so those letterforms match exactly.

Body UI type loads the **same public files** the live site requests from `https://emotion.design/assets/` (Gilroy Regular/Medium/Bold/Light, Nyght Serif italic weights), with local mirrors under `fonts/` for offline. We do **not** claim ownership of those fonts — they are referenced as the site already serves them publicly.

## Imagery & motion

- Public CDN/site images downloaded into `images/` and `logo/` for offline use.
- Desktop hero collage uses settled CDP pixel positions (scaled); mobile uses measured mobile-hero placements.
- Services stage cycles the public `.webm` files under `videos/` (mahakumbh ~1.6MB, supreme-court ~0.7MB, emami ~0.5MB) plus still cards.
- Project accordion expands inline; awards/process strips restored toward live page length.

## Comparison screenshots

Under `/cursor/stores/self/media/`:

- `emotion-compare-home-desktop.png` — live vs clone, desktop homepage viewport
- `emotion-compare-home-mobile.png` — live vs clone, mobile homepage viewport
- `emotion-live-home-desktop.png` / `emotion-clone-home-desktop.png`
- `emotion-live-home-mobile.png` / `emotion-clone-home-mobile.png`
- `emotion-rea-home-viewport.png` — REA `capture-web-screenshot` evidence of the live homepage

## Motion & Animation Engine Upgrade (Video-Matched 1:1)

Upgraded to a production-grade animation engine using **GSAP 3.12.5**, **ScrollTrigger**, and **Lenis 1.1.18** smooth inertial scrolling to match `Recording 2026-10-24 234512.mp4`:

- **Lenis Smooth Inertia Scroll**: Buttery-smooth normalized scrolling synced directly with GSAP's ticker.
- **Custom Red Cursor / Follower**: Spring-lerp trailing red cursor with magnetic snap and hover expansion across interactive elements.
- **Hero Cosmic Intro & Explosion**: Starts with the glowing red orb in the starfield; cards burst outward to settled collage coordinates with spring physics; headline reveals with staggered typography; orb morphs into the "Scroll" button.
- **Hero Pinned Horizontal Split**: Scrubbed pin splitting "Stories" and left cards left, "YOU CAN" splitting in the center, and "Step INTO" and right cards right.
- **Tagline Staggered Line Mask Scrub**: Pinned mask reveal for all tagline lines with animated expanding red underlines under italic words ("Creativity", "Curators", "Spaces", "impact").
- **Services 3D Depth Stage**: Pinned 3D stage with animated outline display text ("Conceptual", "New Tech", "Content Curation"), 3D tilting card playing synchronized videos, and active flanking labels.
- **Mahakumbh & Project Rows**: 5-strip interactive accordion banner + mouse-tracking floating image preview cards with dynamic velocity tilt.
- **Impact 3D Cylindrical Carousel & Counters**: Pinned 3D cylindrical deck rotating in perspective space + live counter roll-up animation (1M+, 100+, 100%).
- **Gallery 3D Fly-Through**: Pinned depth fly-through scatter tunnel.
- **Awards 3D Fan Arc**: Pinned card deck that fans out smoothly into a curved rainbow arc with interactive hover lift.
- **Closer Red Split Doors**: Giant red doors slide together to reveal "Let's Create Stories Together" with the mint circular "Scroll ↑" button that glides back to the top.

## REA workflow used

```bash
export PATH="$HOME/.local/bin:$PATH"
# Chrome with --remote-debugging-port=9222 + dedicated profile
rea list-browser-targets http://127.0.0.1:9222 --json
rea inspect-web-page http://127.0.0.1:9222 TARGET_ID --include-accessibility-text --json
rea capture-web-screenshot http://127.0.0.1:9222 TARGET_ID --json
```

Full-page PNGs and multi-page crawls used Chrome CDP (`Page.captureScreenshot` with `captureBeyondViewport`) alongside REA viewport captures.
