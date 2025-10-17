import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HEADER_IMAGE = require('./assets/images/tokyo.jpg');
const AVATAR_IMAGE = require('./assets/images/p.jpg');
const SKYTREE_IMAGE = require('./assets/images/dotonburi.jpg');

const TokyoScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const PRICE_PER_PERSON = 150;
  const handleDecrement = () => { if (quantity > 1) { setQuantity(quantity - 1); } };
  const handleIncrement = () => { setQuantity(quantity + 1); };
  const totalAmount = (PRICE_PER_PERSON * quantity).toLocaleString('en-US');
  const handleComingSoon = () => { Alert.alert("Under Development", "This feature is still under development", [{ text: "OK" }]); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ImageBackground source={HEADER_IMAGE} style={styles.headerImage}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(18,18,18,0.9)']}
            style={styles.gradient}>
            <View style={styles.topNav}>
              <TouchableOpacity>
                <Text style={styles.backButton}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleComingSoon}>
                <View style={styles.weatherWidget}>
                  <Icon name="cloudy-night" size={20} color="#fff" style={styles.weatherIcon} />
                  <Text style={styles.weatherText}>18° C</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.rating}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
              <Text style={styles.title}>Tokyo</Text>
              <Text style={styles.subtitle}>
                Immerse yourself in the vibrant energy of Tokyo at night. A city where ancient traditions meet futuristic neon lights.
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
        <View style={styles.content}>
            <View style={styles.countryInfo}>
              <Text style={styles.emojiText}>🇯🇵</Text>
              <Text style={styles.countryText}>Japan</Text>
            </View>
            <Text style={styles.sectionTitle}>Traveler's Review</Text>
            <Pressable
                style={({ pressed }) => [
                styles.reviewCard,
                { backgroundColor: pressed ? '#2C2C2C' : '#1E1E1E' },
                ]}
                onPress={handleComingSoon}>
                <Image source={AVATAR_IMAGE} style={styles.avatar} />
                <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>By Wildan Fadillah</Text>
                <Text style={styles.reviewText}>
                    "An unforgettable experience! The city comes alive at night. The view from the Skytree was absolutely breathtaking."
                </Text>
                </View>
            </Pressable>
            <TouchableOpacity style={styles.viewAllButton} onPress={handleComingSoon}>
                <Text style={styles.viewAllText}>View All Reviews</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Must-Visit Recommendation</Text>
            <Pressable
                style={({ pressed }) => [
                styles.recommendationCard,
                { backgroundColor: pressed ? '#2C2C2C' : '#1E1E1E' },
                ]}
                onPress={handleComingSoon}>
                <Image source={SKYTREE_IMAGE} style={styles.recommendationImage} />
                <View style={styles.recommendationDetails}>
                <Text style={styles.recommendationTitle}>Dotonbori Canal Cruise</Text>
                <Text style={styles.recommendationSubtitle}>Experience the heart of Osaka's nightlife</Text>
                </View>
            </Pressable>
        </View>
      </ScrollView>
      <View style={styles.bookingFooter}>
        <View style={styles.topFooterRow}>
          <View style={styles.quantitySelector}>
            <Pressable
              onPress={handleIncrement}
              style={({ pressed }) => [
                styles.quantityButton,
                { backgroundColor: pressed ? '#FF7043' : '#FFFFFF' },
              ]}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              onPress={handleDecrement}
              style={({ pressed }) => [
                styles.quantityButton,
                { backgroundColor: pressed ? '#FF7043' : '#FFFFFF' },
              ]}>
              <Text style={styles.quantityButtonText}>-</Text>
            </Pressable>
          </View>
          <View style={styles.priceDetails}>
            <Text style={styles.totalAmountLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${totalAmount}</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.bookNowButton,
            { backgroundColor: pressed ? '#D95A2B' : '#FF7043' },
          ]}
          onPress={handleComingSoon}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollViewContent: {
        paddingBottom: 180,
    },
    headerImage: {
        width: '100%',
        height: 450,
    },
    gradient: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
        justifyContent: 'space-between',
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    weatherWidget: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    weatherIcon: {
        marginRight: 8,
    },
    weatherText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerInfo: {
        paddingBottom: 40,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    ratingText: {
        color: '#fff',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: {width: 1, height: 2},
        textShadowRadius: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#E0E0E0',
        marginTop: 8,
        lineHeight: 24,
    },
    content: {
        padding: 20,
        backgroundColor: '#121212',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -30,
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    emojiText: {
        fontSize: 24,
    },
    countryText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: '500',
        color: '#E0E0E0',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    reviewCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 16,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontWeight: 'bold',
        color: '#BDBDBD',
    },
    reviewText: {
        color: '#9E9E9E',
        marginTop: 4,
        lineHeight: 20,
    },
    viewAllButton: {
        backgroundColor: '#2C2C2C',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 24,
    },
    viewAllText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    recommendationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
    },
    recommendationImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
    },
    recommendationDetails: {
        marginLeft: 16,
        flex: 1,
    },
    recommendationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    recommendationSubtitle: {
        fontSize: 14,
        color: '#BDBDBD',
        marginTop: 4,
    },
    bookingFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#293241',
        padding: 20,
        paddingBottom: 30,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    topFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    quantityText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginHorizontal: 16,
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E1E1E',
    },
    priceDetails: {
        alignItems: 'flex-end',
    },
    totalAmountLabel: {
        color: '#E0E0E0',
        fontSize: 14,
        marginBottom: 2,
    },
    totalAmount: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bookNowButton: {
        backgroundColor: '#FF7043',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookNowText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default TokyoScreen;