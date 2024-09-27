import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, Animated, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { useRouter } from 'expo-router';

const questions = [
  {
    id: '1',
    question: 'What is the capital of France?',
    choices: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswer: 'Paris',
  },
  {
    id: '2',
    question: 'What is 2 + 2?',
    choices: ['3', '4', '5', '6'],
    correctAnswer: '4',
  },
  {
    id: '3',
    question: 'Which planet is known as the Red Planet?',
    choices: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
  },
  {
    id: '4',
    question: 'Who wrote "To Kill a Mockingbird"?',
    choices: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'],
    correctAnswer: 'Harper Lee',
  },
  {
    id: '5',
    question: 'What is the largest ocean on Earth?',
    choices: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 'Pacific Ocean',
  },
  {
    id: '6',
    question: 'Which element has the chemical symbol O?',
    choices: ['Gold', 'Oxygen', 'Silver', 'Iron'],
    correctAnswer: 'Oxygen',
  },
  {
    id: '7',
    question: 'What is the smallest prime number?',
    choices: ['0', '1', '2', '3'],
    correctAnswer: '2',
  },
  {
    id: '8',
    question: 'Who painted the Mona Lisa?',
    choices: ['Vincent Van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctAnswer: 'Leonardo da Vinci',
  },
  {
    id: '9',
    question: 'What is the chemical formula for water?',
    choices: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 'H2O',
  },
  {
    id: '10',
    question: 'How many continents are there on Earth?',
    choices: ['5', '6', '7', '8'],
    correctAnswer: '7',
  },
];

const alphabet = ['A', 'B', 'C', 'D'];

const MultipleChoiceTest = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [scaleValue] = useState(new Animated.Value(1));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleAnswerSelect = (questionId, choice) => {
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
  };

  const handleDonePress = () => {
    router.push('app2/5thPage'); 
  };

  const handleQuitPress = () => {
    setIsModalVisible(true);
  };

  const handleConfirmQuit = () => {
    setIsModalVisible(false);
    router.push('app2/3rdPage'); // Adjust the route to your main menu
  };

  const handleCancelQuit = () => {
    setIsModalVisible(false);
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{item.question}</Text>
      {item.choices.map((choice, index) => (
        <Animated.View key={index} style={[styles.choiceContainer, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            onPress={() => handleAnswerSelect(item.id, choice)}
            style={styles.choiceTouchable}
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
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Level 1: Multiple Choice</Text>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuitPress}>
          <FontAwesome name="sign-out" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Questions */}
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
      />

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelQuit}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to quit?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirmQuit}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleCancelQuit}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#E7E89F', // Background color
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  choiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  choiceTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BCC18D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F0F0F0',
  },
  selectedCircle: {
    borderColor: '#BCC18D',
    backgroundColor: '#BCC18D',
  },
  innerCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  choiceText: {
    fontSize: 18,
    color: '#333333',
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#BCC18D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    top:-20,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#BCC18D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MultipleChoiceTest;
