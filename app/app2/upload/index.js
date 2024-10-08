import React, { useState } from 'react';
import {
    View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const SimpleUploadOrCapture = () => {
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [success, setSuccess] = useState(false); 
    const router = useRouter();

    const requestCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    };

    const handleUploadDocument = async () => {
        setLoading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const documentAsset = result.assets[0];
                setFileName(documentAsset.name);
                setFileUri(null);
            } else {
                setFileName(null);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
            setFileName(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCaptureImage = async () => {
        setLoading(true);
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera access is required to capture images.');
            setLoading(false);
            return;
        }
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFileUri(result.assets[0].uri);
                setFileName(null);
            }
        } catch (error) {
            console.error('Error capturing image:', error);
            Alert.alert('Error', 'Failed to capture image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!fileName && !fileUri) {
            Alert.alert('No File Selected', 'Please upload or capture a file before submitting.');
            return;
        }

        setModalVisible(true);
        setSuccess(false);
        setLoadingMessage('Wait, scanning...');

        setTimeout(() => {
            setLoadingMessage('Separating to levels...');
        }, 2000);

        setTimeout(() => {
            setLoadingMessage('Scanning successful!');
            setSuccess(true);
        }, 4000);

        setTimeout(() => {
            setModalVisible(false);
            router.push('app2/HomePage');
        }, 6000);
    };

    const handleReset = () => {
        setFileUri(null);
        setFileName(null);
    };

    const handleBack = () => {
        router.back(); 
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Upload / Capture</Text>
            {loading && <ActivityIndicator size="large" color="#74b72e" style={styles.loading} />}

            <View style={styles.previewContainer}>
                {fileName && (
                    <View style={styles.fileContainer}>
                        <Text style={styles.fileText}>Uploaded Document:</Text>
                        <Text style={styles.fileName}>{fileName}</Text>
                    </View>
                )}
                {fileUri && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: fileUri }} style={styles.image} />
                    </View>
                )}
                {!fileName && !fileUri && !loading && (
                    <Text style={styles.infoText}>No file selected or captured</Text>
                )}
            </View>
            
            {/* Buttons for Upload and Capture */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleUploadDocument}>
                    <Text style={styles.buttonText}>📁 Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleCaptureImage}>
                    <Text style={styles.buttonText}>📸 Capture</Text>
                </TouchableOpacity>
            </View>

            {/* Buttons for Submit and Reset */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>✓ Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.buttonText}>↻ Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Back Button at the bottom */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{loadingMessage}</Text>
                        {!success ? (
                            <ActivityIndicator size="large" color="#74b72e" style={styles.loading} />
                        ) : (
                            <FontAwesome name="check-circle" size={50} color="green" />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#d8ffb1',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginVertical: 30,
        color: '#597d39',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a8d38d',
        paddingVertical: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    submitButton: {
        backgroundColor: '#74b72e',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        right:-30,
    },
    resetButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        left:-40,
        bottom:1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    loading: {
        marginVertical: 20,
    },
    previewContainer: {
        width: '100%',
        minHeight: 250,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#edf4ec',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    fileContainer: {
        marginVertical: 10,
    },
    fileText: {
        fontSize: 18,
        color: '#2f2f2f',
    },
    fileName: {
        fontSize: 16,
        color: '#4a4a4a',
        fontWeight: '600',
    },
    imageContainer: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#2f2f2f',
        borderRadius: 15,
        overflow: 'hidden',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    modalText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#2f2f2f',
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: [{ translateX: -50 }],
        backgroundColor: '#000',
        borderRadius: 20,
        padding: 10,
        elevation: 4,
    },
});

export default SimpleUploadOrCapture;
