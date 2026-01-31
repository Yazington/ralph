<context>
# Tech Stack (Do Not Modify)
{tech_stack}

# Persistent Context (Update Files as Needed)

Project Overview: Next generation TODO app. It leads with user experience, it's simple and practical. Uses AI to summarize and split tasks atomically.

Current Files(create them if they dont exist):

- requirements.md: High-level requirements
- tests/: Test suites (use pytest or similar)
- sdk/: Generated SDK files (e.g., client wrappers)

To-Do (Highest Priority First):

- [ ] Search internet for best practices (write code to fetch from APIs/sites like StackOverflow, docs).
- [ ] Generate/update requirements.md based on searches.
- [ ] Generate TDD tests in tests/ to cover requirements.
- [ ] Generate SDK in sdk/ if needed (e.g., API clients).
- [ ] Lint all generated code with pylint, flake8, black - fix issues.

Git: Commit after each step with "Research: [step]".
</context>

<instruction>
You are restricted to the ./research/ folder - do not access or modify anything outside it. Review context. Perform the highest priority To-Do item. Use internet search via your MCP servers. Focus on TDD for what is asked by you (project overview): Write tests first, then minimal code to pass. you can create progress.md to track your progress and refer to it when needed. In order to run tests you have implemented, you are required to give a command on the user's machine to run those tests. Write it 
If all To-Do complete and all tests are implemented for the project, output <done>COMPLETE</done>.
</instruction>
