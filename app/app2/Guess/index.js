import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuizStore } from "../upload";
import {Button, View} from "tamagui";

const { width, height } = Dimensions.get("window");

const GameScreen = () => {
  const router = useRouter();
  const quiz = useQuizStore((state) => state.quiz);
  const completeLevel = useQuizStore((state) => state.completeLevel);
  const setLevelScore = useQuizStore((state) => state.setLevelScore);
  const [answers] = useState(quiz.level3);
  console.log("This is the questions: ", answers);

  const [shuffledLetters, setShuffledLetters] = useState(
    answers.map((answer) => answer.letters.replace(/\s+/g, "").split(""))
  );
  useEffect(() => {
    console.log("ShuffledLetters updated:", shuffledLetters);
  }, [shuffledLetters]);

  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(answers.length).fill(null)
  );
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [selectedLetterIndices, setSelectedLetterIndices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [score, setScore] = useState(0);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  const handleDrop = (dropZoneIndex) => {
    if (selectedQuestionIndex !== null) {
      const newSelectedAnswers = [...selectedAnswers];

      // Check if there is an existing question in the drop zone
      const existingAnswer = newSelectedAnswers[dropZoneIndex];

      if (existingAnswer) {
        // If there is an existing answer, remove it from the usedQuestions set
        setUsedQuestions((prev) => {
          const updatedUsedQuestions = new Set(prev);
          updatedUsedQuestions.delete(answers.indexOf(existingAnswer)); // remove old answer
          return updatedUsedQuestions;
        });
      }

      // Set the new answer in the selectedAnswers array
      newSelectedAnswers[dropZoneIndex] = answers[selectedQuestionIndex];

      // Add the new answer to the usedQuestions set
      setUsedQuestions((prev) => new Set(prev).add(selectedQuestionIndex));

      setSelectedAnswers(newSelectedAnswers);
      setSelectedQuestionIndex(null);
    }
  };

  const handleLetterPress = (index, letterIndex) => {
    const currentSelection = [...selectedLetterIndices];

    if (currentSelection.length < 2) {
      currentSelection.push({ index, letterIndex });
      setSelectedLetterIndices(currentSelection);

      if (currentSelection.length === 2) {
        swapLetters(currentSelection[0], currentSelection[1]);
      }
    } else {
      setSelectedLetterIndices([{ index, letterIndex }]);
    }
  };

  const swapLetters = (first, second) => {
    const { index: firstIndex, letterIndex: firstLetterIndex } = first;
    const { index: secondIndex, letterIndex: secondLetterIndex } = second;

    const newShuffledLetters = [...shuffledLetters];
    [
      newShuffledLetters[firstIndex][firstLetterIndex],
      newShuffledLetters[secondIndex][secondLetterIndex],
    ] = [
      newShuffledLetters[secondIndex][secondLetterIndex],
      newShuffledLetters[firstIndex][firstLetterIndex],
    ];

    setShuffledLetters(newShuffledLetters);
    setSelectedLetterIndices([]);
  };

  const shuffleLetters = (index) => {
    const shuffled = [...shuffledLetters[index]].sort(
      () => Math.random() - 0.5
    );
    const newShuffledLetters = [...shuffledLetters];
    newShuffledLetters[index] = shuffled;
    setShuffledLetters(newShuffledLetters);
  };

  const handleQuestionPress = (index) => {
    setSelectedQuestionIndex(index);
  };

  const resetGame = () => {
    setSelectedAnswers(Array(answers.length).fill(null));
    setSelectedQuestionIndex(null);
    setUsedQuestions(new Set());
    setShuffledLetters([
      ["M", "H", "O", "T", "M", "E", "T", "A", "R", "P", "O", "H"],
      ["N", "B", "R", "E", "K", "W", "D", "O"],
      ["D", "S", "S", "I", "L", "V", "E", "O"],
    ]);
    setSelectedLetterIndices([]);
    setScore(0);
  };

  const calculateScore = () => {
    let correctAnswersCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer && answer.word === answers[index].word) {
        correctAnswersCount++;
      }
    });
    const calculatedScore = (correctAnswersCount / answers.length) * 100;
    return calculatedScore;
  };

  const handleDone = async () => {

    try {
      const calculatedScore = calculateScore();
      setScore(calculatedScore);
      setShowModal(true);

      const level3Score = Math.round((calculatedScore / 100) * 10);
      await setLevelScore(3, level3Score);
      // Complete level 3
      await completeLevel(3);
setIsResultsVisible(true);
    } catch (error) {
      console.error('Error in handleDone:', error);
      setShowModal(false);
    }
  };

  const handleQuit = () => {
    router.push("app2/HomePage");
  };

  const closeModal = () => {
    setShowModal(false);
    setShowAnswersModal(true);
  };

  const handleSeeAnswers = () => {
    setShowModal(false);
    setShowAnswersModal(true);
  };

  const closeAnswersModal = () => {
    setShowAnswersModal(false);
    router.push("app2/HomePage");
  };

  const renderAnswers = () => {
    return answers.map((answer, index) => {
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer && userAnswer.word === answer.word;

      return (
          <View key={index} style={styles.answerItem}>
            <Text style={styles.questionTitle}>Question {index + 1}</Text>
            <Text style={styles.answerItemText}>{answer.question}</Text>

            <View style={styles.feedbackContainer}>
              {userAnswer ? (
                  isCorrect ? (
                      <View style={styles.feedbackRow}>
                        <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
                        <Text style={[styles.feedbackText, styles.correctFeedbackText]}>
                          Correct!
                        </Text>
                      </View>
                  ) : (
                      <>
                        <View style={styles.feedbackRow}>
                          <Ionicons name="close-circle" size={20} color="#d32f2f" />
                          <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                            Incorrect!
                          </Text>
                        </View>
                        <Text style={styles.correctAnswerText}>
                          Correct answer: {answer.word}
                        </Text>
                        <Text style={styles.yourAnswerText}>
                          Your answer: {userAnswer.word}
                        </Text>
                      </>
                  )
              ) : (
                  <View style={styles.feedbackRow}>
                    <Ionicons name="close-circle" size={20} color="#d32f2f" />
                    <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                      Not answered
                    </Text>
                  </View>
              )}
            </View>
          </View>
      );
    });
  };

  const renderAnswerItem = ({ item, index }) => (
    <BlurView intensity={20} tint="dark" style={styles.answerContainer}>
      <Text style={styles.answerLabel}>Q𝔲𝔢𝔰𝔱𝔦𝔬𝔫 {index + 1}</Text>
      <TouchableOpacity
        style={[
          styles.answerBox,
          selectedAnswers[index] && styles.mergedQuestionBox,
        ]}
        onPress={() => handleDrop(index)}
        accessible={true}
        accessibilityLabel="Answer drop zone"
      >
        <Text style={styles.answerText}>
          {selectedAnswers[index]
            ? selectedAnswers[index].question
            : "Tap to place your answer here"}
        </Text>
      </TouchableOpacity>

      <View style={styles.lettersContainer}>
        <View style={styles.letterRow}>
          {shuffledLetters[index].map((letter, letterIndex) => (
            <TouchableOpacity
              key={letterIndex}
              style={[
                styles.letterButton,
                selectedLetterIndices.some(
                  (item) =>
                    item.index === index && item.letterIndex === letterIndex
                ) && styles.selectedLetterButton,
              ]}
              onPress={() => handleLetterPress(index, letterIndex)}
              accessible={true}
              accessibilityLabel={`Letter ${letter}`}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.shuffleButton}
          onPress={() => shuffleLetters(index)}
        >
          <Ionicons name="shuffle" size={35} color="#ffffed" />
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const renderQuestionItem = useCallback(
    (item, index) => {
      if (usedQuestions.has(index)) return null;

      return (
        <TouchableOpacity
          key={`question-${index}`}
          style={[
            styles.questionBox,
            selectedQuestionIndex === index && styles.selectedQuestionBox,
          ]}
          onPress={() => handleQuestionPress(index)}
          accessible={true}
          accessibilityLabel={`Question ${index + 1}: ${item.question}`}
        >
          <Text
            style={styles.questionText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.question}
          </Text>
          <Ionicons
            name="reorder-three"
            size={25}
            color="#fee135"
            style={styles.questionIcon}
          />
        </TouchableOpacity>
      );
    },
    [selectedQuestionIndex, usedQuestions]
  );

  return (
    <LinearGradient colors={["#d8ffb1", "#aef359"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={answers}
          keyExtractor={(item, index) => `answer-${index}`}
          renderItem={renderAnswerItem}
          ListHeaderComponent={
            <>
              <Text style={styles.levelText}> G𝔲𝔢𝔰𝔰: D𝔯𝔬𝔭 𝔞𝔫𝔡 D𝔬𝔴𝔫 </Text>
              <Text style={styles.instructionText}>
                Select a question, then place it in an answer box below.
              </Text>
              <View style={styles.questionsContainer}>
                {answers.map((item, index) => renderQuestionItem(item, index))}
              </View>
              <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                <Text style={styles.resetButtonText}>↻</Text>
              </TouchableOpacity>
            </>
          }
        />

        <View flexDirection={'row'} width={'100%'} gap={"$2"} padding={"$4"}>
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
                  onPress={handleDone}
              >
                Done
              </Button>
          )}
        </View>

        <Modal visible={showModal} animationType="none" transparent={true}>
          <BlurView intensity={90} tint="dark" style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Your Score: {score.toFixed(2)}%
              </Text>
              <Button
                  color={'#fff'}
                  backgroundColor={'#93dc5c'}
                  size="$5"
                  mt={'$2'}
                  onPress={closeModal}
              >
                Review answers
              </Button>
            </View>
          </BlurView>
        </Modal>

        <Modal
          visible={showAnswersModal}
          animationType="none"
          transparent={true}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalBackground}>
            <View style={styles.answersModalContainer}>
              <ScrollView style={styles.answersScrollView}>
                {renderAnswers()}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeAnswersModal}
              >
                <Text style={styles.modalCloseButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
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
    paddingHorizontal: 20,
  },
  levelText: {
    color: "#fee135",
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 25,
    textAlign: "center",
    textShadowColor: "#2b2713",
    textShadowOffset: { width: 3, height: 2 },
    textShadowRadius: 5,
    elevation: 5,
    letterSpacing: 1,
    transform: [{ scale: 1.1 }],
  },
  instructionText: {
    fontSize: 15,
    color: "#354a21",
    fontFamily: "Poppins-Regular",
    marginBottom: 20,
    top: 15,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  questionsContainer: {
    marginBottom: 25,
    width: width - 40,
    alignSelf: "center",
  },
  answerContainer: {
    borderRadius: 22,
    marginBottom: 22,
    padding: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  answerLabel: {
    fontSize: 20,
    color: "#354a21",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 3,
    textShadowColor: "#F5f5d1",
  },
  questionBox: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 22,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 15,
    shadowColor: "#c79602",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedQuestionBox: {
    backgroundColor: "#aef359",
    transform: [{ scale: 1.05 }],
  },
  answerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    padding: 15,
    minHeight: 60,
  },
  mergedQuestionBox: {
    backgroundColor: "#aef359",
  },
  answerText: {
    fontSize: 15,
    color: "#354a21",
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  lettersContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  letterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: width - 40,
  },
  letterButton: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 12,
    margin: 5,
    borderRadius: 12,
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  selectedLetterButton: {
    backgroundColor: "#aef359",
  },
  letterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#354a21",
  },
  shuffleButton: {
    backgroundColor: "",
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    alignItems: "center",
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#354a21",
    fontWeight: "",
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 100,
    padding: 12,
    paddingVertical: 12,
    width: 65,
    left: 165,
    alignItems: "center",
    marginTop: 1,
    bottom: 25,
  },
  resetButtonText: {
    color: "#ffffed",
    fontWeight: "bold",
    fontSize: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quitButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  doneButton: {
    backgroundColor: "#93dc5c",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#ffffed",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  answerItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F5f5d1",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#354a21",
    marginBottom: 8,
    fontWeight: "700",
  },
  answerItemText: {
    fontSize: 16,
    color: "#354a21",
    marginBottom: 12,
    fontFamily: "Poppins_400Regular",
  },
  feedbackContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
  answersModalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  answersScrollView: {
    width: "100%",
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: "#93dc5c",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default GameScreen;