import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const questions = [
  { id: '1', question: 'What is the capital of France?', choices: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
  { id: '2', question: 'What is 2 + 2?', choices: ['3', '4', '5', '6'], correctAnswer: '4' },
  { id: '3', question: 'What is the largest planet in our solar system?', choices: ['Earth', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 'Jupiter' },
  { id: '4', question: 'What is the chemical symbol for water?', choices: ['H2O', 'CO2', 'O2', 'NaCl'], correctAnswer: 'H2O' },
  { id: '5', question: 'What is the square root of 16?', choices: ['2', '3', '4', '5'], correctAnswer: '4' },
  { id: '6', question: 'Who wrote "Romeo and Juliet"?', choices: ['Charles Dickens', 'Mark Twain', 'William Shakespeare', 'Jane Austen'], correctAnswer: 'William Shakespeare' },
  { id: '7', question: 'What is the smallest continent?', choices: ['Australia', 'Europe', 'Asia', 'Antarctica'], correctAnswer: 'Australia' },
  { id: '8', question: 'Which gas do plants absorb from the atmosphere?', choices: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Carbon Dioxide' },
  { id: '9', question: 'What is the hardest natural substance on Earth?', choices: ['Gold', 'Diamond', 'Iron', 'Platinum'], correctAnswer: 'Diamond' },
  { id: '10', question: 'Which planet is known as the Red Planet?', choices: ['Earth', 'Mars', 'Venus', 'Jupiter'], correctAnswer: 'Mars' },
];

const alphabet = ['A', 'B', 'C', 'D'];

const MultipleChoiceTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [scaleValue] = useState(new Animated.Value(1));
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFinished, setIsFinished] = useState(false); // New state to track if the quiz is finished
  const router = useRouter();

  const handleAnswerSelect = (questionId, choice) => {
    if (!isFinished) { // Check if the quiz is not finished before allowing answer selection
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: choice,
      });

      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 0.95, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleDonePress = () => {
    const calculatedScore = Object.keys(selectedAnswers).reduce((total, questionId) => {
      const question = questions.find(q => q.id === questionId);
      return total + (selectedAnswers[questionId] === question.correctAnswer ? 1 : 0);
    }, 0);

    setScore(calculatedScore);
    setIsResultsVisible(true); // Show results after answering
    setIsModalVisible(true); // Show modal
  };

  const handleSeeAnswers = () => {
    alert(`Your score: ${score}/${questions.length}`);
    setIsModalVisible(false); // Close modal after viewing answers
    setIsFinished(true); // Mark the quiz as finished
  };

  const handleConfirmQuit = () => {
    setIsModalVisible(false); // Close modal before navigating
    router.push('/app2/HomePage');
  };

  const renderQuestion = ({ item }) => {
    const userAnswer = selectedAnswers[item.id];
    const isCorrect = userAnswer === item.correctAnswer;

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {item.id}. {item.question}
        </Text>
        {item.choices.map((choice, index) => (
          <Animated.View key={index} style={[styles.choiceContainer, { transform: [{ scale: scaleValue }] }]}>
            <TouchableOpacity
              onPress={() => handleAnswerSelect(item.id, choice)}
              style={[styles.choiceTouchable, selectedAnswers[item.id] === choice && styles.choiceTouchableActive]}
              activeOpacity={0.8}
              disabled={isFinished} // Disable button if quiz is finished
            >
              <View style={[styles.circle, selectedAnswers[item.id] === choice && styles.selectedCircle]}>
                {selectedAnswers[item.id] === choice && <View style={styles.innerCircle} />}
              </View>
              <Text style={styles.choiceText}>
                {alphabet[index]}. {choice}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
        {isResultsVisible && (
          <View style={styles.feedbackContainer}>
            {userAnswer ? (
              isCorrect ? (
                <View style={styles.correctAnswer}>
                  <AntDesign name="checkcircle" size={20} color="green" />
                  <Text style={styles.feedbackText}> Correct! Your answer is correct.</Text>
                </View>
              ) : (
                <View style={styles.wrongAnswer}>
                  <AntDesign name="closecircle" size={20} color="red" />
                  <Text style={styles.feedbackText}>
                    Incorrect! Your answer: {userAnswer}. Correct answer: {item.correctAnswer}.
                  </Text>
                </View>
              )
            ) : (
              <Text style={styles.feedbackText}>Not answered</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Level 1: Multiple Choice</Text>
        <TouchableOpacity style={styles.quitButton} onPress={handleConfirmQuit}>
          <FontAwesome name="sign-out" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exam Finished!</Text>
            <Text style={styles.modalMessage}>Your score: {score}/{questions.length}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSeeAnswers}>
              <Text style={styles.modalButtonText}>See Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleConfirmQuit}>
              <Text style={styles.modalButtonText}>Go Back to Home Page</Text>
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
    backgroundColor: '#EAEDEE',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3D6DA1',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
  },
  quitButton: {
    padding: 10,
  },
  listContainer: {
    paddingBottom: 100,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  choiceContainer: {
    marginBottom: 10,
  },
  choiceTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  choiceTouchableActive: {
    backgroundColor: '#C1E1C1',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3D6DA1',
  },
  selectedCircle: {
    borderColor: '#3D6DA1',
  },
  choiceText: {
    fontSize: 16,
  },
  feedbackContainer: {
    marginTop: 10,
  },
  correctAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrongAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    marginLeft: 5,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#3D6DA1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#3D6DA1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default MultipleChoiceTest;
