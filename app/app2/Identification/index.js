import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, FlatList, Modal, Animated, Dimensions, Platform
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
    const answeredQuestions = userAnswers.filter(answer => answer.trim() !== '').length;
    setProgress(answeredQuestions / questions.length);
  }, [userAnswers]);

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
          <Text style={styles.correctAnswer}>Correct: {item.correctAnswer}</Text>
          <Text style={[
            styles.userAnswer,
            userAnswers[index].trim().toLowerCase() === item.correctAnswer.toLowerCase()
              ? styles.correctUserAnswer
              : styles.incorrectUserAnswer
          ]}>
            Your Answer: {userAnswers[index]}
            {userAnswers[index].trim().toLowerCase() === item.correctAnswer.toLowerCase() ?
              ' ✅' : ' ❌'}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049', '#388E3C']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.headerContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="leaf" size={48} color="#fff" />
            </Animated.View>
            <Text style={styles.header}>Level 4</Text>
            <Text style={styles.instructions}>Type your answer to each question below:</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
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
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="trophy" size={64} color="#FFD700" />
              </Animated.View>
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
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  instructions: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 7,
  },
  question: {
    fontSize: 20,
    marginBottom: 15,
    color: '#2c3e50',
    fontWeight: '700',
  },
  input: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#f0fff0',
  },
  answerContainer: {
    marginTop: 15,
  },
  correctAnswer: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
    fontWeight: '600',
  },
  userAnswer: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctUserAnswer: {
    color: '#4CAF50',
  },
  incorrectUserAnswer: {
    color: '#e74c3c',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quitButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 7,
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 20,
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
    fontSize: 28,
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
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
