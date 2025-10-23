import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

const colors = {
  primary: '#00b8b0',
  secondary: '#343A40',
  text: '#fff',
};

const container ={
  flex: 1,
  padding: 20,
}

const App = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.image}>
      <View style={[container, {justifyContent: 'flex-end'}]}>
        <Text style={styles.title}>Your Next Adventure Starts Here</Text>
        <Text style={styles.text}>
          Life's too short to stay in one place. Find your next favorite city,
          beach, or mountain and let's get moving!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main' as never)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    marginBlockStart: 60,
    color: colors.text,
  },
  text: {
    fontSize: 16,
    fontWeight: '300',
    marginTop: 10,
    color: colors.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default App;