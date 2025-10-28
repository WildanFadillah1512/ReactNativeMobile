import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { Song } from '../screens/SongListScreen'; 

type Props = {
  song: Song;
  onPress?: () => void;
};

export default function SongCard({ song, onPress }: Props) {
  const defaultCover =
    'https://cdn-icons-png.flaticon.com/512/727/727240.png'; 

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={{ uri: song.cover || defaultCover }} 
        style={styles.cover} 
      />
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {song.artist} • {song.album}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <FontAwesome name="play-circle" size={26} color="#10B981" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#9CA3AF',
    marginTop: 4,
    fontSize: 13,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
});