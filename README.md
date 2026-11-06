# Petra AI Now

## Overview

Scroll-driven marketing site for the **Petra AI Now** YouTube / X brand — AI news, agent tools for “vibe coders,” and build-with-AI tutorials. The visual identity is a dark, neon, 3D particle hero powered by Three.js.

## Purpose

Drive subscriptions to [YouTube @PetraAINow](https://www.youtube.com/@PetraAINow) and follows on [X @Petra_AI_Now](https://x.com/Petra_AI_Now). It is a content-brand landing page, not a web app.

## Features

- Full-viewport WebGL particle / sphere hero with scroll-linked camera (`main.js`)
- Sections: hero CTAs, marquee, featured video card, “Three things” pillars (AI news, Agent Tool Radar, tutorials), “Vibe Coder Agent Stack,” final CTA
- GSAP + ScrollTrigger reveal / scrub animations
- Assets: profile image + video thumbnail under `assets/`
- Vendored `three.module.js`, `gsap.min.js`, `ScrollTrigger.min.js` under `vendor/`
- Optional recorded shots under `shots/`

## Tech stack

- Static HTML/CSS/JS (ES modules)
- Three.js + GSAP ScrollTrigger
- No backend

## Run / deploy

```bash
python3 -m http.server 8080
# open http://localhost:8080/
```

Deploy as any static site. External links point at the live YouTube and X accounts.

## Notes

Folder name includes `3d` because of the WebGL hero; it is not a real-estate 3D tour product.
