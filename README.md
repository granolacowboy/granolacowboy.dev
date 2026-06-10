# granolacowboy.dev

Source for [granolacowboy.dev](https://granolacowboy.dev), a personal portfolio site.

**Stack:** [Astro 6](https://astro.build) static output (no client-side framework, no adapter), served as [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/).

## Commands

Run from the repo root:

| Command               | Action                                         |
| :-------------------- | :--------------------------------------------- |
| `npm install`         | Install dependencies                           |
| `npx astro dev`       | Start the local dev server at `localhost:4321` |
| `npx astro build`     | Build the production site to `./dist/`         |
| `npx wrangler deploy` | Deploy the built site to Cloudflare Workers    |

## Content note

Case studies describe real engagements, anonymized under NDA: firms appear by category and size only, and metrics are directional.
