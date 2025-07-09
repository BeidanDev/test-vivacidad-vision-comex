import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Icon } from "react-native-paper";
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function RandomIA() {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
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
                    {/* <View style={styles.guidelineRect} /> */}

                    {/* Close Button (Top Left) */}
                    <TouchableOpacity style={getResponsiveStyles(screenWidth, screenHeight).closeButton} onPress={() => {
                        console.log("Close button pressed");
                        router.back();
                    }}>
                        <View style={getResponsiveStyles(screenWidth, screenHeight).iconBackground}>
                            <Icon source="close" size={24} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Rotate Screen Button (Top Right) */}
                    <TouchableOpacity style={getResponsiveStyles(screenWidth, screenHeight).rotateButton} onPress={() => {
                        console.log("Rotate button pressed");
                    }}>
                        <View style={getResponsiveStyles(screenWidth, screenHeight).iconBackground}>
                            <Icon source="flash" size={24} color="white" />
                        </View>
                    </TouchableOpacity>

                    {/* Botón para tomar la foto */}
                    <TouchableOpacity style={getResponsiveStyles(screenWidth, screenHeight).captureButton} onPress={takePhoto}>
                        {/* The inner circle for the capture button */}
                        <View style={getResponsiveStyles(screenWidth, screenHeight).captureButtonInnerCircle} />
                    </TouchableOpacity>
                </>
            ) : (
                /* Mostrar la foto tomada */
                <View style={styles.previewContainer}>
                    <Image source={{ uri: `file://${photoPath}` }} style={styles.previewImage} />
                    <TouchableOpacity style={getResponsiveStyles(screenWidth, screenHeight).retakeButton} onPress={() => setPhotoPath(null)}>
                        <Text style={getResponsiveStyles(screenWidth, screenHeight).buttonText}>Tomar Otra</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={getResponsiveStyles(screenWidth, screenHeight).confirmButton} onPress={() => {
                        console.log("Confirmar", photoPath);
                        // setPhotoPath(photoPath);
                    }}>
                        <Text style={getResponsiveStyles(screenWidth, screenHeight).buttonText}>Confirmar</Text>
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
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    retakeButton: {
        position: 'absolute',
        bottom: 70,
        left: 50,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        opacity: 0.8,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 70,
        right: 50,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        opacity: 0.8,
    },
    // Nuevo estilo para el rectángulo de guía
    // guidelineRect: {
    //     position: 'absolute',
    //     width: '90%', // Ajusta el ancho según sea necesario
    //     height: 250, // Ajusta la altura según sea necesario para un DNI
    //     borderWidth: 2,
    //     borderColor: 'white', // Color del borde del rectángulo
    //     borderRadius: 10, // Bordes ligeramente redondeados
    //     zIndex: 0, // Asegúrate de que esté debajo de los botones pero sobre la cámara
    // },
})

// Estilos dinámicos responsivos
const getResponsiveStyles = (screenWidth: number, screenHeight: number) => ({
    // Botones de preview (ya existentes)
    retakeButton: {
        position: 'absolute' as const,
        bottom: screenHeight * 0.1, // 10% de la altura de la pantalla
        left: screenWidth * 0.1, // 10% del ancho de la pantalla
        backgroundColor: 'white',
        padding: Math.max(12, screenWidth * 0.03), // Padding responsivo mínimo 12px
        borderRadius: 10,
        opacity: 0.8,
    },
    confirmButton: {
        position: 'absolute' as const,
        bottom: screenHeight * 0.1, // 10% de la altura de la pantalla
        right: screenWidth * 0.1, // 10% del ancho de la pantalla
        backgroundColor: 'white',
        padding: Math.max(12, screenWidth * 0.03), // Padding responsivo mínimo 12px
        borderRadius: 10,
        opacity: 0.8,
    },
    buttonText: {
        color: 'black',
        fontSize: Math.max(16, screenWidth * 0.04), // Tamaño de fuente responsivo mínimo 16px
        fontWeight: 'bold' as const,
    },
    // Botones de cámara responsivos
    closeButton: {
        position: 'absolute' as const,
        top: screenHeight * 0.08, // 8% de la altura de la pantalla
        left: screenWidth * 0.05, // 5% del ancho de la pantalla
        zIndex: 1,
    },
    rotateButton: {
        position: 'absolute' as const,
        top: screenHeight * 0.08, // 8% de la altura de la pantalla
        right: screenWidth * 0.05, // 5% del ancho de la pantalla
        zIndex: 1,
    },
    iconBackground: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: Math.max(20, screenWidth * 0.05), // Radio responsivo mínimo 20px
        width: Math.max(40, screenWidth * 0.1), // Ancho responsivo mínimo 40px
        height: Math.max(40, screenWidth * 0.1), // Alto responsivo mínimo 40px
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    captureButton: {
        position: 'absolute' as const,
        bottom: screenHeight * 0.15, // 15% de la altura de la pantalla
        width: Math.max(80, screenWidth * 0.2), // Ancho responsivo mínimo 80px
        height: Math.max(80, screenWidth * 0.2), // Alto responsivo mínimo 80px
        borderRadius: Math.max(40, screenWidth * 0.1), // Radio responsivo mínimo 40px
        borderWidth: Math.max(4, screenWidth * 0.01), // Borde responsivo mínimo 4px
        borderColor: 'white',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    captureButtonInnerCircle: {
        width: Math.max(65, screenWidth * 0.16), // Ancho responsivo mínimo 65px
        height: Math.max(65, screenWidth * 0.16), // Alto responsivo mínimo 65px
        borderRadius: Math.max(32.5, screenWidth * 0.08), // Radio responsivo mínimo 32.5px
        backgroundColor: 'white',
    },
});