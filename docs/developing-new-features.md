# Developing a new feature

## Generate Typescript definitions
 Ensure the Typescript definitions for make-recall-decision-api responses are up-to-date.
[Update typescript definitions](./docs/lint-typescript.md), which are drawn from Swagger.

## E2E tests
These are used for 'happy path' testing only. To test error validation or detailed interactions, use integration tests.
The E2E tests start up make-recall-decision-api which stubs upstream services like Delius community API with Wiremock containers. Ensure that new Wiremock fixtures are added if required.
See also [E2E tests](./docs/e2e-tests.md)

## Add a Cypress integration test
These tend to be written to test behaviour for single page loads, eg error states. For journeys of multiple pages, use E2E tests.
See also [tests](./docs/tests.md)

If a new API endpoint has been added, you'll need to mock it. Add a new mock function to `./integration_tests/mockApis/makeRecallDecisionApi.js`, to get the data (and register the new function in `./integration_tests/cypress.config.ts`).

Add / edit test in `./integration_tests/integration`
- Temporarily change the test description to `it.only` to run the new test on its own while developing it (only works when running a single spec, not all)
- if you added a Cypress task to mock a new endpoint, call the task at the start of the new test (if you added a new Wiremock fixture, above, you could return that)
- Find elements using visible text rather than attributes, if possible. It speeds up test development, has the added benefit of testing accessibility in some cases (eg for input labels), and makes the tests more readable. Use cy.* commands (which can be reused later for E2E tests).
- Run the [integration tests](./tests.md). While developing tests, `npm run int-test-ui` is better as you can see what's going on in the browser.
- If you make a change to the Cypress tests or supporting test code, it will refresh automatically
- You can stop execution in the app using Chrome devtools Node debugger. To stop execution in the test code itself, open devtools in the cypress browser window, and add a `debugger` command to the test code in your code editor, where you want it to break.

## Feature flags
Wrap the new feature in a [feature flag](./feature-flags.md), defaulted to `false`.

## How form render / validation works for Make a recommendation
- [Flow diagram](./images/make-recall-decision-ui-flow.png)
