Feature: Meta data

Background:
  Given the element "metadataFeature" is present
  And I click the element "metadataFeature"

Scenario: Meta data can be set via the client
  Given the element "metadataClientButton" is present
  When I click the element "metadataClientButton"
  Then I wait to receive a request
  And the exception "errorClass" equals "Error"
  And the exception "message" equals "MetaDataClientError"
  And the event "metadata.extra.reason" equals "metadataClientName"

Scenario: Meta data can be set via a callback
  Given the element "metadataCallbackButton" is present
  When I click the element "metadataCallbackButton"
  Then I wait to receive a request
  And the exception "errorClass" equals "Error"
  And the exception "message" equals "MetaDataCallbackError"
  And the event "metadata.extra.reason" equals "metadataCallbackName"
