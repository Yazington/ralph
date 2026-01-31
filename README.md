## Ralph

Ralph (coming from https://x.com/GeoffreyHuntley) is an automated research + implementation loop for any software project. It runs two phases:

- Research: gathers context, writes requirements and tests.
- Implementation: generates code to satisfy those requirements and keeps iterating until complete.

The loops drive the OpenCode CLI with fixed prompts, so you can run a guided, repeatable workflow for building the app.
The idea is about making the codebase the prompt more than having a human in the loop guiding the agent.

Keep in mind that the loops need to consider many possibilities on approaching a problem.
The user edits TECH_STACK.md as well as all PROMPT\*....md guiding the agent to an excpected result.
TECH_STACK.md is copy pasted into impl and research.

## Requirements

- Python 3.12+
- OpenCode CLI installed and available on `PATH` (or set `OPENCODE_CMD` to its full path)
- Git (used by the loops for checkpoint commits)

Optional (if you want web browsing/testing in the loops):

- MCP servers configured for the tools you plan to use (e.g., web search or test runners)
- MCP tool repo: https://github.com/Yazington/mcps

## What's in this repo

- `research/`: research loop + prompt that generates requirements and tests.
- `impl/`: implementation loop + prompt that builds the code to meet requirements.
- `tests/`: local tests for the loop behavior.
