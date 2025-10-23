import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator'; 
import DetailExample from '../screens/Detail/DetailExample';
import DrawerNavigator from './DrawerNavigator';
import StartScreen from '../screens/StartScreen';
import DetailExample2 from '../screens/Detail/DetailExample2';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="StartScreen">
        <Stack.Screen options={{headerShown: false}} name="StartScreen" component={StartScreen} />
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen name="DetailExample" component={DetailExample} />
        <Stack.Screen name="DetailExample2" component={DetailExample2} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
