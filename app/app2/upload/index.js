import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const SimpleUploadOrCapture = () => {
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [loading, setLoading] = useState(false);
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
        if (fileName) {
            console.log('Submitted Document:', fileName);
        }
        if (fileUri) {
            console.log('Submitted Image URI:', fileUri);
        }
        router.push('app2/3rdPage');
    };

    const handleReset = () => {
        setFileUri(null);
        setFileName(null);
    };

    const handleBack = () => {
        router.back(); // Navigate back to the previous screen
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Upload or Capture</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleUploadDocument}>
                    <FontAwesome name="upload" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Upload PDF/Word</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleCaptureImage}>
                    <FontAwesome name="camera" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Capture Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}> Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.buttonText}> Reset</Text>
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#BCC18D" style={styles.loading} />}

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

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <FontAwesome name="arrow-left" size={20} color="#fff" />
                <Text style={styles.buttonText}> Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 24,
        color: '#333',
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',  // Center the text
        backgroundColor: '#BCC18D',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    submitButton: {
        backgroundColor: '#BCC18D',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 8,
        elevation: 4,
    },
    resetButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 10, // Space between icon and text
    },
    loading: {
        marginVertical: 20,
    },
    previewContainer: {
        width: '100%',
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    fileContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    fileText: {
        fontSize: 18,
        color: '#333',
    },
    fileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#BCC18D',
        marginTop: 8,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'cover',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    infoText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff4d4d', // Adjust color as needed
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginVertical: 20,
        elevation: 4,
        top: 90,
    },
});

export default SimpleUploadOrCapture;
