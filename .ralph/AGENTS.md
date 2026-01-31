# CAPABILITIES

- use linting, preferrably hard type inference. We need to be correct. There shouldn't be any types like Any/any or object. Not general, keep things as statically typed as possible. If a 3rd party has generic types, make sure you infer it's type. We want determinism as much as possible
- Use your tools as much as possible:
  - internet search to get the latest topics on everything
  - context7 for latest docs on 3rd party libs/deps
  - github mcp to get latest issues on 3rd party libs/deps
  - playwright mcp to test UI.
  - if you need more, you may write it down into NEEDS.md (create if doesnt exist).
- the tests you create can test anything. UI, not UI, really anything -> this is important.
