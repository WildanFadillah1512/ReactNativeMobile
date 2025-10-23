import {View, Text} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';

const DetailExample = () => {
  const route = useRoute();
  const {message} = route.params as {message: string};
  return (
    <View>
      <Text>DetailExample</Text>
      <Text>{message}</Text>
    </View>
  );
};

export default DetailExample;
