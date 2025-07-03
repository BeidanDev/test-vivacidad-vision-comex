import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector';

import { Worklets } from 'react-native-worklets-core';

export default function CameraScreen() {
    const device = useCameraDevice('front');
    const [faces, setFaces] = useState<Face[]>([]);

    const { hasPermission, requestPermission } = useCameraPermission();

    // Configure face detection options
    const faceDetectionOptions = useRef<FaceDetectionOptions>({
        // performanceMode: 'fast',
        performanceMode: 'accurate',
        landmarkMode: 'all',
        contourMode: 'all',
        classificationMode: 'all',
        minFaceSize: 0.25,
        trackingEnabled: true,
        autoMode: true,
        windowWidth: 400, // You'll need to get actual screen width
        windowHeight: 800, // You'll need to get actual screen height
        cameraFacing: 'front'
    }).current;

    // Initialize face detector
    const { detectFaces } = useFaceDetector(faceDetectionOptions);

    // Callback function to handle detected faces
    const handleDetectedFaces = Worklets.createRunOnJS((detectedFaces: Face[]) => {
        setFaces(detectedFaces);
        console.log('Faces detected:', detectedFaces.length);
        
        // Log face details for debugging
        detectedFaces.forEach((face, index) => {
            console.log(`Face ${index + 1}:`, {
                bounds: face.bounds,
                leftEyeOpenProbability: face.leftEyeOpenProbability,
                rightEyeOpenProbability: face.rightEyeOpenProbability,
                faceSize: `${face.bounds.width}x${face.bounds.height}`,  // Tamaño del rostro
            });
        });
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        
        try {
            // Detect faces in the frame
            const detectedFaces = detectFaces(frame);
            
            // Send results back to JS thread
            handleDetectedFaces(detectedFaces);
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [handleDetectedFaces, detectFaces]);

    if (device == null) return <ThemedText type="title">NO CAMERA!</ThemedText>

    if (!hasPermission) {
        return (
            <ThemedView style={styles.permissionContainer}>
                <ThemedText type="title">Camera permission is required</ThemedText>
                <ThemedText onPress={requestPermission} style={styles.permissionButton}>
                    Grant Permission
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.cameraContainer}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device!}
                isActive={true}
                frameProcessor={frameProcessor}
            />
            
            {/* Display face detection info */}
            <ThemedView style={styles.infoOverlay}>
                <ThemedText type="title" style={styles.infoText}>
                    Faces detected: {faces.length}
                </ThemedText>
                {faces.length > 0 && (
                    <ThemedText style={styles.infoText}>
                        Left eye open: {(faces[0]?.leftEyeOpenProbability * 100).toFixed(1)}%
                    </ThemedText>
                )}
                {faces.length > 0 && (
                    <ThemedText style={styles.infoText}>
                        Right eye open: {(faces[0]?.rightEyeOpenProbability * 100).toFixed(1)}%
                    </ThemedText>
                )}
                {faces.length > 0 && (
                    <ThemedText style={styles.infoText}>
                        Face bounds: {JSON.stringify(faces[0]?.bounds)}
                    </ThemedText>
                )}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    permissionButton: {
      marginTop: 20,
      color: '#007AFF',
      fontSize: 16,
    },
    cameraContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoOverlay: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 10,
      borderRadius: 8,
    },
    infoText: {
      color: 'white',
      fontSize: 16,
      marginBottom: 5,
    },
});