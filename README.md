# Samruk Academy · Мастерская расследования

Complete source for the Russian interactive course and CASE 001 assessment. This standalone edition uses **React, TypeScript and Vite**, with Vercel configuration included.

## Included

- Five lecture lessons, 27 scenes, a digital instructor with text bubbles, interactive teaching boards and ten practice checks.
- Assessment screens 01–10: briefing, incident notification, first decision, inspection of eight objects, worker/witness introduction, scene-based “Четыре П”, witness interview, timeline, Five Whys, cause tree and results.
- Original instructor, conveyor, dispatcher, pump-room and participant artwork, stored locally in `public/assets/`.
- Mouse and keyboard operation, pointer-based dragging and tap-to-select alternatives for touch screens.
- Dark text and the shared lecture/assessment visual style.
- The mock **Sign In** button, saved progress, notes, glossary, journal, feedback and answer-by-answer results.

The application runs in the browser. No database, API keys, external AI service, ChatGPT account or server functions are required. The digital instructor uses the authored course script.

## Run locally

Install **Node.js 24 LTS** and npm. In this folder, run:

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. Click **Sign In**. The assessment is available under **CASE 001** in the course menu.

```bash
npm run check    # TypeScript
npm test         # Assessment state and scoring checks
npm run build    # TypeScript check + production build
npm run preview  # Serve the built dist/ folder locally
```

`preview` is for local inspection; Vercel serves the static production build.

## Create a GitHub repository

1. Extract the archive and open the `samruk-academy` folder.
2. Create an empty repository on GitHub, for example `samruk-academy`. Leave automatic README, license and .gitignore creation off when using the commands below.
3. From the extracted project folder, run the following, replacing `YOUR_ACCOUNT` and the repository name with yours:

```bash
git init
git add .
git commit -m "Initial Samruk Academy course"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/samruk-academy.git
git push -u origin main
```

Use your normal GitHub authentication when Git requests it. The archive contains no Git history, repository credentials or remote configuration.

The repository root must contain `package.json`, `package-lock.json`, `index.html`, `vercel.json`, `app/`, `src/` and `public/`. If uploading through GitHub's website instead, upload the extracted files and folders, not the ZIP itself. Include `.gitignore`, `.nvmrc` and `.github/` as well.

## Deploy to Vercel

In Vercel, choose **Add New → Project**, import your GitHub repository and deploy. `vercel.json` supplies the build settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | `./` when project files are at the repository root |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | `24.x` |
| Environment variables | None required |

If you uploaded the outer `samruk-academy` folder inside another repository, set Root Directory to that folder instead. The root directory must be the folder containing `package.json`.

After connecting the repository, pushes to your production branch can trigger Vercel deployments. The application entry page contains the mock Sign In button. Any access protection configured in your Vercel project is a separate hosting setting.

Official deployment references:

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vite static deployment](https://vite.dev/guide/static-deploy)
- [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## Project map

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | React entry point and CSS imports |
| `app/page.tsx` | Mock entry and switching between lectures and assessment |
| `app/lecture.tsx` | Lecture progression, instructor bubbles, checks, notes and glossary |
| `app/course-data.json` | Authored lecture material |
| `app/course.ts` | Lesson routes, scenes and source records |
| `app/teaching-board.tsx` | Interactive lecture explanations |
| `app/assessment.tsx` | Assessment screens 01–10 and dialogs |
| `app/assessment-data.ts` | Stages, cards, witnesses, timeline and cause candidates |
| `app/assessment-original.json` | Previously agreed case material and branching options |
| `app/assessment-state.ts` | Scoring, validation, progress restoration and dependency resets |
| `app/case-scene.tsx` | Inspection image, hotspots, zoom and panning |
| `app/case-tree.tsx` | Cause-tree editor and branch logic |
| `app/use-case-drag.tsx` | Pointer dragging and drop targets |
| `app/globals.css`, `app/assessment.css` | Lecture and assessment styles |
| `public/assets/` | All five artwork files |
| `public/favicon.svg` | Application icon |
| `lecture-source.py` | Original authoring source for the lecture text |
| `scripts/check-assessment.mjs` | Checks the actual shipped assessment state transitions |
| `.github/workflows/ci.yml` | Install, test and build on GitHub pushes/PRs |
| `docs/COURSE_RU.md` | Russian course overview |
| `ASSETS.md` | Artwork notes |

Edit the files above to change content or behaviour, then run `npm test` and `npm run build` before committing. Keep image filenames or update every referring path when replacing artwork. The application uses the system Arial/Helvetica font stack; no external font service is needed.

## Progress and assessment behaviour

Lecture progress and notes are stored in the current browser's `localStorage`. CASE 001 uses `samruk-case001-v2`; the lecture uses `samruk-lecture-v1`. The mock entry flag uses `sessionStorage`. Signing out keeps course progress. Using another browser, clearing site data or deploying to a new origin starts a separate local progression.

The first decision awards 20 points, and eight correct evidence classifications award 10 each. Retrying an already classified card does not award extra points. The final screen also reports actual interview topics, timeline checks, saved hypotheses and tree nodes. Revisions invalidate the relevant later completion states.

The timeline is a working reconstruction, and the causal links remain hypotheses that require verification. This is the agreed training demo; the achievement badges do not represent professional certification. There is no central learner database, real authentication, instructor administration, LMS integration or cross-device progress sync in this version.

## Export provenance

This standalone edition contains the course and assessment from published source commit `4cc853bf7cd639be4348f58bf43dbcd71c59ce3f` (7 November 2026). The hosting entry was adapted to standard Vite. Platform-specific authentication, Cloudflare workers, connector scaffolding and unused starter components are not required by this application and are not included.

The dependency lockfile is included for reproducible installation. The archive intentionally excludes `node_modules/`, generated `dist/`, hosting identities and credentials.
# SB_Investigation_Simulator
# SB_Investigation_Simulator
