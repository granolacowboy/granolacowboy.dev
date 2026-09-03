# granolacowboy.dev

Source for **[granolacowboy.dev](https://granolacowboy.dev)** — the personal site and field
notes of [Rich Berman](https://github.com/granolacowboy), a forward-deployed engineer in the
legal vertical. Essays on deploying applied AI inside regulated, change-resistant work, where
auditability and adoption matter as much as model capability.

**Stack:** [Astro 6](https://astro.build) with static output (no client-side framework, no
adapter), deployed on [Vercel](https://vercel.com/) — a static `dist/`, auto-deployed from the
GitHub `main` branch.

## Develop

Run from the repo root:

| Command           | Action                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Start the local dev server at `localhost:4321`  |
| `npm run build`   | Build the production site to `./dist/`          |
| `npm run check`   | Run Astro and TypeScript diagnostics            |
| `npm run preview` | Preview the built site locally                  |
| `npm run verify`  | Check, build, and verify launch invariants      |

On Windows PowerShell, use `npm.cmd` if the `npm.ps1` execution-policy shim is blocked.

## Deployment

The Vercel project deploys the GitHub `main` branch to production automatically; `vercel.json`
carries security headers only. Release and content-gating notes live in
[`docs/ops.md`](docs/ops.md).

---

<sub>© Rich Berman / [MHSB Solutions](https://github.com/MHSBai) · [granolacowboy.dev](https://granolacowboy.dev)</sub>
