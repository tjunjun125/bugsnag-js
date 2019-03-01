Feature: Reporting handled errors

Scenario: calling notify() with Error
  Given I have started the Android device
  And I install the "com.bugsnag.expo.testfixture" Android app from "features/fixtures/packages/output.apk"
  When I launch the app with the link "testapp://handledError"
  Then I wait to receive a request
  And the exception "errorClass" equals "Error"
  And the exception "message" equals "HandledError"

Scenario: calling notify() with a caught Error
  Given I have started the Android device
  And I install the "com.bugsnag.expo.testfixture" Android app from "features/fixtures/packages/output.apk"
  When I launch the app with the link "testapp://handledCaughtError"
  Then I wait to receive a request
  And the exception "errorClass" equals "Error"
  And the exception "message" equals "HandledCaughtError"