import AsyncStorage from '@react-native-async-storage/async-storage';

export type SendStatus = 'pending' | 'failed' | 'delivered';
export type ErrorActionType = 'retry' | 'edit' | 'upgrade';

export interface ChatMessage {
    id: string;
    clientId: string;
    text?: string;
    sender: 'me' | 'other';
    createdAt: string;
    timestamp: number;
    serverSeq?: number;
    status: SendStatus;
    errorMessage?: string;
    errorAction?: ErrorActionType;
    isGift?: boolean;
    giftAmount?: string;
    mediaUri?: string;
    mediaType?: 'image' | 'video';
    hasAvatar?: boolean;
}

export class MockBackendService {
    private static dropNextResponseMap: Record<string, boolean> = {};

    private static getDbKey(chatId: string): string {
        return `@mock_backend_database_v9_${chatId}`;
    }

    private static getStagingKey(chatId: string): string {
        return `@server_inbound_staging_v9_${chatId}`;
    }

    static setSimulateLostAck(chatId: string, enabled: boolean) {
        this.dropNextResponseMap[chatId] = enabled;
    }

    static getSimulateLostAck(chatId: string): boolean {
        return !!this.dropNextResponseMap[chatId];
    }

    static async getDatabase(chatId: string): Promise<ChatMessage[]> {
        const raw = await AsyncStorage.getItem(this.getDbKey(chatId));
        return raw ? JSON.parse(raw) : [];
    }

    static async saveDatabase(chatId: string, records: ChatMessage[]): Promise<void> {
        await AsyncStorage.setItem(this.getDbKey(chatId), JSON.stringify(records));
    }

    static async getStaging(chatId: string): Promise<ChatMessage[]> {
        const raw = await AsyncStorage.getItem(this.getStagingKey(chatId));
        return raw ? JSON.parse(raw) : [];
    }

    static async saveStaging(chatId: string, records: ChatMessage[]): Promise<void> {
        await AsyncStorage.setItem(this.getStagingKey(chatId), JSON.stringify(records));
    }

    // Processes an incoming message transmission idempotently
    static async processMessagePost(chatId: string, msg: ChatMessage, isOnline: boolean): Promise<ChatMessage> {

        if (!isOnline) {
            throw new Error('NETWORK_DISCONNECTED');
        }

        const db = await this.getDatabase(chatId);
        const existingIndex = db.findIndex((m) => m.clientId === msg.clientId);

        let savedRecord: ChatMessage;

        if (existingIndex !== -1) {
            savedRecord = db[existingIndex];
        } else {
            const maxSeq = db.reduce((acc, curr) => Math.max(acc, curr.serverSeq || 0), 0);
            savedRecord = {
                ...msg,
                id: `srv_${msg.clientId}`,
                serverSeq: maxSeq + 1,
                status: 'delivered',
            };
            db.push(savedRecord);
            await this.saveDatabase(chatId, db);
        }

        // Simulate lost acknowledgment (server saved the item, client response dropped)
        if (this.dropNextResponseMap[chatId]) {
            throw new Error('NETWORK_TIMEOUT_ACK_LOST');
        }

        return savedRecord;
    }

    // Stages inbound messages on the server without delivering them immediately
    static async stageOfflineInbounds(chatId: string, texts: string[], timeFormatter: () => string): Promise<void> {
        const staging = await this.getStaging(chatId);
        let baseTime = Date.now();

        for (const t of texts) {
            baseTime += 100;
            const cid = `inbound_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            staging.push({
                id: cid,
                clientId: cid,
                text: t,
                sender: 'other',
                createdAt: timeFormatter(),
                timestamp: baseTime,
                status: 'delivered',
            });
        }

        await this.saveStaging(chatId, staging);
    }

    // Delivers a single staged inbound item to the server canonical database
    static async deliverNextStagedInbound(chatId: string): Promise<ChatMessage | null> {
        const staging = await this.getStaging(chatId);
        if (staging.length === 0) return null;

        const nextInbound = staging.shift()!;
        const db = await this.getDatabase(chatId);
        const maxSeq = db.reduce((acc, curr) => Math.max(acc, curr.serverSeq || 0), 0);

        nextInbound.serverSeq = maxSeq + 1;
        nextInbound.status = 'delivered';

        db.push(nextInbound);
        await this.saveDatabase(chatId, db);
        await this.saveStaging(chatId, staging);

        return nextInbound;
    }
}

export class ClientOutboxManager {
    private static getQueueKey(chatId: string): string {
        return `@client_pending_outbox_v9_${chatId}`;
    }

    static async getQueue(chatId: string): Promise<ChatMessage[]> {
        const raw = await AsyncStorage.getItem(this.getQueueKey(chatId));
        return raw ? JSON.parse(raw) : [];
    }

    static async saveQueue(chatId: string, queue: ChatMessage[]): Promise<void> {
        await AsyncStorage.setItem(this.getQueueKey(chatId), JSON.stringify(queue));
    }

    static async enqueue(chatId: string, msg: ChatMessage): Promise<void> {
        const queue = await this.getQueue(chatId);
        if (!queue.some((m) => m.clientId === msg.clientId)) {
            queue.push(msg);
            await this.saveQueue(chatId, queue);
        }
    }

    static async update(chatId: string, clientId: string, updates: Partial<ChatMessage>): Promise<void> {
        const queue = await this.getQueue(chatId);
        const idx = queue.findIndex((m) => m.clientId === clientId);
        if (idx !== -1) {
            queue[idx] = { ...queue[idx], ...updates };
            await this.saveQueue(chatId, queue);
        }
    }

    static async remove(chatId: string, clientId: string): Promise<void> {
        const queue = await this.getQueue(chatId);
        await this.saveQueue(chatId, queue.filter((m) => m.clientId !== clientId));
    }
}

export class MockChatServiceUtils {
    static async clearAllData(chatId: string, initialSeed: ChatMessage[]): Promise<void> {
        await AsyncStorage.multiRemove([
            `@mock_backend_database_v9_${chatId}`,
            `@client_pending_outbox_v9_${chatId}`,
            `@server_inbound_staging_v9_${chatId}`,
        ]);
        await MockBackendService.saveDatabase(chatId, initialSeed);
    }
}
