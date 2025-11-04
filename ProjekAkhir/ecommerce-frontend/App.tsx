import React from 'react';
import { StatusBar } from 'react-native';
// Import provider Anda yang sudah ada
import { AddressProvider } from './src/context/AddressContext';
import { ChatProvider } from './src/context/ChatContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { LikeProvider } from './src/context/LikeContext';
import { CartProvider } from './src/context/CartContext';

// 1. IMPORT AUTH PROVIDER BARU ANDA
import { AuthProvider } from './src/context/AuthContext';

// Import navigator Anda
import RootNavigator from './src/navigation/RootNavigator';


export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <LikeProvider>
                    <ChatProvider>
                        <AddressProvider>
                            <ReviewProvider>
                                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                                <RootNavigator />                  
                            </ReviewProvider>
                        </AddressProvider>
                    </ChatProvider>
                </LikeProvider>
            </CartProvider>
        </AuthProvider>
    );
}