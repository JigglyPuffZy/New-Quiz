import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [isScoreVisible, setIsScoreVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleAnswerSelect = (questionId, choice) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: choice,
    });

    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleDonePress = () => {
    setChecking(true);

    setTimeout(() => {
      const calculatedScore = Object.keys(selectedAnswers).reduce((total, questionId) => {
        const question = questions.find(q => q.id === questionId);
        return total + (selectedAnswers[questionId] === question.correctAnswer ? 1 : 0);
      }, 0);

      setScore(calculatedScore);
      setChecking(false);
      setIsResultModalVisible(true);
    }, 1500);
  };

  const handleConfirmQuit = () => {
    router.push('/app2/HomePage');
  };

  const renderQuestion = ({ item }) => (
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
    </View>
  );

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

      {/* Result Modal */}
      <Modal
        visible={isResultModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsResultModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {checking ? (
              <Text style={styles.modalText}>Checking...</Text>
            ) : (
              <>
                <Text style={styles.modalText}>Congrats! You finished the test!</Text>
                <Text style={styles.modalText}>Your final score is: {score} / {questions.length}</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setIsResultModalVisible(false);
                      handleConfirmQuit();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    backgroundColor: '#BCC18D',
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
    backgroundColor: '#BCC18D',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    paddingBottom: 40,
  },
  questionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  choiceContainer: {
    marginBottom: 8,
  },
  choiceTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
  },
  choiceTouchableActive: {
    backgroundColor: '#D8E7B3',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BCC18D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedCircle: {
    borderColor: '#69A0AC',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#BCC18D',
  },
  choiceText: {
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#BCC18D',
    padding: 14,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#BCC18D',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default MultipleChoiceTest;
