---
title: "intake-eval-harness: an evaluation harness for tool-using MCP servers"
url: https://github.com/granolacowboy/intake-eval-harness
pubDate: 2026-10-07T12:10:00Z
tags: [mcp, evals, open-source]
provenance: human-ai-edited # human | human-ai-edited
draft: false
---

A small evaluation harness for tool-using MCP servers: run a fixed suite against a server, score the final answer, and enforce deterministic assertions over the tool trace. Tool-using systems fail in ways a unit test does not catch (the model picks the wrong tool, skips a required step, or answers without calling anything), so a fixed suite turns those failures into a repeatable number instead of a surprise in production. Extracted from intake-triage-mcp.
