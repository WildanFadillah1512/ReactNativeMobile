// File: src/screens/DetailScreen.tsx (Refactored & Professional)

// --- IMPORTS ---
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView,
    Image, Alert, ActivityIndicator, Modal, Pressable, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
// Pastikan tipe navigasi ini ada di file App.ts atau types.ts Anda
import { RootStackParamList, RootStackNavigationProp } from '../navigation/types'; 
import { useReviews } from '../context/ReviewContext';
import { useLikes } from '../context/LikeContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/riceParse';
import type { CheckoutRentalItem, ApiProduct, ApiSeller, Review } from '../types';
import { COLORS } from '../config/theme';
import { API_URL } from '../config/api';

const MIN_DURATION = 1;
const MAX_DURATION = 30;


// --- TYPES ---
type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;
// (Kita tidak lagi menggunakan DetailScreenProps karena memakai hook useNavigation)

// --- HELPER FUNCTIONS & COMPONENTS ---

/**
 * Membuat URI gambar yang valid dari filename.
 */
const buildImageUri = (filename?: string | null): string | null => {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
    return `${API_URL}/images/${filename}`;
};

/**
 * Mengkonversi ApiProduct menjadi CheckoutRentalItem untuk proses checkout.
 */
const mapApiProductToCheckoutItem = (
    product: ApiProduct,
    duration: number,
    productImageUri: string | null
): CheckoutRentalItem => {
    return {
        ...product,
        price: formatCurrency(product.price), // Format harga ke string
        image: productImageUri ? { uri: productImageUri } : require('../assets/images/placeholder.png'),
        duration: duration,
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
};

// Star rating (display-only)
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

// Interactive star rating for adding review
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

// Stepper
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


// --- PRESENTATIONAL SUB-COMPONENTS ---

// Header dengan Gambar dan Tombol Navigasi
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

// Informasi Judul, Rating, Lokasi, dan Harga
const ProductInfo: React.FC<{ product: ApiProduct; pricePerDay: number }> = React.memo(({ product, pricePerDay }) => (
    <>
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
                <Text style={styles.priceHighlightInline}>{formatCurrency(pricePerDay)}</Text>
                <Text style={styles.pricePeriodInline}>{product.period ?? ''}</Text>
            </View>
        </View>
    </>
));

// Informasi Penjewa / Pemilik
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
                <Icon name="comment" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
});

// Daftar Ulasan
const ReviewList: React.FC<{
    reviews: Review[];
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
    </>
));

// Form Tambah Ulasan
const AddReviewForm: React.FC<{
    rating: number;
    comment: string;
    onRatingChange: (rating: number) => void;
    onCommentChange: (comment: string) => void;
    onSubmit: () => void;
}> = React.memo(({ rating, comment, onRatingChange, onCommentChange, onSubmit }) => (
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

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>Kirim Ulasan</Text>
        </TouchableOpacity>
    </View>
));

// Footer dengan Tombol Aksi
const DetailFooter: React.FC<{
    onAddToCart: () => void;
    onRent: () => void;
}> = React.memo(({ onAddToCart, onRent }) => (
    // Kita gunakan SafeAreaView di sini untuk padding bawah
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

// Modal Pemilihan Durasi Sewa
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
    const navigation = useNavigation<RootStackNavigationProp>();
    const route = useRoute<DetailRouteProp>();
    const { productId } = route.params;

    const { likedIds, toggleLike } = useLikes();
    const { addToCart } = useCart();
    const { getReviewsForItem, addReviewForItem, loading: reviewsLoading } = useReviews();

    // --- State for Data Fetching ---
    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for UI ---
    const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number>(MIN_DURATION);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    // --- Data Fetching Effect ---
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
                setProduct(data);

            } catch (err) {
                console.error("DetailScreen fetch error:", err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]); // Hanya fetch ulang jika productId berubah

    // --- Memoized Values ---
    const allItemReviews = useMemo(() => {
        return product ? getReviewsForItem(product.id) : [];
    }, [product, getReviewsForItem]);

    const displayedReviews = useMemo(() => allItemReviews.slice(0, 2), [allItemReviews]);

    const isLiked = useMemo(() => {
        return product ? likedIds.includes(product.id) : false;
    }, [product, likedIds]);

    const pricePerDay = useMemo(() => product?.price ?? 0, [product]);
    const calculatedTotalPrice = useMemo(() => pricePerDay * selectedDuration, [pricePerDay, selectedDuration]);

    const productImageUri = useMemo(() => product ? buildImageUri(product.imageUrl) : null, [product]);
    const sellerAvatarUri = useMemo(() => product ? buildImageUri(product.seller?.avatar) : null, [product]);

    // --- Handlers (with useCallback for optimization) ---
    
    const handleToggleLike = useCallback(async () => {
        if (!product) return;
        try {
            await toggleLike(product.id);
        } catch (err) {
            console.error('Like toggle error:', err);
            Alert.alert('Gagal', 'Tidak dapat memperbarui status suka.');
        }
    }, [product, toggleLike]);

    const handleAddToCart = useCallback(async () => {
        if (!product) return;
        try {
            const added = await addToCart(product); // Kirim ApiProduct
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
    }, [product, addToCart, navigation]);

    const handleSubmitReview = useCallback(async () => {
        if (!product) return;
        if (newRating === 0) {
            Alert.alert('Rating Belum Dipilih', 'Silakan pilih rating bintang terlebih dahulu.');
            return;
        }
        if (newComment.trim().length < 5) {
            Alert.alert('Komentar Pendek', 'Komentar minimal 5 karakter.');
            return;
        }
        try {
            await addReviewForItem(product.id, newRating, newComment.trim());
            setNewRating(0);
            setNewComment('');
            Alert.alert('Ulasan Terkirim', 'Terima kasih atas ulasan Anda!');
        } catch (err) {
            console.error('Submit review error:', err);
            Alert.alert('Gagal Mengirim', 'Terjadi kesalahan saat menyimpan ulasan.');
        }
    }, [product, newRating, newComment, addReviewForItem]);

    // Modal & Checkout Handlers
    const openDurationModal = useCallback(() => {
        setSelectedDuration(MIN_DURATION);
        setIsDurationModalVisible(true);
    }, []);
    
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
        
        // Gunakan helper function untuk konversi data
        const itemToCheckout = mapApiProductToCheckoutItem(product, selectedDuration, productImageUri);
        
        navigation.navigate('Checkout', { items: [itemToCheckout] });
    }, [product, selectedDuration, productImageUri, navigation, closeDurationModal]);
    
    // Navigation Handlers
    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
    
    const handleViewAllReviews = useCallback(() => {
        if (!product) return;
        navigation.navigate('AllReviews', { itemId: product.id, productName: product.name });
    }, [navigation, product]);

    const handleChatPress = useCallback(() => {
        if (!product || !product.seller) return;
        navigation.navigate('Chat', {
            sellerId: product.seller.id,
            sellerName: product.seller.name,
            sellerAvatar: sellerAvatarUri ?? undefined,
            itemId: product.id,
        });
    }, [navigation, product, sellerAvatarUri]);
    
    const handleProfilePress = useCallback(() => {
        if (!product || !product.seller) return;
        navigation.navigate('SellerProfile', { seller: product.seller });
    }, [navigation, product]);


    // --- RENDER STATES ---

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

    // --- MAIN RENDER ---
    // (Sekarang jauh lebih bersih dan deklaratif)

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                <DetailHeader
                    imageUri={productImageUri}
                    isLiked={isLiked}
                    onBack={handleGoBack}
                    onLike={handleToggleLike}
                />

                {/* Konten utama dengan padding */}
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
                        reviews={displayedReviews}
                        allReviewsCount={allItemReviews.length}
                        isLoading={reviewsLoading}
                        onViewAll={handleViewAllReviews}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Tambahkan Ulasan Anda</Text>
                    <AddReviewForm
                        rating={newRating}
                        comment={newComment}
                        onRatingChange={setNewRating}
                        onCommentChange={setNewComment}
                        onSubmit={handleSubmitReview}
                    />
                </View>
            </ScrollView>

            {/* Footer diletakkan di luar ScrollView agar menempel */}
            <DetailFooter
                onAddToCart={handleAddToCart}
                onRent={openDurationModal}
            />

            {/* Modal berada di level atas */}
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
// (StyleSheet Anda yang sudah dirapikan dan dikelompokkan)

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
    },

    // --- ScrollView & Main Content Area ---
    scrollViewContent: {
        // PENTING: Beri padding agar tidak tertutup sticky footer
        paddingBottom: 100,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -30, // Efek "menarik" konten ke atas gambar
    },

    // --- Header (DetailHeader) ---
    imageHeader: {
        width: '100%',
        height: 300,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: COLORS.card, // Warna fallback jika gambar gagal
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
        fontSize: 28,
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
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
        alignSelf: 'flex-end',
    },

    // --- Seller Info (SellerInfo) ---
    ownerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
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
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    ownerStatus: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    chatButton: {
        backgroundColor: COLORS.primary,
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Review List (ReviewList) ---
    reviewSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    reviewCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    reviewUserInfo: {
        flex: 1,
    },
    reviewUserName: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    reviewComment: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 8,
    },
    noReviewsText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    loadingIndicator: {
        marginVertical: 20,
    },

    // --- Add Review Form (AddReviewForm) ---
    addReviewContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        // marginBottom: 30, // Dihapus, dihandle oleh paddingBottom ScrollView
    },
    addReviewLabel: {
        color: COLORS.textPrimary,
        fontSize: 15,
        marginBottom: 8,
        fontWeight: '600',
    },
    commentLabelMargin: {
        marginTop: 15,
    },
    commentInput: {
        backgroundColor: COLORS.border, // Menggunakan border sbg background input
        color: COLORS.textPrimary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        minHeight: 100,
        marginBottom: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: COLORS.border, // Border disamakan dgn background
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        elevation: Platform.OS === 'android' ? 3 : 0,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- Helper Components (Star, Stepper) ---
    starRatingContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    starIcon: {
        marginRight: 2,
    },
    interactiveStarsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    interactiveStar: {
        marginRight: 12,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 5,
    },
    stepperButton: {
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    stepperButtonDisabled: {
        backgroundColor: COLORS.border, // Warna beda saat disabled
    },
    stepperText: {
        color: COLORS.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepperTextDisabled: {
        color: COLORS.textMuted,
    },
    stepperValue: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 15,
        minWidth: 50,
        textAlign: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.border,
        height: 35,
        lineHeight: 35, // Trik agar teks vertikal center
    },

    // --- Footer (DetailFooter) ---
    footerContainer: {
        // PENTING: Membuat footer menempel di bawah
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderColor: COLORS.card,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        // (SafeAreaView akan menangani tinggi dan padding bawah)
    },
    actionButtonsContainerFull: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    cartButton: {
        backgroundColor: COLORS.card,
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    rentButtonFull: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        height: 50,
        elevation: Platform.OS === 'android' ? 5 : 0,
    },
    rentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- Modal (RentalModal) ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        // Padding bottom untuk modal ditangani oleh <SafeAreaView> di dalam modal jika perlu,
        // tapi untuk modal slide-up, padding di <Pressable> sudah cukup
        paddingBottom: Platform.OS === 'android' ? 20 : 34,
    },
    modalCloseHeader: {
        width: '100%',
        alignItems: 'flex-end',
        paddingBottom: 10,
    },
    closeButtonIcon: {
        padding: 5, // Area sentuh
    },
    productInfoRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    modalProductImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 15,
        backgroundColor: COLORS.border,
    },
    modalPriceStockContainer: {
        justifyContent: 'flex-start',
        flex: 1,
        paddingTop: 5,
    },
    modalPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 5,
    },
    modalPriceValueCurrent: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
    },
    dividerModal: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 15,
    },
    durationInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        paddingHorizontal: 5,
    },
    durationInputLabel: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 'normal',
    },
    modalConfirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    modalConfirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- Utility (dipakai di beberapa tempat) ---
    divider: {
        height: 1,
        backgroundColor: COLORS.card, // Berbeda dari dividerModal
        marginVertical: 20,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 15,
        lineHeight: 24,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});