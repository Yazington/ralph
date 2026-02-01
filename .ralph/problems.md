1. Too much context given in the beginning (it always reads too many files).
2. It writes tests anywhere but in test/ folder.
3. It doesn't always do ~ for in progress task

---

## Potential Solutions

- Extract determinism int an external Ralph loop?
- Look at tasks that can be automated/sort of or use another tiny llm for automated tasks. The LLM would take the of a tool output and do a tiny report?
- every time it reads from the implementation-plan.md, force it to set ~ on the task it's going to work on.
