// File: DetailScreen.tsx

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- IMPORTS NYATA ---
import { RootStackParamList } from '../../App'; // Import dari App.tsx yang sudah diupdate
import { useReviews } from '../context/ReviewContext';
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext';
// Pastikan nama file utilitas harga benar (priceParser atau riceParse)
import { parsePrice, formatCurrency } from '../utils/riceParse';
// Import tipe data asli dari file types.ts
import type {  CheckoutRentalItem } from '../types';
// --- AKHIR IMPORTS NYATA ---


// Warna Kunci
const COLORS = {
    background: '#0f172a',
    card: '#1e293b',
    textPrimary: 'white',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    primary: '#06b6d4',
    starActive: '#facc15',
    starInactive: '#475569',
    danger: '#ef4444',
    border: '#334155',
    ctaRed: '#d0021b', // Warna untuk tombol konfirmasi modal (misalnya merah)
};

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

// Komponen StarRating
const StarRating = ({ rating }: { rating: number }) => (
     <View style={styles.starRatingContainer}>
     {Array.from({ length: 5 }).map((_, index) => (
         <Icon
         key={index}
         name="star"
         size={14}
         style={styles.starIcon}
         color={index < Math.round(rating) ? COLORS.starActive : COLORS.starInactive}
         />
     ))}
     </View>
);

// Komponen InteractiveStarRating
interface InteractiveStarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: number;
}
const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({
    rating,
    onRatingChange,
    size = 28,
}) => {
    return (
        <View style={styles.interactiveStarsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity key={index} onPress={() => onRatingChange(index + 1)}>
                    <Icon
                        name="star"
                        size={size}
                        style={styles.interactiveStar}
                        color={index < rating ? COLORS.starActive : COLORS.starInactive}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

// Komponen Stepper
interface StepperProps {
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    min: number;
    max: number;
}
const Stepper: React.FC<StepperProps> = ({ value, onIncrement, onDecrement, min, max }) => (
    <View style={styles.stepperContainer}>
        <TouchableOpacity
            style={[styles.stepperButton, value === min && styles.stepperButtonDisabled]}
            onPress={onDecrement}
            disabled={value === min}
        >
            <Text style={[styles.stepperText, value === min && styles.stepperTextDisabled]}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
            style={[styles.stepperButton, value === max && styles.stepperButtonDisabled]}
            onPress={onIncrement}
            disabled={value === max}
        >
            <Text style={[styles.stepperText, value === max && styles.stepperTextDisabled]}>+</Text>
        </TouchableOpacity>
    </View>
);


export default function DetailScreen({ route, navigation }: DetailScreenProps) {
    const { item } = route.params; // item di sini adalah RentalItem

    // Context Hooks
    const { likedIds, toggleLike } = useLikes();
    const isLiked = likedIds.includes(item.id);
    const { addToCart } = useCart();
    const { getReviewsForItem, addReviewForItem, loading: reviewsLoading } = useReviews();

    // Review Data
    const allItemReviews = useMemo(() => getReviewsForItem(item.id), [item.id, getReviewsForItem]);
    const displayedReviews = useMemo(() => allItemReviews.slice(0, 2), [allItemReviews]);

    // Review Form State
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    // Modal State & Duration
    const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const MIN_DURATION = 1;
    const MAX_DURATION = 30; // Sesuaikan batas maksimal jika perlu

    // Price Calculation
    const pricePerDay = useMemo(() => parsePrice(item.price), [item.price]);
    const calculatedTotalPrice = useMemo(() => pricePerDay * selectedDuration, [pricePerDay, selectedDuration]);

    // --- Fungsi Stepper ---
    const incrementDuration = () => { if (selectedDuration < MAX_DURATION) setSelectedDuration(prev => prev + 1); };
    const decrementDuration = () => { if (selectedDuration > MIN_DURATION) setSelectedDuration(prev => prev - 1); };

    // Fungsi Submit Ulasan
    const handleSubmitReview = async () => {
         if (newRating === 0) { Alert.alert('Rating Belum Dipilih', 'Silakan pilih rating bintang terlebih dahulu.'); return; }
         if (newComment.trim().length < 5 ) { Alert.alert('Komentar Kosong', 'Komentar minimal 5 karakter.'); return; }
         try {
             await addReviewForItem(item.id, newRating, newComment.trim());
             setNewRating(0); setNewComment('');
             Alert.alert('Ulasan Terkirim', 'Terima kasih atas ulasan Anda!');
         } catch (error) {
             Alert.alert('Gagal Mengirim', 'Terjadi kesalahan saat menyimpan ulasan.');
             console.error("Submit review error:", error);
         }
     };

    // Fungsi Toggle Like
    const handleToggleLike = async () => {
         try {
             await toggleLike(item.id);
         } catch (error) {
             console.error("Gagal memperbarui status suka:", error);
             Alert.alert("Gagal", "Gagal memperbarui status suka.");
         }
     };

    // Fungsi Add To Cart
    const handleAddToCart = async () => {
         try {
             const added = await addToCart(item);
             if (added) {
                 Alert.alert("Ditambahkan", `${item.name} berhasil ditambahkan ke keranjang.`);
             } else {
                 Alert.alert(
                     "Sudah di Keranjang",
                     `${item.name} sudah ada di keranjang Anda. Apakah Anda ingin melihat keranjang?`,
                     [ { text: "Tidak", style: "cancel" }, { text: "Ya, Lihat", onPress: () => navigation.navigate('Cart') } ]
                 );
             }
         } catch (error) {
             console.error("Gagal menambahkan item ke keranjang:", error);
             Alert.alert("Gagal", "Gagal menambahkan item ke keranjang.");
         }
     };

    // --- Fungsi Modal ---
    const openDurationModal = () => { setSelectedDuration(MIN_DURATION); setIsDurationModalVisible(true); };
    const closeDurationModal = () => setIsDurationModalVisible(false);

    // Fungsi Konfirmasi Checkout (Mengirim array CheckoutRentalItem)
    const confirmDurationAndCheckout = () => {
        if (selectedDuration < MIN_DURATION) { Alert.alert("Durasi Tidak Valid", `Pilih durasi minimal ${MIN_DURATION} hari.`); return; }
        closeDurationModal();

        // Buat objek CheckoutRentalItem tunggal
        const itemToCheckout: CheckoutRentalItem = {
            ...item,
            duration: selectedDuration
        };

        // Kirim sebagai array berisi satu item
        navigation.navigate('Checkout', {
            items: [itemToCheckout] // Menggunakan 'items' (plural) sesuai RootStackParamList
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Header dengan Gambar Latar Belakang */}
                <ImageBackground source={{ uri: item.image }} style={styles.imageHeader}>
                   <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
                       <View style={styles.headerNav}>
                           <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()} >
                               <Icon name="arrow-left" size={20} color="white" />
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.navButton} onPress={handleToggleLike}>
                               <Icon name={isLiked ? "heart" : "heart-o"} size={20} color={isLiked ? COLORS.danger : 'white'} />
                           </TouchableOpacity>
                       </View>
                   </SafeAreaView>
                </ImageBackground>

                {/* Konten Detail */}
                <View style={styles.content}>
                     <View style={styles.titleSection}>
                        <Text style={styles.title}>{item.name}</Text>
                        <View style={styles.ratingBox}>
                            <Icon name="star" size={14} color={COLORS.starActive} />
                            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                            <Text style={styles.reviewCountText}>({item.reviews})</Text>
                        </View>
                     </View>
                     <View style={styles.locationRow}>
                          <Icon name="map-marker" size={16} color={COLORS.textMuted} />
                          <Text style={styles.locationText}>{item.location}</Text>
                     </View>
                     <View style={styles.inlinePriceInfo}>
                          <Text style={styles.priceLabelInline}>Harga Sewa:</Text>
                          <View style={styles.priceDisplayRowInline}>
                              <Text style={styles.priceHighlightInline}>{item.price}</Text>
                              <Text style={styles.pricePeriodInline}>{item.period}</Text>
                          </View>
                     </View>
                     <View style={styles.divider} />
                     <Text style={styles.sectionTitle}>Deskripsi</Text>
                     <Text style={styles.description}>{item.description}</Text>
                     <View style={styles.divider} />
                     <Text style={styles.sectionTitle}>Penyewa</Text>
                     <View style={styles.ownerSection}>
                          <TouchableOpacity style={styles.ownerInfoContainer} onPress={() => navigation.navigate('SellerProfile', { seller: item.seller })} >
                              <Image source={{ uri: item.seller.avatar }} style={styles.avatarImage} />
                              <View>
                                  <Text style={styles.ownerName}>{item.seller.name}</Text>
                                  <Text style={styles.ownerStatus}>Pemilik Terverifikasi</Text>
                              </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.chatButton}
                              onPress={() => navigation.navigate('Chat', {
                                  sellerId: item.seller.id, sellerName: item.seller.name,
                                  sellerAvatar: item.seller.avatar, itemId: item.id
                              })} >
                              <Icon name="comment" size={20} color="white" />
                          </TouchableOpacity>
                     </View>
                     <View style={styles.divider} />
                     <View style={styles.reviewSectionHeader}>
                          <Text style={styles.sectionTitle}>Ulasan Pengguna ({allItemReviews.length})</Text>
                          {allItemReviews.length > 2 && ( <TouchableOpacity onPress={() => navigation.navigate('AllReviews', { itemId: item.id, productName: item.name })} ><Text style={styles.linkText}>Lihat semua</Text></TouchableOpacity> )}
                     </View>
                     {reviewsLoading ? ( <ActivityIndicator color={COLORS.primary} style={styles.loadingIndicator}/> )
                     : allItemReviews.length > 0 ? ( displayedReviews.map((review) => ( // Use review directly
                         <View key={review.id} style={styles.reviewCard}>
                             <View style={styles.reviewHeader}>
                                 <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                                 <View style={styles.reviewUserInfo}>
                                     <Text style={styles.reviewUserName}>{review.name}</Text>
                                     <StarRating rating={review.rating} />
                                 </View>
                             </View>
                             <Text style={styles.reviewComment}>{review.comment}</Text>
                         </View>
                      )) )
                     : ( <Text style={styles.noReviewsText}>Belum ada ulasan untuk produk ini.</Text> )}
                     <View style={styles.divider} />
                     <Text style={styles.sectionTitle}>Tambahkan Ulasan Anda</Text>
                     <View style={styles.addReviewContainer}>
                         <Text style={styles.addReviewLabel}>Rating Anda:</Text>
                         <InteractiveStarRating rating={newRating} onRatingChange={setNewRating} size={32} />
                         <Text style={[styles.addReviewLabel, styles.commentLabelMargin]}>Komentar Anda:</Text>
                         <TextInput style={styles.commentInput} placeholder="Bagikan pengalaman Anda..." placeholderTextColor={COLORS.textMuted} multiline value={newComment} onChangeText={setNewComment} textAlignVertical="top"/>
                         <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}><Text style={styles.submitButtonText}>Kirim Ulasan</Text></TouchableOpacity>
                     </View>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
                <View style={styles.footer}>
                    <View style={styles.actionButtonsContainerFull}>
                        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
                            <Icon name="shopping-cart" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rentButtonFull} onPress={openDurationModal} >
                            <Text style={styles.rentButtonText}>Sewa Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

             {/* Duration Selection Modal */}
             <Modal
                 animationType="slide" transparent={true} visible={isDurationModalVisible} onRequestClose={closeDurationModal}
             >
                 <Pressable style={styles.modalOverlay} onPress={closeDurationModal}>
                     <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                          {/* Header Modal */}
                          <View style={styles.modalCloseHeader}>
                              <TouchableOpacity onPress={closeDurationModal} style={styles.closeButtonIcon}>
                                  <Icon name="close" size={24} color={COLORS.textPrimary} />
                              </TouchableOpacity>
                          </View>
                          {/* Info Produk */}
                          <View style={styles.productInfoRow}>
                              <Image source={{ uri: item.image }} style={styles.modalProductImage} />
                              <View style={styles.modalPriceStockContainer}>
                                  <View style={styles.modalPriceRow}>
                                      <Text style={styles.modalPriceValueCurrent}>{item.price}</Text>
                                  </View>
                                  {/* <Text style={styles.modalStockText}>Sisa: X item</Text> */}
                              </View>
                          </View>
                          <View style={styles.dividerModal} />
                          {/* Stepper Durasi */}
                          <View style={styles.durationInputContainer}>
                              <Text style={styles.durationInputLabel}>Durasi Sewa ({item.period.toLowerCase().substring(1).trim()})</Text>
                              <Stepper value={selectedDuration} onIncrement={incrementDuration} onDecrement={decrementDuration} min={MIN_DURATION} max={MAX_DURATION}/>
                          </View>
                          <View style={styles.dividerModal} />
                          {/* Tombol Konfirmasi Modal */}
                          <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmDurationAndCheckout}>
                              <Text style={styles.modalConfirmButtonText}>Sewa Sekarang ({formatCurrency(calculatedTotalPrice)})</Text>
                          </TouchableOpacity>
                     </Pressable>
                 </Pressable>
             </Modal>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollViewContent: { paddingBottom: 0 },
    imageHeader: { width: '100%', height: 300, justifyContent: 'flex-start', alignItems: 'center' },
    safeAreaHeader: { width: '100%', },
    headerNav: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 16, },
    navButton: { backgroundColor: 'rgba(0, 0, 0, 0.4)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', },
    content: { paddingHorizontal: 16, paddingVertical: 24, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -30, minHeight: 500 },
    titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 15, },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, height: 35, },
    ratingText: { color: COLORS.textPrimary, fontSize: 15, marginLeft: 4, fontWeight: 'bold' },
    reviewCountText: { color: COLORS.textMuted, fontSize: 13, marginLeft: 4, },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 20, },
    locationText: { color: COLORS.textMuted, fontSize: 14, marginLeft: 8, },
    divider: { height: 1, backgroundColor: COLORS.card, marginVertical: 20, },
    sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 16 },
    description: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 24, },
    inlinePriceInfo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-start', marginBottom: 10, },
    priceLabelInline: { color: COLORS.textSecondary, fontSize: 16, marginRight: 10, fontWeight: '600', },
    priceDisplayRowInline: { flexDirection: 'row', alignItems: 'baseline', },
    priceHighlightInline: { color: COLORS.primary, fontWeight: 'bold', fontSize: 26, marginRight: 6, },
    pricePeriodInline: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500', alignSelf: 'flex-end', },
    ownerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 16, padding: 16, },
    ownerInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, },
    avatarImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: COLORS.border, },
    ownerName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', },
    ownerStatus: { color: COLORS.textMuted, fontSize: 12, marginTop: 2, },
    chatButton: { backgroundColor: COLORS.primary, width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', },
    reviewSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
    linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
    reviewCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, },
    reviewUserInfo: { flex: 1, },
    reviewUserName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', },
    starRatingContainer: { flexDirection: 'row', marginTop: 4, },
    starIcon: { marginRight: 2, },
    reviewComment: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 8 },
    noReviewsText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 10, marginBottom: 20, fontStyle: 'italic', },
    loadingIndicator: { marginVertical: 20 },
    addReviewContainer: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 30 },
    addReviewLabel: { color: COLORS.textPrimary, fontSize: 15, marginBottom: 8, fontWeight: '600' },
    commentLabelMargin: { marginTop: 15 },
    interactiveStarsContainer: { flexDirection: 'row', marginBottom: 15 },
    interactiveStar: { marginRight: 12 },
    commentInput: { backgroundColor: COLORS.border, color: COLORS.textPrimary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 100, marginBottom: 16, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, },
    submitButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 3 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    footerContainer: { backgroundColor: COLORS.background, borderTopWidth: 1, borderColor: COLORS.card },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, height: 75, },
    actionButtonsContainerFull: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    cartButton: { backgroundColor: COLORS.card, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 2, borderColor: COLORS.primary, },
    rentButtonFull: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', flex: 1, height: 50, elevation: 5, },
    rentButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end', },
    modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: 15, shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5, },
    modalCloseHeader: { width: '100%', alignItems: 'flex-end', paddingBottom: 10, },
    closeButtonIcon: { padding: 5, },
    productInfoRow: { flexDirection: 'row', marginBottom: 10, },
    modalProductImage: { width: 80, height: 80, borderRadius: 5, marginRight: 15, },
    modalPriceStockContainer: { justifyContent: 'flex-start', flex: 1, paddingTop: 5, },
    modalPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 5, },
    modalPriceValueCurrent: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold', marginRight: 10, },
    dividerModal: { height: 1, backgroundColor: COLORS.border, marginVertical: 15, },
    durationInputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, paddingHorizontal: 5 },
    durationInputLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'normal', },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 5, },
    stepperButton: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, },
    stepperButtonDisabled: { backgroundColor: COLORS.border, },
    stepperText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', },
    stepperTextDisabled: { color: COLORS.textMuted, },
    stepperValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', paddingHorizontal: 15, minWidth: 50, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, height: 35, lineHeight: 35, },
    modalConfirmButton: { backgroundColor: COLORS.primary, // Ganti ke COLORS.primary jika ingin biru
                          paddingVertical: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    modalConfirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});