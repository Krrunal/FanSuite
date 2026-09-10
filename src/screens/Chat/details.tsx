import {
    Feather,
    Ionicons,
    MaterialIcons,
    Octicons
} from '@expo/vector-icons';

import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
    AccessibilityInfo,
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import {
    ChatMessage,
    ClientOutboxManager,
    MockBackendService,
    MockChatServiceUtils
} from '../../services/chatMockService';

import { SAMPLE_TEXTS_LINE1, SAMPLE_TEXTS_LINE2 } from '@/constants/data';
import { Color } from '@/constants/theme';
import styles from './styles';


const MEDIA_PREVIEW =
    'https://www.pugpig.com/wp-content/uploads/sites/3/2025/01/videodeck-co-YWlgKvmY0Lw-unsplash-e1735908994498.jpg?w=150&auto=format&fit=crop&q=80';

const MEDIA = require("../../assets/Avatar.png");
const MEDIA_1 = require("../../assets/Avatar-1.png");

const TOTAL_HISTORY_COUNT = 50000;
const PAGE_SIZE = 30;

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

/**
 * Message Time Format
 * @param date 
 * @returns 
 */
const formatMessageTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
};


/**
 * Get Initial Message Feed while loading details with 
 * static data
 * @returns 
 */
const getInitialSeedMessages = (): ChatMessage[] => {
    const now = Date.now();

    const t1 = now - 10 * 60 * 1000; // 10 mins ago (Earliest)
    const t2 = now - 8 * 60 * 1000;  // 8 mins ago
    const t3 = now - 5 * 60 * 1000;  // 5 mins ago
    const t4 = now - 2 * 60 * 1000;  // 2 mins ago (Most recent seed)

    return [
        {
            id: '1',
            clientId: 'seed-1',
            sender: 'other',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ultrices aliquam turpis in rhoncus. Morbi et risus nunc. Cras nulla quam, iaculis ut nisl sed, commodo efficitur arcu.',
            createdAt: formatMessageTime(new Date(t1)),
            timestamp: t1,
            status: 'delivered',
            serverSeq: 1,
        },
        {
            id: '2',
            clientId: 'seed-2',
            sender: 'me',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ultrices aliquam turpis in rhoncus. Morbi et risus nunc. Cras nulla quam, iaculis ut nisl sed, commodo efficitur arcu.',
            createdAt: formatMessageTime(new Date(t2)),
            timestamp: t2,
            status: 'delivered',
            serverSeq: 2,
        },
        {
            id: '3',
            clientId: 'seed-3',
            sender: 'me',
            mediaUri: MEDIA_PREVIEW,
            mediaType: 'video',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ultrices aliquam turpis in rhoncus. Morbi et risus nunc. Cras nulla quam, iaculis ut nisl sed, commodo efficitur arcu.',
            createdAt: formatMessageTime(new Date(t3)),
            timestamp: t3,
            status: 'delivered',
            serverSeq: 3,
        },
        {
            id: '4',
            clientId: 'seed-4',
            sender: 'me',
            isGift: true,
            giftAmount: '$50.00',
            createdAt: formatMessageTime(new Date(t4)),
            timestamp: t4,
            status: 'delivered',
            serverSeq: 4,
        },
    ];
};

/**
 * Get 50K+ Rows 
 * for test app performance, load it through pagination and a virtualized list
 * @param offset 
 * @param limit 
 * @returns 
 */
const fetchHistoricalPage = (offset: number, limit: number): ChatMessage[] => {
    const items: ChatMessage[] = [];
    const baseAnchorTime = 1700000000000;

    for (let i = 0; i < limit; i++) {
        const seqIndex = offset + i;
        if (seqIndex >= TOTAL_HISTORY_COUNT) break;

        const seed = seqIndex + 1;
        const line1Idx = Math.floor(seededRandom(seed * 3) * SAMPLE_TEXTS_LINE1.length);
        const line2Idx = Math.floor(seededRandom(seed * 7) * SAMPLE_TEXTS_LINE2.length);
        const isMe = seededRandom(seed * 11) > 0.5;

        const timeOffset = (seqIndex + 1) * 60000;
        const ts = baseAnchorTime - timeOffset;

        const d = new Date(ts);
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        const createdAt = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

        const text = `[#${TOTAL_HISTORY_COUNT - seqIndex}] ${SAMPLE_TEXTS_LINE1[line1Idx]}\n${SAMPLE_TEXTS_LINE2[line2Idx]}`;

        items.push({
            id: `hist_${seqIndex}`,
            clientId: `hist_${seqIndex}`,
            text,
            sender: isMe ? 'me' : 'other',
            createdAt,
            timestamp: ts,
            status: 'delivered',
            serverSeq: -(seqIndex + 1),
        });
    }

    return items;
};

/**
 * Delay to render inbound Message after online
 * @param ms 
 * @returns 
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


/**
 * Main Chat Details Screens
 * @param param0 
 * @returns 
 */
export default function ChatDetailScreen({
    onBack
}: { onBack?: () => void }) {

    const router = useRouter();
    const params = useLocalSearchParams<{ id?: string; name?: string; username?: string }>();

    const chatId = params.id || '1';
    const recipientName = params.name || 'Ethan Shoots';
    const recipientUsername = params.username || '@ethan_shoots';

    const flatListRef = useRef<FlatList>(null);
    const dropAckRef = useRef(false);
    const isSyncingRef = useRef(false);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedAttachment, setSelectedAttachment] = useState<{ uri: string; name: string } | null>(null);

    const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(true);
    const [forceOffline, setForceOffline] = useState(false);
    const [dropAckEnabled, setDropAckEnabled] = useState(false);

    const [isHistoryEnabled, setIsHistoryEnabled] = useState(false);
    const [historyOffset, setHistoryOffset] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);

    const effectiveOnline = isDeviceConnected && !forceOffline;


    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => sub.remove();
    }, []);


    /**
     * Drop ACK Error Toggle Button
     * to check message failure
     */
    const toggleDropAck = () => {
        const nextVal = !dropAckEnabled;
        dropAckRef.current = nextVal;
        setDropAckEnabled(nextVal);
        MockBackendService.setSimulateLostAck(chatId, nextVal);
    };


    /**
     * Current Time for Outbound Message
     * @returns 
     */
    const getCurrentTime = () => {
        const d = new Date();
        let hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    };


    const reconcileThread = useCallback(async () => {
        try {
            const serverMsgs = await MockBackendService.getDatabase(chatId);
            const outboxMsgs = await ClientOutboxManager.getQueue(chatId);

            // Hide confirmed server copies if their outbox copy is still pending or failed
            const filteredServer = serverMsgs.filter(
                (srv) => !outboxMsgs.some((out) => out.clientId === srv.clientId)
            );

            const unified = [...filteredServer, ...outboxMsgs];

            setMessages((prev) => {
                const existingHistory = prev.filter((m) => m.id.startsWith('hist_'));
                const combined = [...existingHistory, ...unified];

                const uniqueMap = new Map<string, ChatMessage>();
                combined.forEach((m) => uniqueMap.set(m.clientId || m.id, m));

                const sorted = Array.from(uniqueMap.values()).sort(
                    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
                );
                return [...sorted].reverse();
            });
        } catch (e) {
            console.error(e);
        }
    }, [chatId]);


    /**
     * Sequential Catch-Up Queue
     * @requires
     */
    const runSequentialCatchUp = useCallback(async () => {
        if (!effectiveOnline || isSyncingRef.current) return;
        isSyncingRef.current = true;

        try {
            while (true) {
                const outbox = await ClientOutboxManager.getQueue(chatId);
                const staging = await MockBackendService.getStaging(chatId);

                const nextOutboxItem = outbox.find((m) => m.status === 'pending');
                const nextInboundItem = staging.length > 0 ? staging[0] : null;

                if (!nextOutboxItem && !nextInboundItem) break;

                const processOutboxNext =
                    nextOutboxItem &&
                    (!nextInboundItem || nextOutboxItem.timestamp <= nextInboundItem.timestamp);

                if (processOutboxNext && nextOutboxItem) {
                    await delay(reduceMotion ? 300 : 800);

                    // Error Check 1: Blocked
                    if (nextOutboxItem.text?.includes('[blocked]')) {
                        await ClientOutboxManager.update(chatId, nextOutboxItem.clientId, {
                            status: 'failed',
                            errorMessage: 'Recipient is not accepting messages from this tier.',
                            errorAction: 'upgrade',
                        });
                        await reconcileThread();
                        break;
                    }

                    // Error Check 2: Character Limit
                    if (nextOutboxItem.text && nextOutboxItem.text.length > 200) {
                        await ClientOutboxManager.update(chatId, nextOutboxItem.clientId, {
                            status: 'failed',
                            errorMessage: 'Character limit (200) exceeded. Tap to edit and trim.',
                            errorAction: 'edit',
                        });
                        await reconcileThread();
                        break;
                    }

                    // Process post through the MockBackendService
                    try {
                        await MockBackendService.processMessagePost(chatId, nextOutboxItem, effectiveOnline);
                        await ClientOutboxManager.remove(chatId, nextOutboxItem.clientId);
                        await reconcileThread();
                    } catch (err: any) {
                        if (err.message === 'NETWORK_DISCONNECTED') {
                            // Stop processing the queue, leave items as 'pending'
                            break;
                        }
                        if (err.message === 'NETWORK_TIMEOUT_ACK_LOST' || dropAckRef.current) {
                            await ClientOutboxManager.update(chatId, nextOutboxItem.clientId, {
                                status: 'failed',
                                errorMessage: 'Response lost in transit. Tap to retry safely.',
                                errorAction: 'retry',
                            });
                            await reconcileThread();
                            break;
                        }
                    }
                } else if (nextInboundItem) {
                    await delay(reduceMotion ? 300 : 700);
                    await MockBackendService.deliverNextStagedInbound(chatId);
                    await reconcileThread();
                }
            }
        } finally {
            isSyncingRef.current = false;
            await reconcileThread();
        }
    }, [chatId, effectiveOnline, reconcileThread, reduceMotion]);


    /**
     * Connectivity Confirmation
     * @requires
     */
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);
            setIsDeviceConnected(online);
        });
        return () => unsubscribe();
    }, []);


    /**
     * Generate & Render Initail Data with BE SERVICE
     * @requires
     */
    useEffect(() => {
        (async () => {
            // 1. Fetch current network state immediately
            const netState = await NetInfo.fetch();
            const online = Boolean(netState.isConnected && netState.isInternetReachable !== false);
            setIsDeviceConnected(online);

            const rawServer = await MockBackendService.getDatabase(chatId);
            if (!rawServer || rawServer.length === 0) {
                const initialSeed = getInitialSeedMessages().map((m) => ({
                    ...m,
                    id: `${chatId}_${m.id}`,
                    clientId: `${chatId}_${m.clientId}`,
                }));
                await MockBackendService.saveDatabase(chatId, initialSeed);
            }
            await reconcileThread();

            if (online && !forceOffline) {
                await runSequentialCatchUp();
            }
        })();
    }, [chatId, reconcileThread, runSequentialCatchUp, forceOffline]);


    useEffect(() => {
        if (effectiveOnline) {
            runSequentialCatchUp();
        }
    }, [effectiveOnline, runSequentialCatchUp]);


    /**
     * Image Picker for Message
     * @returns 
     */
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access photo gallery is required to send images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const fileName = asset.fileName || asset.uri.split('/').pop() || 'photo.jpg';
            setSelectedAttachment({
                uri: asset.uri,
                name: truncateFileName(fileName, 12),
            });
        }
    };

    /**
     * Add 50+ Row to Message History
     * @requires
     */
    const handleToggleHistory = () => {
        if (isHistoryEnabled) {
            setIsHistoryEnabled(false);
            setHistoryOffset(0);
            setHasMoreHistory(true);
            setMessages((prev) => prev.filter((m) => !m.id.startsWith('hist_')));
        } else {
            setIsHistoryEnabled(true);
            const firstBatch = fetchHistoricalPage(0, PAGE_SIZE);
            setHistoryOffset(PAGE_SIZE);
            setMessages((prev) => {
                const combined = [...firstBatch, ...prev];
                const uniqueMap = new Map<string, ChatMessage>();
                combined.forEach((item) => uniqueMap.set(item.clientId || item.id, item));
                const sorted = Array.from(uniqueMap.values()).sort(
                    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
                );
                return [...sorted].reverse();
            });
        }
    };

    /**
     * Loading More Message while scrolling
     * @returns
     */
    const handleLoadMoreHistory = useCallback(() => {
        if (!isHistoryEnabled || isLoadingMore || !hasMoreHistory) return;

        setIsLoadingMore(true);
        setTimeout(() => {
            const nextBatch = fetchHistoricalPage(historyOffset, PAGE_SIZE);
            if (nextBatch.length === 0 || historyOffset + PAGE_SIZE >= TOTAL_HISTORY_COUNT) {
                setHasMoreHistory(false);
            }

            setHistoryOffset((prev) => prev + PAGE_SIZE);
            setMessages((prev) => {
                const combined = [...nextBatch, ...prev];
                const uniqueMap = new Map<string, ChatMessage>();
                combined.forEach((item) => uniqueMap.set(item.clientId || item.id, item));
                const sorted = Array.from(uniqueMap.values()).sort(
                    (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
                );
                return [...sorted].reverse();
            });
            setIsLoadingMore(false);
        }, 300);
    }, [isHistoryEnabled, isLoadingMore, hasMoreHistory, historyOffset]);


    /**
     * Send OutBound Message
     * @returns 
     */
    const handleSendMessage = async () => {
        const trimmed = inputText.trim();
        if (!trimmed && !selectedAttachment) return;

        const now = Date.now();
        const stableClientId = `cid_${now}_${Math.random().toString(36).substring(2, 7)}`;
        const newMsg: ChatMessage = {
            id: stableClientId,
            clientId: stableClientId,
            text: trimmed || undefined,
            mediaUri: selectedAttachment ? selectedAttachment.uri : undefined,
            mediaType: selectedAttachment ? 'image' : undefined,
            sender: 'me',
            createdAt: getCurrentTime(),
            timestamp: now,
            status: 'pending',
        };

        setInputText('');
        setSelectedAttachment(null);

        await ClientOutboxManager.enqueue(chatId, newMsg);
        await reconcileThread();

        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: !reduceMotion });
        }, 50);

        if (effectiveOnline) {
            runSequentialCatchUp();
        }
    };

    /**
     * Send Gift Button Press
     * currently direct send $50 to user
     */
    const handleSendGift = async () => {
        const now = Date.now();
        const stableClientId = `gift_${now}_${Math.random().toString(36).substring(2, 7)}`;
        const giftMsg: ChatMessage = {
            id: stableClientId,
            clientId: stableClientId,
            sender: 'me',
            isGift: true,
            giftAmount: '$50.00',
            createdAt: getCurrentTime(),
            timestamp: now,
            status: 'pending',
        };

        await ClientOutboxManager.enqueue(chatId, giftMsg);
        await reconcileThread();

        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: !reduceMotion });
        }, 50);

        if (effectiveOnline) {
            runSequentialCatchUp();
        }
    };


    /**
     * Retry Function for Failure Message after Drop ACK: OFF
     * @param clientId 
     * @returns 
     */
    const handleRetryMessage = async (clientId?: string) => {
        if (!clientId) return;
        await ClientOutboxManager.update(chatId, clientId, {
            status: 'pending',
            errorMessage: undefined,
            errorAction: undefined,
        });
        await reconcileThread();

        if (effectiveOnline) {
            runSequentialCatchUp();
        }
    };


    /**
     * Faile Message
     * @param item 
     */
    const handleEditFailedMessage = async (item: ChatMessage) => {
        setInputText(item.text || '');
        await ClientOutboxManager.remove(chatId, item.clientId);
        await reconcileThread();
    };


    /**
     * Inboud 4 Message
     * @requires
     */
    const handleSimulateInboundOffline = async () => {
        const inbounds = [
            'Lorem ipsum dolor sit amet, message 1 (received while offline)',
            'Lorem ipsum dolor sit amet, message 2 (received while offline)',
            'Lorem ipsum dolor sit amet, message 3 (received while offline)',
            'Lorem ipsum dolor sit amet, message 4 (received while offline)',
        ];

        await MockBackendService.stageOfflineInbounds(chatId, inbounds, getCurrentTime);

        if (effectiveOnline) {
            runSequentialCatchUp();
        } else {
            Alert.alert('Inbounds Staged', '4 inbounds staged. Reconnect to watch chronological resolution.');
        }
    };


    /**
     * Clear Message History
     * @returns
     */
    const handleClearAllStorage = () => {
        Alert.alert(
            'Clear Storage',
            'Are you sure you want to clear all chat storage and reset?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        setIsHistoryEnabled(false);
                        setHistoryOffset(0);
                        setIsLoadingMore(false);
                        setHasMoreHistory(true);
                        setMessages([]);

                        const initialSeed = getInitialSeedMessages().map((m) => ({
                            ...m,
                            id: `${chatId}_${m.id}`,
                            clientId: `${chatId}_${m.clientId}`,
                        }));

                        await MockChatServiceUtils.clearAllData(chatId, initialSeed);
                        // await reconcileThread();
                    },
                },
            ]
        );
    };


    /**
     * Render All Message
     * @requires
     */
    const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isMe = item.sender === 'me';
        const isPending = item.status === 'pending';
        const isFailed = item.status === 'failed';

        const isLatestIncoming = !isMe && (index === 0 || messages[index - 1]?.sender !== 'other');

        if (item.isGift) {
            return (
                <View style={[styles.bubbleWrapper, isMe ? styles.alignRight : styles.alignLeft]}>
                    <View style={styles.giftCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.giftIconContainer}>
                                <Feather name="gift" size={20} color={Color.purple} />
                            </View>
                            <Text style={styles.bubbleText}>
                                {isMe ? `You sent a ${item.giftAmount} gift!` : `Sent you a ${item.giftAmount} gift!`}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4 }}>
                            <Text style={[styles.timeTag, isMe ? styles.timeRight : styles.timeLeft]}>
                                {item.createdAt}
                            </Text>
                            {isPending && <ActivityIndicator size="small" color={Color.purple} style={{ marginLeft: 6 }} />}
                        </View>
                    </View>
                </View>
            );
        }

        if (item.mediaUri) {
            const isVideo = item.mediaType === 'video';
            return (
                <View style={[styles.bubbleWrapper, isMe ? styles.alignRight : styles.alignLeft]}>
                    <View style={styles.mediaCard}>
                        <View style={styles.mediaContainer}>
                            <Image source={{ uri: item.mediaUri }} style={StyleSheet.absoluteFill} blurRadius={18} />
                            <Image source={{ uri: item.mediaUri }} style={styles.mediaCenterImage} resizeMode="cover" />
                            {isVideo && (
                                <TouchableOpacity activeOpacity={0.9} style={styles.playButtonCircle}>
                                    <Ionicons name="play" size={26} color={Color.black} style={{ marginLeft: 3 }} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {item.text ? (
                            <View style={styles.mediaTextContainer}>
                                <Text style={[styles.bubbleText, { marginTop: -12 }]}>{item.text}</Text>
                                <Text style={styles.timeTag}>{item.createdAt}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.bubbleRow, isMe ? styles.rowReverse : styles.rowNormal]}>
                {!isMe && isLatestIncoming ? (
                    <Image source={MEDIA_1} style={styles.bubbleAvatar} />
                ) : (
                    !isMe && <View style={styles.avatarSpacer} />
                )}

                <View style={[styles.bubbleCard, isMe ? styles.outgoingCard : styles.incomingCard]}>
                    <Text style={[styles.bubbleText, isMe ? styles.outgoingText : styles.incomingText]}>
                        {item.text}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5, columnGap: 6 }}>
                        <Text style={[styles.timeTag, isMe ? styles.timeRight : styles.timeLeft]}>
                            {item.createdAt}
                        </Text>

                        {isPending && (
                            <View style={styles.waitingPill}>
                                <ActivityIndicator size={10} color={Color.purple} style={{ marginRight: 4 }} />
                                <Text style={styles.waitingText}>Waiting...</Text>
                            </View>
                        )}

                        {isFailed && item.errorAction === 'retry' && (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.failedPill}
                                onPress={() => handleRetryMessage(item.clientId)}
                            >
                                <MaterialIcons name="refresh" size={13} color={Color.red} />
                                <Text style={styles.failedText}>Failed · Tap to retry</Text>
                            </TouchableOpacity>
                        )}

                        {isFailed && item.errorAction === 'edit' && (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.failedPill}
                                onPress={() => handleEditFailedMessage(item)}
                            >
                                <MaterialIcons name="edit" size={13} color={Color.red} />
                                <Text style={styles.failedText}>Tap to Edit</Text>
                            </TouchableOpacity>
                        )}

                        {isFailed && item.errorAction === 'upgrade' && (
                            <View style={styles.failedPill}>
                                <MaterialIcons name="block" size={13} color={Color.red} />
                                <Text style={styles.failedText}>Blocked</Text>
                            </View>
                        )}
                    </View>

                    {isFailed && item.errorMessage ? (
                        <View style={styles.errorExplainerBox}>
                            <Text style={styles.errorExplainerText}>
                                {item.errorMessage}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    };

    /**
     * Image Picker File Name Truncate if too long
     * @param fileName 
     * @param maxLen 
     * @returns 
     */
    const truncateFileName = (fileName: string, maxLen = 12): string => {
        if (!fileName || fileName.length <= maxLen) return fileName;

        const lastDot = fileName.lastIndexOf('.');
        if (lastDot === -1) {
            return `${fileName.slice(0, maxLen - 3)}...`;
        }

        const ext = fileName.slice(lastDot);
        const nameWithoutExt = fileName.slice(0, lastDot);
        const availableChars = maxLen - ext.length - 3;

        if (availableChars <= 2) {
            return `${nameWithoutExt.slice(0, 3)}...${ext}`;
        }

        return `${nameWithoutExt.slice(0, availableChars)}...${ext}`;
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Color.white} />

            {!effectiveOnline && (
                <View style={styles.offlineBanner}>
                    <Feather name="wifi-off" size={14} color={Color.white} style={{ marginRight: 6 }} />
                    <Text style={styles.offlineBannerText}>
                        {!isDeviceConnected ? 'Device is offline (No Connection)' : 'Offline mode active (Simulated)'}
                    </Text>
                </View>
            )}


            {/* Top Header */}
            <View style={[styles.navBar, { justifyContent: 'space-between', borderBottomWidth: 0 }]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.backButton}
                    onPress={() => (onBack ? onBack() : router.back())}
                >
                    <Ionicons name="arrow-back" size={24} color={Color.black} />
                </TouchableOpacity>

                <Text style={[styles.titleText, { flex: 1 }]}>Chat with</Text>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.moreButton}
                >
                    <Feather name="more-vertical" size={20} color={Color.black} />
                </TouchableOpacity>
            </View>


            {/* Test Simulation Controls */}
            <View style={styles.actionToolbar}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.actionBtn, !effectiveOnline && styles.actionBtnActive]}
                    onPress={() => setForceOffline(!forceOffline)}
                >
                    <Text style={[styles.actionBtnText, !effectiveOnline && styles.actionBtnTextActive]}>
                        {effectiveOnline ? 'Network: Online' : 'Network: Offline'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.actionBtn, dropAckEnabled && styles.actionBtnActive]}
                    onPress={toggleDropAck}
                >
                    <Text style={[styles.actionBtnText, dropAckEnabled && styles.actionBtnTextActive]}>
                        {dropAckEnabled ? 'Drop ACK: ON' : 'Drop ACK: OFF'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.actionBtn}
                    onPress={handleSimulateInboundOffline}
                >
                    <Text style={styles.actionBtnText}>+4 Inbounds</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.actionBtn, isHistoryEnabled && styles.historyBtnActive]}
                    onPress={handleToggleHistory}
                >
                    <Text style={[styles.actionBtnText, isHistoryEnabled && styles.historyBtnTextActive]}>
                        {isHistoryEnabled ? `50k (${historyOffset})` : '+50k History'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.actionBtn, styles.clearBtn]}
                    onPress={handleClearAllStorage}
                >
                    <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
            </View>


            {/* Dynamic User Info Bar */}
            <View style={styles.userBanner}>
                <View style={styles.userInfoLeft}>
                    <Image source={MEDIA} style={styles.avatar} />
                    <View style={{ paddingLeft: 8 }}>
                        <Text style={styles.nameText}>{recipientName}</Text>
                        <Text style={[styles.usernameText, { fontWeight: '100' }]}>{recipientUsername}</Text>
                    </View>
                </View>

                <TouchableOpacity activeOpacity={0.9} style={styles.fanAccessBadge}>
                    <Octicons name="star-fill" size={16} color={Color.purple} style={{ marginRight: 6 }} />
                    <Text style={styles.fanAccessText}>Fan in All Access</Text>
                </TouchableOpacity>
            </View>


            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                style={styles.container}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    inverted
                    keyExtractor={(item, index) => item.clientId || item.id || `msg-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatScrollContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={20}
                    maxToRenderPerBatch={15}
                    windowSize={11}
                    removeClippedSubviews={Platform.OS === 'android'}
                    onEndReached={handleLoadMoreHistory}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                            {isLoadingMore ? (
                                <ActivityIndicator size="small" color={Color.purple} />
                            ) : (
                                <Text style={styles.dateSeparator}>
                                    {isHistoryEnabled ? 'Scroll up for older history' : 'Today'}
                                </Text>
                            )}
                        </View>
                    }
                />


                {/* Input Composer Section */}
                <View style={styles.composerAreaOuter}>
                    <View style={styles.composerArea}>
                        <View style={styles.inputRow}>
                            <View style={styles.textInputBox}>
                                {selectedAttachment ? (
                                    <>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={styles.addTagButton}
                                            onPress={handlePickImage}
                                        >
                                            <Ionicons name="add-circle" size={20} color={Color.lightBlack} />
                                        </TouchableOpacity>

                                        <View style={styles.attachmentBadge}>
                                            <Image source={{ uri: selectedAttachment.uri }} style={styles.chipThumbnail} />
                                            <Text style={styles.chipFileName} ellipsizeMode="middle" numberOfLines={1}>
                                                {selectedAttachment.name}
                                            </Text>

                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => setSelectedAttachment(null)}
                                            >
                                                <Ionicons name="close-circle-outline" size={15} color={Color.red} />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        style={styles.addTagButton}
                                        onPress={handlePickImage}
                                    >
                                        <Ionicons name="add-circle" size={20} color={Color.lightBlack} />
                                    </TouchableOpacity>
                                )}

                                <TextInput
                                    style={styles.messageTextInput}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Type a message..."
                                    placeholderTextColor={Color.placeholder}
                                    returnKeyType="send"
                                    onSubmitEditing={handleSendMessage}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={styles.giftActionCircle}
                                onPress={handleSendGift}
                            >
                                <Feather name="gift" size={19} color={Color.purple} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[
                                    styles.sendActionCircle,
                                    !inputText.trim() && !selectedAttachment && { opacity: 0.8 },
                                ]}
                                onPress={handleSendMessage}
                            >
                                <Ionicons name="send" size={17} color={Color.white} style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.composerMetaRow}>
                            <Text style={styles.characterCounter}>{inputText.length}/400</Text>
                            <Text style={styles.availableMeta}>
                                Available messages: <Text style={styles.unlimitedMeta}>Unlimited</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const actionStyles = StyleSheet.create({








});
