import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image, // <-- 1. Import Image
  Pressable, // <-- 2. Import Pressable
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/theme';
import Icon from 'react-native-vector-icons/FontAwesome'; // <-- Untuk social
import FeatherIcon from 'react-native-vector-icons/Feather'; // <-- 3. Import Feather

// Tipe untuk prop navigasi
type RegisterScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

// Ambil logo
const LogoImage = require('../assets/images/logo.png');

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  
  // --- 4. State baru untuk toggle password ---
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Logika handleRegister Anda sudah sempurna
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Input Tidak Lengkap', 'Mohon isi semua field.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Tidak Cocok', 'Password dan konfirmasi password harus sama.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Lemah', 'Password minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      Alert.alert(
        'Registrasi Berhasil',
        'Akun Anda telah dibuat. Silakan login.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registrasi Gagal',
        error.message || 'Email mungkin sudah terdaftar.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. Dummy handler untuk social login ---
  const handleSocialRegister = (provider: string) => {
    Alert.alert(
      'Daftar dengan Sosial',
      `Fitur daftar dengan ${provider} sedang dalam pengembangan.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          {/* --- 6. Header (Branding) --- */}
          <View style={styles.header}>
            <Image source={LogoImage} style={styles.logo} />
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>
              Gabung sekarang dan mulai sewa barang.
            </Text>
          </View>
          
          {/* --- 7. Social Sign-up (Prioritas) --- */}
          <View style={styles.socialLoginContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialRegister('Google')}>
              <Icon name="google" size={20} color="#DB4437" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Daftar dengan Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialRegister('Apple')}>
              <Icon name="apple" size={20} color={COLORS.textPrimary} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Daftar dengan Apple</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU DAFTAR DENGAN EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* --- 8. Form Input (Modern) --- */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <FeatherIcon name="user" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <FeatherIcon name="mail" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Alamat Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <FeatherIcon name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (minimal 6 karakter)"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                returnKeyType="next"
              />
              <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.visibilityToggle}>
                <FeatherIcon 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <FeatherIcon name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
                returnKeyType="done"
              />
              <Pressable onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.visibilityToggle}>
                <FeatherIcon 
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
            </View>

            {/* Tombol Aksi */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.buttonText}>Setuju & Daftar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Navigasi */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity 
              style={styles.footerLinkContainer}
              onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Login di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 9. STYLESHEET BARU (Profesional & Kekinian) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  // --- Style Input Baru ---
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    height: 55,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  // --- Akhir Style Input Baru ---
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Style Social Login ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  socialLoginContainer: {
    width: '100%',
    gap: 12, // Jarak antar tombol
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    height: 50,
    borderRadius: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  // --- Style Footer ---
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLinkContainer: {
    paddingVertical: 4,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});