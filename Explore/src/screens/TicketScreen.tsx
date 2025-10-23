import React, { useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 StatusBar,
 ScrollView,
 TouchableOpacity,
 FlatList,
 Modal,
 Pressable,
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
const BORDER_DARK = '#4A4E69';
const ACCENT_BLUE = '#61AFEF';
const MODAL_OVERLAY_BG = 'rgba(0, 0, 0, 0.7)';

type TicketScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tickets'>;

const TICKET_DATA = [
 { id: '1', airline: 'SKY Airlines', fromCode: 'CGK', fromCity: 'Jakarta', toCode: 'DPS', toCity: 'Denpasar', departureTime: '7:00am', departureDate: 'Sat, 21 Jun', arrivalTime: '9:50am', arrivalDate: 'Sat, 21 Jun', price: '$150' },
 { id: '2', airline: 'Ocean Air', fromCode: 'CGK', fromCity: 'Jakarta', toCode: 'DPS', toCity: 'Denpasar', departureTime: '10:30am', departureDate: 'Sat, 21 Jun', arrivalTime: '1:20pm', arrivalDate: 'Sat, 21 Jun', price: '$185' },
 { id: '3', airline: 'Archipelago Fly', fromCode: 'CGK', fromCity: 'Jakarta', toCode: 'DPS', toCity: 'Denpasar', departureTime: '3:15pm', departureDate: 'Sat, 21 Jun', arrivalTime: '6:05pm', arrivalDate: 'Sat, 21 Jun', price: '$160' },
 { id: '4', airline: 'SKY Airlines', fromCode: 'CGK', fromCity: 'Jakarta', toCode: 'DPS', toCity: 'Denpasar', departureTime: '8:00pm', departureDate: 'Sat, 21 Jun', arrivalTime: '10:50pm', arrivalDate: 'Sat, 21 Jun', price: '$175' },
];

const LOCATION_OPTIONS = ['Netherlands', 'Indonesia', 'Japan', 'South Korea', 'Italy'];
const DATE_OPTIONS = ['June, 2025', 'July, 2025', 'August, 2025', 'May, 2025', 'April, 2025', 'March, 2025'];

const TicketCard = ({ item }: { item: typeof TICKET_DATA[0] }) => {
 return (
  <View style={styles.card}>
   <View style={styles.airlineStripe}>
    <Text style={styles.airlineText}>AIRLINES</Text>
    <View style={styles.airlineIconCircle}>
     <Icon name="plane" size={16} color={BG_COLOR} />
    </View>
   </View>
   <View style={styles.cardContent}>
    <View style={styles.routeContainer}>
     <View style={styles.location}>
      <Text style={styles.locationCode}>{item.fromCode}</Text>
      <Text style={styles.locationCity}>{item.fromCity}</Text>
     </View>
     <Icon name="plane" size={24} color={TEXT_SECONDARY} style={styles.planeIcon} />
     <View style={[styles.location, styles.alignEnd]}>
      <Text style={styles.locationCode}>{item.toCode}</Text>
      <Text style={styles.locationCity}>{item.toCity}</Text>
     </View>
    </View>
    <View style={styles.timeContainer}>
     <View style={styles.dateTime}>
      <Text style={styles.timeText}>{item.departureTime}</Text>
      <Text style={styles.dateText}>{item.departureDate}</Text>
     </View>
     <View style={[styles.dateTime, styles.alignEnd]}>
      <Text style={styles.timeText}>{item.arrivalTime}</Text>
      <Text style={styles.dateText}>{item.arrivalDate}</Text>
     </View>
    </View>
    <Text style={styles.priceText}>{item.price}</Text>
   </View>
  </View>
 );
};

const TicketScreen = () => {
 const navigation = useNavigation<TicketScreenNavigationProp>();
 const [activeFilter, setActiveFilter] = useState('Aircraft');
 const [selectedDate, setSelectedDate] = useState(23);
 const [isDatePickerVisible, setDatePickerVisible] = useState(false);
 const [isLocationPickerVisible, setLocationPickerVisible] = useState(false);
 const [currentLocation, setCurrentLocation] = useState('Netherlands');
 const [currentMonthYear, setCurrentMonthYear] = useState('June, 2025');

 const filters = ['Hotel', 'Aircraft', 'Villa', 'Attractions'];
 const dates = Array.from({ length: 15 }, (_, i) => {
    const date = 16 + i;
    const dayIndex = (date - 16 + 5) % 7;
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return { day: days[dayIndex], date: date };
 });

 const handleLocationSelect = (location: string) => {
    setCurrentLocation(location);
    setLocationPickerVisible(false);
 };

 const handleDateSelect = (date: string) => {
    setCurrentMonthYear(date);
    setDatePickerVisible(false);
 };

 return (
  <SafeAreaView style={styles.safeArea}>
   <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />

   <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
     <Icon name="angle-left" size={24} color={TEXT_PRIMARY} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Tickets</Text>
    <TouchableOpacity onPress={() => { /* Logika menu */ }} style={styles.headerButton}>
     <Icon name="ellipsis-v" size={20} color={TEXT_PRIMARY} />
    </TouchableOpacity>
   </View>

   <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
    <View style={styles.section}>
     <Text style={styles.sectionLabel}>Current locations</Text>
     <TouchableOpacity style={styles.dropdown} onPress={() => setLocationPickerVisible(true)}>
      <Text style={styles.dropdownText}>{currentLocation}</Text>
      <Icon name="angle-down" size={20} color={TEXT_PRIMARY} />
     </TouchableOpacity>
    </View>

    <View style={styles.filterContainer}>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
      {filters.map((filter) => (
       <TouchableOpacity
        key={filter}
        style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
        onPress={() => setActiveFilter(filter)}
       >
        <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
       </TouchableOpacity>
      ))}
     </ScrollView>
    </View>

    <View style={styles.section}>
     <TouchableOpacity style={styles.monthSelector} onPress={() => setDatePickerVisible(true)}>
      <Text style={styles.monthText}>{currentMonthYear}</Text>
      <Icon name="angle-down" size={18} color={TEXT_PRIMARY} />
     </TouchableOpacity>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarDaysScroll}>
      {dates.map((d) => (
       <TouchableOpacity
        key={d.date}
        style={[styles.dateChip, selectedDate === d.date && styles.dateChipActive]}
        onPress={() => setSelectedDate(d.date)}
       >
        <Text style={[styles.dateDayText, selectedDate === d.date && styles.dateTextActive]}>{d.day}</Text>
        <Text style={[styles.dateNumText, selectedDate === d.date && styles.dateTextActive]}>{d.date}</Text>
       </TouchableOpacity>
      ))}
     </ScrollView>
    </View>

    <View style={styles.resultsContainer}>
     <Text style={styles.resultsText}>{TICKET_DATA.length} Tickets Found</Text>
     <FlatList
      data={TICKET_DATA}
      renderItem={({ item }) => <TicketCard item={item} />}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
     />
    </View>
   </ScrollView>

   <View style={styles.bottomNav}>
     <Pressable style={styles.navButton} onPress={() => navigation.navigate('HomeTabs')}>
       <Icon name="home" size={26} color={TEXT_SECONDARY} />
     </Pressable>
     <Pressable style={styles.navButton}>
       <Icon name="ticket" size={26} color={ACCENT_COLOR} />
     </Pressable>
     <Pressable style={styles.navButton} onPress={() => {/* Navigasi ke Profile nanti */}}>
       <Icon name="user" size={26} color={TEXT_SECONDARY} />
     </Pressable>
   </View>

   <Modal
    animationType="fade"
    transparent={true}
    visible={isDatePickerVisible}
    onRequestClose={() => setDatePickerVisible(false)}
   >
    <Pressable style={styles.modalOverlay} onPress={() => setDatePickerVisible(false)}>
     <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
      <Text style={styles.modalTitle}>Select Month & Year</Text>
      <ScrollView style={styles.modalScroll}>
       {DATE_OPTIONS.map((dateOption, index) => (
        <TouchableOpacity
         key={dateOption}
         style={[
          styles.modalOptionButton,
          index === DATE_OPTIONS.length - 1 && styles.modalOptionButtonLast
         ]}
         onPress={() => handleDateSelect(dateOption)}
        >
         <Text style={styles.modalOptionText}>{dateOption}</Text>
        </TouchableOpacity>
       ))}
      </ScrollView>
     </View>
    </Pressable>
   </Modal>

   <Modal
    animationType="fade"
    transparent={true}
    visible={isLocationPickerVisible}
    onRequestClose={() => setLocationPickerVisible(false)}
   >
    <Pressable style={styles.modalOverlay} onPress={() => setLocationPickerVisible(false)}>
     <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
      <Text style={styles.modalTitle}>Select Location</Text>
       <ScrollView style={styles.modalScroll}>
        {LOCATION_OPTIONS.map((locationOption, index) => (
         <TouchableOpacity
          key={locationOption}
          style={[
           styles.modalOptionButton,
           index === LOCATION_OPTIONS.length - 1 && styles.modalOptionButtonLast
          ]}
          onPress={() => handleLocationSelect(locationOption)}
         >
          <Text style={styles.modalOptionText}>{locationOption}</Text>
         </TouchableOpacity>
        ))}
       </ScrollView>
     </View>
    </Pressable>
   </Modal>

  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 safeArea: { flex: 1, backgroundColor: BG_COLOR },
 scrollContent: { paddingBottom: 100 },
 header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: BORDER_DARK,
 },
 headerButton: { padding: 5 },
 headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_PRIMARY },
 section: { paddingHorizontal: 20, marginTop: 20 },
 sectionLabel: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 5 },
 dropdown: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: 5,
 },
 dropdownText: { fontSize: 20, fontWeight: 'bold', color: TEXT_PRIMARY },
 filterContainer: { marginTop: 20 },
 filterScroll: { paddingHorizontal: 20, paddingVertical: 5 },
 filterChip: {
  backgroundColor: FILTER_BG,
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginRight: 10,
 },
 filterChipActive: { backgroundColor: ACCENT_COLOR },
 filterText: { color: TEXT_SECONDARY, fontWeight: '500' },
 filterTextActive: { color: TEXT_PRIMARY },

 monthSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
 monthText: { fontSize: 16, fontWeight: 'bold', color: TEXT_PRIMARY, marginRight: 5 },
 calendarDaysScroll: { paddingBottom: 5 },
 calendarDays: { flexDirection: 'row'},
 dateChip: {
    backgroundColor: FILTER_BG,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    minWidth: 50,
    marginRight: 10,
 },
 dateChipActive: { backgroundColor: ACCENT_COLOR },
 dateDayText: { color: TEXT_SECONDARY, fontSize: 12, marginBottom: 4},
 dateNumText: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: 'bold' },
 dateTextActive: { color: TEXT_PRIMARY },

 resultsContainer: { paddingHorizontal: 20, marginTop: 30 },
 resultsText: { fontSize: 16, fontWeight: 'bold', color: TEXT_PRIMARY, marginBottom: 15 },
 card: {
  backgroundColor: CARD_COLOR,
  borderRadius: 20,
  marginBottom: 15,
  flexDirection: 'row',
  overflow: 'hidden',
 },
 airlineStripe: {
  backgroundColor: ACCENT_COLOR,
  paddingVertical: 15,
  paddingHorizontal: 10,
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 60,
 },
 airlineText: {
  color: TEXT_PRIMARY,
  fontWeight: 'bold',
  fontSize: 12,
  transform: [{ rotate: '-90deg' }],
  width: 60,
  textAlign: 'center',
 },
 airlineIconCircle: {
  backgroundColor: ACCENT_BLUE,
  width: 30,
  height: 30,
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
 },
 cardContent: { flex: 1, padding: 15 },
 routeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
 location: { alignItems: 'flex-start' },
 alignEnd: { alignItems: 'flex-end' },
 locationCode: { fontSize: 24, fontWeight: 'bold', color: TEXT_PRIMARY },
 locationCity: { fontSize: 12, color: TEXT_SECONDARY },
 planeIcon: { marginHorizontal: 10, marginTop: 5 },
 timeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
 dateTime: { alignItems: 'flex-start'},
 timeText: { fontSize: 14, fontWeight: 'bold', color: TEXT_PRIMARY },
 dateText: { fontSize: 12, color: TEXT_SECONDARY },
 priceText: { fontSize: 18, fontWeight: 'bold', color: TEXT_PRIMARY, marginTop: 5, alignSelf: 'flex-end'},

 modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
 },
 modalContent: {
    backgroundColor: CARD_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderRadius: 15,
    width: '80%',
    maxHeight: '60%',
    alignItems: 'center',
 },
 modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DARK,
    width: '100%',
    textAlign: 'center',
 },
 modalScroll: {
    width: '100%',
 },
 modalOptionButton: {
    paddingVertical: 15,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_DARK,
   paddingHorizontal: 20,
 },
 modalOptionButtonLast: {
    borderBottomWidth: 0,
 },
 modalOptionText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    textAlign: 'center',
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

export default TicketScreen;