import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
  TextInput,
  StatusBar,
} from "react-native";
import {
  useFonts,
  Poppins_600SemiBold,
  Poppins_400Regular,
} from "@expo-google-fonts/poppins";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuizStore } from "../upload";
import {Button} from "tamagui";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LetterFillInBlankPuzzle = () => {
  const [answers, setAnswers] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  const quiz = useQuizStore((state) => state.quiz);
  const completeLevel = useQuizStore((state) => state.completeLevel);
  const setLevelScore = useQuizStore((state) => state.setLevelScore);
  const questions = quiz.level2;
  console.log("This is the questions: ", questions);

  useEffect(() => {
    if (questions?.length > 0) {
      resetPuzzle();
    }
  }, [questions]);

  const resetPuzzle = () => {
    const answersObj = {};
    questions.forEach((text) => {
      answersObj[text.question] = "";
    });
    setAnswers(answersObj);
  };

  const normalizeAnswer = (answer) => {
    return answer
        .toLowerCase()   // Convert to lowercase
        .replace(/\s+/g, '')   // Remove all spaces
        // .replace(/s$/, '');     // OPTIONAL: if you want it to ignore singular / plural answers
  };

  const handleInputChange = (text, questionText) => {
    setAnswers((prev) => ({
      ...prev,
      [questionText]: text.toLowerCase(),
    }));
  };

  const handleDone = async () => {
    // Prevent double submission
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setIsResultsVisible(true);

      // Calculate score
      const calculatedScore = questions.reduce((acc, question) => {
        const userAnswer = normalizeAnswer(answers[question.question] || "");
        const correctAnswer = normalizeAnswer(question.answer || "");
        return acc + (userAnswer === correctAnswer ? 1 : 0);
      }, 0);

      const level2Score = Math.round((calculatedScore / questions.length) * 10);
      await setLevelScore(2, level2Score);

      // Update score and show modal
      setScore(calculatedScore);
      setModalVisible(true);

      // Complete the level
      await completeLevel(2);

    } catch (error) {
      console.error('Error in handleDone:', error);
      // Show error to user if needed
      setModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {

      setModalVisible(false);
      router.push("/app2/HomePage");

  };

  const handleConfirmQuit = () => {
    setModalVisible(false);
  };

  let [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Fill In the Blanks</Text>
          <Button
              color={'#000'}
              backgroundColor={'#dedcdc'}
              size="$3"
              mt={'$2'}
              onPress={handleQuit}
          >
            Back to home
          </Button>
        </View>

        {questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <LinearGradient
              colors={["#a8d38d", "#fee135", "#a8d38d"]}
              style={styles.questionGradient}
            >
              <Text style={styles.questionNumber}>Question {index + 1}</Text>
              <Text style={styles.questionText}>{question.question}</Text>
              {/* Updated key */}
            </LinearGradient>

            <TextInput
              style={styles.textInput}
              value={answers[question.question] || ""} // Use the correct key
              onChangeText={(text) =>
                handleInputChange(text, question.question)
              }
              placeholder="Type your answer here"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              editable={!isResultsVisible}
            />

            {isResultsVisible && (
                <View style={styles.feedbackContainer}>
                  {answers[question.question] ? (
                      answers[question.question].toLowerCase().trim() === question.answer.toLowerCase().trim() ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AntDesign name="checkcircle" size={20} color="#2e7d32" />
                            <Text style={[styles.feedbackText, styles.correctFeedbackText]}>
                              {' '}Correct!
                            </Text>
                          </View>
                      ) : (
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <AntDesign name="closecircle" size={20} color="#d32f2f" />
                              <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                              Incorrect!
                              </Text>
                            </View>
                            <Text style={[styles.feedbackText, styles.correctAnswerText]}>
                              Correct answer: {question.answer}
                            </Text>
                          </View>
                      )
                  ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name="closecircle" size={20} color="#d32f2f" />
                        <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                          {' '}Not answered
                        </Text>
                      </View>
                  )}
                </View>
            )}
          </View>
        ))}

        {!isResultsVisible && (
        <View>
          <Button
              color={'#fff'}
              backgroundColor={'#93dc5c'}
              size="$5"
              mt={'$2'}
              onPress={handleDone}
          >
            Done
          </Button>
        </View> )}

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Score: {score}/{questions.length}
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmQuit}>
                <Text style={styles.modalButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d8ffb1",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#a8d38d",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  headerText: {
    color: "#fee135",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#2b2713",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },
  header: {
    fontSize: 27,
    color: "#fee135",
    fontFamily: "Poppins_600SemiBold",
    textShadowColor: "#2b2713",
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 4,
  },
  questionContainer: {
    marginBottom: 25,
    backgroundColor: "#F5f5d1",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  questionGradient: {
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#354a21",
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#354a21",
  },
  textInput: {
    margin: 15,
    borderWidth: 2,
    borderColor: "#fee135",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#2C3E50",
    backgroundColor: "#ECF0F1",
  },
  footerContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  feedbackContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 8,
    flex: 1,
  },
  correctFeedbackText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  incorrectFeedbackText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  correctAnswerText: {
    color: '#2e7d32',
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    marginTop: 4,
    marginLeft: 28,
  },
  notAnsweredText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#2C3E50",
  },
  modalButton: {
    backgroundColor: "#93dc5c",
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
  },
  modalButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  quitButton: {
    backgroundColor: "#E74C3C",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    elevation: 3,
  },
  doneButton: {
    backgroundColor: "#93dc5c",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});

export default LetterFillInBlankPuzzle;
