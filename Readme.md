# Xendit Coding Exercise
[![CircleCI](https://circleci.com/gh/kihonq/xendit-backend-test/tree/master.svg?style=shield)](https://circleci.com/gh/kihonq/xendit-backend-test/tree/master)  [![codecov](https://codecov.io/gh/kihonq/xendit-backend-test/branch/master/graph/badge.svg?token=8OU13YDAOH)](https://codecov.io/gh/kihonq/xendit-backend-test)

The goal of these exercises are to assess your proficiency in software engineering that is related to the daily work that we do at Xendit. Please follow the instructions below to complete the assessment.

## Setup

1. Fork this repository to your own github profile
2. Ensure `node (>=12)` and `npm` are installed
3. Run `npm install`
4. Run `npm test`
5. Run `npm start`
6. Hit the server to test health `curl localhost:8010/health` and expect a `200` response 

## Tasks

Below will be your set of tasks to accomplish. Please work on each of these tasks in order. Success criteria will be defined clearly for each task

1. - [x] [Documentation](#documentation)
2. - [x] [Implement Tooling](#implement-tooling)
3. - [x] [Implement Pagination](#implement-pagination)
4. - [x] [Refactoring](#refactoring)
5. - [x] [Security](#security)
6. - [x] [Load Testing](#load-testing)

### Documentation

Please deliver documentation of the server that clearly explains the goals of this project and clarifies the API request and response that is expected.
Feel free to use any open source documentation tools such as OpenAPI / Swagger. 

#### Success Criteria

1. - [x] A pull request against `master` of your fork with a clear description of the change and purpose and merge it
2. - [x] **[BONUS]** Create an easy way to deploy and view the documentation in a web format and include instructions to do so - _(Check below)_

##### Steps
- Run `npm run docs` and access the documentation through http://localhost:3000
- For doc development, run `npm run watch:docs` and access through http://localhost:8080 to see live changes

### Implement Tooling

Please implement the following tooling:

1. - [x] `eslint` - for linting
2. - [x] `nyc` - for code coverage
3. - [x] `pre-push` - for git pre push hook running tests - _(Using `husky` instead)_
4. - [x] `winston` - for logging

#### Success Criteria

1. - [x] Create a pull request against `master` of your fork with the new tooling and merge it
    1. - [x] `eslint` should have an opinionated format
    2. - [x] `nyc` should aim for test coverage of `80%` across lines, statements, and branches
    3. - [x] `pre-push` should run the tests before allowing pushing using `git`
    4. - [x] `winston` should be used to replace console logs and all errors should be logged as well. Logs should go to disk.
2. - [x] Ensure that tooling is connected to `npm test`
3. - [x] Ensure that tests covers possible positive and negative scenarios
4. - [x] Create a separate pull request against `master` of your fork with the linter fixes and merge it
5. - [x] Create a separate pull request against `master` of your fork to increase code coverage to acceptable thresholds and merge it
6. - [x] **[BONUS]** Add integration to CI such as Travis or Circle - _(CircleCI is being chosen here with Codecov integration)_
7. - [x] **[BONUS]** Add Typescript support

### Implement Pagination

Please implement pagination to retrieve pages of the resource `rides`.

1. - [x] Create a pull request against `master` with your changes to the `GET /rides` endpoint to support pagination including:
    1. - [x] Code changes
    2. - [x] Tests
    3. - [x] Documentation
2. - [x] Merge the pull request

### Refactoring

Please implement the following refactors of the code:

1. - [x] Convert callback style code to use `async/await`
2. - [x] Reduce complexity at top level control flow logic and move logic down and test independently
3. - [x] **[BONUS]** Split between functional and imperative function and test independently

#### Success Criteria

1. - [x] A pull request against `master` of your fork for each of the refactors above with:
    1. - [x] Code changes
    2. - [x] Tests covering positive and negative scenarios

### Security

Please implement the following security controls for your system:

1. - [x] Ensure the system is not vulnerable to [SQL injection](https://www.owasp.org/index.php/SQL_Injection)
2. - [ ] **[BONUS]** Implement an additional security improvement of your choice

#### Solutions
- Added [TypeORM](https://typeorm.io) in this project and no raw SQL query being called with `repo.query`
- `where: { riderName: Like(`%${query.keyword}%`) }` will not treat `riderName` as a [partial SQL syntax](https://dev.to/yoshi_yoshi/typeorm-prevent-sql-injection-with-node-js-react-typescript-in-2021-1go4), but rather a prepared statements.

#### Success Criteria

1. - [] A pull request against `master` of your fork with:
    1. - [x] Changes to the code
    2. - [ ] Tests ensuring the vulnerability is addressed

### Load Testing

Please implement load testing to ensure your service can handle a high amount of traffic

#### Success Criteria

1. - [x] Implement load testing using `artillery`
    1. - [x] Create a PR against `master` of your fork including artillery
    2. - [x] Ensure that load testing is able to be run using `npm test:load`. You can consider using a tool like `forever` to spin up a daemon and kill it after the load test has completed. - _(Using `concurrently` instead with `--quiet` option. TODO: It doesn't properly exit. Need to manually exit for now)_
    3. - [x] Test all endpoints under at least `100 rps` for `30s` and ensure that `p99` is under `50ms` - _(Average is p99:30ms. Check out `.artillery/summary.json.html` for summary report)_
