import React, { Component } from 'react';
import {
  Navigator,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  MainScene
} from 'AppScenes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export class Router extends Component {
  static propTypes = {
  };
  constructor(props, context) {
    super(props, context);
    this.renderScene = ::this.renderScene;
    this.renderConfig = ::this.renderConfig;
    this.navigationRef = null;
  }
  componentDidMount() {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content');
      StatusBar.setHidden(false);
    } else {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      if (Platform.Version >= 21) {
        StatusBar.setHidden(true);
      } else {
        StatusBar.setHidden(true);
      }
    }
  }
  renderScene(route, navigator) {
    const currentRoute = typeof route === 'string' ? { name: route } : route;
    switch (currentRoute.name) {
      case 'MainScene':
        return (
          <MainScene
            navigator={navigator}
            {...route.passProps}
            onBack={() => navigator.pop()}
          />
        );
      default:
        return (
          <MainScene
            navigator={navigator}
            {...route.passProps}
            onBack={() => navigator.pop()}
          />
        );
    }
  }
  renderConfig(route, routeStack) {
    const currentRoute = typeof route === 'string' ? { name: route } : route;
    switch (currentRoute.name) {
      case 'LoginScene':
        return Navigator.SceneConfigs.FadeAndroid;
      case 'MainScene':
        return Navigator.SceneConfigs.FadeAndroid;
      default:
        return Navigator.SceneConfigs.PushFromRight;
    }
  }
  render() {
    return (
      <Navigator
        sceneStyle={styles.container}
        initialRoute={{ name: 'MainScene' }}
        renderScene={this.renderScene}
        configureScene={this.renderConfig}
        ref={(ref) => this.navigationRef = ref}
      />
    );
  }
}
