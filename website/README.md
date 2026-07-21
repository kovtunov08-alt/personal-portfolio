# Website

Personal portfolio surface for **personal-portfolio**: responsive Astro site with hero, about, projects, skills, and a Formspree contact form.

## Project Surface Status

**Active.** Production deploy is **GitHub Pages** (Actions → `website/dist`), same pattern as Northern Studio. Contact form goes through [Formspree](https://formspree.io).

Live URL: https://kovtunov08-alt.github.io/personal-portfolio/

Edit portfolio content in:

- `src/data/profile.ts` — name, bio, email, social links
- `src/data/skills.ts` — skill groups
- `src/content/projects/*.md` — project cards
- `src/data/formspree.ts` — Formspree form ID (public, safe to commit)

## Stack

- Astro (static SSG)
- TypeScript
- Vite through Astro
- Formspree (external form endpoint; no server/API in this repo)

## Local run

From the monorepo root:

```powershell
bun install
bun run dev:website
```

Open http://127.0.0.1:4321/personal-portfolio/ (`base` is set for GitHub Pages).

## Deployment

Push to `main` triggers `.github/workflows/deploy-pages.yml`:

1. `bun install --frozen-lockfile`
2. `bun run build` in `website/`
3. Upload `website/dist` to GitHub Pages

Astro config uses `site: https://kovtunov08-alt.github.io` and `base: /personal-portfolio`.
