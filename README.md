# granolacowboy.dev

Source for **[granolacowboy.dev](https://granolacowboy.dev)**, the personal site of
[Rich Berman](https://github.com/granolacowboy): posts and case studies authored in MDX.

**Stack:** [Astro 6](https://astro.build) with static output (no client-side framework, no
adapter), deployed on [Vercel](https://vercel.com/): a static `dist/`, auto-deployed from the
GitHub `main` branch.

## Develop

Run from the repo root (Node 24):

| Command           | Action                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Start the local dev server at `localhost:4321`  |
| `npm run build`   | Build the production site to `./dist/`          |
| `npm run check`   | Run Astro and TypeScript diagnostics            |
| `npm run preview` | Preview the built site locally                  |
| `npm run verify`  | Check, build, and run post-build invariant checks on `dist/` |

On Windows PowerShell, use `npm.cmd` if the `npm.ps1` execution-policy shim is blocked.

## Deployment

The Vercel project deploys the GitHub `main` branch to production automatically; `vercel.json`
carries security headers only. The Vercel project's platform build command is `npm run verify`,
so every preview and production deployment must pass Astro checks, the static build, and the
`scripts/verify-build.mjs` dist gate. GitHub Actions runs the same verification on the
self-hosted `gcd` runner as an independent source-control gate. Release and content-gating notes live in
[`docs/ops.md`](docs/ops.md).

## License

MIT, see [LICENSE](LICENSE).

---

<sub>© Rich Berman / [MHSB Solutions](https://github.com/MHSBai) · [granolacowboy.dev](https://granolacowboy.dev)</sub>

## Featured engineering note

- [How I use AI agents to build deterministic systems without trusting the agents to be deterministic](https://granolacowboy.dev/writing/post-4-deterministic-ai)
