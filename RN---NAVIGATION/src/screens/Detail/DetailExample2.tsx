import {View, Text} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';

interface DatasInterface {
  id: number;
  name: string;
  age: string;
}

const DetailExample2 = () => {
  const route = useRoute();
  const {data} = route.params as {data: DatasInterface};
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>DetailExample2</Text>
      <Text>{data.id}</Text>
      <Text>{data.name}</Text>
      <Text>{data.age}</Text>
    </View>
  );
};

export default DetailExample2;
