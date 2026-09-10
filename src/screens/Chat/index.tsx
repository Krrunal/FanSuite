import { BASE_CHATS, ChatItem } from '@/constants/data';
import { Color } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ChatMessage,
    ClientOutboxManager,
    MockBackendService
} from '../../services/chatMockService';

import styles from './styles';

const MEDIA = require('../../assets/Avatar.png');

const formatRelativeTime = (timestamp: number): string => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - timestamp) / 1000);

    if (diff < 30) return '· just now';
    if (diff < 60) return `· ${diff}s ago`;
    if (diff < 3600) return `· ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `· ${Math.floor(diff / 3600)}h ago`;
    return `· ${Math.floor(diff / 86400)}d ago`;
};

const formatMessageSnippet = (msg: ChatMessage): string => {
    const isMe = msg.sender === 'me';
    const prefix = isMe ? 'You: ' : '';

    if (msg.isGift) {
        return `${prefix}Sent a ${msg.giftAmount || '$50.00'} gift`;
    }
    if (msg.mediaUri) {
        return `${prefix}📷 Photo`;
    }
    if (msg.text) {
        const singleLine = msg.text.replace(/\n/g, ' ');
        return `${prefix}${singleLine}`;
    }
    return `${prefix}Message`;
};

export default function ChatListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState<ChatItem[]>(BASE_CHATS);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const router = useRouter();

    const refreshChatSummaries = useCallback(async () => {
        try {
            const updated = await Promise.all(
                BASE_CHATS.map(async (chat) => {
                    const serverDb = await MockBackendService.getDatabase(chat.id);
                    const outbox = await ClientOutboxManager.getQueue(chat.id);

                    const filteredServer = serverDb.filter(
                        (srv) => !outbox.some((out) => out.clientId === srv.clientId)
                    );
                    const allMessages = [...filteredServer, ...outbox].sort(
                        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
                    );

                    if (allMessages.length > 0) {
                        const top = allMessages[0];
                        return {
                            ...chat,
                            lastMessage: formatMessageSnippet(top),
                            time: formatRelativeTime(top.timestamp || Date.now()),
                            timestamp: top.timestamp || 0,
                        };
                    }
                    return chat;
                })
            );

            updated.sort((a, b) => b.timestamp - a.timestamp);
            setChats(updated);
        } catch (e) {
            console.error('Failed to update chat summaries:', e);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshChatSummaries();
            // Reset selection when navigating back to list
            setSelectedId(null);
        }, [refreshChatSummaries])
    );

    const filteredChats = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.username.toLowerCase().includes(q) ||
                c.lastMessage.toLowerCase().includes(q)
        );
    }, [chats, searchQuery]);

    const handleOpenDetails = (chatItem: ChatItem) => {
        router.push({
            pathname: '/details',
            params: {
                id: chatItem.id,
                name: chatItem.name,
                username: chatItem.username,
            },
        });
    };

    const renderChatItem = ({ item }: { item: ChatItem }) => {
        const isSelected = item.id === selectedId;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.chatRow, isSelected && styles.selectedChatRow]}
                onPress={() => handleOpenDetails(item)}
                onPressIn={() => setSelectedId(item.id)}
            >
                {/* Main User Avatar */}
                <View style={styles.avatarContainer}>
                    <Image source={MEDIA} style={styles.avatar} />
                    <View style={styles.avatarBadge} />
                </View>

                {/* Sender & Snippet */}
                <View style={styles.contentContainer}>
                    <View style={styles.headerLine}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.usernameText} numberOfLines={1}>
                            {' '}{item.username}
                        </Text>
                    </View>
                    <View style={styles.messageLine}>
                        <Text style={styles.messageText} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                </View>

                {/* Trailing Indicators */}
                <View style={styles.trailingContainer}>
                    <Image source={MEDIA} style={styles.miniAvatar} />
                    <View style={styles.statusDotsRow}>
                        <View style={styles.dot1} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Color.white} />

            {/* Top Header */}
            <View style={styles.navBar}>
                <Text style={styles.titleText}>Chats</Text>
            </View>

            {/* Search Bar + Filter Button */}
            <View style={styles.searchSection}>
                <View style={styles.searchFieldWrapper}>
                    <Feather name="search" size={20} color={Color.placeholder} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search messages or users"
                        placeholderTextColor={Color.placeholder}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="filter-variant" size={22} color={Color.black} />
                </TouchableOpacity>
            </View>

            {/* Virtualized Chat List */}
            <FlatList
                data={filteredChats}
                extraData={selectedId}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>No conversations found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
