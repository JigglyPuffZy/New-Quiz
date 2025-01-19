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

const { width, height } = Dimensions.get("window");

const LetterFillInBlankPuzzle = () => {
  const [answers, setAnswers] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Calculate score
      const calculatedScore = questions.reduce((acc, question) => {
        const userAnswer = (answers[question.question] || "").toLowerCase().trim();
        const correctAnswer = (question.answer || "").toLowerCase().trim();
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
    // Prevent navigation if already submitting
    if (!isSubmitting) {
      setModalVisible(false);
      router.push("/app2/HomePage");
    }
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
          <Text style={styles.header}>Fill In the Blanks</Text>
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
            />
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.buttonText}>Quit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>

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
              <TouchableOpacity style={styles.modalButton} onPress={handleQuit}>
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
    justifyContent: "center",
    backgroundColor: "#a8d38d",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
});

export default LetterFillInBlankPuzzle;
