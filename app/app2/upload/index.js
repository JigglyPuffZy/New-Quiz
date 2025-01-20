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
import {Animated} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useQuizStore = create((set, get) => ({
    // Quiz data structure
    quiz: {
        level1: [],
        level2: [],
        level3: [],
        level4: [],
    },
    fileData: null,
    fileName: null,
    currentLevel: 1,
    initialized: false,
    levelScores: {
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0
    },
    unlockedLevels: [1], // Initially only level 1 is unlocked
    completedLevels: [], // Track completed levels
    setUnlockedLevels: (levels) => set({ unlockedLevels: levels }),
    setCompletedLevels: (levels) => set({ completedLevels: levels }),

    setFileData: async (base64Data, fileName) => {
        try {
            // Save to AsyncStorage
            await AsyncStorage.setItem('file_data', base64Data);
            await AsyncStorage.setItem('file_name', fileName);

            // Update store state
            set({
                fileData: base64Data,
                fileName: fileName
            });
        } catch (error) {
            console.error('Failed to save file data:', error);
            throw error;
        }
    },

    regenerateQuestions: async () => {
        try {
            const state = get();
            console.log("Store state when regenerating:", {
                hasFileData: !!state.fileData,
                fileDataLength: state.fileData?.length,
                fileName: state.fileName,
            });

            if (!state.fileData || !state.fileName) {
                console.error("Missing data:", {
                    fileData: !!state.fileData,
                    fileName: !!state.fileName
                });
                throw new Error('No file data available');
            }

            const uploadResponse = await axios.post(
                "https://quizwhirl-production.up.railway.app/api/parse-pdf-text",
                {
                    file: state.fileData,
                    filename: state.fileName,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Regenerate API response status:", uploadResponse.status);

            if (uploadResponse.data) {
                set({
                    quiz: uploadResponse.data,
                    completedLevels: [], // Reset progress
                    unlockedLevels: [1]  // Reset to only first level unlocked
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Detailed regeneration error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    resetProgress: async () => {
        try {
            await AsyncStorage.multiRemove([
                'completed_levels',
                'unlocked_levels',
                'level_scores'
            ]);
            set({
                unlockedLevels: [1],
                completedLevels: [],
                levelScores: {
                    level1: 0,
                    level2: 0,
                    level3: 0,
                    level4: 0
                }
            });
        } catch (error) {
            console.warn('Failed to reset progress:', error);
            throw error;
        }
    },

    setLevelScore: async (level, score) => {
        try {
            const newScores = {
                ...get().levelScores,
                [`level${level}`]: score
            };
            await AsyncStorage.setItem('level_scores', JSON.stringify(newScores));
            set({ levelScores: newScores });
        } catch (error) {
            console.warn('Failed to save level score:', error);
            throw error;

        }
    },
    // Set quiz data
    setQuiz: async (data) => {
        try {
            await AsyncStorage.setItem('quiz_data', JSON.stringify(data));
            set({ quiz: data });
        } catch (error) {
            console.warn('Failed to save quiz to storage:', error);
            throw error;
        }
    },

    // Set current level
    setCurrentLevel: async (level) => {
        try {
            await AsyncStorage.setItem('current_level', String(level));
            set({ currentLevel: level });
        } catch (error) {
            console.warn('Failed to save current level:', error);
            throw error;
        }
    },

    // Complete a level and unlock the next one
    completeLevel: async (level) => {
        try {
            const state = get();
            if (state.completedLevels.includes(level)) {
                return; // Level already completed
            }
            const newCompletedLevels = [...new Set([...state.completedLevels, level])];
            const nextLevel = level + 1;
            let newUnlockedLevels = [...state.unlockedLevels];

            // Unlock next level if it exists (max level is 4)
            if (nextLevel <= 4 && !newUnlockedLevels.includes(nextLevel)) {
                newUnlockedLevels.push(nextLevel);
            }

            // Save to AsyncStorage
            await AsyncStorage.setItem('completed_levels', JSON.stringify(newCompletedLevels));
            await AsyncStorage.setItem('unlocked_levels', JSON.stringify(newUnlockedLevels));

            // Update state
            set({
                completedLevels: newCompletedLevels,
                unlockedLevels: newUnlockedLevels,
            });
        } catch (error) {
            console.warn('Failed to complete level:', error);
            throw error;
        }
    },

    // Reset everything
    reset: async () => {
        try {
            await AsyncStorage.multiRemove([
                'quiz_data',
                'current_level',
                'completed_levels',
                'unlocked_levels',
                'file_data',
                'file_name'
            ]);
            set({
                quiz: {
                    level1: [],
                    level2: [],
                    level3: [],
                    level4: [],
                },
                currentLevel: 1,
                unlockedLevels: [1],
                completedLevels: [],
                fileData: null,
                fileName: null,
            });
        } catch (error) {
            console.warn('Failed to reset quiz data:', error);
            throw error;
        }
    },

    // Load all quiz data from storage
    loadQuizData: async () => {
        try {
            const [
                savedQuiz,
                savedLevel,
                savedCompletedLevels,
                savedUnlockedLevels,
                savedFileData,
                savedFileName,
            ] = await Promise.all([
                AsyncStorage.getItem('quiz_data'),
                AsyncStorage.getItem('current_level'),
                AsyncStorage.getItem('completed_levels'),
                AsyncStorage.getItem('unlocked_levels'),
                AsyncStorage.getItem('file_data'),
                AsyncStorage.getItem('file_name')
            ]);

            const newState = {
                initialized: true
            };

            if (savedQuiz !== null) {
                newState.quiz = JSON.parse(savedQuiz);
            }
            if (savedLevel !== null) {
                newState.currentLevel = parseInt(savedLevel, 10);
            }
            if (savedCompletedLevels !== null) {
                newState.completedLevels = JSON.parse(savedCompletedLevels);
            }
            if (savedUnlockedLevels !== null) {
                newState.unlockedLevels = JSON.parse(savedUnlockedLevels);
            }
            if (savedFileData !== null) {
                newState.fileData = savedFileData;
                console.log('Restored file data from AsyncStorage');
            }
            if (savedFileName !== null) {
                newState.fileName = savedFileName;
            }

            set(newState);
        } catch (error) {
            console.warn('Failed to load quiz data:', error);
            set({ initialized: true });
        }
    },

    // Helper method to check if a level is unlocked
    isLevelUnlocked: (level) => {
        const state = get();
        return state.unlockedLevels.includes(level);
    },

    // Helper method to check if a level is completed
    isLevelCompleted: (level) => {
        const state = get();
        return state.completedLevels.includes(level);
    }
}));

// Helper function to check if quiz has data
export const hasQuizData = (quiz) => {
    return Object.values(quiz).some(arr => arr.length > 0);
};

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

const UploadingFileAnimation = () => {
    return (
        <LottieView
            source={require('../../../assets/document.json')}
            autoPlay
            loop
            style={{
                width: 200,
                height: 200,
            }}
        />
    );
};

const CustomDropzone = ({onPress, fileName, isLoading}) => {
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
                           <UploadingFileAnimation />
                            <Text fontSize={14} color={"7fb0fa"} mt="$-4" textAlign={'center'}>
                                {fileName}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="add-circle" size={48} color="#dedcdc"/>

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

            // Store the base64 data and filename in the quiz store
            useQuizStore.getState().setFileData(base64Data, file.name);

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
                            source={{uri: "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,q_auto,w_720/67344c866c473c001d68c113.png"}}
                            width={60}
                            height={60}
                            borderRadius={100}
                        />
                        <View>
                            <Text fontSize={20} fontWeight={800} color={'black'}>Hey, {nickname}</Text>
                            <Text mt={"$1"} fontSize={16} fontWeight={600} color={'black'}>Upload your study material
                                and I'll create a personalized quiz for you</Text>
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
                                        onPress={handleSubmit} disabled={!fileName && !fileUri}>Submit</Button>
                                <Button size="$5" mt={'$4'} backgroundColor={'#db1818'} width={'50%'}
                                        onPress={handleReset}>Reset</Button>
                            </View>
                            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5" mt={'$2'}
                                    onPress={handleChangeNickname}>Change Nickname</Button>

                        </>
                    ) : (
                        <>
                            <View backgroundColor={'#fff'} padding={'$2'} flexDirection={'col'} paddingBottom={'$8'} marginTop={'$6'}
                                  justifyContent={'center'} alignItems={'center'} gap={8} borderRadius={40}>
                                <Image
                                    source={require('../../../assets/images/quiz-play.png')}
                                    width={300}
                                    height={260}
                                />
                                <Button
                                    color={'#fff'}
                                    backgroundColor={'#27ae60'}
                                    size="$5"
                                    mt={'$-4'}
                                    icon={<Ionicons name="play" size={24} color="#fff"/>}
                                    onPress={() => {
                                        if (fileName || fileUri) {
                                            router.push("/app2/HomePage");
                                        }
                                    }}
                                >
                                    Start Playing
                                </Button>
                            </View>
                            <Button color={'#000'} backgroundColor={'#dedcdc'} size="$5" mt={'$4'}
                                  icon={<Ionicons name="arrow-back" size={24} color="#000"/>}
                                    onPress={() => {
                                        setIsGenerated(false);
                                        setSuccess(false);
                                    }}>Go Back</Button>
                        </>
                    )}


                    {/* Modal */}
                    <Modal animationType="none" transparent visible={modalVisible}>
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
                                <LoadingAnimation/>
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
