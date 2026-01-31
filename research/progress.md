# Progress Tracking

## To-Do Status

- [x] Search internet for best practices (write code to fetch from APIs/sites like StackOverflow, docs).
  - Completed: fetch_best_practices.py created and executed.
  - Results saved in api_results.json and search_results.md.
  - Issues: StackExchange API returned empty; Reddit API had encoding error.
- [x] Generate/update requirements.md based on searches.
  - Completed: requirements.md updated with core principles, functional/non-functional requirements.
  - References search_results.md and tech stack.
- [ ] Generate TDD tests in tests/ to cover requirements.
  - Pending: need to create test suite.
- [ ] Generate SDK in sdk/ if needed (e.g., API clients).
  - Pending: evaluate if SDK needed.
- [ ] Lint all generated code with pylint, flake8, black - fix issues.
  - Pending: after test and SDK generation.

## Next Steps

1. Create tests directory and write test cases for requirements.
2. Use pytest (or similar) for TDD.
3. Ensure tests cover core functionality: task management, AI features, UX, integration.
4. Commit with "Research: TDD tests".
5. Then evaluate need for SDK.

## Notes

- Tech stack: React, TypeScript, Vite, Tailwind, shadcn/ui, Vitest, Playwright.
- AI integration: Tavily MCP, Playwright MCP.
- Backend: possibly serverless (Vercel/Netlify) or Node.js/Python.

Last updated: 2025-01-31