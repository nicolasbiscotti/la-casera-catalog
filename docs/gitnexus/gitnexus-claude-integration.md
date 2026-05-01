The integration works through **MCP (Model Context Protocol)**. Here's the full setup, step by step:

---

**Step 1 — Index your repo**

Run this from the root of your project:
```bash
npx gitnexus@latest analyze
```

For Claude Code users, GitNexus installs itself completely — hooks, skills, and an `AGENTS.md` / `CLAUDE.md` context file — in a single `npx gitnexus analyze` command. This is the command that actually writes files into your repo (the `.gitnexus/` folder and those context files).

---

**Step 2 — Register the MCP server with Claude Code**

You have two options:

**Option A — Automatic (recommended):**
```bash
npx gitnexus@latest setup
```
`gitnexus setup` auto-detects your editors and writes the correct global MCP config. You only need to run it once.

**Option B — Manual**, using Claude Code's CLI directly:
```bash
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```
This registers the MCP server so that `npx -y gitnexus@latest mcp` is the command Claude Code uses to start it.

---

**Step 3 — Use it**

Once registered, just start Claude Code normally (`claude`) inside your repo. No extra steps needed per session. Claude Code gets the full stack: MCP tools, agent skills (Exploring, Debugging, Impact Analysis, Refactoring), PreToolUse hooks that enrich every search with graph context before Claude acts, and PostToolUse hooks that auto-reindex after commits.

---

**What this actually gives Claude Code**

GitNexus pre-computes the dependency structure at index time — instead of an AI agent chaining 10+ graph queries to understand one function, GitNexus returns a complete, confidence-scored blast radius answer in a single tool call.

---

**One thing to keep in mind:** the index is a snapshot. After significant code changes, re-run `npx gitnexus@latest analyze` to update it. The PostToolUse hooks handle small incremental changes automatically after commits, but a full re-index is needed for larger refactors.