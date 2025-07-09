import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function RandomIA() {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const [hasPermission, setHasPermission] = useState(false); // This state isn't currently used, consider using it for camera permission handling.
    const [photoPath, setPhotoPath] = useState<string | null>(null); // Estado para guardar la ruta de la foto tomada

    // Función para tomar la foto
    const takePhoto = async () => {
        if (camera.current) {
            try {
                const photo = await camera.current.takePhoto();
                console.log("Foto tomada:", photo.path);
                setPhotoPath(photo.path); // Guarda la ruta de la foto en el estado
            } catch (error) {
                console.error("Error al tomar la foto:", error);
            }
        }
    };

    // You currently have this commented out. For a robust camera app,
    // you should handle camera permissions explicitly.
    // React.useEffect(() => {
    //     (async () => {
    //         const status = await Camera.requestCameraPermission();
    //         setHasPermission(status === 'granted');
    //     })();
    // }, []);

    if (device == null) { // Check if device is null before rendering Camera
        return (
            <View style={styles.container}>
                <Text>Cargando cámara...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!photoPath ? ( // Only show camera if no photo has been taken
                <>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device!}
                        isActive={true}
                        ref={camera}
                        photo={true} // Habilita la captura de fotos
                    />

                    {/* Rectángulo de guía en el centro */}
                    <View style={styles.guidelineRect} />

                    {/* Close Button (Top Left) */}
                    <TouchableOpacity style={styles.closeButton} onPress={() => {
                        console.log("Close button pressed");
                        router.back();
                    }}>
                        <View style={styles.iconBackground}>
                            <Icon source="close" size={24} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Rotate Screen Button (Top Right) */}
                    <TouchableOpacity style={styles.rotateButton} onPress={() => {
                        console.log("Rotate button pressed");
                    }}>
                        <View style={styles.iconBackground}>
                            <Icon source="flash" size={24} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Botón para tomar la foto */}
                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        {/* The inner circle for the capture button */}
                        <View style={styles.captureButtonInnerCircle} />
                    </TouchableOpacity>
                </>
            ) : (
                /* Mostrar la foto tomada */
                <View style={styles.previewContainer}>
                    <Image source={{ uri: `file://${photoPath}` }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoPath(null)}>
                        <Text style={styles.buttonText}>Tomar Otra</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    closeButton: {
        position: 'absolute',
        top: 60, // Adjust top spacing as needed
        left: 20, // Adjust left spacing as needed
        zIndex: 1, // Ensure it's above the Camera view
    },
    rotateButton: {
        position: 'absolute',
        top: 60, // Adjust top spacing as needed
        right: 20, // Adjust right spacing as needed
        zIndex: 1, // Ensure it's above the Camera view
    },
    iconBackground: {
        backgroundColor: 'rgba(0,0,0,0.5)', // Optional: Add a semi-transparent background for better visibility
        borderRadius: 50, // Make it circular
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        position: 'absolute',
        bottom: 100,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInnerCircle: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: 'white',
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    previewContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
    },
    retakeButton: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        opacity: 0.8,
        marginBottom: 50,
    },
    // Nuevo estilo para el rectángulo de guía
    guidelineRect: {
        position: 'absolute',
        width: '90%', // Ajusta el ancho según sea necesario
        height: 250, // Ajusta la altura según sea necesario para un DNI
        borderWidth: 2,
        borderColor: 'white', // Color del borde del rectángulo
        borderRadius: 10, // Bordes ligeramente redondeados
        zIndex: 0, // Asegúrate de que esté debajo de los botones pero sobre la cámara
    },
})