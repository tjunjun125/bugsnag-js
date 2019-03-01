import bugsnag from '@bugsnag/expo'
const bugsnagClient = bugsnag({
  apiKey: 'e17a2bd0480511faf1beb4ee397828e1',
  endpoints: {
    notify: 'http://10.0.2.2:9339',
    sessions: 'http://10.0.2.2:9339'
  },
  autoCaptureSessions: false
})

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Linking } from 'expo'

function handledError() {
  console.log("Sending handled error");
  bugsnagClient.notify(new Error('HandledError'));
}

function handledCaughtError() {
  console.log("Sending caught handled error");
  try {
    throw new Error('HandledError');
  } catch (error) {
    bugsnagClient.notify(error);
  }
}

function unhandledError() {
  console.log("Sending unhandled error");
  throw new Error('UnhandledError');
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    Linking.getInitialURL().then(url => {
      let {path, params} = Linking.parse(url);
      console.log(path);
      switch (path) {
        case 'handledError':
          handledError();
          break;
        case 'handledCaughtError':
          handledCaughtError();
          break;
        case 'unhandledError':
          unhandledError();
          break;
      }
    });
  }
  render () {
    return (
      <View style={styles.container}>
        <Text>Test App</Text>
      </View>
    )
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
