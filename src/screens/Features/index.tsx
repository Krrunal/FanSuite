import { Color } from '@/constants/theme';
import {
    SafeAreaView,
    StatusBar,
    Text,
    View
} from 'react-native';
import styles from '../Chat/styles';

export default function FeatureScreen() {

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Color.white} />

            {/* Top Header */}
            <View style={styles.navBar}>
                <Text style={styles.titleText}>Premium Features</Text>
            </View>

            <View style={{ padding: 12 }}>
                <Text>Coming Soon</Text>
            </View>

        </SafeAreaView>
    );
}
