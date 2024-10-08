import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, ScrollView, Modal, Animated, Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const questions = [
  { id: '1', question: 'What is the capital of France?', correctAnswer: 'Paris' },
  { id: '2', question: 'Which planet is known as the Red Planet?', correctAnswer: 'Mars' },
  { id: '3', question: 'What is the largest ocean on Earth?', correctAnswer: 'Pacific Ocean' },
  { id: '4', question: 'What is the currency of Japan?', correctAnswer: 'Yen' },
  { id: '5', question: 'What is the chemical symbol for gold?', correctAnswer: 'Au' },
  { id: '6', question: 'What is the tallest mountain in the world?', correctAnswer: 'Mount Everest' },
  { id: '7', question: 'Which continent is known as the Dark Continent?', correctAnswer: 'Africa' },
  { id: '8', question: 'What is the largest planet in our solar system?', correctAnswer: 'Jupiter' },
];

const TypingGame = () => {
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(''));
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));

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
  }, []);

  const handleSubmit = () => {
    let newScore = 0;
    userAnswers.forEach((answer, index) => {
      if (answer.trim().toLowerCase() === questions[index].correctAnswer.toLowerCase()) {
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

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setHeaderVisible(offsetY === 0);
  };

  const handleQuit = () => {
    router.push('app2/HomePage');
  };

  const handleSeeAnswers = () => {
    setShowModal(false);
    setShowAnswers(true);
  };

  const handleGoHome = () => {
    router.push('app2/HomePage');
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {headerVisible && (
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Level 4</Text>
              <Text style={styles.instructions}>Type your answer to each question below:</Text>
            </View>
          )}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {questions.map((q, index) => (
              <Animated.View
                key={q.id}
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
                <Text style={styles.question}>{`${index + 1}. ${q.question}`}</Text>
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
                    <Text style={styles.correctAnswer}>Correct: {q.correctAnswer}</Text>
                    <Text style={[
                      styles.userAnswer,
                      userAnswers[index].trim().toLowerCase() === q.correctAnswer.toLowerCase()
                        ? styles.correctUserAnswer
                        : styles.incorrectUserAnswer
                    ]}>
                      Your Answer: {userAnswers[index]}
                      {userAnswers[index].trim().toLowerCase() === q.correctAnswer.toLowerCase() ?
                        ' ✅' : ' ❌'}
                    </Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </ScrollView>
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
              <Text style={styles.modalText}>Your Score: {score}/{questions.length}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleSeeAnswers}>
                <Text style={styles.modalButtonText}>See Answers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleGoHome}>
                <Text style={styles.modalButtonText}>Go to Home Page</Text>
              </TouchableOpacity>
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
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  instructions: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  question: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  answerContainer: {
    marginTop: 10,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  userAnswer: {
    fontSize: 14,
  },
  correctUserAnswer: {
    color: '#4CAF50',
  },
  incorrectUserAnswer: {
    color: '#F44336',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quitButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#3b5998',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TypingGame;
