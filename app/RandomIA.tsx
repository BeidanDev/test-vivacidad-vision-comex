import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        backgroundColor: 'black', // Add a background color for when camera isn't ready
    },
    captureButton: {
        position: 'absolute',
        bottom: 100,
        width: 80, // Adjust size as needed
        height: 80, // Adjust size as needed
        borderRadius: 40, // Half of width/height to make it a perfect circle
        borderWidth: 4, // White border
        borderColor: 'white', // White border color
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 50,
    },
    captureButtonInnerCircle: {
        width: 65, // Slightly smaller than the outer circle
        height: 65, // Slightly smaller than the outer circle
        borderRadius: 32.5, // Half of width/height
        backgroundColor: 'white', // Inner circle is white
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
});