import React, { Component } from 'react'
import { View, Button } from 'react-native'
import { endpoints } from './bugsnag'
import bugsnag from '@bugsnag/expo'

export default class ConsoleBreadcrumbs extends Component {
  defaultConsoleBreadcrumbsBehaviour = () => {
    this.triggerConsoleBreadcrumbsError(
      bugsnag({
        endpoints: endpoints,
        autoDetectErrors: false,
        autoTrackSessions: false
      }),
      "defaultConsoleBreadcrumbsBehaviour"
    )
  }

  disabledConsoleBreadcrumbsBehaviour = () => {
    this.triggerConsoleBreadcrumbsError(
      bugsnag({
        endpoints: endpoints,
        autoDetectErrors: false,
        autoTrackSessions: false,
        enabledBreadcrumbTypes: []
      }),
      "disabledConsoleBreadcrumbsBehaviour"
    )
  }

  disabledAllConsoleBreadcrumbsBehaviour = () => {
    this.triggerConsoleBreadcrumbsError(
      bugsnag({
        endpoints: endpoints,
        autoDetectErrors: false,
        autoTrackSessions: false,
        enabledBreadcrumbTypes: null
      }),
      "disabledAllConsoleBreadcrumbsBehaviour"
    )
  }

  overrideConsoleBreadcrumbsBehaviour = () => {
    this.triggerConsoleBreadcrumbsError(
      bugsnag({
        endpoints: endpoints,
        autoDetectErrors: false,
        autoTrackSessions: false,
        enabledBreadcrumbTypes: ["console"]
      }),
      "overrideConsoleBreadcrumbsBehaviour"
    )
  }

  triggerConsoleBreadcrumbsError = (client, message) => {
    console.log(message)
    client.notify(new Error(message))
  }

  render() {
    return (
      <View>
        <Button accessibilityLabel="defaultConsoleBreadcrumbsBehaviourButton"
          title="defaultConsoleBreadcrumbsBehaviour"
          onPress={this.defaultConsoleBreadcrumbsBehaviour}
        />
        <Button accessibilityLabel="disabledConsoleBreadcrumbsBehaviourButton"
          title="disabledConsoleBreadcrumbsBehaviour"
          onPress={this.disabledConsoleBreadcrumbsBehaviour}
        />
        <Button accessibilityLabel="overrideConsoleBreadcrumbsBehaviourButton"
          title="overrideConsoleBreadcrumbsBehaviour"
          onPress={this.overrideConsoleBreadcrumbsBehaviour}
        />
        <Button accessibilityLabel="disabledAllConsoleBreadcrumbsBehaviourButton"
          title="disabledAllConsoleBreadcrumbsBehaviour"
          onPress={this.disabledAllConsoleBreadcrumbsBehaviour}
        />
      </View>
    )
  }
}
