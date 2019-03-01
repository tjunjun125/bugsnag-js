# Tests

The tests are kind of in a funny place at the moment. These ones will run locally using MazeRunner v1 & work is progressing on running them through BuildKite using MazeRunner V2.  There are far too many manual steps right now to call this automated, but it should allow testing during development.

## Requirements
- Android SDK & Emulator installed
- NPM installed
- Turtle CLI installed globally

## Instructions
- cd into the `features/fixtures/test-app` fixture
- run npm install
- run the install-dev-notifier.sh script # Installs the expo package into the fixture
- set the `EXPO_USERNAME` and `EXPO_PASSWORD` environment variables # Required to publish & build the app
- run the local-build.sh script # Publishes app, copies app.json & keys into build area, then builds output.apk
- cd back to the `v1` folder
- run `bundle install`
- set the `EMULATOR` environment variable to an existing Android emulator
- run `bundle exec bugsnag-maze-runner`