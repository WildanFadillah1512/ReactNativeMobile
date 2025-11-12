import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../config/theme';
import { BASE_URL } from '../config/api';
// Asumsi ApiProduct sudah didefinisikan di '../types'
import type { ApiProduct } from '../types'; 

// Helper untuk kategori (ikon & warna)
// Ini adalah implementasi yang baik
const getCategoryInfo = (cat: string | null) => {
  switch (cat) {
    case 'Trending': return { icon: 'line-chart', color: COLORS.trending };
    case 'Outdoor': return { icon: 'tree', color: COLORS.outdoor };
    case 'Elektronik': return { icon: 'camera', color: COLORS.elektronik };
    case 'Perlengkapan': return { icon: 'wrench', color: COLORS.perlengkapan };
    case 'Kendaraan': return { icon: 'bicycle', color: COLORS.kendaraan };
    default: return { icon: 'tag', color: COLORS.defaultCategory };
  }
};

type Props = {
  item: ApiProduct;
  isLiked: boolean;
  onPress: (item: ApiProduct) => void;
  onLike: (id: number) => void;
  onAddToCart: (item: ApiProduct) => void;
  likesLoading: boolean;
  cartLoading: boolean;
};

// Komponen kecil untuk rating bintang
const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.ratingBox}>
    <Icon name="star" size={12} color={COLORS.starActive} />
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
  </View>
);

export const ProductCard: React.FC<Props> = React.memo(
  ({
    item,
    isLiked,
    onPress,
    onLike,
    onAddToCart,
    likesLoading,
    cartLoading,
  }) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        {/* Gambar produk */}
        {item.imageUrl ? (
          <Image
            source={{ uri: `${BASE_URL}/images/${item.imageUrl}` }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) =>
              console.log('Image Load Error:', e.nativeEvent.error)
            }
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="photo" size={50} color={COLORS.border} />
          </View>
        )}

        {/* Badge kategori */}
        <View
          style={[
            styles.categoryBadge,
            styles.categoryBadgeRight,
            { backgroundColor: getCategoryInfo(item.category).color },
          ]}
        >
          <Icon
            name={getCategoryInfo(item.category).icon}
            color="white"
            size={10}
          />
          <Text style={styles.badgeText}> {item.category || 'Lainnya'}</Text>
        </View>

        {/* Badge Trending */}
        {item.trending && (
          <View style={styles.trendingBadge}>
            <Icon name="line-chart" color="white" size={10} />
            <Text style={styles.badgeText}> Trending</Text>
          </View>
        )}

        {/* Tombol suka */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => onLike(item.id)}
          // Mencegah klik menembus ke 'onPress' kartu
          onPressOut={(e) => e.stopPropagation()} 
          activeOpacity={0.7}
          disabled={likesLoading}
        >
          {likesLoading ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Icon
              name={isLiked ? 'heart' : 'heart-o'}
              size={18}
              color={isLiked ? COLORS.danger : 'white'}
            />
          )}
        </TouchableOpacity>

        {/* Konten kartu */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.location || 'Lokasi tidak diketahui'}
                </Text>
              </View>
            </View>

            {/* Rating kumulatif (sesuai schema) */}
            <StarRating rating={item.ratingAvg ?? 0} />
          </View>

          {/* Deskripsi */}
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Footer: kategori & jumlah ulasan */}
          <View style={styles.cardFooter}>
            <Text style={styles.categoryTag}>{item.category || 'Lainnya'}</Text>
            <View style={styles.reviewRow}>
              <Icon name="users" size={12} color={COLORS.textMuted} />
              <Text style={styles.reviewText}>
                {' '}
                {/* Jumlah ulasan (sesuai schema) */}
                {item.reviewsCount ?? 0} ulasan
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Harga & tombol aksi */}
          <View style={styles.priceActionRow}>
            <Text style={styles.priceText} numberOfLines={1}>
              <Text style={styles.priceHighlight}>
                Rp {item.price.toLocaleString('id-ID')}
              </Text>
              {item.period ? ` ${item.period}` : ''}
            </Text>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.cartIconContainer}
                onPress={() => onAddToCart(item)}
                onPressOut={(e) => e.stopPropagation()}
                activeOpacity={0.7}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Icon name="cart-plus" color={COLORS.primary} size={20} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rentButton}
                onPress={() => onPress(item)}
              >
                <Text style={styles.rentButtonText}>Sewa</Text>
                <Icon name="chevron-right" color="white" size={14} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

// Styles (Sudah benar dan lengkap)
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  categoryBadgeRight: { right: 12 },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  likeButton: {
    position: 'absolute',
    top: 132,
    right: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardBody: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: { flex: 1, marginRight: 8 },
  cardTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: COLORS.textMuted, fontSize: 12, marginLeft: 6 },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginVertical: 8,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: COLORS.border,
    color: COLORS.textSecondary,
    fontSize: 11,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center' },
  reviewText: { color: COLORS.textMuted, fontSize: 11, marginLeft: 4 },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonsContainer: { flexDirection: 'row', alignItems: 'center' },
  priceText: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 8,
  },
  priceHighlight: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 4,
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rentButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
});