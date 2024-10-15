import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView, Animated
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SimpleUploadOrCapture = () => {
    const [fileName, setFileName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const [bounceAnim] = useState(new Animated.Value(0));

    const startBounceAnimation = () => {
        Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
            Animated.spring(bounceAnim, { toValue: 0, friction: 4, useNativeDriver: true })
        ]).start();
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
                startBounceAnimation();
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
        if (!fileName) {
            Alert.alert('No File Selected', 'Please upload a file before submitting.');
            return;
        }

        setModalVisible(true);
        setSuccess(false);
        setLoadingMessage('Processing...');

        setTimeout(() => {
            setLoadingMessage('Analyzing content...');
        }, 2000);

        setTimeout(() => {
            setLoadingMessage('Upload successful!');
            setSuccess(true);
        }, 4000);

        setTimeout(() => {
            setModalVisible(false);
            router.push('app2/HomePage');
        }, 6000);
    };

    const handleReset = () => {
        setFileName(null);
    };

    return (
        <LinearGradient colors={['#d8ffb1', '#a8d38d']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.title}>Upload Document</Text>

                <Animated.View style={[styles.uploadArea, { transform: [{ translateY: bounceAnim }] }]}>
                    <FontAwesome5 name={fileName ? "file-alt" : "cloud-upload-alt"} size={80} color="#74b72e" />
                    <Text style={styles.uploadText}>{fileName || "No file selected"}</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
                        <Text style={styles.buttonText}>Select File</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.submitButton]} 
                        onPress={handleSubmit}
                        disabled={!fileName}
                    >
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleReset}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-circle" size={40} color="#597d39" />
                </TouchableOpacity>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{loadingMessage}</Text>
                            {!success ? (
                                <ActivityIndicator size="large" color="#74b72e" />
                            ) : (
                                <FontAwesome5 name="check-circle" size={60} color="#74b72e" />
                            )}
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#597d39',
        textAlign: 'center',
        marginVertical: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    uploadArea: {
        backgroundColor: '#ffffff',
        borderRadius: 25,
        padding: 40,
        alignItems: 'center',
        marginBottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    uploadText: {
        marginTop: 20,
        fontSize: 18,
        color: '#4a4a4a',
        textAlign: 'center',
    },
    uploadButton: {
        backgroundColor: '#74b72e',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        minWidth: 150,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitButton: {
        backgroundColor: '#74b72e',
    },
    resetButton: {
        backgroundColor: '#ff6b6b',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 35,
        left: 10,
        zIndex: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalText: {
        fontSize: 20,
        marginBottom: 25,
        textAlign: 'center',
        color: '#2f2f2f',
        fontWeight: '600',
    },
});

export default SimpleUploadOrCapture;
