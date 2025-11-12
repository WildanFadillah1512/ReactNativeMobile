import React from 'react';
import { StatusBar } from 'react-native';
// Import provider Anda yang sudah ada
import { AddressProvider } from './src/context/AddressContext';
import { ChatProvider } from './src/context/ChatContext';
import { LikeProvider } from './src/context/LikeContext';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';

// --- 1. [BARU] Impor Provider Socket & Notifikasi ---
import { SocketProvider } from './src/context/SocketContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Import navigator Anda
import RootNavigator from './src/navigation/RootNavigator';


export default function App() {
    return (
        // AuthProvider membungkus semua
        <AuthProvider>
            {/* SocketProvider membutuhkan AuthProvider */}
            <SocketProvider>
                {/* NotificationProvider membutuhkan SocketProvider */}
                <NotificationProvider>
                    <CartProvider>
                        <LikeProvider>
                            <ChatProvider>
                                <AddressProvider>
                                    <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                                    <RootNavigator />
                                </AddressProvider>
                            </ChatProvider>
                        </LikeProvider>
                    </CartProvider>
                </NotificationProvider>
            </SocketProvider>
        </AuthProvider>
    );
}