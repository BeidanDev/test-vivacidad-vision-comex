import { useRef } from "react";
import { StyleSheet } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function Camara() {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');

    return (
        <Camera
            style={StyleSheet.absoluteFill}
            device={device!}
            isActive={true}
            ref={camera}
            photo={true}
        />
    );
}