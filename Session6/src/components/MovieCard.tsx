import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { Film } from '../api/data';

type Props = {
  film: Film;
  onPress: () => void;
};

export default function MovieCard({ film, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {film.image ? (
        <Image source={{ uri: film.image }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterFallback]}>
          <Text style={styles.posterFallbackText}>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{film.title}</Text>
        <Text style={styles.meta}>Score: {film.rt_score} • {film.release_date}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  poster: { width: 80, height: 110, borderRadius: 8, backgroundColor: '#1f2937' },
  posterFallback: { justifyContent: 'center', alignItems: 'center' },
  posterFallbackText: { color: '#9CA3AF', fontSize: 12 },
  info: { flex: 1, justifyContent: 'center' },
  title: { color: 'white', fontSize: 16, fontWeight: '600' },
  meta: { color: '#9CA3AF', marginTop: 4 },
});
