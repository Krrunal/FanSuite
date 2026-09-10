import AsyncStorage from '@react-native-async-storage/async-storage';

export type StripeSubscriptionStatus = 'incomplete' | 'active' | 'past_due' | 'canceled' | 'refunded';

export interface MockStripeCustomer {
    id: string;
    email: string;
    created: number;
}

export interface MockStripeSubscription {
    id: string;
    customerId: string;
    status: StripeSubscriptionStatus;
    planId: string;
    amount: number;
    currency: string;
    currentPeriodEnd: number;
    latestPaymentIntentId: string;
}

export interface MockPaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    status: 'requires_payment_method' | 'processing' | 'succeeded' | 'canceled';
}

const STRIPE_DB_CUSTOMER_KEY = '@mock_stripe_customer_v1';
const STRIPE_DB_SUBSCRIPTION_KEY = '@mock_stripe_subscription_v1';
const STRIPE_DB_INTENTS_KEY = '@mock_stripe_intents_v1';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockStripeBackend {
    // Controls for simulating real-world network edge cases
    static failureTrigger: 'none' | 'card_declined' | 'user_cancel' | 'delayed_webhook' = 'none';

    // 1. Emulate POST /v1/customers & POST /v1/ephemeral_keys
    static async getOrCreateCustomer(email: string): Promise<MockStripeCustomer> {
        const raw = await AsyncStorage.getItem(STRIPE_DB_CUSTOMER_KEY);
        if (raw) return JSON.parse(raw);

        const customer: MockStripeCustomer = {
            id: `cus_${Math.random().toString(36).substring(2, 11)}`,
            email,
            created: Date.now(),
        };
        await AsyncStorage.setItem(STRIPE_DB_CUSTOMER_KEY, JSON.stringify(customer));
        return customer;
    }

    // 2. Emulate POST /v1/subscriptions (starts with incomplete PaymentIntent)
    static async createSubscriptionIntent(planId: string, amount: number) {
        await delay(600);
        const customer = await this.getOrCreateCustomer('user@example.com');
        const intentId = `pi_${Math.random().toString(36).substring(2, 12)}`;

        const paymentIntent: MockPaymentIntent = {
            id: intentId,
            clientSecret: `${intentId}_secret_${Math.random().toString(36).substring(2, 8)}`,
            amount,
            status: 'requires_payment_method',
        };

        const subscription: MockStripeSubscription = {
            id: `sub_${Math.random().toString(36).substring(2, 10)}`,
            customerId: customer.id,
            status: 'incomplete',
            planId,
            amount,
            currency: 'usd',
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            latestPaymentIntentId: intentId,
        };

        await AsyncStorage.setItem(STRIPE_DB_SUBSCRIPTION_KEY, JSON.stringify(subscription));

        const rawIntents = await AsyncStorage.getItem(STRIPE_DB_INTENTS_KEY);
        const intents: MockPaymentIntent[] = rawIntents ? JSON.parse(rawIntents) : [];
        intents.push(paymentIntent);
        await AsyncStorage.setItem(STRIPE_DB_INTENTS_KEY, JSON.stringify(intents));

        return {
            subscriptionId: subscription.id,
            paymentIntentClientSecret: paymentIntent.clientSecret,
            customerId: customer.id,
            ephemeralKeySecret: `ek_test_${Math.random().toString(36).substring(2, 12)}`,
        };
    }

    // 3. Emulate stripe.confirmPayment() / PaymentSheet execution
    static async confirmMockPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
        await delay(1200); // UI bottom sheet loading duration

        if (this.failureTrigger === 'user_cancel') {
            return { success: false, error: 'User canceled Payment Sheet.' };
        }
        if (this.failureTrigger === 'card_declined') {
            return { success: false, error: 'Your card was declined. Insufficient funds.' };
        }

        // Mark payment intent succeeded on mock server
        const rawIntents = await AsyncStorage.getItem(STRIPE_DB_INTENTS_KEY);
        let intents: MockPaymentIntent[] = rawIntents ? JSON.parse(rawIntents) : [];
        intents = intents.map((pi) => (pi.clientSecret === clientSecret ? { ...pi, status: 'succeeded' } : pi));
        await AsyncStorage.setItem(STRIPE_DB_INTENTS_KEY, JSON.stringify(intents));

        return { success: true };
    }

    // 4. Emulate Stripe Webhook delivery (invoice.payment_succeeded -> activate access)
    static async processWebhookDelivery(subscriptionId: string): Promise<MockStripeSubscription> {
        if (this.failureTrigger === 'delayed_webhook') {
            await delay(4500); // Delayed server-to-server webhook simulation
        } else {
            await delay(1000);
        }

        const rawSub = await AsyncStorage.getItem(STRIPE_DB_SUBSCRIPTION_KEY);
        let subscription: MockStripeSubscription = rawSub ? JSON.parse(rawSub) : null;

        if (subscription && subscription.id === subscriptionId) {
            subscription.status = 'active';
            await AsyncStorage.setItem(STRIPE_DB_SUBSCRIPTION_KEY, JSON.stringify(subscription));
        }
        return subscription;
    }

    // 5. Query active entitlement
    static async getCurrentEntitlement(): Promise<MockStripeSubscription | null> {
        const rawSub = await AsyncStorage.getItem(STRIPE_DB_SUBSCRIPTION_KEY);
        if (!rawSub) return null;
        const sub: MockStripeSubscription = JSON.parse(rawSub);
        if (sub.currentPeriodEnd < Date.now()) {
            sub.status = 'canceled';
        }
        return sub;
    }

    // 6. Emulate customer.subscription.deleted / charge.refunded
    static async triggerRefundOrExpiry(action: 'refund' | 'expire'): Promise<void> {
        const rawSub = await AsyncStorage.getItem(STRIPE_DB_SUBSCRIPTION_KEY);
        if (!rawSub) return;
        const sub: MockStripeSubscription = JSON.parse(rawSub);

        if (action === 'refund') {
            sub.status = 'refunded';
        } else {
            sub.status = 'canceled';
            sub.currentPeriodEnd = Date.now() - 1000;
        }
        await AsyncStorage.setItem(STRIPE_DB_SUBSCRIPTION_KEY, JSON.stringify(sub));
    }

    static async resetStorage(): Promise<void> {
        await AsyncStorage.multiRemove([
            STRIPE_DB_CUSTOMER_KEY,
            STRIPE_DB_SUBSCRIPTION_KEY,
            STRIPE_DB_INTENTS_KEY,
        ]);
    }
}
