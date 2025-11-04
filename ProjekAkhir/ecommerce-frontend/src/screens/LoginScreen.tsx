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
  Image,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Tipe untuk prop navigasi
type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void; // <-- Pastikan goBack ada
  };
};

// Ambil logo dari HomeScreen
const LogoImage = require('../assets/images/logo.png');

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Tidak Lengkap', 'Mohon isi email dan password Anda.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      
      // --- INI PERBAIKANNYA ---
      // Setelah login berhasil, tutup modal Login
      navigation.goBack();
      // -------------------------
      
    } catch (error: any) {
      Alert.alert(
        'Login Gagal',
        error.message || 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      'Login Sosial',
      `Fitur login dengan ${provider} sedang dalam pengembangan.`
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
          
          {/* Header (Branding) */}
          <View style={styles.header}>
            <Image source={LogoImage} style={styles.logo} />
            <Text style={styles.title}>PakeSewa</Text>
            <Text style={styles.subtitle}>
              Temukan barang yang anda butuhkan.
            </Text>
          </View>

          {/* Form Input (Modern) */}
          <View style={styles.form}>
            {/* Input Email dengan Ikon */}
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

            {/* Input Password dengan Ikon dan Toggle */}
            <View style={styles.inputContainer}>
              <FeatherIcon name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible} // <-- Dinamis
                returnKeyType="done"
              />
              <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.visibilityToggle}>
                <FeatherIcon 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Tombol Aksi Utama */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login (Penting untuk 2025) */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU LOGIN DENGAN</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialLoginContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
              <Icon name="google" size={20} color="#DB4437" style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
              <Icon name="apple" size={20} color={COLORS.textPrimary} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Navigasi */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity 
              style={styles.footerLinkContainer}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.footerLink}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles (Sudah Benar)
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
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    marginBottom: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 32,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
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