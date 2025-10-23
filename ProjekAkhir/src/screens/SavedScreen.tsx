// src/screens/SavedScreen.tsx
import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator, 
    Alert, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';
import { allRentalProducts } from '../data/product'; 
import type { RentalItem } from '../types';
import { useLikes } from '../context/LikeContext';

const { width } = Dimensions.get('window');

// Definisikan tipe untuk Tab ID
type TabId = 'home' | 'explore' | 'saved' | 'profile';

type SavedScreenProps = NativeStackScreenProps<RootStackParamList, 'Saved'>;

// Interface untuk Props SavedItemCard
interface SavedItemCardProps {
    item: RentalItem;
    onUnlike: (id: number) => void;
    onPress: (item: RentalItem) => void;
}

// Komponen Card Item
const SavedItemCard: React.FC<SavedItemCardProps> = ({ item, onUnlike, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {/* Tombol Unlike */}
        <TouchableOpacity
            style={styles.likeButton}
            onPress={() => onUnlike(item.id)}
            onPressOut={(e) => e.stopPropagation()}
            activeOpacity={0.7}
        >
            <Icon name="heart" size={18} color={'#ef4444'} />
        </TouchableOpacity>
        <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
                <Icon name="map-marker" size={12} color="#94a3b8" />
                <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <View style={styles.priceRow}>
                 <Text style={styles.priceText}>
                    <Text style={styles.priceHighlight}>{item.price}</Text>
                    {item.period}
                 </Text>
                 <View style={styles.ratingBox}>
                     <Icon name="star" size={11} color="#facc15" />
                     <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                 </View>
            </View>
        </View>
    </TouchableOpacity>
);


export default function SavedScreen({ navigation }: SavedScreenProps) {
    const { likedIds, toggleLike, isLoading: likesLoading } = useLikes();

    const savedItems = useMemo(
        () => allRentalProducts.filter(item => likedIds.includes(item.id)),
        [likedIds] 
    );

    const handleUnlike = async (id: number) => {
        try {
            await toggleLike(id);
        } catch (error) {
            console.error("Gagal unlike:", error);
            Alert.alert("Gagal", "Tidak dapat menghapus dari simpanan.");
        }
    };

    const handleNavigateToDetail = (item: RentalItem) => {
        navigation.navigate('Detail', { item });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                     <Icon name="arrow-left" size={22} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Barang Disimpan</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Konten Daftar Item */}
            {likesLoading ? ( 
                 <ActivityIndicator style={styles.loadingIndicator} size="large" color="#06b6d4" />
            ) : (
                <FlatList
                    data={savedItems} 
                    renderItem={({ item }) => (
                        <SavedItemCard
                            item={item}
                            onUnlike={handleUnlike} 
                            onPress={handleNavigateToDetail}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="heart-o" size={60} color="#475569" />
                            <Text style={styles.emptyText}>Anda belum menyimpan barang apapun.</Text>
                            {/* Tombol kembali ke home/explore */}
                            <TouchableOpacity 
                                style={styles.browseButton} 
                                // Navigasi ke Home dan set tab ke 'explore'
                                onPress={() => navigation.navigate('Home', { activeTabId: 'explore' })}
                            >
                                <Text style={styles.browseButtonText}>Mulai Cari Barang</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Bottom Nav - Logika Navigasi Diperbarui */}
            <View style={styles.bottomNav}>
                 {[
                    { icon: 'cube', id: 'home' as TabId },
                    { icon: 'compass', id: 'explore' as TabId },
                    { icon: 'heart', id: 'saved' as TabId },
                    { icon: 'user', id: 'profile' as TabId },
                 ].map(navItem => (
                    <TouchableOpacity
                        key={navItem.id}
                        onPress={() => {
                            // PERBAIKAN: HANYA KLIK 'home' yang memicu navigasi.
                            if (navItem.id === 'home') {
                                navigation.navigate('Home', { activeTabId: navItem.id });
                            } 
                            // Klik 'explore', 'saved', dan 'profile' tidak melakukan apa-apa.
                        }}
                        style={styles.navItem}
                    >
                        <Icon
                            name={navItem.icon}
                            // Highlight 'saved' karena kita berada di SavedScreen (Stack)
                            color={navItem.id === 'saved' ? '#22d3ee' : '#94a3b8'} 
                            size={22}
                        />
                    </TouchableOpacity>
                 ))}
            </View>
            <SafeAreaView edges={['bottom']} style={styles.bottomSpacer}/>
        </SafeAreaView>
    );
}

// Styles (Tidak ada perubahan pada styles)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#1e293b',
    },
    backButton: { padding: 4, },
    headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
    headerSpacer: { width: 22 + 8 },
    listContent: { padding: 16, flexGrow: 1 },
    columnWrapper: { justifyContent: 'space-between' },
    card: {
        backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 16,
        width: (width / 2) - 24, overflow: 'hidden', elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
    },
    image: { width: '100%', height: 130 },
    likeButton: {
        position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    cardBody: { padding: 10 },
    cardTitle: { color: 'white', fontWeight: '600', fontSize: 14, marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    locationText: { color: '#94a3b8', fontSize: 11, marginLeft: 5 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, },
    priceText: { fontSize: 12, color: '#94a3b8' },
    priceHighlight: { color: '#22d3ee', fontWeight: 'bold', fontSize: 15, marginRight: 3 },
    ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, },
    ratingText: { color: 'white', fontSize: 10, marginLeft: 3 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 50 },
    emptyText: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginTop: 16, marginBottom: 24, lineHeight: 22, },
    browseButton: { backgroundColor: '#06b6d4', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, },
    browseButtonText: { color: 'white', fontSize: 14, fontWeight: '600', },
    bottomNav: {
        flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#1e293b',
        paddingTop: 10, backgroundColor: '#0f172a', paddingBottom: 0
    },
    navItem: { alignItems: 'center', flex: 1, paddingBottom: 5 },
    bottomSpacer: {
        backgroundColor: '#0f172a',
    },
    loadingIndicator: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});