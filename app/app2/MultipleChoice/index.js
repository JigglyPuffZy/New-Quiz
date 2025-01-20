import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Modal,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useQuizStore } from "../upload";
import {Button} from "tamagui";
// const questions = [
//   { id: '1', question: 'What is the capital of France?', choices: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
//   { id: '2', question: 'What is 2 + 2?', choices: ['3', '4', '5', '6'], correctAnswer: '4' },
//   { id: '3', question: 'What is the largest planet in our solar system?', choices: ['Earth', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 'Jupiter' },
//   { id: '4', question: 'What is the chemical symbol for water?', choices: ['H2O', 'CO2', 'O2', 'NaCl'], correctAnswer: 'H2O' },
//   { id: '5', question: 'What is the square root of 16?', choices: ['2', '3', '4', '5'], correctAnswer: '4' },
//   { id: '6', question: 'Who wrote "Romeo and Juliet"?', choices: ['Charles Dickens', 'Mark Twain', 'William Shakespeare', 'Jane Austen'], correctAnswer: 'William Shakespeare' },
//   { id: '7', question: 'What is the smallest continent?', choices: ['Australia', 'Europe', 'Asia', 'Antarctica'], correctAnswer: 'Australia' },
//   { id: '8', question: 'Which gas do plants absorb from the atmosphere?', choices: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Carbon Dioxide' },
//   { id: '9', question: 'What is the hardest natural substance on Earth?', choices: ['Gold', 'Diamond', 'Iron', 'Platinum'], correctAnswer: 'Diamond' },
//   { id: '10', question: 'Which planet is known as the Red Planet?', choices: ['Earth', 'Mars', 'Venus', 'Jupiter'], correctAnswer: 'Mars' },
// ];

const alphabet = ["A", "B", "C", "D"];

const MultipleChoiceTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [scaleValue] = useState(new Animated.Value(1));
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  //quiz values:
  const quiz = useQuizStore((state) => state.quiz);
  const completeLevel = useQuizStore((state) => state.completeLevel);
  const setLevelScore = useQuizStore((state) => state.setLevelScore);
  const questions = quiz.level1;
  console.log("This is the questions: ", questions);
  const handleAnswerSelect = (questionId, choice) => {
    if (!isFinished) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: choice,
      });

      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleDonePress = async () => {
    const calculatedScore = questions.reduce(
        (total, question, index) =>
            total + (selectedAnswers[index] === question.answer ? 1 : 0),
        0
    );
    const level1Score = Math.round((calculatedScore / questions.length) * 10);
    await setLevelScore(1, level1Score);

    setScore(calculatedScore);
    setIsResultsVisible(true);
    setIsModalVisible(true);
    setIsFinished(true);

    // Complete level 1 when done
    try {
      await completeLevel(1);
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  const handleConfirmQuit = () => {
    setIsModalVisible(false);
  };

  const handleQuit = () => {
    router.push("app2/HomePage");
  }

  const renderQuestion = ({ item, index }) => {
    const userAnswer = selectedAnswers[index];
    const isCorrect = userAnswer === item.answer;

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {index + 1}. {item.question}
        </Text>
        {item.options?.map((choice, idx) => (
          <Animated.View
            key={`choice-${index}-${idx}`}
            style={[
              styles.choiceContainer,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleAnswerSelect(index, choice)}
              style={[
                styles.choiceTouchable,
                selectedAnswers[index] === choice &&
                  styles.choiceTouchableActive,
              ]}
              activeOpacity={0.8}
              disabled={isFinished}
            >
              <View
                style={[
                  styles.circle,
                  selectedAnswers[index] === choice && styles.selectedCircle,
                ]}
              >
                {selectedAnswers[index] === choice && (
                  <View style={styles.innerCircle} />
                )}
              </View>
              <Text style={styles.choiceText}>
                {alphabet[idx]}. {choice}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
        {isResultsVisible && (
            <View style={styles.feedbackContainer}>
              {userAnswer ? (
                  isCorrect ? (
                      <View style={styles.correctAnswer}>
                        <AntDesign name="checkcircle" size={20} color="#2e7d32" />
                        <Text style={[styles.feedbackText, styles.correctFeedbackText]}>
                          Correct!
                        </Text>
                      </View>
                  ) : (
                      <View style={styles.wrongAnswer}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8}}>
                          <AntDesign name="closecircle" size={20} color="#d32f2f" />
                          <Text style={[styles.feedbackText, styles.incorrectFeedbackText]}>
                            Incorrect!
                          </Text>
                        </View>
                        <Text style={[styles.feedbackText, styles.correctFeedbackText]}>
                          Correct answer: {item.answer}
                        </Text>
                      </View>
                  )
              ) : (
             <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8}}>
               <AntDesign name="closecircle" size={20} color="#d32f2f" />
               <Text style={styles.notAnsweredText}>Not answered</Text>
             </View>
              )}
            </View>
        )}
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {!isResultsVisible && (
        <Button
        color={'#fff'}
      backgroundColor={'#93dc5c'}
      size="$5"
      mt={'$2'}
      onPress={handleDonePress}
    >
      Done
    </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Multiple Choice</Text>
        <Button color={'#000'} backgroundColor={'#dedcdc'} size="$3" mt={'$2'}
                onPress={handleQuit}>Back to home</Button>
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
      />

      {/* Modal for results */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exam Finished!</Text>
            <Text style={styles.modalMessage}>
              Your score: {score}/{questions.length}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleConfirmQuit}
            >
              <Text style={styles.modalButtonText}>Review answers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#d8ffb1",
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
  quitButton: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 100,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: "#F5f5d1",
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  choiceContainer: {
    marginBottom: 10,
  },
  choiceTouchable: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffe0",
    marginVertical: 5,
  },
  choiceTouchableActive: {
    backgroundColor: "#a8d38d",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#74b72e",
  },
  selectedCircle: {
    borderColor: "#fee135",
  },
  choiceText: {
    fontSize: 16,
  },
  feedbackContainer: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  correctAnswer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    gap: 8,
  },
  wrongAnswer: {
    flexDirection: "col",
    padding: 4,
    gap: 8,
  },
  feedbackText: {
    fontSize: 15,
    marginLeft: 5,
    fontWeight: '600',
  },
  correctFeedbackText: {
    color: '#2e7d32',
  },
  incorrectFeedbackText: {
    color: '#d32f2f',
  },
  notAnsweredText: {
    color: '#d32f2f',
    fontSize: 15,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 20,
    paddingHorizontal: 20, // Add padding to match the fill in blanks
    width: '100%', // Make container full width
  },
  doneButton: {
    backgroundColor: "#93dc5c",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    textAlign: 'center',
    width: '100%', // Make button full width
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#93dc5c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default MultipleChoiceTest;
