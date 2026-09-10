import { Color } from '@/constants/theme';
import { MockStripeBackend } from '@/services/mockStripeService';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import styles from './styles';

export type PurchaseFlowState =
    | 'idle'
    | 'store_charging'        // Step 1: Talking to Stripe / App Store
    | 'pending_confirmation'  // Step 2: Store charged, but Backend has NOT yet confirmed
    | 'active';               // Step 3: Backend confirmed entitlement

export interface EntitlementRecord {
    tierId: string;
    transactionId: string;
    grantedAt: number;
    expiresAt: number;
    status: 'active' | 'expired';
}

const STORAGE_KEYS = {
    STORE_LEDGER: '@mock_store_ledger_v1',
    BACKEND_ENTITLEMENT: '@mock_backend_entitlement_v1',
};

const PRODUCT = {
    id: 'fan_all_access_monthly',
    name: 'FanSuite All-Access Pass',
    priceString: '$4.99 / month',
    badge: 'SIMULATED BILLING',
    benefits: [
        'Unrestricted 1-on-1 direct chat',
        'Send HD photos & media attachments',
        'Bypass length limitations & priority delivery',
    ],
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export default function ProductScreen() {

    const router = useRouter();

    const [flowState, setFlowState] = useState<PurchaseFlowState>('idle');
    const [confirmedAccess, setConfirmedAccess] = useState<EntitlementRecord | null>(null);
    const [pendingTxId, setPendingTxId] = useState<string | null>(null);
    const [lastActionLog, setLastActionLog] = useState<string>('Ready for testing');

    // Tap Guard: prevents repeated taps from creating parallel purchase flows
    const isOperationLockedRef = useRef<boolean>(false);

    // Load existing confirmed access on mount
    useEffect(() => {
        hydrateEntitlement();
    }, []);

    const hydrateEntitlement = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.BACKEND_ENTITLEMENT);
            if (raw) {
                const parsed: EntitlementRecord = JSON.parse(raw);
                if (parsed.expiresAt > Date.now() && parsed.status === 'active') {
                    setConfirmedAccess(parsed);
                } else {
                    setConfirmedAccess(null);
                }
            }
        } catch (e) {
            console.error('Hydration error', e);
        }
    };


    /**
     * Core Purchase engine with honest 2-step confirmation
     * @param mode 
     * @returns 
     */
    const executeBillingAction = async (
        mode: 'success' | 'cancel' | 'fail' | 'delayed_success'
    ) => {

        // Point 1: Prevent repeated taps from starting duplicate purchase flows
        if (isOperationLockedRef.current) {
            Alert.alert('Processing', 'A transaction is already in progress. Please wait.');
            return;
        }

        isOperationLockedRef.current = true;

        try {
            // STEP 1: Simulate Native Store / Stripe Payment Sheet
            setFlowState('store_charging');
            setLastActionLog('Step 1: Contacting payment provider...');
            await delay(1200);

            if (mode === 'cancel') {
                // Point 2: Demonstrate cancellation
                setLastActionLog('Payment canceled by user. No funds captured.');
                Alert.alert('Purchase Canceled', 'You dismissed the payment sheet.');
                return;
            }

            if (mode === 'fail') {
                // Point 2 & 4: Demonstrate failure while PRESERVING existing valid access
                setLastActionLog('Card declined: Insufficient funds.');
                Alert.alert(
                    'Payment Failed',
                    'Simulated card was declined. Any existing active access remains completely untouched.'
                );
                return;
            }

            // Store payment succeeds -> Record to Store Ledger
            const newTxId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const storeLedgerRaw = await AsyncStorage.getItem(STORAGE_KEYS.STORE_LEDGER);
            const ledger: string[] = storeLedgerRaw ? JSON.parse(storeLedgerRaw) : [];
            ledger.push(newTxId);
            await AsyncStorage.setItem(STORAGE_KEYS.STORE_LEDGER, JSON.stringify(ledger));

            // Point 3: Honest state display
            // Store payment succeeded, BUT mock backend confirmation is still pending!
            // Grant NO new access yet!
            setFlowState('pending_confirmation');
            setPendingTxId(newTxId);
            setLastActionLog('Step 2: Store charged. Verifying with backend...');

            // Delay backend verification (4 seconds if delayed test, else 1.5 seconds)
            const backendDelayTime = mode === 'delayed_success' ? 4000 : 1500;
            await delay(backendDelayTime);

            // STEP 2: Mock Backend Validates & Grants Entitlement Idempotently
            // Point 4: Repeated events must not create duplicate effects
            const existingRaw = await AsyncStorage.getItem(STORAGE_KEYS.BACKEND_ENTITLEMENT);
            const existing: EntitlementRecord | null = existingRaw ? JSON.parse(existingRaw) : null;

            let updatedRecord: EntitlementRecord;

            if (existing && existing.transactionId === newTxId && existing.status === 'active') {
                // Idempotent hit: do not extend or duplicate
                updatedRecord = existing;
            } else {
                // First-time grant for this transaction
                updatedRecord = {
                    tierId: PRODUCT.id,
                    transactionId: newTxId,
                    grantedAt: Date.now(),
                    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
                    status: 'active',
                };
                await AsyncStorage.setItem(
                    STORAGE_KEYS.BACKEND_ENTITLEMENT,
                    JSON.stringify(updatedRecord)
                );
            }

            // Official grant!
            setConfirmedAccess(updatedRecord);
            setFlowState('active');
            setPendingTxId(null);
            setLastActionLog(`Access confirmed by server! (Tx: ${newTxId})`);
            Alert.alert('Access Granted', 'Your payment was verified by the server.');

            await MockStripeBackend.processWebhookDelivery(newTxId);
            DeviceEventEmitter.emit('ON_PURCHASE_STATE_CHANGED');

        } catch (err: any) {
            setLastActionLog(`Transaction error: ${err?.message || 'Unknown'}`);
            Alert.alert('Error', err?.message || 'Transaction could not be processed.');
        } finally {
            // Unlock debouncing
            isOperationLockedRef.current = false;
            if (flowState !== 'active') {
                setFlowState('idle');
            }
            await hydrateEntitlement();
        }
    };


    /**
     * Restore Purchase
     * @returns 
     */
    const handleRestorePurchases = async () => {
        if (isOperationLockedRef.current) return;
        isOperationLockedRef.current = true;
        setLastActionLog('Checking store ledger for restorable purchases...');

        try {
            await delay(1000);
            const storeLedgerRaw = await AsyncStorage.getItem(STORAGE_KEYS.STORE_LEDGER);
            const ledger: string[] = storeLedgerRaw ? JSON.parse(storeLedgerRaw) : [];

            if (ledger.length === 0) {
                setLastActionLog('No store records found to restore.');
                Alert.alert('Restore Complete', 'No previous purchases found.');
                return;
            }

            // Pick the latest transaction from the ledger
            const latestTxId = ledger[ledger.length - 1];

            // Re-validate against backend
            const restoredRecord: EntitlementRecord = {
                tierId: PRODUCT.id,
                transactionId: latestTxId,
                grantedAt: Date.now(),
                expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
                status: 'active',
            };

            await AsyncStorage.setItem(
                STORAGE_KEYS.BACKEND_ENTITLEMENT,
                JSON.stringify(restoredRecord)
            );
            setConfirmedAccess(restoredRecord);
            setLastActionLog(`Restored transaction ${latestTxId}`);
            Alert.alert('Restored Successfully', 'Your previous subscription has been restored.');
        } finally {
            isOperationLockedRef.current = false;
            await hydrateEntitlement();
        }
    };


    /***
     * Reset Sandbox
     * @requires
     */
    const handleResetSandbox = async () => {
        isOperationLockedRef.current = false;
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.STORE_LEDGER,
            STORAGE_KEYS.BACKEND_ENTITLEMENT,
        ]);
        setConfirmedAccess(null);
        setFlowState('idle');
        setPendingTxId(null);
        setLastActionLog('Sandbox storage completely cleared.');
        Alert.alert('Reset', 'All billing ledgers and entitlements cleared.');


        await MockStripeBackend.resetStorage();

        // Fire event to hide the tab immediately
        DeviceEventEmitter.emit('ON_PURCHASE_STATE_CHANGED');
    };

    const hasActiveAccess = confirmedAccess !== null && confirmedAccess.status === 'active';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Color.white} />


            {/* Top Navigation */}
            <View style={styles.navBar}>
                <Text style={styles.navTitle}>Products</Text>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRestorePurchases}
                    style={styles.restoreBtn}
                >
                    <Text style={styles.restoreBtnText}>Restore</Text>
                </TouchableOpacity>
            </View>


            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Simulated Billing Disclaimer */}
                <View style={styles.disclaimerBadge}>
                    <Octicons name="shield-check" size={14} color={Color.purple} />
                    <Text style={styles.disclaimerText}>{PRODUCT.badge}</Text>
                </View>

                {/* Live Diagnostic Audit Box */}
                <View style={styles.auditBox}>
                    <Text style={styles.auditHeader}>Real-Time Purchase State</Text>
                    <View style={styles.auditRow}>
                        <Text style={styles.auditKey}>Flow State:</Text>
                        <Text style={[styles.auditVal, flowState === 'pending_confirmation' && styles.pendingColor]}>
                            {flowState.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.auditRow}>
                        <Text style={styles.auditKey}>Backend Confirmation:</Text>
                        <Text style={[styles.auditVal, hasActiveAccess ? styles.activeColor : styles.inactiveColor]}>
                            {hasActiveAccess ? 'CONFIRMED (ACCESS UNLOCKED)' : 'NOT GRANTED'}
                        </Text>
                    </View>
                    {pendingTxId && (
                        <View style={styles.auditRow}>
                            <Text style={styles.auditKey}>Pending Tx ID:</Text>
                            <Text style={styles.auditValSmall}>{pendingTxId}</Text>
                        </View>
                    )}
                    <View style={styles.logContainer}>
                        <Text style={styles.logText}>Log: {lastActionLog}</Text>
                    </View>
                </View>

                {/* Honest Pending Confirmation Notice */}
                {flowState === 'pending_confirmation' && (
                    <View style={styles.honestPendingBanner}>
                        <ActivityIndicator size="small" color="#B45309" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.honestPendingTitle}>Payment Succeeded on Device</Text>
                            <Text style={styles.honestPendingSub}>
                                Holding access grant until mock backend server verifies receipt. Access is NOT yet active.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Active Entitlement Notice */}
                {hasActiveAccess && (
                    <View style={styles.activeBanner}>
                        <Ionicons name="checkmark-circle" size={20} color="#059669" />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text style={styles.activeTitle}>Active Fan Subscription</Text>
                            <Text style={styles.activeSub}>
                                Valid until: {new Date(confirmedAccess.expiresAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Product & Price Display */}
                <View style={styles.productCard}>
                    <View style={styles.productHeader}>
                        <View>
                            <Text style={styles.productTitle}>{PRODUCT.name}</Text>
                            <Text style={styles.productPrice}>{PRODUCT.priceString}</Text>
                        </View>
                        <Octicons name="star-fill" size={28} color="#5863DE" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.benefitsList}>
                        {PRODUCT.benefits.map((benefit, idx) => (
                            <View key={idx} style={styles.benefitRow}>
                                <Feather name="check" size={16} color="#10B981" style={{ marginRight: 8 }} />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Testing Section */}
                <Text style={styles.sectionHeader}>Demonstrate Purchase Edge Cases</Text>

                {/* Button 1: Normal Purchase */}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryBtn, flowState !== 'idle' && styles.btnDisabled]}
                    onPress={() => executeBillingAction('success')}
                    disabled={flowState !== 'idle'}
                >
                    {flowState === 'store_charging' ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : flowState === 'pending_confirmation' ? (
                        <Text style={styles.btnText}>Verifying with Server...</Text>
                    ) : (
                        <Text style={styles.btnText}>1. Standard Purchase ($4.99)</Text>
                    )}
                </TouchableOpacity>

                {/* Button 2: Delayed Backend Confirmation */}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.warningBtn, flowState !== 'idle' && styles.btnDisabled]}
                    onPress={() => executeBillingAction('delayed_success')}
                    disabled={flowState !== 'idle'}
                >
                    <Text style={styles.warningBtnText}>2. Test Delayed Confirmation (4s Lag)</Text>
                </TouchableOpacity>

                {/* Button 3: User Cancellation */}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryBtn, flowState !== 'idle' && styles.btnDisabled]}
                    onPress={() => executeBillingAction('cancel')}
                    disabled={flowState !== 'idle'}
                >
                    <Text style={styles.secondaryBtnText}>3. Simulate Cancellation</Text>
                </TouchableOpacity>

                {/* Button 4: Payment Failure */}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn, flowState !== 'idle' && styles.btnDisabled]}
                    onPress={() => executeBillingAction('fail')}
                    disabled={flowState !== 'idle'}
                >
                    <Text style={styles.dangerBtnText}>4. Simulate Failure (Preserve Prior Access)</Text>
                </TouchableOpacity>

                {/* Reset Sandbox Data */}
                <TouchableOpacity style={styles.resetBtn} onPress={handleResetSandbox}>
                    <Text style={styles.resetBtnText}>Clear Sandbox Storage</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
