import { router } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

export default function AppBarRegister({ routeBack }: { routeBack?: string }) {
    const _goBack = () => router.replace(routeBack as any);

    return (
        <Appbar.Header mode="center-aligned">
            {/* {routeBack && <Appbar.BackAction onPress={_goBack} />} */}
            <Appbar.BackAction onPress={_goBack} disabled={!routeBack} />
            <Appbar.Content 
                title={
                    <Image 
                        source={require('../assets/images/logo-banco-rioja.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                }
            />
        </Appbar.Header>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 200,
    },
});