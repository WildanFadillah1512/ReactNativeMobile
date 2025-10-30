// File: src/context/ChatContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import StyleSheet untuk menghilangkan inline styles
import { View, ActivityIndicator, StyleSheet } from 'react-native'; 

/**
 * 🗨️ Struktur data untuk sebuah pesan chat
 */
export interface Message {
    id: number;
    text: string;
    sender: 'me' | 'seller';
    timestamp: number; // Untuk pengurutan
    itemId?: number; // Opsional, untuk konteks barang jika ada
}

/**
 * 🗂️ Struktur penyimpanan seluruh chat, dikelompokkan berdasarkan sellerId
 * Contoh: { 101: [Message, Message], 102: [Message] }
 */
interface AllChats {
    [sellerId: number]: Message[]; // Menggunakan sellerId sebagai key
}

/**
 * 🔧 Tipe context untuk Chat
 */
interface ChatContextType {
    loading: boolean;
    getMessages: (sellerId: number) => Message[]; // Berdasarkan sellerId
    sendMessage: (sellerId: number, text: string, itemId?: number) => void; // Berdasarkan sellerId
}

// ----------------------------------------------------
// Nilai default untuk createContext
const defaultContextValue: ChatContextType = {
    loading: true,
    getMessages: () => [],
    sendMessage: () => {},
};

/**
 * 🧩 Context pembuatan
 */
const ChatContext = createContext<ChatContextType>(defaultContextValue);
// ----------------------------------------------------


// Ganti nama key penyimpanan agar tidak bentrok dengan data lama
const CHAT_STORAGE_KEY = 'allUserChatsBySellerV2';

/**
 * 💬 Provider utama Chat
 */
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chats, setChats] = useState<AllChats>({});
    const [loading, setLoading] = useState(true);

    // 🔄 Memuat data chat dari penyimpanan lokal (AsyncStorage)
    useEffect(() => {
        const loadChats = async () => {
            try {
                const storedChats = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
                if (storedChats) {
                    setChats(JSON.parse(storedChats));
                }
            } catch (error) {
                console.error('❌ Gagal memuat chat dari penyimpanan:', error);
            } finally {
                setLoading(false);
            }
        };
        loadChats();
    }, []);

    // 💬 Ambil pesan untuk seller tertentu
    const getMessages = (sellerId: number): Message[] => {
        // Urutkan pesan berdasarkan timestamp saat mengambilnya
        return (chats[sellerId] || []).sort((a, b) => a.timestamp - b.timestamp);
    };

    // 🚀 Kirim pesan baru
    const sendMessage = async (sellerId: number, text: string, itemId?: number) => {
        const newMessage: Message = {
            id: Date.now(),
            text,
            sender: 'me',
            timestamp: Date.now(),
            itemId: itemId, 
        };

        const updatedMessages = [...(chats[sellerId] || []), newMessage];
        const updatedChats = { ...chats, [sellerId]: updatedMessages };

        try {
            // Perbarui state lokal
            setChats(updatedChats);
            // Simpan seluruh objek chats ke AsyncStorage
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats)); 
        } catch (error) {
            console.error('❌ Gagal menyimpan pesan:', error);
        }
    };
    
    // ----------------------------------------------------
    // Rendering loading state
    if (loading) {
        return (
            // Menggunakan style dari StyleSheet.create()
            <View style={styles.loadingContainer}> 
                <ActivityIndicator size="large" color="#22d3ee" />
            </View>
        );
    }
    // ----------------------------------------------------

    return (
        <ChatContext.Provider value={{ loading, getMessages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};


export const useChats = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChats must be used within a ChatProvider');
    }
    return context;
};

// --- DEFINISI STYLES ---
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});