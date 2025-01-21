import React, {useState, useEffect, useRef} from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Modal,
    Animated,
    Dimensions,
    Platform,
} from "react-native";
import {useRouter} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import {useQuizStore} from "../upload";
import {Button, View} from "tamagui";
import {AntDesign} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {  Text, YStack, XStack, Card } from "tamagui";

const {width, height} = Dimensions.get("window");

const LoadingAnimation = () => {
    return (
        <LottieView
            source={require('../../../assets/trophy.json')}
            autoPlay
            loop
            style={{
                width: 180,
                height: 180,
            }}
        />
    );
};

const TypingGame = () => {
    const quiz = useQuizStore((state) => state.quiz);
    const completeLevel = useQuizStore((state) => state.completeLevel);
    const setLevelScore = useQuizStore((state) => state.setLevelScore);
    const levelScores = useQuizStore((state) => state.levelScores);
    const questions = quiz.level4;
    console.log("This is the questions: ", questions);

    const [userAnswers, setUserAnswers] = useState(
        Array(questions.length).fill("")
    );
    const [showModal, setShowModal] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [score, setScore] = useState(0);
    const router = useRouter();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(height));
    const [rotateAnim] = useState(new Animated.Value(0));
    const [progress, setProgress] = useState(0);
    const flatListRef = useRef(null);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useEffect(() => {
        const answeredQuestions = userAnswers.filter(
            (answer) => answer.trim() !== ""
        ).length;
        setProgress(answeredQuestions / questions.length);
    }, [userAnswers]);

    const normalizeAnswer = (answer) => {
        return answer
            .toLowerCase()   // Convert to lowercase
            .replace(/\s+/g, '')   // Remove all spaces
        // .replace(/s$/, '');     // OPTIONAL: if you want it to ignore singular / plural answers
    };

    const handleSubmit = async () => {

        try {
            let correctCount = 0;
            userAnswers.forEach((answer, index) => {
                // Normalize user and correct answers
                const userAnswer = normalizeAnswer(answer || "");
                const correctAnswer = normalizeAnswer(questions[index]?.correctAnswer || questions[index]?.answer || "");

                // Compare the normalized answers
                if (userAnswer === correctAnswer) {
                    correctCount += 1;
                }
            });

            // Calculate level 4 score out of 10
            const level4Score = Math.round((correctCount / questions.length) * 10);
            await setLevelScore(4, level4Score);

            // Calculate total score out of 40
            const totalScore = (levelScores.level1 || 0) +
                (levelScores.level2 || 0) +
                (levelScores.level3 || 0) +
                level4Score;

            setScore(correctCount);
            setShowModal(true);

            await completeLevel(4);
            setIsResultsVisible(true);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setShowModal(false);
        } finally {
        }
    };

    const getFeedbackMessage = (totalScore) => {
        if (totalScore <= 10) {
            return { message: "Keep Practicing!", color: "$red10" };
        } else if (totalScore <= 20) {
            return { message: "Getting Better!", color: "$orange10" };
        } else if (totalScore <= 30) {
            return { message: "Great Progress!", color: "$yellow10" };
        } else if (totalScore <= 35) {
            return { message: "Amazing Work!", color: "$green10" };
        } else {
            return { message: "Perfect Score!", color: "$green10" };
        }
    };
    const getLevelScoreColor = (score) => {
        if (score >= 9) return "$green10";      // Excellent: 9-10
        if (score >= 7) return "$yellow10";     // Good: 7-8
        if (score >= 5) return "$orange10";     // Average: 5-6
        return "$red10";                        // Needs Work: 0-4
    };
    const totalScore = levelScores.level1 + levelScores.level2 +
        levelScores.level3 + Math.round((score / questions.length) * 10);

    const feedback = getFeedbackMessage(totalScore);

    const handleChange = (text, index) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[index] = text;
        setUserAnswers(updatedAnswers);
    };

    const handleQuit = () => {
        setShowModal(false);
        router.push("app2/HomePage");
    };

    const handleSeeAnswers = () => {
        setShowModal(false);
        setShowAnswers(true);
    };

    const handleGoHome = () => {
        setShowModal(false);
        router.push("app2/HomePage");
    };

    const renderQuestion = ({item, index}) => {
        const userAnswer = normalizeAnswer(userAnswers[index] || "");
        const correctAnswer = normalizeAnswer(item.answer || "");
        const isCorrect = userAnswer === correctAnswer;
        const hasAnswer = userAnswer !== undefined && userAnswer !== "";

        return (
            <Animated.View
                style={[
                    styles.questionContainer,
                    {
                        transform: [
                            {
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, height],
                                    outputRange: [0, 50 * (index + 1)],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Text style={styles.question}>{`${index + 1}. ${item.question}`}</Text>
                <TextInput
                    style={styles.input}
                    value={userAnswers[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    placeholder="Type your answer here"
                    placeholderTextColor="#a0a0a0"
                    returnKeyType="done"
                    editable={!isResultsVisible}
                />

                {isResultsVisible && (
                    <View style={styles.feedbackContainer}>
                        {hasAnswer ? (
                            isCorrect ? (
                                <View style={styles.feedbackRow}>
                                    <AntDesign name="checkcircle" size={20} color="#2e7d32"/>
                                    <Text style={[styles.feedbackText, styles.correctFeedbackText]}>
                                        Correct!
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.feedbackRow}>
                                        <AntDesign name="closecircle" size={20} color="#d32f2f"/>
                                        <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                                            Incorrect!
                                        </Text>
                                    </View>
                                    <Text style={styles.correctAnswerText}>
                                        Correct answer: {item.answer}
                                    </Text>
                                    <Text style={styles.yourAnswerText}>
                                        Your answer: {userAnswers[index]}
                                    </Text>
                                </>
                            )
                        ) : (
                            <View style={styles.feedbackRow}>
                                <AntDesign name="closecircle" size={20} color="#d32f2f"/>
                                <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                                    Not answered
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </Animated.View>
        );
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <LinearGradient
            colors={["#d8ffb1", "#45a049", "#aef359"]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
                    <View style={styles.headerContainer}>
                        <Animated.View style={{transform: [{rotate: spin}]}}>
                            <Ionicons name="leaf" size={48} color="#028a0f"/>
                        </Animated.View>
                        <Text style={styles.header}> I𝔡𝔢𝔫𝔱𝔦𝔣𝔦𝔠𝔞𝔱𝔦𝔬𝔫 </Text>
                        <Text style={styles.instructions}>
                            Type your answer to each question below:
                        </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[styles.progressBar, {width: `${progress * 100}%`}]}
                        />
                    </View>
                    <FlatList
                        ref={flatListRef}
                        data={questions}
                        renderItem={renderQuestion}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContainer}
                    />
                </Animated.View>

                <View flexDirection={'row'} width={'100%'} gap={"$2"} paddingHorizontal={"$4"} paddingVertical={"$2"}>
                    <Button
                        flex={1}
                        color={'#fff'}
                        backgroundColor={'#e74c3c'}
                        size="$5"
                        mt={'$2'}
                        onPress={handleQuit}
                    >
                        Back to home
                    </Button>
                    {!isResultsVisible && (
                        <Button
                            flex={1}
                            color={'#fff'}
                            backgroundColor={'#93dc5c'}
                            size="$5"
                            mt={'$2'}
                            onPress={handleSubmit}
                        >
                            Done
                        </Button>
                    )}
                </View>

                <Modal visible={showModal} transparent={true} animationType="none">
                    <View style={styles.modalBackground}>
                        <Card
                            width="90%"
                            backgroundColor="white"
                            borderRadius="$8"
                            paddingHorizontal="$8"
                            paddingBottom={"$8"}
                            elevate
                        >
                            <YStack alignItems="center" space="$4">
                                <LoadingAnimation />

                                <Text
                                    fontSize="$5"
                                    fontWeight="800"
                                    textAlign="center"
                                    color={getFeedbackMessage(levelScores.level1 + levelScores.level2 +
                                        levelScores.level3 + Math.round((score / questions.length) * 10)).color}
                                    marginTop="$-6"
                                >
                                    {getFeedbackMessage(levelScores.level1 + levelScores.level2 +
                                        levelScores.level3 + Math.round((score / questions.length) * 10)).message}
                                </Text>

                                <Card backgroundColor="$gray2" paddingHorizontal="$5" paddingVertical="$4" width="100%" borderRadius="$4">
                                    <YStack space="$4">
                                        {/* Level 1 */}
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <Text fontSize="$3" fontWeight="900" color="$gray11">Level 1</Text>
                                            <XStack alignItems="baseline" space="$1">
                                                <Text fontSize="$5" fontWeight="700" color={getLevelScoreColor(levelScores.level1 || 0)}>
                                                    {levelScores.level1 || 0}
                                                </Text>
                                                <Text fontSize="$3" color="$gray9">/10</Text>
                                            </XStack>
                                        </XStack>

                                        <View backgroundColor="$gray5" height={1} />

                                        {/* Level 2 */}
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <Text fontSize="$3" fontWeight="900" color="$gray11">Level 2</Text>
                                            <XStack alignItems="baseline" space="$1">
                                                <Text fontSize="$5" fontWeight="700" color={getLevelScoreColor(levelScores.level1 || 0)}>
                                                    {levelScores.level2 || 0}
                                                </Text>
                                                <Text fontSize="$3" color="$gray9">/10</Text>
                                            </XStack>
                                        </XStack>

                                        <View backgroundColor="$gray5" height={1} />

                                        {/* Level 3 */}
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <Text fontSize="$3" fontWeight="900" color="$gray11">Level 3</Text>
                                            <XStack alignItems="baseline" space="$1">
                                                <Text fontSize="$5" fontWeight="700" color={getLevelScoreColor(levelScores.level1 || 0)}>
                                                    {levelScores.level3 || 0}
                                                </Text>
                                                <Text fontSize="$3" color="$gray9">/10</Text>
                                            </XStack>
                                        </XStack>

                                        <View backgroundColor="$gray5" height={1} />

                                        {/* Level 4 */}
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <Text fontSize="$3" fontWeight="900" color="$gray11">Level 4</Text>
                                            <XStack alignItems="baseline" space="$1">
                                                <Text fontSize="$5" fontWeight="700" color={getLevelScoreColor(levelScores.level1 || 0)}>
                                                    {Math.round((score / questions.length) * 10)}
                                                </Text>
                                                <Text fontSize="$3" color="$gray9">/10</Text>
                                            </XStack>
                                        </XStack>
                                    </YStack>
                                </Card>

                                {/* Total Score */}
                                <Card
                                    backgroundColor="$gray12"
                                    paddingVertical="$2"
                                    paddingHorizontal="$4"
                                    width="100%"
                                    borderRadius="$4"
                                >
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <Text fontSize="$3" fontWeight="700" color="$gray8">
                                            Total Score
                                        </Text>
                                        <XStack alignItems="baseline" space="$1">
                                            <Text fontSize="$6" fontWeight="800" color={feedback.color}>
                                                {levelScores.level1 + levelScores.level2 + levelScores.level3 +
                                                    Math.round((score / questions.length) * 10)}
                                            </Text>
                                            <Text fontSize="$4" color="$gray8">/40</Text>
                                        </XStack>
                                    </XStack>
                                </Card>

                                <YStack space="$3" width="100%" marginTop="$2">
                                    <Button
                                        size="$5"
                                        backgroundColor="$green9"
                                        color="white"
                                        onPress={() => setShowModal(false)}
                                    >
                                        Review answers
                                    </Button>
                                    <Button
                                        size="$5"
                                        backgroundColor="$gray12"
                                        color="black"
                                        onPress={handleQuit}
                                    >
                                        Return Home
                                    </Button>
                                </YStack>
                            </YStack>
                        </Card>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 16,
        paddingVertical: 12,
    },
    header: {
        color: "#fee135",
        fontSize: 48,
        fontWeight: "800",
        textAlign: "center",
        marginVertical: 24,
        textShadowColor: "#2b2713",
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 6,
        letterSpacing: 1.2,
    },
    instructions: {
        fontSize: 18,
        color: "#354a21",
        fontFamily: "Poppins-Regular",
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: 0.5,
        fontWeight: "600",
        lineHeight: 24,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 8,
        marginBottom: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(53, 74, 33, 0.1)",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#fee135",
        borderRadius: 8,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    questionContainer: {
        marginBottom: 28,
        backgroundColor: "#F5f5d1",
        borderRadius: 28,
        padding: 32,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 8},
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: "rgba(254, 225, 53, 0.4)",
    },
    question: {
        fontSize: 22,
        marginBottom: 20,
        color: "#354a21",
        fontWeight: "700",
        lineHeight: 30,
    },
    input: {
        borderWidth: 2,
        borderColor: "#fee135",
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        backgroundColor: "#f0fff0",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
    },
    answerContainer: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 12,
    },
    correctAnswer: {
        fontSize: 16,
        color: "#4CAF50",
        marginBottom: 8,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    userAnswer: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    feedbackContainer: {
        backgroundColor: "#f8f8f8",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        marginHorizontal: 15,
    },
    feedbackRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    feedbackText: {
        fontSize: 16,
        marginLeft: 8,
        fontFamily: "Poppins_400Regular",
        fontWeight: "600",
    },
    correctFeedbackText: {
        color: "#2e7d32",
    },
    incorrectFeedbackText: {
        color: "#d32f2f",
    },
    correctAnswerText: {
        color: "#2e7d32",
        fontSize: 15,
        marginTop: 4,
        marginLeft: 28,
        fontFamily: "Poppins_400Regular",
    },
    yourAnswerText: {
        color: "#d32f2f",
        fontSize: 15,
        marginTop: 4,
        marginLeft: 28,
        fontFamily: "Poppins_400Regular",
    },
    correctUserAnswer: {
        color: "#4CAF50",
        fontWeight: "700",
    },
    incorrectUserAnswer: {
        color: "#e74c3c",
        fontWeight: "700",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 16,
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 18,
        borderRadius: 20,
        flex: 1,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    quitButton: {
        backgroundColor: "#e74c3c",
        padding: 18,
        borderRadius: 20,
        flex: 1,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    quitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 32,
        padding: 32,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: {width: 0, height: 10},
        shadowRadius: 20,
        elevation: 10,
    },
    modalContent: {
        alignItems: "center",
        gap: 24,
    },
    iconWrapper: {
        backgroundColor: "rgba(255, 215, 0, 0.15)",
        padding: 28,
        borderRadius: 70,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: "rgba(254, 225, 53, 0.3)",
    },
    resultContainer: {
        alignItems: "center",
        marginBottom: 32,
        gap: 16,
    },
    congratsText: {
        fontSize: 36,
        fontWeight: "800",
        color: "#2c3e50",
        marginBottom: 16,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    scoreText: {
        fontSize: 26,
        color: "#45a049",
        fontWeight: "700",
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    percentageWrapper: {
        backgroundColor: "#f0fff0",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(69, 160, 73, 0.2)",
    },
    percentageText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#45a049",
        letterSpacing: 1,
    },
    homeButton: {
        backgroundColor: "#45a049",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 24,
        width: "100%",
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    homeButtonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});

export default TypingGame;
