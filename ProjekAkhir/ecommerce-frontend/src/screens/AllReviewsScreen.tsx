import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert, // <-- 1. TAMBAHKAN 'Alert' DI SINI
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/theme';

// (Tipe ApiReview sudah benar)
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

// (Komponen StarRating sudah benar)
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
  
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth(); 

  // (useEffect untuk fetch data sudah benar)
  useEffect(() => {
    const fetchReviews = async () => {
      if (!itemId) return; 
      
      setLoading(true);
      try {
        const response = await apiClient.get(`/products/${itemId}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error("Gagal mengambil ulasan:", error);
        // Baris ini sekarang akan berfungsi
        Alert.alert("Error", "Gagal memuat ulasan."); 
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemId]); 

  
  // (renderReviewItem sudah benar)
  const renderReviewItem = useCallback(({ item }: { item: ApiReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <FeatherIcon name="user" size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.reviewUserInfo}>
          <Text style={styles.reviewUserName}>{item.user.name || 'User Anonim'}</Text>
          <StarRating rating={item.rating} />
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment || 'Tidak ada komentar.'}</Text>
    </View>
  ), []);

  // (handleWriteReview sudah benar)
  const handleWriteReview = () => {
    if (!isLoggedIn) {
      // Baris ini sekarang akan berfungsi
      Alert.alert("Login Diperlukan", "Anda harus login untuk menulis ulasan.", [ 
        { text: "Batal" },
        { text: "Login", onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    navigation.navigate('TulisUlasan', { productId: itemId, productName: productName });
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ulasan: {productName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={reviews} 
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <FeatherIcon name="message-square" size={60} color={COLORS.textMuted} />
              <Text style={styles.noReviewsText}>Belum ada ulasan</Text>
              <Text style={styles.emptySubText}>Jadilah yang pertama memberi ulasan!</Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <FeatherIcon name="edit-3" size={16} color="white" />
              <Text style={styles.writeReviewButtonText}>Tulis Ulasan Anda</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
}

// (Styles sudah benar)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { paddingVertical: 4, paddingHorizontal: 4, width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  headerSpacer: { width: 40 }, 
  listContent: { padding: 16 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  reviewCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
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
  reviewUserInfo: { flex: 1, },
  reviewUserName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', },
  starRatingContainer: { flexDirection: 'row', marginTop: 4, },
  starIcon: { marginRight: 2, },
  reviewDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  reviewComment: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21, },
  noReviewsText: { 
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  writeReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});