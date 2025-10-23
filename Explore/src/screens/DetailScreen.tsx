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
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

// Aset Gambar
const AVATAR_IMAGE = require('../assets/images/labuan_bajo.jpg');
const SKYTREE_IMAGE = require('../assets/images/seoul.jpg');
const TOKYO_TOWER_IMAGE = require('../assets/images/tokyo2.jpg');
const VENICE_CANAL_IMAGE = require('../assets/images/venice.jpg');

// Helper Emoji
const getEmoji = (location: string) => {
 switch (location) {
  case 'Indonesia': return '🇮🇩';
  case 'Italia': return '🇮🇹';
  case 'Jepang': return '🇯🇵';
  case 'Korea Selatan': return '🇰🇷';
  default: return '🌏';
 }
};

// Helper untuk Parsing Harga
const parsePrice = (priceString: string): number => {
 try {
  // PERBAIKAN ESLINT: Hapus backslash sebelum forward slash
  const cleanedString = priceString.replace(/[$,/pax\s]/g, '');
  const priceNumber = parseInt(cleanedString, 10);
  return isNaN(priceNumber) ? 150 : priceNumber;
 } catch (error) {
  console.error("Error parsing price:", error);
  return 150;
 }
};

// Data Rekomendasi
const RECOMMENDATIONS = [
 {
  id: 'rec1',
  title: 'Seoul N Tower',
  subtitle: "Iconic landmark with panoramic views",
  image: SKYTREE_IMAGE,
  location: 'Korea Selatan',
  rating: 4.7,
  price: '$20/pax',
 },
 {
  id: 'rec2',
  title: 'Tokyo Tower',
  subtitle: "Experience the vibe of Tokyo",
  image: TOKYO_TOWER_IMAGE,
  location: 'Jepang',
  rating: 4.8,
  price: '$25/pax',
 },
 {
  id: 'rec3',
  title: 'Venice Canal',
  subtitle: "Romantic gondola rides",
  image: VENICE_CANAL_IMAGE,
  location: 'Italia',
  rating: 4.9,
  price: '$80/pax',
 }
];

const DetailScreen = () => {
 const navigation = useNavigation<DetailScreenNavigationProp>();
 const route = useRoute<DetailScreenRouteProp>();
 const { item } = route.params;

 const [quantity, setQuantity] = useState(1);
 const pricePerPerson = parsePrice(item.price || '$150/pax');

 const handleDecrement = () => { if (quantity > 1) { setQuantity(quantity - 1); } };
 const handleIncrement = () => { setQuantity(quantity + 1); };
 const totalAmount = (pricePerPerson * quantity).toLocaleString('en-US');

 const handleComingSoon = () => { Alert.alert("Under Development", "This feature is still under development", [{ text: "OK" }]); };

 const handleRecommendationPress = (recommendationItem: any) => {
  navigation.push('Detail', { item: recommendationItem });
 };

 return (
  <SafeAreaView style={styles.container}>
   <StatusBar barStyle="light-content" />
   <ScrollView contentContainerStyle={styles.scrollViewContent}>
    <ImageBackground source={item.image} style={styles.headerImage}>
     <LinearGradient
      colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(18,18,18,0.9)']}
      style={styles.gradient}>
      <View style={styles.topNav}>
       <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
       >
        <Icon name="chevron-left" size={18} color="#fff" />
       </TouchableOpacity>
       <TouchableOpacity onPress={handleComingSoon}>
        <View style={styles.weatherWidget}>
         <Icon name="cloud" size={18} color="#fff" style={styles.weatherIcon} />
         <Text style={styles.weatherText}>18° C</Text>
        </View>
       </TouchableOpacity>
      </View>
      <View style={styles.headerInfo}>
       <View style={styles.rating}>
        <Icon name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
       </View>
       <Text style={styles.title}>{item.title}</Text>
       <Text style={styles.subtitle}>
        Immerse yourself in the vibrant energy of this city. A place where ancient traditions meet futuristic wonders.
       </Text>
      </View>
     </LinearGradient>
    </ImageBackground>
    <View style={styles.content}>
     <View style={styles.countryInfo}>
      <Text style={styles.emojiText}>{getEmoji(item.location)}</Text>
      <Text style={styles.countryText}>{item.location}</Text>
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
       "An unforgettable experience! The city comes alive at night. The view was absolutely breathtaking."
      </Text>
      </View>
     </Pressable>
     <TouchableOpacity style={styles.viewAllButton} onPress={handleComingSoon}>
      <Text style={styles.viewAllText}>View All Reviews</Text>
     </TouchableOpacity>

     <Text style={styles.sectionTitle}>Must-Visit Recommendation</Text>

     {RECOMMENDATIONS.map((recItem) => (
      <Pressable
       key={recItem.id}
       style={({ pressed }) => [
        styles.recommendationCard,
        { backgroundColor: pressed ? '#2C2C2C' : '#1E1E1E' },
       ]}
       onPress={() => handleRecommendationPress(recItem)}
      >
       <Image source={recItem.image} style={styles.recommendationImage} />
       <View style={styles.recommendationDetails}>
        <Text style={styles.recommendationTitle}>{recItem.title}</Text>
        <Text style={styles.recommendationSubtitle}>{recItem.subtitle}</Text>
       </View>
      </Pressable>
     ))}

    </View>
   </ScrollView>

   {/* Footer Booking */}
   <View style={styles.bookingFooter}>
    <View style={styles.topFooterRow}>
     <View style={styles.quantitySelector}>
      <Pressable
       onPress={handleIncrement}
       style={({ pressed }) => [
        styles.quantityButton,
        { backgroundColor: pressed ? '#FF7043' : '#FFFFFF' },
       ]}>
       <Icon name="plus" size={16} color="#1E1E1E" />
      </Pressable>
      <Text style={styles.quantityText}>{quantity}</Text>
      <Pressable
       onPress={handleDecrement}
       style={({ pressed }) => [
        styles.quantityButton,
        { backgroundColor: pressed ? '#FF7043' : '#FFFFFF' },
       ]}>
       <Icon name="minus" size={16} color="#1E1E1E" />
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

// Styles (Tidak ada perubahan di sini selain pembersihan sebelumnya)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollViewContent: { paddingBottom: 180 },
  headerImage: { width: '100%', height: 450 },
  gradient: { flex: 1, paddingHorizontal: 20, paddingTop: 50, justifyContent: 'space-between' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  weatherWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, height: 40 },
  weatherIcon: { marginRight: 8 },
  weatherText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerInfo: { paddingBottom: 40 },
  rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10 },
  ratingText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  title: { fontSize: 52, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: {width: 1, height: 2}, textShadowRadius: 5 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 8, lineHeight: 24 },
  content: { padding: 20, backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -30 },
  countryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  emojiText: { fontSize: 24 },
  countryText: { marginLeft: 10, fontSize: 18, fontWeight: '500', color: '#E0E0E0' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, marginTop: 8 },
  reviewCard: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 16 },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontWeight: 'bold', color: '#BDBDBD' },
  reviewText: { color: '#9E9E9E', marginTop: 4, lineHeight: 20 },
  viewAllButton: { backgroundColor: '#2C2C2C', paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginBottom: 24 },
  viewAllText: { fontWeight: 'bold', color: '#FFFFFF' },
  recommendationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, marginBottom: 12 },
  recommendationImage: { width: 90, height: 90, borderRadius: 10 },
  recommendationDetails: { marginLeft: 16, flex: 1 },
  recommendationTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  recommendationSubtitle: { fontSize: 14, color: '#BDBDBD', marginTop: 4 },
  bookingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#293241', padding: 20, paddingBottom: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  topFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  quantitySelector: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  quantityText: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginHorizontal: 16 },
  priceDetails: { alignItems: 'flex-end' },
  totalAmountLabel: { color: '#E0E0E0', fontSize: 14, marginBottom: 2 },
  totalAmount: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  bookNowButton: { backgroundColor: '#FF7043', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bookNowText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default DetailScreen;