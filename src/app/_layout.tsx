import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" />

            <Stack.Screen
                name="details"
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}