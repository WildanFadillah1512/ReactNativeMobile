import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  FlatList, 
  RefreshControl, 
  StyleSheet,
  Alert // Alert tetap digunakan
} from 'react-native';
// (BARU) Impor tipe navigasi
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SongStackParamList } from '../../App'; // Sesuaikan path jika perlu

import SongCard from '../components/SongCard';

// Tipe 'Song' disesuaikan agar cocok dengan SongCard
export interface Song {
  id: number;
  cover: string;  // Dari artworkUrl100
  title: string;  // Dari trackName
  artist: string; // Dari artistName
  album: string;  // Dari collectionName
  url: string;    // Dari previewUrl
}

// (BARU) Tentukan tipe props dari navigator
type Props = NativeStackScreenProps<SongStackParamList, 'SongList'>;

// (BARU) Terima { navigation } dari props
export default function SongListScreen({ navigation }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const response = await fetch('https://itunes.apple.com/search?term=coldplay&entity=song&limit=20');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari iTunes API');
      }
      const data = await response.json();

      const mappedSongs: Song[] = data.results
        .filter((item: any) => item.trackId)
        .map((item: any) => ({
          id: item.trackId,
          cover: item.artworkUrl100,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName,
          url: item.previewUrl,
        }));

      setSongs(mappedSongs);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat lagu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  // (DIUBAH) Fungsi ini sekarang menerima objek 'Song' dan menggunakan navigasi
  const handleSongPress = (song: Song) => {
    if (song.url) {
      // Navigasi ke SongDetail dan kirim seluruh data lagu
      navigation.navigate('SongDetail', { song: song });
    } else {
      Alert.alert('Preview Tidak Tersedia', 'Link untuk lagu ini tidak dapat ditemukan.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#3B82F6" size="large" />
        <Text style={styles.muted}>Memuat lagu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={songs}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      renderItem={({ item }) => (
        <SongCard 
          song={item} 
          // (DIUBAH) Kirim 'item' (objek) alih-alih 'item.url' (string)
          onPress={() => handleSongPress(item)} 
        />
      )}
      ListHeaderComponent={<Text style={styles.header}>🎵 Top Songs (from iTunes)</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#111' },
  muted: { color: '#6B7280', marginTop: 8 },
  error: { color: '#ef4444', fontWeight: '600' },
  header: { color: '#fff', fontSize: 22, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 8 },
  listContainer: { backgroundColor: '#111', paddingVertical: 8 },
});