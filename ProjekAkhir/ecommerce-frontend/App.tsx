import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AddressProvider } from './src/context/AddressContext';
import { ChatProvider } from './src/context/ChatContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { LikeProvider } from './src/context/LikeContext';
import { CartProvider } from './src/context/CartContext';
import RootNavigator from './src/navigation/RootNavigator';


export default function App() {
    return (
        <CartProvider>
            <LikeProvider>
                <ChatProvider>
                    <AddressProvider>
                        <ReviewProvider>
                            <NavigationContainer>
                                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                                <RootNavigator />
                            </NavigationContainer>
                        </ReviewProvider>
                    </AddressProvider>
                </ChatProvider>
            </LikeProvider>
        </CartProvider>
    );
}

