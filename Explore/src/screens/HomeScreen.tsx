import React, { useState, useEffect } from 'react'; // Import useState dan useEffect
import {
 View,
 Text,
 StyleSheet,
 StatusBar,
 ScrollView,
 ImageBackground,
 TextInput,
 Pressable,
 FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Import RootStackParamList

// Palet warna
const BG_COLOR = '#1C1F2E';
const CARD_COLOR = '#2B2F42';
const ACCENT_COLOR = '#FF4136';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#A1A1A1';
const FILTER_BG = '#4A4E69';
const BADGE_RED = '#FF4136';

// Data destinasi awal (Tambahkan isLoved dan lovesCount)
const INITIAL_DESTINATIONS = [
 {
  id: '1',
  title: 'Labuan Bajo',
  location: 'Indonesia',
  // rating: 5.1, // Rating sebaiknya tidak lebih dari 5
  rating: 5.0,
  price: '$4.000/pax',
  image: require('../assets/images/labuan_bajo.jpg'),
  isLoved: false,
  lovesCount: 150,
 },
 {
  id: '2',
  title: 'Venice',
  location: 'Italia',
  rating: 4.7,
  price: '$3.500/pax',
  image: require('../assets/images/venice.jpg'),
  isLoved: true, // Status awal
  lovesCount: 210,
 },
 {
  id: '3',
  title: 'Tokyo',
  location: 'Jepang',
  rating: 4.9,
  price: '$5.000/pax',
  image: require('../assets/images/tokyo2.jpg'),
  isLoved: false,
  lovesCount: 300,
 },
 {
  id: '4',
  title: 'Seoul',
  location: 'Korea Selatan',
  rating: 4.8,
  price: '$4.200/pax',
  image: require('../assets/images/seoul.jpg'),
  isLoved: false,
  lovesCount: 180,
 },
];

// Tipe Navigasi
type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeTabs'>; // Pastikan 'HomeTabs' adalah nama route yang benar di App.tsx

// Tipe Data Item Destinasi (lebih spesifik)
type DestinationItem = {
    id: string;
    title: string;
    location: string;
    rating: number;
    price: string;
    image: any;
    isLoved: boolean;
    lovesCount: number;
};


// Komponen Kartu (Tambahkan onLovePress, gunakan item.isLoved)
const DestinationCard = ({ item, onPress, onLovePress }: { item: DestinationItem, onPress: () => void, onLovePress: () => void }) => (
 <Pressable style={styles.card} onPress={onPress}>
  <ImageBackground
   source={item.image}
   style={styles.cardImage}
   imageStyle={styles.cardImageStyle}
  >
   {/* Tombol Hati dibuat interaktif */}
   <Pressable style={styles.cardHeartButton} onPress={onLovePress} hitSlop={10}>
    <Icon
        name={item.isLoved ? "heart" : "heart-o"} // Dinamis berdasarkan isLoved
        size={18}
        color={item.isLoved ? ACCENT_COLOR : "#fff"} // Warna dinamis
    />
   </Pressable>

   <View style={styles.cardOverlay}>
    <View style={styles.cardInfoContainer}>
     <View style={styles.cardTopInfoRow}>
      <View style={styles.cardLocationContainer}>
       <Icon name="map-marker" size={14} color={TEXT_PRIMARY} />
       <Text style={styles.cardLocation}>{item.location}</Text>
      </View>
      <View style={styles.cardRatingContainer}>
       <Icon name="star" size={14} color="#FFD700" />
       <Text style={styles.cardRating}>{item.rating}</Text>
      </View>
     </View>
     <View style={styles.cardBottomInfoRow}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
     </View>
    </View>
   </View>
  </ImageBackground>
 </Pressable>
);

// Home Screen
const HomeScreen = () => {
 const navigation = useNavigation<HomeNavigationProp>();

 // State untuk data destinasi (agar bisa diubah isLoved-nya)
 const [destinations, setDestinations] = useState<DestinationItem[]>(INITIAL_DESTINATIONS);
 // State untuk total love
 const [totalLoves, setTotalLoves] = useState(0);

 // Hitung total loves setiap kali 'destinations' berubah
 useEffect(() => {
    const lovedCount = destinations.filter(dest => dest.isLoved).length;
    setTotalLoves(lovedCount);
 }, [destinations]);

 const handleCardPress = (item: DestinationItem) => {
    // Kirim state 'isLoved' dan 'lovesCount' terbaru ke DetailScreen
    navigation.navigate('Detail', { item: item });
 };

 // Fungsi untuk toggle status love
 const handleLovePress = (itemId: string) => {
    setDestinations(prevDestinations =>
      prevDestinations.map(dest =>
        dest.id === itemId
          ? { ...dest, isLoved: !dest.isLoved } // Toggle isLoved
          : dest
      )
    );
 };

 // ===> TAMBAHAN: Fungsi navigasi ke TicketScreen <===
 const handleNavigateToTickets = () => {
    navigation.navigate('Tickets'); // Pastikan 'Tickets' adalah nama route di App.tsx
 };

 return (
  <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
   <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />

   <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
   >
    {/* Header */}
    <View style={styles.header}>
     <View>
      <Text style={styles.headerHi}>Hi,</Text>
      <Text style={styles.headerName}>Wildan Fadillah</Text>
     </View>
     {/* Container icon love header */}
     <View style={styles.headerIconContainer}>
      <Pressable style={styles.notificationIcon}>
       <Icon name="heart-o" size={18} color={ACCENT_COLOR} />
      </Pressable>
      {/* Badge dipindahkan ke sini */}
      {totalLoves > 0 && ( // Tampilkan badge hanya jika ada love
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalLoves}</Text>
        </View>
      )}
     </View>
    </View>

    {/* Promo Section - TAMBAHKAN onPress */}
    <Pressable style={styles.promoCard} onPress={handleNavigateToTickets}> {/* <= TAMBAHKAN onPress DI SINI */}
     <Text style={styles.promoTitle}>Plan Your Summer!</Text>
     {/* Tombol panah kanan dibungkus View agar tidak ikut memicu onPress utama */}
     <View style={styles.promoButton}>
      <Icon name="arrow-right" size={20} color="#fff" />
     </View>
    </Pressable>

    {/* Search Bar */}
    <View style={styles.searchSection}>
     <View style={styles.searchBar}>
      <Icon name="search" size={18} color={TEXT_SECONDARY} />
      <TextInput
       placeholder="Search destination..."
       placeholderTextColor={TEXT_SECONDARY}
       style={styles.searchInput}
      />
     </View>
     <Pressable style={styles.filterButton}>
      <Icon name="sliders" size={18} color="#fff" />
     </Pressable>
    </View>

    {/* Popular Destination */}
    <View style={styles.sectionHeader}>
     <Text style={styles.sectionTitle}>Popular Destination</Text>
     <Pressable>
      <Text style={styles.seeAllText}>View All</Text>
     </Pressable>
    </View>

    {/* FlatList */}
    <FlatList
     data={destinations} // Gunakan state 'destinations'
     renderItem={({ item }) => (
      <DestinationCard
        item={item}
        onPress={() => handleCardPress(item)}
        onLovePress={() => handleLovePress(item.id)} // Kirim ID saat love ditekan
      />
     )}
     keyExtractor={(item) => item.id}
     showsVerticalScrollIndicator={false}
     scrollEnabled={false}
     contentContainerStyle={styles.listContainer}
    />
   </ScrollView>

   {/* --- NAVIGASI BAWAH --- */}
   <View style={styles.bottomNav}>
    <Pressable style={styles.navButton}>
     <Icon name="home" size={26} color={ACCENT_COLOR} />
    </Pressable>
    {/* ===> TAMBAHKAN onPress ke ikon tiket <=== */}
    <Pressable style={styles.navButton} onPress={handleNavigateToTickets}> {/* <= TAMBAHKAN onPress DI SINI */}
     <Icon name="ticket" size={26} color={TEXT_SECONDARY} />
    </Pressable>
    <Pressable style={styles.navButton}>
     <Icon name="user" size={26} color={TEXT_SECONDARY} />
    </Pressable>
   </View>

  </SafeAreaView>
 );
};

export default HomeScreen;

// Styles (Tidak ada perubahan)
const styles = StyleSheet.create({
 safeArea: { flex: 1, backgroundColor: BG_COLOR },
 header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 24,
  paddingTop: 12,
  marginBottom: 16,
 },
 headerHi: { fontSize: 16, color: TEXT_PRIMARY },
 headerName: { fontSize: 22, fontWeight: 'bold', color: TEXT_PRIMARY },
 headerIconContainer: {
    position: 'relative',
 },
 notificationIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: ACCENT_COLOR,
 },
 badge: {
  position: 'absolute',
  bottom: -6,
  right: -6,
  backgroundColor: BADGE_RED,
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
 },
 badgeText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
 },
 promoCard: { // Diubah jadi Pressable
  backgroundColor: ACCENT_COLOR,
  borderRadius: 20,
  marginHorizontal: 24,
  paddingVertical: 20,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
 },
 promoTitle: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  flex: 1,
 },
 promoButton: { // Diubah jadi View
  width: 36,
  height: 60,
  backgroundColor: 'rgba(0,0,0,0.2)',
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 12,
 },
 searchSection: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 24,
  marginTop: 24,
 },
 searchBar: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: CARD_COLOR,
  borderRadius: 15,
  paddingHorizontal: 16,
  height: 48,
 },
 searchInput: {
  flex: 1,
  marginLeft: 10,
  fontSize: 14,
  color: TEXT_PRIMARY,
 },
 filterButton: {
  marginLeft: 16,
  backgroundColor: FILTER_BG,
  padding: 12,
  borderRadius: 15,
  height: 48,
  justifyContent: 'center',
  alignItems: 'center',
 },
 sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginHorizontal: 24,
  marginTop: 28,
  marginBottom: 16,
 },
 sectionTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_PRIMARY },
 seeAllText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
 listContainer: {
  paddingHorizontal: 24,
 },
 scrollContent: {
  paddingBottom: 100,
 },
 card: {
  backgroundColor: CARD_COLOR,
  borderRadius: 16,
  marginBottom: 20,
  overflow: 'hidden',
  elevation: 3,
 },
 cardImage: {
  width: '100%',
  height: 180,
  justifyContent: 'flex-end',
 },
 cardImageStyle: {
  borderRadius: 16,
 },
 cardHeartButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
 },
 cardOverlay: {
  padding: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
 },
 cardInfoContainer: {},
 cardTopInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
 },
 cardLocationContainer: {
  flexDirection: 'row',
  alignItems: 'center',
 },
 cardLocation: {
  fontSize: 13,
  color: TEXT_PRIMARY,
  marginLeft: 5,
 },
 cardRatingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
 },
 cardRating: {
  color: TEXT_PRIMARY,
  marginLeft: 4,
  fontSize: 13,
 },
 cardBottomInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
 },
 cardTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: TEXT_PRIMARY,
 },
 cardPrice: {
  color: TEXT_PRIMARY,
  fontWeight: 'bold',
  fontSize: 16,
 },
 bottomNav: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: CARD_COLOR,
  paddingTop: 12,
  paddingBottom: 25,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
 },
 navButton: { // Diubah jadi Pressable
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
 },
});