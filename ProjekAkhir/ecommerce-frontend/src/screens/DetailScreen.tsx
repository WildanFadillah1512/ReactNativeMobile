// --- IMPORTS ---
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView,
  Image, Alert, ActivityIndicator, Modal, Pressable,  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather'; // <-- Impor FeatherIcon
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types';
// HAPUS: import { useReviews } from '../context/ReviewContext'; // <-- HAPUS CONTEXT DUMMY
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/riceParse';
// HAPUS: import type { CheckoutRentalItem, ApiProduct, ApiSeller, Review } from '../types';
import type { CheckoutRentalItem, ApiProduct, ApiSeller } from '../types'; // <-- Hapus 'Review'
import { COLORS } from '../config/theme';
import apiClient, { BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const MIN_DURATION = 1;
const MAX_DURATION = 30;

// --- TYPES ---
type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

// --- 1. DEFINISIKAN TIPE ULASAN SESUAI API ---
type ApiReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
  };
};

// --- HELPER FUNCTIONS & COMPONENTS ---

// buildImageUri (Sudah Benar)
const buildImageUri = (filename?: string | null): string | null => {
  if (!filename) return null;
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  return `${BASE_URL}/images/${filename}`;
};

// mapApiProductToCheckoutItem (Disesuaikan untuk Rating Baru)
const mapApiProductToCheckoutItem = (
    product: ApiProduct,
    duration: number,
    productImageUri: string | null
): CheckoutRentalItem => {
  return {
      ...product,
      price: formatCurrency(product.price),
      image: productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png'),
      duration: duration,
      category: product.category ?? 'Lainnya',
      location: product.location ?? 'Lokasi tidak diketahui',
      period: product.period ?? '',
      // --- 2. SESUAIKAN DENGAN SKEMA BARU ---
      rating: product.ratingAvg ?? 0,   // <-- Ganti 'rating'
      reviews: product.reviewsCount ?? 0, // <-- Ganti 'reviews'
      // ---------------------------------
      seller: {
          ...product.seller,
          id: product.seller?.id ?? 0,
          name: product.seller?.name ?? 'Penjual',
          avatar: product.seller?.avatar ?? '',
          bio: product.seller?.bio ?? '',
          rating: product.seller?.rating ?? 0,
          itemsRented: product.seller?.itemsRented ?? 0,
      }
  };
};

// StarRating (Sudah Benar)
const StarRating: React.FC<{ rating: number }> = React.memo(({ rating }) => (
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
));

// InteractiveStarRating (Sudah Benar)
const InteractiveStarRating: React.FC<{ rating: number; onRatingChange: (r: number) => void; size?: number }> = React.memo(({
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
));

// Stepper (Sudah Benar)
const Stepper: React.FC<{ value: number; onIncrement: () => void; onDecrement: () => void; min: number; max: number }> = React.memo(({
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
));

// DetailHeader (Sudah Benar)
const DetailHeader: React.FC<{
    imageUri: string | null;
    isLiked: boolean;
    onBack: () => void;
    onLike: () => void;
}> = React.memo(({ imageUri, isLiked, onBack, onLike }) => {
    const [isLoading, setIsLoading] = useState(true);
    
    return (
        <ImageBackground
            source={imageUri ? { uri: imageUri } : require('../assets/images/placeholder.png')}
            style={styles.imageHeader}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(e) => {
                console.warn('Header image load error:', e.nativeEvent?.error);
                setIsLoading(false);
            }}
        >
            {isLoading && (
                <View style={styles.imageLoadingOverlay}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            )}
            <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
                <View style={styles.headerNav}>
                    <TouchableOpacity style={styles.navButton} onPress={onBack}>
                        <Icon name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton} onPress={onLike}>
                        <Icon name={isLiked ? 'heart' : 'heart-o'} size={20} color={isLiked ? COLORS.danger : 'white'} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
});

// ProductInfo (Disesuaikan untuk Rating Kumulatif)
const ProductInfo: React.FC<{ product: ApiProduct; pricePerDay: number }> = React.memo(({ product, pricePerDay }) => (
    <>
        <View style={styles.titleSection}>
            <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
            <View style={styles.ratingBox}>
                <Icon name="star" size={14} color={COLORS.starActive} />
                {/* --- 3. SESUAIKAN DENGAN SKEMA BARU --- */}
                <Text style={styles.ratingText}>{Number(product.ratingAvg ?? 0).toFixed(1)}</Text>
                <Text style={styles.reviewCountText}>({product.reviewsCount ?? 0})</Text>
                {/* --------------------------------- */}
            </View>
        </View>

        <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color={COLORS.textMuted} />
            <Text style={styles.locationText}>{product.location ?? 'Lokasi tidak diketahui'}</Text>
        </View>

        <View style={styles.inlinePriceInfo}>
            <Text style={styles.priceLabelInline}>Harga Sewa:</Text>
            <View style={styles.priceDisplayRowInline}>
                <Text style={styles.priceHighlightInline}>{formatCurrency(pricePerDay)}</Text>
                <Text style={styles.pricePeriodInline}>{product.period ?? ''}</Text>
            </View>
        </View>
    </>
));

// SellerInfo (Sudah Benar)
const SellerInfo: React.FC<{
    seller: ApiSeller | null;
    sellerAvatarUri: string | null;
    onChatPress: () => void;
    onProfilePress: () => void;
}> = React.memo(({ seller, sellerAvatarUri, onChatPress, onProfilePress }) => {
    const [,setIsLoading] = useState(true);
    
    return (
        <View style={styles.ownerSection}>
            <TouchableOpacity style={styles.ownerInfoContainer} onPress={onProfilePress}>
                <Image
                    source={sellerAvatarUri ? { uri: sellerAvatarUri } : require('../assets/images/avatar-placeholder.png')}
                    style={styles.avatarImage}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={(e) => {
                         console.warn('Seller avatar error:', e.nativeEvent?.error);
                         setIsLoading(false);
                    }}
                />
                <View>
                    <Text style={styles.ownerName}>{seller?.name ?? 'Penjual'}</Text>
                    <Text style={styles.ownerStatus}>Pemilik Terverifikasi</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
                <Icon name="comment" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
});

// ReviewList (Disesuaikan untuk Data API)
const ReviewList: React.FC<{
    reviews: ApiReview[]; // <-- 4. Gunakan Tipe ApiReview
    allReviewsCount: number;
    isLoading: boolean;
    onViewAll: () => void;
}> = React.memo(({ reviews, allReviewsCount, isLoading, onViewAll }) => (
    <>
        <View style={styles.reviewSectionHeader}>
            <Text style={styles.sectionTitle}>Ulasan Pengguna ({allReviewsCount})</Text>
            {allReviewsCount > 2 && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.linkText}>Lihat semua</Text>
                </TouchableOpacity>
            )}
        </View>

        {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loadingIndicator} />
        ) : reviews.length > 0 ? (
            reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                        {/* --- 5. SESUAIKAN DENGAN SKEMA BARU --- */}
                        <View style={styles.reviewAvatar}>
                          <FeatherIcon name="user" size={20} color={COLORS.textMuted} />
                        </View>
                        <View style={styles.reviewUserInfo}>
                            <Text style={styles.reviewUserName}>{review.user.name || 'User Anonim'}</Text>
                            <StarRating rating={review.rating} />
                        </View>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </Text>
                        {/* --------------------------------- */}
                    </View>
                    <Text style={styles.reviewComment}>{review.comment || 'Tidak ada komentar.'}</Text>
                </View>
            ))
        ) : (
            <Text style={styles.noReviewsText}>Belum ada ulasan untuk produk ini.</Text>
        )}
    </>
));

// AddReviewForm (Sudah Benar)
const AddReviewForm: React.FC<{
    rating: number;
    comment: string;
    isSubmitting: boolean; // <-- 6. Tambahkan state 'isSubmitting'
    onRatingChange: (rating: number) => void;
    onCommentChange: (comment: string) => void;
    onSubmit: () => void;
}> = React.memo(({ rating, comment, isSubmitting, onRatingChange, onCommentChange, onSubmit }) => (
    <View style={styles.addReviewContainer}>
        <Text style={styles.addReviewLabel}>Rating Anda:</Text>
        <InteractiveStarRating rating={rating} onRatingChange={onRatingChange} size={32} />

        <Text style={[styles.addReviewLabel, styles.commentLabelMargin]}>Komentar Anda:</Text>
        <TextInput
            style={styles.commentInput}
            placeholder="Bagikan pengalaman Anda..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            value={comment}
            onChangeText={onCommentChange}
            textAlignVertical="top"
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={onSubmit} 
          disabled={isSubmitting}
        >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
            )}
        </TouchableOpacity>
    </View>
));

// DetailFooter (Sudah Benar)
const DetailFooter: React.FC<{
    onAddToCart: () => void;
    onRent: () => void;
}> = React.memo(({ onAddToCart, onRent }) => (
    <SafeAreaView edges={['bottom']} style={styles.footerContainer}>
        <View style={styles.footer}>
            <View style={styles.actionButtonsContainerFull}>
                <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
                    <Icon name="shopping-cart" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rentButtonFull} onPress={onRent}>
                    <Text style={styles.rentButtonText}>Sewa Sekarang</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
));

// RentalModal (Sudah Benar)
const RentalModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    product: ApiProduct;
    productImageUri: string | null;
    duration: number;
    onIncrement: () => void;
    onDecrement: () => void;
    totalPrice: number;
    onConfirm: () => void;
}> = React.memo(({
    visible, onClose, product, productImageUri, duration, 
    onIncrement, onDecrement, totalPrice, onConfirm
}) => {
    const [,setIsLoading] = useState(true);
    const pricePerDay = product.price ?? 0;

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalCloseHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButtonIcon}>
                            <Icon name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productInfoRow}>
                        <Image
                            source={productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png')}
                            style={styles.modalProductImage}
                            onLoadStart={() => setIsLoading(true)}
                            onLoadEnd={() => setIsLoading(false)}
                            onError={(e) => {
                                 console.warn('Modal image error:', e.nativeEvent?.error);
                                 setIsLoading(false);
                            }}
                        />
                        <View style={styles.modalPriceStockContainer}>
                            <View style={styles.modalPriceRow}>
                                <Text style={styles.modalPriceValueCurrent}>{formatCurrency(pricePerDay)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.dividerModal} />

                    <View style={styles.durationInputContainer}>
                        <Text style={styles.durationInputLabel}>
                            Durasi Sewa {product.period ? `(${String(product.period).trim()})` : ''}
                        </Text>
                        <Stepper 
                            value={duration} 
                            onIncrement={onIncrement} 
                            onDecrement={onDecrement} 
                            min={MIN_DURATION} 
                            max={MAX_DURATION} 
                        />
                    </View>

                    <View style={styles.dividerModal} />

                    <TouchableOpacity style={styles.modalConfirmButton} onPress={onConfirm}>
                        <Text style={styles.modalConfirmButtonText}>Sewa Sekarang ({formatCurrency(totalPrice)})</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
});


// --- MAIN COMPONENT (CONTAINER) ---

export default function DetailScreen() {
    
    // --- Hooks ---
    const { isLoggedIn } = useAuth();
    const navigation = useNavigation<RootStackNavigationProp>();
    const route = useRoute<DetailRouteProp>();
    const { productId } = route.params;
    const { likedIds, toggleLike } = useLikes();
    const { addToCart } = useCart();
    // HAPUS: const { getReviewsForItem, addReviewForItem, loading: reviewsLoading } = useReviews();

    // --- State for Data Fetching ---
    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // --- 7. STATE BARU UNTUK ULASAN DARI API ---
    const [reviews, setReviews] = useState<ApiReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // --- State for UI ---
    const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number>(MIN_DURATION);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false); // <-- State loading baru

    // --- 8. FUNGSI BARU UNTUK FETCH ULASAN ---
    const fetchReviews = useCallback(async () => {
      if (!productId) return;
      setReviewsLoading(true);
      try {
        const response = await apiClient.get(`/products/${productId}/reviews`);
        setReviews(response.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        // Tidak perlu alert, cukup tampilkan 'Belum ada ulasan'
      } finally {
        setReviewsLoading(false);
      }
    }, [productId]);

    // --- Data Fetching Effect (Product & Reviews) ---
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
                
                // 1. Ambil data produk
                const response = await apiClient.get(`/products/${productId}`);
                setProduct(response.data);
                
                // 2. Ambil data ulasan
                await fetchReviews();

            } catch (err: any) {
                console.error("DetailScreen fetch error:", err);
                if (err.response && err.response.status === 404) {
                    setError('Produk tidak ditemukan.');
                } else if (err.code === 'ERR_NETWORK') {
                    setError(`Gagal terhubung ke server. Cek koneksi Anda.`);
                } else {
                    setError(err.message || 'Terjadi kesalahan saat memuat data.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId, fetchReviews]); // <-- Tambahkan fetchReviews

    // --- Memoized Values ---
    // HAPUS: allItemReviews & displayedReviews yang lama
    const displayedReviews = useMemo(() => reviews.slice(0, 2), [reviews]); // <-- Tampilkan 2 ulasan terbaru
    const isLiked = useMemo(() => {
        return product ? likedIds.includes(product.id) : false;
    }, [product, likedIds]);
    const pricePerDay = useMemo(() => product?.price ?? 0, [product]);
    const calculatedTotalPrice = useMemo(() => pricePerDay * selectedDuration, [pricePerDay, selectedDuration]);
    const productImageUri = useMemo(() => product ? buildImageUri(product.imageUrl) : null, [product]);
    const sellerAvatarUri = useMemo(() => product ? buildImageUri(product.seller?.avatar) : null, [product]);

    // --- Handlers (Dilindungi Auth) ---
    
    const promptLogin = useCallback(() => {
      Alert.alert(
        "Login Diperlukan",
        "Anda harus login terlebih dahulu untuk menggunakan fitur ini.",
        [
          { text: "Batal", style: "cancel" },
          { 
            text: "Login Sekarang", 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }, [navigation]);

    const handleToggleLike = useCallback(async () => {
        if (!isLoggedIn) { promptLogin(); return; }
        if (!product) return;
        try {
            await toggleLike(product.id);
        } catch (err) {
            console.error('Like toggle error:', err);
            Alert.alert('Gagal', 'Tidak dapat memperbarui status suka.');
        }
    }, [product, toggleLike, isLoggedIn, promptLogin]);

    const handleAddToCart = useCallback(async () => {
        if (!isLoggedIn) { promptLogin(); return; }
        if (!product) return;
        try {
            const added = await addToCart(product);
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
    }, [product, addToCart, navigation, isLoggedIn, promptLogin]);

    // --- 9. SESUAIKAN FUNGSI SUBMIT ULASAN ---
    const handleSubmitReview = useCallback(async () => {
        if (!isLoggedIn) { promptLogin(); return; }
        if (!product) return;
        if (newRating === 0) {
            Alert.alert('Rating Belum Dipilih', 'Silakan pilih rating bintang terlebih dahulu.');
            return;
        }
        
        setIsSubmittingReview(true);
        try {
            // Panggil API POST baru kita
            await apiClient.post(`/products/${product.id}/reviews`, {
              rating: newRating,
              comment: newComment.trim()
            });

            // Reset form
            setNewRating(0);
            setNewComment('');
            Alert.alert('Ulasan Terkirim', 'Terima kasih atas ulasan Anda!');
            
            // Ambil ulang data ulasan DAN data produk (untuk update rating kumulatif)
            await fetchReviews();
            const productResponse = await apiClient.get(`/products/${productId}`);
            setProduct(productResponse.data);

        } catch (err: any) {
            console.error('Submit review error:', err);
            const message = err.response?.data?.message || 'Gagal menyimpan ulasan.';
            Alert.alert('Gagal Mengirim', message);
        } finally {
          setIsSubmittingReview(false);
        }
    }, [product, newRating, newComment, isLoggedIn, promptLogin, fetchReviews, productId]);

    // Modal & Checkout Handlers (Sudah Benar)
    const openDurationModal = useCallback(() => {
        if (!isLoggedIn) { promptLogin(); return; }
        setSelectedDuration(MIN_DURATION);
        setIsDurationModalVisible(true);
    }, [isLoggedIn, promptLogin]);
    
    const closeDurationModal = useCallback(() => setIsDurationModalVisible(false), []);
    const incrementDuration = useCallback(() => setSelectedDuration((p) => Math.min(p + 1, MAX_DURATION)), []);
    const decrementDuration = useCallback(() => setSelectedDuration((p) => Math.max(p - 1, MIN_DURATION)), []);

    const confirmDurationAndCheckout = useCallback(() => {
        if (!product) return;
        if (selectedDuration < MIN_DURATION) {
            Alert.alert('Durasi Tidak Valid', `Pilih durasi minimal ${MIN_DURATION} hari.`);
            return;
        }
        
        closeDurationModal();
        const itemToCheckout = mapApiProductToCheckoutItem(product, selectedDuration, productImageUri);
        navigation.navigate('Checkout', { items: [itemToCheckout] });
    }, [product, selectedDuration, productImageUri, navigation, closeDurationModal]);
    
    // Navigation Handlers (Sudah Benar)
    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
    
    const handleViewAllReviews = useCallback(() => {
        if (!product) return;
        navigation.navigate('AllReviews', { 
          itemId: product.id, // <-- 'itemId' sekarang adalah 'productId'
          productName: product.name 
        });
    }, [navigation, product]);

    const handleChatPress = useCallback(() => {
        if (!isLoggedIn) { promptLogin(); return; }
        if (!product || !product.seller) return;
        navigation.navigate('Chat', {
            sellerId: product.seller.id,
            sellerName: product.seller.name,
            sellerAvatar: sellerAvatarUri ?? undefined,
            itemId: product.id,
        });
    }, [navigation, product, sellerAvatarUri, isLoggedIn, promptLogin]);
    
    const handleProfilePress = useCallback(() => {
        if (!product || !product.seller) return;
        navigation.navigate('SellerProfile', { seller: product.seller });
    }, [navigation, product]);

    // --- RENDER STATES (Sudah Benar) ---
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
                <TouchableOpacity onPress={handleGoBack}>
                    <Text style={styles.linkText}>Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={[styles.container, styles.centerAlign]}>
                 <Icon name="question-circle" size={40} color={COLORS.textMuted}/>
                 <Text style={styles.errorText}>Produk tidak ditemukan.</Text>
                 <TouchableOpacity onPress={handleGoBack}>
                     <Text style={styles.linkText}>Kembali</Text>
                 </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // --- MAIN RENDER (Sudah Benar) ---
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                <DetailHeader
                    imageUri={productImageUri}
                    isLiked={isLiked}
                    onBack={handleGoBack}
                    onLike={handleToggleLike}
                />

                <View style={styles.content}>
                    <ProductInfo product={product} pricePerDay={pricePerDay} />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Deskripsi</Text>
                    <Text style={styles.description}>{product.description ?? 'Tidak ada deskripsi.'}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Penyewa</Text>
                    <SellerInfo
                        seller={product.seller}
                        sellerAvatarUri={sellerAvatarUri}
                        onChatPress={handleChatPress}
                        onProfilePress={handleProfilePress}
                    />

                    <View style={styles.divider} />

                    <ReviewList
                        reviews={displayedReviews} // <-- Gunakan state 'reviews'
                        allReviewsCount={reviews.length} // <-- Hitung dari 'reviews'
                        isLoading={reviewsLoading} // <-- Gunakan state loading ulasan
                        onViewAll={handleViewAllReviews}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Tambahkan Ulasan Anda</Text>
                    <AddReviewForm
                        rating={newRating}
                        comment={newComment}
                        isSubmitting={isSubmittingReview} // <-- Kirim state loading
                        onRatingChange={setNewRating}
                        onCommentChange={setNewComment}
                        onSubmit={handleSubmitReview} // <-- Hubungkan ke fungsi baru
                    />
                </View>
            </ScrollView>

            <DetailFooter
                onAddToCart={handleAddToCart}
                onRent={openDurationModal}
            />

            <RentalModal
                visible={isDurationModalVisible}
                onClose={closeDurationModal}
                product={product}
                productImageUri={productImageUri}
                duration={selectedDuration}
                onIncrement={incrementDuration}
                onDecrement={decrementDuration}
                totalPrice={calculatedTotalPrice}
                onConfirm={confirmDurationAndCheckout}
            />
        </View>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    // --- Core Layout & Loading/Error States ---
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerAlign: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 16,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textMuted,
        fontSize: 16,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        fontSize: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // --- ScrollView & Main Content Area ---
    scrollViewContent: {
        paddingBottom: 100, // Padding agar tidak tertutup footer
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -30,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },

    // --- Header (DetailHeader) ---
    imageHeader: {
        width: '100%',
        height: 300,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: COLORS.card,
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    safeAreaHeader: {
        width: '100%',
    },
    headerNav: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    navButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },

    // --- Product Info (ProductInfo) ---
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24, // <-- Sedikit dikecilkan
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: 15,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        height: 35,
    },
    ratingText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    reviewCountText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    locationText: {
        color: COLORS.textMuted,
        fontSize: 14,
        marginLeft: 8,
    },
    inlinePriceInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    priceLabelInline: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginRight: 10,
        fontWeight: '600',
    },
    priceDisplayRowInline: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceHighlightInline: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 26,
        marginRight: 6,
    },
    pricePeriodInline: {
      color: COLORS.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },

    // --- SellerInfo ---
    ownerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 12,
        borderRadius: 12,
    },
    ownerInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: COLORS.border,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    ownerStatus: {
        fontSize: 13,
        color: COLORS.textSecondary, // <-- Ganti warna
        fontWeight: '500',
    },
    chatButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.card, // <-- Ganti warna
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    
    // --- ReviewList ---
    reviewSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewUserInfo: {
        flex: 1,
    },
    reviewUserName: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    reviewDate: {
      color: COLORS.textMuted,
      fontSize: 12,
    },
    starRatingContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    starIcon: {
        marginRight: 2,
    },
    reviewComment: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    noReviewsText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 10,
    },
    loadingIndicator: {
        marginVertical: 20,
    },

    // --- AddReviewForm ---
    addReviewContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addReviewLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    commentLabelMargin: {
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'left',
    },
    interactiveStarsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 12,
    },
    interactiveStar: {
        marginHorizontal: 8,
    },
    commentInput: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: COLORS.textPrimary,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonDisabled: {
      backgroundColor: COLORS.textMuted,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    
    // --- DetailFooter ---
    footerContainer: {
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderColor: COLORS.border,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionButtonsContainerFull: {
        flexDirection: 'row',
    },
    cartButton: {
        width: 56,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: 12,
    },
    rentButtonFull: {
        flex: 1,
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- RentalModal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        paddingBottom: 30, // Padding untuk safe area
    },
    modalCloseHeader: {
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    closeButtonIcon: {
        padding: 8,
    },
    productInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    modalProductImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: COLORS.border,
    },
    modalPriceStockContainer: {
        flex: 1,
        paddingTop: 10,
    },
    modalPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    modalPriceValueCurrent: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: 'bold',
    },
    dividerModal: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 20,
    },
    durationInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    durationInputLabel: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 8,
    },
    stepperButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepperButtonDisabled: {
        // backgroundColor: COLORS.border,
    },
    stepperText: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: '600',
    },
    stepperTextDisabled: {
        color: COLORS.textMuted,
    },
    stepperValue: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'center',
    },
    modalConfirmButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalConfirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});