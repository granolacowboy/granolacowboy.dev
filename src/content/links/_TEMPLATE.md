---
# LINK TEMPLATE. Never builds (the '**/[^_]*.md' glob excludes underscore-prefixed
# files). Easiest path: `node scripts/new.mjs link https://example.com "Title"`,
# which writes a dated file into drafts/. Promote a finished piece by hand:
#   mv drafts/<file>.md src/content/links/<file>.md
# The move is the human authorship act; the agent write-fence cannot do it for you.
title: Short title for the link
url: https://example.com/the-thing
via: optional source (person or site you found it through)
viaUrl: https://example.com/where-you-found-it
pubDate: 2026-01-01T12:00:00Z
tags: [tag-one, tag-two]
provenance: human # human | human-ai-edited (AI may edit your notes, never originate)
draft: true
---

One to three sentences on why this is worth reading. Your words, your take.
