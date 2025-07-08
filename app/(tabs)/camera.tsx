import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector';

import { Worklets } from 'react-native-worklets-core';

// Estados del test de vivacidad
type LivenessStep = 'waiting' | 'lookRight' | 'lookLeft' | 'blink' | 'completed';
type LivenessStatus = 'pending' | 'inProgress' | 'completed';

export default function CameraScreen() {
    const device = useCameraDevice('front');
    const [faces, setFaces] = useState<Face[]>([]);
    const [livenessStep, setLivenessStep] = useState<LivenessStep>('waiting');
    const [livenessStatus, setLivenessStatus] = useState<LivenessStatus>('pending');
    const [stepCompleted, setStepCompleted] = useState(false);
    const [stepStartTime, setStepStartTime] = useState<number>(0);
    const [blinkDetected, setBlinkDetected] = useState(false);
    const [lastBlinkTime, setLastBlinkTime] = useState<number>(0);
    const [fps, setFps] = useState<number>(0);
    const [frameCount, setFrameCount] = useState<number>(0);
    const [lastFpsTime, setLastFpsTime] = useState<number>(Date.now());

    const { hasPermission, requestPermission } = useCameraPermission();

    // Configure face detection options
    const faceDetectionOptions = useRef<FaceDetectionOptions>({
        performanceMode: 'fast',
        // performanceMode: 'accurate',
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

    // Función para iniciar el test de vivacidad
    const startLivenessTest = () => {
        setLivenessStatus('inProgress');
        setLivenessStep('lookRight');
        setStepCompleted(false);
        setStepStartTime(Date.now());
        setBlinkDetected(false);
        setLastBlinkTime(0);
    };

    // Función para reiniciar el test
    const resetLivenessTest = () => {
        setLivenessStatus('pending');
        setLivenessStep('waiting');
        setStepCompleted(false);
        setStepStartTime(0);
        setBlinkDetected(false);
        setLastBlinkTime(0);
    };

    // Función para verificar la orientación de la cabeza y parpadeo
    const checkHeadOrientation = (face: Face): LivenessStep | null => {
        const yawAngle = face.yawAngle;
        const currentTime = Date.now();
        const leftEyeOpen = face.leftEyeOpenProbability;
        const rightEyeOpen = face.rightEyeOpenProbability;
        
        // Verificar si el usuario ha mantenido la posición por al menos 1 segundo
        const timeInPosition = currentTime - stepStartTime;
        
        switch (livenessStep) {
            case 'lookRight':
                // En cámara frontal: mirar derecha = yawAngle negativo
                if (yawAngle < -15 && timeInPosition > 1000) {
                    return 'lookLeft';
                }
                break;
            case 'lookLeft':
                // En cámara frontal: mirar izquierda = yawAngle positivo
                if (yawAngle > 15 && timeInPosition > 1000) {
                    return 'blink';
                }
                break;
            case 'blink':
                // Detectar parpadeo: ambos ojos cerrados
                if (leftEyeOpen < 0.3 && rightEyeOpen < 0.3) {
                    if (!blinkDetected) {
                        setBlinkDetected(true);
                        setLastBlinkTime(currentTime);
                    }
                } else if (leftEyeOpen > 0.7 && rightEyeOpen > 0.7 && blinkDetected) {
                    // Ojos abiertos después del parpadeo
                    const timeSinceBlink = currentTime - lastBlinkTime;
                    if (timeSinceBlink > 200 && timeSinceBlink < 1000) { // Parpadeo válido entre 200ms y 1s
                        return 'completed';
                    }
                }
                break;
        }
        return null;
    };

    // Callback function to handle detected faces
    const handleDetectedFaces = Worklets.createRunOnJS((detectedFaces: Face[]) => {
        setFaces(detectedFaces);
        
        // Calcular FPS
        const currentTime = Date.now();
        const newFrameCount = frameCount + 1;
        setFrameCount(newFrameCount);
        
        // Actualizar FPS cada segundo
        if (currentTime - lastFpsTime >= 1000) {
            const newFps = Math.round((newFrameCount * 1000) / (currentTime - lastFpsTime));
            setFps(newFps);
            setFrameCount(0);
            setLastFpsTime(currentTime);
        }
        
        // Solo procesar si el test está en progreso y hay un rostro detectado
        if (livenessStatus === 'inProgress' && detectedFaces.length > 0) {
            const face = detectedFaces[0];
            const nextStep = checkHeadOrientation(face);
            
            if (nextStep && nextStep !== livenessStep) {
                setLivenessStep(nextStep);
                setStepCompleted(true);
                setStepStartTime(Date.now());
                
                if (nextStep === 'lookLeft') {
                    // Transición automática al siguiente paso
                } else if (nextStep === 'blink') {
                    setBlinkDetected(false);
                    setStepStartTime(Date.now());
                } else if (nextStep === 'completed') {
                    setLivenessStatus('completed');
                }
            }
        }
        
        // Log face details for debugging
        detectedFaces.forEach((face, index) => {
            console.log(`Face ${index + 1}:`, {
                bounds: face.bounds,
                leftEyeOpenProbability: face.leftEyeOpenProbability,
                rightEyeOpenProbability: face.rightEyeOpenProbability,
                yawAngle: face.yawAngle,
                faceSize: `${face.bounds.width}x${face.bounds.height}`,
            });
        });
    });

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        
        try {
            const detectedFaces = detectFaces(frame);
            handleDetectedFaces(detectedFaces);
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [handleDetectedFaces, detectFaces]);

    // Obtener instrucciones según el paso actual
    const getInstructions = () => {
        switch (livenessStep) {
            case 'waiting':
                return 'Presione "Iniciar" para comenzar';
            case 'lookRight':
                return 'Mire hacia la DERECHA 👉';
            case 'lookLeft':
                return 'Mire hacia la IZQUIERDA 👈';
            case 'blink':
                return 'PARPADEE los ojos 👀';
            case 'completed':
                return '¡Verificación completada! ✅';
            default:
                return '';
        }
    };

    // Obtener el color del indicador según el estado
    const getStatusColor = () => {
        switch (livenessStatus) {
            case 'pending':
                return '#FFA500'; // Naranja
            case 'inProgress':
                return '#007AFF'; // Azul
            case 'completed':
                return '#34C759'; // Verde
            default:
                return '#FFA500';
        }
    };

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
            
            {/* Overlay de instrucciones */}
            <ThemedView style={styles.instructionsOverlay}>
                <ThemedText type="title" style={styles.instructionTitle}>
                    Verificación de Vivacidad
                </ThemedText>
                
                <ThemedText style={[styles.instructionText, { color: getStatusColor() }]}>
                    {getInstructions()}
                </ThemedText>
                
                {livenessStatus === 'pending' && (
                    <ThemedText onPress={startLivenessTest} style={styles.startButton}>
                        Iniciar
                    </ThemedText>
                )}
                
                {livenessStatus === 'completed' && (
                    <>
                        <ThemedText type="title" style={styles.verifiedText}>
                            ¡VERIFICADO!
                        </ThemedText>
                        <ThemedText onPress={resetLivenessTest} style={styles.resetButton}>
                            Empezar de Nuevo
                        </ThemedText>
                    </>
                )}
            </ThemedView>
            
            {/* Información de debug */}
            {/*
            <ThemedView style={styles.debugOverlay}>
                <ThemedText style={[styles.debugText, styles.fpsText]}>
                    FPS: {fps}
                </ThemedText>
                <ThemedText style={styles.debugText}>
                    Rostros: {faces.length}
                </ThemedText>
                {faces.length > 0 && (
                    <ThemedText style={styles.debugText}>
                        Yaw: {faces[0]?.yawAngle?.toFixed(1)}°
                    </ThemedText>
                )}
                <ThemedText style={styles.debugText}>
                    Estado: {livenessStatus}
                </ThemedText>
                <ThemedText style={styles.debugText}>
                    Paso: {livenessStep}
                </ThemedText>
                {livenessStep === 'blink' && (
                    <ThemedText style={styles.debugText}>
                        Ojo Izq: {(faces[0]?.leftEyeOpenProbability * 100).toFixed(0)}% | Ojo Der: {(faces[0]?.rightEyeOpenProbability * 100).toFixed(0)}%
                    </ThemedText>
                )}
            </ThemedView>
            */}
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
    instructionsOverlay: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    instructionTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instructionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    startButton: {
        backgroundColor: '#007AFF',
        color: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    verifiedText: {
        color: '#34C759',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    resetButton: {
        backgroundColor: '#FF9500',
        color: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    debugOverlay: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 8,
    },
    debugText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 2,
    },
    fpsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00FF00',
    },
});