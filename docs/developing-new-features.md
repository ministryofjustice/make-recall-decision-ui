# Developing a new feature

## Fake responses for E2E tests
The E2E tests start up make-recall-decision-api which stubs upstream services like Delius community API with Wiremock containers. Ensure that new Wiremock fixtures are added if required. 

## Generate Typescript definitions from make-recall-decision-api Swagger
Check [Swagger](https://make-recall-decision-api-dev.hmpps.service.justice.gov.uk/swagger-ui/index.html) - if the new endpoint is there, you can run `npm run swagger-to-ts` to output new typescript definitions to `./server/@types`.

## Add a Cypress integration test
If needed, add a new mock function to `./integration_tests/mockApis/makeRecallDecisionApi.js`, to get the data (and register the new function in `./integration_tests/cypress.config.ts`).

1. Add / edit test in `./integration_tests/integration`
- Temporarily change the test description to `it.only` to run the new test on its own while developing it (only works when running a single spec, not all)
- if you added a Cypress task to mock a new endpoint, call the task at the start of the new test (if you added a new Wiremock fixture, above, you could return that)
- Find elements using labels rather than attributes, if possible. It speeds up test development, has the added benefit of testing accessibility in some cases (eg for input labels), and makes the tests more readable. Use cy.* commands (which can be reused later for E2E tests).
- While developing tests, `npm run int-test-ui` is better as you can see what's going on in the browser.
- If you make an application code change you'll need to restart it - `npm run kill` then `npm run start:feature`
- If you make a change to the Cypress tests or supporting test code, it will refresh automatically
- You can stop execution in the app using Chrome devtools Node debugger. To stop execution in the test code itself, open devtools in the cypress browser window, and add a `debugger` command to the test code, where you want it to break.
2. Don't forget to remove any `.only` before committing

## Feature flags
Wrap the new feature in a [feature flag](./feature-flags.md).

### How form render / validation works for Make a recommendation
- [Flow diagram](./images/manage-recalls-ui-error-flow.png)
- To render invalid / saved / unsaved values to form inputs, add to `getFormValues.ts`
