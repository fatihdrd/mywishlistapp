import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './src/components/HomePage';
import ShareScreen from './src/components/ShareScreen'; 
import { NativeModules, NativeEventEmitter } from 'react-native';
import { enableScreens } from 'react-native-screens';

enableScreens();
const { ShareModule } = NativeModules;
const shareEventEmitter = new NativeEventEmitter();
const Stack = createStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
  };

  useEffect(() => {
    const subscription = shareEventEmitter.addListener('onShareReceived', (data) => {
      console.log(data);
      navigationRef.current?.navigate('ShareScreen', { sharedData: data });
    });
    return () => subscription.remove(); // Cleanup
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
      <Stack.Navigator initialRouteName="HomePage">
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="ShareScreen" component={ShareScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
