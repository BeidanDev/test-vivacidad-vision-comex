import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function RandomIA() {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const [hasPermission, setHasPermission] = useState(false);
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

    // if (device == null || !hasPermission) {
    //     return (
    //         <View style={styles.container}>
    //             <Text>Cargando cámara o sin permisos...</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device!}
                isActive={true}
                ref={camera}
                photo={true} // Habilita la captura de fotos
            />

            {/* Botón para tomar la foto */}
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <Text style={styles.buttonText}>Tomar Foto</Text>
            </TouchableOpacity>

            {/* Mostrar la foto tomada */}
            {photoPath && (
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
    },
    captureButton: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 50,
        opacity: 0.8,
        marginBottom: 50,
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