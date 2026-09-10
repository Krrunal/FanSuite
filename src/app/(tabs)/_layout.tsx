import { Color } from '@/constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { DeviceEventEmitter, Platform, StyleSheet, View } from 'react-native';

const Colors = {
    white: Color.white,
    purple: Color.purple,
    emerald: Color.green,
    black: Color.black,
};

export default function AppTabs() {
    const [hasActiveAccess, setHasActiveAccess] = useState(false);

    const checkAccess = async () => {
        try {
            // Read the exact key written by ProductScreen
            const raw = await AsyncStorage.getItem('@mock_backend_entitlement_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                setHasActiveAccess(parsed.status === 'active' && parsed.expiresAt > Date.now());
            } else {
                setHasActiveAccess(false);
            }
        } catch {
            setHasActiveAccess(false);
        }
    };

    useEffect(() => {
        checkAccess();

        // Listen for immediate events from ProductScreen
        const sub = DeviceEventEmitter.addListener('ON_PURCHASE_STATE_CHANGED', checkAccess);
        return () => sub.remove();
    }, []);

    return (
        <Tabs
            // Key forces Expo Router to remount and show the new tab immediately
            key={hasActiveAccess ? 'unlocked' : 'locked'}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.purple,
                tabBarInactiveTintColor: Colors.black,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Color.border,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingTop: 4,
                    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
                },
            }}
        >
            {/* 1. Chats Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />

            {/* 2. Explore / Products Tab */}
            <Tabs.Screen
                name="product"
                options={{
                    tabBarIcon: ({ color }) => (
                        <Feather
                            name="grid"
                            size={20}
                            color={color}
                        />
                    ),
                }}
            />

            {/* 3. Paywall & Membership Tab */}
            <Tabs.Screen
                name="feature"
                options={{
                    href: hasActiveAccess ? '/feature' : null,
                    tabBarIcon: ({ color, focused }) => (
                        <View style={tabStyles.iconWrapper}>
                            <Ionicons
                                name={focused ? 'pricetags' : 'pricetags-outline'}
                                size={22}
                                color={color}
                            />
                            {hasActiveAccess && <View style={tabStyles.activeBadgeDot} />}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const tabStyles = StyleSheet.create({
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBadgeDot: {
        position: 'absolute',
        top: -1,
        right: -4,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: Colors.emerald,
    },
});
