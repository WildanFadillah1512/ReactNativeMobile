import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../config/theme';
// --- [PENYESUAIAN] Impor apiClient ---
import apiClient from '../config/api'; 
// --- [PENYESUAIAN] Impor tipe ApiProduct ---
import type { ApiProduct } from '../types'; 

type SearchHistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchHistory'>;
const SEARCH_HISTORY_KEY = '@search_history';
const HISTORY_LIMIT = 5;

// --- [PENYESUAIAN] Menggunakan apiClient dan tipe ApiProduct ---
const getTrendingTerms = async (): Promise<string[]> => {
    try {
        // Panggil endpoint yang sudah ada menggunakan apiClient
        const response = await apiClient.get('/products/trending');
        
        // Endpoint ini mengembalikan array ApiProduct[]
        const trendingProducts: ApiProduct[] = response.data;
        
        // Ambil namanya saja
        const trendingNames: string[] = trendingProducts.map(item => item.name);
        return trendingNames;
    } catch (error) {
        console.error("Gagal mengambil data trending dari API:", error);
        throw error; // Lempar ulang error agar ditangani oleh loadTrending
    }
};


export default function SearchHistoryScreen({ navigation }: SearchHistoryScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [trending, setTrending] = useState<string[]>([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    // ==========================================================
    // LOGIKA ASYNCSTORAGE (Riwayat Pencarian - Tidak Berubah)
    // ==========================================================
    const loadHistory = useCallback(async () => {
        try {
            const storedHistory = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (storedHistory !== null) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Gagal memuat riwayat pencarian:', error);
        }
    }, []);

    const saveHistory = async (newQuery: string) => {
        const lowerQuery = newQuery.toLowerCase();
        let updatedHistory = history.filter(item => item.toLowerCase() !== lowerQuery);
        updatedHistory.unshift(newQuery);
        updatedHistory = updatedHistory.slice(0, HISTORY_LIMIT);

        try {
            await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
            setHistory(updatedHistory);
        } catch (error) {
            console.error('Gagal menyimpan riwayat pencarian:', error);
        }
    };

    const clearAllHistory = async () => {
        Alert.alert(
            "Hapus Riwayat",
            "Apakah Anda yakin ingin menghapus semua riwayat pencarian?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
                            setHistory([]);
                        } catch (error) {
                            console.error('Gagal menghapus riwayat pencarian:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleSearch = (query: string) => {
        const finalQuery = query.trim();
        if (!finalQuery) return;

        saveHistory(finalQuery);

        // Gunakan 'replace' agar tidak bisa kembali ke halaman SearchHistory
        navigation.replace('SearchResults', { query: finalQuery });
    };

    // LOGIKA Memuat Trending (Tidak Berubah)
    const loadTrending = useCallback(async () => {
        try {
            setIsLoadingTrending(true);
            const trendingData = await getTrendingTerms();
            setTrending(trendingData);
        } catch (error) {
            console.error('Gagal memuat data trending:', error);
            Alert.alert("Error Trending", "Tidak dapat memuat data populer saat ini.");
            setTrending([]); 
        } finally {
            setIsLoadingTrending(false);
        }
    }, []);

    // Muat riwayat dan trending saat komponen pertama kali dirender
    useEffect(() => {
        loadHistory();
        loadTrending();
    }, [loadHistory, loadTrending]);

    // ==========================================================
    // RENDER (Tidak Berubah)
    // ==========================================================
    return (
        <SafeAreaView style={styles.container}>
            {/* Header dengan Input Pencarian */}
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                     <Icon name="arrow-left" size={20} color={COLORS.textPrimary} />
                 </TouchableOpacity>
                 <View style={styles.searchInputContainer}>
                     <Icon name="search" color={COLORS.textMuted} size={16} style={styles.searchIcon} />
                     <TextInput
                         style={styles.searchInput}
                         placeholder="Cari barang..."
                         placeholderTextColor={COLORS.textMuted}
                         onChangeText={setSearchQuery}
                         value={searchQuery}
                         onSubmitEditing={() => handleSearch(searchQuery)}
                         autoFocus={true}
                         returnKeyType="search"
                     />
                     {searchQuery.length > 0 && (
                         <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                             <Icon name="times-circle" size={18} color={COLORS.textMuted} />
                         </TouchableOpacity>
                     )}
                 </View>
                 {searchQuery.length > 0 && (
                     <TouchableOpacity onPress={() => handleSearch(searchQuery)} style={styles.searchButton}>
                        <Text style={styles.searchButtonText}>Cari</Text>
                     </TouchableOpacity>
                 )}
            </View>

            {/* Konten Riwayat dan Populer */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Riwayat Pencarian */}
                {history.length > 0 && (
                    <View style={styles.section}>
                         <Text style={styles.sectionTitle}>Riwayat Pencarian ⏳</Text>
                         <View style={styles.historyContainer}>
                             {history.map((query, index) => (
                                 <TouchableOpacity
                                     key={index}
                                     style={styles.historyItem}
                                     onPress={() => handleSearch(query)}
                                 >
                                     <Icon name="history" size={14} color={COLORS.textMuted} style={styles.historyIcon} />
                                     <Text style={styles.historyText}>{query}</Text>
                                     <Icon name="arrow-up" size={12} color={COLORS.textMuted} style={styles.historyGoIcon} />
                                 </TouchableOpacity>
                             ))}
                             <TouchableOpacity style={styles.clearHistoryButton} onPress={clearAllHistory}>
                                 <Text style={styles.clearHistoryText}>Hapus Semua Riwayat</Text>
                             </TouchableOpacity>
                         </View>
                    </View>
                )}

                {/* Populer Saat Ini (Trending) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Populer Saat Ini 🔥</Text>
                    <View style={styles.popularContainer}>
                        {isLoadingTrending ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            trending.length > 0 ? (
                                trending.map((query, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.popularButton}
                                        onPress={() => handleSearch(query)}
                                    >
                                        <Text style={styles.popularText}>{query}</Text>
                                    </TouchableOpacity>
                                ))
                               ) : (
                                <Text style={styles.noTrendingText}>Tidak ada data populer.</Text>
                               )
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// STYLES
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: COLORS.border },
    backButton: { marginRight: 12, padding: 4 },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 12, flex: 1, height: 44 },
    searchIcon: { marginRight: 10 },
    searchInput: { color: COLORS.textPrimary, flex: 1, fontSize: 14, paddingVertical: 10, },
    clearButton: { marginLeft: 10, padding: 4 },
    searchButton: { marginLeft: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.primary, borderRadius: 10, },
    searchButtonText: { color: 'white', fontWeight: 'bold' }, // Ubah warna teks agar kontras
    content: { padding: 16 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
    historyContainer: {},
    historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border, },
    historyIcon: { marginRight: 10, opacity: 0.6 },
    historyText: { flex: 1, color: COLORS.textSecondary, fontSize: 14 },
    historyGoIcon: { marginLeft: 10, transform: [{ rotate: '315deg' }], opacity: 0.6 },
    clearHistoryButton: { marginTop: 15, alignSelf: 'flex-start' },
    clearHistoryText: { color: COLORS.danger, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
    popularContainer: { flexDirection: 'row', flexWrap: 'wrap', },
    popularButton: { backgroundColor: COLORS.card, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.primary },
    popularText: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
    noTrendingText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontStyle: 'italic',
    }
});