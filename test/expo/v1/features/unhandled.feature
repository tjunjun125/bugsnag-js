Feature: Reporting unhandled errors

Scenario: catching an Unhandled error
  Given I have started the Android device
  And I install the "com.bugsnag.expo.testfixture" Android app from "features/fixtures/packages/output.apk"
  When I launch the app with the link "testapp://unhandledError"
  Then I wait to receive a request
  And the exception "errorClass" equals "Error"
  And the exception "message" equals "UnhandledError"