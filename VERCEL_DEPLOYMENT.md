# Deploying to Vercel

This project is a static site (plain HTML/CSS/JS), so it can be deployed on Vercel without a build step. Below is a condensed walkthrough based on Vercel's documentation (see <https://vercel.com/docs/deployments>).

## Prerequisites

- Vercel account (free tier works).
- Vercel CLI installed: `npm i -g vercel` (requires Node.js).
- GitHub repository connected or CLI authenticated (`vercel login`).

## One-Time Setup

1. Clone the repository locally and `cd snake-game`.
2. Run `vercel login` to authenticate via browser.
3. (Optional) In the Vercel dashboard, create a new project linked to `AJ-Ahmad/snake`. Set the root directory to `/` and the framework preset to `Other`.

## Deploy from CLI

```bash
cd snake-game
vercel              # first run to create the project + preview
vercel --prod       # push the latest commit to production
```

During the first `vercel` run, answer:

- **Link to existing project?**: choose `Yes` if already created in dashboard, otherwise `Create`.
- **Project name**: `snake-game` (or accept default).
- **Directory**: `.` (current folder).
- **Override settings?**: `No`. The defaults auto-detect this as a static project and serve `index.html`.

## Deploy from GitHub

1. Visit <https://vercel.com/new>.
2. Import the `snake` repo from GitHub.
3. When prompted for framework preset, pick **Other**. Leave build command empty and output directory as `.`.
4. Click **Deploy**. Vercel will build and host the project at a generated URL; you can later assign a custom domain.

## Notes

- Static assets (HTML/CSS/JS) are cached on Vercel's Edge Network for fast global delivery.
- Every push to `master` (or whichever branch you configure) triggers an automatic production deployment.
- Preview deployments are created for pull requests/branches, giving you shareable URLs before merging.
