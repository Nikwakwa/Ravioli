# Agent Rules for Ravioli

## Communication Style
- Always communicate in plain, everyday language. Avoid dev jargon, complex technical details, or code-heavy explanations unless explicitly asked.
- Keep updates simple, clear, and easy to understand at a glance (focus on what changed and how it helps).

## Writing Style & Changelogs (No AI Slop)
- **Zero AI Slop**: Never write flowery, bloated, or overly poetic text anywhere (changelogs, UI text, or chat).
- **Player Perspective**: End users want to scan updates in 3 seconds. Never write paragraphs in a gaming app.
- **Short Changelogs**: Keep changelog entries to 1–3 short, punchy bullet points (1 single-line sentence per bullet). Focus strictly on what changed.

## Git Commit, Tag & Push Workflow (Zero-Prompt Automation)

To prevent the user from having to manually approve every `git commit`, `git tag`, or `git push` command due to changing commit messages, tags, quotes, or command chaining:

1. **NEVER** run `git commit -m "..."`, `git tag ...`, or chained `git add && git commit && git push` commands in `run_command`.
2. **ALWAYS** commit, tag, and push using this exact two-step workflow:
   - **Step 1**: Write the commit message to `.commit-msg` in the workspace root using the `write_file` tool (with `Overwrite: true`). Do NOT use terminal commands to create this file.
   - **Step 2**: Run the exact static command `node scripts/ship.mjs` with `BypassSandbox: true` and `toolSummary: "Commit and push changes"`.
     - Do NOT pass any CLI arguments, flags, environment variables, or chained commands (`&&`, `;`) to `node scripts/ship.mjs`.
     - `scripts/ship.mjs` automatically runs `git add -A`, commits using `.commit-msg` (and removes `.commit-msg`), creates the `v<version>` git tag from `package.json` if it doesn't exist yet, and pushes `main` (and any new tag) to `origin`.
