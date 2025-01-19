import React, {useState, useEffect, useRef} from "react";
import {create} from "zustand";
import {
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {useRouter} from "expo-router";
import {FontAwesome, Ionicons} from "@expo/vector-icons";
import axios from "axios";
import {useNicknameStore} from "../Nickname/index";
import {View, Text, Image, Input, Button, XStack, YStack, Stack} from 'tamagui'
import {ScrollView} from "react-native";
import LottieView from "lottie-react-native";
import { Animated } from "react-native";

export const useQuizStore = create((set) => ({
    quiz: {
        level1: [],
        level2: [],
        level3: [],
        level4: [],
    },
    currentLevel: 1,
    setQuiz: (data) => set({quiz: data}),
    setCurrentLevel: (level) => set({currentLevel: level}),
    reset: () =>
        set({
            quiz: {
                level1: [],
                level2: [],
                level3: [],
                level4: [],
            },
            currentLevel: 1,
        }),
}));

const LoadingAnimation = () => {
    return (
            <LottieView
                source={require('../../../assets/loading-bot.json')}
                autoPlay
                loop
                style={{
                    width: 200,
                    height: 200,
                }}
            />
    );
};

const CustomDropzone = ({ onPress, fileName, isLoading }) => {
    return (
        <YStack width="100%" mt={'$4'}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <YStack
                    borderWidth={2}
                    borderColor="$gray6"
                    borderStyle="dashed"
                    borderRadius="$4"
                    backgroundColor="white"
                    minHeight={300}
                    alignItems="center"
                    justifyContent="center"
                    padding="$4"
                    space="$2"
                >

                    {fileName ? (
                        <View gap={"$1"} borderRadius={20} justifyContent={'center'}>
                            <Ionicons name="document" size={140} color="#7fb0fa" />
                            <Text fontSize={14} color={"7fb0fa"} mt="$2" textAlign={'center'}>
                                {fileName}
                            </Text>
                        </View>
                    ): (
                        <>
                            <Ionicons name="add-circle" size={48} color="#dedcdc" />

                            <Stack
                                borderWidth={1}
                                borderColor="$blue8"
                                borderRadius="$2"
                                paddingVertical="$2"
                                paddingHorizontal="$4"
                                marginTop="$2"
                            >
                                <Text color="$blue8" fontSize={18}>
                                    Browse from your files
                                </Text>
                            </Stack>
                    </>
                    )}
                </YStack>
            </TouchableOpacity>
        </YStack>
    );
};


const SimpleUploadOrCapture = () => {
    const [fileUri, setFileUri] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileResult, setFileResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false); // New state for generation status
    const [generatedQuestions, setGeneratedQuestions] = useState([]); // Added state for questions
    const router = useRouter();
    const nickname = useNicknameStore(state => state.nickname);
    const [textOpacity, setTextOpacity] = useState(1);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    //zustand
    const {setQuiz} = useQuizStore();

    const loadingMessages = [
        "Reading through your documents with superhuman speed...",
        "Analyzing every detail to craft the perfect response...",
        "Our AI is working its magic, just a moment..."
    ];

    const handleUploadDocument = async () => {
        console.log("Starting...");
        try {
            console.log("Before Documentpicker");
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf"],
            });
            console.log("After Documentpicker result: ", result);
            const selectedUri = result.assets?.[0]?.uri;
            const selectedName = result.assets?.[0]?.name;

            console.log("File selected - URI:", selectedUri);
            setFileUri(selectedUri);
            setFileName(selectedName);
            setFileResult(result);
        } catch (error) {
            console.error("Error uploading document:", error);
            Alert.alert("Error", "Failed to upload the file. Please try again.");
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    const handleSubmit = async () => {
        if (!fileUri || !fileResult) {
            Alert.alert("Error", "No file selected for upload.");
            return;
        }

        setModalVisible(true);
        setLoadingMessage("Processing PDF...");
        try {
            const file = fileResult.assets[0];

            // First get the base64 data of the file
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const base64Promise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    // Remove the data:application/pdf;base64, part
                    const base64 = reader.result.split(",")[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const base64Data = await base64Promise;
            console.log("Base64 data length:", base64Data.length);

            // Send the base64 data to server
            const uploadResponse = await axios.post(
                "https://quizwhirl-production.up.railway.app/api/parse-pdf-text",
                {
                    file: base64Data,
                    filename: file.name,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Server response:", uploadResponse.data);

            if (uploadResponse.data.error) {
                throw new Error(uploadResponse.data.error);
            }

            setQuiz(uploadResponse.data);
            setLoadingMessage("Text extracted successfully!");
            setSuccess(true);
            setIsGenerated(true);
        } catch (error) {
            console.error("Processing Error:", error);
            Alert.alert("Error", "Failed to extract text from PDF");
        } finally {
            if (!success) {
                setModalVisible(false);
            }
        }
    };

    const handleReset = () => {
        setFileUri(null);
        setFileName(null);
        setGeneratedQuestions([]);
        setSuccess(false);
        setIsGenerated(false);
    };

    const handleBack = () => {
        router.back();
    };

    const handleChangeNickname = () => {
        useNicknameStore.getState().setIsEditing(true);
        router.push("app2/Nickname");
    };

    useEffect(() => {
        if (modalVisible) {
            // Text rotation
            const rotationInterval = setInterval(() => {
                setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }, 3000);

            // Pulse animation
            const pulse = Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]);

            Animated.loop(pulse).start();

            return () => {
                clearInterval(rotationInterval);
                fadeAnim.setValue(1);
            };
        }
    }, [modalVisible, fadeAnim]);

    return (
        <View flex={1} h={'100%'} paddingHorizontal={'$4'}>
            <SafeAreaView>
                <View paddingVertical={'$4'}>
                 <View flexDirection={'row'} gap={'$2'}>
                     <Image
                         source={{ uri: "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,q_auto,w_720/67344c866c473c001d68c113.png" }}
                         width={60}
                         height={60}
                         borderRadius={100}
                     />
                     <View>
                         <Text fontSize={20} fontWeight={800} color={'black'}>Hey, {nickname}</Text>
                         <Text mt={"$1"} fontSize={16} fontWeight={600} color={'black'}>Upload your study material and I'll create a personalized quiz for you</Text>
                     </View>
                 </View>
                    {!isGenerated ? (
                        <>
                        <CustomDropzone
                            onPress={handleUploadDocument}
                            fileName={fileName}
                            isLoading={loading}
                        />


                        <View flexDirection={'row'} justifyContent={'center'} gap={'$2'}>

                            <Button size="$5" mt={'$4'} width={'50%'} backgroundColor={'#27ae60'}
                                    onPress={handleSubmit}                 disabled={!fileName && !fileUri}>Submit</Button>
                            <Button size="$5" mt={'$4'} backgroundColor={'#db1818'} width={'50%'}
                                    onPress={handleReset}>Reset</Button>
                        </View>
                            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5" mt={'$2'}
                                    onPress={handleChangeNickname}>Change Nickname</Button>

                        </>
                    ) : (
                        <>
                        {/* Start Button */}
                        <TouchableOpacity
                            style={[
                                styles.startButton,
                                (!fileName && !fileUri) || !isGenerated
                                    ? styles.disabledButton
                                    : styles.successButton,
                            ]}
                            onPress={() => {
                                if (fileName || fileUri) {
                                    router.push("/app2/HomePage");
                                }
                            }}
                            disabled={(!fileName && !fileUri) || !isGenerated}
                        >
                            <Text style={styles.buttonText}>► Start the test</Text>
                        </TouchableOpacity>
                            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5" mt={'$4'} alignSelf={"flex-start"} icon={<Ionicons name="arrow-back" size={24} color="#000"/>}
                                    onPress={() => {
                                        setIsGenerated(false);
                                        setSuccess(false);
                                    }}>Go Back</Button>
                        </>
                    )}


                    {/* Modal */}
                    <Modal animationType="slide" transparent visible={modalVisible}>
                        <View
                            flex={1}
                            justifyContent="center"
                            alignItems="center"
                            backgroundColor="rgba(0, 0, 0, 0.5)"
                        >
                            <YStack
                                width={'90%'}
                                padding="$6"
                                backgroundColor="$background"
                                borderRadius="$4"
                                alignItems="center"
                            >
                                <LoadingAnimation />
                                <Animated.Text
                                    style={[{
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        marginBottom: 20,
                                        color: '#fff',
                                        textAlign: 'center',
                                        opacity: fadeAnim,
                                        paddingHorizontal: 20
                                    }]}
                                >
                                    {loadingMessages[currentTextIndex]}
                                </Animated.Text>
                            </YStack>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#d8ffb1",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginVertical: 30,
        top: 20,
        color: "#354a21",
        textAlign: "center",
        textShadowColor: "#fee135",
        textShadowOffset: {width: 2, height: 1},
        textShadowRadius: 5,
    },
    startButton: {
        backgroundColor: "#a8d38d",
        paddingVertical: 10,
        paddingHorizontal: 23,
        borderRadius: 10,
        marginVertical: 10,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 10,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#a8d38d",
        paddingVertical: 10,
        paddingHorizontal: 23,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
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
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
        alignSelf: "center",
        marginHorizontal: 10,
    },
    successButton: {
        backgroundColor: "#74b72e",
    },
    disabledButton: {
        backgroundColor: "gray",
    },
    resetButton: {
        backgroundColor: "#ff4d4d",
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 10,
        marginVertical: 5,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
        alignSelf: "center",
        marginHorizontal: 10,
    },
    buttonText: {
        color: "#354a21",
        fontSize: 20,
        fontWeight: "bold",
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
        textShadowColor: "#fee135",
    },
    loading: {
        marginVertical: 20,
    },
    previewContainer: {
        width: "100%",
        maxHeight: 20,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 3,
        backgroundColor: "#F5F5F5",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 20,
    },
    fileContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    fileText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    fileName: {
        fontSize: 16,
        fontStyle: "italic",
        fontWeight: "bold",
    },
    imageContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    infoText: {
        fontSize: 16,
        color: "#888",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    closeButtonText: {
        marginTop: 10,
        fontSize: 16,
        color: "#74b72e",
    },
    backButton: {
        backgroundColor: "#e8e8e8",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    questionContainer: {
        width: "100%",
        marginTop: 20,
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        borderColor: "#ddd",
        borderWidth: 1,
        alignItems: "flex-start",
    },
    questionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#354a21",
        marginBottom: 10,
    },
    questionText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5,
    },
});

export default SimpleUploadOrCapture;
