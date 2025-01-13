import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
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
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useQuizStore } from "../upload";

const { width, height } = Dimensions.get("window");

// const questions = [
//   {
//     id: "1",
//     question: "What is the capital of France?",
//     correctAnswer: "Paris",
//   },
//   {
//     id: "2",
//     question: "Which planet is known as the Red Planet?",
//     correctAnswer: "Mars",
//   },
//   {
//     id: "3",
//     question: "What is the largest ocean on Earth?",
//     correctAnswer: "Pacific Ocean",
//   },
//   { id: "4", question: "What is the currency of Japan?", correctAnswer: "Yen" },
//   {
//     id: "5",
//     question: "What is the chemical symbol for gold?",
//     correctAnswer: "Au",
//   },
//   {
//     id: "6",
//     question: "What is the tallest mountain in the world?",
//     correctAnswer: "Mount Everest",
//   },
//   {
//     id: "7",
//     question: "Which continent is known as the Dark Continent?",
//     correctAnswer: "Africa",
//   },
//   {
//     id: "8",
//     question: "What is the largest planet in our solar system?",
//     correctAnswer: "Jupiter",
//   },
// ];

const TypingGame = () => {
  const quiz = useQuizStore((state) => state.quiz);
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

  const handleSubmit = () => {
    let newScore = 0;
    userAnswers.forEach((answer, index) => {
      if (
        answer.trim().toLowerCase() ===
        questions[index].correctAnswer.toLowerCase()
      ) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setShowModal(true);
  };

  const handleChange = (text, index) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = text;
    setUserAnswers(updatedAnswers);
  };

  const handleQuit = () => {
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

  const renderQuestion = ({ item, index }) => (
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
      />
      {showAnswers && (
        <View style={styles.answerContainer}>
          <Text style={styles.correctAnswer}>
            Correct: {item.correctAnswer}
          </Text>
          <Text
            style={[
              styles.userAnswer,
              userAnswers[index].trim().toLowerCase() ===
              item.correctAnswer.toLowerCase()
                ? styles.correctUserAnswer
                : styles.incorrectUserAnswer,
            ]}
          >
            Your Answer: {userAnswers[index]}
            {userAnswers[index].trim().toLowerCase() ===
            item.correctAnswer.toLowerCase()
              ? " ✅"
              : " ❌"}
          </Text>
        </View>
      )}
    </Animated.View>
  );

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
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.headerContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="leaf" size={48} color="#028a0f" />
            </Animated.View>
            <Text style={styles.header}> I𝔡𝔢𝔫𝔱𝔦𝔣𝔦𝔠𝔞𝔱𝔦𝔬𝔫 </Text>
            <Text style={styles.instructions}>
              Type your answer to each question below:
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progress * 100}%` }]}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>Quit</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showModal} transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    { transform: [{ rotate: spin }] },
                  ]}
                >
                  <Ionicons name="trophy" size={80} color="#FFD700" />
                </Animated.View>

                <View style={styles.resultContainer}>
                  <Text style={styles.congratsText}>Excellent Work!</Text>
                  <Text style={styles.scoreText}>
                    {score} correct out of {questions.length}
                  </Text>
                  <View style={styles.percentageWrapper}>
                    <Text style={styles.percentageText}>
                      {Math.round((score / questions.length) * 100)}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={handleGoHome}
                >
                  <Ionicons name="home-outline" size={24} color="#fff" />
                  <Text style={styles.homeButtonText}>Return Home</Text>
                </TouchableOpacity>
              </View>
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
    textShadowOffset: { width: 2, height: 2 },
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
    shadowOffset: { width: 0, height: 8 },
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 10 },
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
    shadowOffset: { width: 0, height: 4 },
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
