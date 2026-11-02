# Sitemap lastmod for granolacowboy.dev

Decision D11, task S1. Every `<lastmod>` in this site's sitemap is read at build time from the committed manifest `lastmod.json`. The build never derives a date from the clock or from git (Vercel and Netlify build from shallow clones, and a build-time date tells crawlers nothing). `changefreq` and `priority` are not emitted; Bing ignores both (search pack fact F13).

## How the dates are kept

The manifest is maintained by `tools/d11/lastmod_manifest.py` in the control repository (granolacowboy/mhsb-web-portfolio-ops). Its `granola` adapter maps each indexable URL to its source content and hashes that content. When the hash is unchanged the stored date is kept; when it changed, or the URL is new, the run time is written. Static pages are dated from their file under src/pages and the JSON or YAML files they import; weblog entries from their file under src/content and their route template; tag and archive pages from their template plus the entries they list. /projects/notebooks/ is neither in the sitemap nor dated while src/data/notebooks.json is empty. The tool reads src/content and never writes there (the content-authorship fence).

The first manifest was seeded once on 2026-11-02 from each URL's last content commit (entries marked `"method": "seeded"`).

## Refresh command

Run it in the same commit as any content change, from a checkout of the control repository beside this one:

```bash
python3 -I ../mhsb-web-portfolio-ops/tools/d11/lastmod_manifest.py granola .
```

Check without writing (exit 1 when the manifest is stale):

```bash
python3 -I ../mhsb-web-portfolio-ops/tools/d11/lastmod_manifest.py granola . --check
```

After a build, confirm that every sitemap URL carries its manifest date:

```bash
python3 -I ../mhsb-web-portfolio-ops/tools/d11/sitemap_check.py lastmod.json dist/sitemap-0.xml
```

Sitemap source: astro.config.mjs (the @astrojs/sitemap serialize hook; the build fails if a sitemap URL has no manifest entry).

