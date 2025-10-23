import React from 'react';
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
import { RootStackParamList } from '../../App';

const BG_COLOR = '#1C1F2E';
const CARD_COLOR = '#2B2F42';
const ACCENT_COLOR = '#FF4136';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#A1A1A1';
const FILTER_BG = '#4A4E69';
const BADGE_BLACK = '#000000';

const INITIAL_DESTINATIONS = [
 { id: '1', title: 'Labuan Bajo', location: 'Indonesia', rating: 5.0, price: '$4.000/pax', image: require('../assets/images/labuan_bajo.jpg'), isLoved: false, lovesCount: 150 },
 { id: '2', title: 'Venice', location: 'Italia', rating: 4.7, price: '$3.500/pax', image: require('../assets/images/venice.jpg'), isLoved: true, lovesCount: 210 },
 { id: '3', title: 'Tokyo', location: 'Jepang', rating: 4.9, price: '$5.000/pax', image: require('../assets/images/tokyo2.jpg'), isLoved: false, lovesCount: 300 },
 { id: '4', title: 'Seoul', location: 'Korea Selatan', rating: 4.8, price: '$4.200/pax', image: require('../assets/images/seoul.jpg'), isLoved: false, lovesCount: 180 },
];

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeTabs'>;

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

const DestinationCard = ({ item, onPress, onLovePress }: { item: DestinationItem, onPress: () => void, onLovePress: () => void }) => (
 <Pressable style={styles.card} onPress={onPress}>
  <ImageBackground
   source={item.image}
   style={styles.cardImage}
   imageStyle={styles.cardImageStyle}
  >
   <Pressable style={styles.cardHeartButton} onPress={onLovePress} hitSlop={10}>
    <Icon
        name={item.isLoved ? "heart" : "heart-o"}
        size={18}
        color={item.isLoved ? ACCENT_COLOR : "#fff"}
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

const HomeScreen = () => {
 const navigation = useNavigation<HomeNavigationProp>();

 const [destinations, setDestinations] = React.useState<DestinationItem[]>(INITIAL_DESTINATIONS);
 const [totalLoves, setTotalLoves] = React.useState(0);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [filteredDestinations, setFilteredDestinations] = React.useState<DestinationItem[]>(INITIAL_DESTINATIONS);

 React.useEffect(() => {
    const lovedCount = destinations.filter(dest => dest.isLoved).length;
    setTotalLoves(lovedCount);
 }, [destinations]);

 React.useEffect(() => {
    if (searchQuery === '') {
      setFilteredDestinations(destinations);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.title.toLowerCase().includes(lowerCaseQuery) ||
        dest.location.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredDestinations(filtered);
    }
 }, [searchQuery, destinations]);

 const handleCardPress = (item: DestinationItem) => {
    const currentItemState = destinations.find(d => d.id === item.id) || item;
    navigation.navigate('Detail', { item: currentItemState });
 };

 const handleLovePress = (itemId: string) => {
    setDestinations(prevDestinations =>
      prevDestinations.map(dest =>
        dest.id === itemId
          ? { ...dest, isLoved: !dest.isLoved }
          : dest
      )
    );
 };

 const handleNavigateToTickets = () => {
    navigation.navigate('Tickets');
 };

 const handleSearch = (query: string) => {
    setSearchQuery(query);
 };

 return (
  <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
   <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />

   <View style={styles.header}>
    <View>
     <Text style={styles.headerHi}>Hi,</Text>
     <Text style={styles.headerName}>Wildan Fadillah</Text>
    </View>
    <View style={styles.headerIconContainer}>
     <Pressable onPress={() => { /* Logika ikon love utama */ }}>
      <Icon name="heart" size={28} color={ACCENT_COLOR} />
     </Pressable>
     {totalLoves > 0 && (
       <View style={styles.badge}>
           <Text style={styles.badgeText}>{totalLoves}</Text>
       </View>
     )}
    </View>
   </View>

   <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
   >
    <Pressable style={styles.promoCard} onPress={handleNavigateToTickets}>
     <Text style={styles.promoTitle}>Plan Your Summer!</Text>
     <View style={styles.promoButton}>
      <Icon name="arrow-right" size={20} color="#fff" />
     </View>
    </Pressable>

    <View style={styles.searchSection}>
     <View style={styles.searchBar}>
      <Icon name="search" size={18} color={TEXT_SECONDARY} />
      <TextInput
       placeholder="Search destination or country..."
       placeholderTextColor={TEXT_SECONDARY}
       style={styles.searchInput}
       value={searchQuery}
       onChangeText={handleSearch}
      />
     </View>
     <Pressable style={styles.filterButton}>
      <Icon name="sliders" size={18} color="#fff" />
     </Pressable>
    </View>

    <View style={styles.sectionHeader}>
     <Text style={styles.sectionTitle}>Popular Destination</Text>
     <Pressable>
      <Text style={styles.seeAllText}>View All</Text>
     </Pressable>
    </View>

    <FlatList
     data={filteredDestinations}
     renderItem={({ item }) => (
      <DestinationCard
        item={item}
        onPress={() => handleCardPress(item)}
        onLovePress={() => handleLovePress(item.id)}
      />
     )}
     keyExtractor={(item) => item.id}
     showsVerticalScrollIndicator={false}
     scrollEnabled={false}
     contentContainerStyle={styles.listContainer}
     ListEmptyComponent={<Text style={styles.emptyListText}>No destinations found.</Text>}
    />
   </ScrollView>

   <View style={styles.bottomNav}>
         <Pressable style={styles.navButton} onPress={() => navigation.navigate('HomeTabs')}>
           <Icon name="home" size={26} color={ACCENT_COLOR} />
         </Pressable>
         <Pressable style={styles.navButton} onPress={handleNavigateToTickets}>
           <Icon name="ticket" size={26} color={TEXT_SECONDARY} />
         </Pressable>
         <Pressable style={styles.navButton} onPress={() => {/* Navigasi ke Profile nanti */}}>
           <Icon name="user" size={26} color={TEXT_SECONDARY} />
         </Pressable>
   </View>

  </SafeAreaView>
 );
};

export default HomeScreen;

const styles = StyleSheet.create({
 safeArea: { flex: 1, backgroundColor: BG_COLOR },
 header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 24,
  paddingTop: 12,
  paddingBottom: 10,
 },
 headerHi: { fontSize: 16, color: TEXT_PRIMARY },
 headerName: { fontSize: 22, fontWeight: 'bold', color: TEXT_PRIMARY },
 headerIconContainer: {
    position: 'relative',
    padding: 5,
 },
 badge: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: BADGE_BLACK,
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: TEXT_PRIMARY,
 },
 badgeText: {
  color: TEXT_PRIMARY,
  fontSize: 11,
  fontWeight: 'bold',
 },
 promoCard: {
  backgroundColor: ACCENT_COLOR,
  borderRadius: 20,
  marginHorizontal: 24,
  paddingVertical: 20,
  paddingHorizontal: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
 },
 promoTitle: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  flex: 1,
 },
 promoButton: {
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
 emptyListText: {
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
 },
 scrollContent: {
  paddingBottom: 20,
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
 navButton: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
 },
});