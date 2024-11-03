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
    const [isGenerated, setIsGenerated] = useState(false); // New state for generation status
    const router = useRouter();

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

    const handleSubmit = () => {
        if (!fileName && !fileUri) {
            Alert.alert('No File Selected', 'Please upload a file before submitting.');
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
            setIsGenerated(true); // Set generation complete
        }, 4000);
    };

    const handleReset = () => {
        setFileUri(null);
        setFileName(null);
        setSuccess(false);
        setIsGenerated(false); // Reset generation status
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}> U𝖕𝖑𝖔𝖆𝖉  o𝓇  C𝖆𝖕𝖙𝖚𝖗𝖊 </Text>

            {/* Start Button */}
            <TouchableOpacity
                style={[
                    styles.startButton,
                    (!fileName && !fileUri) || !isGenerated ? styles.disabledButton : styles.successButton
                ]}
                onPress={() => {
                    if (fileName || fileUri) {
                        router.push('/app2/HomePage'); // Navigate to HomePage only when the Start Button is pressed
                    }
                }}
                disabled={!fileName && !fileUri || !isGenerated}
            >
                <Text style={styles.buttonText}>► Start Quiz</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#74b72e" style={styles.loading} />}

            <View style={styles.previewContainer}>
                {fileName && (
                    <View style={styles.fileContainer}>
                        <Text style={styles.fileText}>𝖀𝖕𝖑𝖔𝖆𝖉𝖊𝖉 𝕯𝖔𝖈𝖚𝖒𝖊𝖓𝖙:</Text>
                        <Text style={styles.fileName}>{fileName}</Text>
                    </View>
                )}
                {fileUri && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: fileUri }} style={styles.image} />
                    </View>
                )}
                {!fileName && !fileUri && !loading && (
                    <Text style={styles.infoText}>No file selected</Text>
                )}
            </View>

            {/* Button for Upload */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleUploadDocument}>
                    <Text style={styles.buttonText}>📁 𝔘𝔭𝔩𝔬𝔞𝔡 </Text>
                </TouchableOpacity>
            </View>

            {/* Buttons for Submit and Reset */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.submitButton, styles.successButton]} // Always green
                    onPress={handleSubmit}
                    disabled={!fileName && !fileUri}
                >
                    <Text style={styles.buttonText}>✓ 𝚂𝔲𝔟𝔪𝔦𝔱 </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.buttonText}>↻ ℜ𝔢𝔰𝔢𝔱 </Text>
                </TouchableOpacity>
            </View>

            {/* Back Button at the bottom */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>◀ 𝔅𝔞𝔠𝔨 </Text>
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
                        {success && (
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
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
        top: 20,
        color: '#354a21',
        textAlign: 'center',
        textShadowColor: '#fee135',
        textShadowOffset: { width: 2, height: 1 },
        textShadowRadius: 5,
    },
    startButton: {
        backgroundColor: '#a8d38d',
        paddingVertical: 10,
        paddingHorizontal: 23,
        borderRadius: 10,
        marginVertical: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a8d38d',
        paddingVertical: 10,
        paddingHorizontal: 23,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        top: 10,
    },
    submitButton: {
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        alignSelf: 'center',
        marginHorizontal: 10,
    },
    successButton: {
        backgroundColor: '#74b72e',
    },
    disabledButton: {
        backgroundColor: 'gray',
    },
    resetButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        alignSelf: 'center',
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#354a21',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        textShadowColor: '#fee135',
    },
    loading: {
        marginVertical: 20,
    },
    previewContainer: {
        width: '100%',
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 3,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
    },
    fileContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    fileText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    fileName: {
        fontSize: 16,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    infoText: {
        fontSize: 16,
        color: '#888',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    closeButtonText: {
        marginTop: 10,
        fontSize: 16,
        color: '#74b72e',
    },
    backButton: {
        backgroundColor: '#e8e8e8',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default SimpleUploadOrCapture;