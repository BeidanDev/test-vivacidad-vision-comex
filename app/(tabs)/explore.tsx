import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Card, FAB, Text } from 'react-native-paper';

import AppBarRegister from '@/components/AppBarRegister';
import { ThemedView } from '@/components/ThemedView';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

export default function TabTwoScreen() {
  const { height } = useWindowDimensions();
  
  // Estados para almacenar las rutas de las imágenes capturadas
  const [frontalImagePath, setFrontalImagePath] = useState<string | null>(null);
  const [dorsalImagePath, setDorsalImagePath] = useState<string | null>(null);

  // Función para cargar imágenes desde Secure Storage
  const loadImagesFromStorage = async () => {
    try {
      const frontalPath = await SecureStore.getItemAsync('dni_frontal_image');
      const dorsalPath = await SecureStore.getItemAsync('dni_dorsal_image');
      
      if (frontalPath) {
        setFrontalImagePath(frontalPath);
      }
      if (dorsalPath) {
        setDorsalImagePath(dorsalPath);
      }
    } catch (error) {
      console.error('Error al cargar imágenes desde Secure Storage:', error);
    }
  };

  const clearImages = async () => {
    await SecureStore.deleteItemAsync('dni_frontal_image');
    await SecureStore.deleteItemAsync('dni_dorsal_image');
    setFrontalImagePath(null);
    setDorsalImagePath(null);
    console.log('Imágenes limpiadas');
  };

  // Cargar imágenes cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      loadImagesFromStorage();
    }, [])
  );

  // Cargar imágenes desde Secure Storage al montar el componente
  useEffect(() => {
    loadImagesFromStorage();
  }, []);

  return (
    <>
      <AppBarRegister />
      <ThemedView style={styles.container}>
        <ThemedView
            style={{
                alignItems: 'center',
                // marginTop: height * 0.03,
                // marginBottom: height * 0.02
            }}
        >
            <Text variant="headlineLarge">Fotos de su DNI</Text>
        </ThemedView>

        <Text variant="titleMedium">Frontal</Text>
        { frontalImagePath ? (
          <Card>
            <Card.Cover 
              source={{ uri: `file://${frontalImagePath}` }} 
            />
          </Card>
        ) : (
          <Card style={{ width: '100%', height: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <FAB
              icon="camera"
              size="large"
              onPress={() => router.push({
                pathname: '/RandomIA',
                params: { imageType: 'frontal' }
              })}
            />
          </Card>
        )}

        <Text variant="titleMedium">Dorsal</Text>
        {dorsalImagePath ? (
          <Card>
            <Card.Cover 
              source={{ uri: `file://${dorsalImagePath}` }} 
            />
          </Card>
        ) : (
          <Card style={{ width: '100%', height: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <FAB
              icon="camera"
              size="large"
              onPress={() => router.push({
                pathname: '/RandomIA',
                params: { imageType: 'dorsal' }
              })}
            />
          </Card>
        )}

        <ThemedView>
            <Button
                mode="contained"
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                onPress={clearImages}
            >
                Limpiar
            </Button>
        </ThemedView>

        <ThemedView>
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
