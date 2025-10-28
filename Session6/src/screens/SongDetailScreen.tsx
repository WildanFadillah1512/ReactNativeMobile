// src/screens/SongDetailScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions, // Untuk mendapatkan lebar layar
  Platform // <-- Sekarang digunakan untuk shadow/elevation
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SongStackParamList } from '../../App';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient'; // <-- Import Gradient
import Slider from '@react-native-community/slider'; // <-- Import Slider

// Tipe untuk props navigasi
type Props = NativeStackScreenProps<SongStackParamList, 'SongDetail'>;

// Aktifkan mode pemutaran
Sound.setCategory('Playback');

// Dapatkan lebar layar untuk styling
const { width } = Dimensions.get('window');

// Fungsi helper untuk format waktu MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 3600 % 60);
  // Pad dengan '0' jika detik < 10
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function SongDetailScreen({ route }: Props) {
  const { song } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State baru untuk durasi dan waktu saat ini
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Efek untuk memuat suara (hanya sekali)
  useEffect(() => {
    const soundInstance = new Sound(song.url, (error) => {
      setIsLoading(false);
      if (error) {
        console.log('failed to load the sound', error);
        Alert.alert('Error', 'Tidak dapat memuat preview lagu.');
        return;
      }
      // Set durasi total saat lagu berhasil dimuat
      setDuration(soundInstance.getDuration());
    });

    soundRef.current = soundInstance;

    return () => {
      // Hapus interval jika ada
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Hapus suara dari memori
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
    };
  }, [song.url]);

  // Efek untuk mengelola interval timer (saat isPlaying berubah)
  useEffect(() => {
    if (isPlaying && soundRef.current) {
      // Mulai interval untuk update UI
      intervalRef.current = setInterval(() => {
        soundRef.current?.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }, 1000) as any; // 'as any' untuk tipe NodeJS.Timeout
    } else {
      // Hentikan interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Cleanup interval saat unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);


  const playPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      soundRef.current.play((success: boolean) => {
        if (success) {
          // Kembali ke awal saat selesai
          soundRef.current?.setCurrentTime(0);
          setCurrentTime(0);
          setIsPlaying(false);
        } else {
          Alert.alert('Error', 'Gagal memutar audio.');
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    }
  };

  // Fungsi saat slider digeser oleh pengguna
  const onSliderValueChange = (value: number) => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(value);
      setCurrentTime(value); // Update UI langsung
    }
  };

  return (
    // Gunakan LinearGradient sebagai container utama
    <LinearGradient colors={['#404040', '#111']} style={styles.container}>
      
      {/* 1. Cover Art */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: song.cover }} style={styles.cover} />
      </View>

      {/* 2. Info Lagu */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        <Text style={styles.album} numberOfLines={1}>{song.album}</Text>
      </View>

      {/* 3. Kontrol Player */}
      <View style={styles.controlsContainer}>
        {/* Slider */}
        <Slider
          style={styles.slider}
          value={currentTime}
          maximumValue={duration}
          minimumValue={0}
          minimumTrackTintColor={styles.accentColor.color}
          maximumTrackTintColor="#555"
          thumbTintColor={styles.accentColor.color}
          onSlidingComplete={onSliderValueChange}
          disabled={isLoading || duration === 0}
        />
        {/* Waktu */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Tombol Play/Pause */}
        <View style={styles.playButtonContainer}>
          {isLoading ? (
            <ActivityIndicator size={80} color={styles.accentColor.color} />
          ) : (
            <TouchableOpacity onPress={playPause} style={styles.playButton}>
              <Icon 
                name={isPlaying ? "pause-circle-filled" : "play-circle-filled"} 
                size={80} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

    </LinearGradient>
  );
}

// Definisikan warna aksen di satu tempat
const ACCENT_COLOR = '#1DB954'; // Spotify Green (bisa diganti)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    // Mengatur jarak antar elemen utama (cover, info, controls)
    justifyContent: 'space-between', 
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 20,
    // Gunakan Platform.select untuk shadow/elevation yang benar
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  cover: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 16, // Sudut lebih halus
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start', // Rata kiri lebih profesional
    marginTop: 20, // Beri jarak
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    color: '#ddd',
    fontSize: 20,
    fontWeight: '500',
  },
  album: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 4,
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20, // Beri jarak dari bawah
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10, // Beri jarak agar tidak mentok
  },
  timeText: {
    color: '#ccc',
    fontSize: 12,
  },
  playButtonContainer: {
    marginTop: 20, // Jarak dari slider/waktu
    height: 80, // Pastikan area klik cukup
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    opacity: 0.9,
  },
  // Style untuk warna aksen
  accentColor: {
    color: ACCENT_COLOR,
  }
});