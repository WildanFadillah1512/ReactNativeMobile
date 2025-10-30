// File: src/screens/DetailScreen.tsx (FIXED - Fetches by ID)

import React, { useMemo, useState, useEffect } from 'react'; // <-- Pastikan useEffect diimport
import {
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView,
    Image, Alert, ActivityIndicator, Modal, Pressable, Platform, TextInput, // <-- Tambahkan TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// --- PERBAIKAN 1: Import useRoute ---
import { useRoute, type RouteProp } from '@react-navigation/native';
// --- AKHIR PERBAIKAN 1 ---

import { RootStackParamList } from '../../App';
import { useReviews } from '../context/ReviewContext'; // <-- Import useReviews
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext'; // addToCart menerima ApiProduct
// --- PERBAIKAN 2: Import tipe API & formatCurrency ---
import { formatCurrency } from '../utils/riceParse'; // Hanya butuh formatCurrency
import type { CheckoutRentalItem, ApiProduct } from '../types'; // Impor tipe API
// --- AKHIR PERBAIKAN 2 ---

// Sesuaikan URL API
const API_URL = 'http://10.95.21.143:3000';

// Warna & konstanta (Sudah Benar)
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
};

// Tipe Prop Navigasi (Sudah Benar)
type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
// --- PERBAIKAN 3: Tipe RouteProp ---
type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;
// --- AKHIR PERBAIKAN 3 ---


// Komponen Helper (buildImageUri, StarRating, InteractiveStarRating, Stepper)
const buildImageUri = (filename?: string | null) => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
    return `${API_URL}/images/${filename}`;
};

// Star rating (display-only)
const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.starRatingContainer}>
    {Array.from({ length: 5 }).map((_, index) => (
      <Icon
        key={index}
        name="star"
        size={14}
        color={index < Math.round(rating) ? COLORS.starActive : COLORS.starInactive}
        style={styles.starIcon}
      />
    ))}
  </View>
);

// Interactive star rating for adding review
const InteractiveStarRating: React.FC<{ rating: number; onRatingChange: (r: number) => void; size?: number }> = ({
  rating,
  onRatingChange,
  size = 28,
}) => (
  <View style={styles.interactiveStarsContainer}>
    {Array.from({ length: 5 }).map((_, i) => (
      <TouchableOpacity key={i} onPress={() => onRatingChange(i + 1)} activeOpacity={0.7}>
        <Icon name="star" size={size} color={i < rating ? COLORS.starActive : COLORS.starInactive} style={styles.interactiveStar} />
      </TouchableOpacity>
    ))}
  </View>
);

// Stepper
const Stepper: React.FC<{ value: number; onIncrement: () => void; onDecrement: () => void; min: number; max: number }> = ({
  value,
  onIncrement,
  onDecrement,
  min,
  max,
}) => (
  <View style={styles.stepperContainer}>
    <TouchableOpacity style={[styles.stepperButton, value === min && styles.stepperButtonDisabled]} onPress={onDecrement} disabled={value === min}>
      <Text style={[styles.stepperText, value === min && styles.stepperTextDisabled]}>-</Text>
    </TouchableOpacity>
    <Text style={styles.stepperValue}>{value}</Text>
    <TouchableOpacity style={[styles.stepperButton, value === max && styles.stepperButtonDisabled]} onPress={onIncrement} disabled={value === max}>
      <Text style={[styles.stepperText, value === max && styles.stepperTextDisabled]}>+</Text>
    </TouchableOpacity>
  </View>
);


export default function DetailScreen({ navigation }: DetailScreenProps) { // Hapus 'route' dari props
    // --- PERBAIKAN 4: Ambil 'productId' dari route ---
    const route = useRoute<DetailRouteProp>(); // Gunakan hook useRoute
    const { productId } = route.params; // Ambil productId
    // HAPUS: const { item } = route.params;
    // --- AKHIR PERBAIKAN 4 ---

    // --- PERBAIKAN 5: State untuk data produk & loading ---
    const [product, setProduct] = useState<ApiProduct | null>(null); // State untuk ApiProduct
    const [isLoading, setIsLoading] = useState(true); // State loading fetch
    const [error, setError] = useState<string | null>(null); // State error fetch
    // --- AKHIR PERBAIKAN 5 ---

    // Hooks Context
    const { likedIds, toggleLike } = useLikes();
    const { addToCart } = useCart();
    const { getReviewsForItem, addReviewForItem, loading: reviewsLoading } = useReviews(); // Ambil fungsi review

    // --- PERBAIKAN 6: useEffect untuk Fetch Data Produk ---
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) {
                setError('ID Produk tidak valid.');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/api/products/${productId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Produk tidak ditemukan.');
                    }
                    const errorText = await response.text();
                    throw new Error(`Gagal mengambil data produk (${response.status}): ${errorText}`);
                }

                const data: ApiProduct = await response.json();
                setProduct(data); // Simpan data produk ke state

            } catch (err) {
                console.error("DetailScreen fetch error:", err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.');
            } finally {
                setIsLoading(false); // Selesai loading
            }
        };

        fetchProductDetails();
    }, [productId]); // Fetch ulang jika productId berubah
    // --- AKHIR PERBAIKAN 6 ---


    // --- Logika Memoized (Bergantung pada 'product' dari state) ---
    const allItemReviews = useMemo(() => {
        return product ? getReviewsForItem(product.id) : [];
    }, [product, getReviewsForItem]);

    const displayedReviews = useMemo(() => allItemReviews.slice(0, 2), [allItemReviews]);

    const isLiked = useMemo(() => {
        return product ? likedIds.includes(product.id) : false;
    }, [product, likedIds]);

    // --- PERBAIKAN 7: Kalkulasi Harga (Gunakan price number langsung) ---
    const pricePerDay = product ? product.price : 0; // <-- Langsung ambil angka
    // --- AKHIR PERBAIKAN 7 ---

    // State UI (Modal, Rating, Komentar)
    const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
    const MIN_DURATION = 1;
    const MAX_DURATION = 30;
    const [selectedDuration, setSelectedDuration] = useState<number>(MIN_DURATION);
    const calculatedTotalPrice = useMemo(() => pricePerDay * selectedDuration, [pricePerDay, selectedDuration]);

    // State untuk review baru
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    // State Loading Gambar
    const [headerImageLoading, setHeaderImageLoading] = useState(true);
    const [, setModalImageLoading] = useState(true);
    const [, setSellerAvatarLoading] = useState(true);

    // URI Gambar (Menggunakan product dari state)
    const productImageUri = useMemo(() => product ? buildImageUri(product.imageUrl) : null, [product]);
    const sellerAvatarUri = useMemo(() => product ? buildImageUri(product.seller?.avatar) : null, [product]);

    // --- Handlers (Perlu Guard Check !product) ---
    const handleToggleLike = async () => {
        if (!product) return; // <-- Tambahkan Guard Check
        try {
            await toggleLike(product.id);
        } catch (err) {
            console.error('Like toggle error:', err);
            Alert.alert('Gagal', 'Tidak dapat memperbarui status suka.');
        }
    };

    // --- PERBAIKAN 8: handleAddToCart - Kirim ApiProduct ---
    const handleAddToCart = async () => {
        if (!product) return; // <-- Tambahkan Guard Check
        try {
            // Kirim objek 'product' (ApiProduct) langsung ke context
            const added = await addToCart(product); // <-- FIX: Kirim product
            if (added) {
                Alert.alert('Ditambahkan', `${product.name} berhasil ditambahkan ke keranjang.`);
            } else {
                Alert.alert('Sudah di Keranjang', `${product.name} sudah ada. Lihat keranjang?`, [
                    { text: 'Tidak', style: 'cancel' },
                    { text: 'Ya, Lihat', onPress: () => navigation.navigate('Cart') },
                ]);
            }
        } catch (err) {
            console.error('Add to cart error:', err);
            Alert.alert('Gagal', 'Gagal menambahkan item ke keranjang.');
        }
    };
    // --- AKHIR PERBAIKAN 8 ---

    // --- Handler Submit Review (Perlu Guard Check !product) ---
    const handleSubmitReview = async () => {
        if (!product) return; // <-- Tambahkan Guard Check

        if (newRating === 0) {
            Alert.alert('Rating Belum Dipilih', 'Silakan pilih rating bintang terlebih dahulu.');
            return;
        }
        if (newComment.trim().length < 5) {
            Alert.alert('Komentar Pendek', 'Komentar minimal 5 karakter.');
            return;
        }
        try {
            await addReviewForItem(product.id, newRating, newComment.trim()); // Gunakan product.id
            setNewRating(0);
            setNewComment('');
            Alert.alert('Ulasan Terkirim', 'Terima kasih atas ulasan Anda!');
        } catch (err) {
            console.error('Submit review error:', err);
            Alert.alert('Gagal Mengirim', 'Terjadi kesalahan saat menyimpan ulasan.');
        }
    };

    // Handlers Modal & Checkout (Perlu Guard Check !product)
    const openDurationModal = () => {
        setSelectedDuration(MIN_DURATION);
        setIsDurationModalVisible(true);
    };
    const closeDurationModal = () => setIsDurationModalVisible(false);
    const incrementDuration = () => setSelectedDuration((p) => Math.min(p + 1, MAX_DURATION));
    const decrementDuration = () => setSelectedDuration((p) => Math.max(p - 1, MIN_DURATION));

    // --- PERBAIKAN 9: confirmDurationAndCheckout - Konversi ke CheckoutRentalItem ---
    const confirmDurationAndCheckout = () => {
        if (!product) return; // <-- Tambahkan Guard Check
        if (selectedDuration < MIN_DURATION) {
            Alert.alert('Durasi Tidak Valid', `Pilih durasi minimal ${MIN_DURATION} hari.`);
            return;
        }
        closeDurationModal();

        // Lakukan konversi dari ApiProduct -> CheckoutRentalItem
        const itemToCheckout: CheckoutRentalItem = {
            ...product,
            price: formatCurrency(product.price), // Format harga ke string
            image: productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png'),
            duration: selectedDuration,
            // Fallbacks untuk properti non-wajib
            category: product.category ?? 'Lainnya',
            location: product.location ?? 'Lokasi tidak diketahui',
            period: product.period ?? '',
            rating: product.rating ?? 0,
            reviews: product.reviews ?? 0,
            seller: {
                ...product.seller,
                id: product.seller?.id ?? 'unknown_seller_id',
                name: product.seller?.name ?? 'Penjual',
                avatar: product.seller?.avatar ?? '',
                bio: product.seller?.bio ?? '',
                rating: product.seller?.rating ?? 0,
                itemsRented: product.seller?.itemsRented ?? 0,
            }
        };
        // --- AKHIR PERBAIKAN 9 ---

        navigation.navigate('Checkout', { items: [itemToCheckout] });
    };

    // --- RENDER Loading / Error / Not Found ---
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerAlign]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Memuat detail produk...</Text>
            </SafeAreaView>
        );
    }
    if (error) {
        return (
            <SafeAreaView style={[styles.container, styles.centerAlign]}>
                <Icon name="exclamation-triangle" size={40} color={COLORS.danger}/>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    // Kondisi jika produk tidak ditemukan (fetch selesai tapi data null)
    if (!product) {
        return (
            <SafeAreaView style={[styles.container, styles.centerAlign]}>
                 <Icon name="question-circle" size={40} color={COLORS.textMuted}/>
                 <Text style={styles.errorText}>Produk tidak ditemukan.</Text>
                 <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>Kembali</Text>
                 </TouchableOpacity>
            </SafeAreaView>
        );
    }
    // --- AKHIR RENDER Loading / Error / Not Found ---


    // --- RENDER UTAMA (Jika product berhasil dimuat) ---
    // Sekarang aman untuk menggunakan 'product'
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Header image */}
                <ImageBackground
                    source={productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png')}
                    style={styles.imageHeader}
                    onLoadStart={() => setHeaderImageLoading(true)}
                    onLoadEnd={() => setHeaderImageLoading(false)}
                    onError={(e) => {
                        console.warn('Header image load error:', e.nativeEvent?.error);
                        setHeaderImageLoading(false);
                    }}
                >
                    {headerImageLoading && (
                        <View style={styles.imageLoadingOverlay}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                    )}
                    <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
                        <View style={styles.headerNav}>
                            <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
                                <Icon name="arrow-left" size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navButton} onPress={handleToggleLike}>
                                <Icon name={isLiked ? 'heart' : 'heart-o'} size={20} color={isLiked ? COLORS.danger : 'white'} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </ImageBackground>

                {/* Content (Menggunakan 'product' dari state) */}
                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
                        <View style={styles.ratingBox}>
                            <Icon name="star" size={14} color={COLORS.starActive} />
                            <Text style={styles.ratingText}>{Number(product.rating ?? 0).toFixed(1)}</Text>
                            <Text style={styles.reviewCountText}>({product.reviews ?? 0})</Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <Icon name="map-marker" size={16} color={COLORS.textMuted} />
                        <Text style={styles.locationText}>{product.location ?? 'Lokasi tidak diketahui'}</Text>
                    </View>

                    <View style={styles.inlinePriceInfo}>
                        <Text style={styles.priceLabelInline}>Harga Sewa:</Text>
                        <View style={styles.priceDisplayRowInline}>
                            {/* FIX: Tampilkan harga terformat dari pricePerDay */ }
                            <Text style={styles.priceHighlightInline}>{formatCurrency(pricePerDay)}</Text>
                            <Text style={styles.pricePeriodInline}>{product.period ?? ''}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.description}>{product.description ?? 'Tidak ada deskripsi.'}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Penyewa</Text>
                    <View style={styles.ownerSection}>
                        <TouchableOpacity
                            style={styles.ownerInfoContainer}
                            // Pastikan SellerProfile menerima ApiSeller
                            onPress={() => navigation.navigate('SellerProfile', { seller: product.seller })}>
                            <Image
                                source={sellerAvatarUri ? { uri: sellerAvatarUri } : require('../assets/images/avatar-placeholder.png')}
                                style={styles.avatarImage}
                                onLoadStart={() => setSellerAvatarLoading(true)}
                                onLoadEnd={() => setSellerAvatarLoading(false)}
                                onError={(e) => {
                                    console.warn('Seller avatar error:', e.nativeEvent?.error);
                                    setSellerAvatarLoading(false);
                                }}
                            />
                            <View>
                                <Text style={styles.ownerName}>{product.seller?.name ?? 'Penjual'}</Text>
                                <Text style={styles.ownerStatus}>Pemilik Terverifikasi</Text>
                             </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() =>
                                navigation.navigate('Chat', {
                                    sellerId: product.seller?.id,
                                    sellerName: product.seller?.name,
                                    sellerAvatar: sellerAvatarUri ?? undefined, // Kirim URI
                                    itemId: product.id,
                                })
                            }>
                            <Icon name="comment" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.reviewSectionHeader}>
                        <Text style={styles.sectionTitle}>Ulasan Pengguna ({allItemReviews.length})</Text>
                        {allItemReviews.length > 2 && (
                            <TouchableOpacity onPress={() => navigation.navigate('AllReviews', { itemId: product.id, productName: product.name })}>
                                <Text style={styles.linkText}>Lihat semua</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {reviewsLoading ? (
                        <ActivityIndicator color={COLORS.primary} style={styles.loadingIndicator} />
                    ) : allItemReviews.length > 0 ? (
                        displayedReviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Image
                                        source={buildImageUri(review.avatar) ? { uri: buildImageUri(review.avatar) } : require('../assets/images/avatar-placeholder.png')}
                                        style={styles.reviewAvatar}
                                    />
                                    <View style={styles.reviewUserInfo}>
                                        <Text style={styles.reviewUserName}>{review.name}</Text>
                                        <StarRating rating={review.rating} />
                                  </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))
                    ) : (
                    <Text style={styles.noReviewsText}>Belum ada ulasan untuk produk ini.</Text>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Tambahkan Ulasan Anda</Text>
                    <View style={styles.addReviewContainer}>
                        <Text style={styles.addReviewLabel}>Rating Anda:</Text>
                        <InteractiveStarRating rating={newRating} onRatingChange={setNewRating} size={32} />

                        <Text style={[styles.addReviewLabel, styles.commentLabelMargin]}>Komentar Anda:</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Bagikan pengalaman Anda..."
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            value={newComment}
                            onChangeText={setNewComment}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
                            <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
              </ScrollView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
                <View style={styles.footer}>
                    <View style={styles.actionButtonsContainerFull}>
                        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
                            <Icon name="shopping-cart" size={20} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.rentButtonFull} onPress={openDurationModal}>
                            <Text style={styles.rentButtonText}>Sewa Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Duration Modal */}
            <Modal animationType="slide" transparent visible={isDurationModalVisible} onRequestClose={closeDurationModal}>
                <Pressable style={styles.modalOverlay} onPress={closeDurationModal}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalCloseHeader}>
                            <TouchableOpacity onPress={closeDurationModal} style={styles.closeButtonIcon}>
                                <Icon name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.productInfoRow}>
                            <Image
                                source={productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png')}
                                style={styles.modalProductImage}
                                onLoadStart={() => setModalImageLoading(true)}
                                onLoadEnd={() => setModalImageLoading(false)}
                                onError={(e) => {
                                    console.warn('Modal image error:', e.nativeEvent?.error);
                                    setModalImageLoading(false);
                                }}
                            />
                            <View style={styles.modalPriceStockContainer}>
                                <View style={styles.modalPriceRow}>
                                    {/* FIX: Tampilkan harga terformat */ }
                                    <Text style={styles.modalPriceValueCurrent}>{formatCurrency(pricePerDay)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.dividerModal} />

                        <View style={styles.durationInputContainer}>
                             <Text style={styles.durationInputLabel}>
                                Durasi Sewa {product.period ? `(${String(product.period).trim()})` : ''}
                            </Text>
                            <Stepper value={selectedDuration} onIncrement={incrementDuration} onDecrement={decrementDuration} min={MIN_DURATION} max={MAX_DURATION} />
                        </View>

                        <View style={styles.dividerModal} />

                        <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmDurationAndCheckout}>
                            <Text style={styles.modalConfirmButtonText}>Sewa Sekarang ({formatCurrency(calculatedTotalPrice)})</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollViewContent: { paddingBottom: 0 },
  imageHeader: { width: '100%', height: 300, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: COLORS.card },
  imageLoadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  safeAreaHeader: { width: '100%' },
  headerNav: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  navButton: { backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  content: { paddingHorizontal: 16, paddingVertical: 24, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -30, minHeight: 500 },
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 15 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, height: 35 },
  ratingText: { color: COLORS.textPrimary, fontSize: 15, marginLeft: 4, fontWeight: 'bold' },
  reviewCountText: { color: COLORS.textMuted, fontSize: 13, marginLeft: 4 },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 20 },
  locationText: { color: COLORS.textMuted, fontSize: 14, marginLeft: 8 },

  inlinePriceInfo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-start', marginBottom: 10 },
  priceLabelInline: { color: COLORS.textSecondary, fontSize: 16, marginRight: 10, fontWeight: '600' },
  priceDisplayRowInline: { flexDirection: 'row', alignItems: 'baseline' },
  priceHighlightInline: { color: COLORS.primary, fontWeight: 'bold', fontSize: 26, marginRight: 6 },
  pricePeriodInline: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500', alignSelf: 'flex-end' },

  divider: { height: 1, backgroundColor: COLORS.card, marginVertical: 20 },

  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  description: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 24 },

  ownerSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  ownerInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  avatarImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: COLORS.border },
  ownerName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  ownerStatus: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  chatButton: { backgroundColor: COLORS.primary, width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  reviewSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  reviewCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewUserInfo: { flex: 1 },
  reviewUserName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  starRatingContainer: { flexDirection: 'row', marginTop: 4 },
  starIcon: { marginRight: 2 },
  reviewComment: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 8 },
  noReviewsText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 10, marginBottom: 20, fontStyle: 'italic' },
  loadingIndicator: { marginVertical: 20 },

  addReviewContainer: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 30 },
  addReviewLabel: { color: COLORS.textPrimary, fontSize: 15, marginBottom: 8, fontWeight: '600' },
  commentLabelMargin: { marginTop: 15 },
  interactiveStarsContainer: { flexDirection: 'row', marginBottom: 15 },
  interactiveStar: { marginRight: 12 },
  commentInput: { backgroundColor: COLORS.border, color: COLORS.textPrimary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 100, marginBottom: 16, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border },

  submitButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: Platform.OS === 'android' ? 3 : 0 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  footerContainer: { backgroundColor: COLORS.background, borderTopWidth: 1, borderColor: COLORS.card },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, height: 75 },
  actionButtonsContainerFull: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  cartButton: { backgroundColor: COLORS.card, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 2, borderColor: COLORS.primary },
  rentButtonFull: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', flex: 1, height: 50, elevation: Platform.OS === 'android' ? 5 : 0 },
  rentButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  modalCloseHeader: { width: '100%', alignItems: 'flex-end', paddingBottom: 10 },
  closeButtonIcon: { padding: 5 },
  productInfoRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  modalProductImage: { width: 80, height: 80, borderRadius: 5, marginRight: 15, backgroundColor: COLORS.border },
  modalPriceStockContainer: { justifyContent: 'flex-start', flex: 1, paddingTop: 5 },
  modalPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 5 },
  modalPriceValueCurrent: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold', marginRight: 10 },
  dividerModal: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },

  durationInputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, paddingHorizontal: 5 },
  durationInputLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'normal' },

  stepperContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 5 },
  stepperButton: { width: 35, height: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  stepperButtonDisabled: { backgroundColor: COLORS.border },
  stepperText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' },
  stepperTextDisabled: { color: COLORS.textMuted },
  stepperValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', paddingHorizontal: 15, minWidth: 50, textAlign: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border, height: 35, lineHeight: 35 },

  modalConfirmButton: { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  modalConfirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  centerAlign: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background, marginBottom: 15 },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontSize: 16 },
  errorText: { color: COLORS.danger, textAlign: 'center', fontSize: 16 },
});
