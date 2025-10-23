import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App'; // Sesuaikan path

type SuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'Success'>;

export default function SuccessScreen({ navigation }: SuccessScreenProps) {
  
  const handleBackToHome = () => {
    // Kembali ke layar paling awal (HomeScreen) dan reset tumpukan navigasi
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="check" size={60} color="#0f172a" />
        </View>

        <Text style={styles.title}>Pemesanan Berhasil!</Text>
        <Text style={styles.subtitle}>
          Pesanan sewa Anda telah kami terima dan akan segera diproses. Terima kasih telah menggunakan PakeSewa.
        </Text>

        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Text style={styles.homeButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  homeButtonText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
});