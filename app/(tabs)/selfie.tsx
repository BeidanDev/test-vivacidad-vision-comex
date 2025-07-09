import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, FAB, Text } from 'react-native-paper';

import AppBarRegister from '@/components/AppBarRegister';
import { ThemedView } from '@/components/ThemedView';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SelfieScreen() {
  
  const [selfieImagePath, setSelfieImagePath] = useState<string | null>(null);

  const loadImagesFromStorage = async () => {
    try {
      const selfiePath = await SecureStore.getItemAsync('selfie_image');
      
      if (selfiePath) {
        setSelfieImagePath(selfiePath);
      }

    } catch (error) {
      console.error('Error al cargar imágenes desde Secure Storage:', error);
    }
  };

  const clearImages = async () => {
    await SecureStore.deleteItemAsync('selfie_image');
    setSelfieImagePath(null);
    console.log('Imágen selfie limpiada');
  };

  useFocusEffect(
    React.useCallback(() => {
      loadImagesFromStorage();
    }, [])
  );

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
            }}
        >
            <Text variant="headlineLarge">Foto Selfie</Text>
        </ThemedView>

        <Text variant="titleMedium">Selfie</Text>
        { selfieImagePath ? (
          <Card>
            <Card.Cover 
              source={{ uri: `file://${selfieImagePath}` }} 
            />
          </Card>
        ) : (
          <Card style={{ width: '100%', height: '30%', alignItems: 'center', justifyContent: 'center' }}>
            <FAB
              icon="camera"
              size="large"
              onPress={() => router.push({
                pathname: '/RandomIA',
                params: { imageType: 'selfie', device: 'front' }
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
