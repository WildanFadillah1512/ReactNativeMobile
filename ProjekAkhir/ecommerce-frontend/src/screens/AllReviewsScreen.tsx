// src/screens/AllReviewsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { useReviews} from '../context/ReviewContext';
import type { UserReview } from '../types'; // Import UserReview juga

// StarRating Component (Copy dari DetailScreen atau impor jika dipisah)
const StarRating = ({ rating }: { rating: number }) => (
 <View style={styles.starRatingContainer}>
  {Array.from({ length: 5 }).map((_, index) => (
   <Icon
    key={index}
    name="star"
    size={14}
    style={styles.starIcon}
    color={index < Math.round(rating) ? '#facc15' : '#334155'}
   />
  ))}
 </View>
);

type AllReviewsScreenProps = NativeStackScreenProps<RootStackParamList, 'AllReviews'>;

export default function AllReviewsScreen({ route, navigation }: AllReviewsScreenProps) {
  const { itemId, productName } = route.params;
  const { getReviewsForItem, loading } = useReviews();
  const allItemReviews = getReviewsForItem(itemId); // Ambil semua ulasan

  const renderReviewItem = ({ item }: { item: UserReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{item.name}</Text>
          <StarRating rating={item.rating} />
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ulasan: {productName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator color="#06b6d4" size="large" />
        </View>
      ) : (
        <FlatList
          data={allItemReviews} // Tampilkan semua ulasan
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.noReviewsText}>Belum ada ulasan untuk produk ini.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1e293b',
  },
  backButton: { padding: 4, },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  headerSpacer: { width: 22 + 8 }, // Sesuaikan agar simetris
  listContent: { padding: 16 },
  centerContainer: { // Untuk loading dan empty state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 12, },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, },
  reviewUserInfo: { flex: 1, },
  reviewUserName: { color: 'white', fontSize: 14, fontWeight: '600', },
  starRatingContainer: { flexDirection: 'row', marginTop: 4, },
  starIcon: { marginRight: 2, },
  reviewComment: { color: '#cbd5e1', fontSize: 13, lineHeight: 20, },
  noReviewsText: { color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', },
});