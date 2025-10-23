import React from 'react';
import {
 View,
 Text,
 StyleSheet,
 ImageBackground,
 Pressable,
 StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type OnboardingNavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const ADVENTURE_IMAGE = require('../assets/images/tokyo.jpg');

const OnboardingScreen = () => {
 const navigation = useNavigation<OnboardingNavProp>();

 const handleStartExploring = () => {
  navigation.replace('HomeTabs');
 };

 return (
  <SafeAreaView style={styles.safeArea}>
   <StatusBar barStyle="light-content" />

   <ImageBackground
    source={ADVENTURE_IMAGE}
    style={styles.backgroundImage}
    resizeMode="cover">

    <LinearGradient
     colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)']}
     locations={[0.5, 0.7, 1]}
     style={styles.gradient}>

     <View style={styles.contentContainer}>
      <Text style={styles.title}>Your Next Adventure Starts Here</Text>

      <Text style={styles.subtitle}>
       Life's too short to stay in one place. Find your next favorite
       city, beach, or mountain and let's get moving!
      </Text>

      <Pressable
       style={({ pressed }) => [
        styles.exploreButton,
        { backgroundColor: pressed ? '#00A38D' : '#00BFA5' },
       ]}
       onPress={handleStartExploring}>
       <Text style={styles.exploreButtonText}>Start Exploring</Text>
      </Pressable>
     </View>
    </LinearGradient>
   </ImageBackground>
  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 safeArea: {
  flex: 1,
  backgroundColor: '#000',
 },
 backgroundImage: {
  flex: 1,
  width: '100%',
  height: '100%',
 },
 gradient: {
  flex: 1,
  justifyContent: 'flex-end',
  paddingHorizontal: 24,
  paddingBottom: 60,
 },
 contentContainer: {},
 title: {
  fontSize: 32,
  fontWeight: 'bold',
  color: '#fff',
  textShadowColor: 'rgba(0, 0, 0, 0.4)',
  textShadowOffset: { width: 1, height: 2 },
  textShadowRadius: 5,
  marginBottom: 8,
  lineHeight: 38,
 },
 subtitle: {
  fontSize: 13,
  color: '#E0E0E0',
  lineHeight: 18,
  marginBottom: 20,
 },
 exploreButton: {
  backgroundColor: '#00BFA5',
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  height: 44,
  paddingVertical: 8,
  width: '50%',
 },
 exploreButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
 },
});

export default OnboardingScreen;