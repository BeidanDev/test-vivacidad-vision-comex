import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Avatar, Button, Card, FAB, Text } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useRef } from 'react';
import AppBarRegister from '@/components/AppBarRegister';

export default function TabTwoScreen() {
  const { height } = useWindowDimensions();
  
  const camera = useRef<Camera>(null)
  const cameraProps = useCameraDevice('back')

  return (
    <>
      <AppBarRegister />
        <ThemedView style={styles.container}>
          <ThemedView
              style={{
                  alignItems: 'center',
                  marginTop: height * 0.03,
                  marginBottom: height * 0.02
              }}
          >
              <Text variant="headlineLarge">Fotos de su DNI</Text>
          </ThemedView>
          {/* <Camera
            ref={camera}
            device={cameraProps!}
            isActive={true}
          /> */}
          <Text variant="titleMedium">Frontal</Text>
          <Card style={{ width: '100%', height: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <FAB
              icon="camera"
              size="large"
              onPress={() => console.log('Foto Frontal DNI')}
            />
          </Card>

          <Text variant="titleMedium">Dorsal</Text>
          <Card style={{ width: '100%', height: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <FAB
              icon="camera"
              size="large"
              onPress={() => console.log('Foto Dorsal DNI')}
            />
          </Card>

          <ThemedView style={{ marginTop: height * 0.02 }}>
              <Button
                  mode="contained"
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  onPress={() => console.log('Confirmar DNI')}
              >
                  Confirmar
              </Button>
          </ThemedView>
        </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonContent: {
    height: 52,
    paddingHorizontal: 28,
  },
  buttonLabel: {
      fontSize: 16.5,
  },
});
