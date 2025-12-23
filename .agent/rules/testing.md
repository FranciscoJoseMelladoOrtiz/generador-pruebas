---
trigger: always_on
glob: 
description: 
---

# Testing Rules

1. **Document Test Use Cases**: Every time a new test is implemented or an existing one is modified, you MUST Add/Update the corresponding entry in TESTS_USE_CASES.md. 
   - Include the Feature/Component name.
   - Link to the test file.
   - List the specific use cases/scenarios covered.

2. **Test Location**: Place tests in the src directory, co-located with the component or in a mirrored __tests__ directory, or follow the project structure (currently src/test for setup). Prefer co-location or src/test if that is the pattern.
