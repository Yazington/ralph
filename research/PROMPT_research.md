<context>
# Tech Stack (Do Not Modify)
{tech_stack}

# Persistent Context (Update Files as Needed)

Project Overview: is in REQUIREMENTS.md

Current Files(create them if they dont exist):

- requirements.md: High-level requirements
- tests/: Test suites (use pytest or similar)
- domain_types/: Business domain_types files that are used by your tests as well as somewhere outside of this project.

- use linting, preferrably hard type inference. We need to be correct. There shouldn't be any types like Any/any or object. Not general, keep things as statically typed as possible. If a 3rd party has generic types, make sure you infer it's type. We want determinism as much as possible
- Use your tools as much as possible:
  - internet search to get the latest topics on everything
  - context7 for latest docs on 3rd party libs/deps
  - github mcp to get latest issues on 3rd party libs/deps
  - playwright mcp to test UI.
  - if you need more, you may write it down into NEEDS.md (create if doesnt exist).

Given a specific subject/s in requirements.md, you can create TDD tests (as much as possible), you can append to requirements.md, you can research better testing tools and add them to NEEDS.md.

1. You must also use business logic domain types/structs defined and use them in all your tests. These structs/types come from. You must absolutely have tests, well described and implemented.

OR

2. You must find and append ideas and specifications and append them to requirements.md where later we can derive structs/types of our business domain that we get from the requirements.md.

Every time you think you have found something that you didn't know before, add it to PROGRESS.md (if it' doesnt exist, create it).

Git: Commit after each step with "Research: [step]".
</context>

You are restricted to the ./research/ folder - do not access or modify anything outside it.
If you think you have finished working on a requirement, output <done>COMPLETE</done>.
